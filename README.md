# 📱 Mobile App WP-4: Sistem Pemantauan Level Air Berbasis IoT

Selamat datang di repositori Aplikasi Mobile (Android) untuk proyek riset **Sistem Informasi Pemantauan dan Pengendalian Level Air Berbasis IoT di RSA UGM**. Repositori ini didedikasikan sepenuhnya untuk mengembangkan aplikasi *smartphone* reaktif bagi para operator lapangan rumah sakit.

## 🌟 Tentang Proyek
Aplikasi ini dirancang khusus untuk bentuk vertikal pada mobilitas petugas. Aplikasi memberikan pembaruan status level tangki secara *real-time* dengan peringatan dini (*early warning system*) yang terintegrasi secara mulus melalui arsitektur Backend-for-Frontend (BFF).

## ✨ Fitur Utama
- **Pemantauan Real-time**: Menampilkan status level tangki air secara presisi tanpa lag.
- **Background Push Notifications**: Menerima peringatan (WARNING/CRITICAL) secara instan meskipun aplikasi sedang ditutup/tidak aktif.
- **Visualisasi Grafik**: Riwayat penggunaan dan level air selama 24 jam terakhir.
- **Bottom Sheet Control**: Modul pemantauan detail tangki berskala besar yang mengadopsi prinsip *single-lock* UI.

## 🛠️ Tech Stack & Arsitektur (Final)
- **Framework Utama**: **React Native via Expo** (Mempermudah *development loop* dan distribusi APK/AAB).
- **Styling**: Native StyleSheet / NativeWind (Tailwind CSS untuk React Native).
- **State Management**: **Zustand** (Sangat ringan dan sempurna untuk handling *push data* WebSocket).
- **Visualisasi Grafik**: **react-native-chart-kit** (Performa rendering mulus di perangkat *mobile*).
- **Notifikasi**: **Expo Push Notifications / FCM** (Dukungan *background push*).
- **Integrasi API**: Berkomunikasi langsung ke *endpoint* **BFF Next.js** di repositori Web.

## 🔒 Security & AAA (Autentikasi, Autorisasi, Akunting)
- **Authentication**: Kredensial disahkan via BFF, token disandikan ketat ke dalam enkripsi bawaan OS (`SecureStore` / `EncryptedSharedPreferences`). *Dilarang menggunakan AsyncStorage.*
- **Authorization**: Penerapan *Role-Based Access Control* (RBAC) pada elemen antarmuka (misal: menyembunyikan panel pompa bagi *Viewer*).
- **Accounting**: Instruksi aksi kontrol dicatat transparan di *server audit* BFF.

## 🔀 Panduan Kontribusi & Konvensi Git
Untuk menjaga kerapian riwayat repositori, seluruh anggota tim diwajibkan mengikuti alur dan konvensi *commit* berikut:

**Alur Branching:**
1. **Buat Branch Fitur (`feat/...` atau `fix/...`)**: Setiap pengerjaan tugas baru **wajib** dilakukan di *branch* terpisah (misal: `feat/bottom-sheet-ui` atau `fix/push-notification`).
2. **Pull Request ke `dev`**: Setelah fitur selesai, ajukan *Pull Request* (PR) untuk digabungkan (*merge*) ke branch `dev`. Pastikan aplikasi berjalan normal di Expo Go tanpa error.
3. **Rilis ke `main`**: Branch `main` adalah versi produksi (*Release*). Penggabungan ke `main` **hanya** dilakukan dari branch `dev` apabila keseluruhan fitur siap di-*build* menjadi APK/AAB.

**Format Pesan Commit:**
Gunakan format standar *Conventional Commits*:
- `feat: menambahkan setup Expo Push Notifications` (Untuk fitur baru)
- `fix: mengatasi lag pada chart tangki air` (Untuk perbaikan *bug*)
- `docs: memperbarui struktur folder di README` (Untuk perubahan dokumentasi)
- `style: merapikan margin pada komponen bottom sheet` (Untuk perbaikan UI/CSS)

## 🚀 Panduan Instalasi (Getting Started)
1. **Clone Repositori**:
   ```bash
   git clone https://github.com/Avin1731/frontend-mobile-rsa-ugm.git
   ```
2. **Instalasi Dependensi**:
   Gunakan `pnpm` (direkomendasikan) untuk menginstal paket:
   ```bash
   cd frontend-mobile-rsa-ugm
   pnpm install
   ```
3. **Menjalankan Aplikasi (Development)**:
   ```bash
   pnpm start
   ```
   *Gunakan aplikasi Expo Go di smartphone Anda untuk memindai kode QR dan melihat pratinjau antarmuka.*

---
Untuk melihat rincian fungsional dan spesifikasi *Push Notification* aplikasi ini, silakan merujuk pada file **[Kebutuhan Proyek (Requirements)](./requirements.md)** di repositori ini.

