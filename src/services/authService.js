// src/services/authService.js
// ─────────────────────────────────────────────────────────────────────────────
// All authentication-related API calls.
// Functions return `response.data` (the unwrapped axios response body) so that
// callers can work with plain objects rather than axios wrapper types.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api';

// The localStorage key that stores the JWT. Kept in ONE place so it never drifts.
export const TOKEN_KEY = 'crm-token';

/**
 * Register a brand-new user account.
 *
 * @param {string} name     - User's display name
 * @param {string} email    - User's email address
 * @param {string} password - Plain-text password (sent over HTTPS, hashed on server)
 * @returns {Promise<{ token: string, user: object }>} Server response with JWT and user object
 */
export async function register(name, email, password) {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data; // { token, user }
}

/**
 * Authenticate an existing user and retrieve a JWT.
 *
 * @param {string} email    - Registered email
 * @param {string} password - Plain-text password
 * @returns {Promise<{ token: string, user: object }>} Server response with JWT and user object
 */
export async function login(email, password) {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data; // { token, user }
}

/**
 * Log the current user out.
 * The Express backend is stateless (JWT-based), so there is no server-side
 * session to invalidate. We simply remove the token from localStorage.
 *
 * @returns {void}
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Fetch the currently authenticated user's profile.
 * Requires a valid JWT (automatically added by the request interceptor in api.js).
 *
 * @returns {Promise<object>} The user profile object
 */
export async function getProfile() {
  const response = await api.get('/api/auth/profile');
  return response.data; // { user: { name, email, ... } }
}

/**
 * Update the currently authenticated user's profile fields.
 *
 * @param {Partial<{ name: string, email: string, password: string }>} data - Fields to update
 * @returns {Promise<object>} Updated user object from the server
 */
export async function updateProfile(data) {
  const response = await api.put('/api/auth/profile', data);
  return response.data;
}
