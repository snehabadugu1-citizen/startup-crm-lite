import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/leads
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller createLead
 * @description Creates a new lead owned by the authenticated user.
 *
 * @param {import('express').Request}      req  - Body: { name, company, email, phone?, status?, source?, notes? }
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 *
 * @returns {201} { success: true, data: Lead }
 */
export const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, source, notes } = req.body;

    const lead = await Lead.create({
      name,
      company,
      email,
      phone,
      status,
      source,
      notes,
      owner: req.user._id,   // Automatically assign to the authenticated user
    });

    return successResponse(res, lead, 'Lead created successfully', 201);
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/leads
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller getLeads
 * @description Returns a paginated, filterable, searchable, sortable list of
 *              leads owned by the authenticated user (admins see all leads).
 *
 * Query parameters (all optional):
 * ─────────────────────────────────
 * @queryparam {number}  [page=1]           - Page number (1-based)
 * @queryparam {number}  [limit=10]         - Items per page (max 100)
 * @queryparam {string}  [sortBy=createdAt] - Field to sort on (name|company|email|status|source|createdAt|updatedAt)
 * @queryparam {string}  [sortOrder=desc]   - 'asc' or 'desc'
 * @queryparam {string}  [status]           - Exact match on pipeline status
 * @queryparam {string}  [source]           - Exact match on lead source
 * @queryparam {string}  [search]           - Case-insensitive regex across name, company, email
 * @queryparam {string}  [dateFrom]         - ISO date: only leads created on/after this date
 * @queryparam {string}  [dateTo]           - ISO date: only leads created on/before this date (inclusive)
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 *
 * @returns {200} { success: true, data: Lead[], pagination: { total, page, limit, pages, hasNext, hasPrev } }
 */
export const getLeads = async (req, res, next) => {
  try {
    const {
      page      = 1,
      limit     = 10,
      sortBy    = 'createdAt',
      sortOrder = 'desc',
      status,
      source,
      search,
      dateFrom,
      dateTo,
    } = req.query;

    // ── Build filter ──────────────────────────────────────────────────────────
    // Admins can see every lead; regular users only see their own.
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };

    // Each optional param is added only when it was explicitly provided
    if (status) filter.status = status;
    if (source) filter.source = source;

    // Date range filter on createdAt
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        // Include the full dateTo day by advancing to midnight of the next day
        const end = new Date(dateTo);
        end.setDate(end.getDate() + 1);
        filter.createdAt.$lte = end;
      }
    }

    // Full-text-style regex search across three fields simultaneously
    if (search) {
      filter.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
      ];
    }

    // ── Pagination maths ──────────────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    // ── Sort object ───────────────────────────────────────────────────────────
    // Only allow known, safe field names to prevent NoSQL injection via sort
    const ALLOWED_SORT_FIELDS = new Set([
      'name', 'company', 'email', 'status', 'source', 'createdAt', 'updatedAt',
    ]);
    const safeSortBy    = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1;
    const sortObj       = { [safeSortBy]: safeSortOrder };

    // ── Execute query + count in parallel ─────────────────────────────────────
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('owner', 'name email')   // Replace ObjectId with user name/email
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    return paginatedResponse(res, leads, total, pageNum, limitNum);
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/leads/search?q=ali&limit=5
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller searchLeads
 * @description Lightweight autocomplete search designed for a debounced React
 *              SearchBar. Returns a sparse projection (no heavy fields) and
 *              caps results at 5 (max 10) to keep the payload small and UX snappy.
 *
 * Query parameters:
 * ─────────────────
 * @queryparam {string} q           - Search term (required). Matched case-insensitively
 *                                    against name, company, and email.
 * @queryparam {number} [limit=5]   - Max results to return (hard-capped at 10).
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 *
 * @returns {200} { success: true, data: Array<{ _id, name, company, email, status }> }
 * @returns {400} When ?q is missing or blank.
 *
 * @example GET /api/leads/search?q=ali&limit=5
 * // Response:
 * // { success: true, data: [{ _id: '...', name: 'Alice', company: 'Acme', email: '...', status: 'New' }] }
 */
export const searchLeads = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || !q.trim()) {
      return errorResponse(res, 'Query parameter "q" is required', 400);
    }

    // Owner isolation: admins can search across all leads
    const ownerFilter = req.user.role === 'admin' ? {} : { owner: req.user._id };

    const limitNum = Math.min(10, Math.max(1, parseInt(limit, 10)));

    const leads = await Lead.find({
      ...ownerFilter,
      $or: [
        { name:    { $regex: q.trim(), $options: 'i' } },
        { company: { $regex: q.trim(), $options: 'i' } },
        { email:   { $regex: q.trim(), $options: 'i' } },
      ],
    })
      .select('_id name company email status')   // Only return the fields the autocomplete needs
      .limit(limitNum)
      .lean();                                   // Plain JS objects → faster serialisation

    return successResponse(res, leads, 'Search results');
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/leads/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller getLeadById
 * @description Fetches a single lead by its MongoDB _id.
 *              Users can only access their own leads; admins can access any.
 *
 * @param {import('express').Request}      req  - Params: { id }
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 *
 * @returns {200} { success: true, data: Lead }
 * @returns {403} When the authenticated user does not own the lead.
 * @returns {404} When no lead with the given id exists.
 */
