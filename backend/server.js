/**
 * @file server.js
 * @description Main entry point for the Startup CRM Lite backend API.
 *
 *              Boot sequence
 *              ─────────────
 *              1.  Load environment variables via dotenv (.env)
 *              2.  Validate required env vars — exits early if any are missing
 *              3.  Configure Express:
 *                    a) helmet()         → security headers
 *                    b) morgan('dev')    → HTTP request logging
 *                    c) cors()           → cross-origin resource sharing
 *                    d) express.json()   → JSON body parsing (10kb limit)
 *                    e) express.urlencoded() → URL-encoded form body parsing
 *                    f) mongoSanitize()  → NoSQL injection prevention
 *              4.  Mount API route handlers
 *              5.  Register global error handler (MUST be after all routes)
 *              6.  Connect to MongoDB Atlas via Mongoose
 *              7.  Start the HTTP server
 *              8.  Graceful shutdown on SIGTERM / SIGINT
 *
 * Environment variables required
 * ──────────────────────────────
 *   MONGODB_URI   – Full Atlas connection string
 *   JWT_SECRET    – Secret for signing/verifying JWTs
 *   PORT          – Port for the HTTP server (defaults to 5000)
 *   NODE_ENV      – 'development' | 'production'
 *   FRONTEND_URL  – Allowed CORS origin (e.g. http://localhost:5173)
 */

// =============================================================================
// 0.  Environment variables  — MUST be the very first import
// =============================================================================
// We use an explicit path so the server finds the .env file in the project ROOT
// regardless of which directory Node.js is launched from.  The .env lives one
// level above this backend/ folder.
import { config as loadEnv } from 'dotenv';
import { fileURLToPath }     from 'url';
import path                   from 'path';
import dns                    from 'dns';

// Derive __dirname equivalent for ES modules (not available natively)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Resolve: load backend/.env first, then root ../.env
loadEnv({ path: path.resolve(__dirname, '.env') });
loadEnv({ path: path.resolve(__dirname, '../.env') });

