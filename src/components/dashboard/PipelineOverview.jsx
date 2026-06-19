import React from 'react';

/**
 * @typedef {Object} Lead
 * @property {number|string} id - Unique identifier
 * @property {string} name - Lead or company name
 * @property {string} company - Company name
 * @property {string} status - Lead status (e.g., 'New', 'Contacted', 'Qualified', 'Lost')
 * @property {string} dateAdded - Date the lead was added
 */

/**
 * @typedef {Object} PipelineOverviewProps
 * @property {Lead[]} leads - Array of lead objects
 */

/**
 * Displays a visual horizontal bar with colored segments representing the pipeline status distribution.
 * @param {PipelineOverviewProps} props - The component props
 * @returns {JSX.Element} The rendered PipelineOverview component
 */
export default function PipelineOverview({ leads }) {
  if (!leads || leads.length === 0) return null;

  // Calculate status counts
  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const total = leads.length;

  // Define colors for specific statuses mapping to our palette
  const statusColors = {
    'New': '#2563EB',       // Primary
    'Contacted': '#F59E0B', // Warning
    'Qualified': '#22C55E', // Success
    'Lost': '#EF4444',      // Danger
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-[#E2E8F0] p-6">
      <h3 className="text-[#0F172A] font-semibold text-lg mb-4">Pipeline Overview</h3>
      
      {/* Visual Bar */}
      <div className="flex h-4 rounded-full overflow-hidden mb-6">
        {Object.entries(statusCounts).map(([status, count]) => {
          const percentage = (count / total) * 100;
          const color = statusColors[status] || '#64748B';
          return (
            <div 
              key={status} 
              style={{ width: `${percentage}%`, backgroundColor: color }}
              title={`${status}: ${count} (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => {
          const color = statusColors[status] || '#64748B';
          return (
            <div key={status} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[#64748B] text-sm font-medium">{status}</span>
              </div>
              <span className="text-[#0F172A] text-xl font-bold">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
