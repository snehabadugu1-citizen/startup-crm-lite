// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Global authentication state for the entire application.
//
// What this module exports:
//   • AuthContext      — the raw React context (rarely used directly)
//   • AuthProvider     — wrap your app tree with this to make auth available
//   • useAuth()        — custom hook for consuming the context in any component
//
// Token strategy:
//   • JWT is stored in localStorage under the key 'crm-token'.
//   • On mount, the provider reads localStorage and calls getProfile() to
//     verify the token is still valid and to hydrate the user object.
//   • On 401 the api.js interceptor wipes the token and redirects to /login.
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';

// ─── Create context with undefined default ────────────────────────────────────
// Consumers that call useAuth() outside of an AuthProvider will get a clear
// error from the guard in the custom hook below.
export const AuthContext = createContext(undefined);

// ─── Storage key — single source of truth ────────────────────────────────────
const TOKEN_KEY = 'crm-token';

// ─── Provider Component ───────────────────────────────────────────────────────
/**
 * Provides authentication state and actions to the entire React tree.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  // user:      the authenticated user object (null when logged out)
  // token:     the raw JWT string (null when logged out)
  // isLoading: true while the initial session restore is in progress
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true); // start true until we verify token

  const navigate = useNavigate();

  // ── Session restore on mount ─────────────────────────────────────────────
  // If there is a token in localStorage, try fetching the user profile.
  // This lets the user stay logged in across page refreshes.
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        // No token → nothing to restore, proceed as guest
        setIsLoading(false);
        return;
      }

      try {
        // getProfile() uses the stored token via the request interceptor
        const data = await authService.getProfile();
        // Server may return { user: {...} } or the user object directly
        setUser(data.user || data);
        setToken(storedToken);
      } catch {
        // Token is expired, tampered, or backend is down.
        // The 401 interceptor in api.js already removed the token from
        // localStorage and redirected. We just need to clear React state here.
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        // Whether restored or cleared, we are done loading
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []); // run once on mount

  // ── login action ─────────────────────────────────────────────────────────
  /**
   * Authenticate with email + password.
   * On success: persists token, updates state, and redirects to dashboard.
   * On failure: re-throws so the Login page can display the error message.
   *
   * @param {string} email
   * @param {string} password
   * @throws API error for the caller to handle
   */
  const login = useCallback(async (email, password) => {
    // Throws on bad credentials — caller handles the error/toast
    const data = await authService.login(email, password);

    // Persist JWT so it survives page refresh
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    toast.success(`Welcome back, ${data.user?.name || 'there'}! 👋`);
    navigate('/');
  }, [navigate]);

  // ── register action ───────────────────────────────────────────────────────
  /**
   * Create a new account.
   * On success: persists token (server auto-logs-in after register), updates state.
   *
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @throws API error for the caller to handle
   */
  const register = useCallback(async (name, email, password) => {
    const data = await authService.register(name, email, password);

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    toast.success(`Account created! Welcome, ${data.user?.name || name}! 🎉`);
    navigate('/');
  }, [navigate]);

  // ── logout action ─────────────────────────────────────────────────────────
  /**
   * Log the current user out:
   *   1. Removes the JWT from localStorage (stateless backend — no server call needed)
   *   2. Clears React state
   *   3. Navigates to /login
   */
  const logout = useCallback(() => {
    authService.logout(); // removes token from localStorage
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  }, [navigate]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    user,       // current user object | null
    token,      // JWT string | null
    isLoading,  // boolean — true while restoring session on first load
    login,      // (email, password) => Promise<void>
    register,   // (name, email, password) => Promise<void>
    logout,     // () => void
    isAuthenticated: !!token, // convenience boolean
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────
/**
 * Consume the AuthContext from any component inside AuthProvider.
 *
 * @returns {{ user, token, isLoading, isAuthenticated, login, register, logout }}
 * @throws {Error} If called outside of an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
