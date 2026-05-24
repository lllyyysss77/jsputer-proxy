# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-04

### 🎉 Major Release — JSUPTER AI Gateway

This release represents a complete transformation from a simple Puter.js proxy to a full-featured Multi-LLM AI Gateway System.

### Added

#### Multi-LLM Gateway System
- **Multi-provider architecture** with Z.ai (reasoning), Qwen (code/structured), and Puter.js (18+ models)
- **Task-based intelligent routing** — automatically classifies queries and routes to the optimal provider
- **Unified gateway interface** — single endpoint for all LLM providers
- **Provider abstraction layer** — swap providers without changing client code

#### Z.ai Integration
- **Z.ai SDK integration** (`z-ai-web-dev-sdk`) for advanced reasoning tasks
- **Dedicated reasoning pipeline** for complex problem solving, math, and logic
- **Streaming support** via Z.ai SDK

#### Qwen Routing
- **Qwen 2.5 Coder** dedicated routing for code generation and structured output
- **Code-optimized pipeline** for implementation, debugging, and refactoring tasks
- **Structured output support** for JSON, YAML, and other formats

#### Streaming SSE
- **Server-Sent Events (SSE) streaming** for real-time token delivery
- **OpenAI-compatible streaming format** (`stream: true`)
- **Chunked transfer encoding** for progressive response delivery
- **Stream error handling** with proper connection cleanup

#### Enhanced Routing
- **Upgraded task classifier** with multi-provider awareness
- **BUILDING category** → routes to code-optimized models (gpt-5-nano, Qwen)
- **PLANNING category** → routes to reasoning models (deepseek-reasoner)
- **REASONING category** → routes to Z.ai / deepseek-reasoner
- **FAST category** → routes to lightweight models for quick responses
- **Indonesian language keyword support** (rencana, rencanakan, struktur, periksa, alur)

#### Documentation & Community
- **Trilingual README** (English, Bahasa Indonesia, 中文)
- **Animated typing SVG header** cycling through project names
- **Architecture diagram** showing full request flow
- **Comprehensive API documentation** with examples
- **CONTRIBUTING.md** — trilingual contributor guide
- **CODE_OF_CONDUCT.md** — Contributor Covenant v2.1
- **SECURITY.md** — responsible disclosure policy
- **GitHub issue templates** — bug report, feature request, translation
- **GitHub PR template** with checklists
- **FUNDING.yml** — GitHub Sponsors configuration

#### Infrastructure
- **Express 5** upgrade with modern middleware
- **50MB payload support** for large contexts
- **Environment variable management** via dotenv
- **Proper error handling** with structured error responses
- **Systemd service file** for Linux deployment
- **Setup and start scripts** for quick installation

### Changed
- **Project renamed** from "Puter.js Proxy Server" to "JSUPTER AI Gateway"
- **Version bumped** from 1.0.0 to 2.0.0
- **Router logic enhanced** — now uses `gpt-5-nano` for code tasks and `deepseek-reasoner` for planning/reasoning
- **Default model changed** from `deepseek-chat` to `gpt-5-nano`
- **Auto-routing keywords expanded** with Indonesian language support
- **README completely rewritten** with trilingual support and professional design

### Deprecated
- Direct Puter.js-only routing (now routes through multi-provider gateway)

### Security
- **.gitignore updated** to exclude `jsdom/` dependency bloat
- **Environment variables** properly excluded from version control
- **No API keys** exposed in source code

---

## [1.0.0] - 2026-01-23

### Added
- Initial release of Puter.js Proxy Server
- Support for 18+ LLM models via Puter.js SDK
- OpenAI-compatible API endpoint (`/v1/chat/completions`)
- Anthropic-compatible API endpoint (`/v1/messages`)
- Puter native auto-routing endpoint (`/chat`)
- Intelligent model selection based on query type (router.js)
- Express.js 5 server with JSON middleware
- Dotenv configuration support
- Systemd service file for Linux deployment
- Setup script for easy installation
- CLI tool for interactive chat (cli.mjs)
- HTTPS server with self-signed certificates (index-https.js)
- Debug server with request logging (index-debug.js)
- Comprehensive documentation

### Features
- Free access to GPT-4o, Claude, DeepSeek, Gemini, Grok, Mistral, Qwen models
- No expensive API keys required
- Low latency responses
- Large payload support (50MB)
- Stream and non-streaming modes

### Models Supported
- ✅ deepseek-chat, gpt-5-chat, gpt-4o, gpt-4o-mini
- ✅ gemini-2.0-flash, gemini-2.0-flash-lite
- ✅ claude-opus-4-5-latest, claude-sonnet-4, claude-haiku-4-5
- ✅ grok-3, grok-3-fast, grok-2-vision
- ✅ mistral-large-2512, mistral-small-2506, mistral-medium-2508
- ✅ codestral-2508, devstral-medium-2507, qwen-2.5-coder-32b-instruct

### Auto-Routing (v1)
- BUILDING → claude-opus-4-5-latest
- PLANNING → deepseek-chat
- REASONING → gpt-4o
- FAST → gpt-4o-mini
- DEFAULT → deepseek-chat

### Files
- `index.js` — Main server
- `index-https.js` — HTTPS server with self-signed cert
- `index-debug.js` — Debug server with request logging
- `client.js` — Puter.js client with proper initialization
- `router.js` — Auto-routing logic
- `globals.js` — Browser polyfills
- `polyfills.js` — Additional polyfills
- `preload.js` / `preload.cjs` — Preload scripts
- `cli.mjs` — Interactive CLI chat tool
- `example.js` — Usage examples
- `setup.sh` — Installation script
- `start.sh` — Quick start script
- `puter-proxy.service` — Systemd service file

### Compatibility
- Node.js 18+
- Express.js 5.x
- Puter.js SDK 2.2.5
- OpenAI SDK compatible
- Anthropic SDK compatible

---

## [0.0.1] - 2026-01-16

### Initial Development
- Proof of concept for Puter.js proxy
- Basic routing functionality
- Initial model testing
