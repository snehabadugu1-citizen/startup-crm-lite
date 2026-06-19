import React from 'react';
import { Plus, List, Download } from 'lucide-react';

/**
 * A component providing quick action buttons for common dashboard tasks.
 * @returns {JSX.Element} The rendered QuickActions component
 */
export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-[#E2E8F0] p-6">
      <h3 className="text-[#0F172A] font-semibold text-lg mb-4">Quick Actions</h3>
      <div className="flex flex-col gap-3">
        <button className="flex items-center justify-center gap-2 w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus size={18} />
          Add New Lead
        </button>
        <button className="flex items-center justify-center gap-2 w-full bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#E2E8F0] px-4 py-2.5 rounded-lg font-medium transition-colors">
          <List size={18} />
          View All Leads
        </button>
        <button className="flex items-center justify-center gap-2 w-full bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#E2E8F0] px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Download size={18} />
          Export Data
        </button>
      </div>
    </div>
  );
}
