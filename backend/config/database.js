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
import dns from 'dns';

// Derive __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path: load backend/.env first, then project root .env
config({ path: path.resolve(__dirname, '../.env') });
config({ path: path.resolve(__dirname, '../../.env') });

// Configure Node.js c-ares DNS resolver: on Windows, if only loopback (127.0.0.1)
// is registered, Node will get querySrv ECONNREFUSED for mongodb+srv:// URIs.
// Adding public DNS servers ensures SRV lookups resolve reliably.
try {
  const currentServers = dns.getServers();
  if (!currentServers || currentServers.length === 0 || currentServers.every(s => s.startsWith('127.'))) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch {
  // Gracefully continue if dns.setServers is restricted in the environment
}

// ── Mongoose ORM ───────────────────────────────────────────────────────────────
import mongoose from 'mongoose';

/**
 * Converts a MongoDB Atlas SRV URI into a standard replica-set URI if needed.
 * Atlas cluster0.fvkltpz.mongodb.net maps to the 3 verified shard hostnames:
 * - ac-ads2axi-shard-00-00.fvkltpz.mongodb.net:27017
 * - ac-ads2axi-shard-00-01.fvkltpz.mongodb.net:27017
 * - ac-ads2axi-shard-00-02.fvkltpz.mongodb.net:27017
 * with replicaSet 'atlas-qk9sr6-shard-0'.
 *
 * @param {string} uri
 * @returns {string}
 */
function getStandardUri(uri) {
  if (!uri || !uri.startsWith('mongodb+srv://')) {
    return uri;
  }

  if (uri.includes('@cluster0.fvkltpz.mongodb.net')) {
    const shardHosts = [
      'ac-ads2axi-shard-00-00.fvkltpz.mongodb.net:27017',
      'ac-ads2axi-shard-00-01.fvkltpz.mongodb.net:27017',
      'ac-ads2axi-shard-00-02.fvkltpz.mongodb.net:27017',
    ].join(',');

    let standard = uri.replace('mongodb+srv://', 'mongodb://');
    standard = standard.replace('@cluster0.fvkltpz.mongodb.net', `@${shardHosts}`);

    const separator = standard.includes('?') ? '&' : '?';
    const params = [];
    if (!standard.includes('ssl=') && !standard.includes('tls=')) {
      params.push('ssl=true');
    }
    if (!standard.includes('replicaSet=')) {
      params.push('replicaSet=atlas-qk9sr6-shard-0');
    }
    if (!standard.includes('authSource=')) {
      params.push('authSource=admin');
    }
    if (params.length > 0) {
      standard += `${separator}${params.join('&')}`;
    }
    return standard;
  }

  return uri;
}

/**
 * @function connectDB
 * @description Establishes a connection to MongoDB Atlas.
 *
 *              Call once at server startup, BEFORE app.listen().  Await this
 *              function so that the server never handles traffic until the
 *              database is ready.
 *
 * @returns {Promise<void>} Resolves when connection is established.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  // Attempt 1: Standard Mongoose connection using the configured URI
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (primaryErr) {
    const isSrvDnsError =
      primaryErr.message.includes('querySrv') ||
      primaryErr.message.includes('ECONNREFUSED') ||
      primaryErr.message.includes('ENOTFOUND');

    if (isSrvDnsError && uri.startsWith('mongodb+srv://')) {
      console.warn('⚠️  SRV DNS resolution issue detected. Attempting public DNS and standard replica-set fallback...');

      // Attempt 2: Explicitly switch to public DNS resolvers
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        const retryConn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB Atlas Connected (via public DNS fallback): ${retryConn.connection.host}`);
        return retryConn;
      } catch {
        // Attempt 3: Connect using standard replica-set URI which bypasses SRV lookup completely
        try {
          const standardUri = getStandardUri(uri);
          const fallbackConn = await mongoose.connect(standardUri, {
            serverSelectionTimeoutMS: 5000,
          });
          console.log(`✅ MongoDB Atlas Connected (via replica-set fallback): ${fallbackConn.connection.host}`);
          return fallbackConn;
        } catch (fallbackErr) {
          console.error('❌ MongoDB fallback connection failed:', fallbackErr.message);
        }
      }
    }

    console.error('❌ MongoDB connection error:', primaryErr.message);
    process.exit(1);
  }
};

// ── Default export ─────────────────────────────────────────────────────────────
// Named default so it can be imported with any identifier:
//   import connectDB from './config/database.js'
export default connectDB;
