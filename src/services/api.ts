import axios from 'axios';
import { getAuthToken } from './secureStore';
import { ENV } from '../config/env';
import { Alert, Tank, ApiResponse } from '../types';

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

export interface UpdateTankThresholdPayload {
  minThresholdPercent: number;
  maxThresholdPercent: number;
}

/**
 * Memperbarui ambang batas tangki melalui Web BFF.
 */
export async function updateTankThresholdApi(
  tankId: string,
  payload: UpdateTankThresholdPayload
): Promise<Tank> {
  const response = await api.put<ApiResponse<Tank>>(`/api/tanks/${encodeURIComponent(tankId)}`, payload);
  if (response.data?.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data?.message || response.data?.error || 'Gagal memperbarui ambang batas tangki');
}

/**
 * Mengambil daftar alert dari Next.js Web BFF (/api/alerts).
 */
export async function fetchAlertsApi(): Promise<Alert[]> {
  const response = await api.get<ApiResponse<Alert[]>>('/api/alerts');
  if (response.data?.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  throw new Error(response.data?.message || response.data?.error || 'Gagal mengambil daftar peringatan');
}

/**
 * Menyelesaikan alert setelah petugas mengonfirmasi pemeriksaan fisik.
 */
export async function resolveAlertApi(alertId: number): Promise<Alert> {
  const response = await api.patch<ApiResponse<Alert>>(
    `/api/alerts/${encodeURIComponent(String(alertId))}/resolve`
  );
  if (response.data?.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data?.message || response.data?.error || 'Gagal menyelesaikan peringatan');
}
