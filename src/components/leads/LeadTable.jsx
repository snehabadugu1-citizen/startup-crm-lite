import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * A dense table view for displaying leads on desktop screens.
 * 
 * @param {Object} props
 * @param {Array} props.leads - Array of lead data objects
 * @param {Function} props.onEdit - Callback when the edit action is clicked
 * @param {Function} props.onDelete - Callback when the delete action is clicked
 * @returns {JSX.Element}
 */
export default function LeadTable({ leads, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Name</th>
              <th scope="col" className="px-6 py-4 font-medium">Company</th>
              <th scope="col" className="px-6 py-4 font-medium">Status</th>
              <th scope="col" className="px-6 py-4 font-medium">Email</th>
              <th scope="col" className="px-6 py-4 font-medium">Source</th>
              <th scope="col" className="px-6 py-4 font-medium">Date Added</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {leads.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No leads found. Click "Add Lead" to get started.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.dateAdded}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => onEdit(lead)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        aria-label={`Edit ${lead.name}`}
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(lead.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label={`Delete ${lead.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
