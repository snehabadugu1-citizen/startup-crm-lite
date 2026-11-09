import { Router } from 'express';
import { body } from 'express-validator';

import { register, login, getProfile, updateProfile, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// NOTE — Rate Limiting (Production Recommendation)
// ─────────────────────────────────────────────────────────────────────────────
// Wrap the POST routes below with an express-rate-limit instance to protect
// against brute-force and credential-stuffing attacks:
//
//   import rateLimit from 'express-rate-limit';
//   const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,   // 15-minute window
//     max: 20,                      // max 20 attempts per window per IP
//     standardHeaders: true,
//     legacyHeaders: false,
//     message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
//   });
//   router.post('/register', authLimiter, registerValidation, validate, register);
//   router.post('/login',    authLimiter, loginValidation,    validate, login);
// ─────────────────────────────────────────────────────────────────────────────

// ── Validation rule sets ───────────────────────────────────────────────────────

/**
 * @validation registerValidation
 * @description express-validator chain for POST /register.
 *              Validates name, email format, and minimum password length.
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),   // Lowercases and sanitises the email

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

/**
 * @validation loginValidation
 * @description express-validator chain for POST /login.
 *              Intentionally lightweight — never reveal whether the email format
 *              itself was invalid (avoids leaking account existence).
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * @validation updateProfileValidation
 * @description Optional validation chain for PATCH /profile.
 *              All fields are optional — only validate if present.
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),

  // Reject email change attempts at the route level — direct users to a
  // dedicated /update-email endpoint that includes a verification flow.
  body('email')
    .not()
    .exists()
    .withMessage('Email cannot be updated via this endpoint'),
];

// ── Routes ─────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Create a new user account and return a JWT
 * @access  Public
 * @body    { name, email, password }
 */
router.post('/register', registerValidation, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate with email + password and return a JWT
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', loginValidation, validate, login);

/**
 * @route   GET /api/auth/profile
 * @desc    Return the currently authenticated user's profile
 * @access  Private — requires Bearer token
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PATCH|PUT /api/auth/profile
 * @desc    Update name or password for the authenticated user
 * @access  Private — requires Bearer token
 * @body    { name?, currentPassword?, newPassword? }
 */
router.route('/profile')
  .get(protect, getProfile)
  .patch(protect, updateProfileValidation, validate, updateProfile)
  .put(protect, updateProfileValidation, validate, updateProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Log the user out (clears cookies if any; JWT is stateless)
 * @access  Public
 */
router.post('/logout', logout);

export default router;
