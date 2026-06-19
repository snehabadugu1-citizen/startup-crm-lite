/**
 * Deterministically enriches lead objects with missing properties
 * (like value, owner, wonAt, meetingAt, contactedAt, proposalAt)
 * based on their ID and status. This provides realistic dashboard metrics.
 * 
 * @param {Array} leads - The raw leads array from context
 * @returns {Array} Enriched leads
 */
export function enrichLeads(leads) {
  if (!Array.isArray(leads)) return [];

  const OWNERS = ["Sarah", "Alex", "David", "Emily", "Michael"];
  const SOURCES = ["Website", "Referral", "LinkedIn", "Instagram", "Ads", "Cold Email", "Cold Call", "Email Campaign", "Other"];

  return leads.map((lead, idx) => {
    // Generate a deterministic integer from the lead id or index to use as a seed
    const seed = lead.id ? lead.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : idx;
    
    // Status mapping
    const status = lead.status || "New";

    // Value generation (deterministic between 10k and 150k based on status)
    let value = Number(lead.value);
    if (isNaN(value) || value === 0) {
      if (status === "Won") {
        value = 30000 + (seed % 12) * 10000; // 30,000 - 140,000
      } else if (status === "Proposal Sent" || status === "Proposal") {
        value = 25000 + (seed % 10) * 8000;  // 25,000 - 97,000
      } else if (status === "Meeting Scheduled" || status === "Meeting") {
        value = 20000 + (seed % 8) * 6000;   // 20,000 - 62,000
      } else if (status === "Contacted") {
        value = 15000 + (seed % 6) * 5000;   // 15,000 - 40,000
      } else if (status === "Lost") {
        value = 10000 + (seed % 8) * 8000;   // 10,000 - 66,000
      } else {
        value = 8000 + (seed % 5) * 4000;    // 8,000 - 24,000
      }
    }

    // Owner generation
    const owner = lead.owner || OWNERS[seed % OWNERS.length];

    // Source normalization (fallback to a default list source if invalid)
    let source = lead.source || "Website";
    if (!SOURCES.includes(source)) {
      if (source === "Cold Call" || source === "Email Campaign") {
        // Keep it as is since it's valid in the CRM
      } else {
        source = SOURCES[seed % SOURCES.length];
      }
    }

    // Date generation
    const createdAtStr = lead.createdAt || new Date(Date.now() - (seed % 60) * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date(createdAtStr);
    
    // Deterministic progression dates
    let contactedAt = lead.contactedAt;
    let meetingAt = lead.meetingAt;
    let proposalAt = lead.proposalAt;
    let wonAt = lead.wonAt;
    let lostAt = lead.lostAt;

    const oneDay = 24 * 60 * 60 * 1000;

    if (!contactedAt && ["Contacted", "Meeting Scheduled", "Meeting", "Proposal Sent", "Proposal", "Won", "Lost"].includes(status)) {
      contactedAt = new Date(createdAt.getTime() + (1 + (seed % 2)) * oneDay).toISOString();
    }
    if (!meetingAt && ["Meeting Scheduled", "Meeting", "Proposal Sent", "Proposal", "Won", "Lost"].includes(status)) {
      meetingAt = new Date(createdAt.getTime() + (3 + (seed % 3)) * oneDay).toISOString();
    }
    if (!proposalAt && ["Proposal Sent", "Proposal", "Won", "Lost"].includes(status)) {
      proposalAt = new Date(createdAt.getTime() + (6 + (seed % 4)) * oneDay).toISOString();
    }
    if (status === "Won" && !wonAt) {
      wonAt = new Date(createdAt.getTime() + (10 + (seed % 10)) * oneDay).toISOString();
    }
    if (status === "Lost" && !lostAt) {
      lostAt = new Date(createdAt.getTime() + (8 + (seed % 8)) * oneDay).toISOString();
    }

    return {
      ...lead,
      value,
      owner,
      source,
      createdAt: createdAtStr,
      contactedAt,
      meetingAt,
      proposalAt,
      wonAt,
      lostAt
    };
  });
}

/**
 * Normalizes status names to fit chart specifications
 */
function normalizeStatus(status) {
  if (status === "Meeting Scheduled") return "Meeting";
  if (status === "Proposal Sent") return "Proposal";
  return status;
}

/**
 * Returns lead count by status
 */
export function getStatusDistribution(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return [];

  const counts = {};
  leads.forEach((l) => {
    const status = normalizeStatus(l.status || "New");
    counts[status] = (counts[status] || 0) + 1;
  });

  const total = leads.length;

  return Object.keys(counts).map((status) => ({
    name: status,
    value: counts[status],
    percentage: Math.round((counts[status] / total) * 100),
  }));
}

/**
 * Helper to get chronological list of last 6 months ending in current month
 */
function getLast6MonthsList() {
  const list = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en-US", { month: "short" });
    list.push({
      label,
      month: d.getMonth(),
      year: d.getFullYear(),
    });
  }
  return list;
}

