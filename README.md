# ProxyGateLLM v5.0.0

<p align="center">
  <strong>Puter.js untuk LLM — Gratis, Tanpa Backend, Frontend Only</strong><br>
  AI brain untuk semua project kamu. Connect repo → langsung coding.
</p>

---

## Apa itu ProxyGateLLM?

ProxyGateLLM adalah **middleware LLM gratis yang di-host sendiri** — seperti Puter.js tapi untuk AI, bukan file hosting.

| Puter.js | ProxyGateLLM |
|----------|--------------|
| File hosting gratis | LLM routing gratis |
| No backend | No backend |
| Frontend only | Frontend only |
| Connect repo → edit files | Connect repo → code with AI |

**Intinya:** ProxyGateLLM gabungin semua free LLM providers (Puter.js, Groq, Pollinations, OpenRouter, dll) jadi satu API. User tinggal pakai — tanpa daftar, tanpa API key, tanpa bayar.

---

## Cara Kerja

```
User/Client → ProxyGateLLM → Provider A, B, C, D...
         (localhost:3333)     (Puter.js, Groq, Pollinations, dll)
```

1. User kirim request ke `localhost:3333/v1`
2. ProxyGateLLM resolve model → tentuin provider mana yang healthy
3. Kalau provider down → auto-switch ke backup
4. Response dikirim balik → user ga tau provider mana yang dipake

---

## Fitur

### Core
- **378+ Model** — GPT-4o, Claude, Gemini, Llama, Mistral, dll
- **13 Provider** — Puter.js, Groq, Pollinations, OpenRouter, dll
- **Auto-routing** — tugas code → Claude, planning → DeepSeek, fast → gpt-4o-mini
- **Failover** — kalau provider down, auto-pindah ke backup
- **Streaming** — support SSE real-time

### Agentic (Tanpa Backend)
- **File Operations** — read, write, edit files
- **Terminal Commands** — run commands, git operations
- **Code Generation** — generate + review + refactor
- **Debug** — find and fix bugs
- **Multi-step Reasoning** — break down complex tasks
- **Project Builder** — create full projects

### Dashboard
- **Overview** — monitoring provider real-time
- **Providers** — status semua provider
- **Models** — katalog 378 model
- **Playground** — chat interaktif
- **Model Comparison** — bandingkan response dari 3 model
- **Usage Analytics** — chart request, latency
- **Custom Domain Setup** — wizard setup domain

---

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/mulkymalikuldhrs/ProxyGateLLM.git
cd ProxyGateLLM
npm install
```

### 2. Jalankan
```bash
npm start
```

### 3. Pakai

#### As SDK
```javascript
import ProxyGateLLM from 'proxygatelym';

const ai = new ProxyGateLLM();
const response = await ai.ask('Hello!');
const code = await ai.code('simple REST API');
```

#### As Agent
```javascript
import { ProxyGateLLMAgent } from 'proxygatelym/agent';

const agent = new ProxyGateLLMAgent();
await agent.chat('Buatkan API sederhana');
await agent.writeFile('index.js', code);
await agent.runCommand('npm start');
```

#### As API
```bash
curl http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello!"}]}'
```

---

## Custom Domain

1. Deploy ProxyGateLLM ke server kamu
2. Arahkan domain ke server (DNS A record)
3. Set `CORS_ORIGIN=https://domainmu.com` di `.env`
4. Gunakan `https://domainmu.com/v1` sebagai base URL

---

## Provider Status

| Provider | Status | Models |
|----------|--------|--------|
| Puter.js SDK | ⚠️ Rate limited | 14 |
| Pollinations AI | ✅ Healthy | 6 |
| OpenRouter Free | ✅ Healthy | 337 |
| Groq | ✅ Healthy | 16 |
| Google AI Studio | ✅ Healthy | 4 |
| G4F/FreeGPT | ✅ Healthy | 3 |
| Blackbox AI | ✅ Healthy | 2 |
| Phind | ✅ Healthy | 1 |

---

## Lisensi

MIT License

---

<p align="center">
  Dibuat dengan ❤️ oleh <a href="https://github.com/mulkymalikuldhrs">Mulky Malikul Dhaher</a>
</p>
