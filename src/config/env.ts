/**
 * Konfigurasi Jaringan & Alamat Target Mobile
 * Mengacu pada PRD-Mobile.md Bagian 2
 *
 * Catatan Arsitektur:
 * - BFF_URL: Mengarah ke Next.js Web BFF (Port 3000). Mobile TIDAK menembak langsung Core Backend Fastify.
 * - WS_URL: Mengarah ke WebSocket Core Backend (Port 8000) untuk pembaruan realtime.
 */
export const ENV = {
  // Akses ke Web BFF (Next.js Port 3000)
  BFF_URL: process.env.EXPO_PUBLIC_BFF_URL || 'http://localhost:3000',

  // Akses Realtime WebSocket ke Core Backend (Fastify Port 8000)
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://100.94.192.102:8000/ws',
};
