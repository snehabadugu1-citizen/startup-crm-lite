// src/services/leadService.js
// ─────────────────────────────────────────────────────────────────────────────
// All lead-related API calls.
// Each function returns `response.data` (unwrapped axios body) so callers work
// with plain objects rather than axios wrapper types.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api';

/**
 * Fetch a paginated, optionally filtered list of leads.
 *
 * @param {object}  [params={}]        - Query parameters
 * @param {string}  [params.status]    - Filter by lead status (e.g. 'New', 'Won')
 * @param {string}  [params.search]    - Full-text search term
 * @param {number}  [params.page]      - Page number (1-indexed)
 * @param {number}  [params.limit]     - Results per page
 * @returns {Promise<{ leads: Lead[], pagination: object }>}
 */
export async function getLeads(params = {}) {
  // Axios serialises the params object as ?status=X&search=Y&page=Z automatically
  const response = await api.get('/api/leads', { params });
  return response.data;
}

/**
 * Create a new lead record.
 *
 * @param {object} leadData - Lead fields (name, company, email, phone, status, source, …)
 * @returns {Promise<{ lead: object }>} Newly created lead from the server
 */
export async function createLead(leadData) {
  const response = await api.post('/api/leads', leadData);
  return response.data;
}

/**
 * Fully update an existing lead (all fields replaced with leadData).
 *
 * @param {string} id       - MongoDB ObjectId of the lead
 * @param {object} leadData - Updated lead fields
 * @returns {Promise<{ lead: object }>} Updated lead
 */
export async function updateLead(id, leadData) {
  const response = await api.put(`/api/leads/${id}`, leadData);
  return response.data;
}

/**
 * Partially update only the status field of a lead (PATCH for efficiency).
 *
 * @param {string} id     - MongoDB ObjectId of the lead
 * @param {string} status - New status value
 * @returns {Promise<{ lead: object }>} Updated lead
 */
export async function updateLeadStatus(id, status) {
  const response = await api.patch(`/api/leads/${id}/status`, { status });
  return response.data;
}

/**
 * Permanently delete a lead.
 *
 * @param {string} id - MongoDB ObjectId of the lead
 * @returns {Promise<{ message: string }>} Confirmation message from server
 */
export async function deleteLead(id) {
  const response = await api.delete(`/api/leads/${id}`);
  return response.data;
}

/**
 * Retrieve aggregate summary statistics for the current user's pipeline
 * (e.g. total leads, win rate, pipeline value).
 *
 * @returns {Promise<object>} Stats summary object
 */
export async function getLeadStats() {
  const response = await api.get('/api/leads/stats/summary');
  return response.data;
}

/**
 * Retrieve monthly lead counts for charting purposes.
 *
 * @returns {Promise<object[]>} Array of { month, count } objects
 */
export async function getMonthlyStats() {
  const response = await api.get('/api/leads/stats/monthly');
  return response.data;
}