// Configure Node.js c-ares DNS resolver: on Windows, if only loopback (127.0.0.1)
// is registered, Node gets querySrv ECONNREFUSED for mongodb+srv:// URIs.
try {
  const currentServers = dns.getServers();
  if (!currentServers || currentServers.length === 0 || currentServers.every(s => s.startsWith('127.'))) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch {
  // Gracefully continue
}

// =============================================================================
// 1.  Core Node / third-party dependencies
// =============================================================================

import http    from 'http';           // Node built-in — wraps Express for graceful shutdown
import express from 'express';        // Web framework
import cors    from 'cors';           // Cross-Origin Resource Sharing
import helmet  from 'helmet';         // Secure HTTP headers
import morgan  from 'morgan';         // HTTP request logger

// Additional security and quality-of-life middleware used in production
import rateLimit    from 'express-rate-limit';    // Rate limiting
import mongoSanitize from 'express-mongo-sanitize'; // NoSQL injection sanitisation

// =============================================================================
// 2.  Internal application modules
// =============================================================================

// Database connection helper
import connectDB from './config/database.js';

// Global error handler middleware (must be last middleware registered)
import errorHandler from './middleware/errorHandler.js';

// Route handlers — each file exports an Express Router instance
import authRoutes from './routes/authRoutes.js';   // /api/auth  — register, login, profile
import leadRoutes from './routes/leadRoutes.js';   // /api/leads — CRUD + stats

// =============================================================================
// 3.  Environment validation
// =============================================================================

/**
 * @function checkRequiredEnvVars
 * @description Validates that all critical environment variables are present
 *              BEFORE any module that needs them executes.
 *
 *              Exits the process with code 1 if any are missing so that
 *              misconfigured deployments fail loudly and immediately rather
 *              than mysteriously at runtime during a request.
 *
 * Required variables
 * ──────────────────
 *   MONGODB_URI  – Atlas connection string
 *   JWT_SECRET   – Secret used to sign and verify JWTs
 *   PORT         – HTTP port the server will listen on
 *
 * @returns {void}
 */
function checkRequiredEnvVars() {
  // List every env var that is absolutely required at startup
  const REQUIRED = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];

  // Filter to only variables that are missing or empty (whitespace only)
  const missing = REQUIRED.filter(
    (key) => !process.env[key] || process.env[key].trim() === ''
  );

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   • ${key}`));
    console.error('   Please set them in your .env file or deployment environment.');
    // Non-zero exit code signals to orchestrators that this was an abnormal exit
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

// Run synchronously before anything else boots
checkRequiredEnvVars();

// =============================================================================
// 4.  Resolved runtime constants
// =============================================================================

// After validation, these are guaranteed to be defined
const PORT     = parseInt(process.env.PORT, 10) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD  = NODE_ENV === 'production';

// =============================================================================
// 5.  Express application initialisation
// =============================================================================

const app = express();

// =============================================================================
// 6.  Security headers — helmet()
// =============================================================================
/**
 * helmet() sets a suite of protective HTTP response headers automatically:
 *
 *   Content-Security-Policy      – restricts which resources can be loaded
 *   X-Frame-Options              – prevents clickjacking via <iframe>
 *   X-Content-Type-Options       – stops MIME-type sniffing
 *   Strict-Transport-Security    – enforces HTTPS in production
 *   Referrer-Policy              – limits referrer information leakage
 *   Cross-Origin-Resource-Policy – controls cross-origin resource access
 *   … and more.
 *
 * Must be registered FIRST so security headers are sent on EVERY response,
 * including error responses and the health check.
 */
app.use(helmet());

// =============================================================================
// 7.  HTTP request logging — morgan
// =============================================================================
/**
 * morgan logs every HTTP request to stdout.
 *
 * Format selection:
 *   'dev'      — concise, colour-coded output for human reading in development
 *                Example: GET /api/leads 200 12.345 ms - 824
 *   'combined' — Apache-style structured format for production log aggregators
 *                (Papertrail, Datadog, CloudWatch)
 *
 * morgan('dev') is used here as specified; 'combined' is switched on in prod.
 */
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

// =============================================================================
// 8.  CORS — Cross-Origin Resource Sharing
// =============================================================================
/**
 * Only origins in ALLOWED_ORIGINS may make credentialed cross-origin requests.
 *
 * credentials: true is required to forward cookies and Authorization headers
 * from the browser.  It CANNOT be used together with origin: '*'.
 *
 * The dynamic callback pattern allows multiple origins without disabling credentials.
 */
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,           // Development origin from .env (e.g. http://localhost:5173)
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://startup-crm-lite-6w5drbi47-sneha9100.vercel.app',      // ← Replace with your real Vercel production URL
].filter(Boolean);                    // Remove undefined / empty entries

app.use(
  cors({
    /**
     * @param {string|undefined} origin - Value of the incoming request's Origin header.
     *        undefined means a non-browser client (Postman, curl, server-to-server call).
     * @param {Function} callback - Call callback(null, true) to allow; callback(null, false) to deny.
     */
    origin: (origin, callback) => {
      // Allow requests with no Origin header (mobile apps, server-to-server, Postman)
      if (!origin) return callback(null, true);

      // Allow listed origins or any localhost/127.0.0.1 in development
      if (ALLOWED_ORIGINS.includes(origin) || (!IS_PROD && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
        return callback(null, true);
      }

      // In development allow origin to ease local workflow
      if (!IS_PROD) {
        return callback(null, true);
      }

      // Deny unknown origins cleanly
      return callback(null, false);
    },

    // Required for cookies / Authorization headers to be forwarded
    credentials: true,
  })
);

// =============================================================================
// 9.  Rate limiting — protect against abuse / DDoS
// =============================================================================

/**
 * @constant generalLimiter
 * @description Broad rate limit applied to all /api/* routes.
 *              Protects against automated scraping, enumeration attacks, and
 *              application-layer DDoS.
 *
 * Window : 15 minutes
 * Max    : 100 requests per IP per window (1000 in dev)
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute sliding window
  max: IS_PROD ? 100 : 1000, // Max requests per IP per window
  standardHeaders: true,     // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,      // Disable deprecated X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * @constant authLimiter
 * @description Stricter rate limit scoped to authentication endpoints.
 *              Drastically reduces the attack surface for brute-force credential
 *              stuffing against /api/auth/login and /api/auth/register.
 *
 * Window : 15 minutes
 * Max    : 10 requests per IP per window (500 in dev)
 *
 * Auth requests count against BOTH limiters — authLimiter trips first.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 10 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Apply general limiter to all API routes
app.use('/api/', generalLimiter);

// Apply stricter limiter on top of the general limiter for auth routes
app.use('/api/auth/', authLimiter);

// =============================================================================
// 10. Body parsing middleware
// =============================================================================

/**
 * express.json() — parses incoming requests with JSON payloads.
 *
 * limit: '10kb' caps the request body size to prevent JSON bomb attacks
 * where an attacker sends a deeply nested payload to exhaust server memory.
 *
 * MUST be registered BEFORE mongoSanitize() so that req.body is populated
 * when the sanitiser runs.
 */
app.use(express.json({ limit: '10kb' }));

/**
 * express.urlencoded() — parses URL-encoded form data
 * (e.g. traditional HTML form submissions via <form method="POST">).
 *
 * extended: true uses the `qs` library, allowing nested objects in the
 * form data (e.g. user[name]=Alice).
 */
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// 11. NoSQL injection sanitisation — express-mongo-sanitize
// =============================================================================
/**
 * mongoSanitize() strips characters that have special meaning in MongoDB queries
 * ('$' and '.') from req.body, req.query, and req.params.
 *
 * This prevents attacks like:
 *   { "email": { "$gt": "" }, "password": { "$gt": "" } }
 * which, without sanitisation, could bypass authentication entirely.
 *
 * replaceWith: '_' swaps illegal characters rather than silently dropping them,
 * making injection attempts easier to detect and debug in logs.
 */
app.use((req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  if (req.query) mongoSanitize.sanitize(req.query, { replaceWith: '_' });
  next();
});

// =============================================================================
// 12. Health check — GET /api/health
// =============================================================================
/**
 * Lightweight endpoint for load balancers, uptime monitors, and platform
 * health probes (Vercel, Railway, Render) to confirm the service is alive
 * WITHOUT hitting the database or triggering any business logic.
 *
 * Not covered by the rate limiters above since it carries no sensitive data.
 *
 * Response: { status: 'OK', timestamp: Date, environment: string }
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),       // ISO 8601 timestamp for the health probe
    environment: NODE_ENV,       // Quick visual confirmation of which env is running
  });
});

// =============================================================================
// 13. API routes
// =============================================================================
/**
 * All application routes are namespaced under /api/* so they can be versioned
 * in the future (e.g. /api/v2/*) without touching existing consumers.
 *
 *   /api/auth   — Public: POST /register, /login
 *                 Private: GET|PATCH /profile
 *
 *   /api/leads  — Private (all routes require a valid JWT):
 *                 GET    /           → paginated list with filter & search
 *                 POST   /           → create a new lead
 *                 GET    /stats      → aggregated pipeline stats
 *                 GET    /monthly-stats → monthly trend data
 *                 GET    /search     → autocomplete search
 *                 GET    /:id        → single lead
 *                 PATCH  /:id        → partial update
 *                 DELETE /:id        → permanent delete
 */
app.use('/api/auth',  authRoutes);  // Authentication: register, login, profile
app.use('/api/leads', leadRoutes);  // Lead CRUD + analytics

// =============================================================================
// 14. 404 catch-all — any route that didn't match above
// =============================================================================
/**
 * Must be AFTER all route handlers and BEFORE the error handler.
 * Returns a consistent JSON 404 instead of Express's default HTML page.
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// =============================================================================
// 15. Global error handler — MUST be the LAST middleware registered
// =============================================================================
/**
 * Any error passed via next(err) anywhere in the app lands here.
 * The four-parameter signature is mandatory — Express identifies error handlers
 * by arity (number of arguments).
 *
 * See middleware/errorHandler.js for the full error classification logic.
 */
app.use(errorHandler);

// =============================================================================
// 16. HTTP server creation
// =============================================================================
/**
 * We wrap Express in an http.Server so that we have an explicit server
 * reference to call server.close() in the graceful shutdown handler below.
 * Without this, there is no way to stop accepting new connections cleanly.
 */
const server = http.createServer(app);

// =============================================================================
// 17. Database connection + server start
// =============================================================================
/**
 * Connect to MongoDB Atlas FIRST, then start listening so the server never
 * handles requests before the database is ready.
 *
 * connectDB() calls process.exit(1) internally on failure, so this .then()
 * block is only reached when the connection is established.
 */
connectDB().then(() => {
  server.listen(PORT, () => {
    // ── Startup banner ───────────────────────────────────────────────────────
    console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
    console.log(`🛡️  Security headers active (helmet)`);
    console.log(`🔒 CORS allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
    console.log(`⚡ Rate limiting active — general: 100/15 min | auth: 10/15 min`);
    console.log(`🧹 MongoDB NoSQL injection sanitisation active`);
    console.log(`🏥 Health check: GET http://localhost:${PORT}/api/health`);
  });
});

