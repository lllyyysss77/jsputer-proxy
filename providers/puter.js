// providers/puter.js
// Puter.js SDK Provider — existing provider, wrapped as BaseProvider

import { BaseProvider } from './base.js';
import { PROVIDER_CONFIG } from '../config/providers.js';
import { init } from '@heyputer/puter.js/src/init.cjs';

export class PuterProvider extends BaseProvider {
  constructor(config = {}) {
    const cfg = { ...PROVIDER_CONFIG.puter, ...config };
    super(cfg);
    this.puter = null;
    this._initPuter();
  }

  _initPuter() {
    try {
      const authToken = process.env.PUTER_AUTH_TOKEN || process.env.puterAuthToken;
      if (authToken) {
        this.puter = init(authToken);
        console.log(`[PUTER] Initialized with auth token`);
      } else {
        this.puter = init();
        console.log(`[PUTER] Initialized without auth token — some models may be limited`);
      }
    } catch (err) {
      console.warn(`[PUTER] Init failed: ${err.message}`);
      this.enabled = false;
    }
  }

  async chat(messages, options = {}) {
    const model = options.model || 'deepseek-chat';
    const response = await this.puter.ai.chat(messages, {
      model: model,
      stream: false
    });

    let content = '';
    if (typeof response === 'string') {
      content = response;
    } else if (response?.message?.content) {
      content = typeof response.message.content === 'string'
        ? response.message.content
        : response.message.content.map(c => c.text || '').join('');
    } else if (response?.text) {
      content = response.text;
    }

    if (options.format === 'anthropic') {
      return this.formatAnthropicResponse(content, model, response?.usage);
    }
    return this.formatOpenAIResponse(content, model, response?.usage);
  }

  async chatStream(messages, options = {}) {
    const model = options.model || 'deepseek-chat';
    const stream = await this.puter.ai.chat(messages, {
      model: model,
      stream: true
    });
    return stream;
  }

  async checkHealth() {
    try {
      const response = await this.puter.ai.chat('ping', {
        model: 'gpt-4o-mini',
        stream: false
      });
      return !!response;
    } catch (err) {
      throw new Error(`Puter health check failed: ${err.message}`);
    }
  }
}
