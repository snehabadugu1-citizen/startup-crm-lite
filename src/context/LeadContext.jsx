import { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { sampleLeads } from '../data/sampleLeads';

/**
 * @typedef {Object} Lead
 * @property {string} id - Unique identifier generated via crypto.randomUUID() or Date.now()
 * @property {string} name - The lead's full name
 * @property {string} company - The company the lead works for
 * @property {string} email - The lead's email address
 * @property {string} phone - The lead's phone number
 * @property {'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost'} status - Pipeline status
 * @property {'Website' | 'Referral' | 'LinkedIn' | 'Cold Call' | 'Email Campaign' | 'Other'} source - Acquisition source
 * @property {string} createdAt - ISO string date representation of when the lead was added
 */

/**
 * Context to manage the global Leads state across the application.
 * @type {React.Context}
 */
export const LeadContext = createContext(undefined);

/**
 * Provider component that handles lead CRUD operations and persists to LocalStorage.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function LeadProvider({ children }) {
  const [leads, setLeads] = useLocalStorage('startup-crm-leads', sampleLeads);

  /**
   * Adds a new lead to the state, automatically generating an ID and timestamp.
   * @param {Omit<Lead, 'id' | 'createdAt'>} leadData - The lead properties without auto-generated fields
   * @returns {void}
   */
  const addLead = (leadData) => {
    const newLead = {
      ...leadData,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  /**
   * Updates an existing lead by matching its ID.
   * @param {string} id - The ID of the lead to update
   * @param {Partial<Lead>} updatedData - The properties to merge into the existing lead
   * @returns {void}
   */
  const updateLead = (id, updatedData) => {
    setLeads((prev) => 
      prev.map(lead => lead.id === id ? { ...lead, ...updatedData } : lead)
    );
  };

  /**
   * Removes a lead completely from the system.
   * @param {string} id - The ID of the lead to delete
   * @returns {void}
   */
  const deleteLead = (id) => {
    setLeads((prev) => prev.filter(lead => lead.id !== id));
  };

  /**
   * Retrieves a single lead object by its ID.
   * @param {string} id - The lead ID to lookup
   * @returns {Lead | undefined} The found lead, or undefined
   */
  const getLeadById = (id) => {
    return leads.find(lead => lead.id === id);
  };

  return (
    <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead, getLeadById }}>
      {children}
    </LeadContext.Provider>
  );
}

/**
 * Custom hook to securely consume the LeadContext.
 * 
 * @throws {Error} If called outside of a LeadProvider
 * @returns {{ leads: Lead[], addLead: function, updateLead: function, deleteLead: function, getLeadById: function }}
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}
