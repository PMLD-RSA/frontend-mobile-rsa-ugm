import axios from 'axios';
import { getAuthToken } from './secureStore';
import { ENV } from '../config/env';
import { Tank, ApiResponse } from '../types';

/**
 * Axios client terpusat dengan interceptor token ke Next.js Web BFF
 * Mengacu pada PRD-Mobile.md Bagian 6.2
 */
export const api = axios.create({
  baseURL: ENV.BFF_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn('[Auth] Sesi berakhir atau token tidak valid di Web BFF');
    }
    return Promise.reject(err);
  }
);

/**
 * Mengambil daftar tangki dari Next.js Web BFF (/api/tanks)
 */
export async function fetchTanksApi(): Promise<Tank[]> {
  const response = await api.get<ApiResponse<Tank[]>>('/api/tanks');
  if (response.data && response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
}
