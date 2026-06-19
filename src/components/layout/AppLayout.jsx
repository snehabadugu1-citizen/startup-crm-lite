import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  // Controls the slide-in drawer on mobile / tablet
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer  = useCallback(() => setDrawerOpen(true),  []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{ className: 'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700' }}
      />

      {/* ── Sidebar / Bottom nav ── */}
      <Sidebar drawerOpen={drawerOpen} onClose={closeDrawer} />

      {/* ── Backdrop (mobile drawer) ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* ── Main content column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={openDrawer} />

        <main className="flex-1 overflow-y-auto">
          {/* pb-20 on mobile to clear the fixed bottom nav bar */}
          <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
