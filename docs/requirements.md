# Kebutuhan Proyek (Requirements) - Mobile App (Android)

Dokumen ini merupakan penjabaran kebutuhan final untuk sub-tim Mobile (WP-4).

## 1. Lingkup Proyek (Project Scope)
Membangun aplikasi ponsel pintar (Android) khusus untuk operator lapangan rumah sakit. Aplikasi ini digunakan untuk memonitor level tangki air secara dinamis dan mendapatkan peringatan instan (*alerts*) kemanapun petugas bergerak.

## 2. Kebutuhan Fungsional (Functional Requirements)
- **Monitoring Portabel**: Menampilkan *list/grid* tangki air beserta persentase levelnya.
- **Konsumsi BFF**: Mengambil format JSON bersih dari Next.js BFF (bukan langsung dari WP-3) agar data jauh lebih ringan untuk memori ponsel.
- **Prioritas Tampilan Tangki**: Sistem *sorting* otomatis meletakkan tangki berstatus CRITICAL (<30%) dan WARNING (30-60%) di daftar paling atas.
- **Background Push Notifications**: Menerima *Push Notification* (via Expo Push / FCM) secara *background*. Notifikasi peringatan (WARNING/CRITICAL) harus tetap berbunyi dan masuk ke HP operator meskipun aplikasi sedang ditutup/tidak aktif. BFF Web akan membantu *forwarding* trigger notifikasi dari WP-3 ke layanan Push Mobile.
- **Autentikasi (AAA)**: Memiliki halaman login dan membatasi akses tampilan berdasar peran (RBAC).

## 3. Keputusan Teknologi Khusus (Tech Stack Final)
- **Framework Mobile**: **React Native dengan Expo** (Dipilih karena jauh lebih mudah/cepat untuk *development* dan build APK/AAB via EAS, serta mempermudah integrasi Push Notifications).
- **State Management**: **Zustand** (Sangat ringan dan sempurna untuk handling *push data* WebSocket/Realtime UI tanpa *boilerplate* rumit).
- **Library Grafik**: **react-native-chart-kit** (Untuk performa grafik histori 24 jam yang cepat di layar sentuh).

## 4. Kebutuhan Non-Fungsional
- **Keamanan Token**: Menyimpan token keamanan dari BFF ke dalam *SecureStore* Expo (dilarang menggunakan *AsyncStorage* biasa).
- **Performa Memori**: Mencegah *memory leak* dari animasi menumpuk (menerapkan metode *Single-Lock* saat membuka detail tangki bawah).
- **Resolusi**: Dioptimalkan mutlak untuk orientasi *vertikal (portrait)* dengan antarmuka yang sangat *finger-friendly* (kartu dan ikon besar).

## 5. Rencana Opsional (Opsional/TBD)
*Status kontrol otomatis/manual pompa belum pasti. Jika kedepannya WP-3 memberi lampu hijau, fitur berikut akan dikerjakan:*
- Kontrol aktuator pompa manual (*Toggle switch* besar).
- Tombol Merah *Emergency Stop* besar di setiap menu tangki.
