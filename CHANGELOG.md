# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.1] - 2026-03-05

### Fixed

- **Router now uses working models**: Auto-routing previously sent requests to `gpt-5-nano` and `deepseek-reasoner` which are unavailable through Puter.js. Updated routing to use tested, working models:
  - BUILDING (code tasks) → `claude-opus-4-5-latest`
  - PLANNING → `deepseek-chat`
  - REASONING → `gpt-4o`
  - FAST/short queries → `gpt-4o-mini`
  - DEFAULT → `deepseek-chat`
- **Added GET /models endpoint**: Previously documented but missing — now returns the list of available models
- **Fixed index-https.js cert bug**: Certificate files were read before being generated; now generates certs first if they don't exist
- **Fixed documentation inconsistencies**:
  - ARCHITECTURE.md: Updated body parser limit from 50MB to 10MB (changed in v3.0.0)
  - TUTORIAL.md: Fixed `GATEWAY_PORT` → `PORT` env var name
  - API.md: Corrected default rate limit from 120 to 100 req/min
  - README.md: Updated Auto-Routing Logic table to match actual code
  - README.md: Removed unavailable models (`gpt-5-nano`, `deepseek-reasoner`) from Available Models table, added note about unavailability
  - README.md: Changed "Docker Ready" status from ✅ to "Planned" (no Dockerfile exists yet)
- **Updated test suites**: Both `src/middleware.test.js` and `src/router.test.js` now test the correct working model names
- **Fixed null body validation bug**: `validateChatRequest` and `validateMessagesRequest` now check for null/missing body before destructuring, preventing TypeError crashes

## [3.0.0] - 2026-03-04

### Security

- **Added rate limiting**: In-memory per-IP rate limiter (100 req/min by default, configurable via `RATELIMIT_WINDOW_MS` and `RATELIMIT_MAX_REQUESTS` env vars)
- **Added optional API key authentication**: Set `API_KEY` env var to require `X-API-Key` or `Authorization: Bearer` header on all requests
- **Added CORS configuration**: Replaced implicit open CORS with configurable `CORS_ORIGIN` env var — no wildcard by default
- **Added input validation**: Full validation of request bodies — role checking, message count limits (128 max), content length limits (50,000 chars), model name length limits
- **Added message sanitization**: Strips null bytes and non-standard fields from messages before forwarding to providers
- **Reduced body size limit**: `50mb` → `10mb` to prevent DoS via oversized payloads
- **Capped max_tokens**: Anthropic endpoint caps `max_tokens` at 16,384 to prevent resource exhaustion
- **Safe error responses**: Production mode hides internal error details from clients
- **Removed X-Powered-By header**: No longer leaks Express.js server signature
- **Added `libintercept.so` to .gitignore**: Compiled binary no longer tracked
- **Added `.replit` to .gitignore**

### Added

- `middleware.js` — Centralized middleware module with rate limiting, validation, authentication
- `GET /health` — Health check endpoint returning status, uptime, timestamp, version
- `GET /status` — Server status endpoint showing configuration (no sensitive data)
- `404` handler for unknown routes
- Global error handler with `headersSent` guard
- Test suite with `src/middleware.test.js` and `src/router.test.js` (run via `npm test`)
- `CORS_ORIGIN`, `API_KEY`, `RATELIMIT_WINDOW_MS`, `RATELIMIT_MAX_REQUESTS` to `.env.example`

### Changed

- Version bumped from `2.2.0` to `3.0.0`
- Port now configurable via `PORT` env var (default: 3333)
- Startup logs now show version number, enabled features, and all available endpoints
- `extractContent()` now handles non-object array items safely
- All error logs use structured prefixes (`[ERROR]`, `[FATAL]`)

## [2.2.0] - 2026-02-10

### Added
- Z.ai and Qwen provider support
- Provider tutorials documentation
- Trilingual README (English, Bahasa Indonesia, Chinese)

## [1.0.0] - 2026-01-23

### Added
- Initial release of Puter.js Proxy Server
- Support for 18+ LLM models
- OpenAI-compatible API endpoint (`/v1/chat/completions`)
- Anthropic-compatible API endpoint (`/v1/messages`)
- Puter native auto-routing endpoint (`/chat`)
- Intelligent model selection based on query type
- Express.js server with proper middleware
- Dotenv configuration support
- Systemd service file for Linux
- Setup script for easy installation
- CLI tool for interactive chat
- Comprehensive documentation

---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer (EN):** For Education Purpose Only. The authors and contributors assume no responsibility or liability for any damages, losses, or risks arising from the use of this software.
