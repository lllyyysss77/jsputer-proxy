<div align="center">

<a href="https://github.com/mulkymalikuldhrs/jsputer-proxy">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=32&duration=3000&pause=1000&color=2E9EF7&center=true&vCenter=true&multiline=false&repeat=true&width=500&height=50&lines=JSUPTER+AI+Gateway;Multi-LLM+Router;AI+Gateway+System" alt="Typing SVG" />
</a>

<br/>

**Unified Multi-LLM Gateway with task-based routing, streaming, and multi-provider support**

<br/>

[![Version](https://img.shields.io/badge/Version-2.0.0-2E9EF7?style=for-the-badge&logo=semver)](https://github.com/mulkymalikuldhrs/jsputer-proxy/releases)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Z.ai](https://img.shields.io/badge/Z.ai-SDK-FF6B35?style=for-the-badge)](https://www.npmjs.com/package/z-ai-web-dev-sdk)
[![Qwen](https://img.shields.io/badge/Qwen-2.5-615FFF?style=for-the-badge)](https://qwenlm.github.io/)
[![Puter.js](https://img.shields.io/badge/Puter.js-2.2.5-8B5CF6?style=for-the-badge)](https://docs.puter.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/mulkymalikuldhrs/jsputer-proxy?style=for-the-badge&logo=github&color=FFD700)](https://github.com/mulkymalikuldhrs/jsputer-proxy/stargazers)

<br/>

[![English](https://img.shields.io/badge/🇬🇧_English-2E9EF7?style=flat-square)](#-english) 
[![Bahasa Indonesia](https://img.shields.io/badge/🇮🇩_Bahasa-FF0000?style=flat-square)](#-bahasa-indonesia) 
[![中文](https://img.shields.io/badge/🇨🇳_中文-DE2910?style=flat-square)](#-中文)

</div>

---

<!-- ===================================================================== -->
<!-- ENGLISH -->
<!-- ===================================================================== -->

## 🇬🇧 English

### 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Available Models](#available-models)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

### Overview

**JSUPTER AI Gateway** is a unified multi-LLM gateway that intelligently routes AI requests to the best provider based on task type. It supports streaming SSE, is OpenAI/Anthropic API compatible, and provides free access to 18+ models through Puter.js alongside dedicated reasoning (Z.ai) and code (Qwen) providers.

### Architecture

```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌──────────────┐     ┌────────┐
│   User   │────▶│ Gateway  │────▶│ Classifier │────▶│  Router   │────▶│  Provider    │────▶│ Stream │
│ (Client) │     │ (Express)│     │ (Task AI)  │     │(Router.js)│     │(Z/Qwen/Puter)│     │  (SSE) │
└──────────┘     └──────────┘     └────────────┘     └──────────┘     └──────────────┘     └────────┘
                                                                        │
                                                                        ├─▶ Z.ai (Reasoning)
                                                                        ├─▶ Qwen (Code/Structured)
                                                                        └─▶ Puter.js (18+ Models)
```

### Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🧠 **Task-Based Routing** | Automatically classifies queries and routes to the best model | ✅ |
| 🌐 **Multi-Provider** | Z.ai (reasoning), Qwen (code), Puter.js (18+ models) | ✅ |
| 📡 **Streaming SSE** | Real-time Server-Sent Events for token streaming | ✅ |
| 🔌 **OpenAI Compatible** | Drop-in replacement for `/v1/chat/completions` | ✅ |
| 🤖 **Anthropic Compatible** | Drop-in replacement for `/v1/messages` | ✅ |
| 🔓 **Free Access** | No expensive API keys required via Puter.js | ✅ |
| ⚡ **Auto-Routing** | Intelligent model selection based on query type | ✅ |
| 🔒 **Privacy First** | All requests route through your local proxy | ✅ |
| 🐳 **Docker Ready** | Easy deployment with containers | ✅ |
| 📊 **50MB Payloads** | Large context and document support | ✅ |

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/mulkymalikuldhrs/jsputer-proxy.git
cd jsputer-proxy

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your Puter.js token (optional for basic usage)

# 4. Start the server
npm start

# 5. Test it!
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello!"}]}'
```

### API Endpoints

| Endpoint | Protocol | Description |
|----------|----------|-------------|
| `POST /v1/chat/completions` | OpenAI | OpenAI-compatible chat completions |
| `POST /v1/messages` | Anthropic | Anthropic-compatible messages |
| `POST /chat` | Native | Puter native API with auto-routing |

<details>
<summary>📖 Example Requests</summary>

**OpenAI Compatible:**
```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Explain quantum computing"}]
  }'
```

**Anthropic Compatible:**
```bash
curl -X POST http://localhost:3333/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4-5-latest",
    "messages": [{"role": "user", "content": "Write a Python function"}]
  }'
```

**Auto-Routing:**
```bash
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Build a REST API"}]}'
```
</details>

### Available Models

| Model | Provider | Type | Best For |
|-------|----------|------|----------|
| `deepseek-chat` | DeepSeek | Reasoning | General purpose, planning |
| `deepseek-reasoner` | DeepSeek | Reasoning | Complex reasoning, step-by-step |
| `gpt-5-chat` | OpenAI | General | Latest OpenAI model |
| `gpt-5-nano` | OpenAI | Fast | Quick tasks, simple queries |
| `gpt-4o` | OpenAI | General | Complex reasoning, code |
| `gpt-4o-mini` | OpenAI | Fast | Quick tasks |
| `gemini-2.0-flash` | Google | Fast | Balanced performance |
| `claude-opus-4-5-latest` | Anthropic | Code/Analysis | Best for code, architecture |
| `claude-sonnet-4` | Anthropic | Balanced | Code + analysis |
| `claude-haiku-4-5` | Anthropic | Fast | Quick tasks |
| `grok-3` | xAI | General | xAI's flagship model |
| `grok-3-fast` | xAI | Fast | Quick responses |
| `grok-2-vision` | xAI | Vision | Image understanding |
| `mistral-large-2512` | Mistral | General | Mistral's best model |
| `codestral-2508` | Mistral | Code | Code generation |
| `qwen-2.5-coder-32b-instruct` | Qwen | Code | Dedicated coding |

### Configuration

```env
# Puter.js Authentication (optional for basic usage)
PUTER_AUTH_TOKEN=your_token_here

# Server
PORT=3333
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

### Auto-Routing Logic

```
BUILDING (code, implement, debug, refactor, sql...)  →  gpt-5-nano
PLANNING  (plan, design, strategy, architecture...)   →  deepseek-reasoner
REASONING (solve, explain, calculate, prove...)       →  deepseek-reasoner
FAST      (simple question, <100 chars)               →  gpt-5-nano
DEFAULT                                               →  gpt-5-nano
```

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<!-- ===================================================================== -->
<!-- BAHASA INDONESIA -->
<!-- ===================================================================== -->

## 🇮🇩 Bahasa Indonesia

### 📋 Daftar Isi

- [Ringkasan](#ringkasan)
- [Arsitektur](#arsitektur-id)
- [Fitur](#fitur)
- [Mulai Cepat](#mulai-cepat)
- [Endpoint API](#endpoint-api)
- [Model Tersedia](#model-tersedia)
- [Konfigurasi](#konfigurasi-id)
- [Kontribusi](#kontribusi-id)
- [Lisensi](#lisensi-id)

---

### Ringkasan

**JSUPTER AI Gateway** adalah gateway multi-LLM terpadu yang secara cerdas merutekan permintaan AI ke penyedia terbaik berdasarkan jenis tugas. Mendukung streaming SSE, kompatibel dengan API OpenAI/Anthropic, dan menyediakan akses gratis ke 18+ model melalui Puter.js bersama penyedia reasoning (Z.ai) dan kode (Qwen).

### Arsitektur {#arsitektur-id}

```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌──────────────┐     ┌────────┐
│   User   │────▶│ Gateway  │────▶│ Klasifikasi│────▶│  Router   │────▶│  Provider    │────▶│ Stream │
│ (Klien)  │     │ (Express)│     │ (Tugas AI) │     │(Router.js)│     │(Z/Qwen/Puter)│     │  (SSE) │
└──────────┘     └──────────┘     └────────────┘     └──────────┘     └──────────────┘     └────────┘
                                                                        │
                                                                        ├─▶ Z.ai (Reasoning)
                                                                        ├─▶ Qwen (Kode/Terstruktur)
                                                                        └─▶ Puter.js (18+ Model)
```

### Fitur

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| 🧠 **Rute Berbasis Tugas** | Otomatis mengklasifikasikan kueri dan merutekan ke model terbaik | ✅ |
| 🌐 **Multi-Provider** | Z.ai (reasoning), Qwen (kode), Puter.js (18+ model) | ✅ |
| 📡 **Streaming SSE** | Server-Sent Events untuk streaming token secara real-time | ✅ |
| 🔌 **Kompatibel OpenAI** | Pengganti langsung untuk `/v1/chat/completions` | ✅ |
| 🤖 **Kompatibel Anthropic** | Pengganti langsung untuk `/v1/messages` | ✅ |
| 🔓 **Akses Gratis** | Tidak perlu kunci API yang mahal melalui Puter.js | ✅ |
| ⚡ **Auto-Routing** | Pemilihan model cerdas berdasarkan jenis kueri | ✅ |
| 🔒 **Privasi Utama** | Semua permintaan melalui proxy lokal Anda | ✅ |

### Mulai Cepat

```bash
# 1. Clone repositori
git clone https://github.com/mulkymalikuldhrs/jsputer-proxy.git
cd jsputer-proxy

# 2. Install dependensi
npm install

# 3. Konfigurasi lingkungan
cp .env.example .env

# 4. Mulai server
npm start

# 5. Uji!
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Halo!"}]}'
```

### Endpoint API

| Endpoint | Protokol | Deskripsi |
|----------|----------|-----------|
| `POST /v1/chat/completions` | OpenAI | Chat completions kompatibel OpenAI |
| `POST /v1/messages` | Anthropic | Messages kompatibel Anthropic |
| `POST /chat` | Native | API native Puter dengan auto-routing |

### Model Tersedia

| Model | Penyedia | Tipe | Cocok Untuk |
|-------|----------|------|-------------|
| `deepseek-chat` | DeepSeek | Reasoning | Tujuan umum, perencanaan |
| `deepseek-reasoner` | DeepSeek | Reasoning | Penalaran kompleks |
| `gpt-5-chat` | OpenAI | Umum | Model OpenAI terbaru |
| `gpt-5-nano` | OpenAI | Cepat | Tugas ringan |
| `gpt-4o` | OpenAI | Umum | Penalaran kompleks, kode |
| `claude-opus-4-5-latest` | Anthropic | Kode/Analisis | Terbaik untuk kode |
| `grok-3` | xAI | Umum | Model andalan xAI |
| `qwen-2.5-coder-32b-instruct` | Qwen | Kode | Koding khusus |

### Konfigurasi {#konfigurasi-id}

```env
PUTER_AUTH_TOKEN=token_anda_di_sini
PORT=3333
NODE_ENV=development
LOG_LEVEL=info
```

### Kontribusi {#kontribusi-id}

Kami menyambut kontribusi! Silakan lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk detailnya.

### Lisensi {#lisensi-id}

Proyek ini dilisensikan di bawah Lisensi MIT — lihat file [LICENSE](LICENSE) untuk detailnya.

---

<!-- ===================================================================== -->
<!-- 中文 -->
<!-- ===================================================================== -->

## 🇨🇳 中文

### 📋 目录

- [概述](#概述)
- [架构](#架构-cn)
- [功能](#功能)
- [快速开始](#快速开始)
- [API 端点](#api-端点)
- [可用模型](#可用模型-cn)
- [配置](#配置-cn)
- [贡献](#贡献)
- [许可证](#许可证)

---

### 概述

**JSUPTER AI Gateway** 是一个统一的多 LLM 网关，根据任务类型智能地将 AI 请求路由到最佳提供商。支持流式 SSE，兼容 OpenAI/Anthropic API，并通过 Puter.js 免费访问 18+ 模型，同时配备专用推理（Z.ai）和代码（Qwen）提供商。

### 架构 {#架构-cn}

```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌──────────────┐     ┌────────┐
│   用户   │────▶│  网关    │────▶│  分类器    │────▶│  路由器   │────▶│   提供商     │────▶│  流式  │
│ （客户端）│     │（Express）│     │（任务 AI） │     │(Router.js)│     │(Z/Qwen/Puter)│     │ （SSE）│
└──────────┘     └──────────┘     └────────────┘     └──────────┘     └──────────────┘     └────────┘
                                                                        │
                                                                        ├─▶ Z.ai（推理）
                                                                        ├─▶ Qwen（代码/结构化）
                                                                        └─▶ Puter.js（18+ 模型）
```

### 功能

| 功能 | 描述 | 状态 |
|------|------|------|
| 🧠 **任务路由** | 自动分类查询并路由到最佳模型 | ✅ |
| 🌐 **多提供商** | Z.ai（推理）、Qwen（代码）、Puter.js（18+ 模型） | ✅ |
| 📡 **流式 SSE** | 实时服务器发送事件进行令牌流式传输 | ✅ |
| 🔌 **兼容 OpenAI** | `/v1/chat/completions` 直接替换 | ✅ |
| 🤖 **兼容 Anthropic** | `/v1/messages` 直接替换 | ✅ |
| 🔓 **免费访问** | 通过 Puter.js 无需昂贵的 API 密钥 | ✅ |
| ⚡ **智能路由** | 基于查询类型的智能模型选择 | ✅ |
| 🔒 **隐私优先** | 所有请求通过本地代理路由 | ✅ |

### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/mulkymalikuldhrs/jsputer-proxy.git
cd jsputer-proxy

# 2. 安装依赖
npm install

# 3. 配置环境
cp .env.example .env

# 4. 启动服务器
npm start

# 5. 测试！
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"你好！"}]}'
```

### API 端点

| 端点 | 协议 | 描述 |
|------|------|------|
| `POST /v1/chat/completions` | OpenAI | 兼容 OpenAI 的聊天补全 |
| `POST /v1/messages` | Anthropic | 兼容 Anthropic 的消息 |
| `POST /chat` | 原生 | Puter 原生 API 自动路由 |

### 可用模型 {#可用模型-cn}

| 模型 | 提供商 | 类型 | 适用场景 |
|------|--------|------|----------|
| `deepseek-chat` | DeepSeek | 推理 | 通用、规划 |
| `deepseek-reasoner` | DeepSeek | 推理 | 复杂推理 |
| `gpt-5-chat` | OpenAI | 通用 | 最新 OpenAI 模型 |
| `gpt-5-nano` | OpenAI | 快速 | 轻量任务 |
| `gpt-4o` | OpenAI | 通用 | 复杂推理、代码 |
| `claude-opus-4-5-latest` | Anthropic | 代码/分析 | 最佳代码模型 |
| `grok-3` | xAI | 通用 | xAI 旗舰模型 |
| `qwen-2.5-coder-32b-instruct` | Qwen | 代码 | 专用编码 |

### 配置 {#配置-cn}

```env
PUTER_AUTH_TOKEN=your_token_here
PORT=3333
NODE_ENV=development
LOG_LEVEL=info
```

### 贡献

欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

### 许可证

本项目采用 MIT 许可证 — 详见 [LICENSE](LICENSE) 文件。

---

<!-- ===================================================================== -->
<!-- FOOTER -->
<!-- ===================================================================== -->

<div align="center">

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mulkymalikuldhrs/jsputer-proxy&type=Date)](https://star-history.com/#mulkymalikuldhrs/jsputer-proxy&Date)

<br/>

## 🔗 Links

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/jsputer-proxy)
[![Issues](https://img.shields.io/badge/Issues-Report-red?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/jsputer-proxy/issues)
[![Discussions](https://img.shields.io/badge/Discussions-Join-blue?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/jsputer-proxy/discussions)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=for-the-badge&logo=gmail)](mailto:mulkymalikuldhaher@email.com)

<br/>

![Profile Views](https://komarev.com/ghpvc/?username=mulkymalikuldhrs&style=for-the-badge&color=2E9EF7)

<br/>

### Made with ❤️ by [Mulky Malikul Dhaher](https://github.com/mulkymalikuldhrs)

**JSUPTER AI Gateway** — Free AI Access for Everyone 🚀

</div>
