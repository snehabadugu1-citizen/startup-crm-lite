import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_GRID_COLOR } from '../../constants/analyticsColors';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-md">
        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{data.name}</p>
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">{data['Conversion Rate']}% Conversion</p>
      </div>
    );
  }
  return null;
};

export default function LineChartCard({ data }) {
  const hasData = data && data.some(d => d['Conversion Rate'] > 0);

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-96">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
          Monthly Conversion Trend
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Conversion rate (Won Leads / Total Leads) over the last 6 months
        </p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          No conversion trend data available
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={CHART_GRID_COLOR.light}
                className="dark:stroke-slate-700"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
                domain={[0, 100]}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="Conversion Rate"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 1, fill: '#22C55E' }}
                activeDot={{ r: 7, strokeWidth: 0 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
