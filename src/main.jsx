// src/main.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Application entry point.
//
// Provider order (outermost → innermost):
//   BrowserRouter  — must wrap everything that uses React Router hooks
//   AuthProvider   — requires BrowserRouter for useNavigate() inside it
//   LeadProvider   — requires AuthContext (indirectly, via API interceptors)
//   ThemeProvider  — purely cosmetic, can go anywhere
//
// Note: <Toaster /> from react-hot-toast is already rendered inside AppLayout
// for authenticated pages. We add a second <Toaster> here (at root level) so
// that toasts triggered from the Login / Register pages also appear.
// react-hot-toast deduplicates instances gracefully.
// ─────────────────────────────────────────────────────────────────────────────
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';
import { AuthProvider }  from './context/AuthContext.jsx';
import { LeadProvider }  from './context/LeadContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter must be the outermost routing context */}
    <BrowserRouter>
      {/* AuthProvider uses useNavigate — must be inside BrowserRouter */}
      <AuthProvider>
        {/* LeadProvider makes lead CRUD available to all pages */}
        <LeadProvider>
          {/* ThemeProvider manages dark / light mode toggle */}
          <ThemeProvider>
            {/* Global toast for auth pages (Login / Register) */}
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
              }}
            />
            <App />
          </ThemeProvider>
        </LeadProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
