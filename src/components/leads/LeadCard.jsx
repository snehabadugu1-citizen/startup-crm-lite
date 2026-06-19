import React from 'react';
import { Pencil, Trash2, Mail, Phone, Building2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function LeadCard({ lead, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">{lead.name}</h3>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mt-1">
            <Building2 size={14} />
            <span>{lead.company}</span>
          </div>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="space-y-2 mt-2 mb-4 text-sm text-gray-600 dark:text-gray-400 flex-1">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-400 dark:text-gray-500" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-gray-400 dark:text-gray-500" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <button
          onClick={() => onEdit(lead)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
          aria-label={`Edit ${lead.name}`}
        >
          <Pencil size={14} />
          Edit
        </button>
        <button
          onClick={() => onDelete(lead.id)}
          className="flex items-center justify-center p-2 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg transition-colors"
          aria-label={`Delete ${lead.name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
