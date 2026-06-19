import React from 'react';
import { Pencil, Trash2, Mail, Phone, Building2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * Displays a single lead in a responsive card format. Ideal for mobile views.
 * 
 * @param {Object} props
 * @param {Object} props.lead - The lead data object
 * @param {Function} props.onEdit - Callback when the edit button is clicked
 * @param {Function} props.onDelete - Callback when the delete button is clicked
 * @returns {JSX.Element}
 */
export default function LeadCard({ lead, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{lead.name}</h3>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
            <Building2 size={14} />
            <span>{lead.company}</span>
          </div>
        </div>
        <StatusBadge status={lead.status} />
      </div>
      
      <div className="space-y-2 mt-2 mb-4 text-sm text-gray-600 flex-1">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-400" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-gray-400" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
        <button 
          onClick={() => onEdit(lead)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors"
          aria-label={`Edit ${lead.name}`}
        >
          <Pencil size={14} />
          Edit
        </button>
        <button 
          onClick={() => onDelete(lead.id)}
          className="flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          aria-label={`Delete ${lead.name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
