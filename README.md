# ProxyGateLLM v5.0.0

<p align="center">
  <strong>The Biggest Free Multi-LLM Hub</strong><br>
  OpenAI/Anthropic-compatible API gateway with 378+ models across 13 providers
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#api-reference">API</a> •
  <a href="#dashboard">Dashboard</a> •
  <a href="#providers">Providers</a> •
  <a href="https://github.com/mulkymalikuldhrs/ProxyGateLLM">GitHub</a>
</p>

---

## What is ProxyGateLLM?

ProxyGateLLM is a **free, self-hosted LLM gateway** that provides a single OpenAI/Anthropic-compatible endpoint to access **378+ AI models** from **13 providers** — no API keys required for end users.

Think of it as the **"Cloudflare Workers for AI"** — a reverse proxy that wraps multiple free LLM providers into one unified API.

### Why ProxyGateLLM?

| Feature | ProxyGateLLM | OpenRouter | LiteLLM |
|---------|-------------|------------|---------|
| Free access (no API key) | ✅ | ❌ | ❌ |
| Self-hosted | ✅ | ❌ | ✅ |
| MCP Server built-in | ✅ | ❌ | ❌ |
| AI Agent built-in | ✅ | ❌ | ❌ |
| Models available | 378+ | 300+ | 100+ |
| OpenAI-compatible | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ❌ |
| Custom domain | ✅ | ✅ | ✅ |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/mulkymalikuldhrs/ProxyGateLLM.git
cd ProxyGateLLM
npm install
```

### 2. Configure (optional)

```bash
cp .env.example .env
# Edit .env with your preferences (all optional)
```

### 3. Start

```bash
npm start
# or
node index.js
```

### 4. Use

```python
# Python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3333/v1",
    api_key="your-key-here"  # or leave empty
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

```bash
# cURL
curl http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## Features

### Core Features

- **378+ Models** — Access GPT-4o, Claude, Gemini, Llama, Mistral, and more
- **13 Providers** — Pollinations, OpenRouter, Groq, Google AI, and more
- **OpenAI-Compatible API** — Drop-in replacement for OpenAI SDK
- **Anthropic-Compatible API** — Use with Claude SDK
- **Streaming** — Real-time response streaming via SSE
- **Auto-Routing** — Smart model selection based on task type
- **Failover** — Automatic provider switching on failure
- **Rate Limiting** — Built-in per-IP rate limiting
- **MCP Server** — Model Context Protocol support
- **AI Agent** — Built-in agent capabilities

### Dashboard Features

- **Overview** — Real-time provider health monitoring
- **Providers** — Detailed provider status and configuration
- **Models** — Full model catalog with filtering
- **Playground** — Interactive chat with any model
- **Compare** — Side-by-side model comparison
- **Analytics** — Request tracking and performance metrics
- **API Reference** — Complete API documentation
- **Custom Domain** — Domain setup wizard
- **Settings** — Gateway configuration

---

## API Reference

### OpenAI-Compatible Endpoint

```
POST /v1/chat/completions
```

**Request Body:**

```json
{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Response:**

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

### Anthropic-Compatible Endpoint

```
POST /v1/messages
```

### Other Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/status` | Server + provider status |
| GET | `/models` | List all available models |
| GET | `/providers` | Provider details & stats |
| GET | `/logs` | Request logs |
| POST | `/mcp` | MCP (Model Context Protocol) |
| GET | `/dashboard` | Web dashboard |

---

## Providers

| Provider | Models | Status |
|----------|--------|--------|
| Puter.js SDK | 14 | ⚠️ Rate limited |
| Pollinations AI | 6 | ✅ Healthy |
| OpenRouter Free | 337 | ✅ Healthy |
| Groq | 16 | ✅ Healthy |
| Google AI Studio | 4 | ✅ Healthy |
| G4F/FreeGPT | 3 | ✅ Healthy |
| Blackbox AI | 2 | ✅ Healthy |
| Phind | 1 | ✅ Healthy |
| HuggingFace | 3 | ⚠️ Unknown |
| Cerebras | 3 | ⚠️ Unknown |
| Cloudflare | 4 | ⚠️ Unknown |
| Cohere | 3 | ⚠️ Unknown |

---

## Configuration

All configuration is via environment variables in `.env`:

```bash
# Server
PORT=3333
NODE_ENV=production

# CORS
CORS_ORIGIN=*  # or specific domain

# Rate Limiting
RATELIMIT_WINDOW_MS=60000
RATELIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info  # info or debug

# API Key (optional)
API_KEY=your-secret-key
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ProxyGateLLM                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Express   │  │   Router    │  │  Rate Limit │     │
│  │   Server    │  │   (Smart)   │  │  (Per-IP)   │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │              │
│  ┌──────┴────────────────┴────────────────┴──────┐     │
│  │              Provider Manager                  │     │
│  │         (Auto-failover & Health)               │     │
│  └──────┬──────┬──────┬──────┬──────┬──────┬─────┘     │
│         │      │      │      │      │      │            │
│  ┌──────┴┐ ┌───┴──┐ ┌─┴───┐ ┌┴────┐ ┌┴────┐ ┌┴────┐  │
│  │Pollin.│ │OpenR.│ │Groq │ │G4F  │ │BB AI│ │More│  │
│  └───────┘ └──────┘ └─────┘ └─────┘ └─────┘ └────┘  │
└─────────────────────────────────────────────────────────┘
         ↑
    Client Request
    POST /v1/chat/completions
    { model: "gpt-4o", messages: [...] }
```

---

## Custom Domain Setup

1. Deploy ProxyGateLLM to your server
2. Point your domain to the server (DNS A record)
3. Set `CORS_ORIGIN=https://yourdomain.com` in `.env`
4. Use `https://yourdomain.com/v1` as your base URL

### Examples

```python
# Python
client = OpenAI(base_url="https://api.yourdomain.com/v1")

# Node.js
const client = new OpenAI({ baseURL: "https://api.yourdomain.com/v1" });

# cURL
curl https://api.yourdomain.com/v1/chat/completions ...
```

---

## Development

```bash
# Install dependencies
npm install

# Run in dev mode (auto-restart)
npm run dev

# Run tests
npm test

# Lint
npm run lint

# Check health
npm run health

# List models
npm run models
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing`)
3. Commit your changes (`git commit -m 'feat: amazing feature'`)
4. Push to the branch (`git push origin feat/amazing`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- **GitHub Issues**: [github.com/mulkymalikuldhrs/ProxyGateLLM/issues](https://github.com/mulkymalikuldhrs/ProxyGateLLM/issues)
- **Documentation**: [API.md](API.md) | [ARCHITECTURE.md](ARCHITECTURE.md) | [TUTORIAL.md](TUTORIAL.md)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/mulkymalikuldhrs">Mulky Malikul Dhaher</a>
</p>
