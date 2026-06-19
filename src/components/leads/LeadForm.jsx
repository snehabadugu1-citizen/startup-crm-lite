import React, { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const SOURCE_OPTIONS = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

const inputBase =
  'w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';

const labelBase = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

export default function LeadForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '', company: '', email: '', phone: '', status: 'New', source: 'Website',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim())    newErrors.name    = 'Name is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.email.trim())   newErrors.email   = 'Email is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Name */}
        <div className="col-span-1 sm:col-span-2">
          <label htmlFor="name" className={labelBase}>Name *</label>
          <input
            type="text" id="name" name="name"
            value={formData.name} onChange={handleChange}
            className={`${inputBase} ${errors.name ? 'border-rose-500 dark:border-rose-400' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {errors.name && <p className="mt-1 text-sm text-rose-500 dark:text-rose-400">{errors.name}</p>}
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className={labelBase}>Company *</label>
          <input
            type="text" id="company" name="company"
            value={formData.company} onChange={handleChange}
            className={`${inputBase} ${errors.company ? 'border-rose-500 dark:border-rose-400' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {errors.company && <p className="mt-1 text-sm text-rose-500 dark:text-rose-400">{errors.company}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelBase}>Email *</label>
          <input
            type="email" id="email" name="email"
            value={formData.email} onChange={handleChange}
            className={`${inputBase} ${errors.email ? 'border-rose-500 dark:border-rose-400' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {errors.email && <p className="mt-1 text-sm text-rose-500 dark:text-rose-400">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="col-span-1 sm:col-span-2">
          <label htmlFor="phone" className={labelBase}>Phone</label>
          <input
            type="tel" id="phone" name="phone"
            value={formData.phone} onChange={handleChange}
            className={`${inputBase} border-gray-300 dark:border-gray-600`}
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className={labelBase}>Status</label>
          <select
            id="status" name="status"
            value={formData.status} onChange={handleChange}
            className={`${inputBase} border-gray-300 dark:border-gray-600`}
          >
            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className={labelBase}>Source</label>
          <select
            id="source" name="source"
            value={formData.source} onChange={handleChange}
            className={`${inputBase} border-gray-300 dark:border-gray-600`}
          >
            {SOURCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
