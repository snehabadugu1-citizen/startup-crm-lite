import { validationResult } from 'express-validator';

/**
 * @middleware validate
 * @description Higher-order middleware factory that runs an array of express-validator
 *              check chains and immediately returns a structured 400 response if any
 *              validation fails.  If all checks pass, it calls next() to continue.
 *
 * Usage pattern:
 *   import { body } from 'express-validator';
 *   import { validate } from '../middleware/validate.js';
 *
 *   const registerValidation = [
 *     body('email').isEmail().withMessage('Must be a valid email'),
 *     body('password').isLength({ min: 6 }).withMessage('Min 6 characters'),
 *   ];
 *
 *   router.post('/register', registerValidation, validate, register);
 *
 * Response shape on failure (HTTP 400):
 *   {
 *     "success": false,
 *     "errors": [
 *       { "field": "email",    "message": "Must be a valid email" },
 *       { "field": "password", "message": "Min 6 characters" }
 *     ]
 *   }
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
export const validate = (req, res, next) => {
  // Collect all validation errors accumulated by the preceding check() chains
  const result = validationResult(req);

  if (!result.isEmpty()) {
    // Normalise each error into a clean { field, message } shape.
    // `path` is the express-validator v7+ field name (replaces the old `param`).
    const errors = result.array().map((err) => ({
      field:   err.path ?? err.param,   // Graceful fallback for v6 compatibility
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      errors,
    });
  }

  // All validations passed — hand off to the next middleware / controller
  return next();
};
