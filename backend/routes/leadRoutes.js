import { Router } from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads,
} from '../controllers/leadController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// ── All lead routes require authentication ─────────────────────────────────────
// Applying protect once at router level is cleaner than repeating it per route.
router.use(protect);

/**
 * @route   GET /api/leads/stats
 * @desc    Aggregated pipeline stats (counts by status & source) for the dashboard
 * @access  Private
 *
 * IMPORTANT: This route must be declared BEFORE /:id to prevent Express from
 *            interpreting "stats" as an ObjectId parameter.
 */
router.get(['/stats', '/stats/summary'], getLeadStats);

/**
 * @route   GET /api/leads/monthly-stats or /api/leads/stats/monthly
 * @desc    Per-month stats for the last 6 months (zero-filled, oldest first)
 * @access  Private
 *
 * Declared before /:id to prevent Express treating "monthly-stats" as an id.
 */
router.get(['/monthly-stats', '/stats/monthly'], getMonthlyStats);

/**
 * @route   GET /api/leads/search?q=ali&limit=5
 * @desc    Lightweight autocomplete search — returns _id, name, company, email, status
 * @access  Private
 *
 * Declared before /:id to prevent Express treating "search" as an id.
 */
router.get('/search', searchLeads);

/**
 * @route   GET  /api/leads       → list with pagination, filter, search
 * @route   POST /api/leads       → create a new lead
 * @access  Private
 */
router.route('/')
  .get(getLeads)
  .post(createLead);

/**
 * @route   PATCH|PUT /api/leads/:id/status → update status only
 * @access  Private
 */
router.route('/:id/status')
  .patch(updateLead)
  .put(updateLead);

/**
 * @route   GET       /api/leads/:id  → fetch a single lead
 * @route   PATCH|PUT /api/leads/:id  → partial or full update
 * @route   DELETE    /api/leads/:id  → permanent delete (owner or admin only)
 * @access  Private
 */
router.route('/:id')
  .get(getLeadById)
  .patch(updateLead)
  .put(updateLead)
  .delete(deleteLead);

export default router;
