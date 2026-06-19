// src/routes/index.jsx
// Import React, Suspense (to handle the loading state), and lazy (to dynamically import components)
import React, { Suspense, lazy } from 'react';
// Import Routes and Route components to define the application's routing map
import { Routes, Route } from 'react-router-dom';
// Import the main layout wrapper which contains the Sidebar and Header
import AppLayout from '../components/layout/AppLayout';

// Lazily load the Dashboard component.
// It will only be downloaded to the client when the user navigates to the root path '/'
const Dashboard = lazy(() => import('../pages/Dashboard'));

// Lazily load the Lead Management page.
// It will only be downloaded when the user visits '/leads'
const Leads = lazy(() => import('../pages/Leads'));

// Lazily load the Analytics page.
// It will only be downloaded when the user visits '/analytics'
const Analytics = lazy(() => import('../pages/Analytics'));

// Lazily load the 404 Error page.
// It will only be downloaded if the user visits an invalid URL
const NotFound = lazy(() => import('../pages/NotFound'));

// Define a fallback component to show while the lazy chunks are loading over the network
const LoadingFallback = () => (
  // Flex container to center the loading text inside the content area
  <div className="flex items-center justify-center h-full">
    {/* A simple pulsing text indicator using Tailwind's animate-pulse */}
    <div className="text-text-muted-light dark:text-text-muted-dark animate-pulse font-medium">
      Loading...
    </div>
  </div>
);

// Define and export the main routing component for the application
export default function AppRoutes() {
  return (
    // Wrap the entire route tree in a Suspense boundary.
    // If any child component (like Dashboard or Leads) is not yet loaded, 
    // React will suspend rendering and display the `fallback` UI instead.
    <Suspense fallback={<LoadingFallback />}>
      
      {/* Routes acts as an intelligent switch that finds the best matching route for the current URL */}
      <Routes>
        
        {/* Parent Route: renders the AppLayout for any matching child route. */}
        {/* The child route's element will be injected where <Outlet /> is placed inside AppLayout. */}
        <Route path="/" element={<AppLayout />}>
          
          {/* Index Route: Rendered exactly at the root path ('/'). It displays the Dashboard. */}
          <Route index element={<Dashboard />} />
          
          {/* Leads Route: Rendered at '/leads'. Displays the Lead Management component. */}
          <Route path="leads" element={<Leads />} />
          
          {/* Analytics Route: Rendered at '/analytics'. Displays the Analytics component. */}
          <Route path="analytics" element={<Analytics />} />
          
          {/* Catch-all Route: Renders the NotFound component if the URL doesn't match any above. */}
          <Route path="*" element={<NotFound />} />
          
        </Route>
      </Routes>
    </Suspense>
  );
}
