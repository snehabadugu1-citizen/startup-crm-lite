/**
 * @file config/database.js
 * @description MongoDB Atlas connection configuration for Startup CRM Lite.
 *
 *              This module exports a single async function — connectDB() — that
 *              establishes a Mongoose connection to the Atlas cluster whose URI is
 *              stored in the MONGODB_URI environment variable.
 *
 *              Design decisions
 *              ─────────────────
 *              • dotenv is imported here (in addition to server.js) so that this
 *                file can be required standalone during testing without the full
 *                server boot sequence.
 *              • On a fatal connection error we call process.exit(1) immediately.
 *                This signals container orchestrators (Docker, Railway, Render, PM2)
 *                to restart the container so a transient Atlas outage self-heals.
 *              • We log conn.connection.host instead of the full URI to avoid
 *                leaking credentials into stdout (the URI contains the password).
 */

// ── Load environment variables ─────────────────────────────────────────────────
// We load dotenv with an explicit path so the server finds the .env file in the
// project ROOT regardless of which directory the process is launched from.
// The .env lives one level above this backend/ folder.
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Derive __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path: load backend/.env first, then project root .env
config({ path: path.resolve(__dirname, '../.env') });
config({ path: path.resolve(__dirname, '../../.env') });

// ── Mongoose ORM ───────────────────────────────────────────────────────────────
import mongoose from 'mongoose';

/**
 * @function connectDB
 * @description Establishes a connection to MongoDB Atlas.
 *
 *              Call once at server startup, BEFORE app.listen().  Await this
 *              function so that the server never handles traffic until the
 *              database is ready.
 *
 * Mongoose options used
 * ─────────────────────
 *  useNewUrlParser     – Opts in to the new MongoDB connection-string parser,
 *                        which avoids a deprecation warning in the console.
 *  useUnifiedTopology  – Enables the new Server Discovery and Monitoring (SDAM)
 *                        engine.  It is more stable and handles replica-set
 *                        failovers correctly.
 *
 * @returns {Promise<void>}  Resolves when the connection is established.
 *                           Calls process.exit(1) on unrecoverable error.
 *
 * @example
 *   import connectDB from './config/database.js';
 *   await connectDB();  // blocks until connected or exits
 */
const connectDB = async () => {
  try {
    // ── Attempt the connection ─────────────────────────────────────────────────
    // mongoose.connect() returns the Mongoose instance; .connection gives us the
    // raw driver connection object from which we extract the hostname for logging.
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // ── Success — log the Atlas cluster host ───────────────────────────────────
    // We deliberately log only the HOST, not the full URI, to avoid leaking
    // the username/password that are embedded in the connection string.
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    // ── Failure — log and exit ─────────────────────────────────────────────────
    // Logging the full error object gives more context than error.message alone
    // (it includes the MongoDB error code and any server selection diagnostics).
    console.error('❌ MongoDB connection error:', error.message);

    // Exit code 1 tells the OS / orchestrator that this was an abnormal exit.
    // PM2, Docker, Railway, etc. will automatically restart the process.
    process.exit(1);
  }
};

// ── Default export ─────────────────────────────────────────────────────────────
// Named default so it can be imported with any identifier:
//   import connectDB from './config/database.js'
export default connectDB;
