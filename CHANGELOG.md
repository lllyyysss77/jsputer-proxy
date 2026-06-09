# Changelog

All notable changes to ProxyGateLLM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.1.0] - 2026-06-09

### Added
- **4 New Providers** — 13 → 17 total providers!
  - **Together AI** — $25 free credits, 80+ free models, fastest ChatGPT alternative
  - **SambaNova Cloud** — $5 free credits, DeepSeek-V3.1, Llama-4 Maverick, MiniMax M2.7
  - **Scaleway Gen APIs** — EU-hosted, 1M free tokens, Mistral Medium 3.5, Gemma 4
  - **Inference.net** — $10 free credits, DeepSeek R1, specialized models like Schematron
- **Model aliases** — new shortcuts: `qwen`, `deepseek-v3`, `deepseek-r1`, `nemotron`, `gemma4`, `together-llama`, `samba-deepseek`, `samba-minimax`
- **Auto-fetch models** — Together, SambaNova, and Inference.net support dynamic model listing

### Changed
- **Version bump** — 5.0.0 → 5.1.0
- **Provider count** — Updated all docs from 13 to 17 providers
- **Model count** — Now supporting 430+ models across all providers

## [5.0.0] - 2026-06-08

### Added
- **Model Comparison Tool** — Send same prompt to multiple models, compare side-by-side
- **Usage Analytics Dashboard** — Request tracking, latency metrics, model distribution charts
- **Custom Domain Setup Wizard** — Interactive domain configuration with code examples
- **Request Logging** — In-memory request log with `/logs` endpoint
- **New Dashboard Pages** — Compare, Analytics, Custom Domain pages added

### Changed
- **Version bump** — 4.0.0 → 5.0.0
- **CORS default** — Set to `*` for broader compatibility
- **Logging level** — Configurable via `LOG_LEVEL` env var (info/debug)

### Fixed
- **Groq model IDs** — Updated from decommissioned `llama-3.1-70b-versatile` to `llama-3.3-70b-versatile`
- **Model alias** — `llama` alias now maps to `llama-3.3-70b-versatile`

### Removed
- **jsdom dependency** — Removed unnecessary 20K+ line DOM parser (was only used by DuckDuckGo provider)

### Security
- Added request logging for audit trail
- CORS configuration now documented
- Rate limiting per-IP maintained

---

## [4.0.0] - 2026-06-07

### Added
- Multi-provider system with auto-failover
- Provider health monitoring
- MCP (Model Context Protocol) server
- AI Agent built-in
- Smart auto-routing (code, planning, reasoning, fast)
- PWA dashboard with dark/light theme
- Streaming support (SSE)
- Anthropic-compatible API
- 13 providers, 378+ models

### Changed
- Complete rewrite from v3.x
- New provider architecture
- Dashboard rebuilt as single-page app

---

## [3.0.0] - 2026-06-06

### Added
- Initial multi-provider support
- Basic dashboard
- OpenAI-compatible API

### Changed
- Migrated from jsputer-proxy to ProxyGateLLM

---

## [2.0.0] - 2026-06-05

### Added
- Proxy server functionality
- Basic model routing

---

## [1.0.0] - 2026-06-04

### Added
- Initial release
- Basic proxy functionality
