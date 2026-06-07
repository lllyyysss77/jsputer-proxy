<div align="center">

<a href="https://github.com/mulkymalikuldhrs/ProxyGateLLM">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=32&duration=3000&pause=1000&color=2E9EF7&center=true&vCenter=true&multiline=false&repeat=true&width=500&height=50&lines=ProxyGateLLM;最大免费多LLM枢纽;AI网关系统" alt="Typing SVG" />
</a>

<br/>

**统一的多LLM网关，支持9+提供商、轮询故障转移、流式传输和智能路由 — 完全免费**

<br/>

[![版本](https://img.shields.io/badge/版本-4.0.0-2E9EF7?style=for-the-badge&logo=semver)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/releases)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MIT 许可证](https://img.shields.io/badge/许可证-MIT-F7DF1E?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/mulkymalikuldhrs/ProxyGateLLM?style=for-the-badge&logo=github&color=FFD700)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/stargazers)

<br/>

[![English](https://img.shields.io/badge/🇬🇧_English-2E9EF7?style=flat-square)](README.md)
[![Bahasa Indonesia](https://img.shields.io/badge/🇮🇩_Bahasa-FF0000?style=flat-square)](README_id.md)
[![中文](https://img.shields.io/badge/🇨🇳_中文-DE2910?style=flat-square)](#)

</div>

---

## 🇨🇳 中文

### 📋 目录

- [概述](#概述)
- [功能](#功能)
- [架构](#架构)
- [快速开始](#快速开始)
- [API 端点](#api-端点)
- [提供商](#提供商)
- [可用模型](#可用模型)
- [配置](#配置)
- [智能路由](#智能路由)
- [PWA 仪表板](#pwa-仪表板)
- [AI 代理](#ai-代理)
- [贡献](#贡献)
- [免责声明](#免责声明)
- [许可证](#许可证)

---

### 概述

**ProxyGateLLM v4.0** 是世界上最大的免费多 LLM 枢纽。提供通过 **9+ 提供商** 集中访问 **30+ AI 模型** 的能力，在免费模型可用性方面超越 OpenRouter。作为兼容 OpenAI/Anthropic 的 API，可在任何地方使用，无需后端。

**为什么选择 ProxyGateLLM？**

- 🔓 **免费** — 核心提供商无需 API 密钥
- 🌐 **9+ 提供商** — Puter.js、Pollinations、DuckDuckGo、OpenRouter、Groq、HuggingFace、G4F、Blackbox、Phind
- 🔌 **兼容 OpenAI** — `/v1/chat/completions` 直接替换
- 🤖 **兼容 Anthropic** — `/v1/messages` 直接替换
- ⚡ **轮询 + 故障转移** — 负载分发和自动回退
- 🧠 **智能路由** — 基于任务类型智能选择模型
- 📊 **PWA 仪表板** — 专业 Web 仪表板，带聊天演练场
- 🤖 **AI 代理** — 内置 AI 代理，无需后端

### 功能

| 功能 | 描述 | 状态 |
|------|------|------|
| 🌐 **9+ 提供商** | Puter.js、Pollinations、DDG、OpenRouter、Groq、HuggingFace、G4F、Blackbox、Phind | ✅ |
| 🧠 **智能路由** | 自动分类查询并路由到最佳模型 | ✅ |
| 📡 **流式 SSE** | 实时服务器发送事件进行令牌流式传输 | ✅ |
| 🔌 **兼容 OpenAI** | `/v1/chat/completions` 直接替换 | ✅ |
| 🤖 **兼容 Anthropic** | `/v1/messages` 直接替换 | ✅ |
| 🔓 **免费访问** | 6 个核心提供商无需 API 密钥 | ✅ |
| 🔄 **轮询路由** | 在支持相同模型的提供商间负载分发 | ✅ |
| 🛡️ **自动故障转移** | 一个提供商失败时自动切换到另一个 | ✅ |
| 💊 **健康检查** | 所有提供商的定期健康检查 | ✅ |
| 🔄 **模型自动同步** | 自动从提供商获取最新模型列表 | ✅ |
| 📊 **PWA 仪表板** | 专业 Web 仪表板，带实时视图 | ✅ |
| 🤖 **AI 代理** | 带交互式 CLI 的内置 AI 代理 | ✅ |
| 🛡️ **速率限制** | 每 IP 限制（默认 100 请求/分钟） | ✅ |
| 🔑 **API 密钥认证** | 可选的 API 密钥认证用于生产环境 | ✅ |
| 🔀 **模型别名** | 模型短名称（如 `gpt4` → `gpt-4o`） | ✅ |
| ✅ **输入验证** | 完整验证 — 角色、长度、消息数量 | ✅ |
| 🔒 **隐私优先** | 所有请求通过本地代理路由 | ✅ |
| 🌐 **CORS 支持** | 可配置的 CORS | ✅ |
| 📚 **专业文档** | README、API、架构、提供商、模型、PRD、教程 | ✅ |

### 架构

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────┐
│   用户   │────▶│  网关    │────▶│  路由器  │────▶│   提供商     │
│ （客户端）│     │（Express）│     │ （智能） │     │   注册表     │
└──────────┘     └──────────┘     └──────────┘     └──────┬───────┘
                                                          │
                                       ┌──────────────────┼──────────────────┐
                                       │                  │                  │
                                       ▼                  ▼                  ▼
                              ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
                              │   优先级 1   │   │   优先级 2   │   │   优先级 3   │
                              │   （免费）   │   │ （免费密钥） │   │  （不稳定）  │
                              ├─────────────┤   ├─────────────┤   ├─────────────┤
                              │ Puter.js    │   │ Groq        │   │ Blackbox    │
                              │ Pollinations│   │ HuggingFace │   │ Phind       │
                              │ DuckDuckGo  │   │ G4F         │   │             │
                              │ OpenRouter  │   │             │   │             │
                              └─────────────┘   └─────────────┘   └─────────────┘
```

### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/mulkymalikuldhrs/ProxyGateLLM.git
cd ProxyGateLLM

# 2. 安装依赖
npm install

# 3. 配置环境（可选）
cp .env.example .env
# 编辑 .env 添加可选的 API 密钥

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
| `POST /chat` | 原生 | 原生 API 自动路由 |
| `GET /health` | 状态 | 网关健康检查 |
| `GET /status` | 状态 | 服务器 + 提供商状态 |
| `GET /models` | 状态 | 列出所有可用模型 |
| `GET /providers` | 状态 | 提供商详情和统计 |
| `POST /route` | 调试 | 路由决策（不执行） |
| `GET /dashboard` | UI | PWA Web 仪表板 |

<details>
<summary>📖 请求示例</summary>

**兼容 OpenAI：**
```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "解释量子计算"}]
  }'
```

**兼容 Anthropic：**
```bash
curl -X POST http://localhost:3333/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4-5-latest",
    "messages": [{"role": "user", "content": "写一个 Python 函数"}]
  }'
```

**智能路由：**
```bash
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"构建 REST API"}]}'
```

**使用 OpenAI SDK：**
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3333/v1',
  apiKey: 'not-needed',
});

const response = await client.chat.completions.create({
  model: 'auto',
  messages: [{ role: 'user', content: '你好！' }],
});
console.log(response.choices[0].message.content);
```

**使用 Anthropic SDK：**
```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  baseURL: 'http://localhost:3333/v1',
  apiKey: 'not-needed',
});

const response = await client.messages.create({
  model: 'claude-opus-4-5-latest',
  max_tokens: 1024,
  messages: [{ role: 'user', content: '你好！' }],
});
console.log(response.content[0].text);
```
</details>

### 提供商

| 提供商 | 认证 | 优先级 | 模型 | 说明 |
|--------|------|--------|------|------|
| 🌐 **Puter.js SDK** | 可选 | 1 | 14+ | 高级模型的主要提供商 |
| 🎨 **Pollinations AI** | 无需 | 1 | 5 | 完全免费，包括 DeepSeek R1 |
| 🦆 **DuckDuckGo AI** | 无需 | 1 | 4 | 免费，GPT-4o Mini 和 Llama |
| 🔀 **OpenRouter Free** | 可选 | 1 | 自动获取 | 访问 OpenRouter 所有免费模型 |
| ⚡ **Groq** | API 密钥 | 2 | 4 | 超低延迟推理 |
| 🤗 **HuggingFace** | API 密钥 | 2 | 3 | HF Hub 上的开源模型 |
| 🔓 **G4F/FreeGPT** | 无需 | 2 | 3 | 免费 GPT-4o，可能不稳定 |
| 🖤 **Blackbox AI** | 无需 | 3 | 2 | 免费 AI 编程助手 |
| 🔍 **Phind** | 无需 | 3 | 1 | 代码专用模型 |

### 可用模型

| 模型 | 提供商 | 类型 | 适用场景 |
|------|--------|------|----------|
| `deepseek-chat` | DeepSeek/Puter | 推理 | 通用、规划 |
| `gpt-5-chat` | OpenAI/Puter | 通用 | 最新 OpenAI 模型 |
| `gpt-4o` | OpenAI/Puter | 通用 | 复杂推理、代码 |
| `gpt-4o-mini` | OpenAI/Puter | 快速 | 快速任务 |
| `gemini-2.0-flash` | Google/Puter | 快速 | 均衡性能 |
| `claude-opus-4-5-latest` | Anthropic/Puter | 代码/分析 | 最佳代码模型 |
| `claude-sonnet-4` | Anthropic/Puter | 均衡 | 代码 + 分析 |
| `claude-haiku-4-5` | Anthropic/Puter | 快速 | 快速响应 |
| `grok-3` | xAI/Puter | 通用 | xAI 旗舰模型 |
| `mistral-large-2512` | Mistral/Puter | 通用 | Mistral 最佳模型 |
| `codestral-2508` | Mistral/Puter | 代码 | 代码生成 |
| `qwen-2.5-coder-32b-instruct` | Qwen/Puter | 代码 | 专用编码 |
| `llama-3.1-70b` | Llama/DDG/Pollinations | 通用 | 开源模型 |
| `deepseek-r1` | DeepSeek/Pollinations | 推理 | 逐步推理 |

> **注意：** 完整模型列表可通过 `GET /models` 获取。模型自动从提供商获取。

### 配置

```env
# Puter.js 认证（基本使用可选）
PUTER_AUTH_TOKEN=your_token_here

# 提供商 API 密钥（可选）
GROQ_API_KEY=your_groq_key
HUGGINGFACE_API_KEY=your_hf_key
OPENROUTER_API_KEY=your_openrouter_key

# 服务器
PORT=3333
NODE_ENV=development

# 日志
LOG_LEVEL=info

# 速率限制
RATELIMIT_WINDOW_MS=60000
RATELIMIT_MAX_REQUESTS=100

# CORS（留空以禁用）
CORS_ORIGIN=http://localhost:3000

# API 密钥认证（留空以禁用）
API_KEY=your_secret_key

# 健康检查
HEALTH_CHECK_INTERVAL_MS=60000

# 模型同步
MODEL_SYNC_INTERVAL_MS=3600000
```

### 智能路由

路由器根据查询内容自动选择最佳模型：

```
构建   （代码、实现、调试、重构、sql...）     →  claude-opus-4-5-latest
规划   （计划、设计、策略、架构...）           →  deepseek-chat
推理   （解决、解释、计算、证明...）           →  gpt-4o
快速   （简单问题，<100 字符）                →  gpt-4o-mini
默认                                           →  deepseek-chat
```

**示例：**
```bash
# 代码查询自动路由到 Claude Opus
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"调试我的 Python Flask 应用"}]}'

# 查看路由决策（不执行）
curl -X POST http://localhost:3333/route \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"用 Express.js 构建 REST API"}]}'
```

### PWA 仪表板

ProxyGateLLM 包含一个渐进式 Web 仪表板，位于 `http://localhost:3333/dashboard`：

- **概览**：活跃提供商、可用模型、运行时间、版本
- **提供商**：每个提供商的详细状态、指标、健康检查
- **模型**：可搜索的模型网格，带类型徽章和提供商信息
- **演练场**：带模型选择器、格式切换、流式切换的聊天演练场
- **API 参考**：端点文档和代码示例
- **移动端响应式**：可折叠侧边栏、响应式网格
- **深色主题**：受 Vercel/Railway 启发的专业深色设计

### AI 代理

ProxyGateLLM 包含一个内置 AI 代理，可从浏览器或 Node.js 使用：

```javascript
import { ProxyGateLLMAgent } from './agent/index.js';

const agent = new ProxyGateLLMAgent({
  model: 'auto',
  format: 'openai',
});

// 普通聊天
const response = await agent.chat('解释量子计算');

// 多步推理
const result = await agent.reason('设计微服务架构', 3);
console.log(result.steps); // 分析步骤数组
console.log(result.answer); // 最终答案

// 带审查的代码生成
const { code, review } = await agent.generateCode('Express REST API', 'javascript');
```

**CLI 模式：**
```bash
node agent/index.js
# 🤖 ProxyGateLLM Agent（输入 "quit" 退出，"clear" 重置，"models" 列出模型）
```

### 贡献

欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

### 免责声明

> **⚠️ 仅供教育目的**
>
> 本项目严格用于教育和研究目的。作者和贡献者**不承担**因使用本软件而产生的任何损害、损失或风险的责任。**我们不承担任何责任或风险**对于本软件的使用方式。严禁将本软件用于商业、非法或不道德的目的。

**联系方式：** Mulky Malikul Dhaher | [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)

### 许可证

本项目采用 MIT 许可证 — 详见 [LICENSE](LICENSE) 文件。

---

<div align="center">

## ⭐ Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=mulkymalikuldhrs/ProxyGateLLM&type=Date)](https://star-history.com/#mulkymalikuldhrs/ProxyGateLLM&Date)

<br/>

## 🔗 链接

[![GitHub](https://img.shields.io/badge/GitHub-仓库-181717?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/ProxyGateLLM)
[![Issues](https://img.shields.io/badge/Issues-报告-red?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/issues)
[![Discussions](https://img.shields.io/badge/讨论-加入-blue?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/discussions)
[![Email](https://img.shields.io/badge/邮箱-联系-EA4335?style=for-the-badge&logo=gmail)](mailto:mulkymalikuldhaher@email.com)

<br/>

### 用 ❤️ 构建由 [Mulky Malikul Dhaher](https://github.com/mulkymalikuldhrs)

**ProxyGateLLM** — 人人可用的免费 AI 访问 🚀

**仅供教育目的 — 不承担任何责任或风险**

</div>
