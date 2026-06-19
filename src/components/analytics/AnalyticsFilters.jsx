import React from 'react';
import { Calendar } from 'lucide-react';

export default function AnalyticsFilters({
  filterType,
  setFilterType,
  customRange,
  setCustomRange
}) {
  const options = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleCustomRangeChange = (e) => {
    const { name, value } = e.target;
    setCustomRange((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between">
      {/* Date Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterType(opt.value)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
              filterType === opt.value
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Custom Date Picker Inputs */}
      {filterType === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 shadow-inner">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              name="startDate"
              aria-label="Start Date"
              value={customRange.startDate}
              onChange={handleCustomRangeChange}
              className="bg-transparent text-xs text-gray-700 dark:text-gray-200 focus:outline-none"
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">to</span>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 shadow-inner">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              name="endDate"
              aria-label="End Date"
              value={customRange.endDate}
              onChange={handleCustomRangeChange}
              className="bg-transparent text-xs text-gray-700 dark:text-gray-200 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
