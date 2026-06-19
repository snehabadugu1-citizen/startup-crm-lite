import React from 'react';
import { ArrowUpRight, ArrowDownRight, Users, Target, CircleDollarSign, Coins, Clock, AlertTriangle } from 'lucide-react';

export default function StatsCards({ metrics }) {
  const {
    totalLeads,
    conversionRate,
    pipelineValue,
    wonRevenue,
    averageSalesCycle,
    lostRate,
    growths
  } = metrics;

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const kpis = [
    {
      id: 'kpi-total-leads',
      title: 'Total Leads',
      value: totalLeads,
      growth: growths.totalLeads,
      isPercentage: false,
      isCurrency: false,
      icon: Users,
      iconColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
      description: 'vs previous period'
    },
    {
      id: 'kpi-conv-rate',
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      growth: growths.conversionRate,
      isRateChange: true, // Show direct point difference
      isPercentage: false,
      isCurrency: false,
      icon: Target,
      iconColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
      description: 'vs previous period'
    },
    {
      id: 'kpi-pipeline',
      title: 'Pipeline Value',
      value: formatCurrency(pipelineValue),
      growth: growths.pipelineValue,
      isPercentage: false,
      isCurrency: true,
      icon: CircleDollarSign,
      iconColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
      description: 'vs previous period'
    },
    {
      id: 'kpi-won-revenue',
      title: 'Won Revenue',
      value: formatCurrency(wonRevenue),
      growth: growths.wonRevenue,
      isPercentage: false,
      isCurrency: true,
      icon: Coins,
      iconColor: 'text-success-500 bg-success-50 dark:bg-success-950/40',
      description: 'vs previous period'
    },
    {
      id: 'kpi-sales-cycle',
      title: 'Average Sales Cycle',
      value: `${averageSalesCycle} Days`,
      growth: growths.averageSalesCycle,
      inverseGrowth: true, // Lower is better for sales cycles
      isRateChange: true,
      isPercentage: false,
      isCurrency: false,
      icon: Clock,
      iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
      description: 'vs previous period'
    },
    {
      id: 'kpi-lost-rate',
      title: 'Lost Rate',
      value: `${lostRate}%`,
      growth: growths.lostRate,
      inverseGrowth: true, // Lower is better for lost rates
      isRateChange: true,
      isPercentage: false,
      isCurrency: false,
      icon: AlertTriangle,
      iconColor: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
      description: 'vs previous period'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        
        // Determine whether growth is positive or negative
        // If inverseGrowth is true (e.g. Sales Cycle / Lost Rate), negative change is good (green), positive is bad (red)
        const isGood = kpi.inverseGrowth ? kpi.growth < 0 : kpi.growth > 0;
        const isBad = kpi.inverseGrowth ? kpi.growth > 0 : kpi.growth < 0;
        const hasGrowth = kpi.growth !== 0;

        let growthClass = 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
        if (hasGrowth) {
          if (isGood) {
            growthClass = 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
          } else if (isBad) {
            growthClass = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
          }
        }

        const formattedGrowth = kpi.isRateChange 
          ? `${kpi.growth > 0 ? '+' : ''}${kpi.growth}%`
          : `${kpi.growth > 0 ? '+' : ''}${kpi.growth}%`;

        return (
          <div
            key={kpi.id}
            id={kpi.id}
            className="flex flex-col justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-xl ${kpi.iconColor}`}>
                <Icon size={18} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-50 truncate leading-none">
                {kpi.value}
              </h4>
              
              {hasGrowth ? (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${growthClass}`}>
                    {isGood ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {formattedGrowth}
                  </span>
                  <span className="text-xxs text-gray-400 dark:text-gray-500 truncate">
                    {kpi.description}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                    0%
                  </span>
                  <span className="text-xxs text-gray-400 dark:text-gray-500 truncate">
                    No change
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
