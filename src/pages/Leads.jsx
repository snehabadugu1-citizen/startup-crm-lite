import React, { useState } from 'react';
import { Plus, X, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import LeadTable from '../components/leads/LeadTable';
import LeadCard from '../components/leads/LeadCard';
import LeadForm from '../components/leads/LeadForm';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import EmptyState from '../components/common/EmptyState';
import { useLeads } from '../context/LeadContext';

export default function Leads() {
  const { leads, addLead, updateLead, deleteLead } = useLeads();

  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  // Default view: 'table' on desktop, but on mobile the table is hidden
  // and cards are always shown — the toggle only matters on tablet+
  const [viewMode, setViewMode] = useState('table');

  const filteredLeads = leads
    .filter(lead => activeFilter === 'All' || lead.status === activeFilter)
    .filter(lead =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleClearFilters = () => { setSearchQuery(''); setActiveFilter('All'); };
  const handleAddClick     = () => { setSelectedLead(null); setIsModalOpen(true); };
  const handleEditClick    = (lead) => { setSelectedLead(lead); setIsModalOpen(true); };
  const handleDeleteClick  = (id) => {
    if (window.confirm('Delete this lead? This cannot be undone.')) {
      deleteLead(id);
      toast.error('Lead deleted', { icon: '🗑️' });
    }
  };
  const handleFormSubmit = (formData) => {
    if (selectedLead) {
      updateLead(selectedLead.id, formData);
      toast.success('Lead updated');
    } else {
      addLead(formData);
      toast.success('Lead created');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Lead Management
        </h1>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* View toggle — tablet+ only (md:) */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-xl border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              aria-label="Table view"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm min-h-[44px] text-sm sm:text-base"
          >
            <Plus size={18} />
            <span className="hidden xs:inline">Add Lead</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter bar ── */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} leads={leads} />
      </div>

      {/* ── Lead list ── */}
      {filteredLeads.length === 0 ? (
        <EmptyState totalLeads={leads.length} onClearFilters={handleClearFilters} />
      ) : (
        <>
          {/* 
              Desktop table: visible on md+ when viewMode === 'table'
              We always show it on md+ unless user switched to grid mode.
          */}
          {viewMode === 'table' && (
            <div className="hidden md:block">
              <LeadTable leads={filteredLeads} onEdit={handleEditClick} onDelete={handleDeleteClick} />
            </div>
          )}

          {/*
              Card grid:
              - Mobile (< md): ALWAYS shown — this is the only view
              - Tablet+ grid mode: shown
              - Tablet+ table mode: hidden (handled by md:block above)
          */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 ${
            viewMode === 'table' ? 'md:hidden' : ''
          }`}>
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onEdit={handleEditClick} onDelete={handleDeleteClick} />
            ))}
          </div>
        </>
      )}

      {/* ── Add/Edit Modal ──
          Mobile:  full-screen, no rounding
          Tablet+: centered modal with max-w-lg, rounded, backdrop
      */}
      {isModalOpen && (
        <>
          {/* Backdrop — tablet+ only */}
          <div className="hidden sm:block fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

          {/* Panel */}
          <div className="
            fixed inset-0 z-50 flex flex-col
            bg-white dark:bg-gray-800
            sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
            sm:w-full sm:max-w-lg sm:max-h-[90vh] sm:rounded-2xl sm:shadow-xl
            overflow-hidden
          ">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50">
                {selectedLead ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex items-center justify-center w-11 h-11 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="flex-1 overflow-y-auto p-5">
              <LeadForm
                initialData={selectedLead}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
