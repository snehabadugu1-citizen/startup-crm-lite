// src/components/layout/Sidebar.jsx
// Import React to define the component
import React from 'react';
// Import NavLink from react-router-dom. 
// NavLink is special because it knows if it is "active" based on the current URL.
import { NavLink } from 'react-router-dom';
// Import specific SVG icons from the lucide-react icon library
import { LayoutDashboard, Users, BarChart3, Settings } from 'lucide-react';

// Define an array of navigation items to map over, keeping the code DRY.
// Each item has a display name, a route path, and an icon component.
const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Leads', path: '/leads', icon: Users },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

// Define and export the Sidebar component
export default function Sidebar() {
  return (
    // The <aside> element defines the sidebar container.
    // Fixed width (w-64), flexbox column layout, and hidden on small screens (hidden md:flex)
    <aside className="w-64 border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex flex-col h-full hidden md:flex">
      
      {/* Sidebar Header Section (Brand/Logo Area) */}
      <div className="p-6 h-16 flex items-center border-b border-border-light dark:border-border-dark">
        {/* Brand Text & Logo container */}
        <div className="flex items-center gap-2 text-primary-500 font-bold text-lg tracking-tight">
          {/* Logo icon box with primary background and white icon */}
          <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center">
            <LayoutDashboard size={18} />
          </div>
          {/* Brand Name */}
          CRM Lite
        </div>
      </div>
      
      {/* Main Navigation Links Container (flex-1 makes it take up remaining vertical space) */}
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {/* Section title for the navigation */}
        <div className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider mb-4 px-2">
          Menu
        </div>
        
        {/* Iterate over the navItems array to generate navigation links dynamically */}
        {navItems.map((item) => (
          // NavLink automatically passes an 'isActive' boolean to its className function
          // This allows us to conditionally apply styles when the route matches the path
          <NavLink
            key={item.name}
            to={item.path}
            // The className is a function receiving 'isActive'.
            // If active, it applies a primary-tinted background. 
            // If inactive, it applies a transparent background with a hover effect.
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/20'
                  : 'text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }`
            }
          >
            {/* Render the icon component passed from the configuration array */}
            <item.icon size={18} />
            {/* Render the navigation label */}
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Sidebar Footer Section (Settings button locked to the bottom) */}
      <div className="p-4 border-t border-border-light dark:border-border-dark">
        {/* Standard button styled to look like a nav item, but acting as an action */}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary-light dark:hover:text-text-primary-dark w-full">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  );
}
