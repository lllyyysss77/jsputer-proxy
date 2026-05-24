# 🚀 Server Proxy Puter.js

<div align="center">

**Server proxy AI terpadu yang menyediakan akses gratis ke berbagai penyedia LLM melalui Puter.js SDK**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Puter.js](https://img.shields.io/badge/Puter.js-2.2.5-purple?style=for-the-badge)](https://docs.puter.com/)
[![Lisensi](https://img.shields.io/badge/Lisensi-MIT-yellow?style=for-the-badge)](LICENSE)

[English](README.md) | **Bahasa Indonesia** | [中文](README_zh.md)

---

> 💡 **Ringkasnya**: Proyek ini membuat server proxy lokal yang memberi Anda akses gratis ke model GPT-4o, Claude, DeepSeek, Gemini, Grok, Mistral, dan Qwen melalui Puter.js SDK — tidak perlu kunci API yang mahal!

</div>

---

## ✨ Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 🔓 **Akses Gratis** | Tidak perlu kunci API yang mahal |
| 🌐 **Multi-Provider** | Akses 18+ model LLM dari satu endpoint |
| 🔄 **Auto-Routing** | Pemilihan model cerdas berdasarkan tugas |
| ⚡ **Performa Tinggi** | Latensi rendah, caching teroptimasi |
| 🔒 **Privasi Utama** | Semua request dirutekan melalui proxy lokal |
| 🐳 **Siap Docker** | Deployment mudah dengan container |
| 📡 **API Standar** | Endpoint kompatibel dengan OpenAI dan Anthropic |
| 🔧 **Setup Mudah** | Instalasi dengan satu perintah |

---

## 🎯 Mengapa Puter.js Proxy?

### Masalah 💰

```
Biaya API AI Tradisional:
┌─────────────────┬────────────────────┬────────────────────┐
│ Penyedia        │ GPT-4o             │ Claude 3 Opus      │
├─────────────────┼────────────────────┼────────────────────┤
│ Harga/1M token  │ $30.00             │ $15.00             │
│ Per 1K request  │ ~$0.06             │ ~$0.03             │
│ Bulanan (berat) │ $500+              │ $250+              │
└─────────────────┴────────────────────┴────────────────────┘
```

### Solusi 🚀

```
Puter.js Proxy:
┌─────────────────┬────────────────────┬────────────────────┐
│ Penyedia        │ Puter.js           │ Penghematan        │
├─────────────────┼────────────────────┼────────────────────┤
│ Harga/1M token  │ GRATIS*            │ 100%               │
│ Per 1K request  │ GRATIS*            │ GRATIS             │
│ Bulanan (berat) │ GRATIS*            │ $0                 │
└─────────────────┴────────────────────┴────────────────────┘
* Melalui tier gratis Puter.js
```

---

## 🚀 Mulai Cepat

### Prasyarat

- Node.js 18+ (Node.js 22 direkomendasikan)
- npm atau yarn
- Git

### Setup 5 Menit ⏱️

```bash
# 1. Clone repositori
git clone https://github.com/mulkymalikuldhrs/jsputer-proxy.git
cd jsputer-proxy

# 2. Jalankan script setup
chmod +x setup.sh
./setup.sh

# 3. Mulai server
npm start

# 4. Uji!
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Halo!"}]}'
```

---

## 🤖 Model yang Tersedia

### ✅ Model Berfungsi (18 Total)

| Model | Penyedia | Tipe | Terbaik Untuk |
|-------|----------|------|---------------|
| `deepseek-chat` | DeepSeek | Reasoning | Tujuan umum, perencanaan |
| `gpt-5-chat` | OpenAI | Umum | Model OpenAI terbaru |
| `gpt-4o` | OpenAI | Umum | Reasoning kompleks, kode |
| `gpt-4o-mini` | OpenAI | Cepat | Tugas cepat, query sederhana |
| `gemini-2.0-flash` | Google | Cepat | Performa seimbang |
| `claude-opus-4-5-latest` | Anthropic | Kode/Analisis | Terbaik untuk kode, arsitektur |
| `claude-sonnet-4` | Anthropic | Seimbang | Kode + analisis |
| `grok-3` | xAI | Umum | Model unggulan xAI |
| `mistral-large-2512` | Mistral | Umum | Model terbaik Mistral |
| `qwen-2.5-coder-32b-instruct` | Qwen/Coder | Kode | Coding khusus |

### Logika Auto-Routing

Router secara otomatis memilih model terbaik:

- **BUILDING** (kode, implementasi, debug) → `claude-opus-4-5-latest`
- **PLANNING** (rencana, desain, arsitektur) → `deepseek-chat`
- **REASONING** (penyelesaian, penjelasan, kalkulasi) → `gpt-4o`
- **FAST** (pertanyaan sederhana, <100 karakter) → `gpt-4o-mini`
- **DEFAULT** → `deepseek-chat`

---

## 📡 Endpoint API

### 1. API Kompatibel OpenAI

**Endpoint:** `POST http://localhost:3333/v1/chat/completions`

```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "Anda adalah asisten yang membantu"},
      {"role": "user", "content": "Jelaskan komputasi kuantum"}
    ],
    "temperature": 0.7,
    "max_tokens": 1000,
    "stream": false
  }'
```

### 2. API Kompatibel Anthropic

**Endpoint:** `POST http://localhost:3333/v1/messages`

### 3. API Native Puter (Auto-Routing)

**Endpoint:** `POST http://localhost:3333/chat`

Secara otomatis memilih model terbaik berdasarkan query Anda.

---

## 📊 Performa

| Model | Token Pertama | Respons Penuh | Throughput |
|-------|---------------|---------------|------------|
| gpt-4o | ~500ms | ~1.5s | 45 token/s |
| deepseek-chat | ~800ms | ~1.7s | 35 token/s |
| claude-opus-4 | ~1.2s | ~2.7s | 28 token/s |
| gpt-4o-mini | ~400ms | ~1.0s | 60 token/s |

---

## ⚠️ Disclaimer

> **Penting**: Proyek ini menggunakan Puter.js SDK untuk mengakses model AI. Dengan menggunakan perangkat lunak ini:
>
> 1. Anda menyetujui [Ketentuan Layanan](https://puter.com/terms) dan [Kebijakan Privasi](https://puter.com/privacy) Puter.js
> 2. Perangkat lunak ini disediakan "sebagaimana adanya" tanpa jaminan apa pun
> 3. Penggunaan dapat tunduk pada kebijakan penggunaan wajar Puter.js
> 4. Pengelola tidak bertanggung jawab atas biaya, kerusakan, atau masalah yang timbul dari penggunaan

---

## 📞 Kontak

**Mulky Malikul Dhaher**

- 📧 Email: [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
- 🐙 GitHub: [@mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah MIT License — lihat file [LICENSE](LICENSE) untuk detailnya.

---

<div align="center">

### Dibuat dengan ❤️ oleh [Mulky Malikul Dhaher](https://github.com/mulkymalikuldhrs)

**Puter.js Proxy** - Akses AI Gratis untuk Semua 🚀

</div>
