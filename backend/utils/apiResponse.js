/**
 * @file utils/apiResponse.js
 * @description Centralised helpers for sending consistent JSON responses from every
 *              route handler in the application.
 *
 *              Using these functions ensures that the response envelope (shape,
 *              field names, status codes) never drifts between endpoints, making
 *              the API predictable for frontend consumers and easy to test.
 *
 * Response envelope conventions
 * ──────────────────────────────
 *  Success    → { success: true,  message, data }
 *  Error      → { success: false, message, errors? }
 *  Paginated  → { success: true,  data, pagination: { total, page, limit, pages } }
 *
 * Usage pattern
 * ──────────────
 *  Import the helpers you need in any controller or route handler:
 *
 *    import { successResponse, errorResponse, paginatedResponse }
 *      from '../utils/apiResponse.js';
 *
 *  Then call them directly instead of writing res.status().json() inline.
 *  This keeps controllers thin and response shapes consistent.
 */

// =============================================================================
// 1. successResponse — standard success (create / read-one / update / delete)
// =============================================================================

/**
 * @function successResponse
 * @description Sends a standard, non-paginated success response.
 *              Use for any endpoint that returns a single resource or a simple
 *              acknowledgement (create, read-one, update, delete, auth).
 *
 * @param {import('express').Response} res              - Express response object.
 * @param {*}                          data             - Payload to return to the client.
 *                                                        Can be an object, array, or null.
 * @param {string}                     [message='Success'] - Human-readable status message.
 *                                                        Keep it short and action-oriented
 *                                                        e.g. 'Lead created successfully'.
 * @param {number}                     [statusCode=200]    - HTTP status code.
 *                                                        Use 201 for resource creation,
 *                                                        200 for reads/updates/deletes.
 *
 * @returns {import('express').Response}  The terminated Express response.
 *
 * @example
 *   // In a controller — create a user and return it:
 *   const user = await User.create(req.body);
 *   return successResponse(res, user, 'User created successfully', 201);
 *
 * @example
 *   // In a controller — return fetched data with default 200:
 *   const lead = await Lead.findById(id);
 *   return successResponse(res, lead, 'Lead retrieved');
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  // ── Build the response envelope ──────────────────────────────────────────────
  // success: true signals to the client that no error occurred.
  // message provides a human-readable description of what happened.
  // data is the actual payload — whatever the caller passed in.
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// =============================================================================
// 2. errorResponse — standard error (known/expected errors in route handlers)
// =============================================================================

/**
 * @function errorResponse
 * @description Sends a standardised error response.
 *
 *              Best practice — prefer letting the GLOBAL errorHandler middleware
 *              (middleware/errorHandler.js) call this via next(err) for
 *              infrastructure-level errors.  Reserve direct use of errorResponse
 *              for known, expected, business-logic errors where you already know
 *              the exact status code and message:
 *
 *                • 404 — resource not found after a DB lookup
 *                • 403 — insufficient permissions (the user exists but lacks access)
 *                • 400 — explicit early-exit validation inside a controller
 *
 * @param {import('express').Response} res              - Express response object.
 * @param {string}                     [message='Server Error'] - High-level error description.
 * @param {number}                     [statusCode=500]         - HTTP status code.
 * @param {Object|null}                [errors=null]            - Optional field-level
 *                                                                validation error details.
 *                                                                Only included when non-null
 *                                                                to avoid confusing
 *                                                                `"errors": null` payloads.
 *
 * @returns {import('express').Response}  The terminated Express response.
 *
 * @example
 *   // Explicit 404 when a resource doesn't exist:
 *   return errorResponse(res, 'Lead not found', 404);
 *
 * @example
 *   // Validation failure with per-field details:
 *   return errorResponse(res, 'Validation failed', 400, {
 *     email: 'Must be a valid email address',
 *     name:  'Name is required',
 *   });
 */
export const errorResponse = (res, message = 'Server Error', statusCode = 500, errors = null) => {
  // ── Build the base payload ───────────────────────────────────────────────────
  const payload = {
    success: false,
    message,
  };

  // ── Attach errors only when there is something meaningful to show ────────────
  // Omitting the key entirely (rather than sending null) keeps the response clean
  // and avoids confusing clients that check for the key's presence.
  if (errors !== null) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

// =============================================================================
// 3. paginatedResponse — collection endpoints with page / limit support
// =============================================================================

/**
 * @function paginatedResponse
 * @description Sends a paginated list response.
 *              Use for collection endpoints that support ?page= and ?limit=
 *              query parameters.
 *
 * Pagination envelope shape
 * ─────────────────────────
 *  {
 *    success: true,
 *    data: [...],          ← the current page of results
 *    pagination: {
 *      total: 42,          ← total matching documents across ALL pages
 *      page:  2,           ← the page currently being returned (1-based)
 *      limit: 10,          ← items per page
 *      pages: 5,           ← total number of pages (Math.ceil(total / limit))
 *      hasNext: true,      ← boolean: page < pages
 *      hasPrev: true,      ← boolean: page > 1
 *    }
 *  }
 *
 * @param {import('express').Response} res   - Express response object.
 * @param {Array}                      data  - The current page of documents.
 * @param {number}                     total - Total matching documents (ALL pages) from DB.
 * @param {number}                     page  - Current page number (1-based).
 * @param {number}                     limit - Number of items per page.
 *
 * @returns {import('express').Response}  The terminated Express response.
 *
 * @example
 *   // In a leads list controller:
 *   const page  = parseInt(req.query.page)  || 1;
 *   const limit = parseInt(req.query.limit) || 10;
 *   const skip  = (page - 1) * limit;
 *
 *   const [leads, total] = await Promise.all([
 *     Lead.find(filter).skip(skip).limit(limit),
 *     Lead.countDocuments(filter),
 *   ]);
 *
 *   return paginatedResponse(res, leads, total, page, limit);
 */
export const paginatedResponse = (res, data, total, page, limit) => {
  // ── Calculate total pages ────────────────────────────────────────────────────
  // Math.ceil ensures the last partial page is counted as a full page.
  // e.g. 11 results with limit 10 → Math.ceil(11/10) = 2 pages
  const pages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,

    // The current page of results
    data,

    // ── Pagination metadata ──────────────────────────────────────────────────
    pagination: {
      total,  // Total matching documents across all pages
      page,   // The page being returned right now (1-based)
      limit,  // Items per page (as requested)
      pages,  // Total number of pages
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  });
};
