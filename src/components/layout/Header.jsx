import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import DarkModeToggle from '../common/DarkModeToggle';

export default function Header({ onMenuClick }) {
  return (
    <header className="h-14 md:h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 flex-shrink-0">

      {/* Left — Hamburger (mobile only, for slide-in drawer) + Search */}
      <div className="flex items-center gap-3">
        {/* Hamburger: visible on mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center w-11 h-11 -ml-1 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Search — hidden on smallest mobile, visible from sm+ */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl w-48 md:w-64 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all">
          <Search size={15} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-full text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Right — Toggle, notifications, avatar */}
      <div className="flex items-center gap-2 md:gap-4">
        <DarkModeToggle />

        <button className="relative flex items-center justify-center w-11 h-11 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
        </button>

        <div className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer ring-2 ring-white dark:ring-gray-800 flex-shrink-0">
          AL
        </div>
      </div>
    </header>
  );
}
