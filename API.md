# ProxyGateLLM — Complete API Reference

<div align="center">

[![OpenAI Compatible](https://img.shields.io/badge/OpenAI-Compatible-412991?style=for-the-badge&logo=openai)](https://platform.openai.com/docs/api-reference)
[![Anthropic Compatible](https://img.shields.io/badge/Anthropic-Compatible-D97757?style=for-the-badge)](https://docs.anthropic.com/en/api)
[![Version](https://img.shields.io/badge/Version-4.0.0-blue?style=for-the-badge)](https://github.com/mulkymalikuldhrs/ProxyGateLLM)

**Complete API documentation for ProxyGateLLM v4.0.0**

</div>

---

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [POST /v1/chat/completions](#post-v1chatcompletions)
- [POST /v1/messages](#post-v1messages)
- [POST /chat](#post-chat)
- [GET /health](#get-health)
- [GET /status](#get-status)
- [GET /models](#get-models)
- [GET /providers](#get-providers)
- [GET /providers/:name/health](#get-providersnamehealth)
- [Error Responses](#error-responses)

---

## Base URL

```
http://localhost:3333
```

Configurable via the `PORT` environment variable.

---

## Authentication

### Optional API Key

If the `API_KEY` environment variable is set, all API endpoints require authentication. Provide the key via:

| Header | Format |
|--------|--------|
| `X-API-Key` | `your-api-key` |
| `Authorization` | `Bearer your-api-key` |

When `API_KEY` is not set, no authentication is required — the gateway is open.

```bash
# With API key
curl http://localhost:3333/v1/chat/completions \
  -H "X-API-Key: my-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Or via Authorization header
curl http://localhost:3333/v1/chat/completions \
  -H "Authorization: Bearer my-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

### 401 Unauthorized Response

```json
{
  "error": "Invalid or missing API key",
  "type": "authentication_error"
}
```

---

## Rate Limiting

All `/v1/*` and `/chat` endpoints are rate-limited per IP address.

| Setting | Default | Environment Variable |
|---------|---------|---------------------|
| Window | 60 seconds | `RATELIMIT_WINDOW_MS` |
| Max requests | 100 per window | `RATELIMIT_MAX_REQUESTS` |

### Rate Limit Headers

Every response includes:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1716633660000
```

### 429 Rate Limit Response

```json
{
  "error": "Rate limit exceeded",
  "type": "rate_limit_error",
  "retry_after_ms": 35000
}
```

---

## POST /v1/chat/completions

OpenAI-compatible chat completion endpoint. Drop-in replacement for the OpenAI API — works with any OpenAI SDK or client.

### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `messages` | Array | Yes | — | Array of message objects with `role` and `content` |
| `model` | String | No | auto | Model ID or alias (see [Model Aliases](#model-aliases)) |
| `stream` | Boolean | No | `false` | Enable SSE streaming |
| `max_tokens` | Number | No | — | Maximum tokens to generate |
| `temperature` | Number | No | — | Sampling temperature (0–2) |

### Message Format

```json
{
  "role": "system | user | assistant | tool",
  "content": "string or array of content parts"
}
```

- `content` can be a plain string or an array of objects (e.g., `[{type: "text", text: "..."}]`)
- Maximum 128 messages per request
- Maximum 50,000 characters per message content
- Null bytes are automatically stripped from content

### Model Aliases

The gateway resolves common aliases to canonical model IDs:

| Alias | Resolves To |
|-------|------------|
| `gpt4`, `gpt4o` | `gpt-4o` |
| `gpt4-mini`, `gpt4o-mini` | `gpt-4o-mini` |
| `claude`, `claude-opus` | `claude-opus-4-5-latest` |
| `claude-sonnet` | `claude-sonnet-4` |
| `claude-haiku` | `claude-haiku-4-5` |
| `deepseek` | `deepseek-chat` |
| `deepseek-r1` | `deepseek-reasoner` |
| `gemini`, `gemini-flash` | `gemini-2.0-flash` |
| `grok` | `grok-3` |
| `llama` | `llama-3.1-70b` |
| `mixtral` | `mixtral-8x7b-32768` |
| `qwen-coder` | `qwen-2.5-coder-32b-instruct` |
| `codestral` | `codestral-2508` |
| `mistral` | `mistral-large-2512` |

When `model` is omitted or set to `"auto"`, the gateway uses smart auto-routing based on message content (see [MODELS.md](MODELS.md#auto-routing-logic) for details).

### Non-Streaming Response

```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quantum computing in simple terms"}
    ],
    "stream": false
  }'
```

Response:

```json
{
  "id": "chatcmpl-1716633600000",
  "object": "chat.completion",
  "created": 1716633600,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Quantum computing is a type of computing that uses quantum-mechanical phenomena..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 450,
    "total_tokens": 475
  },
  "_meta": {
    "provider": "puter",
    "latency_ms": 2340
  }
}
```

The `_meta` field is a custom extension that provides:
- `provider` — which provider handled the request (e.g., `"puter"`, `"pollinations"`, `"openrouter"`)
- `latency_ms` — round-trip latency in milliseconds

### Streaming Response

Set `"stream": true` to receive Server-Sent Events (SSE):

```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4-5-latest",
    "messages": [
      {"role": "user", "content": "Write a Python function to calculate fibonacci"}
    ],
    "stream": true
  }'
```

SSE output format:

```
data: {"id":"chatcmpl-1716633600000","object":"chat.completion.chunk","created":1716633600,"model":"claude-opus-4-5-latest","choices":[{"index":0,"delta":{"content":"Here"},"finish_reason":null}]}

data: {"id":"chatcmpl-1716633600000","object":"chat.completion.chunk","created":1716633600,"model":"claude-opus-4-5-latest","choices":[{"index":0,"delta":{"content":"'s"},"finish_reason":null}]}

data: {"id":"chatcmpl-1716633600000","object":"chat.completion.chunk","created":1716633600,"model":"claude-opus-4-5-latest","choices":[{"index":0,"delta":{"content":" a"},"finish_reason":null}]}

data: [DONE]
```

Each SSE event contains a `chat.completion.chunk` object with a `delta` field that carries incremental content. The stream terminates with `data: [DONE]`.

### Using with OpenAI SDK (Python)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3333/v1",
    api_key="not-needed"  # Required by SDK but ignored by gateway
)

# Non-streaming
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)

# Streaming
stream = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### Using with OpenAI SDK (Node.js)

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3333/v1',
  apiKey: 'not-needed',
});

// Non-streaming
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(response.choices[0].message.content);

// Streaming
const stream = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

---

## POST /v1/messages

Anthropic-compatible messages endpoint. Drop-in replacement for the Anthropic Messages API.

### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `messages` | Array | Yes* | — | Array of message objects |
| `model` | String | No | `claude-opus-4-5-latest` | Model ID or alias |
| `system` | String | No | — | System prompt (prepended as system message) |
| `prompt` | String | No* | — | Simple prompt (alternative to `messages`) |
| `max_tokens` | Number | No | — | Maximum tokens to generate |
| `stream` | Boolean | No | `false` | Enable SSE streaming |

*Either `messages` or `prompt` is required.

### Non-Streaming Response

```bash
curl -X POST http://localhost:3333/v1/messages \
  -H "Content-Type: application/json" \
  -H "Anthropic-Api-Version: 2023-06-01" \
  -d '{
    "model": "claude-opus-4-5-latest",
    "system": "You are a helpful assistant.",
    "messages": [
      {"role": "user", "content": "Explain machine learning in simple terms"}
    ],
    "max_tokens": 1024
  }'
```

Response:

```json
{
  "id": "msg_1716633600000",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Machine learning is a subset of artificial intelligence that enables computers to learn from data..."
    }
  ],
  "model": "claude-opus-4-5-latest",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 25,
    "output_tokens": 450
  },
  "_meta": {
    "provider": "puter",
    "latency_ms": 1890
  }
}
```

### Streaming Response

Set `"stream": true` to receive Anthropic-format SSE events:

```bash
curl -X POST http://localhost:3333/v1/messages \
  -H "Content-Type: application/json" \
  -H "Anthropic-Api-Version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4",
    "messages": [
      {"role": "user", "content": "Write a TypeScript interface"}
    ],
    "stream": true
  }'
```

SSE output format (Anthropic style):

```
event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Here"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" is"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" a"}}

event: message_stop
data: {"type":"message_stop"}
```

The stream uses Anthropic's event types:
- `content_block_delta` — incremental text content
- `message_stop` — stream complete
- `error` — error occurred

### Using with Anthropic SDK (Python)

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="http://localhost:3333/v1",
    api_key="not-needed"
)

response = client.messages.create(
    model="claude-opus-4-5-latest",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.content[0].text)
```

### Using with Anthropic SDK (Node.js)

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  baseURL: 'http://localhost:3333/v1',
  apiKey: 'not-needed',
});

const response = await client.messages.create({
  model: 'claude-opus-4-5-latest',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(response.content[0].text);
```

### Using with Prompt Format

For simple single-turn queries, use `prompt` instead of `messages`:

```bash
curl -X POST http://localhost:3333/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-haiku-4-5",
    "prompt": "What is the capital of France?"
  }'
```

---

## POST /chat

Native auto-routed endpoint. Same as `/v1/chat/completions` but with automatic model selection enabled by default. When no `model` is specified, the gateway analyzes message content and selects the optimal model.

### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `messages` | Array | Yes | — | OpenAI-style messages array |
| `model` | String | No | auto | Model override (default: auto-routed) |
| `stream` | Boolean | No | `false` | Enable SSE streaming |
| `temperature` | Number | No | — | Sampling temperature (0–2) |
| `max_tokens` | Number | No | — | Maximum tokens to generate |

### Non-Streaming Response

```bash
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Build a REST API with Express.js and MongoDB"}
    ]
  }'
```

Response:

```json
{
  "id": "chatcmpl-1716633600000",
  "object": "chat.completion",
  "created": 1716633600,
  "model": "claude-opus-4-5-latest",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here's a REST API with Express.js and MongoDB..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {},
  "_meta": {
    "provider": "puter",
    "model": "claude-opus-4-5-latest",
    "latency_ms": 3210
  }
}
```

The `_meta.model` field shows which model was auto-selected. In this example, the "Build a REST API" query triggered the **BUILDING** category, routing to `claude-opus-4-5-latest`.

### Streaming Response

```bash
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain how DNS works step by step"}
    ],
    "stream": true
  }'
```

SSE output follows the same format as `/v1/chat/completions` streaming:

```
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":...,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"DNS"},"finish_reason":null}]}

data: [DONE]
```

### Auto-Routing Examples

```bash
# Code task → routes to claude-opus-4-5-latest
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Debug my Python Flask app"}]}'

# Planning task → routes to deepseek-chat
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Design a system architecture for e-commerce"}]}'

# Reasoning task → routes to gpt-4o
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Solve this step by step: if 3x + 7 = 22, what is x?"}]}'

# Quick question → routes to gpt-4o-mini
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is the capital of Japan?"}]}'
```

---

## GET /health

Lightweight health check endpoint. Returns basic server status without provider details.

### Request

```bash
curl http://localhost:3333/health
```

### Response

```json
{
  "status": "ok",
  "uptime": 86400.5,
  "timestamp": "2026-03-05T12:00:00.000Z",
  "version": "4.0.0"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | String | Always `"ok"` if server is running |
| `uptime` | Number | Server uptime in seconds |
| `timestamp` | String | Current ISO 8601 timestamp |
| `version` | String | Gateway version |

Use this endpoint for load balancer health checks and monitoring.

---

## GET /status

Full status endpoint with provider health, model sync info, and configuration details.

### Request

```bash
curl http://localhost:3333/status
```

### Response

```json
{
  "status": "running",
  "port": 3333,
  "version": "4.0.0",
  "uptime": 86400.5,
  "env": "production",
  "providers": {
    "total": 9,
    "enabled": 7,
    "providers": [
      {
        "name": "puter",
        "displayName": "Puter.js SDK",
        "priority": 1,
        "enabled": true,
        "healthStatus": "healthy",
        "lastHealthCheck": "2026-03-05T11:59:00.000Z",
        "requestCount": 1250,
        "errorCount": 12,
        "errorRate": "1.0%",
        "avgLatency": 2340,
        "modelCount": 14,
        "models": ["deepseek-chat", "gpt-5-chat", "gpt-4o", "..."]
      }
    ]
  },
  "providerManager": {
    "roundRobinState": {"gpt-4o": 5, "deepseek-chat": 12},
    "healthCheckIntervalMs": 60000,
    "providers": { "..." : "..." }
  },
  "modelSync": {
    "lastSync": "2026-03-05T11:00:00.000Z",
    "syncIntervalMs": 3600000,
    "historyCount": 5,
    "lastResults": [
      {"provider": "puter", "before": 14, "after": 14, "added": 0},
      {"provider": "openrouter", "before": 0, "after": 45, "added": 45}
    ]
  },
  "rate_limiting": true,
  "cors_enabled": true,
  "api_key_auth": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | String | Server status (`"running"`) |
| `port` | Number | Listening port |
| `version` | String | Gateway version |
| `uptime` | Number | Uptime in seconds |
| `env` | String | `NODE_ENV` value |
| `providers` | Object | Full provider registry statistics |
| `providerManager` | Object | Round-robin state and health check config |
| `modelSync` | Object | Model sync service status |
| `rate_limiting` | Boolean | Whether rate limiting is active |
| `cors_enabled` | Boolean | Whether CORS is configured |
| `api_key_auth` | Boolean | Whether API key authentication is required |

---

## GET /models

List all available models across all enabled providers. Models are deduplicated — if multiple providers support the same model, all providers are listed.

### Request

```bash
curl http://localhost:3333/models
```

### Response

```json
{
  "object": "list",
  "data": [
    {
      "id": "deepseek-chat",
      "object": "model",
      "created": 1716633600,
      "owned_by": "puter",
      "type": "reasoning",
      "description": "DeepSeek Chat — general purpose, planning",
      "providers": ["puter"],
      "maxTokens": 8192
    },
    {
      "id": "gpt-4o-mini",
      "object": "model",
      "created": 1716633600,
      "owned_by": "puter, pollinations, duckduckgo",
      "type": "fast",
      "description": "OpenAI GPT-4o Mini — quick tasks",
      "providers": ["puter", "pollinations", "duckduckgo"],
      "maxTokens": 8192
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Model identifier |
| `object` | String | Always `"model"` |
| `created` | Number | Unix timestamp |
| `owned_by` | String | Comma-separated provider names |
| `type` | String | Model category: `fast`, `general`, `reasoning`, `code`, `balanced`, `vision`, `code/analysis` |
| `description` | String | Human-readable model description |
| `providers` | Array | List of provider names that support this model |
| `maxTokens` | Number | Maximum token limit |

---

## GET /providers

Provider statistics overview. Returns aggregate information about all registered providers.

### Request

```bash
curl http://localhost:3333/providers
```

### Response

```json
{
  "total": 9,
  "enabled": 7,
  "providers": [
    {
      "name": "puter",
      "displayName": "Puter.js SDK",
      "priority": 1,
      "enabled": true,
      "healthStatus": "healthy",
      "lastHealthCheck": "2026-03-05T11:59:00.000Z",
      "requestCount": 1250,
      "errorCount": 12,
      "errorRate": "1.0%",
      "avgLatency": 2340,
      "modelCount": 14,
      "models": ["deepseek-chat", "gpt-5-chat", "gpt-4o", "gpt-4o-mini", "..."]
    },
    {
      "name": "pollinations",
      "displayName": "Pollinations AI",
      "priority": 1,
      "enabled": true,
      "healthStatus": "healthy",
      "lastHealthCheck": "2026-03-05T11:59:00.000Z",
      "requestCount": 340,
      "errorCount": 5,
      "errorRate": "1.5%",
      "avgLatency": 1850,
      "modelCount": 5,
      "models": ["openai", "mistral", "llama", "deepseek-r1", "qwen"]
    }
  ]
}
```

---

## GET /providers/:name/health

Trigger an on-demand health check for a specific provider and return the result.

### Request

```bash
curl http://localhost:3333/providers/puter/health
curl http://localhost:3333/providers/pollinations/health
curl http://localhost:3333/providers/groq/health
```

### Successful Response

```json
{
  "name": "puter",
  "health": "healthy",
  "lastCheck": "2026-03-05T12:00:00.000Z"
}
```

### Error Response (Provider Still Responds)

```json
{
  "name": "pollinations",
  "health": "degraded",
  "error": "Pollinations health check failed: Request timeout",
  "lastCheck": "2026-03-05T12:00:00.000Z"
}
```

### 404 Provider Not Found

```json
{
  "error": "Provider not found"
}
```

### Available Provider Names

| Name | Display Name |
|------|-------------|
| `puter` | Puter.js SDK |
| `pollinations` | Pollinations AI |
| `duckduckgo` | DuckDuckGo AI Chat |
| `openrouter` | OpenRouter Free |
| `groq` | Groq |
| `huggingface` | HuggingFace Inference |
| `g4f` | G4F/FreeGPT |
| `blackbox` | Blackbox AI |
| `phind` | Phind |

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Description of what went wrong",
  "type": "error_type"
}
```

### Error Types

| Type | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_request` | 400 | Malformed request body, invalid parameters |
| `authentication_error` | 401 | Missing or invalid API key |
| `not_found` | 404 | Unknown endpoint or provider |
| `rate_limit_error` | 429 | Too many requests from this IP |
| `internal_error` | 500 | Server-side error or all providers failed |
| `stream_error` | — | Error during streaming (sent as SSE event) |

### Common Error Examples

**400 Bad Request — Empty messages:**

```json
{
  "error": "messages array must not be empty",
  "type": "invalid_request"
}
```

**400 Bad Request — Invalid role:**

```json
{
  "error": "messages[2].role must be one of: system, user, assistant, tool",
  "type": "invalid_request"
}
```

**400 Bad Request — Content too long:**

```json
{
  "error": "messages[0].content too long (max 50000 chars)",
  "type": "invalid_request"
}
```

**400 Bad Request — Model name too long:**

```json
{
  "error": "model name too long (max 256 chars)",
  "type": "invalid_request"
}
```

**500 Internal Server Error — No provider available:**

```json
{
  "error": "No provider available for model: some-unknown-model",
  "type": "internal_error"
}
```

**500 Internal Server Error — All providers failed:**

```json
{
  "error": "All providers failed for model: gpt-4o",
  "type": "internal_error"
}
```

**Streaming Error (sent as SSE):**

```
data: {"error":"Connection timeout","type":"stream_error"}

data: [DONE]
```

### Production vs Development Error Messages

In production mode (`NODE_ENV=production`), error messages are sanitized:

```json
{
  "error": "Internal server error",
  "type": "internal_error"
}
```

In development mode, the actual error message is included for debugging.

---

## CORS Configuration

The gateway sets permissive CORS headers by default:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key, Anthropic-Api-Version
Access-Control-Max-Age: 86400
```

To restrict origins, set `CORS_ORIGIN` in your `.env`:

```env
CORS_ORIGIN=https://your-app.example.com
```

---

## Quick Reference

### cURL Cheat Sheet

```bash
# Auto-routed chat
curl -s -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# OpenAI format with specific model
curl -s -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'

# Anthropic format with system prompt
curl -s -X POST http://localhost:3333/v1/messages \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-opus-4-5-latest","system":"Be brief","messages":[{"role":"user","content":"Hello"}]}'

# Streaming
curl -s -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}],"stream":true}'

# Health check
curl -s http://localhost:3333/health

# List models
curl -s http://localhost:3333/models

# Provider status
curl -s http://localhost:3333/providers

# Trigger provider health check
curl -s http://localhost:3333/providers/puter/health
```

---

<div align="center">

**Next: [ARCHITECTURE.md](ARCHITECTURE.md) | [MODELS.md](MODELS.md) | [PROVIDERS.md](PROVIDERS.md)**

</div>
