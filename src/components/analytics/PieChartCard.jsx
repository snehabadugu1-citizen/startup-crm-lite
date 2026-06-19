import React, { useState } from 'react';
import { PieChart, Pie, Cell, Sector, ResponsiveContainer, Tooltip } from 'recharts';
import { STATUS_COLORS } from '../../constants/analyticsColors';

// Custom shape for expanding the active slice on hover
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

// Custom Tooltip component matching user request:
// Status
// X Leads
// Y%
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-md">
        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{data.name}</p>
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">{data.value} Leads</p>
        <p className="text-xxs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{data.percentage}% of Total</p>
      </div>
    );
  }
  return null;
};

export default function PieChartCard({ data, totalLeads }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Sort data descending by value for presentation
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // If no data
  const hasData = sortedData.length > 0 && totalLeads > 0;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-96">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
          Lead Status Distribution
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Breakdown of current pipeline statuses
        </p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          No lead status data available
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
          {/* Chart Container */}
          <div className="relative w-full max-w-[200px] h-[200px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {sortedData.map((entry, index) => {
                    const color = STATUS_COLORS[entry.name] || '#94A3B8';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Central Total Indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 leading-none">
                {totalLeads}
              </div>
              <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1">
                Total Leads
              </div>
            </div>
          </div>

          {/* Premium Custom Legend */}
          <div className="flex-1 w-full max-h-[220px] overflow-y-auto pr-1">
            <ul className="space-y-2.5">
              {sortedData.map((item, idx) => {
                const color = STATUS_COLORS[item.name] || '#94A3B8';
                return (
                  <li
                    key={item.name}
                    className="flex items-center justify-between text-xs transition-colors py-0.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30 px-2 -mx-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="font-bold text-gray-900 dark:text-gray-50">
                        {item.value}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 font-medium">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
