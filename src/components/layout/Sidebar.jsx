import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Settings, X } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/',          icon: LayoutDashboard },
  { name: 'Leads',     path: '/leads',     icon: Users },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

/**
 * Shared link style factory used by both the desktop sidebar and mobile bottom nav.
 */
const sidebarLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium min-h-[44px] ${
    isActive
      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-50'
  }`;

/**
 * Bottom nav link — icon-only, centered, for the mobile fixed bar.
 */
function BottomNavLink({ item }) {
  const { icon: Icon, name, path } = item;
  return (
    <NavLink
      to={path}
      end={path === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px] transition-colors ${
          isActive
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`
      }
      aria-label={name}
    >
      {({ isActive }) => (
        <>
          <span className={`p-1.5 rounded-xl ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
            <Icon size={22} />
          </span>
          <span className="text-[10px] font-semibold">{name}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ drawerOpen, onClose }) {
  return (
    <>
      {/* ════════════════════════════════════════════
          MOBILE — Fixed Bottom Navigation Bar
          Visible only on screens < md (768px)
      ════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center safe-area-inset-bottom">
        {navItems.map((item) => (
          <BottomNavLink key={item.name} item={item} />
        ))}
      </nav>

      {/* ════════════════════════════════════════════
          MOBILE DRAWER — slides in from left
          Triggered by hamburger in Header
          Visible only on screens < md
      ════════════════════════════════════════════ */}
      <aside
        className={`
          md:hidden fixed top-0 left-0 z-40 h-full w-72 bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <LayoutDashboard size={18} />
            </div>
            CRM Lite
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer nav links */}
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-2">
            Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={sidebarLinkClass}
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full min-h-[44px]">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════
          TABLET (md) — Icon-only collapsed sidebar
          ════════════════════════════════════════════ */}
      <aside className="hidden md:flex lg:hidden w-16 flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* Brand icon */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <LayoutDashboard size={18} />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center py-4 gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              aria-label={item.name}
              className={({ isActive }) =>
                `flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'
                }`
              }
            >
              <item.icon size={20} />
            </NavLink>
          ))}
        </div>

        <div className="flex items-center justify-center pb-4">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════
          DESKTOP (lg) — Full sidebar with text labels
          ════════════════════════════════════════════ */}
      <aside className="hidden lg:flex w-60 flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* Brand */}
        <div className="p-5 h-16 flex items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <LayoutDashboard size={18} />
            </div>
            CRM Lite
          </div>
        </div>

        <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">
            Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={sidebarLinkClass}
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-50 w-full min-h-[44px]">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}
