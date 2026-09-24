# 🤖 Panduan Memulai Development (Developer & AI Instructions)

Selamat datang di repositori Frontend (Staging). Saat ini, repositori ini **masih kosong** dan hanya berisi 4 dokumen fundamental. Tugas Anda (sebagai Developer manusia maupun AI) adalah **membangun aplikasi dari nol** dengan meramu "bahan-bahan" dokumen yang telah disediakan di sini.

## 🛠️ Langkah-Langkah Eksekusi (Roadmap)

**Langkah 1: Pahami Kebutuhan (The Ingredients)**
- **Wajib baca `requirements.md` dan `README.md`**. File tersebut adalah *Source of Truth* mengenai halaman dan fitur apa saja yang harus Anda buat (seperti UI Login, Dashboard, Tabel Histori, dll).

**Langkah 2: Pahami Koneksi Backend (The API)**
- **Wajib baca `api-contract.md`**. File ini memuat 18 REST Endpoints dan 5 Event WebSocket resmi dari tim Backend.
- **Dilarang keras mengarang *endpoint***. Gunakan *path*, *body request*, dan format *response* persis seperti yang tertulis di dokumen tersebut untuk membangun *service / fetcher* Anda.

**Langkah 3: Inisiasi Proyek (Scaffolding)**
- Mulailah membangun kerangka aplikasi sesuai *tech stack* (misal: Next.js untuk Web, atau React Native untuk Mobile).
- Setiap melakukan *commit*, wajib gunakan format *Conventional Commits* (contoh: `feat: setup project`, `chore: install dependencies`).

## 🛑 Batasan & Aturan Mutlak (Rules)
Saat mulai merancang UI dan fungsionalitas, patuhi aturan berikut:
1. **DILARANG Membuat Kontrol Otomasi:** Sistem ini 100% murni untuk **Monitoring & Alerting 1 Arah**. Dilarang keras membuat komponen UI *Toggle Switch*, *Emergency Stop*, atau memanggil API untuk mengontrol pompa.
2. **Keamanan MFA:** Skema autentikasi Login wajib menyediakan *layer* untuk *Multi-Factor Authentication* (MFA).
4. **Testing Lokal (Mobile):** Saat menjalankan aplikasi di HP fisik satu jaringan (WiFi/Hotspot), pastikan IP BFF yang dipanggil mengarah ke IPv4 laptop Anda (misal `10.x.x.x`), bukan `localhost`. Disarankan memindahkannya ke `.env` (sebagai `EXPO_PUBLIC_API_URL`).

Jika Anda sudah membaca dan memahami instruksi ini, silakan mulai mengoding!
