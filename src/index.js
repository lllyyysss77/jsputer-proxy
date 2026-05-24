/**
 * jsputer-ai-gateway v2.0 — Entry Point
 * 
 * Bootstraps the Multi-LLM Task-Based Gateway System.
 * Loads environment, validates config, and starts the server.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { startServer } from './server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Load environment ────────────────────────────────────────────────────
config({ path: join(__dirname, '../.env') });

// ── Validate required config ────────────────────────────────────────────
const requiredEnvVars = ['PUTER_AUTH_TOKEN'];
const missing = requiredEnvVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.warn(`[WARN] Missing environment variables: ${missing.join(', ')}`);
  console.warn('[WARN] Puter.js provider will not be available without PUTER_AUTH_TOKEN');
  console.warn('[WARN] Z.ai provider may work without additional configuration');
}

// ── Start ───────────────────────────────────────────────────────────────
const port = parseInt(process.env.GATEWAY_PORT || '3333', 10);
startServer(port);
