// src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Root application component.
//
// BrowserRouter was moved to main.jsx (it now wraps AuthProvider which
// requires access to React Router's navigation hooks via useNavigate).
// This component simply renders the route tree.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import AppRoutes from './routes';

function App() {
  return <AppRoutes />;
}

export default App;
