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
  // Consume leads and CRUD operations from global context
  const { leads, addLead, updateLead, deleteLead } = useLeads();
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // --- Derived State: Compute the filtered leads for rendering ---
  const filteredLeads = leads
    // 1. Filter by Status Pill
    .filter(lead => activeFilter === 'All' || lead.status === activeFilter)
    // 2. Filter by Search Query (Name, Company, or Email)
    .filter(lead => 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) 
    );

  // --- Handlers ---
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilter('All');
  };

  const handleAddClick = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      deleteLead(id); // Using context method
      toast.error('Lead deleted successfully', { icon: '🗑️' });
    }
  };

  const handleFormSubmit = (formData) => {
    if (selectedLead) {
      updateLead(selectedLead.id, formData); // Using context method
      toast.success('Lead updated successfully');
    } else {
      addLead(formData); // Using context method
      toast.success('Lead created successfully');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Lead Management</h1>
        
        <div className="flex items-center gap-3">
          {/* View Toggle (hidden on mobile) */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
              aria-label="Table View"
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
              aria-label="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <button 
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus size={18} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <FilterBar 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
          leads={leads} 
        />
      </div>

      {/* Main Content Area */}
      <div>
        {filteredLeads.length === 0 ? (
          <EmptyState 
            totalLeads={leads.length} 
            onClearFilters={handleClearFilters} 
          />
        ) : (
          <>
            {/* Desktop Table View */}
            {viewMode === 'table' && (
              <div className="hidden md:block">
                <LeadTable 
                  leads={filteredLeads} 
                  onEdit={handleEditClick} 
                  onDelete={handleDeleteClick} 
                />
              </div>
            )}

            {/* Mobile Cards / Desktop Grid View */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${viewMode === 'table' ? 'md:hidden' : ''}`}>
              {filteredLeads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onEdit={handleEditClick} 
                  onDelete={handleDeleteClick} 
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Lead Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl my-8 mx-auto relative flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {selectedLead ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <LeadForm 
                initialData={selectedLead} 
                onSubmit={handleFormSubmit} 
                onCancel={() => setIsModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
