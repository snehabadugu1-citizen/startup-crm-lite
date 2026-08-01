import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * @typedef {Object} LeadSchema
 * @description Defines the shape of a Lead document stored in MongoDB.
 *              A Lead represents a potential customer tracked through the sales pipeline.
 *              Each lead is owned by a specific User and progresses through defined statuses.
 */
const leadSchema = new Schema(
  {
    /**
     * @field name
     * @type {String}
     * @description The full name of the lead / contact person (e.g. "John Smith").
     *              Must be between 2 and 100 characters; trimmed of surrounding whitespace.
     */
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },

    /**
     * @field company
     * @type {String}
     * @description The name of the organization the lead belongs to (e.g. "Acme Corp").
     *              Required so that leads can always be attributed to a business entity.
     */
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },

    /**
     * @field email
     * @type {String}
     * @description The lead's business email address used for communication and deduplication.
     *              Validated against a standard email regex; stored with trimmed whitespace.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      validate: {
        validator: (value) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Email must be a valid email address',
      },
    },

    /**
     * @field phone
     * @type {String}
     * @description Optional phone number for the lead. Stored as a string to
     *              accommodate international formats (e.g. "+1-800-555-0199").
     *              No format validation is enforced to allow global flexibility.
     */
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * @field status
     * @type {String}
     * @description Current stage of the lead in the sales pipeline.
     *              Must exactly match one of the frontend kanban column values:
     *              - 'New'                : freshly created, no outreach yet
     *              - 'Contacted'          : initial contact made
     *              - 'Meeting Scheduled'  : a meeting/call has been arranged
     *              - 'Proposal Sent'      : a formal proposal has been delivered
     *              - 'Won'                : deal closed successfully
     *              - 'Lost'               : opportunity no longer active
     */
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
        message:
          "Status must be one of: 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'",
      },
      default: 'New',
    },

    /**
     * @field source
     * @type {String}
     * @description Marketing / acquisition channel through which the lead was generated.
     *              Must exactly match one of the frontend dropdown values:
     *              - 'Website'         : organic or paid web traffic
     *              - 'Referral'        : referred by an existing customer or partner
     *              - 'LinkedIn'        : outbound or inbound via LinkedIn
     *              - 'Cold Call'       : proactive telephone outreach
     *              - 'Email Campaign'  : targeted bulk email initiative
     *              - 'Other'           : any channel not listed above
     */
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'],
        message:
          "Source must be one of: 'Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'",
      },
      default: 'Website',
    },

    /**
     * @field notes
     * @type {String}
     * @description Free-form notes about the lead: meeting summaries, observations,
     *              next steps, etc. Optional field with a 1000-character cap to
     *              prevent oversized documents while still allowing rich context.
     */
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must not exceed 1000 characters'],
      default: null,
    },

    /**
     * @field owner
     * @type {mongoose.Schema.Types.ObjectId}
     * @description Reference to the User document who created and owns this lead.
     *              Used for access control (users can only see their own leads),
     *              and for the compound index that optimises per-user filtered queries.
     *              Populating this field yields the full User subdocument.
     */
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead must have an owner'],
    },
  },
  {
    /**
     * Automatically adds `createdAt` and `updatedAt` fields managed by Mongoose.
     * - createdAt : timestamp of first insertion — also used by the `age` virtual.
     * - updatedAt : timestamp of the most recent modification.
     */
    timestamps: true,

    /**
     * Ensure virtual fields (e.g. `age`) are included when the document is
     * serialized to JSON or a plain object so API responses expose them automatically.
     */
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────

/**
 * @index { owner, status }
 * @description Compound index covering the most common per-user kanban/list query:
 *              "fetch all leads belonging to a specific user filtered by pipeline status".
 *              Also used by getLeadStats $facet statusCounts sub-pipeline.
 */
leadSchema.index({ owner: 1, status: 1 });

/**
 * @index { owner, createdAt }
 * @description Compound index for date-range queries on the getLeads endpoint
 *              (?dateFrom / ?dateTo) and for the getMonthlyStats aggregation
 *              $match stage that filters on { owner, createdAt: { $gte: start } }.
 *              The descending createdAt also accelerates the default sort order.
 */
leadSchema.index({ owner: 1, createdAt: -1 });

/**
 * @index { owner, source }
 * @description Compound index for getLeads ?source= filter and the getLeadStats
 *              $facet sourceCounts sub-pipeline, both of which equality-match on
 *              owner then group/filter by source.
 */
leadSchema.index({ owner: 1, source: 1 });

/**
 * @index { owner, name, company }
 * @description Supports the regex search on name / company fields used in
 *              getLeads ?search= and the searchLeads autocomplete endpoint.
 *              Leading owner field restricts the scan to the current user's docs
 *              before the regex is applied, keeping the working set small.
 */
leadSchema.index({ owner: 1, name: 1, company: 1 });

/**
 * @index { email }
 * @description Single-field index on email to support fast lookups, deduplication
 *              checks when importing leads, and the searchLeads email regex path.
 */
leadSchema.index({ email: 1 });

// ─── Virtual Fields ───────────────────────────────────────────────────────────

/**
 * @virtual age
 * @type {number}
 * @description Computed (non-persisted) field that returns the number of whole days
 *              that have elapsed since the lead was first created.
 *              Useful for analytics dashboards (e.g. "leads older than 30 days").
 *
 * @returns {number} Days since `createdAt`, floored to the nearest integer.
 *
 * @example
 * const lead = await Lead.findById(id);
 * console.log(lead.age); // e.g. 14  (lead created 14 days ago)
 */
leadSchema.virtual('age').get(function computeAge() {
  if (!this.createdAt) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((Date.now() - this.createdAt.getTime()) / msPerDay);
});

// ─── Model & Schema Exports ───────────────────────────────────────────────────

/**
 * @exports leadSchema - Raw Mongoose schema (useful for testing or schema composition).
 * @exports Lead       - Compiled Mongoose model bound to the 'leads' collection.
 */
export { leadSchema };
export const Lead = model('Lead', leadSchema);
export default Lead;
