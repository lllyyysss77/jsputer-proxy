/**
 * Puter.js Provider Adapter
 * 
 * Wraps the Puter.js SDK into a standard provider interface.
 * Supports multiple models via Puter.ai.chat() including GPT-4o, DeepSeek, Claude, etc.
 */

import { init } from '@heyputer/puter.js/src/init.cjs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment from project root
config({ path: join(__dirname, '../../.env') });

// ── Singleton Puter client ──────────────────────────────────────────────
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

// ── Content extraction helpers ──────────────────────────────────────────
function extractContent(content) {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map(c => (typeof c === 'string' ? c : c.text || '')).join('');
  }
  if (content && typeof content === 'object') {
    return content.text || content.content || JSON.stringify(content);
  }
  return '';
}

function normalizeResponse(raw, model) {
  // Puter returns { message: { content, role, id, ... }, usage, ... }
  const message = raw?.message || raw;
  const contentText = extractContent(message?.content);

  return {
    id: `putr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model || 'puter-default',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: contentText },
        finish_reason: 'stop',
      },
    ],
    usage: raw?.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    provider: 'puter',
  };
}

// ── Provider interface ──────────────────────────────────────────────────
export const PuterProvider = {
  name: 'puter',
  description: 'Puter.js SDK – GPT-4o, DeepSeek, Claude and more via Puter cloud',

  /** Available models with specializations */
  models: {
    'gpt-4o': { type: 'general', description: 'OpenAI GPT-4o – multimodal, versatile' },
    'gpt-4o-mini': { type: 'fast', description: 'OpenAI GPT-4o-mini – fast and cheap' },
    'gpt-5-nano': { type: 'fast', description: 'GPT-5-nano – ultra-fast general' },
    'claude-opus-4-5-latest': { type: 'reasoning', description: 'Claude Opus – deep reasoning' },
    'deepseek-reasoner': { type: 'reasoning', description: 'DeepSeek R1 – reasoning chain' },
    'deepseek-chat': { type: 'code', description: 'DeepSeek V3 – code & chat' },
    'qwen-2.5-coder-32b-instruct': { type: 'code', description: 'Qwen 2.5 Coder 32B – code specialist' },
  },

  /**
   * Standard chat completion (non-streaming)
   * @param {Array} messages – OpenAI-style messages array
   * @param {Object} options – { model, temperature, max_tokens, ... }
   * @returns {Object} Normalised response
   */
  async chat(messages, options = {}) {
    const client = getClient();
    const model = options.model || 'gpt-4o';

    try {
      const response = await client.ai.chat(messages, {
        model,
        stream: false,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
        ...(options.max_tokens !== undefined && { max_tokens: options.max_tokens }),
      });

      return normalizeResponse(response, model);
    } catch (error) {
      throw new Error(`Puter provider error (${model}): ${error.message}`);
    }
  },

  /**
   * Streaming chat completion – yields SSE-compatible chunks
   * @param {Array} messages
   * @param {Object} options
   * @yields {Object} Normalised streaming chunks
   */
  async *stream(messages, options = {}) {
    const client = getClient();
    const model = options.model || 'gpt-4o';
    const chatId = `putr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const response = await client.ai.chat(messages, {
        model,
        stream: true,
        ...(options.temperature !== undefined && { temperature: options.temperature }),
        ...(options.max_tokens !== undefined && { max_tokens: options.max_tokens }),
      });

      // Puter streaming returns an async iterable
      if (response && typeof response[Symbol.asyncIterator] === 'function') {
        for await (const chunk of response) {
          const token = extractContent(chunk?.message?.content || chunk?.content || chunk);
          if (token) {
            yield {
              id: chatId,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model,
              choices: [
                {
                  index: 0,
                  delta: { content: token },
                  finish_reason: null,
                },
              ],
              provider: 'puter',
            };
          }
        }
      } else {
        // Fallback: if streaming not actually supported, yield whole response
        const content = extractContent(response?.message?.content || response);
        if (content) {
          yield {
            id: chatId,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [
              {
                index: 0,
                delta: { content },
                finish_reason: null,
              },
            ],
            provider: 'puter',
          };
        }
      }

      // Final chunk with finish_reason
      yield {
        id: chatId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: 'stop',
          },
        ],
        provider: 'puter',
      };
    } catch (error) {
      throw new Error(`Puter streaming error (${model}): ${error.message}`);
    }
  },

  /**
   * Health check – verifies Puter client is available
   */
  async healthCheck() {
    try {
      const client = getClient();
      // Attempt a minimal request to check connectivity
      const response = await client.ai.chat([{ role: 'user', content: 'ping' }], {
        model: 'gpt-4o-mini',
        stream: false,
      });
      return {
        provider: 'puter',
        status: 'healthy',
        models: Object.keys(this.models),
        detail: 'Puter SDK responsive',
      };
    } catch (error) {
      return {
        provider: 'puter',
        status: 'unhealthy',
        models: Object.keys(this.models),
        error: error.message,
      };
    }
  },
};

export default PuterProvider;
