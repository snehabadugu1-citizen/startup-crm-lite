import React from 'react';
import { SearchX, Inbox } from 'lucide-react';

/**
 * A friendly empty state component to display when lists yield no results.
 * 
 * @param {Object} props
 * @param {number} props.totalLeads - The absolute total number of leads before any filtering
 * @param {Function} props.onClearFilters - Callback to reset all search/filter states
 * @returns {JSX.Element}
 */
export default function EmptyState({ totalLeads, onClearFilters }) {
  // Scenario 1: The user hasn't created a single lead yet.
  if (totalLeads === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-gray-200 border-dashed">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No leads yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          You haven't added any leads to your CRM. Get started by clicking the "Add Lead" button above.
        </p>
      </div>
    );
  }

  // Scenario 2: The user has leads, but the current search/filter combination yielded zero results.
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-gray-200 border-dashed">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">No leads found</h3>
      <p className="text-gray-500 mb-4 max-w-sm mx-auto">
        We couldn't find any leads matching your current search or filter criteria.
      </p>
      <button 
        onClick={onClearFilters}
        className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}
