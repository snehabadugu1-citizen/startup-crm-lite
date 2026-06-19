import React from 'react';

/**
 * A reusable pill-shaped badge component that visually indicates the status of a lead.
 * Full dark mode support via Tailwind dark: variants.
 */
export default function StatusBadge({ status }) {
  const getColorClasses = (status) => {
    switch (status) {
      case 'New':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200';
      case 'Contacted':
        return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300';
      case 'Meeting Scheduled':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300';
      case 'Proposal Sent':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300';
      case 'Won':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300';
      case 'Lost':
        return 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getColorClasses(status)}`}>
      {status}
    </span>
  );
}