/**
 * Calculates lead count per month for the last 6 months
 */
export function getMonthlyLeads(leads) {
  const months = getLast6MonthsList();
  if (!Array.isArray(leads)) return months.map(m => ({ name: m.label, "Lead Count": 0 }));

  const data = months.map((m) => {
    const count = leads.filter((lead) => {
      const d = new Date(lead.createdAt);
      return !isNaN(d.getTime()) && d.getMonth() === m.month && d.getFullYear() === m.year;
    }).length;

    return {
      name: m.label,
      "Lead Count": count,
    };
  });

  return data;
}

/**
 * Calculates won lead conversion rate by month for the last 6 months
 */
export function getConversionByMonth(leads) {
  const months = getLast6MonthsList();
  if (!Array.isArray(leads)) return months.map(m => ({ name: m.label, "Conversion Rate": 0 }));

  const data = months.map((m) => {
    const monthLeads = leads.filter((lead) => {
      const d = new Date(lead.createdAt);
      return !isNaN(d.getTime()) && d.getMonth() === m.month && d.getFullYear() === m.year;
    });

    const total = monthLeads.length;
    const won = monthLeads.filter((lead) => lead.status === "Won").length;
    const rate = total > 0 ? Math.round((won / total) * 100) : 0;

    return {
      name: m.label,
      "Conversion Rate": rate,
    };
  });

  return data;
}

/**
 * Calculates won revenue by month for the last 6 months
 */
export function getRevenueByMonth(leads) {
  const months = getLast6MonthsList();
  if (!Array.isArray(leads)) return months.map(m => ({ name: m.label, Revenue: 0 }));

  const data = months.map((m) => {
    const wonMonthLeads = leads.filter((lead) => {
      if (lead.status !== "Won") return false;
      const refDateStr = lead.wonAt || lead.createdAt;
      const d = new Date(refDateStr);
      return !isNaN(d.getTime()) && d.getMonth() === m.month && d.getFullYear() === m.year;
    });

    const sum = wonMonthLeads.reduce((acc, lead) => acc + (Number(lead.value) || 0), 0);

    return {
      name: m.label,
      Revenue: sum,
    };
  });

  return data;
}

/**
 * Sums values of all active leads (excludes Won and Lost)
 */
export function getPipelineValue(leads) {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter((l) => !["Won", "Lost"].includes(l.status))
    .reduce((acc, l) => acc + (Number(l.value) || 0), 0);
}

/**
 * Sums values of Won leads
 */
export function getWonRevenue(leads) {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter((l) => l.status === "Won")
    .reduce((acc, l) => acc + (Number(l.value) || 0), 0);
}

/**
 * Calculates the average sales cycle in days for Won leads
 */
