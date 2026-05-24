# API Reference

<div align="center">

[![OpenAI Compatible](https://img.shields.io/badge/OpenAI-Compatible-412991?style=for-the-badge&logo=openai)](https://platform.openai.com/docs/api-reference)
[![Anthropic Compatible](https://img.shields.io/badge/Anthropic-Compatible-D97757?style=for-the-badge)](https://docs.anthropic.com/en/api)

**Complete API documentation for JSUPTER AI Gateway**

</div>

---

## Base URL

```
http://localhost:3333
```

## Authentication

JSUPTER AI Gateway does not require API keys for basic usage. The Z.ai provider works without any authentication. For Qwen and Puter.js providers, configure the `PUTER_AUTH_TOKEN` in your `.env` file.

---

## Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/chat` | Unified auto-routed chat | None |
| `POST` | `/v1/chat/completions` | OpenAI-compatible | None |
| `POST` | `/v1/messages` | Anthropic-compatible | None |
| `POST` | `/zai/chat` | Direct Z.ai provider | None |
| `POST` | `/qwen/chat` | Direct Qwen provider | Puter token |
| `POST` | `/route` | Routing decision only | None |
| `GET` | `/health` | Health check | None |
| `GET` | `/models` | List available models | None |
| `GET` | `/status` | Provider status | None |

---

## POST /chat

Unified chat endpoint with automatic task-based routing. The gateway classifies your query and routes it to the optimal provider.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | Yes | OpenAI-style messages array |
| `model` | String | No | Model override (default: auto) |
| `stream` | Boolean | No | Enable SSE streaming (default: false) |
| `temperature` | Number | No | Sampling temperature (0-2) |
| `max_tokens` | Number | No | Maximum tokens to generate |

### Example Request

```bash
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Build a REST API with Express.js and MongoDB"}
    ],
    "stream": false,
    "temperature": 0.7
  }'
```

### Example Response

```json
{
  "id": "qwen-1716633600000-a1b2c3",
  "object": "chat.completion",
  "created": 1716633600,
  "model": "qwen-2.5-coder-32b-instruct",
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
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 450,
    "total_tokens": 475
  },
  "provider": "qwen"
}
```

### Streaming Response

Set `"stream": true` to receive Server-Sent Events:

```
data: {"id":"qwen-1716633600000-a1b2c3","object":"chat.completion.chunk","created":1716633600,"model":"qwen-2.5-coder-32b-instruct","choices":[{"index":0,"delta":{"content":"Here"},"finish_reason":null}],"provider":"qwen"}

data: {"id":"qwen-1716633600000-a1b2c3","object":"chat.completion.chunk","created":1716633600,"model":"qwen-2.5-coder-32b-instruct","choices":[{"index":0,"delta":{"content":"'s"},"finish_reason":null}],"provider":"qwen"}

data: [DONE]
```

---

## POST /v1/chat/completions

OpenAI-compatible endpoint. Drop-in replacement for the OpenAI API — works with any OpenAI SDK.

### Request Body

Same as OpenAI's `/v1/chat/completions` format:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | Yes | Messages array |
| `model` | String | No | Model name (default: auto) |
| `stream` | Boolean | No | Enable streaming |
| `temperature` | Number | No | Sampling temperature |
| `max_tokens` | Number | No | Max output tokens |
| `top_p` | Number | No | Nucleus sampling parameter |

### Supported Model Names

- `"auto"` — Auto-route based on task type
- `"gpt-4o"`, `"gpt-4o-mini"`, `"gpt-5-nano"`, `"gpt-5-chat"` — OpenAI models via Puter
- `"claude-opus-4-5-latest"`, `"claude-sonnet-4"`, `"claude-haiku-4-5"` — Anthropic models via Puter
- `"deepseek-chat"`, `"deepseek-reasoner"` — DeepSeek models via Puter
- `"qwen-2.5-coder-32b-instruct"` — Qwen code model
- `"gemini-2.0-flash"` — Google model via Puter
- `"grok-3"`, `"grok-3-fast"`, `"grok-2-vision"` — xAI models via Puter
- `"mistral-large-2512"`, `"codestral-2508"` — Mistral models via Puter

### Using with OpenAI SDK

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3333/v1',
  apiKey: 'not-needed',
});

// Non-streaming
const response = await client.chat.completions.create({
  model: 'auto',
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(response.choices[0].message.content);

// Streaming
const stream = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

---

## POST /v1/messages

Anthropic-compatible endpoint. Drop-in replacement for the Anthropic API.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | Yes* | Anthropic-style messages |
| `model` | String | No | Model name |
| `system` | String | No | System prompt |
| `prompt` | String | No* | Simple prompt (alternative to messages) |
| `max_tokens` | Number | No | Max output tokens (default: 4096) |
| `stream` | Boolean | No | Enable streaming |

*Either `messages` or `prompt` is required.

### Using with Anthropic SDK

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

---

## POST /zai/chat

Direct Z.ai provider route. Bypasses the routing engine and goes straight to Z.ai.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | Yes | Messages array |
| `stream` | Boolean | No | Enable streaming |
| `temperature` | Number | No | Sampling temperature |
| `max_tokens` | Number | No | Max output tokens |

### Example

```bash
curl -X POST http://localhost:3333/zai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Solve this step by step: if 3x + 7 = 22, what is x?"}
    ]
  }'
```

---

## POST /qwen/chat

Direct Qwen provider route. Bypasses the routing engine and goes straight to Qwen 2.5 Coder.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | Yes | Messages array |
| `stream` | Boolean | No | Enable streaming |
| `temperature` | Number | No | Sampling temperature |
| `max_tokens` | Number | No | Max output tokens |
| `model` | String | No | Model override |

### Example

```bash
curl -X POST http://localhost:3333/qwen/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Write a TypeScript interface for a User with name, email, and age"}
    ]
  }'
```

---

## POST /route

Returns the routing decision without executing the query. Useful for debugging and understanding how the classifier works.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | Yes | Messages array |

### Example

```bash
curl -X POST http://localhost:3333/route \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Debug my Python Flask app"}
    ]
  }'
```

### Response

```json
{
  "routing": {
    "provider": "qwen",
    "model": "qwen-2.5-coder-32b-instruct",
    "fallback": {
      "provider": "zai",
      "model": "zai-default"
    },
    "classification": {
      "type": "code",
      "confidence": 0.78,
      "keywords": ["debug", "python", "flask", "app"],
      "scores": {
        "code": 3.6,
        "reasoning": 0.3,
        "infra": 0.0,
        "multimodal": 0.0,
        "structured": 0.0
      }
    },
    "hybrid": false
  },
  "timestamp": "2026-05-25T12:00:00.000Z"
}
```

---

## GET /health

Returns the health status of the gateway server.

### Response

```json
{
  "status": "healthy",
  "service": "jsputer-ai-gateway",
  "version": "2.1.0",
  "timestamp": "2026-05-25T12:00:00.000Z",
  "uptime": 3600.5,
  "memory": {
    "rss": 45,
    "heapUsed": 22,
    "heapTotal": 35
  }
}
```

---

## GET /models

Lists all available models across all providers.

### Response

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "provider": "puter",
      "type": "general",
      "description": "OpenAI GPT-4o – multimodal, versatile",
      "task_types": ["general (fallback)", "multimodal (fallback)"]
    },
    {
      "id": "qwen-2.5-coder-32b-instruct",
      "provider": "qwen",
      "type": "code",
      "description": "Qwen 2.5 Coder 32B – code generation, structured output",
      "task_types": ["code", "infra", "structured"]
    }
  ],
  "count": 10
}
```

---

## GET /status

Returns the health status of all providers and the current routing configuration.

### Response

```json
{
  "status": "healthy",
  "providers": [
    {
      "provider": "zai",
      "status": "healthy",
      "models": ["zai-default"],
      "detail": "Z.ai SDK responsive"
    },
    {
      "provider": "qwen",
      "status": "healthy",
      "models": ["qwen-2.5-coder-32b-instruct", "deepseek-chat"],
      "primary": "qwen-2.5-coder-32b-instruct",
      "detail": "Qwen model responsive"
    },
    {
      "provider": "puter",
      "status": "healthy",
      "models": ["gpt-4o", "gpt-4o-mini", "deepseek-reasoner", "..."],
      "detail": "Puter SDK responsive"
    }
  ],
  "routing": { "...": "..." },
  "timestamp": "2026-05-25T12:00:00.000Z"
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "type": "validation_error",
    "message": "messages array is required",
    "request_id": "req-1716633600000-a1b2c3",
    "timestamp": "2026-05-25T12:00:00.000Z"
  }
}
```

### Error Types

| Type | HTTP Status | Description |
|------|-------------|-------------|
| `validation_error` | 400 | Invalid request body |
| `authentication_error` | 401 | Missing or invalid authentication |
| `not_found` | 404 | Endpoint or provider not found |
| `rate_limit_error` | 429 | Too many requests |
| `provider_error` | 502 | All providers failed |
| `timeout_error` | 504 | Request timed out |
| `internal_error` | 500 | Unexpected server error |

---

## Rate Limiting

By default, the gateway allows **120 requests per minute** per IP address. Rate limit headers are included in every response:

```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 2026-05-25T12:01:00.000Z
```

When rate limited, the response is:

```json
{
  "error": "Rate limit exceeded",
  "type": "rate_limit_error",
  "retry_after_seconds": 30,
  "limit": 120,
  "window_ms": 60000
}
```

---

<div align="center">

**Back to: [PROVIDERS.md](PROVIDERS.md) | [TUTORIAL.md](TUTORIAL.md) | [README.md](README.md)**

</div>

---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
