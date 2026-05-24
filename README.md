# 🚀 Puter.js Proxy Server

<div align="center">

![Puter.js Proxy Server](docs/images/banner.png)

**A unified AI proxy server that provides free access to multiple LLM providers through Puter.js SDK**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Puter.js](https://img.shields.io/badge/Puter.js-2.2.5-purple?style=for-the-badge)](https://docs.puter.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/mulkymalikuldhrs/jsputer-proxy?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/jsputer-proxy/stargazers)

**English** | [中文](README.zh.md) | [Indonesia](README.id.md)

---

> 💡 **TL;DR**: This project creates a local proxy server that gives you free access to GPT-4o, Claude, DeepSeek, Gemini, Grok, Mistral, and Qwen models through Puter.js SDK - no expensive API keys needed!

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Models](#-available-models) • [Contributing](#-contributing)

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 Why Puter.js Proxy?](#-why-puterjs-proxy)
- [🚀 Quick Start](#-quick-start)
- [📖 Documentation](#-documentation)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [API Endpoints](#api-endpoints)
  - [Usage Examples](#usage-examples)
- [🤖 Available Models](#-available-models)
- [🏗️ Architecture](#️-architecture)
- [🔧 Configuration Options](#-configuration-options)
- [🛠️ Development](#️-development)
- [📊 Performance](#-performance)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [⚠️ Disclaimer](#-disclaimer)
- [📞 Contact](#-contact)

---

## ✨ Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔓 **Free Access** | No expensive API keys required |
| 🌐 **Multi-Provider** | Access 18+ LLM models from one endpoint |
| 🔄 **Auto-Routing** | Intelligent model selection based on task |
| ⚡ **High Performance** | Low latency, optimized caching |
| 🔒 **Privacy First** | All requests route through local proxy |
| 🐳 **Docker Ready** | Easy deployment with containers |
| 📡 **Standard APIs** | OpenAI and Anthropic compatible endpoints |
| 🔧 **Easy Setup** | One-command installation |

</div>

</div>

---

## 🎯 Why Puter.js Proxy?

### The Problem 💰

```
Traditional AI API Costs:
┌─────────────────┬────────────────────┬────────────────────┐
│ Provider        │ GPT-4o             │ Claude 3 Opus      │
├─────────────────┼────────────────────┼────────────────────┤
│ Price/1M tokens │ $30.00             │ $15.00             │
│ Per 1K requests │ ~$0.06             │ ~$0.03             │
│ Monthly (heavy) │ $500+              │ $250+              │
└─────────────────┴────────────────────┴────────────────────┘
```

### The Solution 🚀

```
Puter.js Proxy:
┌─────────────────┬────────────────────┬────────────────────┐
│ Provider        │ Puter.js           │ Savings            │
├─────────────────┼────────────────────┼────────────────────┤
│ Price/1M tokens │ FREE*              │ 100%               │
│ Per 1K requests │ FREE*              │ FREE               │
│ Monthly (heavy) | FREE*              | $0                 │
└─────────────────┴────────────────────┴────────────────────┘
* Through Puter.js free tier
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (Node.js 22 recommended)
- npm or yarn
- Git

### 5-Minute Setup ⏱️

```bash
# 1. Clone the repository
git clone https://github.com/mulkymalikuldhrs/jsputer-proxy.git
cd jsputer-proxy

# 2. Run setup script
chmod +x setup.sh
./setup.sh

# 3. Start the server
npm start

# 4. Test it!
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello!"}]}'
```

### Expected Response

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "deepseek-chat",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I assist you today?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20
  }
}
```

---

## 📖 Documentation

### Installation

#### Option 1: Manual Installation

```bash
# Clone the repository
git clone https://github.com/mulkymalikuldhrs/jsputer-proxy.git
cd jsputer-proxy

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your Puter.js token (optional for testing)

# Start the server
npm start
```

#### Option 2: Docker Installation

```bash
# Using Docker
docker build -t jsputer-proxy .
docker run -p 3333:3333 jsputer-proxy
```

#### Option 3: Systemd Service (Linux)

```bash
# Install as a service
sudo cp puter-proxy.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable puter-proxy
sudo systemctl start puter-proxy

# Check status
sudo systemctl status puter-proxy
```

### Configuration

#### Environment Variables

Create a `.env` file in the project root:

```env
# Puter.js Authentication Token (optional for basic usage)
# Get your token from https://puter.com/#/account
PUTER_AUTH_TOKEN=your_token_here

# Server Configuration
PORT=3333
NODE_ENV=production

# Logging
LOG_LEVEL=info
```

#### OpenCode Integration

Edit your `/home/mulky/opencode.json`:

```json
{
  "provider": {
    "puter-proxy": {
      "models": {
        "deepseek-chat": {},
        "gpt-5-chat": {},
        "gpt-4o": {},
        "gpt-4o-mini": {},
        "gemini-2.0-flash": {},
        "claude-opus-4-5-latest": {},
        "claude-sonnet-4": {},
        "claude-haiku-4-5": {},
        "grok-3": {},
        "mistral-large-2512": {},
        "codestral-2508": {},
        "qwen-2.5-coder-32b-instruct": {}
      },
      "options": {
        "baseURL": "http://localhost:3333/v1"
      }
    }
  }
}
```

### API Endpoints

#### 1. OpenAI-Compatible API

**Endpoint:** `POST http://localhost:3333/v1/chat/completions`

```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant"},
      {"role": "user", "content": "Explain quantum computing"}
    ],
    "temperature": 0.7,
    "max_tokens": 1000,
    "stream": false
  }'
```

#### 2. Anthropic-Compatible API

**Endpoint:** `POST http://localhost:3333/v1/messages`

```bash
curl -X POST http://localhost:3333/v1/messages \
  -H "Content-Type: application/json" \
  -H "Anthropic-Api-Version: 2023-06-01" \
  -d '{
    "model": "claude-opus-4-5-latest",
    "messages": [
      {"role": "user", "content": "Write a Python function for Fibonacci"}
    ],
    "max_tokens": 1000
  }'
```

#### 3. Puter Native API (Auto-Routing)

**Endpoint:** `POST http://localhost:3333/chat`

Automatically selects the best model based on your query:

```bash
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Build a REST API in Python"}],
    "stream": false
  }'
```

### Usage Examples

#### JavaScript/Node.js

```javascript
// Using OpenAI SDK
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'any-key',  // Puter.js doesn't require real API key
  baseURL: 'http://localhost:3333/v1'
});

async function chat() {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello!' }],
    stream: false
  });
  
  console.log(response.choices[0].message.content);
}

chat();
```

#### Python

```python
import requests

def chat_with_ai(message: str, model: str = "deepseek-chat") -> str:
    """Chat with any available model"""
    
    response = requests.post(
        'http://localhost:3333/v1/chat/completions',
        json={
            'model': model,
            'messages': [{'role': 'user', 'content': message}],
            'stream': False
        }
    )
    
    data = response.json()
    return data['choices'][0]['message']['content']

# Example usage
print(chat_with_ai("Hello! How are you?", "gpt-4o"))
```

#### CLI Tool

```bash
# Interactive chat
node cli.mjs

# One-liner
echo "Hello!" | node cli.mjs
```

---

## 🤖 Available Models

### ✅ Working Models (18 Total)

| Model | Provider | Type | Best For |
|-------|----------|------|----------|
| `deepseek-chat` | DeepSeek | Reasoning | General purpose, planning |
| `gpt-5-chat` | OpenAI | General | Latest OpenAI model |
| `gpt-4o` | OpenAI | General | Complex reasoning, code |
| `gpt-4o-mini` | OpenAI | Fast | Quick tasks, simple queries |
| `gemini-2.0-flash` | Google | Fast | Balanced performance |
| `gemini-2.0-flash-lite` | Google | Ultra-Fast | Lightweight tasks |
| `claude-opus-4-5-latest` | Anthropic | Code/Analysis | Best for code, architecture |
| `claude-sonnet-4` | Anthropic | Balanced | Code + analysis |
| `claude-haiku-4-5` | Anthropic | Fast | Quick tasks |
| `grok-3` | xAI | General | xAI's flagship model |
| `grok-3-fast` | xAI | Fast | Quick responses |
| `grok-2-vision` | xAI | Vision | Image understanding |
| `mistral-large-2512` | Mistral | General | Mistral's best model |
| `mistral-small-2506` | Mistral | Fast | Quick tasks |
| `mistral-medium-2508` | Mistral | Balanced | General use |
| `codestral-2508` | Mistral | Code | Code generation |
| `devstral-medium-2507` | Mistral | Code | Development tasks |
| `qwen-2.5-coder-32b-instruct` | Qwen/Coder | Code | Dedicated coding |

### ❌ Not Available

- `o1/o3` - OpenAI reasoning models (not supported by Puter.js)
- `gemini-2.5-pro` - Not yet available via Puter.js
- `claude-3-5-sonnet` - Replaced by claude-sonnet-4

### Auto-Routing Logic

The router automatically selects the best model:

```
┌─────────────────────────────────────────────────────────────┐
│                    QUERY TYPE DETECTION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BUILDING (code, implement, debug, refactor, sql...)        │
│         ↓                                                   │
│    claude-opus-4-5-latest                                   │
│                                                             │
│  PLANNING (plan, design, architecture, strategy...)         │
│         ↓                                                   │
│    deepseek-chat                                            │
│                                                             │
│  REASONING (solve, explain, calculate, prove...)            │
│         ↓                                                   │
│    gpt-4o                                                   │
│                                                             │
│  FAST (simple question, <100 chars)                         │
│         ↓                                                   │
│    gpt-4o-mini                                              │
│                                                             │
│  DEFAULT                                                    │
│         ↓                                                   │
│    deepseek-chat                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

```
                    ┌─────────────────────────────────────┐
                    │         Puter.js Proxy              │
                    │         (localhost:3333)            │
                    └─────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────┐     ┌─────────────────────────┐     ┌─────────────────┐
│  /chat          │     │  /v1/chat/completions   │     │  /v1/messages   │
│  (Auto-Routing) │     │  (OpenAI Compatible)    │     │  (Anthropic)    │
└────────┬────────┘     └────────────┬────────────┘     └────────┬────────┘
         │                          │                           │
         └──────────────────────────┼───────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────────┐
                    │         Router (router.js)           │
                    │   Intelligent Model Selection       │
                    └─────────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────────┐
                    │        Puter.js SDK (@heyputer)     │
                    │   puter.ai.chat(messages, options)  │
                    └─────────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────────┐
                    │           Puter API                 │
                    │    (api.puter.com)                  │
                    │                                     │
                    │   ┌─────────┐  ┌─────────┐         │
                    │   │GPT-4o   │  │Claude   │         │
                    │   │DeepSeek │  │Gemini   │         │
                    │   │Grok     │  │Mistral  │         │
                    │   └─────────┘  └─────────┘         │
                    └─────────────────────────────────────┘
```

---

## 🔧 Configuration Options

### Server Options

```javascript
// In index.js
const app = express();
app.use(express.json({ limit: '50mb' }));  // Large payload support
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

### Rate Limiting

Add to your middleware:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  message: { error: "Too many requests" }
});

app.use(limiter);
```

### Logging

```bash
# Enable debug mode
DEBUG=* npm start

# Or set log level
LOG_LEVEL=debug npm start
```

---

## 🛠️ Development

### Project Structure

```
puter-proxy/
├── 📁 src/                  # Source files
│   ├── index.js            # Main server
│   ├── index-https.js      # HTTPS server
│   ├── index-debug.js      # Debug server with logging
│   ├── client.js           # Puter.js client
│   ├── router.js           # Auto-routing logic
│   └── globals.js          # Polyfills
├── 📁 docs/                # Documentation
│   ├── images/             # Images and diagrams
│   ├── MODELS.md           # Model guide
│   └── API.md              # API documentation
├── 📁 scripts/             # Utility scripts
├── package.json            # Dependencies
├── setup.sh               # Installation script
├── puter-proxy.service    # Systemd service
└── README.md              # This file
```

### Adding New Models

Edit `router.js`:

```javascript
export function pickModel(messages) {
  const text = messages.map(m => m.content || "").join(" ").toLowerCase();
  
  // Add new model detection
  if (text.includes("newKeyword")) {
    return "new-model-name";
  }
  
  // ... existing logic
}
```

### Running Tests

```bash
# Test all models
npm test

# Test specific model
npm test -- --model=gpt-4o

# Test proxy endpoints
npm run test:proxy
```

---

## 📊 Performance

### Response Times (Average)

| Model | First Token | Full Response | Throughput |
|-------|-------------|---------------|------------|
| gpt-4o | ~500ms | ~1.5s | 45 tokens/s |
| deepseek-chat | ~800ms | ~1.7s | 35 tokens/s |
| claude-opus-4 | ~1.2s | ~2.7s | 28 tokens/s |
| gpt-4o-mini | ~400ms | ~1.0s | 60 tokens/s |

### Optimization Tips

1. **Use non-streaming** for simple queries
2. **Reuse connections** with keep-alive
3. **Cache responses** for repeated queries
4. **Batch requests** when possible

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 **Bug Reports** - Report bugs or issues
- 💡 **Feature Requests** - Suggest new features
- 📝 **Documentation** - Improve docs and tutorials
- 🔧 **Pull Requests** - Submit code changes
- 🌍 **Translations** - Help translate docs

### Development Setup

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR-USERNAME/jsputer-proxy.git
cd jsputer-proxy

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m "Add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

> **Important**: This project uses Puter.js SDK to access AI models. By using this software:
>
> 1. You agree to Puter.js's [Terms of Service](https://puter.com/terms) and [Privacy Policy](https://puter.com/privacy)
> 2. This software is provided "as is" without warranty of any kind
> 3. Usage may be subject to Puter.js's fair use policies
> 4. The maintainers are not responsible for any costs, damages, or issues arising from use
>
> **Note**: While Puter.js provides free access, please use responsibly and check their documentation for current limits and availability.

---

## 📞 Contact

### Developer

**Mulky Malikul Dhaher**

- 📧 Email: [mmmulkymalikuldhaher@email.com](mailto:mmulkymalikuldhaher@email.com)
- � GitHub: [@mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)
- 💼 LinkedIn: [Mulky Malikul Dhaher](https://linkedin.com/in/mulkymalikuldhaher)

### Resources

- 📚 [Puter.js Documentation](https://docs.puter.com/)
- 🐛 [Issue Tracker](https://github.com/mulkymalikuldhrs/jsputer-proxy/issues)
- 💬 [Discussions](https://github.com/mulkymalikuldhrs/jsputer-proxy/discussions)

---

## 🙏 Credits & Sources

This project wouldn't be possible without these amazing resources:

### Core Technologies

- **[Puter.js](https://github.com/HeyPuter/puter.js)** - The official JavaScript SDK for Puter
- **[Express.js](https://expressjs.com/)** - Fast, unopinionated, minimalist web framework
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[dotenv](https://github.com/motdotla/dotenv)** - Environment variable management

### Documentation & References

- [Puter.js Getting Started Guide](https://docs.puter.com/getting-started/)
- [Puter.js Auth Documentation](https://docs.puter.com/Auth/)
- [Puter.js AI/Chat API](https://docs.puter.com/AI/chat/)
- [OpenAI API Compatible](https://platform.openai.com/docs/api-reference)
- [Anthropic Messages API](https://docs.anthropic.com/claude/reference/messages)

### Inspired By

- [Ollama](https://ollama.com/) - Local LLM inference
- [LocalAI](https://localai.io/) - Local API for AI models
- [One API](https://github.com/songquanpeng/one-api) - Unified API gateway

---

## ⭐ Show Your Support

If this project helped you, please:

- ⭐ **Star** the repository
- 🐦 **Share** on Twitter
- 📢 **Spread the word** on social media
- ☕ **Buy me a coffee**

---

<div align="center">

### Made with ❤️ by [Mulky Malikul Dhaher](https://github.com/mulkymalikuldhrs)

**Puter.js Proxy** - Free AI Access for Everyone 🚀

</div>

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

---

## 🔖 Keywords & SEO Tags

```
puter.js, puter-js, ai-proxy, llm-proxy, free-ai, free-llm, 
chatgpt-alternative, claude-alternative, deepseek, gemini, 
grok, mistral, qwen, openai-compatible, anthropic-compatible,
local-ai-server, self-hosted-ai, ai-gateway, llm-gateway,
nodejs, express, javascript, typescript, ai-api, llm-api,
free-api-key, no-api-key, budget-ai, cheap-ai, affordable-ai
```

---

*Last updated: January 2026 | Version 1.0.0*
