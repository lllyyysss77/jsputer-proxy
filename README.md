<div align="center">

# ProxyGateLLM — The Biggest Free Multi-LLM Hub
*formerly jsputer-proxy*

**OpenAI/Anthropic-compatible API with 9+ free providers, round-robin failover, streaming, auto-routing, PWA dashboard, and AI agent. No API keys required for core providers.**

<br/>

[![MIT License](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/Version-4.0.0-6366f1?style=for-the-badge&logo=semver)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/releases)
[![GitHub Stars](https://img.shields.io/github/stars/mulkymalikuldhrs/ProxyGateLLM?style=for-the-badge&logo=github&color=FFD700)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/stargazers)

<br/>

</div>

---

## Features

- 🆓 **100% Free** — No API keys required for core providers (Pollinations, DuckDuckGo, Puter)
- 🔄 **Multi-Provider** — 9 providers with automatic failover and round-robin load balancing
- 🌊 **Streaming** — Real-time SSE streaming for all endpoints
- 🎯 **Auto-Routing** — Intelligent model selection based on query type
- 📊 **Dashboard** — Professional PWA dashboard with real-time monitoring
- 🤖 **AI Agent** — Standalone AI agent without backend
- 🔌 **Compatible** — Drop-in replacement for OpenAI and Anthropic APIs
- 🏥 **Health Checks** — Automatic provider health monitoring
- 🔄 **Auto-Sync** — Automatic model list synchronization
- 🐳 **Portable** — Single Node.js process, no database needed

---

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌────────────────────────────────────┐
│  Client  │────▶│  Express │────▶│  Router  │────▶│       Provider Manager            │
│ (any SDK)│     │  Server  │     │ (Smart)  │     │  (round-robin + failover)         │
└──────────┘     └──────────┘     └──────────┘     └────────────────────────────────────┘
                                                        │
                                          ┌─────────────┼─────────────┐
                                          │             │             │
                                    ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
                                    │  P1: Free  │ │  P2: Key   │ │  P3: Fragile│
                                    │  No Auth   │ │  Free Key  │ │  Unstable  │
                                    └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                                          │             │             │
                                   Puter  Pollinations  Groq     Blackbox
                                   DDG    OpenRouter    HF       Phind
                                          G4F
```

---

## Providers

| Provider | Priority | Auth Required | Models | Status |
|----------|----------|--------------|--------|--------|
| **Puter.js SDK** | P1 | Optional | 14+ | ✅ Stable |
| **Pollinations AI** | P1 | None | 5+ | ✅ Stable |
| **DuckDuckGo AI** | P1 | None | 4+ | ✅ Stable |
| **OpenRouter Free** | P1 | Optional | Auto-sync | ✅ Stable |
| **Groq** | P2 | Free API Key | 4+ | ✅ Fast |
| **HuggingFace** | P2 | Free API Key | 3+ | ⚡ Inference |
| **G4F/FreeGPT** | P2 | None | 3+ | ⚡ Python |
| **Blackbox AI** | P3 | None | 2+ | 🔶 Fragile |
| **Phind** | P3 | None | 1+ | 🔶 Fragile |

> **Priority levels:** P1 = no auth needed, P2 = free API key, P3 = may be unstable

---

## Quick Start

### Install

```bash
# Clone the repository
git clone https://github.com/mulkymalikuldhrs/ProxyGateLLM.git
cd ProxyGateLLM

# Install dependencies
npm install
```

### Configure

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env — core providers work without any API keys!
# Optionally add free API keys for more providers:
#   GROQ_API_KEY=       (https://console.groq.com)
#   HUGGINGFACE_API_KEY= (https://huggingface.co/settings/tokens)
#   OPENROUTER_API_KEY=  (https://openrouter.ai/keys)
```

### Run

```bash
# Start the server
npm start

# Or use development mode with auto-reload
npm run dev
```

The gateway starts at `http://localhost:3333` by default.

### Verify

```bash
# Health check
curl http://localhost:3333/health

# List available models
curl http://localhost:3333/models

# Quick chat test
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello!"}]}'
```

---

## API Usage

### OpenAI-Compatible Endpoint

**cURL:**
```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Explain quantum computing in 3 sentences"}
    ]
  }'
```

**Python (OpenAI SDK):**
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3333/v1",
    api_key="not-needed"  # No API key required for core providers
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello, ProxyGateLLM!"}]
)

print(response.choices[0].message.content)
```

**JavaScript (Fetch):**
```javascript
const response = await fetch('http://localhost:3333/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello, ProxyGateLLM!' }]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

