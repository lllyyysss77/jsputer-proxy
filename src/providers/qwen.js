/**
 * Qwen Provider Adapter
 * 
 * Uses Puter.js SDK with the Qwen 2.5 Coder 32B model.
 * Specialised for: code generation, structured output, technical tasks, database queries.
 * Falls back to other Puter models when Qwen is unavailable.
 */

import { init } from '@heyputer/puter.js/src/init.cjs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../../.env') });

// ── Singleton ───────────────────────────────────────────────────────────
let puterClient = null;

function getClient() {
  if (!puterClient) {
    const authToken = process.env.PUTER_AUTH_TOKEN || process.env.puterAuthToken;
    if (!authToken) {
      throw new Error('PUTER_AUTH_TOKEN environment variable is required');
    }
    puterClient = init(authToken);
  }
  return puterClient;
}

// ── Constants ───────────────────────────────────────────────────────────
const PRIMARY_MODEL = 'qwen-2.5-coder-32b-instruct';
const FALLBACK_MODEL = 'deepseek-chat';

// ── Content helpers ─────────────────────────────────────────────────────
function extractContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map(c => (typeof c === 'string' ? c : c.text || '')).join('');
  if (content && typeof content === 'object') return content.text || content.content || JSON.stringify(content);
  return '';
}

function normalizeResponse(raw, model) {
  const message = raw?.message || raw;
  const contentText = extractContent(message?.content);

  return {
    id: `qwen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model || PRIMARY_MODEL,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: contentText },
        finish_reason: 'stop',
      },
    ],
    usage: raw?.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    provider: 'qwen',
  };
}

// ── Provider interface ──────────────────────────────────────────────────
export const QwenProvider = {
  name: 'qwen',
  description: 'Qwen 2.5 Coder 32B via Puter.js – code & structured output specialist',

  models: {
    [PRIMARY_MODEL]: { type: 'code', description: 'Qwen 2.5 Coder 32B – code generation, structured output' },
    [FALLBACK_MODEL]: { type: 'code', description: 'DeepSeek V3 – code fallback' },
  },

  /**
   * Chat completion with automatic fallback
   * @param {Array} messages
   * @param {Object} options – { model, temperature, max_tokens, ... }
   * @returns {Object} Normalised response
   */
  async chat(messages, options = {}) {
    const client = getClient();
    const model = options.model || PRIMARY_MODEL;

    // Try primary model first, fall back if it fails
    const modelsToTry = model === PRIMARY_MODEL
      ? [PRIMARY_MODEL, FALLBACK_MODEL]
      : [model];

    let lastError = null;
    for (const tryModel of modelsToTry) {
      try {
        const response = await client.ai.chat(messages, {
          model: tryModel,
          stream: false,
          ...(options.temperature !== undefined && { temperature: options.temperature }),
          ...(options.max_tokens !== undefined && { max_tokens: options.max_tokens }),
        });

        return normalizeResponse(response, tryModel);
      } catch (error) {
        lastError = error;
        console.warn(`[QwenProvider] Model ${tryModel} failed, trying fallback...`, error.message);
      }
    }

    throw new Error(`Qwen provider error (all models exhausted): ${lastError?.message}`);
  },

  /**
   * Streaming chat completion
   * @param {Array} messages
   * @param {Object} options
   * @yields {Object} Normalised streaming chunks
   */
  async *stream(messages, options = {}) {
    const client = getClient();
    const model = options.model || PRIMARY_MODEL;
    const chatId = `qwen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const response = await client.ai.chat(messages, {
        model,
        stream: true,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
        ...(options.max_tokens !== undefined && { max_tokens: options.max_tokens }),
      });

      if (response && typeof response[Symbol.asyncIterator] === 'function') {
        for await (const chunk of response) {
          const token = extractContent(chunk?.message?.content || chunk?.content || chunk);
          if (token) {
            yield {
              id: chatId,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model,
              choices: [{ index: 0, delta: { content: token }, finish_reason: null }],
              provider: 'qwen',
            };
          }
        }
      } else {
        const content = extractContent(response?.message?.content || response);
        if (content) {
          yield {
            id: chatId,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{ index: 0, delta: { content }, finish_reason: null }],
            provider: 'qwen',
          };
        }
      }

      yield {
        id: chatId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
        provider: 'qwen',
      };
    } catch (error) {
      throw new Error(`Qwen streaming error (${model}): ${error.message}`);
    }
  },

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const client = getClient();
      const response = await client.ai.chat(
        [{ role: 'user', content: 'ping' }],
        { model: PRIMARY_MODEL, stream: false },
      );
      return {
        provider: 'qwen',
        status: 'healthy',
        models: Object.keys(this.models),
        primary: PRIMARY_MODEL,
        detail: 'Qwen model responsive',
      };
    } catch (error) {
      return {
        provider: 'qwen',
        status: 'unhealthy',
        models: Object.keys(this.models),
        primary: PRIMARY_MODEL,
        error: error.message,
      };
    }
  },
};

export default QwenProvider;
