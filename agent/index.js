// agent/index.js
// ProxyGateLLM Agent — Full AI Agent without backend
// Calls ProxyGateLLM API directly from browser/Node.js

const PROXYGATELLM_BASE = process.env.PROXYGATELLM_URL || 'http://localhost:3333';

/**
 * ProxyGateLLM Agent — a fully functional AI agent that doesn't need a backend.
 * Uses the ProxyGateLLM multi-LLM gateway for all AI operations.
 */
export class ProxyGateLLMAgent {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || PROXYGATELLM_BASE;
    this.model = config.model || 'auto';
    this.format = config.format || 'openai';
    this.history = [];
    this.systemPrompt = config.systemPrompt || `You are ProxyGateLLM Agent, a powerful assistant powered by the ProxyGateLLM — the biggest free multi-LLM hub. You have access to multiple AI models and can help with any task. Be helpful, accurate, and thorough.`;
    this.maxHistory = config.maxHistory || 50;
    this.tools = config.tools || [];
  }

  /**
   * Send a message and get a response
   */
  async chat(userMessage, options = {}) {
    this.history.push({ role: 'user', content: userMessage });

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.history.slice(-this.maxHistory)
    ];

    const model = options.model || this.model;
    const stream = options.stream ?? false;

    const endpoint = this.format === 'anthropic'
      ? `${this.baseUrl}/v1/messages`
      : `${this.baseUrl}/v1/chat/completions`;

    const body = this.format === 'anthropic'
      ? { model, messages, stream, max_tokens: 4096, system: this.systemPrompt }
      : { model, messages, stream };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error ${response.status}: ${error}`);
      }

      if (stream) {
        return this._handleStream(response, options.onChunk);
      }

      const data = await response.json();

      let content;
      if (this.format === 'anthropic') {
        content = data.content?.[0]?.text || '';
      } else {
        content = data.choices?.[0]?.message?.content || '';
      }

      this.history.push({ role: 'assistant', content });
      return content;

    } catch (error) {
      // Remove the user message we just added if request failed
      this.history.pop();
      throw error;
    }
  }

  /**
   * Handle streaming response
   */
  async _handleStream(response, onChunk) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed.choices?.[0]?.delta?.content ||
                          parsed.delta?.text || '';
            if (chunk) {
              fullContent += chunk;
              onChunk?.(chunk, fullContent);
            }
          } catch {}
        }
      }
    }

    this.history.push({ role: 'assistant', content: fullContent });
    return fullContent;
  }

  /**
   * Multi-step reasoning — break down complex tasks
   */
  async reason(task, steps = 3) {
    const steps_result = [];

    for (let i = 0; i < steps; i++) {
      const prompt = i === 0
        ? `Task: ${task}\n\nThink step by step. This is step ${i+1} of ${steps}. What should we analyze first?`
        : `Previous analysis:\n${steps_result.join('\n')}\n\nContinuing with step ${i+1} of ${steps}. What's the next step in our analysis?`;

      const result = await this.chat(prompt, { model: 'deepseek-chat' });
      steps_result.push(`Step ${i+1}: ${result}`);
    }

    // Final synthesis
    const synthesis = await this.chat(
      `Based on this analysis:\n${steps_result.join('\n')}\n\nProvide a final comprehensive answer to the original task: ${task}`,
      { model: 'claude-opus-4-5-latest' }
    );

    return { steps: steps_result, answer: synthesis };
  }

  /**
   * Code generation with review
   */
  async generateCode(spec, language = 'auto') {
    // Generate code
    const code = await this.chat(
      `Generate ${language !== 'auto' ? language : ''} code for: ${spec}\n\nProvide ONLY the code, no explanations.`,
      { model: 'claude-opus-4-5-latest' }
    );

    // Review the code
    const review = await this.chat(
      `Review this code for bugs, security issues, and improvements:\n\n${code}\n\nProvide specific fixes if needed.`,
      { model: 'deepseek-chat' }
    );

    return { code, review };
  }

  /**
   * Clear conversation history
   */
  clear() {
    this.history = [];
  }

  /**
   * Get available models from the gateway
   */
  async listModels() {
    const res = await fetch(`${this.baseUrl}/models`);
    const data = await res.json();
    return data.data || [];
  }

  /**
   * Get gateway status
   */
  async status() {
    const res = await fetch(`${this.baseUrl}/status`);
    return res.json();
  }
}

// ── CLI Mode (when run directly) ────────────────────────────────
if (typeof process !== 'undefined' && process.argv[1]?.includes('agent')) {
  import('readline').then(({ createInterface }) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const agent = new ProxyGateLLMAgent();

    console.log('\n🤖 ProxyGateLLM Agent (type "quit" to exit, "clear" to reset, "models" to list models)\n');

    const ask = () => {
      rl.question('You: ', async (input) => {
        const q = input.trim();
        if (!q) return ask();
        if (q.toLowerCase() === 'quit' || q.toLowerCase() === 'exit') {
          console.log('\nGoodbye!\n');
          return rl.close();
        }
        if (q.toLowerCase() === 'clear') {
          agent.clear();
          console.log('History cleared.\n');
          return ask();
        }
        if (q.toLowerCase() === 'models') {
          const models = await agent.listModels();
          console.log(`\n${models.length} models available:`);
          models.forEach(m => console.log(`  - ${m.id} (${(m.providers||[]).join(', ')})`));
          console.log();
          return ask();
        }

        try {
          process.stdout.write('Assistant: ');
          const response = await agent.chat(q, {
            stream: true,
            onChunk: (chunk) => process.stdout.write(chunk)
          });
          console.log('\n');
        } catch (err) {
          console.error(`\nError: ${err.message}\n`);
        }

        ask();
      });
    };

    ask();
  });
}

export default ProxyGateLLMAgent;
