import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      {/* KPI Cards Skeleton - 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton - Pie and Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-80 shadow-sm flex flex-col justify-between">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="flex items-center justify-center space-x-8">
            <div className="h-40 w-40 rounded-full border-12 border-slate-200 dark:border-slate-700" />
            <div className="space-y-3">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-80 shadow-sm flex flex-col justify-between">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-4 py-4">
            <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-[80%] bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-[60%] bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-[40%] bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>

      {/* Bar and Line charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-80 shadow-sm flex flex-col justify-between">
          <div className="h-6 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-48 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-80 shadow-sm flex flex-col justify-between">
          <div className="h-6 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-48 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>

      {/* Revenue and Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-80 shadow-sm flex flex-col justify-between">
          <div className="h-6 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-48 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-80 shadow-sm flex flex-col justify-between">
          <div className="h-6 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-48 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
