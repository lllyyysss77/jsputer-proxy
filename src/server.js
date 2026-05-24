/**
 * Main Server – jsputer-ai-gateway v2.0
 * 
 * Multi-LLM Task-Based Gateway System.
 * Provides unified, auto-routed access to multiple AI providers.
 * 
 * Endpoints:
 *   POST /chat               → Unified interface with auto-routing
 *   POST /v1/chat/completions → OpenAI-compatible (with streaming)
 *   POST /v1/messages         → Anthropic-compatible
 *   POST /zai/chat            → Direct Z.ai route
 *   POST /qwen/chat           → Direct Qwen route
 *   POST /route               → Auto-routing engine (decision only)
 *   GET  /health              → Health check
 *   GET  /models              → List available models
 *   GET  /status              → Provider status
 */

import express from 'express';
import { routeTask, executeRouted, executeRoutedStream, getRoutingMap, getProviders } from './router.js';
import { streamResponse, responseToStream } from './stream.js';
import {
  rateLimiter,
  requestLogger,
  errorHandler,
  corsHandler,
  validateChatRequest,
} from './middleware.js';

const PORT = process.env.GATEWAY_PORT || 3333;

// ── App Setup ───────────────────────────────────────────────────────────
const app = express();

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware
app.use(corsHandler());
app.use(requestLogger());
app.use(rateLimiter({
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 120,        // 120 requests per minute
}));

// ── Providers (lazy-loaded via router) ──────────────────────────────────
const providers = getProviders();

// ── Helper: extract content for Anthropic format ────────────────────────
function extractContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map(c => (typeof c === 'string' ? c : c.text || '')).join('');
  if (content && typeof content === 'object') return content.text || content.content || JSON.stringify(content);
  return '';
}

// ═══════════════════════════════════════════════════════════════════════
// ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

