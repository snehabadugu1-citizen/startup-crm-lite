import React, { useState, useMemo } from 'react';
import { Flame } from 'lucide-react';

export default function ActivityHeatmap({ data }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Convert raw counts list into a lookup map for speed
  const activityMap = useMemo(() => {
    const map = {};
    if (Array.isArray(data)) {
      data.forEach((item) => {
        map[item.date] = item.count;
      });
    }
    return map;
  }, [data]);

  // Construct grid: 18 weeks (columns) of 7 days (rows), ending with today
  const gridData = useMemo(() => {
    const weeks = [];
    const now = new Date();
    
    // Start exactly 18 weeks ago, aligned to the preceding Sunday
    const startDate = new Date();
    startDate.setDate(now.getDate() - 18 * 7);
    const startDayOfWeek = startDate.getDay(); // 0 is Sunday
    startDate.setDate(startDate.getDate() - startDayOfWeek);
    startDate.setHours(0, 0, 0, 0);

    const tempDate = new Date(startDate.getTime());
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Populate daily nodes
    const allDays = [];
    while (tempDate <= today) {
      const dateStr = tempDate.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      allDays.push({
        date: new Date(tempDate.getTime()),
        dateStr,
        count,
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Chunk into weeks (arrays of 7 days)
    for (let i = 0; i < allDays.length; i += 7) {
      const week = allDays.slice(i, i + 7);
      if (week.length > 0) {
        weeks.push(week);
      }
    }

    return weeks;
  }, [activityMap]);

  // Color intensity levels based on activity count
  const getColorLevelClass = (count) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (count <= 1) return 'bg-blue-100 dark:bg-blue-900/30';
    if (count <= 3) return 'bg-blue-300 dark:bg-blue-700/60';
    if (count <= 5) return 'bg-blue-500';
    return 'bg-blue-700 dark:bg-blue-600';
  };

  // Format date readable
  const formatDateLabel = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Find month boundaries for headers
  const monthHeaders = useMemo(() => {
    const headers = [];
    let lastMonth = -1;

    gridData.forEach((week, weekIdx) => {
      const firstDayOfWeek = week[0]?.date;
      if (firstDayOfWeek) {
        const m = firstDayOfWeek.getMonth();
        if (m !== lastMonth) {
          headers.push({
            name: firstDayOfWeek.toLocaleString('en-US', { month: 'short' }),
            colIdx: weekIdx,
          });
          lastMonth = m;
        }
      }
    });

    return headers;
  }, [gridData]);

  const hasActivity = data && data.length > 0;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-96 justify-between">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
              Activity Heatmap
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Visual map of CRM touches (creates, calls, proposal updates)
            </p>
          </div>
          <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex-shrink-0">
            <Flame size={18} />
          </div>
        </div>
      </div>

      {!hasActivity ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          No activities recorded during this period
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center select-none overflow-x-auto min-w-0 pr-1">
          {/* Calendar Heatmap Container */}
          <div className="relative w-full max-w-lg mx-auto py-2">
            
            {/* Months Row */}
            <div className="relative h-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-8 mb-1">
              {monthHeaders.map((header, idx) => (
                <span
                  key={`${header.name}-${idx}`}
                  className="absolute"
                  style={{ left: `${(header.colIdx / gridData.length) * 100}%` }}
                >
                  {header.name}
                </span>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1.5">
              {/* Row weekday labels on the left */}
              <div className="flex flex-col justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 w-6 h-28 pr-1 py-0.5">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>

              {/* Weekly columns */}
              <div className="flex-1 flex gap-1 justify-between">
                {gridData.map((week, wIdx) => (
                  <div key={`week-${wIdx}`} className="flex flex-col gap-1">
                    {week.map((day, dIdx) => (
                      <div
                        key={`day-${dIdx}`}
                        aria-label={`Activity for ${day.dateStr}`}
                        className={`w-3.5 h-3.5 rounded-sm cursor-pointer transition-all duration-150 ${getColorLevelClass(
                          day.count
                        )} hover:scale-120 hover:shadow-sm`}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Custom Interactive Tooltip */}
            <div className="h-6 mt-4 relative text-center">
              {hoveredDay ? (
                <div className="inline-block bg-slate-800 dark:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-[10px] font-semibold animate-in fade-in zoom-in duration-100 shadow-md">
                  <span className="text-blue-300">{hoveredDay.count} activities</span> on {formatDateLabel(hoveredDay.date)}
                </div>
              ) : (
                <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                  Hover over blocks to see daily CRM activity counts
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700/50 pt-3">
        <span>Daily Activity Index</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-100 dark:bg-blue-900/30" />
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-300 dark:bg-blue-700/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-700" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
