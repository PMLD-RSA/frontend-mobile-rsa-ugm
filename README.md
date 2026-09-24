# 📱 Sistem Informasi Pemantauan Level Air - Aplikasi Seluler (RSA UGM)

Selamat datang di repositori resmi **Aplikasi Seluler (Mobile App)** untuk proyek Work Package 4 (WP-4): Sistem Informasi Pemantauan dan Pengendalian Level Air Berbasis IoT di Rumah Sakit Akademik (RSA) UGM.

Repositori ini memuat kode sumber untuk aplikasi berbasis Android/iOS yang digenggam oleh para staf lapangan dan pengelola rumah sakit.

---

## 📖 Gambaran Umum (Overview)

Aplikasi ini adalah pendamping berjalan (mobile) dari sistem pemantauan level air. Dirancang dengan antarmuka (UI) gelap (*dark mode/blue-teal*) yang elegan dari Figma, aplikasi ini memastikan para pengelola RSA UGM dapat melihat kondisi tangki, suhu, indikator kritis, serta menerima peringatan dini (alarm) secara langsung dari genggaman *smartphone* mereka, di manapun mereka berada.

Alih-alih mengambil data secara langsung dan membabi-buta dari perangkat IoT, aplikasi ini bekerja cerdas dengan cara mengandalkan sistem **BFF (Backend-for-Frontend)** yang bersemayam di aplikasi Web utama. Hal ini membuat aplikasi berjalan sangat mulus, ringan, dan ramah kuota.

### ✨ Fitur Utama
1. **📊 Layar Dashboard Ringkas:** Ringkasan kondisi tangki rumah sakit secara langsung.
2. **🚨 Notifikasi & Alarm:** Alert bahaya jika level tangki mendekati batas tumpah atau batas habis.
3. **🧭 Navigasi Geser (Sliding Drawer):** Menu samping bergaya modern yang bisa ditarik tutup dengan sangat mulus (native Modal) untuk perpindahan fitur.
4. **📶 Sinkronisasi Cepat:** Selalu *up-to-date* dengan keadaan sesungguhnya berkat integrasi API BFF yang optimal.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

Aplikasi ini menggunakan perpaduan teknologi pembuat aplikasi HP terbaik saat ini:
- **[React Native](https://reactnative.dev/):** Bahasa utama yang memungkinkan satu kode aplikasi berjalan sempurna di HP Android maupun iPhone (iOS) secara bersamaan.
- **[Expo](https://expo.dev/):** Mesin peluncur aplikasi yang sangat memudahkan proses pembuatan, pengujian (lewat aplikasi Expo Go), hingga ke tahap perilisan (Play Store / App Store).
- **[Zustand](https://github.com/pmndrs/zustand):** Pengelola ingatan aplikasi (State Management) yang ringan.
- **Axios:** Kurir pengantar pesan yang handal untuk menjemput data dari server BFF.

---

## ⚙️ Cara Kerja dan Integrasi BFF (Backend-for-Frontend)

Aplikasi ini dirancang khusus untuk menjadi **pengonsumsi data**. Ia tidak memiliki pusingnya memproses kerumitan database.

**Lalu dari mana datanya?**
Data didapatkan lewat integrasi **BFF**. 
BFF adalah "pelayan" yang berada di aplikasi Web (`frontend-web-rsa-ugm`). Aplikasi seluler ini hanya perlu meminta data kepada pelayan tersebut.
- Aplikasi Mobile memanggil tautan API (Contoh: `http://[ALAMAT-IP-WEB]:3000/api/tanks`).
- BFF di sisi web akan meramu semua data mentah, merangkumnya, lalu mengirimkan "paket matang" ke aplikasi ini.
- Aplikasi Mobile tinggal memoles "paket matang" tersebut ke dalam tampilan layar (*Render*).

---

## 🚀 Panduan Instalasi (Untuk Developer)

Ingin ikut serta mengembangkan aplikasi ini? Ikuti langkah-langkah mudah berikut:

### Syarat Wajib (Prerequisites)
Pastikan komputer & HP Anda siap:
1. **Node.js** terinstal di laptop Anda.
2. Unduh aplikasi **Expo Go** di HP Anda (Tersedia gratis di Play Store / App Store).

### Langkah Instalasi
1. **Clone Repositori:**
   Buka terminal di laptop dan unduh kodenya.
   ```bash
   git clone https://github.com/PMLD-RSA/frontend-mobile-rsa-ugm.git
   cd frontend-mobile-rsa-ugm
   ```

2. **Install Dependensi:**
   Unduh semua bahan baku aplikasi.
   ```bash
   npm install
   ```
   *(Atau gunakan `yarn install`)*

3. **Atur Koneksi BFF (Jaringan Lokal):**
   - Pastikan laptop dan HP Anda terkoneksi ke **WiFi yang sama**.
   - Buka `App.tsx` atau file `.env` (jika ada).
   - Cari baris `BFF_URL` dan ganti alamat `localhost` menjadi **IP lokal laptop Anda** (Contoh: `192.168.x.x`). Jangan gunakan `localhost` karena HP tidak akan bisa mendeteksi *localhost* laptop.

4. **Jalankan Mesin Expo:**
   ```bash
   npx expo start
   ```

5. **Uji Coba di HP Anda:**
   - Akan muncul **Barcode / QR Code** besar di terminal atau di browser laptop Anda.
   - Buka aplikasi **Expo Go** di HP Anda, pilih menu **Scan QR Code**, dan arahkan kamera HP ke barcode tersebut.
   - Voila! Aplikasi sedang memuat dan akan langsung muncul di HP Anda.

---
*Dikelola oleh Tim Pengembang WP-4 RSA UGM* 🏥
