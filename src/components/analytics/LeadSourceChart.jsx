import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { SOURCE_COLORS } from '../../constants/analyticsColors';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-md">
        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{data.source}</p>
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">{data.count} Leads</p>
      </div>
    );
  }
  return null;
};

export default function LeadSourceChart({ data }) {
  const hasData = data && data.length > 0;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-96">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
          Lead Source Analytics
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Distribution of leads by acquisition channel
        </p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          No lead source data available
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 10, right: 35, left: 15, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="transparent"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="source"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.03)' }} />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                barSize={16}
                animationDuration={800}
              >
                {data.map((entry, index) => {
                  const color = SOURCE_COLORS[entry.source] || '#64748B';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
                <LabelList
                  dataKey="count"
                  position="right"
                  className="text-gray-600 dark:text-gray-300 font-extrabold text-[10px]"
                  style={{ fill: 'currentColor' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
