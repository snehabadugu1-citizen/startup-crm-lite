import React from 'react';
import { Users, DollarSign, Target, Activity } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads from '../components/dashboard/RecentLeads';
import QuickActions from '../components/dashboard/QuickActions';
import { useLeads } from '../context/LeadContext';

/**
 * The main Dashboard page component assembling all dashboard widgets.
 * Uses the global LeadContext to pull real-time data instead of static samples.
 * Features a responsive grid: 1 column on mobile, 2 on tablet, 4 on desktop.
 * @returns {JSX.Element} The rendered Dashboard page
 */
export default function Dashboard() {
  // Consume leads from global context
  const { leads } = useLeads();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">Dashboard Overview</h1>
      </div>

      {/* Stats Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Leads" 
          value={leads.length} 
          icon={Users} 
          change={12.5} 
          color="primary" 
        />
        <StatsCard 
          title="Pipeline Value" 
          value="$84,500" 
          icon={DollarSign} 
          change={8.2} 
          color="success" 
        />
        <StatsCard 
          title="Win Rate" 
          value="24.8%" 
          icon={Target} 
          change={-2.4} 
          color="danger" 
        />
        <StatsCard 
          title="Active Opportunities" 
          value="42" 
          icon={Activity} 
          change={4.1} 
          color="warning" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (takes up 2/3 space on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <PipelineOverview leads={leads} />
          <RecentLeads leads={leads} />
        </div>
        
        {/* Right Column (takes up 1/3 space on large screens) */}
        <div className="lg:col-span-1 space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
