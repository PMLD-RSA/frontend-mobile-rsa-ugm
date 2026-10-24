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
  initAuth: () => Promise<void>;
  ensureAuthenticated: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initAuth: async () => {
    const savedToken = await getAuthToken();
    if (savedToken) {
      set({ token: savedToken, isAuthenticated: true });
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
          error: res.data?.message || 'Login gagal via Web BFF.',
          isLoading: false,
        });
        return false;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal terhubung ke Web BFF.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await removeAuthToken();
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  /**
   * Memastikan aplikasi mobile memiliki token valid sebelum melakukan request ke Web BFF.
   * Melakukan auto-login jika belum ada token aktif.
   */
  ensureAuthenticated: async () => {
    const currentToken = get().token || (await getAuthToken());
    if (currentToken) {
      if (!get().token) set({ token: currentToken, isAuthenticated: true });
      return currentToken;
    }

    const success = await get().login('admin', 'admin123');
    if (success) {
      return get().token;
    }
    return null;
  },
}));
