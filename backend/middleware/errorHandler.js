/**
 * @file middleware/errorHandler.js
 * @description Global Express error-handling middleware for Startup CRM Lite.
 *
 *              This module exports a single Express error handler — a function with
 *              the 4-parameter signature (err, req, res, next) that Express uses to
 *              distinguish error middleware from regular middleware.
 *
 *              It must be registered LAST (after all routes and regular middleware)
 *              in server.js so that errors thrown via next(err) anywhere in the
 *              application bubble up here cleanly.
 *
 * Error types normalised
 * ──────────────────────
 *  1. Mongoose ValidationError   → 400  (schema-level field failures)
 *  2. Mongoose CastError         → 404  (invalid ObjectId in a URL :param)
 *  3. MongoDB duplicate key      → 409  (unique index violation, e.g. duplicate email)
 *  4. JsonWebTokenError          → 401  (malformed or missing JWT signature)
 *  5. TokenExpiredError          → 401  (JWT past its exp claim)
 *  6. Everything else            → 500  (unexpected server / third-party error)
 *
 * Stack trace policy
 * ──────────────────
 *  Development : err.stack is included in the JSON response under the 'stack' key
 *                so developers can pinpoint issues immediately in the terminal.
 *  Production  : stack traces are NEVER sent to the client — they can expose
 *                internal file paths, package versions, and code structure.
 */

// ── Import the shared error-response helper ────────────────────────────────────
// Using errorResponse keeps the response shape consistent with all other
// endpoints (same success: false envelope, same field names).
import { errorResponse } from '../utils/apiResponse.js';

/**
 * @function errorHandler
 * @description Global Express error handler.
 *              Classifies the incoming error, maps it to the correct HTTP status
 *              code and user-facing message, then delegates to errorResponse().
 *
 *              The four-parameter signature IS REQUIRED — Express identifies error
 *              handlers by arity. Removing `next` would make this a regular
 *              middleware and errors would not be caught.
 *
 * @param {Error}                         err  - The error forwarded via next(err).
 * @param {import('express').Request}     req  - Express request object (unused but required).
 * @param {import('express').Response}    res  - Express response object.
 * @param {import('express').NextFunction} next - Express next function (required for arity).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // ── Always log server-side — regardless of environment ──────────────────────
  // This appears in your terminal / log aggregator so engineers can debug
  // without relying on the client receiving stack trace details.
  console.error('🔥 Error:', err);

  // ── Determine whether to expose stack traces ─────────────────────────────────
  // NODE_ENV is set in the .env file:
  //   development → show the stack in the JSON response for fast debugging
  //   production  → never expose internals to the client (security / info leak)
  const isDev = process.env.NODE_ENV === 'development';

  // ── Internal helper: build and send the response ──────────────────────────────
  // We add `stack` to the payload only in development so that error-checking
  // logic stays in one place and isn't duplicated across every branch below.
  const send = (statusCode, message, errors = null) => {
    // Build the base payload via the shared helper
    const payload = {
      success: false,
      message,
    };

    // Include field-level errors when provided (e.g. Mongoose ValidationError fields)
    if (errors) {
      payload.errors = errors;
    }

    // Attach stack trace in development only
    if (isDev && err.stack) {
      payload.stack = err.stack;
    }

    return res.status(statusCode).json(payload);
  };

  // ============================================================================
  // Error classification — check most specific types first
  // ============================================================================

  // ── 1. Mongoose ValidationError — 400 Bad Request ────────────────────────────
  // Triggered by: missing required fields, enum mismatch, custom validators.
  // Example: posting a lead with no 'name' field when name is required in the schema.
  if (err.name === 'ValidationError') {
    // Reduce the nested err.errors object into a flat map of fieldName → message.
    // This makes it trivial for the frontend to highlight individual form fields.
    //   e.g. { name: 'Name is required', email: 'Invalid email address' }
    const errors = Object.values(err.errors).reduce((acc, { path, message }) => {
      acc[path] = message;
      return acc;
    }, {});

    return send(400, 'Validation failed', errors);
  }

  // ── 2. Mongoose CastError — 404 Not Found ────────────────────────────────────
  // Triggered by: a URL :param (e.g. /api/leads/:id) that is not a valid
  // 24-character hexadecimal MongoDB ObjectId.
  // Example: GET /api/leads/not-an-id → Mongoose throws CastError on findById().
  if (err.name === 'CastError') {
    // Return 404 rather than 400 because from the client's perspective the
    // resource simply doesn't exist — exposing the ObjectId format would be
    // an unnecessary implementation detail.
    return send(404, 'Resource not found');
  }

  // ── 3. MongoDB Duplicate Key Error — 409 Conflict ────────────────────────────
  // Error code 11000 is thrown by the MongoDB driver when an insert or update
  // would violate a unique index (most commonly the email field on the User model).
  if (err.code === 11000) {
    // Attempt to extract the field name from keyValue (available in Mongoose ≥ 5.x)
    // so we can give a more specific message, e.g. "Email already exists".
    const field = Object.keys(err.keyValue || {})[0];

    // Capitalise the field name for readability; fall back to 'Email' if unavailable.
    const message = field
      ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      : 'Email already exists';

    return send(409, message);
  }

  // ── 4. JWT malformed / invalid signature — 401 Unauthorized ──────────────────
  // Triggered by: a token that was tampered with, or signed with a different secret,
  // or simply not a valid JWT string at all.
  // The client should redirect to the login page.
  if (err.name === 'JsonWebTokenError') {
    return send(401, 'Invalid token. Please log in again.');
  }

  // ── 5. JWT expired — 401 Unauthorized ────────────────────────────────────────
  // Triggered by: a token whose 'exp' claim is in the past.
  // The client should clear the stored token and redirect to login.
  if (err.name === 'TokenExpiredError') {
    return send(401, 'Token expired. Please log in again.');
  }

  // ── 6. Catch-all — 500 Internal Server Error ─────────────────────────────────
  // Everything that didn't match the cases above falls here.
  // Prefer the error's own status code (e.g. from the http-errors package),
  // then the .status alias, then default to 500.
  const statusCode = err.statusCode || err.status || 500;

  // In production, hide the real error message for unexpected errors to avoid
  // leaking implementation details.  Only known / expected errors (above) have
  // user-friendly messages that are safe to expose.
  const message = isDev ? err.message || 'Server error' : 'Server error';

  return send(statusCode, message);
};

// ── Default export ─────────────────────────────────────────────────────────────
// Imported and registered in server.js as the last app.use() call:
//   import errorHandler from './middleware/errorHandler.js';
//   app.use(errorHandler);
export default errorHandler;