// ── POST /chat ── Unified chat interface with auto-routing ─────────────
app.post('/chat', validateChatRequest, async (req, res) => {
  try {
    const { messages, model, stream, temperature, max_tokens } = req.body;

    // Override model/provider if explicitly specified
    const options = { temperature, max_tokens };
    if (model && model !== 'auto' && model !== 'Auto') {
      options.overrideModel = model;
      // If model matches a known provider, set override
      const routing = routeTask(messages, options);
      if (model.includes('qwen')) {
        options.overrideProvider = 'qwen';
      } else if (model.includes('deepseek')) {
        options.overrideProvider = 'puter';
      } else if (model.includes('gpt')) {
        options.overrideProvider = 'puter';
      } else if (model.includes('claude')) {
        options.overrideProvider = 'puter';
      }
    }

    if (stream) {
      const generator = await executeRoutedStream(messages, options);
      await streamResponse(res, generator, {
        onToken: (token) => { /* silent */ },
        onComplete: (content, count) => {
          console.log(`[Chat] Stream complete: ${count} tokens`);
        },
      });
    } else {
      const response = await executeRouted(messages, options);
      res.json(response);
    }
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
});

// ── POST /v1/chat/completions ── OpenAI-compatible API ─────────────────
app.post('/v1/chat/completions', validateChatRequest, async (req, res) => {
  try {
    const { messages, model, stream, temperature, max_tokens, top_p } = req.body;

    const options = { temperature, max_tokens, top_p };
    if (model && model !== 'auto' && model !== 'Auto') {
      options.overrideModel = model;
      if (model.includes('qwen')) options.overrideProvider = 'qwen';
      else if (model.includes('deepseek')) options.overrideProvider = 'puter';
      else if (model.includes('gpt')) options.overrideProvider = 'puter';
      else if (model.includes('claude')) options.overrideProvider = 'puter';
    }

    if (stream) {
      const generator = await executeRoutedStream(messages, options);
      await streamResponse(res, generator);
    } else {
      const response = await executeRouted(messages, options);
      res.json(response);
    }
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
});

// ── POST /v1/messages ── Anthropic-compatible API ──────────────────────
app.post('/v1/messages', async (req, res) => {
  try {
    const { messages, model, max_tokens, stream, system, prompt } = req.body;

    // Build messages array in OpenAI format
    let allMessages = [];
    if (system) {
      allMessages.push({ role: 'system', content: system });
    }
    if (messages && Array.isArray(messages)) {
      allMessages.push(...messages);
    } else if (prompt) {
      allMessages.push({ role: 'user', content: prompt });
    }

    if (allMessages.length === 0) {
      allMessages.push({ role: 'user', content: '' });
    }

    const options = { max_tokens: max_tokens || 4096 };
    if (model && model !== 'auto' && model !== 'Auto') {
      options.overrideModel = model;
      if (model.includes('claude')) options.overrideProvider = 'puter';
      else if (model.includes('qwen')) options.overrideProvider = 'qwen';
      else if (model.includes('deepseek')) options.overrideProvider = 'puter';
    }

    if (stream) {
      const generator = await executeRoutedStream(allMessages, options);
      await streamResponse(res, generator);
    } else {
      const response = await executeRouted(allMessages, options);
      const contentText = response?.choices?.[0]?.message?.content || '';

      // Transform to Anthropic format
      res.json({
        id: response?.id || `msg_${Date.now()}`,
        type: 'message',
        role: 'assistant',
        content: contentText ? [{ type: 'text', text: contentText }] : [],
        model: model || response?.model || 'auto',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: response?.usage?.prompt_tokens || 0,
          output_tokens: response?.usage?.completion_tokens || 0,
        },
      });
    }
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
});

// ── POST /zai/chat ── Direct Z.ai route ────────────────────────────────
app.post('/zai/chat', validateChatRequest, async (req, res) => {
  try {
    const { messages, stream, temperature, max_tokens } = req.body;
    const zai = providers.zai;

    if (stream) {
      const generator = await zai.stream(messages, { temperature, max_tokens });
      await streamResponse(res, generator);
    } else {
      const response = await zai.chat(messages, { temperature, max_tokens });
      res.json(response);
    }
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
});

// ── POST /qwen/chat ── Direct Qwen route ───────────────────────────────
app.post('/qwen/chat', validateChatRequest, async (req, res) => {
  try {
    const { messages, stream, temperature, max_tokens, model } = req.body;
    const qwen = providers.qwen;

    if (stream) {
      const generator = await qwen.stream(messages, { temperature, max_tokens, model });
      await streamResponse(res, generator);
    } else {
      const response = await qwen.chat(messages, { temperature, max_tokens, model });
      res.json(response);
    }
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
});

// ── POST /route ── Auto-routing decision (no execution) ────────────────
app.post('/route', (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: { type: 'validation_error', message: 'messages array is required' },
      });
    }

    const decision = routeTask(messages);
    res.json({
      routing: decision,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
});

// ── GET /health ── Health check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'jsputer-ai-gateway',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

// ── GET /models ── List available models ───────────────────────────────
app.get('/models', (req, res) => {
  const routingMap = getRoutingMap();
  const allModels = [];

  for (const [providerName, provider] of Object.entries(providers)) {
    for (const [modelId, modelInfo] of Object.entries(provider.models || {})) {
      // Find which task types route to this model
      const taskTypes = [];
      for (const [taskType, route] of Object.entries(routingMap)) {
        if (route.primary.model === modelId && route.primary.provider === providerName) {
          taskTypes.push(taskType);
        }
        if (route.fallback?.model === modelId && route.fallback?.provider === providerName) {
          taskTypes.push(`${taskType} (fallback)`);
        }
      }

      allModels.push({
        id: modelId,
        provider: providerName,
        type: modelInfo.type,
        description: modelInfo.description,
        task_types: taskTypes,
      });
    }
  }

  res.json({
    object: 'list',
    data: allModels,
    count: allModels.length,
  });
});

// ── GET /status ── Provider status ─────────────────────────────────────
app.get('/status', async (req, res) => {
  const statusPromises = Object.entries(providers).map(async ([name, provider]) => {
    try {
      return await provider.healthCheck();
    } catch (error) {
      return {
        provider: name,
        status: 'error',
        error: error.message,
      };
    }
  });

  const statuses = await Promise.allSettled(statusPromises);
  const results = statuses.map(s => s.status === 'fulfilled' ? s.value : {
    provider: 'unknown',
    status: 'error',
    error: s.reason?.message || 'Unknown error',
  });

  const overallHealthy = results.every(r => r.status === 'healthy');

  res.json({
    status: overallHealthy ? 'healthy' : 'degraded',
    providers: results,
    routing: getRoutingMap(),
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: {
      type: 'not_found',
      message: `Route ${req.method} ${req.url} not found`,
      available_endpoints: [
        'POST /chat',
        'POST /v1/chat/completions',
        'POST /v1/messages',
        'POST /zai/chat',
        'POST /qwen/chat',
        'POST /route',
        'GET /health',
        'GET /models',
        'GET /status',
      ],
    },
  });
});

// ── Global error handler (must be last) ─────────────────────────────────
app.use(errorHandler);

// ── Start server ────────────────────────────────────────────────────────
export function startServer(port) {
  const serverPort = port || PORT;

  const server = app.listen(serverPort, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║       jsputer-ai-gateway v2.0 — Multi-LLM Gateway       ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  Server: http://localhost:${serverPort}                       ║`);
    console.log('║                                                          ║');
    console.log('║  Endpoints:                                              ║');
    console.log('║    POST /chat               Auto-routed chat            ║');
    console.log('║    POST /v1/chat/completions OpenAI-compatible           ║');
    console.log('║    POST /v1/messages         Anthropic-compatible        ║');
    console.log('║    POST /zai/chat            Direct Z.ai                 ║');
    console.log('║    POST /qwen/chat           Direct Qwen                 ║');
    console.log('║    POST /route               Routing decision only       ║');
    console.log('║    GET  /health              Health check                ║');
    console.log('║    GET  /models              Available models            ║');
    console.log('║    GET  /status              Provider status             ║');
    console.log('║                                                          ║');
    console.log('║  Providers: Puter.js | Qwen | Z.ai                      ║');
    console.log('║  Features: Auto-routing | Streaming | Hybrid exec        ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] Closed all connections');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

export default app;
