// src/routes/index.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Central routing configuration for the Startup CRM application.
//
// Route structure:
//   /login        → Login page     (public)
//   /register     → Register page  (public)
//   /             → ProtectedRoute → AppLayout → Dashboard (index)
//   /leads        → ProtectedRoute → AppLayout → Leads
//   /analytics    → ProtectedRoute → AppLayout → Analytics
//   /*            → ProtectedRoute → AppLayout → NotFound
//
// ProtectedRoute:
//   Checks localStorage for 'crm-token'.
//   • Token present  → renders <Outlet /> (the wrapped page)
//   • Token absent   → redirects to /login, preserving the attempted URL in `state`
//                      so the login page can redirect back after auth.
//
// All page components are lazy-loaded to keep the initial bundle small.
// ─────────────────────────────────────────────────────────────────────────────
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

// ─── Lazy-loaded page components ──────────────────────────────────────────────
// Each chunk is only downloaded when the user first navigates to that route.

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads     = lazy(() => import('../pages/Leads'));
const Analytics = lazy(() => import('../pages/Analytics'));
const NotFound  = lazy(() => import('../pages/NotFound'));
const Login     = lazy(() => import('../pages/Login'));
const Register  = lazy(() => import('../pages/Register'));

// ─── Loading fallback ──────────────────────────────────────────────────────────
// Shown while any lazy chunk is being downloaded from the server.
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-screen">
    <div className="text-text-muted-light dark:text-text-muted-dark animate-pulse font-medium">
      Loading…
    </div>
  </div>
);

// ─── ProtectedRoute ────────────────────────────────────────────────────────────
/**
 * Guards a route tree from unauthenticated access.
 *
 * Strategy: reads directly from localStorage (not context) so the check is
 * synchronous and works even before AuthContext has finished its async
 * session-restore call.  The AuthContext's `isLoading` state already shows
 * a spinner in main.jsx while it's restoring — so by the time routes render,
 * localStorage is the correct source of truth.
 *
 * If the token is missing, the user is redirected to /login.
 * The attempted URL is passed as `state.from` so Login could redirect back.
 */
function ProtectedRoute() {
  const location = useLocation();

  // Read the token synchronously from localStorage.
  // The JWT is written by authService / AuthContext immediately after login.
  const token = localStorage.getItem('crm-token');

  if (!token) {
    // No JWT → send to /login, remembering where they wanted to go
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Token present → render the child route (via <Outlet />)
  return <Outlet />;
}

// ─── AppRoutes ─────────────────────────────────────────────────────────────────
/**
 * The application's complete route tree.
 * Exported and rendered inside <BrowserRouter> in App.jsx.
 */
export default function AppRoutes() {
  return (
    // All lazy components are wrapped in a single Suspense boundary.
    <Suspense fallback={<LoadingFallback />}>
      <Routes>

        {/* ── Public routes — no auth required ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected route tree ─────────────────────────────────────────── */}
        {/* ProtectedRoute checks the token; if missing it redirects to /login */}
        <Route element={<ProtectedRoute />}>

          {/* AppLayout provides the Sidebar + Header shell for all inner pages */}
          <Route path="/" element={<AppLayout />}>

            {/* Index route: shown exactly at '/' */}
            <Route index element={<Dashboard />} />

            {/* Lead management page */}
            <Route path="leads" element={<Leads />} />

            {/* Analytics page */}
            <Route path="analytics" element={<Analytics />} />

            {/* 404 catch-all — still inside the layout so the nav is visible */}
            <Route path="*" element={<NotFound />} />

          </Route>
        </Route>

      </Routes>
    </Suspense>
  );
}
