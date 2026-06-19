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
    filterType,
    setFilterType,
    customRange,
    setCustomRange,
    leads,
    metrics
  } = useAnalytics();

  const [isLoading, setIsLoading] = useState(true);

  // Simulated 500ms loading delay for premium feel and to showcase LoadingSkeleton on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // If there are no leads at all in the system, render the empty state
  if (!leads || leads.length === 0) {
    return <EmptyAnalyticsState />;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track sales performance, lead conversions, team velocity, and revenue forecasts.
          </p>
        </div>
        
        {/* Date Filter Component */}
        <AnalyticsFilters
          filterType={filterType}
          setFilterType={setFilterType}
          customRange={customRange}
          setCustomRange={setCustomRange}
        />
      </div>

      {/* KPI Stats summary row */}
      <StatsCards metrics={metrics} />

      {/* Responsive Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Row 1: Pie Chart & Funnel Chart */}
        <PieChartCard
          data={metrics.statusDistribution}
          totalLeads={metrics.totalLeads}
        />
        <FunnelChartCard data={metrics.funnelData} />

        {/* Row 2: Bar Chart & Line Chart */}
        <BarChartCard data={metrics.monthlyLeads} />
        <LineChartCard data={metrics.conversionByMonth} />

        {/* Row 3: Area Chart & Lead Sources */}
        <RevenueChartCard data={metrics.revenueByMonth} />
        <LeadSourceChart data={metrics.leadSourceStats} />

        {/* Row 4: Heatmap & Top Performers */}
        <ActivityHeatmap data={metrics.activityHeatmap} />
        <TopPerformersCard data={metrics.topPerformers} />

        {/* Row 5: Forecast & Sales Velocity */}
        <ForecastCard forecast={metrics.forecast} />
        <SalesVelocityCard
          value={metrics.salesVelocity}
          growth={metrics.growths.salesVelocity}
          leads={metrics.filteredLeads}
        />
        
      </div>
    </div>
  );
}
