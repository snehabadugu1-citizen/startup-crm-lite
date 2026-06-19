import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark">
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md w-64 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
          <Search size={16} className="text-text-muted-light dark:text-text-muted-dark" />
          <input 
            type="text" 
            placeholder="Search leads, tasks... (⌘K)" 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors rounded-full hover:bg-background-light dark:hover:bg-background-dark">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-danger-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
        </button>
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-primary-400 flex items-center justify-center text-white text-sm font-semibold shadow-sm cursor-pointer ring-2 ring-white dark:ring-surface-dark">
          AL
        </div>
      </div>
    </header>
  );
}
