/**
 * Express Middleware
 * 
 * rateLimiter      – Sliding window rate limiting
 * requestLogger    – Structured request logging
 * errorHandler     – Centralised error handling
 * corsHandler      – CORS configuration
 * validateChatRequest – Input validation for chat endpoints
 */

// ── Rate Limiter ────────────────────────────────────────────────────────
/**
 * Sliding window rate limiter using in-memory store.
 * 
 * @param {Object} options
 * @param {number} options.windowMs – Time window in milliseconds (default: 60000 = 1 min)
 * @param {number} options.maxRequests – Max requests per window (default: 60)
 * @param {string} options.keyExtractor – Function to extract rate limit key from req
 * @returns {Function} Express middleware
 */
export function rateLimiter(options = {}) {
  const {
    windowMs = 60 * 1000,
    maxRequests = 60,
    keyExtractor = (req) => req.ip || req.connection?.remoteAddress || 'unknown',
  } = options;

  // In-memory store: Map<key, { timestamps: number[] }>
  const store = new Map();

  // Periodically clean up expired entries (every 5 minutes)
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Prevent the timer from keeping the process alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    const key = keyExtractor(req);
    const now = Date.now();

    if (!store.has(key)) {
      store.set(key, { timestamps: [] });
    }

    const record = store.get(key);

    // Remove timestamps outside the window
    record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

    // Check limit
    if (record.timestamps.length >= maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterMs = windowMs - (now - oldestInWindow);
      res.set('Retry-After', Math.ceil(retryAfterMs / 1000).toString());
      res.status(429).json({
        error: 'Rate limit exceeded',
        type: 'rate_limit_error',
        retry_after_seconds: Math.ceil(retryAfterMs / 1000),
        limit: maxRequests,
        window_ms: windowMs,
      });
      return;
    }

    // Record this request
    record.timestamps.push(now);

    // Set rate limit headers
    const remaining = maxRequests - record.timestamps.length;
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
    });

    next();
  };
}

// ── Request Logger ──────────────────────────────────────────────────────
/**
 * Structured request logging middleware.
 * Logs method, URL, status code, response time, and content length.
 */
export function requestLogger() {
  return (req, res, next) => {
    const start = Date.now();
    const requestId = `req-${start}-${Math.random().toString(36).slice(2, 8)}`;

    // Attach request ID for tracing
    req.requestId = requestId;
    res.set('X-Request-ID', requestId);

    // Log request
    console.log(`[REQUEST] ${requestId} ${req.method} ${req.url}`);

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      const contentLength = res.get('Content-Length') || '-';

      console.log(
        `[RESPONSE] ${requestId} ${req.method} ${req.url} ` +
        `${res.statusCode} ${duration}ms ${contentLength}b`
      );
    });

    next();
  };
}

// ── Error Handler ───────────────────────────────────────────────────────
/**
 * Centralised error handling middleware.
 * Must be registered AFTER all routes.
 */
export function errorHandler(err, req, res, _next) {
  const requestId = req.requestId || 'unknown';
  const timestamp = new Date().toISOString();

  // Determine status code
  let statusCode = 500;
  let errorType = 'internal_error';
  let errorMessage = err.message || 'An unexpected error occurred';

  // Classify known errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'validation_error';
  } else if (err.name === 'UnauthorizedError' || err.message?.includes('auth')) {
    statusCode = 401;
    errorType = 'authentication_error';
  } else if (err.message?.includes('rate limit') || err.message?.includes('Rate limit')) {
    statusCode = 429;
    errorType = 'rate_limit_error';
  } else if (err.message?.includes('not found') || err.message?.includes('Unknown provider')) {
    statusCode = 404;
    errorType = 'not_found';
  } else if (err.message?.includes('timeout') || err.message?.includes('ETIMEDOUT')) {
    statusCode = 504;
    errorType = 'timeout_error';
  } else if (err.message?.includes('All providers failed')) {
    statusCode = 502;
    errorType = 'provider_error';
  }

  // Log error
  console.error(
    `[ERROR] ${requestId} ${statusCode} ${errorType}: ${errorMessage}`,
    err.stack ? `\n${err.stack}` : ''
  );

  // Send error response
  const response = {
    error: {
      type: errorType,
      message: errorMessage,
      request_id: requestId,
      timestamp,
    },
  };

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

// ── CORS Handler ────────────────────────────────────────────────────────
/**
 * CORS configuration middleware.
 * Allows all origins by default (gateway is meant to be a backend service).
 */
export function corsHandler(options = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Original-Host'],
    exposeHeaders = ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge = 86400,
    credentials = false,
  } = options;

  return (req, res, next) => {
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': methods.join(', '),
      'Access-Control-Allow-Headers': allowedHeaders.join(', '),
      'Access-Control-Expose-Headers': exposeHeaders.join(', '),
      'Access-Control-Max-Age': maxAge.toString(),
      'Access-Control-Allow-Credentials': credentials.toString(),
    });

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

// ── Input Validation ────────────────────────────────────────────────────
/**
 * Validate chat request body.
 * Ensures messages array is present and properly formatted.
 */
export function validateChatRequest(req, res, next) {
  const { messages, model, stream } = req.body;

  // Validate messages
  if (!messages) {
    return res.status(400).json({
      error: {
        type: 'validation_error',
        message: 'messages is required',
      },
    });
  }

  if (!Array.isArray(messages)) {
    return res.status(400).json({
      error: {
        type: 'validation_error',
        message: 'messages must be an array',
      },
    });
  }

  // Validate each message has required fields
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg.role) {
      return res.status(400).json({
        error: {
          type: 'validation_error',
          message: `messages[${i}].role is required`,
        },
      });
    }

    if (!msg.content && msg.content !== '') {
      return res.status(400).json({
        error: {
          type: 'validation_error',
          message: `messages[${i}].content is required`,
        },
      });
    }

    // Validate role values
    const validRoles = ['system', 'user', 'assistant', 'tool'];
    if (!validRoles.includes(msg.role)) {
      return res.status(400).json({
        error: {
          type: 'validation_error',
          message: `messages[${i}].role must be one of: ${validRoles.join(', ')}`,
        },
      });
    }
  }

  // Validate stream parameter if provided
  if (stream !== undefined && typeof stream !== 'boolean') {
    return res.status(400).json({
      error: {
        type: 'validation_error',
        message: 'stream must be a boolean',
      },
    });
  }

  // Validate model parameter if provided
  if (model !== undefined && typeof model !== 'string') {
    return res.status(400).json({
      error: {
        type: 'validation_error',
        message: 'model must be a string',
      },
    });
  }

  next();
}

export default {
  rateLimiter,
  requestLogger,
  errorHandler,
  corsHandler,
  validateChatRequest,
};
