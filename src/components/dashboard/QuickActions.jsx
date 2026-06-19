import React from 'react';
import { Plus, List, Download } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
      <h3 className="text-gray-900 dark:text-gray-50 font-semibold text-lg mb-4">Quick Actions</h3>
      <div className="flex flex-col gap-3">
        <button className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus size={18} />
          Add New Lead
        </button>
        <button className="flex items-center justify-center gap-2 w-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 px-4 py-2.5 rounded-lg font-medium transition-colors">
          <List size={18} />
          View All Leads
        </button>
        <button className="flex items-center justify-center gap-2 w-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Download size={18} />
          Export Data
        </button>
      </div>
    </div>
  );
}
