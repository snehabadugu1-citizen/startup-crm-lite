import React from 'react';

/**
 * @typedef {Object} StatsCardProps
 * @property {string} title - The title of the metric
 * @property {string|number} value - The main metric value to display
 * @property {React.ElementType} icon - Lucide React icon component
 * @property {number} change - Percentage change compared to last period
 * @property {'primary' | 'success' | 'warning' | 'danger'} [color] - The color theme for the icon and trend
 */

/**
 * A responsive card component displaying a key metric, an icon, and a trend indicator.
 * @param {StatsCardProps} props - The component props
 * @returns {JSX.Element} The rendered StatsCard component
 */
export default function StatsCard({ title, value, icon: Icon, change, color = 'primary' }) {
  // Map our semantic colors to the specific hex codes requested
  const colorMap = {
    primary: 'text-[#2563EB] bg-[#2563EB]/10',
    success: 'text-[#22C55E] bg-[#22C55E]/10',
    warning: 'text-[#F59E0B] bg-[#F59E0B]/10',
    danger: 'text-[#EF4444] bg-[#EF4444]/10',
  };

  const iconClasses = colorMap[color] || colorMap.primary;
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-[#E2E8F0] p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[#64748B] text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${iconClasses}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-3xl font-bold text-[#0F172A]">{value}</div>
        <div className="flex items-center mt-2 text-sm">
          <span className={`font-medium ${isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-[#64748B] ml-2">vs last month</span>
        </div>
      </div>
    </div>
  );
}
