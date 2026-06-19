import React from 'react';
import { Trophy, Award, Medal, Crown } from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export default function TopPerformersCard({ data }) {
  const hasData = data && data.length > 0;

  // Find max value to determine progress bar widths
  const maxRevenue = hasData ? Math.max(...data.map(d => d.value)) : 0;

  // Custom rank indicators for top performers
  const renderRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Trophy size={14} />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            <Medal size={14} />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
            <Award size={14} />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-xs font-extrabold">
            {rank}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-96 justify-between">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
              Top Performers
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Reps ranked by closed-won deal revenue
            </p>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex-shrink-0">
            <Crown size={18} />
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          No performance records available
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2">
          {data.map((performer, idx) => {
            const rank = idx + 1;
            const progressPct = maxRevenue > 0 ? (performer.value / maxRevenue) * 100 : 0;
            
            return (
              <div key={performer.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {renderRankBadge(rank)}
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {performer.name}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-gray-50">
                    {formatCurrency(performer.value)}
                  </span>
                </div>
                
                {/* Horizontal Progress Bar representing proportional sales closed */}
                <div className="flex items-center gap-3 pl-9">
                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-slate-400' : rank === 3 ? 'bg-orange-400' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
