<div align="center">

<a href="https://github.com/mulkymalikuldhrs/ProxyGateLLM">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=32&duration=3000&pause=1000&color=2E9EF7&center=true&vCenter=true&multiline=false&repeat=true&width=500&height=50&lines=ProxyGateLLM+AI+Gateway;Hub+Multi-LLM+Terbesar;Gateway+AI+Gratis" alt="Typing SVG" />
</a>

<br/>

**Gateway Multi-LLM terpadu dengan 9+ provider, round-robin failover, streaming, dan auto-routing — semuanya gratis**
*sebelumnya jsputer-proxy*

<br/>

[![Versi](https://img.shields.io/badge/Versi-4.0.0-2E9EF7?style=for-the-badge&logo=semver)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/releases)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Lisensi MIT](https://img.shields.io/badge/Lisensi-MIT-F7DF1E?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/mulkymalikuldhrs/ProxyGateLLM?style=for-the-badge&logo=github&color=FFD700)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/stargazers)

<br/>

[![English](https://img.shields.io/badge/🇬🇧_English-2E9EF7?style=flat-square)](README.md)
[![Bahasa Indonesia](https://img.shields.io/badge/🇮🇩_Bahasa-FF0000?style=flat-square)](#)
[![中文](https://img.shields.io/badge/🇨🇳_中文-DE2910?style=flat-square)](README_zh.md)

</div>

---

## 🇮🇩 Bahasa Indonesia

### 📋 Daftar Isi

- [Ringkasan](#ringkasan)
- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Mulai Cepat](#mulai-cepat)
- [Endpoint API](#endpoint-api)
- [Provider](#provider)
- [Model Tersedia](#model-tersedia)
- [Konfigurasi](#konfigurasi)
- [Auto-Routing](#auto-routing)
- [Dashboard PWA](#dashboard-pwa)
- [AI Agent](#ai-agent)
- [Kontribusi](#kontribusi)
- [Disclaimer](#disclaimer)
- [Lisensi](#lisensi)

---

### Ringkasan

**ProxyGateLLM v4.0** adalah hub multi-LLM gratis terbesar di dunia. Gateway ini menyediakan akses terpusat ke **30+ model AI** melalui **9+ provider**, melebihi OpenRouter dalam ketersediaan model gratis. Berfungsi sebagai API kompatibel OpenAI/Anthropic yang bisa digunakan di mana saja tanpa backend.

**Mengapa ProxyGateLLM?**

- 🔓 **Gratis** — Tidak perlu kunci API untuk provider utama
- 🌐 **9+ Provider** — Puter.js, Pollinations, DuckDuckGo, OpenRouter, Groq, HuggingFace, G4F, Blackbox, Phind
- 🔌 **Kompatibel OpenAI** — Drop-in replacement untuk `/v1/chat/completions`
- 🤖 **Kompatibel Anthropic** — Drop-in replacement untuk `/v1/messages`
- ⚡ **Round-Robin + Failover** — Distribusi beban dan fallback otomatis
- 🧠 **Auto-Routing** — Pemilihan model cerdas berdasarkan tugas
- 📊 **Dashboard PWA** — Dashboard web profesional dengan playground chat
- 🤖 **AI Agent** — Agent AI bawaan tanpa backend

### Fitur

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| 🌐 **9+ Provider** | Puter.js, Pollinations, DDG, OpenRouter, Groq, HuggingFace, G4F, Blackbox, Phind | ✅ |
| 🧠 **Auto-Routing** | Otomatis mengklasifikasikan kueri dan merutekan ke model terbaik | ✅ |
| 📡 **Streaming SSE** | Server-Sent Events untuk streaming token secara real-time | ✅ |
| 🔌 **Kompatibel OpenAI** | Pengganti langsung untuk `/v1/chat/completions` | ✅ |
| 🤖 **Kompatibel Anthropic** | Pengganti langsung untuk `/v1/messages` | ✅ |
| 🔓 **Akses Gratis** | Tidak perlu kunci API untuk 6 provider utama | ✅ |
| 🔄 **Round-Robin** | Distribusi beban di antara provider yang mendukung model sama | ✅ |
| 🛡️ **Failover Otomatis** | Otomatis beralih ke provider lain saat satu gagal | ✅ |
| 💊 **Health Checking** | Pemeriksaan kesehatan periodik untuk semua provider | ✅ |
| 🔄 **Model Auto-Sync** | Otomatis mengambil daftar model terbaru dari provider | ✅ |
| 📊 **Dashboard PWA** | Dashboard web profesional dengan tampilan real-time | ✅ |
| 🤖 **AI Agent** | Agent AI bawaan dengan CLI interaktif | ✅ |
| 🛡️ **Rate Limiting** | Pembatasan per-IP (100 req/menit default) | ✅ |
| 🔑 **API Key Auth** | Autentikasi kunci API opsional untuk produksi | ✅ |
| 🔀 **Model Aliases** | Nama pendek untuk model (contoh: `gpt4` → `gpt-4o`) | ✅ |
| ✅ **Validasi Input** | Validasi lengkap — role, panjang, jumlah pesan | ✅ |
| 🔒 **Privasi Utama** | Semua permintaan melalui proxy lokal Anda | ✅ |
| 🌐 **CORS Support** | CORS yang dapat dikonfigurasi | ✅ |
| 📚 **Dokumentasi Profesional** | README, API, Arsitektur, Provider, Model, PRD, Tutorial | ✅ |

### Arsitektur

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────┐
│   User   │────▶│ Gateway  │────▶│  Router  │────▶│  Provider    │
│ (Klien)  │     │ (Express)│     │ (Smart)  │     │  Registry    │
└──────────┘     └──────────┘     └──────────┘     └──────┬───────┘
                                                          │
                                       ┌──────────────────┼──────────────────┐
                                       │                  │                  │
                                       ▼                  ▼                  ▼
                              ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
                              │  Priority 1  │   │  Priority 2  │   │  Priority 3  │
                              │  (Gratis)    │   │  (Free Key)  │   │  (Fragile)   │
                              ├─────────────┤   ├─────────────┤   ├─────────────┤
                              │ Puter.js    │   │ Groq        │   │ Blackbox    │
                              │ Pollinations│   │ HuggingFace │   │ Phind       │
                              │ DuckDuckGo  │   │ G4F         │   │             │
                              │ OpenRouter  │   │             │   │             │
                              └─────────────┘   └─────────────┘   └─────────────┘
```

### Mulai Cepat

```bash
# 1. Clone repositori
git clone https://github.com/mulkymalikuldhrs/ProxyGateLLM.git
cd ProxyGateLLM

# 2. Install dependensi
npm install

# 3. Konfigurasi lingkungan (opsional)
cp .env.example .env
# Edit .env untuk menambahkan kunci API opsional

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
| `POST /chat` | Native | Chat native dengan auto-routing |
| `GET /health` | Status | Pemeriksaan kesehatan gateway |
| `GET /status` | Status | Status server + provider |
| `GET /models` | Status | Daftar semua model tersedia |
| `GET /providers` | Status | Detail dan statistik provider |
| `POST /route` | Debug | Keputusan routing (tanpa eksekusi) |
| `GET /dashboard` | UI | Dashboard web PWA |

<details>
<summary>📖 Contoh Permintaan</summary>

**Kompatibel OpenAI:**
```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Jelaskan komputasi kuantum"}]
  }'
```

**Kompatibel Anthropic:**
```bash
curl -X POST http://localhost:3333/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4-5-latest",
    "messages": [{"role": "user", "content": "Tulis fungsi Python"}]
  }'
```

**Auto-Routing:**
```bash
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Buat REST API"}]}'
```

**Menggunakan OpenAI SDK:**
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3333/v1',
  apiKey: 'not-needed',
});

const response = await client.chat.completions.create({
  model: 'auto',
  messages: [{ role: 'user', content: 'Halo!' }],
});
console.log(response.choices[0].message.content);
```

**Menggunakan Anthropic SDK:**
```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  baseURL: 'http://localhost:3333/v1',
  apiKey: 'not-needed',
});

const response = await client.messages.create({
  model: 'claude-opus-4-5-latest',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Halo!' }],
});
console.log(response.content[0].text);
```
</details>

### Provider

| Provider | Autentikasi | Prioritas | Model | Keterangan |
|----------|-------------|-----------|-------|------------|
| 🌐 **Puter.js SDK** | Opsional | 1 | 14+ | Provider utama untuk model premium |
| 🎨 **Pollinations AI** | Tidak perlu | 1 | 5 | Sepenuhnya gratis, termasuk DeepSeek R1 |
| 🦆 **DuckDuckGo AI** | Tidak perlu | 1 | 4 | Gratis, GPT-4o Mini dan Llama |
| 🔀 **OpenRouter Free** | Opsional | 1 | Auto-fetch | Akses ke semua model gratis OpenRouter |
| ⚡ **Groq** | API Key | 2 | 4 | Inferensi latensi ultra-rendah |
| 🤗 **HuggingFace** | API Key | 2 | 3 | Model open-source dari HF Hub |
| 🔓 **G4F/FreeGPT** | Tidak perlu | 2 | 3 | GPT-4o gratis, mungkin tidak stabil |
| 🖤 **Blackbox AI** | Tidak perlu | 3 | 2 | Asisten coding AI gratis |
| 🔍 **Phind** | Tidak perlu | 3 | 1 | Model spesialis kode |

### Model Tersedia

| Model | Provider | Tipe | Cocok Untuk |
|-------|----------|------|-------------|
| `deepseek-chat` | DeepSeek/Puter | Reasoning | Tujuan umum, perencanaan |
| `gpt-5-chat` | OpenAI/Puter | Umum | Model OpenAI terbaru |
| `gpt-4o` | OpenAI/Puter | Umum | Penalaran kompleks, kode |
| `gpt-4o-mini` | OpenAI/Puter | Cepat | Tugas cepat |
| `gemini-2.0-flash` | Google/Puter | Cepat | Performa seimbang |
| `claude-opus-4-5-latest` | Anthropic/Puter | Kode/Analisis | Terbaik untuk kode |
| `claude-sonnet-4` | Anthropic/Puter | Seimbang | Kode + analisis |
| `claude-haiku-4-5` | Anthropic/Puter | Cepat | Respons cepat |
| `grok-3` | xAI/Puter | Umum | Model unggulan xAI |
| `mistral-large-2512` | Mistral/Puter | Umum | Model terbaik Mistral |
| `codestral-2508` | Mistral/Puter | Kode | Generasi kode |
| `qwen-2.5-coder-32b-instruct` | Qwen/Puter | Kode | Coding khusus |
| `llama-3.1-70b` | Llama/DDG/Pollinations | Umum | Model open-source |
| `deepseek-r1` | DeepSeek/Pollinations | Reasoning | Penalaran langkah demi langkah |

> **Catatan:** Daftar lengkap model tersedia di `GET /models`. Model diambil otomatis dari provider.

### Konfigurasi

```env
# Autentikasi Puter.js (opsional untuk penggunaan dasar)
PUTER_AUTH_TOKEN=token_anda_di_sini

# Kunci API Provider (opsional)
GROQ_API_KEY=kunci_groq_anda
HUGGINGFACE_API_KEY=kunci_hf_anda
OPENROUTER_API_KEY=kunci_openrouter_anda

# Server
PORT=3333
NODE_ENV=development

# Logging
LOG_LEVEL=info

# Rate Limiting
RATELIMIT_WINDOW_MS=60000
RATELIMIT_MAX_REQUESTS=100

# CORS (kosongkan untuk menonaktifkan)
CORS_ORIGIN=http://localhost:3000

# Autentikasi API Key (kosongkan untuk menonaktifkan)
API_KEY=kunci_rahasia_anda

# Health Check
HEALTH_CHECK_INTERVAL_MS=60000

# Model Sync
MODEL_SYNC_INTERVAL_MS=3600000
```

### Auto-Routing

Router secara otomatis memilih model terbaik berdasarkan konten kueri:

```
BUILDING (kode, implementasi, debug, refaktor, sql...)   →  claude-opus-4-5-latest
PLANNING  (rencana, desain, strategi, arsitektur...)      →  deepseek-chat
REASONING (penyelesaian, penjelasan, kalkulasi, bukti...) →  gpt-4o
FAST      (pertanyaan sederhana, <100 karakter)           →  gpt-4o-mini
DEFAULT                                                   →  deepseek-chat
```

**Contoh:**
```bash
# Kueri kode otomatis dirutekan ke Claude Opus
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Debug aplikasi Flask Python saya"}]}'

# Lihat keputusan routing tanpa eksekusi
curl -X POST http://localhost:3333/route \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Buat REST API dengan Express.js"}]}'
```

### Dashboard PWA

ProxyGateLLM menyertakan dashboard web progresif di `http://localhost:3333/dashboard`:

- **Gambaran Umum**: Provider aktif, model tersedia, uptime, versi
- **Provider**: Status detail, metrik, pemeriksaan kesehatan per provider
- **Model**: Grid model yang dapat dicari dengan badge tipe dan info provider
- **Playground**: Chat playground dengan pemilih model, toggle format, toggle streaming
- **Referensi API**: Dokumentasi endpoint dan contoh kode
- **Responsif mobile**: Sidebar yang dapat diciutkan, grid responsif
- **Tema gelap**: Desain gelap profesional terinspirasi Vercel/Railway

### AI Agent

ProxyGateLLM menyertakan agent AI bawaan yang bisa digunakan dari browser atau Node.js:

```javascript
import { ProxyGateLLMAgent } from './agent/index.js';

const agent = new ProxyGateLLMAgent({
  model: 'auto',
  format: 'openai',
});

// Chat biasa
const response = await agent.chat('Jelaskan quantum computing');

// Penalaran multi-langkah
const result = await agent.reason('Rancang arsitektur microservice', 3);
console.log(result.steps); // Array langkah analisis
console.log(result.answer); // Jawaban akhir

// Generasi kode dengan review
const { code, review } = await agent.generateCode('REST API dengan Express', 'javascript');
```

**Mode CLI:**
```bash
node agent/index.js
# 🤖 ProxyGateLLM Agent (ketik "quit" untuk keluar, "clear" untuk reset, "models" untuk daftar model)
```

### Kontribusi

Kami menyambut kontribusi! Silakan lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk detailnya.

### Disclaimer

> **⚠️ Hanya untuk Tujuan Pendidikan**
>
> Proyek ini disediakan secara ketat untuk tujuan pendidikan dan penelitian. Penulis dan kontributor **tidak bertanggung jawab** atas kerusakan, kerugian, atau risiko yang timbul dari penggunaan perangkat lunak ini. **Kami tidak menanggung tanggung jawab atau risiko** apapun atas penggunaan perangkat lunak ini. Penggunaan untuk tujuan komersial, ilegal, atau tidak etis dilarang keras.

**Kontak:** Mulky Malikul Dhaher | [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)

### Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT — lihat file [LICENSE](LICENSE) untuk detailnya.

---

<div align="center">

## ⭐ Riwayat Bintang

[![Star History Chart](https://api.star-history.com/svg?repos=mulkymalikuldhrs/ProxyGateLLM&type=Date)](https://star-history.com/#mulkymalikuldhrs/ProxyGateLLM&Date)

<br/>

## 🔗 Tautan

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/ProxyGateLLM)
[![Issues](https://img.shields.io/badge/Issues-Lapor-red?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/issues)
[![Discussions](https://img.shields.io/badge/Diskusi-Gabung-blue?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/ProxyGateLLM/discussions)
[![Email](https://img.shields.io/badge/Email-Kontak-EA4335?style=for-the-badge&logo=gmail)](mailto:mulkymalikuldhaher@email.com)

<br/>

### Dibuat dengan ❤️ oleh [Mulky Malikul Dhaher](https://github.com/mulkymalikuldhrs)

**ProxyGateLLM** — Akses AI Gratis untuk Semua 🚀

**Hanya untuk Tujuan Pendidikan — Tidak Ada Tanggung Jawab atau Risiko yang Ditanggung**

</div>