### Anthropic-Compatible Endpoint

```bash
curl -X POST http://localhost:3333/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4-5-latest",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Write a Python function to check if a number is prime"}
    ]
  }'
```

### Auto-Routing

Use `model: "auto"` to let ProxyGateLLM intelligently pick the best model:

```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Build a REST API"}]}'
```

**Auto-routing logic:**
| Task Type | Keywords | Routed Model |
|-----------|----------|-------------|
| Building | code, implement, debug, refactor, build... | `claude-opus-4-5-latest` |
| Planning | plan, design, strategy, architecture... | `deepseek-chat` |
| Reasoning | solve, explain, calculate, prove... | `gpt-4o` |
| Fast | simple question, <100 chars | `gpt-4o-mini` |
| Default | — | `deepseek-chat` |

### Model Aliases

Short aliases are resolved automatically:

| Alias | Resolves To |
|-------|------------|
| `gpt4` | `gpt-4o` |
| `claude` | `claude-opus-4-5-latest` |
| `deepseek` | `deepseek-chat` |
| `gemini` | `gemini-2.0-flash` |
| `grok` | `grok-3` |
| `llama` | `llama-3.1-70b` |
| `qwen-coder` | `qwen-2.5-coder-32b-instruct` |

---

## Streaming

All endpoints support real-time SSE streaming:

**cURL:**
```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "stream": true,
    "messages": [{"role": "user", "content": "Tell me a story"}]
  }'
```

**Python (OpenAI SDK):**
```python
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

**JavaScript (EventSource):**
```javascript
const response = await fetch('http://localhost:3333/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o',
    stream: true,
    messages: [{ role: 'user', content: 'Tell me a story' }]
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Parse SSE data lines
  for (const line of chunk.split('\n')) {
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      const data = JSON.parse(line.slice(6));
      const content = data.choices?.[0]?.delta?.content || '';
      if (content) process.stdout.write(content);
    }
  }
}
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat/completions` | POST | OpenAI-compatible chat completions |
| `/v1/messages` | POST | Anthropic-compatible messages |
| `/chat` | POST | Native auto-routed chat |
| `/models` | GET | List all available models |
| `/providers` | GET | Provider details and stats |
| `/providers/:name/health` | GET | Per-provider health check |
| `/health` | GET | Gateway health check |
| `/status` | GET | Full server + provider status |
| `/dashboard` | GET | PWA dashboard (web UI) |

---

## Configuration

All configuration is done via environment variables (`.env` file):

### Server

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3333` | Server port |
| `NODE_ENV` | `development` | Environment (production hides error details) |
| `LOG_LEVEL` | `info` | Logging verbosity |
| `CORS_ORIGIN` | `*` | Allowed CORS origin(s) |
| `API_KEY` | — | Optional API key for auth |

### Provider API Keys

