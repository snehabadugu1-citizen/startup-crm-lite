import React from 'react';

/**
 * A reusable pill-shaped badge component that visually indicates the status of a lead.
 * Colors map semantically to the action stage.
 * 
 * @param {Object} props
 * @param {string} props.status - The current status of the lead
 * @returns {JSX.Element}
 */
export default function StatusBadge({ status }) {
  // Determine the correct Tailwind classes based on the status string
  const getColorClasses = (status) => {
    switch (status) {
      case 'New': 
        return 'bg-gray-100 text-gray-700'; // Gray
      case 'Contacted': 
        return 'bg-amber-100 text-amber-700'; // Warning/Yellow
      case 'Meeting Scheduled': 
        return 'bg-blue-100 text-blue-700'; // Primary/Blue
      case 'Proposal Sent': 
        return 'bg-purple-100 text-purple-700'; // Purple
      case 'Won': 
        return 'bg-green-100 text-green-700'; // Success/Green
      case 'Lost': 
        return 'bg-red-100 text-red-700'; // Danger/Red
      default: 
        return 'bg-gray-100 text-gray-600'; // Fallback
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getColorClasses(status)}`}>
      {status}
    </span>
  );
}
