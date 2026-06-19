import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Compass, Info } from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export default function SalesVelocityCard({ value, growth, leads }) {
  // Compute components of velocity for the current active leads
  const activeLeads = leads.filter((l) => !['Won', 'Lost'].includes(l.status));
  const opportunities = activeLeads.length;

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const winRate = totalLeads > 0 ? (wonLeads.length / totalLeads) : 0;

  let avgDealSize = 0;
  if (wonLeads.length > 0) {
    avgDealSize = wonLeads.reduce((acc, l) => acc + (Number(l.value) || 0), 0) / wonLeads.length;
  } else {
    avgDealSize = leads.reduce((acc, l) => acc + (Number(l.value) || 0), 0) / (totalLeads || 1);
  }

  // Calculate average sales cycle
  let totalDays = 0;
  let cycleCount = 0;
  wonLeads.forEach((lead) => {
    const start = new Date(lead.createdAt);
    const end = lead.wonAt ? new Date(lead.wonAt) : null;
    if (end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
      totalDays += Math.ceil(Math.max(0, end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      cycleCount++;
    }
  });
  const salesCycleLength = cycleCount > 0 ? Math.round(totalDays / cycleCount) : 15;

  const isGood = growth >= 0;
  const formattedGrowth = `${growth > 0 ? '+' : ''}${growth}%`;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-96 justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
              Sales Velocity Widget
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Measure how fast your pipeline is generating revenue
            </p>
          </div>
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex-shrink-0">
            <Compass size={18} />
          </div>
        </div>

        {/* Large Value Display */}
        <div className="my-5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            {formatCurrency(value)}
          </span>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">/day</span>
          
          <div className="ml-3">
            {growth !== 0 ? (
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isGood 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30' 
                  : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
              }`}>
                {isGood ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {formattedGrowth}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-400">
                0%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Formula Breakdown Container */}
      <div className="bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xxs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          <Info size={12} />
          <span>Velocity Components Breakdown</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs font-medium">
          <div className="space-y-1">
            <p className="text-gray-400 dark:text-gray-500">Opportunities (Active)</p>
            <p className="font-bold text-gray-900 dark:text-gray-50">{opportunities} Leads</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 dark:text-gray-500">Win Rate</p>
            <p className="font-bold text-gray-900 dark:text-gray-50">{Math.round(winRate * 100)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 dark:text-gray-500">Avg Deal Size</p>
            <p className="font-bold text-gray-900 dark:text-gray-50">{formatCurrency(avgDealSize)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 dark:text-gray-500">Sales Cycle Length</p>
            <p className="font-bold text-gray-900 dark:text-gray-50">{salesCycleLength} Days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
