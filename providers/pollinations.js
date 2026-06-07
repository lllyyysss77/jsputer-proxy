// providers/pollinations.js
// Pollinations AI Provider — free, no API key, OpenAI-compatible endpoint

import { BaseProvider } from './base.js';
import { PROVIDER_CONFIG } from '../config/providers.js';

export class PollinationsProvider extends BaseProvider {
  constructor(config = {}) {
    const cfg = { ...PROVIDER_CONFIG.pollinations, ...config };
    super(cfg);
    this.baseUrl = cfg.baseUrl || 'https://text.pollinations.ai';
  }

  async chat(messages, options = {}) {
    const model = this._mapModel(options.model || 'openai');
    const url = `${this.baseUrl}/`;

    const body = {
      messages: this._formatMessages(messages),
      model: model,
      seed: Math.floor(Math.random() * 10000),
      jsonMode: false
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Pollinations API error ${response.status}: ${text}`);
      }

      const content = await response.text();

      if (options.format === 'anthropic') {
        return this.formatAnthropicResponse(content, options.model || model);
      }
      return this.formatOpenAIResponse(content, options.model || model);
    } finally {
      clearTimeout(timeout);
    }
  }

  async chatStream(messages, options = {}) {
    const model = this._mapModel(options.model || 'openai');
    const url = `${this.baseUrl}/openai/chat/completions`;

    const body = {
      messages: this._formatMessages(messages),
      model: model,
      stream: true
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Pollinations stream error: ${response.status}`);
    }

    return response.body;
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'ping' }],
          model: 'openai',
          seed: 1
        }),
        signal: AbortSignal.timeout(10000)
      });
      return response.ok;
    } catch (err) {
      throw new Error(`Pollinations health check failed: ${err.message}`);
    }
  }

  async fetchModels() {
    try {
      const response = await fetch('https://text.pollinations.ai/models', {
        signal: AbortSignal.timeout(10000)
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data.map(m => ({
            id: typeof m === 'string' ? m : m.id || m.name,
            type: 'general',
            description: typeof m === 'string' ? `${m} via Pollinations` : (m.description || `${m.id} via Pollinations`),
            maxTokens: 4096
          }));
        }
      }
    } catch {}
    return this.models;
  }

  _mapModel(requestedModel) {
    const mapping = {
      'gpt-4o-mini': 'openai',
      'gpt-4o': 'openai',
      'mistral-large': 'mistral',
      'mistral': 'mistral',
      'llama-3.1-70b': 'llama',
      'llama': 'llama',
      'deepseek-reasoner': 'deepseek-r1',
      'deepseek-r1': 'deepseek-r1',
      'qwen-coder': 'qwen',
      'qwen': 'qwen'
    };
    return mapping[requestedModel] || requestedModel;
  }

  _formatMessages(messages) {
    if (!Array.isArray(messages)) return messages;
    return messages.map(m => ({
      role: m.role || 'user',
      content: typeof m.content === 'string' ? m.content :
               Array.isArray(m.content) ? m.content.map(c => c.text || c).join('\n') : String(m.content || '')
    }));
  }
}
