import React from 'react';
import { ArrowUpRight, ArrowDownRight, BarChart3, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export default function ForecastCard({ forecast }) {
  const { predictedRevenue, confidenceScore, growthTrend } = forecast;

  const isPositiveGrowth = growthTrend >= 0;
  const formattedGrowth = `${growthTrend > 0 ? '+' : ''}${growthTrend}%`;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-96 justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
              Revenue Forecast
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI-assisted next-month revenue projection
            </p>
          </div>
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex-shrink-0">
            <Sparkles size={18} />
          </div>
        </div>

        {/* Forecast Value */}
        <div className="my-5 space-y-1">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Predicted Revenue Next Month
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
              {formatCurrency(predictedRevenue)}
            </span>
            {growthTrend !== 0 && (
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isPositiveGrowth 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30' 
                  : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
              }`}>
                {isPositiveGrowth ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {formattedGrowth}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confidence Indicators and Growth Trend Details */}
      <div className="space-y-4">
        {/* Confidence Score bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-500 dark:text-gray-400">
              Pipeline Confidence Score
            </span>
            <span className="font-bold text-purple-600 dark:text-purple-400">
              {confidenceScore}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-150 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
        </div>

        {/* Small Explainer */}
        <p className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
          Projections are calculated based on the historical average monthly revenue of the last 6 months, weighted against high-probability proposal stages currently in your pipeline.
        </p>
      </div>
    </div>
  );
}
