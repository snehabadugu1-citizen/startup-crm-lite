import React from 'react';
import { FunnelChart, Funnel, Cell, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import { STATUS_COLORS } from '../../constants/analyticsColors';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-md">
        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{data.name}</p>
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">{data.value} Leads</p>
        <p className="text-xxs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
          {data.conversion}% Conversion Rate
        </p>
        {data.name !== 'New' && (
          <p className="text-xxs font-medium text-rose-500 mt-0.5">
            {data.dropoff}% Drop-off
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function FunnelChartCard({ data }) {
  // Format the data specifically for Recharts Funnel
  const funnelChartData = data.map((item) => ({
    name: item.stage,
    value: item.count,
    conversion: item.conversion,
    dropoff: item.dropoff,
    fill: STATUS_COLORS[item.stage] || '#2563EB',
  }));

  const totalLeads = data[0]?.count || 0;
  const hasData = totalLeads > 0;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-96">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
          Sales Funnel Visualization
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Cumulative conversion and drop-off rate by stage
        </p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          No pipeline funnel data available
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
          {/* Chart Container */}
          <div className="w-full sm:w-[50%] h-[200px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<CustomTooltip />} />
                <Funnel
                  dataKey="value"
                  data={funnelChartData}
                  isAnimationActive
                  animationDuration={800}
                >
                  {funnelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    position="right"
                    fill="currentColor"
                    className="text-gray-600 dark:text-gray-300 font-semibold text-[10px]"
                    dataKey="name"
                    stroke="none"
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Funnel Metrics Table */}
          <div className="flex-1 w-full max-h-[220px] overflow-y-auto pr-1">
            <div className="space-y-3">
              {data.map((item) => {
                const color = STATUS_COLORS[item.stage] || '#2563EB';
                return (
                  <div key={item.stage} className="flex flex-col gap-1 py-1 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {item.stage}
                        </span>
                      </div>
                      <span className="font-extrabold text-gray-900 dark:text-gray-50">
                        {item.count}
                      </span>
                    </div>

                    {/* Progress Bar & Sub-metrics */}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${totalLeads > 0 ? (item.count / totalLeads) * 100 : 0}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      <div className="flex gap-2 text-[10px] whitespace-nowrap">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.conversion}% conv
                        </span>
                        {item.stage !== 'New' && (
                          <span className="font-medium text-rose-500 dark:text-rose-400">
                            {item.dropoff}% drop
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
