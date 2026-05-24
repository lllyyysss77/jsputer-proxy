/**
 * Z.ai Provider Adapter
 * 
 * Uses the z-ai-web-dev-sdk for chat completions via Z.ai's API.
 * Specialised for: reasoning, general intelligence, creative tasks.
 * Handles async initialisation via ZAI.create().
 * 
 * NOTE: The Z.ai SDK's streaming mode returns raw SSE text as
 * character codes (index-keyed objects). This adapter properly
 * parses the SSE format and yields normalised chunks.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../../.env') });

// ── Lazy-loaded Z.ai SDK singleton ─────────────────────────────────────
let zaiInstance = null;
let initPromise = null;

async function getZaiClient() {
  if (zaiInstance) return zaiInstance;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const { default: ZAI } = await import('z-ai-web-dev-sdk');
        const client = await ZAI.create();
        zaiInstance = client;
        return client;
      } catch (error) {
        initPromise = null; // Allow retry
        throw new Error(`Z.ai SDK initialisation failed: ${error.message}`);
      }
    })();
  }

  return initPromise;
}

// ── Normalisation helpers ───────────────────────────────────────────────
function normalizeResponse(raw, model) {
  if (raw?.choices?.[0]?.message) {
    return {
      id: raw.id || `zai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      object: 'chat.completion',
      created: raw.created || Math.floor(Date.now() / 1000),
      model: raw.model || model || 'zai-default',
      choices: raw.choices.map(c => ({
        index: c.index ?? 0,
        message: {
          role: c.message?.role || 'assistant',
          content: c.message?.content || '',
        },
        finish_reason: c.finish_reason || 'stop',
      })),
      usage: raw.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      provider: 'zai',
    };
  }

  const content = typeof raw === 'string' ? raw : JSON.stringify(raw);
  return {
    id: `zai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model || 'zai-default',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: 'stop',
      },
    ],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    provider: 'zai',
  };
}

/**
 * Parse raw SSE text from Z.ai SDK into individual data chunks.
 * The Z.ai SDK yields character codes which form SSE text like:
 *   data: {"id":"...","choices":[...]}
 *   data: [DONE]
 * 
 * @param {string} rawSSE – Full SSE text
 * @returns {Array<Object>} Parsed SSE data objects
 */
function parseSSEChunks(rawSSE) {
  const chunks = [];
  const lines = rawSSE.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('data:')) continue;

    const data = trimmed.slice(5).trim();
    if (data === '[DONE]') break;

    try {
      chunks.push(JSON.parse(data));
    } catch {
      // Skip malformed lines
    }
  }

  return chunks;
}

/**
 * Collect raw stream from Z.ai SDK into a string.
 * The SDK yields character codes (numbers or index-keyed objects).
 */
async function collectRawStream(stream) {
  const charCodes = [];

  for await (const chunk of stream) {
    if (typeof chunk === 'number') {
      charCodes.push(chunk);
    } else if (typeof chunk === 'string') {
      for (let i = 0; i < chunk.length; i++) {
        charCodes.push(chunk.charCodeAt(i));
      }
    } else if (Buffer.isBuffer(chunk)) {
      for (let i = 0; i < chunk.length; i++) {
        charCodes.push(chunk[i]);
      }
    } else if (typeof chunk === 'object' && chunk !== null) {
      // Index-keyed object: { "0": 100, "1": 97, ... }
      const keys = Object.keys(chunk)
        .filter(k => /^\d+$/.test(k))
        .sort((a, b) => parseInt(a) - parseInt(b));
      for (const key of keys) {
        charCodes.push(chunk[key]);
      }
    }
  }

  return String.fromCharCode(...charCodes);
}

// ── Provider interface ──────────────────────────────────────────────────
export const ZaiProvider = {
  name: 'zai',
  description: 'Z.ai – reasoning, general intelligence, creative tasks',

  models: {
    'zai-default': { type: 'reasoning', description: 'Z.ai default model – reasoning & creative' },
  },

  /**
   * Chat completion (non-streaming)
   */
  async chat(messages, options = {}) {
    const client = await getZaiClient();
    const model = options.model || 'zai-default';

    try {
      const params = {
        messages,
        model,
        stream: false,
      };

      if (options.temperature !== undefined) params.temperature = options.temperature;
      if (options.max_tokens !== undefined) params.max_tokens = options.max_tokens;
      if (options.top_p !== undefined) params.top_p = options.top_p;

      const response = await client.chat.completions.create(params);
      return normalizeResponse(response, model);
    } catch (error) {
      throw new Error(`Z.ai provider error: ${error.message}`);
    }
  },

  /**
   * Streaming chat completion.
   * The Z.ai SDK returns raw SSE text as character codes.
   * We collect, decode, parse SSE lines, and yield normalised chunks.
   */
  async *stream(messages, options = {}) {
    const client = await getZaiClient();
    const model = options.model || 'zai-default';
    const chatId = `zai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const params = {
        messages,
        model,
        stream: true,
      };

      if (options.temperature !== undefined) params.temperature = options.temperature;
      if (options.max_tokens !== undefined) params.max_tokens = options.max_tokens;

      const rawStream = await client.chat.completions.create(params);

      // Collect the full raw SSE text from the stream
      const rawSSE = await collectRawStream(rawStream);

      // Parse into individual SSE data objects
      const sseChunks = parseSSEChunks(rawSSE);

      for (const chunk of sseChunks) {
        const delta = chunk?.choices?.[0]?.delta;
        const finishReason = chunk?.choices?.[0]?.finish_reason;
        const content = delta?.content || '';

        if (content) {
          yield {
            id: chunk.id || chatId,
            object: 'chat.completion.chunk',
            created: chunk.created || Math.floor(Date.now() / 1000),
            model: chunk.model || model,
            choices: [
              {
                index: 0,
                delta: { content },
                finish_reason: null,
              },
            ],
            provider: 'zai',
          };
        }

        if (finishReason === 'stop') {
          yield {
            id: chunk.id || chatId,
            object: 'chat.completion.chunk',
            created: chunk.created || Math.floor(Date.now() / 1000),
            model: chunk.model || model,
            choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
            provider: 'zai',
          };
          return;
        }
      }

      // If no explicit stop was found, send final chunk
      yield {
        id: chatId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
        provider: 'zai',
      };
    } catch (error) {
      throw new Error(`Z.ai streaming error: ${error.message}`);
    }
  },

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const client = await getZaiClient();
      const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: 'ping' }],
        model: 'zai-default',
        stream: false,
      });
      return {
        provider: 'zai',
        status: 'healthy',
        models: Object.keys(this.models),
        detail: 'Z.ai SDK responsive',
      };
    } catch (error) {
      return {
        provider: 'zai',
        status: 'unhealthy',
        models: Object.keys(this.models),
        error: error.message,
      };
    }
  },
};

export default ZaiProvider;
