import React from 'react';
import { SearchX, Inbox } from 'lucide-react';

export default function EmptyState({ totalLeads, onClearFilters }) {
  if (totalLeads === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-1">No leads yet</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          You haven't added any leads to your CRM. Get started by clicking the "Add Lead" button above.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-1">No leads found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
        We couldn't find any leads matching your current search or filter criteria.
      </p>
      <button
        onClick={onClearFilters}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}
