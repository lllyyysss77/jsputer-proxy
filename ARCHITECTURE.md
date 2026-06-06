# Arsitektur Puter.js Proxy Server

> Dokumentasi arsitektur sistem untuk jsputer-proxy

---

## Ikhtisar Arsitektur

Puter.js Proxy Server adalah proxy AI terpadu yang berjalan secara lokal, menyediakan akses gratis ke berbagai model LLM melalui Puter.js SDK. Arsitektur dirancang dengan prinsip kesederhanaan, performa, dan kompatibilitas — memungkinkan pengguna untuk mengakses 18+ model AI dari satu endpoint tanpa kunci API yang mahal.

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

## Komponen Utama

### 1. Express Server (`index.js`)

Server utama menggunakan Express 5.x sebagai web framework. Server ini menangani semua permintaan HTTP masuk dan bertanggung jawab untuk:

- Parsing body request dengan batas 10MB untuk payload besar
- Melayani endpoint API kompatibel OpenAI, Anthropic, dan native Puter
- Manajemen CORS untuk akses lintas domain
- Error handling terpusat dengan respons JSON yang konsisten
- Streaming respons untuk pengalaman real-time

Server berjalan pada port 3333 secara default dan dapat dikonfigurasi melalui environment variable `PORT`.

### 2. Router (`router.js`)

Router adalah komponen kecerdasan proxy yang bertanggung jawab untuk pemilihan model otomatis. Logika routing berdasarkan analisis konten pesan pengguna untuk menentukan jenis tugas dan memilih model yang paling sesuai.

Proses routing:
1. **Ekstraksi Konten**: Semua pesan pengguna digabungkan dan dinormalisasi ke huruf kecil
2. **Deteksi Tipe Query**: Konten dianalisis untuk mendeteksi kata kunci yang mengindikasikan tipe tugas
3. **Pemilihan Model**: Berdasarkan tipe tugas, model yang optimal dipilih
4. **Fallback**: Jika tidak ada tipe yang terdeteksi, model default (deepseek-chat) digunakan

### 3. Puter.js Client (`client.js`)

Client Puter.js mengelola komunikasi dengan Puter.js SDK. Komponen ini menangani:

- Inisialisasi dan autentikasi Puter.js SDK
- Konversi format pesan dari standar OpenAI/Anthropic ke format Puter.js
- Pengelolaan opsi seperti model, temperature, max_tokens
- Penanganan respons dan konversi ke format standar
- Error handling dan retry logic

### 4. Globals (`globals.js`)

Modul polyfill yang menyediakan kompatibilitas untuk lingkungan Node.js, memastikan Puter.js SDK yang dirancang untuk browser dapat berjalan di server-side.

---

## Alur Data

### Alur Permintaan Chat

```
Klien → Express Server → Endpoint Handler → Router (pilih model) → Client.js → Puter.js SDK → Puter API → LLM Provider → Respons
```

1. Klien mengirim permintaan HTTP ke salah satu endpoint
2. Express server menerima dan mem-parsing request
3. Endpoint handler mengekstrak parameter (model, messages, options)
4. Jika model tidak ditentukan, router memilih model optimal
5. Client.js mengonversi format dan mengirim ke Puter.js SDK
6. Puter.js SDK berkomunikasi dengan Puter API
7. Puter API merutekan ke provider LLM yang sesuai
8. Respons dikembalikan melalui rantai yang sama, dikonversi ke format standar

### Alur Streaming

Untuk permintaan streaming, data dikirim secara bertahap menggunakan Server-Sent Events (SSE):

1. Klien mengirim permintaan dengan `"stream": true`
2. Server membuka koneksi SSE
3. Setiap chunk respons dari LLM dikirim sebagai event SSE
4. Koneksi ditutup saat respons selesai

---

## Endpoint API

### Kompatibilitas OpenAI

Endpoint `/v1/chat/completions` mengimplementasikan format permintaan dan respons yang kompatibel dengan OpenAI API. Ini memungkinkan penggunaan langsung dengan SDK OpenAI atau klien yang sudah ada tanpa perubahan kode.

Format respons mengikuti struktur standar OpenAI:
- `id`: Identifikasi unik respons
- `object`: Tipe objek ("chat.completion")
- `choices`: Array pilihan respons
- `usage`: Statistik penggunaan token

### Kompatibilitas Anthropic

Endpoint `/v1/messages` mengimplementasikan format yang kompatibel dengan Anthropic Messages API, memungkinkan integrasi dengan klien Claude yang sudah ada.

### Auto-Routing Native

Endpoint `/chat` adalah endpoint khusus yang secara otomatis memilih model terbaik berdasarkan konten pesan. Ini cocok untuk penggunaan sederhana di mana pengguna tidak ingin memilih model secara manual.

---

## Keamanan

### Pertimbangan Keamanan

- **Lokal saja**: Secara default, proxy hanya mendengarkan pada localhost
- **Tidak ada penyimpanan kredensial**: Puter.js SDK menangani autentikasi tanpa menyimpan kredensial secara lokal
- **Rate limiting**: Dapat dikonfigurasi untuk membatasi jumlah permintaan per IP
- **Input validation**: Semua input divalidasi sebelum diproses
- **CORS**: Konfigurasi CORS yang ketat untuk mencegah akses tidak sah

### Rekomendasi Deployment Produksi

- Gunakan HTTPS untuk enkripsi komunikasi
- Terapkan rate limiting yang ketat
- Gunakan API key untuk autentikasi klien
- Deploy di belakang reverse proxy (nginx) dengan SSL
- Monitor penggunaan untuk mendeteksi abuse

---

## Konfigurasi

### Environment Variables

| Variable | Default | Deskripsi |
|:---------|:--------|:----------|
| `PUTER_AUTH_TOKEN` | — | Token autentikasi Puter.js (opsional) |
| `PORT` | 3333 | Port server |
| `NODE_ENV` | development | Environment mode |
| `LOG_LEVEL` | info | Level logging |

### Opsi Server

Server mendukung konfigurasi melalui kode untuk penyesuaian yang lebih lanjut:

- Body parser limit (default: 10MB)
- CORS origins
- Rate limiting rules
- Logging configuration

---

## Deployment

### Docker

```bash
docker build -t jsputer-proxy .
docker run -p 3333:3333 jsputer-proxy
```

### Systemd (Linux)

```bash
sudo cp puter-proxy.service /etc/systemd/system/
sudo systemctl enable puter-proxy
sudo systemctl start puter-proxy
```

### Manual

```bash
npm install
npm start
```

---

## Struktur Proyek

```
puter-proxy/
├── src/                  # File sumber
│   ├── index.js          # Server utama
│   ├── index-https.js    # Server HTTPS
│   ├── index-debug.js    # Server debug dengan logging
│   ├── client.js         # Klien Puter.js
│   ├── router.js         # Logika auto-routing
│   └── globals.js        # Polyfill
├── docs/                 # Dokumentasi
│   ├── images/           # Gambar dan diagram
│   ├── MODELS.md         # Panduan model
│   └── API.md            # Dokumentasi API
├── scripts/              # Script utilitas
├── package.json          # Dependensi
├── setup.sh              # Script instalasi
└── puter-proxy.service   # Layanan systemd
```

---

## Kontak

Untuk pertanyaan arsitektur atau kontribusi teknis, hubungi:

**Mulky Malikul Dhaher** — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
