import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/**
 * A reusable debounced search bar component.
 * 
 * @param {Object} props
 * @param {string} props.value - The controlled search value
 * @param {Function} props.onChange - Callback fired with the debounced value
 * @returns {JSX.Element}
 */
export default function SearchBar({ value, onChange }) {
  // Local state to capture user input immediately for snappy typing feedback
  const [localValue, setLocalValue] = useState(value);

  // Debounce the input: Wait 300ms after the user stops typing before firing the parent's onChange
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, 300);

    // Cleanup timeout if the user types again before 300ms
    return () => clearTimeout(handler);
  }, [localValue, onChange]);

  // Sync local state if parent value changes externally (e.g., clearing filters)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative w-full md:w-96">
      {/* Search Icon Container */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
        <Search size={18} />
      </div>
      
      {/* Search Input Field */}
      <input
        type="text"
        aria-label="Search leads"
        placeholder="Search by name, company, or email..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="block w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
      />
      
      {/* Clear Button (only visible when there's text) */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
