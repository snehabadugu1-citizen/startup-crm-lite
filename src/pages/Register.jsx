// src/pages/Register.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Public registration page — accessible without a JWT.
// Client-side validation runs before the server call:
//   • All fields required
//   • Passwords must match
//   • Password must be at least 6 characters
// On success, useAuth().register() saves the token and navigates to the dashboard.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Eye, EyeOff, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [confirmPass,  setConfirmPass]  = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  // Validation & server errors shown in the UI
  const [errors,       setErrors]       = useState({}); // { field: message }
  const [globalError,  setGlobalError]  = useState('');

  // ── Client-side validation ─────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPass) {
      newErrors.confirmPass = 'Please confirm your password';
    } else if (password !== confirmPass) {
      newErrors.confirmPass = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true = valid
  };

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    // Run validation — bail early if invalid
    if (!validate()) return;

    setIsLoading(true);
    try {
      // useAuth().register() calls authService.register(), saves token, toasts, navigates
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setGlobalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: clear a specific field error when the user starts typing
  const clearError = (field) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  // Password strength indicator (simple — just visual feedback)
  const passwordStrength = (() => {
    if (!password) return null;
    if (password.length < 6)  return { label: 'Too short',  color: 'bg-red-400',    width: 'w-1/4' };
    if (password.length < 8)  return { label: 'Weak',       color: 'bg-orange-400', width: 'w-2/4' };
    if (password.length < 12) return { label: 'Good',       color: 'bg-yellow-400', width: 'w-3/4' };
    return                           { label: 'Strong',      color: 'bg-green-500',  width: 'w-full' };
  })();

  // ── Shared input class helper ──────────────────────────────────────────────
  const inputClass = (hasError) =>
    `w-full py-2.5 rounded-xl border text-sm transition-colors
     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50
     placeholder-gray-400 dark:placeholder-gray-500
     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
     ${hasError
       ? 'border-red-400 dark:border-red-500'
       : 'border-gray-200 dark:border-gray-600'
     }`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">

      {/* ── Card ── */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 space-y-6">

        {/* ── Branding ── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-2">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Start managing your leads for free
          </p>
        </div>

        {/* ── Global error banner ── */}
        {globalError && (
          <div
            role="alert"
            className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm"
          >
            <span className="mt-0.5">⚠️</span>
            <span>{globalError}</span>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full name
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => { setName(e.target.value); clearError('name'); }}
                placeholder="Jane Smith"
                className={`${inputClass(!!errors.name)} pl-10 pr-4`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                placeholder="you@example.com"
                className={`${inputClass(!!errors.email)} pl-10 pr-4`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                id="register-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                placeholder="At least 6 characters"
                className={`${inputClass(!!errors.password)} pl-10 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password strength bar */}
            {passwordStrength && (
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
                </div>
                <p className={`text-xs ${
                  passwordStrength.label === 'Strong' ? 'text-green-500' :
                  passwordStrength.label === 'Good'   ? 'text-yellow-500' :
                  passwordStrength.label === 'Weak'   ? 'text-orange-500' : 'text-red-500'
                }`}>
                  {passwordStrength.label}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                id="register-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPass}
                onChange={(e) => { setConfirmPass(e.target.value); clearError('confirmPass'); }}
                placeholder="Re-enter your password"
                className={`${inputClass(!!errors.confirmPass)} pl-10 pr-12`}
              />
              {/* Show a green check when passwords match */}
              {confirmPass && confirmPass === password && (
                <CheckCircle
                  size={16}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none"
                />
              )}
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPass && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.confirmPass}</p>
            )}
          </div>

          {/* Submit */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2
                       bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                       text-white font-semibold py-2.5 px-4 rounded-xl
                       transition-colors shadow-sm shadow-blue-600/20
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       dark:focus:ring-offset-gray-800 text-sm min-h-[44px]"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Create account
              </>
            )}
          </button>
        </form>

        {/* ── Link back to login ── */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
