// src/App.jsx
// Import the React library
import React from 'react';
// Import BrowserRouter from react-router-dom to enable client-side routing
import { BrowserRouter } from 'react-router-dom';
// Import our newly created centralized routing configuration
import AppRoutes from './routes';

// Define the root App component
function App() {
  return (
    // BrowserRouter acts as the top-level router wrapper.
    // It hooks into the HTML5 History API (pushState, replaceState) 
    // to keep the UI in sync with the browser's URL bar.
    <BrowserRouter>
      {/* Render the extracted routes tree, which contains our layout and lazy-loaded pages */}
      <AppRoutes />
    </BrowserRouter>
  );
}

// Export the App component to be rendered into the DOM by main.jsx
export default App;
