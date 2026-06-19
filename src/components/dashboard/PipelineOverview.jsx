import React from 'react';

export default function PipelineOverview({ leads }) {
  if (!leads || leads.length === 0) return null;

  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const total = leads.length;

  const statusColors = {
    'New':                '#2563EB',
    'Contacted':          '#F59E0B',
    'Meeting Scheduled':  '#F59E0B',
    'Proposal Sent':      '#7C3AED',
    'Won':                '#22C55E',
    'Lost':               '#EF4444',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
      <h3 className="text-gray-900 dark:text-gray-50 font-semibold text-lg mb-4">Pipeline Overview</h3>

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => {
          const color = statusColors[status] || '#64748B';
          return (
            <div key={status} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium truncate">{status}</span>
              </div>
              <span className="text-gray-900 dark:text-gray-50 text-xl font-bold">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
