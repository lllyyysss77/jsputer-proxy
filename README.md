<div align="center">

# ProxyGateLLM v6.0.0

### The Biggest Free Multi-LLM Hub

**Free multi-LLM gateway with 22 providers (10 free, no API key), circuit breaker, cost estimation, OpenAI/Anthropic-compatible**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/blob/main/LICENSE)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Version 6.0.0](https://img.shields.io/badge/version-6.0.0-orange.svg)](https://github.com/mulkymalikuldhrs/ProxyGateLLM)
[![Dependencies 4](https://img.shields.io/badge/dependencies-4-brightgreen.svg)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/blob/main/package.json)
[![Providers 22](https://img.shields.io/badge/providers-22-purple.svg)](https://github.com/mulkymalikuldhrs/ProxyGateLLM)
[![Free Providers 10](https://img.shields.io/badge/free_providers-10-success.svg)](https://github.com/mulkymalikuldhrs/ProxyGateLLM)
[![Port 3333](https://img.shields.io/badge/port-3333-informational.svg)](https://github.com/mulkymalikuldhrs/ProxyGateLLM)

*Inspired by [OmniRoute](https://github.com/mulkymalikuldhrs/OmniRoute)*

</div>

---

## Table of Contents

- [Overview](#overview)
- [Why ProxyGateLLM?](#why-proxygatelym)
- [Feature Comparison](#feature-comparison)
- [22 Providers](#22-providers)
  - [FREE — No API Key Required (10)](#free--no-api-key-required-10-providers)
  - [FREE KEY — Signup Required (8)](#free-key--signup-required-8-providers)
  - [BYOAPI — Requires API Key (4)](#byoapi--requires-api-key-4-providers)
- [What's New in v6.0.0](#whats-new-in-v600)
- [Architecture](#architecture)
- [Circuit Breaker Deep Dive](#circuit-breaker-deep-dive)
- [Cost Estimation](#cost-estimation)
- [Smart Routing](#smart-routing)
- [API Reference](#api-reference)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Dashboard](#dashboard)
- [Docker Support](#docker-support)
- [Attributions](#attributions)
- [License](#license)

---

## Overview

ProxyGateLLM v6.0.0 is a self-hosted, open-source multi-LLM gateway that aggregates **22 AI providers** into a single, unified API. It is designed from the ground up to maximize free access to powerful language models — **10 providers work without any API key at all**, and an additional 8 require only a free signup. With only **4 runtime dependencies** (express, dotenv, @heyputer/puter.js, @anthropic-ai/sdk), ProxyGateLLM is lightweight, fast to install, and easy to deploy on any Node.js >=18 environment.

The gateway exposes both **OpenAI-compatible** (`/v1/chat/completions`) and **Anthropic-compatible** (`/v1/messages`) endpoints, meaning you can drop it into any existing application that uses the OpenAI or Anthropic SDK without changing a single line of code. Under the hood, a sophisticated **5-layer architecture** routes requests through health-aware provider selection, a 4-state circuit breaker per provider, cost estimation, and automatic failover — all while supporting real-time **SSE streaming** across every provider.

Version 6.0.0 is a landmark release inspired by [OmniRoute](https://github.com/mulkymalikuldhrs/OmniRoute), bringing production-grade reliability features previously found only in enterprise LLM gateways: adaptive circuit breakers, pre-flight cost estimation, 5 new free providers, and enhanced smart routing. Whether you're a developer prototyping an AI app, a student exploring LLMs, or a team building a production pipeline, ProxyGateLLM gives you free, reliable access to hundreds of models through a single endpoint.

---

## Why ProxyGateLLM?

Choosing an LLM gateway can be overwhelming. ProxyGateLLM distinguishes itself through a relentless focus on **free access**, **reliability**, and **simplicity**. Unlike commercial gateways that charge per token or require paid API keys for every provider, ProxyGateLLM starts with 10 providers that need zero configuration — no signup, no API key, no credit card. You clone, install, and start chatting with GPT-4o, Claude, DeepSeek, Llama, and more within 60 seconds.

The v6.0.0 release adds OmniRoute-inspired production features that set it apart from other free gateways. The **4-state circuit breaker** (CLOSED → DEGRADED → OPEN → HALF_OPEN) with failure-kind-aware adaptive backoff ensures that failing providers are isolated quickly without permanently blocking them. **Pre-flight cost estimation** for 30+ models lets you preview the cost of a request before you send it — and automatically detect when a free provider is available, so you always know if your request is truly free. **Smart routing** combines health status, priority, round-robin, and cost optimization to pick the best provider automatically, while **enhanced failover** with error classification ensures graceful degradation when providers go down.

The dependency footprint is deliberately minimal — just 4 packages. There is no build step, no TypeScript compilation, no Docker requirement. It runs on plain Node.js with ESM modules, making it transparent, auditable, and easy to modify. The built-in PWA dashboard provides real-time visibility into provider health, circuit breaker states, request logs, and cost tracking — all without any external monitoring tool. In short, ProxyGateLLM is the simplest, most powerful way to access multiple LLMs for free, with enterprise-grade reliability baked in.

---

## Feature Comparison

| Feature | ProxyGateLLM v6 | LiteLLM | OpenRouter | OmniRoute | AI Chat API |
|---|---|---|---|---|---|
| **Free providers (no key)** | **10** | 0 | 0 | 5 | 3 |
| **Total providers** | **22** | 100+ | 70+ | 12 | 8 |
| **Circuit breaker** | **4-state + adaptive** | No | No | 4-state | No |
| **Cost estimation** | **Pre-flight, 30+ models** | Post-hoc | Post-hoc | Pre-flight | No |
| **OpenAI-compatible API** | **Yes** | Yes | Yes | Yes | Partial |
| **Anthropic-compatible API** | **Yes** | Yes | No | No | No |
| **Streaming (SSE)** | **All providers** | Most | Yes | Most | Some |
| **Smart auto-routing** | **Health + cost + priority** | Basic | No | Health + cost | Basic |
| **Failover** | **Circuit-aware, error-classified** | Basic | No | Circuit-aware | No |
| **Self-hosted** | **Yes** | Yes | No | Yes | No |
| **API key required** | **No (10 free)** | Yes (all) | Yes | Partial | No (3) |
| **Dependencies** | **4** | 15+ | N/A (SaaS) | 8+ | 5+ |
| **Dashboard** | **PWA built-in** | No | Web UI | Basic | No |
| **MCP protocol** | **Yes** | No | No | No | No |
| **MIT License** | **Yes** | Yes | Proprietary | MIT | Varies |
| **Node.js only** | **Yes** | Python | N/A | Node.js | Node.js |

> **Key differentiator**: ProxyGateLLM is the only gateway offering 10 completely free (no key, no signup) providers alongside production-grade circuit breakers and cost estimation — all in a 4-dependency, self-hosted Node.js package.

---

## 22 Providers

ProxyGateLLM aggregates 22 providers across three tiers. Each provider is wrapped in a dedicated adapter that handles authentication, request formatting, response normalization, streaming, and health checking. Providers are categorized into three tiers based on access requirements: **FREE** (no API key, no signup), **FREE KEY** (free tier with signup), and **BYOAPI** (bring your own paid API key). The circuit breaker operates independently on each provider, so a failing paid provider won't affect your free providers, and vice versa.

### FREE — No API Key Required (10 providers)

These providers require absolutely zero configuration. No account, no API key, no credit card. They are enabled by default and work immediately after `npm start`. While some may have rate limits or less reliability than paid providers, the circuit breaker and automatic failover ensure you always get a response from the pool.

| # | Provider | Models | Notes |
|---|----------|--------|-------|
| 1 | **Pollinations AI** | GPT-4o Mini, Mistral, Llama, DeepSeek R1, Qwen | OpenAI-compatible, streaming, highly reliable |
| 2 | **DuckDuckGo AI Chat** | GPT-4o Mini, Claude 3 Haiku, Llama 3.1 70B, Mixtral | VQD token auth, streaming, privacy-focused |
| 3 | **LLM7.io** | GPT-4o, DeepSeek Chat/R1, Llama 3.3 70B, Qwen Coder | OpenAI-compatible, 30+ models, streaming |
| 4 | **DeepAI** | Free chat mode | No login, simulated streaming |
| 5 | **FreeGPT** | GPT-4o, GPT-4o Mini, GPT-4 | Simulated streaming |
| 6 | **Api.airforce** | GPT-4o, DeepSeek, Llama | 55+ free models, streaming |
| 7 | **Venice.ai** | Llama 3.3 70B, DeepSeek R1, Qwen Coder, Gemma 3 | Privacy-focused, streaming |
| 8 | **G4F/FreeGPT** | GPT-4o, GPT-4o Mini, Claude 3.5 Sonnet | Python-based, fragile (priority 3) |
| 9 | **Blackbox AI** | Blackbox AI, Blackbox AI Pro | Reverse-engineered (priority 3) |
| 10 | **Phind** | Phind 70B | Code specialist, reverse-engineered (priority 3) |

> **Tip**: Providers 1-7 (Pollinations through Venice) are the most reliable free providers. Providers 8-10 (G4F, Blackbox, Phind) use reverse-engineered endpoints that may break — the circuit breaker will automatically isolate them when they fail.

### FREE KEY — Signup Required (8 providers)

These providers offer generous free tiers that only require creating a free account. Once you obtain a free API key and add it to your `.env` file, ProxyGateLLM automatically enables them. The free allowances are substantial — for example, Google AI Studio offers 1,500 requests per day, and Cerebras provides 1 million tokens per day at no cost.

| # | Provider | Models | Free Tier |
|---|----------|--------|-----------|
| 11 | **Puter.js SDK** | DeepSeek Chat, GPT-5, GPT-4o, Claude Opus 4.5, Grok 3, etc. | 500+ models via free Puter account |
| 12 | **OpenRouter Free** | 337+ free models | Optional key, streaming |
| 13 | **Google AI Studio** | Gemini 2.0/2.5, Gemma 3 | 1,500 req/day free |
| 14 | **Groq** | Llama 3.3 70B, Mixtral, Gemma 2 | 30 RPM free |
| 15 | **Cerebras** | Llama 4 Scout, Llama 3.1 | 1M tokens/day free |
| 16 | **Cloudflare Workers AI** | Llama 3.3 70B, Qwen 3, Gemma 3, Mistral | 10K neurons/day free |
| 17 | **Cohere** | Command A, Command R/R+ | Free tier available |
| 18 | **HuggingFace** | Llama 3.1 70B, Mixtral, Qwen Coder | Free inference API |

### BYOAPI — Requires API Key (4 providers)

These are paid providers where you bring your own API key. They offer the highest reliability and the most capable models. Several provide free credits upon signup (Together AI: $5, SambaNova: $5, Inference.net: $10), making them effectively free for initial experimentation. ProxyGateLLM's cost estimator helps you track spending across these providers.

| # | Provider | Models | Free Credit |
|---|----------|--------|-------------|
| 19 | **Together AI** | Llama 3.3 70B, DeepSeek R1, Qwen Coder | $5 free credit |
| 20 | **SambaNova** | DeepSeek V3.1 671B, Llama 3.3, Qwen 2.5 | $5 free |
| 21 | **Scaleway** | Llama 3.3 70B, Mistral Nemo, Qwen Coder | Pay-per-use |
| 22 | **Inference.net** | Llama 3.3 70B, DeepSeek R1, Qwen Coder | $10 free |

---

## What's New in v6.0.0

Version 6.0.0 is the largest release in ProxyGateLLM history, inspired by the architectural patterns and production-grade features of [OmniRoute](https://github.com/mulkymalikuldhrs/OmniRoute). This release fundamentally transforms ProxyGateLLM from a simple proxy into a production-ready LLM gateway with enterprise reliability features, while preserving its core promise: free, zero-configuration access to powerful AI models.

### Circuit Breaker (OmniRoute-Inspired)

The flagship feature of v6.0.0 is a **4-state circuit breaker** with failure-kind-aware adaptive backoff, operating independently on each of the 22 providers. Unlike simple retry logic, the circuit breaker continuously monitors the health of each provider and makes intelligent decisions about when to route traffic, when to back off, and when to probe for recovery. The four states — CLOSED (healthy, all traffic allowed), DEGRADED (some failures, still accepting but with caution), OPEN (too many failures, traffic blocked), and HALF_OPEN (probing for recovery) — provide fine-grained control over provider availability. The breaker classifies failures into 7 kinds (rate_limit, quota_exhausted, transient, auth_failure, timeout, server_error, network_error) and applies kind-specific cooldowns: a rate limit triggers a 60-second backoff, while an auth failure triggers a 30-minute backoff. This means the system responds appropriately to different failure modes rather than treating all errors equally.

### Cost Estimation

A new **pre-flight cost estimation** engine allows you to preview the cost of any request before sending it. The estimator maintains pricing data for 30+ models across OpenAI, Anthropic, Google, DeepSeek, xAI, Llama, Mistral, Qwen, and others, with automatic fuzzy matching for model name variants. When you hit the `/v1/cost-estimate` endpoint, the engine estimates input token count from your messages (using a character-based approximation that accounts for CJK text), applies the pricing table, and returns a detailed breakdown including input cost, output cost, total cost, and whether the request is free. Free providers are automatically detected, so you always know when a request costs $0.00. The cost estimate is also attached to every chat completion response in the `_meta` field, giving you cost visibility on every request without an extra API call.

### 5 New Free Providers

v6.0.0 adds five new zero-configuration free providers, expanding the no-auth pool from 5 to 10. **LLM7.io** provides an OpenAI-compatible gateway with 30+ models including GPT-4o and DeepSeek R1 — one of the most capable free providers available. **DeepAI** offers a simple free chat mode with no login required. **FreeGPT** provides access to GPT-4o, GPT-4o Mini, and GPT-4. **Api.airforce** aggregates 55+ free models with streaming support. **Venice.ai** brings privacy-focused AI with Llama 3.3 70B, DeepSeek R1, and Qwen Coder. Together, these new providers significantly increase the redundancy and model diversity available without any API keys, making the free tier more robust than ever.

### Smart Routing & Enhanced Failover

The routing engine has been completely overhauled with **health-aware, priority-based, round-robin, and cost-optimized** strategies. When multiple providers offer the same model, the router sorts them by circuit breaker state (prefer CLOSED over DEGRADED over OPEN), then by health status, then by priority level, and finally by average latency. Among equally-ranked healthy providers, round-robin distributes load evenly. The enhanced failover system integrates deeply with the circuit breaker: when a provider fails, the error is classified into a failure kind, the circuit breaker updates its state accordingly, and the next provider in the sorted list is tried automatically. This ensures that a single failing provider never blocks the entire request — the system degrades gracefully, always finding the best available provider.

### New API Endpoints

Three new endpoints provide visibility and control over the gateway's internal state. `GET /providers/free` lists all free (no-key) providers with their current health status and model counts. `GET /circuit-breakers` returns the full circuit breaker state for every provider, including failure counts, transition history, and remaining cooldown periods. `POST /v1/cost-estimate` provides pre-flight cost estimation with token counting and pricing breakdown. These endpoints make it easy to build monitoring dashboards, alerting systems, and cost optimization tools on top of ProxyGateLLM.

---

## Architecture

ProxyGateLLM v6.0.0 implements a **5-layer architecture** designed for separation of concerns, extensibility, and production reliability. Each layer has a clear responsibility and communicates with adjacent layers through well-defined interfaces, making it straightforward to add new providers, modify routing logic, or replace individual components without affecting the rest of the system.

```
┌──────────────────────────────────────────────────────────┐
│                   Layer 1: API Gateway                    │
│   Express server, CORS, rate limiting, auth, logging     │
│   OpenAI + Anthropic + Native + MCP endpoints            │
├──────────────────────────────────────────────────────────┤
│                  Layer 2: Request Router                  │
│   Model resolution, alias mapping, task-type detection   │
│   Auto-routing (code→Claude, plan→DeepSeek, fast→mini)  │
├──────────────────────────────────────────────────────────┤
│                Layer 3: Provider Manager                  │
│   Health monitoring, circuit breaker registry, failover  │
│   Cost estimation, round-robin, priority routing         │
├──────────────────────────────────────────────────────────┤
│               Layer 4: Provider Adapters                  │
│   22 adapters (pollinations, duckduckgo, llm7, puter,   │
│   groq, openrouter, google-ai, cerebras, etc.)          │
│   Each handles: auth, request format, response normalize │
├──────────────────────────────────────────────────────────┤
│                 Layer 5: Model Sync                       │
│   Auto-discover models from OpenRouter, Groq, etc.      │
│   Model alias registry, pricing data, capabilities      │
└──────────────────────────────────────────────────────────┘
```

**Layer 1 — API Gateway**: The Express.js server handles HTTP concerns: JSON body parsing, CORS headers, rate limiting (configurable window/max), optional API key authentication, and request/response logging. It exposes the OpenAI-compatible, Anthropic-compatible, native auto-routed, cost estimation, health check, and MCP endpoints.

**Layer 2 — Request Router**: Resolves model aliases (e.g., "gpt4" → "gpt-4o", "claude" → "claude-opus-4-5-latest"), detects task types from message content (code, planning, reasoning, fast, general), and selects the optimal model when the user passes `model: "auto"`. This layer ensures that even vague requests are routed to the most appropriate model.

**Layer 3 — Provider Manager**: The brain of the system. Manages the circuit breaker registry (one breaker per provider), performs periodic health checks (every 60 seconds by default), estimates request costs, sorts providers by reliability/health/priority/latency, and executes failover with error classification. Tracks aggregate statistics including total requests, estimated costs, and round-robin state.

**Layer 4 — Provider Adapters**: Each of the 22 providers has a dedicated adapter that extends a common base class. Adapters handle provider-specific authentication (API keys, VQD tokens, cookies), request formatting, response normalization into OpenAI format, streaming (SSE, simulated streaming, ReadableStream), and health checking. This layer abstracts away the heterogeneity of 22 different APIs into a uniform interface.

**Layer 5 — Model Sync**: Automatically discovers and syncs available models from providers that expose a model list API (OpenRouter, Groq, etc.). Maintains the model alias registry, pricing data for cost estimation, and capability metadata (max tokens, type, description). This ensures the model catalog stays up-to-date without manual configuration.

---

## Circuit Breaker Deep Dive

The circuit breaker is the cornerstone of ProxyGateLLM v6.0.0's reliability, inspired by the patterns established in [OmniRoute](https://github.com/mulkymalikuldhrs/OmniRoute). It operates on each provider independently, ensuring that a failing provider is quickly isolated without affecting the availability of other providers. The breaker maintains fine-grained state that goes far beyond a simple "up/down" check — it tracks failure kinds, applies adaptive backoff, and probes for recovery automatically.

### 4-State Model

```
CLOSED ──(failures ≥ degraded threshold)──→ DEGRADED
DEGRADED ──(failures ≥ threshold)──→ OPEN
OPEN ──(reset timeout elapsed)──→ HALF_OPEN
HALF_OPEN ──(success)──→ CLOSED
HALF_OPEN ──(failure)──→ OPEN (escalated timeout)
```

- **CLOSED**: The provider is healthy. All traffic is routed normally. This is the default state when the server starts.
- **DEGRADED**: Some failures have been detected (typically 60% of the failure threshold). The provider still accepts traffic, but the router will prefer other providers at the same priority level. After 3 consecutive successes, the breaker transitions back to CLOSED.
- **OPEN**: Too many failures have accumulated. The provider is completely blocked — no traffic is sent. The breaker waits for a reset timeout before transitioning to HALF_OPEN for a probe attempt.
- **HALF_OPEN**: A single probe request is allowed. If it succeeds, the breaker transitions to CLOSED (provider recovered). If it fails, the breaker transitions back to OPEN with an escalated timeout (doubled, up to 5 minutes max).

### Failure Kind Classification

Not all failures are equal. The breaker classifies errors into 7 kinds and applies kind-specific thresholds and cooldowns:

| Failure Kind | Threshold | Cooldown | Example |
|---|---|---|---|
| `rate_limit` | 2 failures | 60 seconds | HTTP 429 Too Many Requests |
| `quota_exhausted` | 1 failure | 60 minutes | Free tier exhausted |
| `auth_failure` | 1 failure | 30 minutes | HTTP 401/403 Invalid API Key |
| `timeout` | Default (5) | Default (30s) | Request exceeded timeout |
| `server_error` | Default (5) | Default (30s) | HTTP 500 Internal Server Error |
| `network_error` | Default (5) | Default (30s) | ECONNREFUSED, fetch failed |
| `transient` | Default (5) | 10 seconds | Temporary glitch |

This means that an authentication failure immediately opens the circuit (threshold = 1) with a 30-minute cooldown — there is no point retrying a bad API key. A rate limit, on the other hand, allows 2 failures before opening the circuit with a shorter 60-second cooldown, since rate limits are often temporary.

### Adaptive Backoff

When a HALF_OPEN probe fails, the reset timeout is multiplied by an escalation factor (default: 2x), up to a maximum of 5 minutes. This prevents the breaker from constantly probing a truly broken provider while still allowing recovery detection. The transition history (last 5 transitions) is recorded for debugging and monitoring via the `/circuit-breakers` endpoint.

---

## Cost Estimation

ProxyGateLLM v6.0.0 introduces pre-flight cost estimation, allowing you to know the cost of a request before you send it. This is especially valuable when using paid BYOAPI providers, where a single request with a large context can cost significantly more than expected. The cost estimator maintains a pricing table for 30+ models and automatically detects free providers.

### How It Works

1. **Token Estimation**: The estimator counts characters in your messages and converts to approximate tokens (~4 chars/token for English, ~2 chars/token for CJK text), plus 4 tokens per message for formatting overhead.
2. **Pricing Lookup**: The model ID is matched against the pricing table. Fuzzy matching is applied (e.g., "gpt4o" matches "gpt-4o"), and a default rate is used for unknown models.
3. **Free Detection**: If the model is available on a free provider (Pollinations, DuckDuckGo, LLM7, etc.), the cost is reported as `$0.00 (FREE)`.
4. **Output Estimation**: If output tokens are not specified, the estimator defaults to `min(input_tokens, 4096)`.

### Pricing Table (per 1M tokens, USD)

| Model | Input | Output |
|---|---|---|
| GPT-4o | $2.50 | $10.00 |
| GPT-4o Mini | $0.15 | $0.60 |
| GPT-5 Chat | $5.00 | $15.00 |
| Claude Opus 4.5 | $15.00 | $75.00 |
| Claude Sonnet 4 | $3.00 | $15.00 |
| Claude Haiku 4.5 | $0.80 | $4.00 |
| Gemini 2.0 Flash | $0.10 | $0.40 |
| DeepSeek Chat | $0.27 | $1.10 |
| DeepSeek R1 | $0.55 | $2.19 |
| Grok 3 | $3.00 | $15.00 |
| Llama 3.3 70B | $0.20 | $0.80 |
| Qwen 2.5 Coder | $0.10 | $0.40 |
| Mixtral 8x7B | $0.24 | $0.24 |

> **Note**: When a free provider is available for your model, the cost estimator will report `$0.00 (FREE)`. The `_meta.estimated_cost` field on every response tells you what the request *would* have cost on a paid provider.

---

## Smart Routing

ProxyGateLLM's smart routing engine is the intelligence layer that determines which provider handles each request. It combines four routing strategies with the circuit breaker and health monitoring to make optimal decisions automatically, without any manual configuration from the user.

### Auto-Routing (model: "auto")

When you don't specify a model (or pass `model: "auto"`), the router analyzes your message content to determine the task type and selects the best model automatically:

| Task Type | Trigger Keywords | Selected Model |
|---|---|---|
| **Code** | code, implement, debug, function, class, deploy, build | Claude Opus 4.5 |
| **Planning** | plan, design, strategy, analyze, architect, roadmap | DeepSeek Chat |
| **Reasoning** | reason, solve, explain, calculate, prove, math | GPT-4o |
| **Fast** | Short questions (< 100 chars), simple queries | GPT-4o Mini |
| **General** | Everything else | DeepSeek Chat |

### Provider Selection

When multiple providers offer the same model, the router sorts them by:

1. **Circuit breaker state**: CLOSED > DEGRADED > HALF_OPEN > OPEN (blocked)
2. **Health status**: healthy > unknown > degraded > down
3. **Priority level**: Priority 1 (free/reliable) > Priority 2 (free key/paid) > Priority 3 (fragile/reverse-engineered)
4. **Average latency**: Lower is better (tracked per provider)
5. **Round-robin**: Among equally-ranked healthy providers, distribute evenly

### Routing Strategies

| Strategy | Description | Use Case |
|---|---|---|
| `priority` | Use highest-priority healthy provider | Default — prefers free, reliable providers |
| `round_robin` | Distribute evenly across providers | Load balancing across paid providers |
| `least_latency` | Route to fastest provider | Latency-sensitive applications |
| `random` | Random selection among healthy | Testing, simple distribution |
| `cost_optimized` | Prefer free/cheapest providers | Cost-conscious production use |

---

## API Reference

ProxyGateLLM exposes 13 endpoints covering chat completions, messages, cost estimation, health monitoring, provider management, circuit breaker inspection, MCP protocol, and a web dashboard. All chat endpoints support both streaming (SSE) and non-streaming modes. The OpenAI and Anthropic endpoints are fully compatible with their respective SDKs — just change the `baseURL` and you're done.

### Chat Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/v1/chat/completions` | OpenAI-compatible chat completions (streaming + non-streaming) |
| `POST` | `/v1/messages` | Anthropic-compatible messages API (streaming + non-streaming) |
| `POST` | `/chat` | Native auto-routed chat (model auto-detection) |
| `POST` | `/v1/cost-estimate` | Pre-flight cost estimation for a request |

### Monitoring Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Simple health check (status, uptime, version) |
| `GET` | `/status` | Full server status (providers, circuit breakers, model sync, rate limiting) |
| `GET` | `/models` | List all available models with provider info |
| `GET` | `/providers` | Provider details and stats for all providers |
| `GET` | `/providers/free` | Free providers only (no API key required) |
| `GET` | `/circuit-breakers` | Circuit breaker state for all providers |
| `GET` | `/logs` | Recent request logs (paginated, `?limit=&offset=`) |

### Other Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/mcp` | Model Context Protocol (JSON-RPC 2.0) |
| `GET` | `/dashboard` | Web dashboard (PWA) |

### Request Format (OpenAI-compatible)

```json
{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": false
}
```

### Response Format (OpenAI-compatible)

```json
{
  "id": "chatcmpl-1700000000",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "gpt-4o",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "Hello! How can I help you?"},
    "finish_reason": "stop"
  }],
  "usage": {},
  "_meta": {
    "provider": "pollinations",
    "latency_ms": 1234,
    "estimated_cost": "$0.00 (FREE)",
    "is_free": true
  }
}
```

---

## Quick Start

Getting ProxyGateLLM running takes less than 60 seconds. The only prerequisite is Node.js 18 or later — no Python, no Docker, no database, no build step. After cloning the repository and installing the 4 dependencies, you can start the server immediately. All 10 free providers are enabled by default, so you'll have access to GPT-4o, Claude, DeepSeek, Llama, and more without configuring a single API key.

### 1. Clone & Install

```bash
git clone https://github.com/mulkymalikuldhrs/ProxyGateLLM.git
cd ProxyGateLLM
npm install
```

### 2. Configure (Optional)

```bash
cp .env.example .env
# Edit .env to add optional API keys for free-key and BYOAPI providers
# 10 providers work without any keys!
```

### 3. Start

```bash
npm start
```

You'll see the startup banner:

```
╔══════════════════════════════════════════════════════════════════════╗
║  ProxyGateLLM v6.0.0 — The Biggest Free Multi-LLM Hub              ║
╠══════════════════════════════════════════════════════════════════════╣
║  Running on http://localhost:3333                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║  POST /chat                 - Chat (auto-routing)                    ║
║  POST /v1/chat/completions  - OpenAI-compatible API                  ║
║  POST /v1/messages          - Anthropic-compatible API               ║
║  POST /v1/cost-estimate     - Pre-flight cost estimation             ║
║  GET  /health               - Health check                           ║
║  GET  /status               - Server + provider status               ║
║  GET  /models               - List all available models              ║
║  GET  /providers            - Provider details & stats               ║
║  GET  /providers/free       - Free providers only                    ║
║  GET  /circuit-breakers     - Circuit breaker status                 ║
║  POST /mcp                  - MCP (Model Context Protocol)           ║
║  GET  /dashboard            - Web dashboard                          ║
╠══════════════════════════════════════════════════════════════════════╣
║  Providers: 22 active (10 free)  |  Models: 430+ available           ║
║  Circuit Breaker: ON  |  Cost Estimation: ON  |  Streaming: ON      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 4. Test

```bash
# Quick test — auto-routed (picks best model)
curl http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'

# OpenAI-compatible
curl http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello!"}]}'

# Cost estimation
curl http://localhost:3333/v1/cost-estimate \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello!"}]}'

# Health check
curl http://localhost:3333/health
```

---

## Configuration

ProxyGateLLM is configured through environment variables, loaded from a `.env` file in the project root. Copy `.env.example` to `.env` and customize as needed. The default configuration works out of the box with 10 free providers — you only need to set environment variables if you want to enable free-key or BYOAPI providers, change the port, or adjust rate limiting.

```env
# ── Server ────────────────────────────────────────
PORT=3333                          # Server port (default: 3333)
API_KEY=                           # Optional: require API key for all requests
CORS_ORIGIN=                       # Optional: restrict CORS (default: * = allow all)
LOG_LEVEL=info                     # Log level: info | debug (debug for verbose)
NODE_ENV=development               # development | production

# ── Rate Limiting ─────────────────────────────────
RATELIMIT_WINDOW_MS=60000          # Rate limit window in milliseconds
RATELIMIT_MAX_REQUESTS=100         # Max requests per window

# ── Health Monitoring ─────────────────────────────
HEALTH_CHECK_INTERVAL_MS=60000     # Health check interval in milliseconds

# ── Free Key Providers (signup required) ──────────
PUTER_AUTH_TOKEN=                  # Puter.js SDK — free, 500+ models
GOOGLE_AI_API_KEY=                 # Google AI Studio — 1,500 req/day free
GROQ_API_KEY=                      # Groq — 30 RPM free
CEREBRAS_API_KEY=                  # Cerebras — 1M tokens/day free
CLOUDFLARE_ACCOUNT_ID=             # Cloudflare Workers AI — 10K neurons/day free
CLOUDFLARE_API_TOKEN=              # Cloudflare API token
COHERE_API_KEY=                    # Cohere — free tier
HUGGINGFACE_API_KEY=               # HuggingFace — free inference
OPENROUTER_API_KEY=                # OpenRouter — 337+ free models

# ── BYOAPI Providers (paid, some offer free credits) ──
TOGETHER_API_KEY=                  # Together AI — $5 free credit
SAMBANOVA_API_KEY=                 # SambaNova — $5 free
SCALEWAY_API_KEY=                  # Scaleway — pay per use
INFERENCE_API_KEY=                 # Inference.net — $10 free credit
```

> **Remember**: You do NOT need any API keys to get started. 10 providers (Pollinations, DuckDuckGo, LLM7, DeepAI, FreeGPT, Api.airforce, Venice, G4F, Blackbox, Phind) work immediately with zero configuration.

---

## Usage Examples

### Using with OpenAI SDK (Python)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3333/v1",
    api_key="not-needed"  # Free providers don't require keys
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a haiku about programming"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### Using with Anthropic SDK (Python)

```python
import anthropic

client = anthropic.Anthropic(
    base_url="http://localhost:3333",
    api_key="not-needed"
)

message = client.messages.create(
    model="claude-opus-4-5-latest",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain quantum computing simply"}]
)

print(message.content[0].text)
```

### Using with JavaScript/Node.js

```javascript
import ProxyGateLLM from 'proxygatelymm';

const ai = new ProxyGateLLM();
const response = await ai.ask('Hello!');
const code = await ai.code('Build a simple REST API with Express');
```

### Using with cURL (Streaming)

```bash
curl http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1",
    "messages": [{"role": "user", "content": "Solve: 2x + 5 = 15"}],
    "stream": true
  }'
```

### Cost Estimation Before Sending

```bash
curl http://localhost:3333/v1/cost-estimate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Write a 5000-word essay on AI"}]
  }'

# Response:
# {
#   "model": "gpt-4o",
#   "inputTokens": 15,
#   "outputTokens": 4096,
#   "totalTokens": 4111,
#   "inputCost": 0.0000375,
#   "outputCost": 0.04096,
#   "totalCost": 0.0409975,
#   "currency": "USD",
#   "isFree": false,
#   "formatted_cost": "$0.0410"
# }
```

### Check Circuit Breaker Status

```bash
curl http://localhost:3333/circuit-breakers | jq

# Response:
# {
#   "pollinations": { "state": "CLOSED", "failureCount": 0, "successCount": 42 },
#   "duckduckgo": { "state": "CLOSED", "failureCount": 0, "successCount": 38 },
#   "g4f": { "state": "OPEN", "failureCount": 7, "remainingCooldown": 24500 }
# }
```

---

## Dashboard

ProxyGateLLM includes a built-in **Progressive Web App (PWA) dashboard** accessible at `http://localhost:3333/dashboard`. The dashboard provides real-time visibility into every aspect of the gateway — no external monitoring tools required. It is installable as a PWA on both desktop and mobile, giving you a native-app-like experience for monitoring your LLM gateway.

### Dashboard Features

| Feature | Description |
|---|---|
| **Overview** | Real-time provider health, request rate, error rate, latency charts |
| **Providers** | Status of all 22 providers with health, latency, and circuit breaker state |
| **Models** | Full catalog of 430+ models with provider mapping and capabilities |
| **Playground** | Interactive chat interface with model selection and streaming |
| **Circuit Breakers** | Visual state of all circuit breakers with transition history |
| **Cost Tracking** | Accumulated cost estimates across all requests |
| **Request Logs** | Paginated log of recent requests with latency and status |

The dashboard is a static PWA served from the `/dashboard` directory — no build step, no framework, just vanilla HTML/CSS/JS with a service worker for offline caching and installability.

---

## Docker Support

Docker support is **coming soon** and will be available in a future release. The planned Docker setup will include:

- Multi-stage `Dockerfile` for minimal image size (Alpine-based Node.js)
- `docker-compose.yml` with environment variable configuration
- Pre-built images on GitHub Container Registry (ghcr.io)
- Volume mounts for persistent configuration
- Health check integration with Docker's native health check system
- Kubernetes-ready Helm charts for production deployments

In the meantime, you can run ProxyGateLLM in a container with a simple Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3333
CMD ["node", "index.js"]
```

---

## Attributions

ProxyGateLLM v6.0.0 stands on the shoulders of several remarkable projects and services. We gratefully acknowledge their contributions to the AI and open-source communities:

- **[OmniRoute](https://github.com/mulkymalikuldhrs/OmniRoute)** — The primary inspiration for v6.0.0's circuit breaker pattern, provider categorization framework, and cost estimation architecture. OmniRoute demonstrated that production-grade reliability features can coexist with free LLM access, and ProxyGateLLM adapts those patterns with its own 4-state circuit breaker and extended provider pool.

- **[Puter.js](https://puter.com)** — The free LLM SDK that powers ProxyGateLLM's most diverse provider, offering 500+ models including GPT-5, Claude Opus 4.5, and Grok 3 through a single free account. Puter.js makes it possible to access premium models without premium prices.

- **[Pollinations AI](https://pollinations.ai)** — A completely free, no-auth LLM API that provides OpenAI-compatible streaming access to GPT-4o Mini, Mistral, Llama, DeepSeek R1, and Qwen. Pollinations is often the first provider to respond and serves as a reliable backbone for the free tier.

- **[DuckDuckGo AI Chat](https://duck.ai)** — DuckDuckGo's privacy-focused AI chat service provides free access to GPT-4o Mini, Claude 3 Haiku, Llama 3.1 70B, and Mixtral through a VQD token mechanism. Its strong privacy stance aligns with ProxyGateLLM's philosophy of accessible, user-respecting AI.

- **[LLM7.io](https://llm7.io)** — A free OpenAI-compatible LLM gateway offering 30+ models including GPT-4o and DeepSeek R1. LLM7's commitment to a standardized API interface makes it one of the most reliable and easy-to-integrate free providers.

- **[Venice.ai](https://venice.ai)** — A privacy-focused AI platform providing free access to Llama 3.3 70B, DeepSeek R1, Qwen Coder, and Gemma 3 with streaming support. Venice.ai's emphasis on user privacy and data sovereignty makes it a valuable addition to the free provider pool.

---

## License

```
MIT License

Copyright (c) 2025 Mulky Malikul Dhaher

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Built with dedication by [Mulky Malikul Dhaher](https://github.com/mulkymalikuldhrs)**

[Report Bug](https://github.com/mulkymalikuldhrs/ProxyGateLLM/issues) · [Request Feature](https://github.com/mulkymalikuldhrs/ProxyGateLLM/issues) · [Contribute](https://github.com/mulkymalikuldhrs/ProxyGateLLM/pulls)

</div>
