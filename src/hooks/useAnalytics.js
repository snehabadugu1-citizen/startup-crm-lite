import { useState, useMemo } from 'react';
import { useLeads } from '../context/LeadContext';
import {
  enrichLeads,
  getStatusDistribution,
  getMonthlyLeads,
  getConversionByMonth,
  getRevenueByMonth,
  getPipelineValue,
  getWonRevenue,
  getAverageSalesCycle,
  getLostRate,
  getLeadSourceStats,
  getFunnelData,
  getSalesVelocity,
  getForecastRevenue,
  getTopPerformers,
  getActivityHeatmapData
} from '../utils/analyticsHelpers';

export function useAnalytics() {
  const { leads: rawLeads } = useLeads();

  // Filter type: '7days' | '30days' | '90days' | 'thisYear' | 'custom'
  const [filterType, setFilterType] = useState('30days');
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Enrich leads with values, owners, and dates if they are missing
  const enrichedLeads = useMemo(() => {
    return enrichLeads(rawLeads);
  }, [rawLeads]);

  // Determine date ranges for filtering
  const dateRanges = useMemo(() => {
    const now = new Date();
    // Start of today (local time)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    let currentStart = new Date();
    let currentEnd = todayEnd;
    let previousStart = new Date();
    let previousEnd = new Date();

    switch (filterType) {
      case '7days':
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(currentStart.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89, 0, 0, 0, 0);
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(currentStart.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'thisYear':
        currentStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
        break;
      case 'custom':
        if (customRange.startDate) {
          const s = new Date(customRange.startDate);
          s.setHours(0, 0, 0, 0);
          currentStart = s;
        } else {
          // Default fallback to 30 days
          currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
        }

        if (customRange.endDate) {
          const e = new Date(customRange.endDate);
          e.setHours(23, 59, 59, 999);
          currentEnd = e;
        } else {
          currentEnd = todayEnd;
        }

        // Calculate duration of custom range in milliseconds
        const duration = currentEnd.getTime() - currentStart.getTime();
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(currentStart.getTime() - duration);
        break;
      default:
        break;
    }

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd
    };
  }, [filterType, customRange]);

  // Filter current period leads
  const filteredLeads = useMemo(() => {
    const { currentStart, currentEnd } = dateRanges;
    return enrichedLeads.filter((lead) => {
      const d = new Date(lead.createdAt);
      return !isNaN(d.getTime()) && d >= currentStart && d <= currentEnd;
    });
  }, [enrichedLeads, dateRanges]);

  // Filter previous period leads (for calculations of trend comparison)
  const previousPeriodLeads = useMemo(() => {
    const { previousStart, previousEnd } = dateRanges;
    return enrichedLeads.filter((lead) => {
      const d = new Date(lead.createdAt);
      return !isNaN(d.getTime()) && d >= previousStart && d <= previousEnd;
    });
  }, [enrichedLeads, dateRanges]);

  // Compute all metrics memoized
  const metrics = useMemo(() => {
    // Current period metrics
    const totalLeads = filteredLeads.length;
    const statusDistribution = getStatusDistribution(filteredLeads);
    const monthlyLeads = getMonthlyLeads(filteredLeads);
    const conversionByMonth = getConversionByMonth(filteredLeads);
    const revenueByMonth = getRevenueByMonth(filteredLeads);
    const pipelineValue = getPipelineValue(filteredLeads);
    const wonRevenue = getWonRevenue(filteredLeads);
    const averageSalesCycle = getAverageSalesCycle(filteredLeads);
    const lostRate = getLostRate(filteredLeads);
    const leadSourceStats = getLeadSourceStats(filteredLeads);
    const funnelData = getFunnelData(filteredLeads);
    const salesVelocity = getSalesVelocity(filteredLeads);
    const forecast = getForecastRevenue(filteredLeads);
    const topPerformers = getTopPerformers(filteredLeads);
    const activityHeatmap = getActivityHeatmapData(filteredLeads);

    // Calculate conversion rate: Won / Total
    const wonLeadsCount = filteredLeads.filter(l => l.status === 'Won').length;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeadsCount / totalLeads) * 100) : 0;

    // Previous period metrics (for comparison)
    const prevTotalLeads = previousPeriodLeads.length;
    const prevWonLeadsCount = previousPeriodLeads.filter(l => l.status === 'Won').length;
    const prevConversionRate = prevTotalLeads > 0 ? Math.round((prevWonLeadsCount / prevTotalLeads) * 100) : 0;
    const prevPipelineValue = getPipelineValue(previousPeriodLeads);
    const prevWonRevenue = getWonRevenue(previousPeriodLeads);
    const prevAverageSalesCycle = getAverageSalesCycle(previousPeriodLeads);
    const prevLostRate = getLostRate(previousPeriodLeads);
    const prevSalesVelocity = getSalesVelocity(previousPeriodLeads);

    // Calculate percentage growths
    const getGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const growths = {
      totalLeads: getGrowth(totalLeads, prevTotalLeads),
      conversionRate: conversionRate - prevConversionRate, // Direct point change is better for rates
      pipelineValue: getGrowth(pipelineValue, prevPipelineValue),
      wonRevenue: getGrowth(wonRevenue, prevWonRevenue),
      averageSalesCycle: averageSalesCycle - prevAverageSalesCycle, // Day difference
      lostRate: lostRate - prevLostRate, // Direct point change
      salesVelocity: getGrowth(salesVelocity, prevSalesVelocity)
    };

    return {
      totalLeads,
      conversionRate,
      pipelineValue,
      wonRevenue,
      averageSalesCycle,
      lostRate,
      statusDistribution,
      monthlyLeads,
      conversionByMonth,
      revenueByMonth,
      leadSourceStats,
      funnelData,
      salesVelocity,
      forecast,
      topPerformers,
      activityHeatmap,
      growths
    };
  }, [filteredLeads, previousPeriodLeads]);

  return {
    filterType,
    setFilterType,
    customRange,
    setCustomRange,
    leads: enrichedLeads,
    filteredLeads,
    metrics
  };
}