export function getAverageSalesCycle(leads) {
  if (!Array.isArray(leads)) return 0;
  const wonLeads = leads.filter((l) => l.status === "Won");
  if (wonLeads.length === 0) return 0;

  let totalDays = 0;
  let count = 0;

  wonLeads.forEach((lead) => {
    const start = new Date(lead.createdAt);
    const end = lead.wonAt ? new Date(lead.wonAt) : null;
    
    if (end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffTime = Math.max(0, end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDays += diffDays;
      count++;
    }
  });

  return count > 0 ? Math.round(totalDays / count) : 0;
}

/**
 * Calculates percentage rate of Lost leads
 */
export function getLostRate(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return 0;
  const lost = leads.filter((l) => l.status === "Lost").length;
  return Math.round((lost / leads.length) * 100);
}

/**
 * Aggregates and sorts lead counts by source
 */
export function getLeadSourceStats(leads) {
  if (!Array.isArray(leads)) return [];

  const sourceMap = {};
  leads.forEach((l) => {
    const src = l.source || "Other";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });

  return Object.keys(sourceMap)
    .map((source) => ({
      source,
      count: sourceMap[source],
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculates sales funnel counts, conversion, and drop-off percentages
 */
export function getFunnelData(leads) {
  const data = [
    { stage: "New", count: 0, conversion: 100, dropoff: 0 },
    { stage: "Contacted", count: 0, conversion: 0, dropoff: 0 },
    { stage: "Meeting", count: 0, conversion: 0, dropoff: 0 },
    { stage: "Proposal", count: 0, conversion: 0, dropoff: 0 },
    { stage: "Won", count: 0, conversion: 0, dropoff: 0 },
  ];

  if (!Array.isArray(leads) || leads.length === 0) return data;

  leads.forEach((l) => {
    const status = normalizeStatus(l.status || "New");

    // All leads are "New" stage
    data[0].count++;

    // Cumulative funnel: if a lead is Contacted or later
    if (["Contacted", "Meeting", "Proposal", "Won"].includes(status)) {
      data[1].count++;
    }
    // If a lead is Meeting or later
    if (["Meeting", "Proposal", "Won"].includes(status)) {
      data[2].count++;
    }
    // If a lead is Proposal or later
    if (["Proposal", "Won"].includes(status)) {
      data[3].count++;
    }
    // If a lead is Won
    if (status === "Won") {
      data[4].count++;
    }
  });

  const total = data[0].count;

  // Calculate percentages
  for (let i = 1; i < data.length; i++) {
    const prevCount = data[i - 1].count;
    const currCount = data[i].count;

    // Conversion rate relative to total (top of funnel)
    const overallConversion = total > 0 ? Math.round((currCount / total) * 100) : 0;
    
    // Drop-off rate relative to previous stage
    const conversionFromPrev = prevCount > 0 ? (currCount / prevCount) : 0;
    const dropoff = prevCount > 0 ? Math.round((1 - conversionFromPrev) * 100) : 0;

    data[i].conversion = overallConversion;
    data[i].dropoff = dropoff;
  }

  return data;
}

/**
 * Calculates Sales Velocity = (Opportunities * Win Rate * Avg Deal Size) / Sales Cycle Length
 */
export function getSalesVelocity(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return 0;

  // Opportunities are active deals (excluding Won & Lost)
  const opps = leads.filter((l) => !["Won", "Lost"].includes(l.status)).length;
  
  // Win rate = Won / Total
  const wonLeads = leads.filter((l) => l.status === "Won");
  const winRate = wonLeads.length / leads.length;

  // Avg Deal Size = average value of Won leads (fallback to average of all leads)
  let avgDealSize = 0;
  if (wonLeads.length > 0) {
    avgDealSize = wonLeads.reduce((acc, l) => acc + (Number(l.value) || 0), 0) / wonLeads.length;
  } else {
    avgDealSize = leads.reduce((acc, l) => acc + (Number(l.value) || 0), 0) / leads.length;
  }

  // Avg Sales Cycle Length in days
  const avgSalesCycle = getAverageSalesCycle(leads) || 15; // default to 15 days to avoid division by 0

  if (avgSalesCycle === 0) return 0;

  const velocity = (opps * winRate * avgDealSize) / avgSalesCycle;
  return Math.round(velocity);
}

/**
 * Forecasts next month's revenue using average of last 6 months
 */
export function getForecastRevenue(leads) {
  const monthlyRevenueData = getRevenueByMonth(leads);
  
  const sum = monthlyRevenueData.reduce((acc, m) => acc + m.Revenue, 0);
  const avg = Math.round(sum / 6);

  // Confidence score calculation: based on consistency of monthly revenue and active pipeline strength
  // More active proposal/meetings = higher confidence
  const pipelineValue = getPipelineValue(leads);
  const proposalLeadsCount = leads.filter(l => normalizeStatus(l.status) === "Proposal").length;
  
  let confidenceScore = 60 + Math.min(30, proposalLeadsCount * 10);
  if (pipelineValue > avg * 1.5) {
    confidenceScore = Math.min(98, confidenceScore + 10);
  }

  // Growth Trend (comparing average with last month's revenue)
  const lastMonthRev = monthlyRevenueData[5]?.Revenue || 0;
  const growthTrend = lastMonthRev > 0 ? Math.round(((lastMonthRev - avg) / lastMonthRev) * 100) : 0;

  return {
    predictedRevenue: avg,
    confidenceScore: Math.round(confidenceScore),
    growthTrend,
  };
}

/**
 * Groups and ranks owners by Won revenue
 */
export function getTopPerformers(leads) {
  if (!Array.isArray(leads)) return [];

  const repMap = {};
  leads.forEach((l) => {
    if (l.status === "Won") {
      const rep = l.owner || "Unassigned";
      repMap[rep] = (repMap[rep] || 0) + (Number(l.value) || 0);
    }
  });

  return Object.keys(repMap)
    .map((name) => ({
      name,
      value: repMap[name],
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Returns GitHub-style contribution heatmap structure
 */
export function getActivityHeatmapData(leads) {
  const activityMap = {};

  if (!Array.isArray(leads)) return [];

  leads.forEach((l) => {
    const dates = [
      l.createdAt,
      l.contactedAt,
      l.meetingAt,
      l.proposalAt,
      l.wonAt,
      l.lostAt,
    ].filter(Boolean);

    dates.forEach((dateStr) => {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
        activityMap[key] = (activityMap[key] || 0) + 1;
      }
    });
  });

  return Object.keys(activityMap).map((date) => ({
    date,
    count: activityMap[date],
  }));
}
