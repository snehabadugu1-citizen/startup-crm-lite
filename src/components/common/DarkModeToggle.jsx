import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Animated toggle switch that switches between light and dark mode.
 * Consumes ThemeContext — must be rendered inside ThemeProvider.
 */
export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Light mode' : 'Dark mode'}
      className={`
        relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer items-center
        rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2
        focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
        ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}
      `}
    >
      {/* Sliding thumb with icon */}
      <span
        className={`
          pointer-events-none inline-flex h-6 w-6 items-center justify-center
          transform rounded-full bg-white shadow-md ring-0
          transition-transform duration-200 ease-in-out
          ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {isDarkMode ? (
          <Moon size={13} className="text-blue-600" />
        ) : (
          <Sun size={13} className="text-amber-500" />
        )}
      </span>
    </button>
  );
}
