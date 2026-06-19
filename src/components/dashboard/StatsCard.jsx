import React from 'react';

export default function StatsCard({ title, value, icon: Icon, change, color = 'primary' }) {
  const colorMap = {
    primary: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
    warning: 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    danger:  'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
  };

  const iconClasses = colorMap[color] || colorMap.primary;
  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col transition-colors duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${iconClasses}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
        <div className="flex items-center mt-2 text-sm">
          <span className={`font-medium ${isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
        </div>
      </div>
    </div>
  );
}
