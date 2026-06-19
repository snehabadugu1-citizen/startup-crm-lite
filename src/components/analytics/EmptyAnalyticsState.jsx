import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export default function EmptyAnalyticsState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center shadow-sm">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6">
        <BarChart3 size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        No analytics available yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6 text-sm">
        Add your first lead to start tracking business performance, revenue projections, and team velocity.
      </p>
      <button
        onClick={() => navigate('/leads')}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Lead
      </button>
    </div>
  );
}