| Variable | Provider | Get Key |
|----------|----------|---------|
| `PUTER_AUTH_TOKEN` | Puter.js | [puter.com](https://puter.com/#/account) (optional) |
| `GROQ_API_KEY` | Groq | [console.groq.com](https://console.groq.com) |
| `HUGGINGFACE_API_KEY` | HuggingFace | [huggingface.co](https://huggingface.co/settings/tokens) |
| `OPENROUTER_API_KEY` | OpenRouter | [openrouter.ai](https://openrouter.ai/keys) |

### Disable Providers

Set to `true` or `1` to disable:

| Variable | Default |
|----------|---------|
| `DISABLE_PUTER` | `false` |
| `DISABLE_POLLINATIONS` | `false` |
| `DISABLE_DUCKDUCKGO` | `false` |
| `DISABLE_OPENROUTER` | `false` |
| `DISABLE_GROQ` | `false` |
| `DISABLE_HUGGINGFACE` | `false` |
| `DISABLE_G4F` | `false` |
| `DISABLE_BLACKBOX` | `false` |
| `DISABLE_PHIND` | `false` |

### Rate Limiting & Health

| Variable | Default | Description |
|----------|---------|-------------|
| `RATELIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `RATELIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `HEALTH_CHECK_INTERVAL_MS` | `60000` | Provider health check interval |
| `MODEL_SYNC_INTERVAL_MS` | `3600000` | Model list sync interval (1 hour) |

---

## Dashboard

ProxyGateLLM includes a professional **PWA dashboard** accessible at `http://localhost:3333/dashboard`:

- **Overview** — Real-time stats, provider health, uptime
- **Providers** — Detailed per-provider metrics, latency, error rates
- **Models** — Searchable model grid with type badges and provider info
- **Playground** — Chat playground with model selector, format toggle, and streaming
- **API Reference** — Quick copy-paste code snippets for integration

The dashboard is a **Progressive Web App** — install it on your device for a native-like experience. Features a polished dark theme inspired by Vercel/Linear design systems, fully responsive for mobile.

---

## AI Agent

ProxyGateLLM includes a standalone AI agent that works without a backend:

```javascript
import { ProxyGateLLMAgent } from './agent/index.js';

const agent = new ProxyGateLLMAgent({
  baseUrl: 'http://localhost:3333',
  model: 'auto',
  format: 'openai'
});

// Simple chat
const response = await agent.chat('Explain quantum computing');

// Streaming chat
const streamResponse = await agent.chat('Tell me a story', {
  stream: true,
  onChunk: (chunk, full) => process.stdout.write(chunk)
});

// Multi-step reasoning
const result = await agent.reason('Design a microservices architecture', 3);
console.log(result.answer);

// Code generation with review
const code = await agent.generateCode('REST API with Express.js', 'javascript');
console.log(code.code);    // Generated code
console.log(code.review);  // Code review
```

**CLI Mode:**
```bash
node agent/index.js
```

Interactive REPL with commands: `quit`, `clear`, `models`.

---

## Project Structure

```
ProxyGateLLM/
├── index.js                  # Express server & API endpoints
├── router.js                 # Smart model routing & alias resolution
├── middleware.js              # Rate limiting, validation, auth
├── config/
│   └── providers.js          # Provider config, model mappings, aliases
├── providers/
│   ├── base.js               # BaseProvider abstract class
│   ├── index.js              # Provider Registry (auto-discovery)
│   ├── puter.js              # Puter.js SDK provider
│   ├── pollinations.js       # Pollinations AI provider
│   ├── duckduckgo.js         # DuckDuckGo AI Chat provider
│   ├── openrouter.js         # OpenRouter provider
│   ├── groq.js               # Groq provider
│   ├── huggingface.js        # HuggingFace Inference provider
│   ├── g4f.js                # G4F/FreeGPT provider
│   ├── blackbox.js           # Blackbox AI provider
│   └── phind.js              # Phind provider
├── utils/
│   ├── provider-manager.js   # Round-robin routing & failover
│   └── model-sync.js         # Auto model list sync service
├── agent/
│   └── index.js              # ProxyGateLLMAgent class + CLI
├── dashboard/
│   ├── index.html            # PWA dashboard (dark theme)
│   └── manifest.json         # PWA manifest
├── src/
│   ├── middleware.test.js    # Middleware tests
│   └── router.test.js       # Router tests
├── .env.example              # Environment template
├── package.json              # Project manifest
├── LICENSE                   # MIT License
└── README.md                 # This file
```

---

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Run tests
npm test

# Syntax check
npm run lint
```

### Adding a New Provider

1. Create a new file in `providers/` extending `BaseProvider`
2. Implement `chat()`, `chatStream()`, and `checkHealth()` methods
3. Register it in `providers/index.js`
4. Add config in `config/providers.js`
5. Add `DISABLE_<NAME>` env var support

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Author

**Mulky Malikul Dhaher**
[![GitHub](https://img.shields.io/badge/GitHub-mulkymalikuldhrs-181717?style=flat-square&logo=github)](https://github.com/mulkymalikuldhrs)

---

## Disclaimer

> **⚠️ This project is for Education Purpose only.**
>
> The authors and contributors assume no responsibility or liability for any damages, losses, or risks arising from the use of this software. Any use for commercial, illegal, or unethical purposes is strictly prohibited.

---

<div align="center">

**ProxyGateLLM** — Free AI Access for Everyone 🚀

[⬆ Back to Top](#proxygatelymm--the-biggest-free-multi-llm-hub)

</div>