export const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('owner', 'name email');

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    // Ownership check — admins bypass this
    if (req.user.role !== 'admin' && lead.owner._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to access this lead', 403);
    }

    return successResponse(res, lead, 'Lead retrieved successfully');
  } catch (err) {
    return next(err);  // CastError (bad ObjectId) → 404 via errorHandler
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/leads/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller updateLead
 * @description Partially updates a lead. Only the owner (or an admin) may update.
 *              Uses { new: true, runValidators: true } so the response reflects
 *              the updated document and schema validation still runs.
 *
 * @param {import('express').Request}      req  - Params: { id }; Body: partial Lead fields
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 *
 * @returns {200} { success: true, data: Lead }
 * @returns {403} When the authenticated user does not own the lead.
 * @returns {404} When no lead with the given id exists.
 */
export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    // Ownership check
    if (req.user.role !== 'admin' && lead.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to update this lead', 403);
    }

    // Whitelist updatable fields — never allow owner to be reassigned via this route
    const { name, company, email, phone, status, source, notes } = req.body;
    const updates = { name, company, email, phone, status, source, notes };

    // Strip undefined keys so partial updates don't overwrite fields with undefined
    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    return successResponse(res, updated, 'Lead updated successfully');
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/leads/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller deleteLead
 * @description Permanently removes a lead from the database.
 *              Only the owner or an admin may delete.
 *
 * @param {import('express').Request}      req  - Params: { id }
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 *
 * @returns {200} { success: true, data: null }
 * @returns {403} When the authenticated user does not own the lead.
 * @returns {404} When no lead with the given id exists.
 */
export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    // Ownership check
    if (req.user.role !== 'admin' && lead.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to delete this lead', 403);
    }

    await lead.deleteOne();

    return successResponse(res, null, 'Lead deleted successfully');
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/leads/stats
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller getLeadStats
 * @description Returns comprehensive aggregated pipeline statistics for the
 *              analytics dashboard in a SINGLE MongoDB aggregation query using $facet.
 *
 * Returned shape:
 * ───────────────
 * {
 *   totalLeads:      number,         // Total leads owned by this user
 *   statusBreakdown: { New: 5, Contacted: 3, Won: 10, Lost: 2, ... },
 *   conversionRate:  number,         // (Won / total) * 100, 1 decimal; 0 when total = 0
 *   sourceBreakdown: { Website: 8, LinkedIn: 5, ... },
 *   thisMonthLeads:  number,         // Leads created in the current calendar month
 *   lastMonthLeads:  number,         // Leads created in the previous calendar month
 *   growthRate:      number | null,  // ((thisMonth - lastMonth) / lastMonth) * 100;
 *                                    // null when lastMonth = 0 to avoid division by zero
 * }
 *
 * Implementation notes:
 * ─────────────────────
 * A single $facet stage fans out into four parallel sub-pipelines, so MongoDB
 * only scans the owner's documents once:
 *   1. statusCounts  – groups by status field
 *   2. sourceCounts  – groups by source field
 *   3. monthlyCounts – $cond tags each doc as thisMonth / lastMonth
 *   4. totalCount    – $count
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 *
 * @returns {200} { success: true, data: StatsObject }
 */
export const getLeadStats = async (req, res, next) => {
  try {
    // ── Date boundaries ───────────────────────────────────────────────────────
    const now            = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = thisMonthStart;   // exclusive upper bound for last month

    // ── Owner isolation ───────────────────────────────────────────────────────
    const matchStage = req.user.role === 'admin'
      ? {}
      : { owner: new mongoose.Types.ObjectId(String(req.user._id)) };

    // ── Single aggregation with $facet ────────────────────────────────────────
    const [result] = await Lead.aggregate([
      { $match: matchStage },
      {
        $facet: {

          // 1. Status breakdown
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],

          // 2. Source breakdown
          sourceCounts: [
            { $group: { _id: '$source', count: { $sum: 1 } } },
          ],

          // 3. Month-over-month counts (single-pass using $cond)
          monthlyCounts: [
            {
              $group: {
                _id: null,
                thisMonthLeads: {
                  $sum: {
                    $cond: [{ $gte: ['$createdAt', thisMonthStart] }, 1, 0],
                  },
                },
                lastMonthLeads: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ['$createdAt', lastMonthStart] },
                          { $lt:  ['$createdAt', lastMonthEnd]   },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],

          // 4. Grand total
          totalCount: [
            { $count: 'value' },
          ],
        },
      },
    ]);

    // ── Reshape results ───────────────────────────────────────────────────────
    const totalLeads = result.totalCount[0]?.value ?? 0;

    const statusBreakdown = result.statusCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    const sourceBreakdown = result.sourceCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    const wonCount = statusBreakdown['Won'] ?? 0;
    // Edge-case: avoid division by zero when no leads exist yet
    const conversionRate = totalLeads === 0
      ? 0
      : parseFloat(((wonCount / totalLeads) * 100).toFixed(1));

    const thisMonthLeads = result.monthlyCounts[0]?.thisMonthLeads ?? 0;
    const lastMonthLeads = result.monthlyCounts[0]?.lastMonthLeads ?? 0;

    // Growth rate is null when lastMonth had 0 leads (division by zero is undefined)
    const growthRate = lastMonthLeads === 0
      ? null
      : parseFloat((((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100).toFixed(1));

    return successResponse(res, {
      totalLeads,
      statusBreakdown,
      conversionRate,
      sourceBreakdown,
      thisMonthLeads,
      lastMonthLeads,
      growthRate,
    }, 'Lead stats retrieved');
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/leads/monthly-stats
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @controller getMonthlyStats
 * @description Returns per-month lead statistics for the last 6 calendar months,
 *              sorted oldest-to-newest (left-to-right on a time-series chart).
 *
 *              Months with zero leads are included with zeroed counters so the
 *              chart x-axis always shows exactly 6 evenly-spaced labels.
 *
 * Returned shape (array, always 6 elements):
 * ───────────────────────────────────────────
 * [
 *   { month: 'Feb 2025', total: 12, won: 4, lost: 2, conversionRate: 33.3 },
 *   { month: 'Mar 2025', total:  0, won: 0, lost: 0, conversionRate:  0   },
 *   ...
 * ]
 *
 * Implementation notes:
 * ─────────────────────
 * • $match restricts to the last 6 months before any grouping (smaller working set).
 * • $group uses $dateToString "%Y-%m" as key — lexicographic order === chronological.
 * • Zero-fill: a Map is pre-populated with all 6 months; aggregation results
 *   are merged in, so months without data retain their zero values.
 * • Map insertion order preserves oldest-first chronology.
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 *
 * @returns {200} { success: true, data: MonthlyStatEntry[] }
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    const now   = new Date();
    // Start of the month that is 5 months ago — gives a 6-month inclusive window
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // ── Owner isolation ───────────────────────────────────────────────────────
    const matchStage = req.user.role === 'admin'
      ? { createdAt: { $gte: start } }
      : {
          owner:     new mongoose.Types.ObjectId(String(req.user._id)),
          createdAt: { $gte: start },
        };

    // ── Aggregation ───────────────────────────────────────────────────────────
    const rows = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            // "2025-01" — sorts lexicographically which equals chronologically
            yearMonth: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          },
          total: { $sum: 1 },
          won:   { $sum: { $cond: [{ $eq: ['$status', 'Won']  }, 1, 0] } },
          lost:  { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.yearMonth': 1 } },   // oldest first
    ]);

    // ── Zero-fill all 6 months ────────────────────────────────────────────────
    const MONTH_LABELS = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec',
    ];

    /** @param {number} year @param {number} month 0-based */
    const toKey = (year, month) =>
      `${year}-${String(month + 1).padStart(2, '0')}`;

    /** @param {string} key "YYYY-MM" → "Jan 2025" */
    const toLabel = (key) => {
      const [y, m] = key.split('-');
      return `${MONTH_LABELS[parseInt(m, 10) - 1]} ${y}`;
    };

    /** @type {Map<string, { month: string, total: number, won: number, lost: number, conversionRate: number }>} */
    const resultMap = new Map();
    for (let i = 0; i < 6; i++) {
      const d   = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = toKey(d.getFullYear(), d.getMonth());
      resultMap.set(key, { month: toLabel(key), total: 0, won: 0, lost: 0, conversionRate: 0 });
    }

    // Merge aggregation results into the pre-filled map
    for (const row of rows) {
      const key = row._id.yearMonth;
      if (resultMap.has(key)) {
        // Edge-case: avoid division by zero on months with data but no won leads
        const conversionRate = row.total === 0
          ? 0
          : parseFloat(((row.won / row.total) * 100).toFixed(1));

        resultMap.set(key, {
          month: toLabel(key),
          total: row.total,
          won:   row.won,
          lost:  row.lost,
          conversionRate,
        });
      }
    }

    // Map preserves insertion order → already oldest-to-newest
    const data = Array.from(resultMap.values());

    return successResponse(res, data, 'Monthly stats retrieved');
  } catch (err) {
    return next(err);
  }
};