// =============================================================================
// 18. Graceful shutdown — SIGTERM & SIGINT
// =============================================================================

/**
 * @function gracefulShutdown
 * @description Stops accepting new connections, waits for in-flight requests
 *              to finish, closes the MongoDB connection, then exits cleanly.
 *
 *              A 10-second hard timeout ensures a misbehaving request can never
 *              prevent the process from stopping.
 *
 * Signals handled
 * ───────────────
 *   SIGTERM — sent by Docker, Kubernetes, Heroku, Railway when stopping a container
 *   SIGINT  — sent when a developer presses Ctrl-C in the terminal
 *
 * @param {string} signal - The OS signal that triggered this shutdown.
 * @returns {void}
 */
function gracefulShutdown(signal) {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully…`);

  // Stop accepting new connections; allow existing ones to complete
  server.close(async () => {
    try {
      // Dynamically import mongoose to close the connection cleanly.
      // Using a dynamic import avoids potential circular-dependency issues.
      const mongoose = (await import('mongoose')).default;
      await mongoose.connection.close();
      console.log('🗄️  MongoDB connection closed gracefully');
    } catch (err) {
      console.error('⚠️  Error closing MongoDB connection:', err.message);
    } finally {
      console.log('✅ Server shut down gracefully. Goodbye!');
      process.exit(0);
    }
  });

  // Hard-kill safety net — force exit if the server hasn't closed after 10 seconds.
  // .unref() prevents this timer from keeping the Node.js event loop alive,
  // allowing the process to exit naturally if everything closes before 10 s.
  setTimeout(() => {
    console.error('❌ Forced shutdown after 10s timeout');
    process.exit(1);
  }, 10_000).unref();
}

// Register signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// =============================================================================
// 19. Unhandled Promise rejection safety net
// =============================================================================
/**
 * Catches any Promise rejection that was not handled with .catch() or try/catch.
 * Logs the reason, then initiates a graceful shutdown rather than leaving the
 * process in an unknown / partially-broken state.
 */
process.on('unhandledRejection', (reason) => {
  console.error('🔥 Unhandled Promise Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

// ── Named export — useful for integration testing ─────────────────────────────
// Export the Express app (not the http.Server) so test frameworks can mount it
// with supertest without starting a real listening server.
export default app;
