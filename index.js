import { config } from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from "express";
import { init } from "@heyputer/puter.js/src/init.cjs";
import { pickModel } from "./router.js";
import { rateLimiter, validateChatRequest, validateMessagesRequest, sanitizeMessages, API_KEY_AUTH } from "./middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '.env') });

const PORT = parseInt(process.env.PORT || '3333', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '';

// Initialize Puter with validation
if (!process.env.PUTER_AUTH_TOKEN) {
  console.warn("[WARN] PUTER_AUTH_TOKEN not set — some models may be unavailable");
}
const puter = init(process.env.PUTER_AUTH_TOKEN);
console.log("Puter initialized, auth:", !!process.env.PUTER_AUTH_TOKEN);

const app = express();

// ── Security & Middleware ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS — configurable origin, no wildcard
app.use((req, res, next) => {
  if (CORS_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  next();
});

// Rate limiting on all API routes
app.use('/v1', rateLimiter);
app.use('/chat', rateLimiter);

// Optional API key authentication
app.use(API_KEY_AUTH);

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Extracts text content from various response formats
 * @param {string|Array<{text?: string}>|null} content
 * @returns {string}
 */
function extractContent(content) {
  if (typeof content === "string") {
    return content;
  } else if (Array.isArray(content)) {
    return content.map(c => (typeof c === 'object' && c !== null && 'text' in c) ? c.text : String(c)).join("");
  }
  return "";
}

/**
 * Creates a safe error response that doesn't leak internal details
 * @param {Error} error
 * @param {string} type
 * @returns {{ error: string, type: string }}
 */
function safeErrorResponse(error, type = "internal_error") {
  const message = error.message || 'An unexpected error occurred';
  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Internal server error', type };
  }
  return { error: message, type };
}

// ── OpenAI-Compatible Endpoint ────────────────────────────────────────

app.post("/v1/chat/completions", validateChatRequest, async (req, res) => {
  try {
    const { messages, model: rawModel, stream } = req.body;

    const model = (!rawModel || rawModel === "auto" || rawModel === "Auto")
      ? pickModel(messages)
      : rawModel;

    const sanitizedMessages = sanitizeMessages(messages);

    const response = await puter.ai.chat(sanitizedMessages, {
      model: model,
      stream: false
    });

    const contentText = extractContent(response?.message?.content);

    res.json({
      id: "chatcmpl-" + Date.now(),
      object: "chat.completion",
      created: Date.now(),
      model: model,
      choices: [{
        index: 0,
        message: { role: "assistant", content: contentText },
        finish_reason: "stop"
      }],
      usage: response?.usage || {}
    });

  } catch (error) {
    console.error("[ERROR] /v1/chat/completions:", error.message);
    res.status(500).json(safeErrorResponse(error, "internal_error"));
  }
});

// ── Anthropic-Compatible Endpoint ─────────────────────────────────────

app.post("/v1/messages", validateMessagesRequest, async (req, res) => {
  try {
    const { messages, model: rawModel, max_tokens, stream, system, prompt } = req.body;

    const model = (!rawModel || rawModel === "auto" || rawModel === "Auto")
      ? "claude-opus-4-5-latest"
      : rawModel;

    const allMessages = [];
    if (system && typeof system === 'string') {
      allMessages.push({ role: "system", content: system });
    }
    if (messages && Array.isArray(messages)) {
      allMessages.push(...messages);
    } else if (prompt && typeof prompt === 'string') {
      allMessages.push({ role: "user", content: prompt });
    }

    if (allMessages.length === 0) {
      return res.status(400).json({ error: "No messages or prompt provided", type: "invalid_request" });
    }

    const sanitizedMessages = sanitizeMessages(allMessages);

    const response = await puter.ai.chat(sanitizedMessages, {
      model: model,
      stream: false,
      max_tokens: Math.min(max_tokens || 4096, 16384) // Cap max_tokens
    });

    const contentText = extractContent(response?.message?.content);

    const contentBlocks = contentText
      ? [{ type: "text", text: contentText }]
      : [];

    res.json({
      id: response?.message?.id || "msg_" + Date.now(),
      type: "message",
      role: "assistant",
      content: contentBlocks,
      model: model,
      stop_reason: response?.message?.stop_reason || "end_turn",
      usage: response?.usage || { input_tokens: 0, output_tokens: 0 }
    });

  } catch (error) {
    console.error("[ERROR] /v1/messages:", error.message);
    res.status(500).json(safeErrorResponse(error, "error"));
  }
});

// ── Native Auto-Routed Endpoint ───────────────────────────────────────

app.post("/chat", validateChatRequest, async (req, res) => {
  try {
    const { messages, model: rawModel, stream } = req.body;

    const model = (!rawModel || rawModel === "auto" || rawModel === "Auto")
      ? pickModel(messages)
      : rawModel;

    const sanitizedMessages = sanitizeMessages(messages);

    const response = await puter.ai.chat(sanitizedMessages, {
      model: model,
      stream: false
    });

    res.json(response);

  } catch (error) {
    console.error("[ERROR] /chat:", error.message);
    res.status(500).json(safeErrorResponse(error, "internal_error"));
  }
});

// ── Health & Status Endpoints ─────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "3.0.1"
  });
});

