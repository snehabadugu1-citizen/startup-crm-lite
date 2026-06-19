import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import StatsCards from '../components/analytics/StatsCards';
import PieChartCard from '../components/analytics/PieChartCard';
import FunnelChartCard from '../components/analytics/FunnelChartCard';
import BarChartCard from '../components/analytics/BarChartCard';
import LineChartCard from '../components/analytics/LineChartCard';
import RevenueChartCard from '../components/analytics/RevenueChartCard';
import LeadSourceChart from '../components/analytics/LeadSourceChart';
import SalesVelocityCard from '../components/analytics/SalesVelocityCard';
import ForecastCard from '../components/analytics/ForecastCard';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import TopPerformersCard from '../components/analytics/TopPerformersCard';
import EmptyAnalyticsState from '../components/analytics/EmptyAnalyticsState';
import LoadingSkeleton from '../components/analytics/LoadingSkeleton';

export default function Analytics() {
  const {
    filterType, setFilterType,
    customRange, setCustomRange,
    leads, filteredLeads, metrics,
  } = useAnalytics();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <LoadingSkeleton />;
  if (!leads || leads.length === 0) return <EmptyAnalyticsState />;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header + Filters ──
          Mobile:  stacked column
          Desktop: side-by-side
      */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track sales performance, conversions, team velocity, and revenue forecasts.
          </p>
        </div>
        <div className="flex-shrink-0">
          <AnalyticsFilters
            filterType={filterType}
            setFilterType={setFilterType}
            customRange={customRange}
            setCustomRange={setCustomRange}
          />
        </div>
      </div>

      {/* ── KPI Cards ─── */}
      <StatsCards metrics={metrics} />

      {/* ── Chart Grid ──
          Mobile:  1 column (stacked)
          Tablet:  2 columns (md:)
          Desktop: 2 columns, charts side-by-side (lg: kept at 2 for readability)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <PieChartCard   data={metrics.statusDistribution} totalLeads={metrics.totalLeads} />
        <FunnelChartCard data={metrics.funnelData} />

        <BarChartCard    data={metrics.monthlyLeads} />
        <LineChartCard   data={metrics.conversionByMonth} />

        <RevenueChartCard data={metrics.revenueByMonth} />
        <LeadSourceChart  data={metrics.leadSourceStats} />

        <ActivityHeatmap  data={metrics.activityHeatmap} />
        <TopPerformersCard data={metrics.topPerformers} />

        <ForecastCard     forecast={metrics.forecast} />
        <SalesVelocityCard
          value={metrics.salesVelocity}
          growth={metrics.growths.salesVelocity}
          leads={filteredLeads}
        />
      </div>
    </div>
  );
}
