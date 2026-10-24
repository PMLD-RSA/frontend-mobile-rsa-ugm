import { create } from 'zustand';
import axios from 'axios';
import { User, ApiResponse } from '../types';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://100.94.192.102:8000';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  ensureAuthenticated: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post<ApiResponse<{ token: string; user: User }>>(
        `${API_BASE_URL}/api/auth/login`,
        { username, password },
        { timeout: 5000 }
      );

      const payload = res.data?.data;
      if (res.data?.success && payload?.token) {
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
          error: res.data?.message || 'Login gagal.',
          isLoading: false,
        });
        return false;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal terhubung ke server.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  /**
   * Memastikan aplikasi memiliki token aktif.
   * Jika belum ada token, melakukan auto-login dengan kredensial default admin/admin123
   * agar aplikasi mobile langsung live dan menampilkan data tangki dari VPS.
   */
  ensureAuthenticated: async () => {
    const currentToken = get().token;
    if (currentToken) return currentToken;

    const success = await get().login('admin', 'admin123');
    if (success) {
      return get().token;
    }
    return null;
  },
}));
