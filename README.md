# Discord Name Panel Bot

Bot Discord untuk ganti nickname dengan panel interaktif dan tombol.

## Fitur

- `!changename` — Hanya owner yang bisa kirim panel ke channel
- Tombol **✏️ Ganti Nama Saya** — Semua user bisa ganti nickname sendiri
- Tombol **🔄 Reset ke Default** — Semua user bisa reset nickname ke username asli

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/Derrr-dev/discord-name-panel-bot.git
cd discord-name-panel-bot
npm install
```

### 2. Konfigurasi Environment
```bash
cp .env.example .env
```
Isi `.env` dengan:
- `DISCORD_BOT_TOKEN` — Token bot dari Discord Developer Portal
- `DISCORD_OWNER_ID` — ID Discord kamu (klik kanan nama kamu → Copy User ID)

### 3. Jalankan
```bash
npm run build && npm start
```

## Deploy ke Railway (Gratis, 24/7)

1. Buka [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Pilih repo ini
3. Tambahkan env vars: `DISCORD_BOT_TOKEN` dan `DISCORD_OWNER_ID`
4. Railway otomatis build dan jalankan bot 24/7

## Izin Bot yang Dibutuhkan

- `Manage Nicknames`
- `Read Messages / View Channels`
- `Send Messages`

> Role bot harus **di atas** role member lain agar bisa mengubah nickname mereka.
