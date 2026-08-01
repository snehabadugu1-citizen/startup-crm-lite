import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiting for auth routes is applied globally in server.js via authLimiter
// (express-rate-limit: 10 requests / 15 min per IP on /api/auth/*).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @middleware protect
 * @description Authenticates incoming requests by verifying the JWT supplied in
 *              the Authorization header. On success, attaches the full user
 *              document (minus password) to req.user for downstream handlers.
 *
 * Header format expected:
 *   Authorization: Bearer <token>
 *
 * Error scenarios handled:
 *   • No / malformed header    → 401 "No token provided, access denied"
 *   • Invalid signature        → 401 "Token is invalid"
 *   • Expired token            → 401 "Token has expired, please login again"
 *   • User deleted from DB     → 401 "User belonging to this token no longer exists"
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
export const protect = async (req, res, next) => {
  try {
    // ── 1. Extract token ────────────────────────────────────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied',
      });
    }

    // ── 2. Verify token ─────────────────────────────────────────────────────
    // jwt.verify throws JsonWebTokenError (invalid) or TokenExpiredError (expired).
    // We catch them individually below for granular error messages.
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired, please login again',
        });
      }
      // JsonWebTokenError, NotBeforeError, etc.
      return res.status(401).json({
        success: false,
        message: 'Token is invalid',
      });
    }

    // ── 3. Load user — confirms account still exists in the DB ──────────────
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    // ── 4. Attach user to request context ───────────────────────────────────
    req.user = user;
    return next();
  } catch (err) {
    // Unexpected infrastructure error (e.g. DB down) — delegate to global handler
    return next(err);
  }
};

/**
 * @middleware restrictTo
 * @description Role-based access control factory. Must be chained after `protect`.
 *              Rejects the request with 403 if the authenticated user's role is
 *              not in the allowed list.
 *
 * @param {...string} roles - Whitelisted roles (e.g. 'admin').
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.delete('/:id', protect, restrictTo('admin'), deleteLead);
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    return next();
  };
};
