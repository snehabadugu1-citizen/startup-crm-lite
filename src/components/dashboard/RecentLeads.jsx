import React from 'react';

export default function RecentLeads({ leads }) {
  const recentLeads = leads.slice(0, 5);

  const getStatusBadge = (status) => {
    const map = {
      'New':               'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
      'Contacted':         'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
      'Meeting Scheduled': 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
      'Proposal Sent':     'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
      'Won':               'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
      'Lost':              'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
    };
    const cls = map[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-gray-900 dark:text-gray-50 font-semibold text-lg">Recent Leads</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{lead.name}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{lead.company}</td>
                <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{lead.dateAdded || '—'}</td>
              </tr>
            ))}
            {recentLeads.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No recent leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
