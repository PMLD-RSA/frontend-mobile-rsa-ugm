import { create } from 'zustand';
import axios from 'axios';
import { User, ApiResponse } from '../types';
import { ENV } from '../config/env';
import { saveAuthToken, getAuthToken, removeAuthToken } from '../services/secureStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  /**
   * Inisialisasi status autentikasi saat aplikasi pertama kali dimuat (Splash Screen)
   * Mengembalikan true jika pengguna memiliki token valid, false jika harus login
   */
  initAuth: async () => {
    try {
      const savedToken = await getAuthToken();
      if (!savedToken) {
        set({ user: null, token: null, isAuthenticated: false });
        return false;
      }

      // Verifikasi token ke endpoint Web BFF /api/auth/me
      const res = await axios.get<ApiResponse<User>>(`${ENV.BFF_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
        timeout: 4000,
      });

      if (res.data?.success && res.data.data) {
        set({
          user: res.data.data,
          token: savedToken,
          isAuthenticated: true,
          error: null,
        });
        return true;
      } else {
        await removeAuthToken();
        set({ user: null, token: null, isAuthenticated: false });
        return false;
      }
    } catch {
      // Jika BFF tidak dapat dijangkau namun token tersimpan di SecureStore,
      // kita tetap izinkan sesi lokal aktif dengan profil fallback
      const savedToken = await getAuthToken();
      if (savedToken) {
        set({
          token: savedToken,
          isAuthenticated: true,
          user: get().user || {
            id: 'local-session',
            username: 'admin',
            role: 'admin',
            isActive: true,
          },
        });
        return true;
      }

      set({ user: null, token: null, isAuthenticated: false });
      return false;
    }
  },

  /**
   * Login ke Web BFF (/api/auth/login)
   * Menyimpan token JWT ke Hardware SecureStore
   */
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post<ApiResponse<{ token: string; user: User }>>(
        `${ENV.BFF_URL}/api/auth/login`,
        { username, password },
        { timeout: 8000 }
      );

      const payload = res.data?.data;
      if (res.data?.success && payload?.token) {
        await saveAuthToken(payload.token);
        set({
          user: payload.user,
          token: payload.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          error: res.data?.message || 'Login gagal. Periksa username dan password.',
          isLoading: false,
        });
        return false;
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Gagal terhubung ke Web BFF. Pastikan server aktif.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  /**
   * Logout aman: membersihkan token JWT di SecureStore dan reset state sesi
   */
  logout: async () => {
    try {
      await removeAuthToken();
    } catch (e) {
      console.warn('Gagal menghapus token SecureStore:', e);
    }
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },
}));
