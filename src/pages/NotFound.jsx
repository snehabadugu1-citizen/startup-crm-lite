// src/pages/NotFound.jsx
import React from 'react';
// Import Link component to allow client-side navigation back to the home page without a full page reload
import { Link } from 'react-router-dom';

// Define and export the NotFound component
// This component will be rendered as a catch-all for any undefined routes
export default function NotFound() {
  return (
    // Outer container: takes up full height, uses flexbox to center its children vertically and horizontally
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      
      {/* The main 404 header, using bold typography and respecting light/dark mode text colors */}
      <h1 className="text-6xl font-bold text-text-primary-light dark:text-text-primary-dark">
        404
      </h1>
      
      {/* A friendly, muted error message explaining what happened */}
      <p className="text-lg text-text-muted-light dark:text-text-muted-dark">
        Oops! The page you're looking for doesn't exist.
      </p>
      
      {/* 
        Link back to the root route ('/').
        Styled like a primary button to encourage the user to return to safety.
        Uses transition-colors for a smooth hover effect.
      */}
      <Link 
        to="/" 
        className="bg-primary-500 hover:bg-primary-400 text-white px-6 py-2 rounded-md font-medium transition-colors shadow-sm"
      >
        Go back home
      </Link>
      
    </div>
  );
}
