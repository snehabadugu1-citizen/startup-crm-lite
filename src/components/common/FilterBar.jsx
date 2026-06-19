import React from 'react';

const FILTERS = ['All', 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

/**
 * FilterBar displays a row of pill buttons to filter leads by their status.
 * It also computes and displays the count of leads matching each filter.
 * 
 * @param {Object} props
 * @param {string} props.activeFilter - The currently selected filter string
 * @param {Function} props.onFilterChange - Callback when a new filter is selected
 * @param {Array} props.leads - The full array of leads to calculate counts
 * @returns {JSX.Element}
 */
export default function FilterBar({ activeFilter, onFilterChange, leads }) {
  
  // Helper function to calculate the number of leads matching a specific filter
  const getCount = (filter) => {
    if (!leads) return 0;
    if (filter === 'All') return leads.length;
    return leads.filter(lead => lead.status === filter).length;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter;
        const count = getCount(filter);
        
        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              isActive 
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            aria-pressed={isActive}
          >
            {filter} <span className={isActive ? 'text-blue-100' : 'text-gray-400'}>({count})</span>
          </button>
        );
      })}
    </div>
  );
}
