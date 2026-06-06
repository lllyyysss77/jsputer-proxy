/**
 * JSUPTER AI Gateway — Middleware
 * Rate limiting, input validation, and API key authentication
 */

// ── In-Memory Rate Limiter ────────────────────────────────────────────

const rateLimitWindowMs = parseInt(process.env.RATELIMIT_WINDOW_MS || '60000', 10);
const rateLimitMaxRequests = parseInt(process.env.RATELIMIT_MAX_REQUESTS || '100', 10);

/** @type {Map<string, { count: number, resetTime: number }>} */
const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware — per IP
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();

  let entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + rateLimitWindowMs };
    rateLimitStore.set(ip, entry);
  }

  entry.count++;

  res.setHeader('X-RateLimit-Limit', String(rateLimitMaxRequests));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, rateLimitMaxRequests - entry.count)));
  res.setHeader('X-RateLimit-Reset', String(entry.resetTime));

  if (entry.count > rateLimitMaxRequests) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      type: "rate_limit_error",
      retry_after_ms: entry.resetTime - now
    });
  }

  next();
}

// ── API Key Authentication (Optional) ─────────────────────────────────

const API_KEY = process.env.API_KEY;

/**
 * Optional API key authentication middleware
 * If API_KEY env var is set, all requests must include it
 * via X-API-Key header or Authorization: Bearer header
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function API_KEY_AUTH(req, res, next) {
  if (!API_KEY) return next(); // No key configured = no auth required

  const providedKey =
    req.headers['x-api-key'] ||
    (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null);

  if (!providedKey || providedKey !== API_KEY) {
    return res.status(401).json({
      error: "Invalid or missing API key",
      type: "authentication_error"
    });
  }

  next();
}

// ── Input Validation ──────────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 50000; // chars per message content
const MAX_MESSAGES_COUNT = 128;   // max messages in a conversation
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant', 'tool']);

/**
 * Validates chat completion request body
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validateChatRequest(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: "Request body must be a JSON object", type: "invalid_request" });
  }

  const { messages, model } = req.body;

  if (model !== undefined && typeof model !== 'string') {
    return res.status(400).json({ error: "model must be a string", type: "invalid_request" });
  }

  if (model !== undefined && model.length > 256) {
    return res.status(400).json({ error: "model name too long (max 256 chars)", type: "invalid_request" });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages must be a non-empty array", type: "invalid_request" });
  }

  if (messages.length === 0) {
    return res.status(400).json({ error: "messages array must not be empty", type: "invalid_request" });
  }

  if (messages.length > MAX_MESSAGES_COUNT) {
    return res.status(400).json({ error: `Too many messages (max ${MAX_MESSAGES_COUNT})`, type: "invalid_request" });
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg !== 'object') {
      return res.status(400).json({ error: `messages[${i}] must be an object`, type: "invalid_request" });
    }
    if (!ALLOWED_ROLES.has(msg.role)) {
      return res.status(400).json({ error: `messages[${i}].role must be one of: ${[...ALLOWED_ROLES].join(', ')}`, type: "invalid_request" });
    }
    if (msg.content !== undefined && typeof msg.content !== 'string' && !Array.isArray(msg.content)) {
      return res.status(400).json({ error: `messages[${i}].content must be a string or array`, type: "invalid_request" });
    }
    if (typeof msg.content === 'string' && msg.content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `messages[${i}].content too long (max ${MAX_MESSAGE_LENGTH} chars)`, type: "invalid_request" });
    }
  }

  next();
}

/**
 * Validates Anthropic messages request body
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validateMessagesRequest(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: "Request body must be a JSON object", type: "invalid_request" });
  }

  const { messages, model, system, prompt, max_tokens } = req.body;

  if (model !== undefined && typeof model !== 'string') {
    return res.status(400).json({ error: "model must be a string", type: "invalid_request" });
  }

  if (model !== undefined && model.length > 256) {
    return res.status(400).json({ error: "model name too long (max 256 chars)", type: "invalid_request" });
  }

  if (system !== undefined && typeof system !== 'string') {
    return res.status(400).json({ error: "system must be a string", type: "invalid_request" });
  }

  if (system !== undefined && system.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: "system prompt too long", type: "invalid_request" });
  }

  if (prompt !== undefined && typeof prompt !== 'string') {
    return res.status(400).json({ error: "prompt must be a string", type: "invalid_request" });
  }

  if (max_tokens !== undefined && (typeof max_tokens !== 'number' || max_tokens < 1)) {
    return res.status(400).json({ error: "max_tokens must be a positive number", type: "invalid_request" });
  }

  if (messages !== undefined) {
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array", type: "invalid_request" });
    }
    if (messages.length > MAX_MESSAGES_COUNT) {
      return res.status(400).json({ error: `Too many messages (max ${MAX_MESSAGES_COUNT})`, type: "invalid_request" });
    }
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg || typeof msg !== 'object') {
        return res.status(400).json({ error: `messages[${i}] must be an object`, type: "invalid_request" });
      }
      if (!ALLOWED_ROLES.has(msg.role)) {
        return res.status(400).json({ error: `messages[${i}].role is invalid`, type: "invalid_request" });
      }
    }
  }

  next();
}

/**
 * Sanitizes messages by removing potentially dangerous content
 * @param {Array<{role: string, content?: string|Array}>} messages
 * @returns {Array<{role: string, content?: string|Array}>}
 */
export function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages.map(msg => {
    if (!msg || typeof msg !== 'object') return msg;

    const sanitized = { ...msg };

    // Strip any non-standard fields that could cause issues
    if (typeof sanitized.content === 'string') {
      // Remove null bytes
      sanitized.content = sanitized.content.replace(/\0/g, '');
    }

    return sanitized;
  }).filter(Boolean);
}
