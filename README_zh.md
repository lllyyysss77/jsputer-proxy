# 🚀 Puter.js 代理服务器

<div align="center">

**通过 Puter.js SDK 免费访问多个 LLM 提供商的统一 AI 代理服务器**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Puter.js](https://img.shields.io/badge/Puter.js-2.2.5-purple?style=for-the-badge)](https://docs.puter.com/)
[![许可证](https://img.shields.io/badge/许可证-MIT-yellow?style=for-the-badge)](LICENSE)

[English](README.md) | [Bahasa Indonesia](README_id.md) | **中文**

---

> 💡 **简而言之**：本项目创建一个本地代理服务器，通过 Puter.js SDK 为您免费提供 GPT-4o、Claude、DeepSeek、Gemini、Grok、Mistral 和 Qwen 模型的访问——无需昂贵的 API 密钥！

</div>

---

## ✨ 功能特点

| 功能 | 描述 |
|------|------|
| 🔓 **免费访问** | 无需昂贵的 API 密钥 |
| 🌐 **多提供商** | 从一个端点访问 18+ LLM 模型 |
| 🔄 **智能路由** | 基于任务智能选择模型 |
| ⚡ **高性能** | 低延迟，优化的缓存 |
| 🔒 **隐私优先** | 所有请求通过本地代理路由 |
| 🐳 **Docker 就绪** | 容器化轻松部署 |
| 📡 **标准 API** | 兼容 OpenAI 和 Anthropic 的端点 |
| 🔧 **简单设置** | 一键安装 |

---

## 🎯 为什么选择 Puter.js 代理？

### 问题 💰

```
传统 AI API 费用：
┌─────────────────┬────────────────────┬────────────────────┐
│ 提供商          │ GPT-4o             │ Claude 3 Opus      │
├─────────────────┼────────────────────┼────────────────────┤
│ 价格/1M token   │ $30.00             │ $15.00             │
│ 每 1K 请求      │ ~$0.06             │ ~$0.03             │
│ 月费（重度使用）│ $500+              │ $250+              │
└─────────────────┴────────────────────┴────────────────────┘
```

### 解决方案 🚀

```
Puter.js 代理：
┌─────────────────┬────────────────────┬────────────────────┐
│ 提供商          │ Puter.js           │ 节省               │
├─────────────────┼────────────────────┼────────────────────┤
│ 价格/1M token   │ 免费*              │ 100%               │
│ 每 1K 请求      │ 免费*              │ 免费               │
│ 月费（重度使用）│ 免费*              │ $0                 │
└─────────────────┴────────────────────┴────────────────────┘
* 通过 Puter.js 免费层
```

---

## 🚀 快速开始

### 前置条件

- Node.js 18+（推荐 Node.js 22）
- npm 或 yarn
- Git

### 5 分钟设置 ⏱️

```bash
# 1. 克隆仓库
git clone https://github.com/mulkymalikuldhrs/jsputer-proxy.git
cd jsputer-proxy

# 2. 运行设置脚本
chmod +x setup.sh
./setup.sh

# 3. 启动服务器
npm start

# 4. 测试！
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"你好！"}]}'
```

---

## 🤖 可用模型

### ✅ 可用模型（共 18 个）

| 模型 | 提供商 | 类型 | 最佳用途 |
|------|--------|------|----------|
| `deepseek-chat` | DeepSeek | 推理 | 通用、规划 |
| `gpt-5-chat` | OpenAI | 通用 | 最新 OpenAI 模型 |
| `gpt-4o` | OpenAI | 通用 | 复杂推理、代码 |
| `gpt-4o-mini` | OpenAI | 快速 | 快速任务、简单查询 |
| `gemini-2.0-flash` | Google | 快速 | 均衡性能 |
| `claude-opus-4-5-latest` | Anthropic | 代码/分析 | 最佳代码、架构 |
| `claude-sonnet-4` | Anthropic | 均衡 | 代码 + 分析 |
| `grok-3` | xAI | 通用 | xAI 旗舰模型 |
| `mistral-large-2512` | Mistral | 通用 | Mistral 最佳模型 |
| `qwen-2.5-coder-32b-instruct` | Qwen/Coder | 代码 | 专用编码 |

### 智能路由逻辑

路由器自动选择最佳模型：

- **构建**（代码、实现、调试）→ `claude-opus-4-5-latest`
- **规划**（计划、设计、架构）→ `deepseek-chat`
- **推理**（解决、解释、计算）→ `gpt-4o`
- **快速**（简单问题，<100字符）→ `gpt-4o-mini`
- **默认** → `deepseek-chat`

---

## 📡 API 端点

### 1. OpenAI 兼容 API

**端点：** `POST http://localhost:3333/v1/chat/completions`

```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "你是一个有帮助的助手"},
      {"role": "user", "content": "解释量子计算"}
    ],
    "temperature": 0.7,
    "max_tokens": 1000,
    "stream": false
  }'
```

### 2. Anthropic 兼容 API

**端点：** `POST http://localhost:3333/v1/messages`

### 3. Puter 原生 API（智能路由）

**端点：** `POST http://localhost:3333/chat`

根据您的查询自动选择最佳模型。

---

## 📊 性能

| 模型 | 首个 Token | 完整响应 | 吞吐量 |
|------|-----------|---------|--------|
| gpt-4o | ~500ms | ~1.5s | 45 token/s |
| deepseek-chat | ~800ms | ~1.7s | 35 token/s |
| claude-opus-4 | ~1.2s | ~2.7s | 28 token/s |
| gpt-4o-mini | ~400ms | ~1.0s | 60 token/s |

---

## ⚠️ 免责声明

> **重要提示**：本项目使用 Puter.js SDK 访问 AI 模型。使用本软件即表示您：
>
> 1. 同意 Puter.js 的[服务条款](https://puter.com/terms)和[隐私政策](https://puter.com/privacy)
> 2. 本软件按"原样"提供，不附带任何形式的保证
> 3. 使用可能受 Puter.js 合理使用政策的约束
> 4. 维护者不对使用中产生的任何费用、损害或问题负责

---

## 📞 联系方式

**Mulky Malikul Dhaher**

- 📧 邮箱：[mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
- 🐙 GitHub：[@mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)

---

## 📜 许可证

本项目采用 MIT 许可证 — 详见 [LICENSE](LICENSE) 文件。

---

<div align="center">

### 用 ❤️ 构建由 [Mulky Malikul Dhaher](https://github.com/mulkymalikuldhrs)

**Puter.js 代理** — 人人可用的免费 AI 访问 🚀

</div>
