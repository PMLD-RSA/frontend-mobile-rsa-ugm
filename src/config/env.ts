// ==============================================================================
// Konfigurasi Target Alamat Mobile (Membaca file .env dengan fallback localhost)
// ==============================================================================
export const ENV = {
  BFF_URL: process.env.EXPO_PUBLIC_BFF_URL || 'http://localhost:3000',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
};
