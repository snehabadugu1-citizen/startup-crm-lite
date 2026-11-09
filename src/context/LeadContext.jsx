// src/context/LeadContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Global Leads state — now backed by the Express REST API instead of localStorage.
//
// Key changes from the original version:
//   • Removed `useLocalStorage` hook — all mutations go through the API.
//   • Added `isLoading` state so consumers can show spinners.
//   • Added `pagination` object for page-aware fetching.
//   • Added `fetchLeads(params)` so any page can trigger a fresh server load.
//   • CRUD helpers (addLead, updateLead, deleteLead) call the server first,
//     then update local state optimistically — so the UI feels instant.
//   • All actions show success / error toasts via react-hot-toast.
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as leadService from '../services/leadService';

/**
 * @typedef {Object} Lead
 * @property {string} _id        - MongoDB ObjectId (used as the unique key)
 * @property {string} name
 * @property {string} company
 * @property {string} email
 * @property {string} phone
 * @property {'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost'} status
 * @property {'Website' | 'Referral' | 'LinkedIn' | 'Cold Call' | 'Email Campaign' | 'Other'} source
 * @property {string} createdAt  - ISO date string
 */

/**
 * @typedef {Object} Pagination
 * @property {number} page       - Current page (1-indexed)
 * @property {number} totalPages
 * @property {number} totalLeads
 * @property {number} limit
 */

/** @type {React.Context} */
export const LeadContext = createContext(undefined);

/**
 * Provider component that manages Leads state and exposes CRUD helpers.
 * Wrap any part of the tree that needs access to leads data with this.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function LeadProvider({ children }) {
  /** @type {[Lead[], React.Dispatch<React.SetStateAction<Lead[]>>]} */
  const [leads,      setLeads]      = useState([]);

  /** True while an API call is in-flight (for spinners / disabled buttons) */
  const [isLoading,  setIsLoading]  = useState(false);

  /** Pagination metadata returned by the server (null until first fetch) */
  const [pagination, setPagination] = useState(null);

  // ── fetchLeads ─────────────────────────────────────────────────────────────
  /**
   * Load (or reload) leads from the server with optional filtering / pagination.
   *
   * @param {object} [params={}] - Query parameters: { status, search, page, limit }
   * @returns {Promise<void>}
   */
  const fetchLeads = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const data = await leadService.getLeads(params);

      // Server may return the array directly or wrapped in { leads, pagination }
      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        setLeads(data.leads ?? data.data ?? []);
        setPagination(data.pagination ?? null);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to load leads';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── addLead ────────────────────────────────────────────────────────────────
  /**
   * Create a new lead on the server, then prepend it to local state.
   *
   * @param {Omit<Lead, '_id' | 'createdAt'>} data - Lead fields from the form
   * @returns {Promise<void>}
   */
  const addLead = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const result = await leadService.createLead(data);
      // Server may return { lead: {...} } or the lead object directly
      const newLead = result.lead ?? result.data ?? result;
      setLeads((prev) => [newLead, ...prev]);
      toast.success('Lead created successfully! 🎉');
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to create lead';
      toast.error(message);
      // Re-throw so the form can stop its loading state
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── updateLead ─────────────────────────────────────────────────────────────
  /**
   * Send updated fields to the server, then merge into local state.
   *
   * @param {string}        id   - Lead's _id (or id — normalised below)
   * @param {Partial<Lead>} data - Fields to update
   * @returns {Promise<void>}
   */
  const updateLead = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      const result = await leadService.updateLead(id, data);
      const updated = result.lead ?? result.data ?? result;

      setLeads((prev) =>
        prev.map((lead) =>
          // Support both _id (MongoDB) and id (legacy)
          (lead._id || lead.id) === id ? { ...lead, ...updated } : lead
        )
      );
      toast.success('Lead updated successfully ✅');
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to update lead';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── deleteLead ─────────────────────────────────────────────────────────────
  /**
   * Delete a lead on the server, then remove it from local state.
   *
   * @param {string} id - Lead's _id
   * @returns {Promise<void>}
   */
  const deleteLead = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await leadService.deleteLead(id);
      setLeads((prev) =>
        prev.filter((lead) => (lead._id || lead.id) !== id)
      );
      toast.success('Lead deleted', { icon: '🗑️' });
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to delete lead';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── getLeadById (local lookup — no extra network call) ────────────────────
  /**
   * @param {string} id - Lead _id or id
   * @returns {Lead | undefined}
   */
  const getLeadById = useCallback((id) => {
    return leads.find((lead) => (lead._id || lead.id) === id);
  }, [leads]);

  // ── Context value ──────────────────────────────────────────────────────────
  return (
    <LeadContext.Provider
      value={{
        leads,
        isLoading,
        pagination,
        fetchLeads,
        addLead,
        updateLead,
        deleteLead,
        getLeadById,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────
/**
 * Consume the LeadContext from any component inside LeadProvider.
 *
 * @throws {Error} If called outside of a LeadProvider
 * @returns {{ leads, isLoading, pagination, fetchLeads, addLead, updateLead, deleteLead, getLeadById }}
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}
