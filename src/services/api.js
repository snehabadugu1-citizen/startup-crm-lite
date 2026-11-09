// src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Configured Axios instance that serves as the single HTTP client for the app.
// All API calls should use this instance — never a raw axios import — so that:
//   • every request automatically carries the JWT Authorization header, and
//   • every 401 response automatically logs the user out and redirects to /login.
// ─────────────────────────────────────────────────────────────────────────────
import axios from 'axios';
import toast from 'react-hot-toast';

// ─── Create the Axios instance ────────────────────────────────────────────────
// baseURL is injected at build-time from the .env file via Vite's import.meta.env.
// In development this resolves to http://localhost:5000.
// In production, set VITE_API_URL to your deployed backend URL.
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Automatically parse JSON responses
  responseType: 'json',
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Runs before every outgoing request.
// Reads the JWT from localStorage and injects it as the Authorization header.
api.interceptors.request.use(
  (config) => {
    // Retrieve the stored JWT. The key 'crm-token' is the app-wide convention
    // and must stay in sync with authService.js.
    const token = localStorage.getItem('crm-token');

    if (token) {
      // Standard Bearer token scheme expected by the Express JWT middleware
      config.headers.Authorization = 'Bearer ' + token;
    }

    return config; // always return config so the request continues
  },
  (error) => {
    // If building the request itself fails, propagate the error
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Runs after every response (success or failure) comes back from the server.
api.interceptors.response.use(
  // ① Happy path — just pass the response through unchanged
  (response) => response,

  // ② Error path — handle common failure scenarios globally
  (error) => {
    if (error.response) {
      // The server responded with a status code outside 2xx

      if (error.response.status === 401) {
        // ── Token expired / invalid ──────────────────────────────────────────
        // Clear the stale token so the next request won't retry with it.
        localStorage.removeItem('crm-token');

        // Redirect to the login page.
        // We use window.location.href (a hard redirect) rather than the React
        // Router navigate() function because this interceptor lives outside of
        // the React component tree and therefore has no access to the router context.
        // A hard redirect also clears any in-memory state, which is desirable after
        // a session expiry.
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      // For all other HTTP errors (400, 403, 404, 422, 500, …)
      // we let the error bubble up so individual service calls can handle them
      // and show context-aware messages to the user.

    } else if (error.request) {
      // The request was sent but NO response was received — network / CORS error.
      // Show a global toast so the user knows the backend is unreachable.
      toast.error('Cannot connect to server. Check your connection.', {
        id: 'network-error', // dedupe: only show one at a time
        duration: 4000,
      });
    }
    // (If error.request is also absent, the error happened in request setup —
    //  unlikely but we still reject so callers can catch it.)

    return Promise.reject(error);
  }
);

// Export the configured instance as the default export.
// Every service file should: import api from './api'
export default api;
