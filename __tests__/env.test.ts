import { ENV } from '../src/config/env';

describe('Environment Configuration Tests', () => {
  it('memastikan ENV.BFF_URL terdefinisi dan menggunakan protokol HTTP/HTTPS', () => {
    expect(ENV.BFF_URL).toBeDefined();
    expect(typeof ENV.BFF_URL).toBe('string');
    expect(ENV.BFF_URL).toMatch(/^https?:\/\//);
  });

  it('memastikan ENV.WS_URL terdefinisi dan menggunakan protokol WebSocket (ws/wss)', () => {
    expect(ENV.WS_URL).toBeDefined();
    expect(typeof ENV.WS_URL).toBe('string');
    expect(ENV.WS_URL).toMatch(/^wss?:\/\//);
  });

  it('memastikan fallback default mengarah ke localhost jika env kosong', () => {
    // Karena jest berjalan di environment tanpa EXPO_PUBLIC_*, default fallback teruji
    if (!process.env.EXPO_PUBLIC_BFF_URL) {
      expect(ENV.BFF_URL).toBe('http://localhost:3000');
    }
    if (!process.env.EXPO_PUBLIC_WS_URL) {
      expect(ENV.WS_URL).toBe('ws://localhost:8000/ws');
    }
  });
});
