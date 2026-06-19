import React from 'react';

const FILTERS = ['All', 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

export default function FilterBar({ activeFilter, onFilterChange, leads }) {
  const getCount = (filter) => {
    if (!leads) return 0;
    if (filter === 'All') return leads.length;
    return leads.filter(lead => lead.status === filter).length;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter;
        const count = getCount(filter);

        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            aria-pressed={isActive}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              isActive
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            {filter}{' '}
            <span className={isActive ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}>
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
