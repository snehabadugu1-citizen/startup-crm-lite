import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─────────────────────────────────────────────────────────────────────────────
// Token helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @function generateToken
 * @description Signs a JWT containing only the user's MongoDB _id.
 *              Keeping the payload minimal limits the exposure surface if a
 *              token is ever decoded by a third party.
 *
 * @param {string} userId - The user's MongoDB ObjectId (as string or ObjectId).
 * @returns {string} Signed JWT string.
 */
export const generateToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller register
 * @description Creates a new user account. The password is hashed by the User
 *              model's pre-save hook before it is stored.  Returns a JWT so the
 *              user is immediately authenticated after registration.
 *
 * @param {import('express').Request}      req  - Body: { name, email, password }
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check for an existing account — gives a cleaner UX than relying on the
    // duplicate-key MongoDB error that would otherwise surface from errorHandler.
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user — pre-save hook in User.js hashes the password automatically
    const user = await User.create({ name, email, password });

    // Issue JWT immediately so the client doesn't need a separate login call
    const token = generateToken(user._id);

    // user.toJSON() is overridden in the model to strip the password field
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { token, user },
    });
  } catch (err) {
    // Mongoose ValidationError → picked up and normalised by global errorHandler
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller login
 * @description Authenticates a user with email + password.
 *
 * Security note: Both "user not found" and "wrong password" return the same
 * 401 message ("Invalid credentials") intentionally — revealing which one is
 * wrong enables user-enumeration attacks.
 *
 * @param {import('express').Request}      req  - Body: { email, password }
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly request the password field — it is excluded by default via
    // the schema's select: false / toJSON override.
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Use a single generic message for both "not found" and "wrong password"
    // to prevent user-enumeration.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Deactivated accounts get a distinct 403 — this is intentional because the
    // user already proved they know the correct password, so enumeration is moot.
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    const token = generateToken(user._id);

    // toJSON() strips the password before serialisation
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token, user },
    });
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller getProfile
 * @description Returns the authenticated user's profile.
 *              req.user is populated by the protect middleware — no extra DB
 *              query is needed here.  Password is never present on req.user.
 *
 * @param {import('express').Request}  req - req.user is the authenticated User document.
 * @param {import('express').Response} res
 */
export const getProfile = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user: req.user },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller updateProfile
 * @description Allows the authenticated user to update their display name and,
 *              optionally, their password (after verifying the current one).
 *
 *              Email updates are deliberately excluded here — changing an email
 *              address requires a verification flow (send link → confirm →
 *              update) which should be a separate dedicated endpoint.
 *
 * @param {import('express').Request}      req  - Body: { name?, currentPassword?, newPassword? }
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    // Fetch a fresh copy from the database.  We need `+password` in case the
    // user is changing their password — it's excluded from the standard projection
    // that protect middleware uses.
    const user = await User.findById(req.user._id).select('+password');

    // ── Update name ───────────────────────────────────────────────────────────
    if (name) {
      user.name = name.trim();
    }

    // ── Update password (optional) ────────────────────────────────────────────
    if (newPassword) {
      // currentPassword is required when attempting a password change
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters',
        });
      }

      // Assign plain text — the pre-save hook hashes it automatically
      user.password = newPassword;
    }

    await user.save();

    // toJSON() strips password before serialisation
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller logout
 * @description Concludes the user session.
 *              Clears authentication cookies if set and returns a standard success message.
 *
 * @param {import('express').Request}  _req
 * @param {import('express').Response} res
 */
export const logout = (_req, res) => {
  res.clearCookie('token');
  res.clearCookie('crm-token');

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
