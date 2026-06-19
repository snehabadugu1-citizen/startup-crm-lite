import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-50">404</h1>
      <p className="text-lg text-gray-500 dark:text-gray-400">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors shadow-sm"
      >
        Go back home
      </Link>
    </div>
  );
}
