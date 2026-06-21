# Discord Name Panel Bot

Bot Discord untuk ganti nickname dengan panel interaktif dan tombol.

## Fitur

- `!changename` — Hanya owner yang bisa kirim panel ke channel
- Tombol **✏️ Ganti Nama Saya** — Semua user bisa ganti nickname sendiri
- Tombol **🔄 Reset ke Default** — Semua user bisa reset nickname ke username asli
- Balasan hanya terlihat user yang klik (ephemeral)

## Deploy ke Pella (Gratis, 24/7)

1. Buka [pella.app](https://www.pella.app) dan buat akun
2. Buat **New Server** → pilih tipe **Node.js**
3. Hubungkan repo GitHub ini
4. Tambahkan **Environment Variables:**
   - `DISCORD_BOT_TOKEN` = token bot dari Discord Developer Portal
   - `DISCORD_OWNER_ID` = ID Discord kamu
5. Start Command: `node index.js`
6. Klik **Deploy** — bot langsung online!

## Izin Bot yang Dibutuhkan

- `Manage Nicknames`
- `Read Messages / View Channels`
- `Send Messages`

> **Penting:** Role bot harus **di atas** role member lain agar bisa mengubah nickname mereka.