app.get("/status", (req, res) => {
  res.json({
    status: "running",
    port: PORT,
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
    puter_auth: !!process.env.PUTER_AUTH_TOKEN,
    rate_limiting: true,
    cors_enabled: !!CORS_ORIGIN,
    api_key_auth: !!process.env.API_KEY
  });
});

app.get("/models", (req, res) => {
  res.json({
    object: "list",
    data: [
      { id: "deepseek-chat", provider: "puter", type: "reasoning", description: "DeepSeek Chat — general purpose, planning" },
      { id: "gpt-5-chat", provider: "puter", type: "general", description: "OpenAI GPT-5 Chat — latest OpenAI model" },
      { id: "gpt-4o", provider: "puter", type: "general", description: "OpenAI GPT-4o — complex reasoning, code" },
      { id: "gpt-4o-mini", provider: "puter", type: "fast", description: "OpenAI GPT-4o Mini — quick tasks" },
      { id: "gemini-2.0-flash", provider: "puter", type: "fast", description: "Google Gemini 2.0 Flash — balanced performance" },
      { id: "claude-opus-4-5-latest", provider: "puter", type: "code/analysis", description: "Anthropic Claude Opus 4.5 — best for code, architecture" },
      { id: "claude-sonnet-4", provider: "puter", type: "balanced", description: "Anthropic Claude Sonnet 4 — code + analysis" },
      { id: "claude-haiku-4-5", provider: "puter", type: "fast", description: "Anthropic Claude Haiku 4.5 — quick responses" },
      { id: "grok-3", provider: "puter", type: "general", description: "xAI Grok 3 — flagship model" },
      { id: "grok-3-fast", provider: "puter", type: "fast", description: "xAI Grok 3 Fast — quick responses" },
      { id: "grok-2-vision", provider: "puter", type: "vision", description: "xAI Grok 2 Vision — image understanding" },
      { id: "mistral-large-2512", provider: "puter", type: "general", description: "Mistral Large — best Mistral model" },
      { id: "codestral-2508", provider: "puter", type: "code", description: "Codestral — code generation" },
      { id: "qwen-2.5-coder-32b-instruct", provider: "puter", type: "code", description: "Qwen 2.5 Coder 32B — dedicated coding" }
    ]
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: "Not found", type: "not_found" });
});

// ── Global Error Handler ──────────────────────────────────────────────

app.use((err, req, res, _next) => {
  console.error("[FATAL]", err.message);
  if (res.headersSent) return;
  res.status(500).json(safeErrorResponse(err, "internal_error"));
});

// ── Start Server ──────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`JSUPTER AI Gateway v3.0.1 running on http://localhost:${PORT}`);
  console.log("Available routes:");
  console.log("  POST /chat               - Chat with AI (auto-routing)");
  console.log("  POST /v1/chat/completions - OpenAI-compatible API");
  console.log("  POST /v1/messages         - Anthropic-compatible API");
  console.log("  GET  /health              - Health check");
  console.log("  GET  /status              - Server status");
  console.log("  GET  /models              - List available models");
  if (CORS_ORIGIN) console.log(`  CORS origin: ${CORS_ORIGIN}`);
  if (process.env.API_KEY) console.log("  API key authentication: enabled");
});
