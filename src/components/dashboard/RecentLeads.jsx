import React from 'react';

/**
 * @typedef {Object} Lead
 * @property {number|string} id - Unique identifier
 * @property {string} name - Lead or contact name
 * @property {string} company - Company name
 * @property {string} status - Lead status
 * @property {string} dateAdded - Date the lead was added
 */

/**
 * @typedef {Object} RecentLeadsProps
 * @property {Lead[]} leads - Array of lead objects
 */

/**
 * Displays a clean table of the 5 most recent leads.
 * @param {RecentLeadsProps} props - The component props
 * @returns {JSX.Element} The rendered RecentLeads component
 */
export default function RecentLeads({ leads }) {
  // Get last 5 leads
  const recentLeads = leads.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#2563EB]/10 text-[#2563EB]">New</span>;
      case 'Contacted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">Contacted</span>;
      case 'Qualified':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#22C55E]/10 text-[#22C55E]">Qualified</span>;
      case 'Lost':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#EF4444]/10 text-[#EF4444]">Lost</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-[#E2E8F0] overflow-hidden">
      <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
        <h3 className="text-[#0F172A] font-semibold text-lg">Recent Leads</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8FAFC] text-[#64748B]">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {recentLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                <td className="px-6 py-4 font-medium text-[#0F172A]">{lead.name}</td>
                <td className="px-6 py-4 text-[#64748B]">{lead.company}</td>
                <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                <td className="px-6 py-4 text-[#64748B]">{lead.dateAdded}</td>
              </tr>
            ))}
            {recentLeads.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#64748B]">
                  No recent leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
