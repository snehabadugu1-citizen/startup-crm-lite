import React from 'react';
import { Users, DollarSign, Target, Activity } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads from '../components/dashboard/RecentLeads';
import QuickActions from '../components/dashboard/QuickActions';
import { useLeads } from '../context/LeadContext';

export default function Dashboard() {
  const { leads } = useLeads();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
          Dashboard Overview
        </h1>
      </div>

      {/* Stats Grid
          Mobile:  1 column (default)
          Tablet:  2 columns (sm:)
          Desktop: 4 columns (lg:)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard title="Total Leads"          value={leads.length} icon={Users}      change={12.5}  color="primary" />
        <StatsCard title="Pipeline Value"       value="₹84,500"      icon={DollarSign} change={8.2}   color="success" />
        <StatsCard title="Win Rate"             value="24.8%"        icon={Target}     change={-2.4}  color="danger"  />
        <StatsCard title="Active Opportunities" value="42"           icon={Activity}   change={4.1}   color="warning" />
      </div>

      {/* Main Content Grid
          Mobile:  single column (default)
          Desktop: 3 columns — 2 for main + 1 for sidebar widgets (lg:)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <PipelineOverview leads={leads} />
          <RecentLeads leads={leads} />
        </div>
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
