import axios from 'axios';
import { getAuthToken, removeAuthToken } from './secureStore';
import { ENV } from '../config/env';
import {
  Alert,
  ApiResponse,
  AuditLog,
  Gateway,
  SensorNode,
  ReadingRange,
  Tank,
  User,
  WaterLevelReading,
} from '../types';

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

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      console.warn('[Auth] Sesi berakhir atau token tidak valid di Web BFF');
      await removeAuthToken();
      unauthorizedHandler?.();
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

export function readingRangeToHours(range: ReadingRange): number {
  return range === '7d' ? 168 : 24;
}

/**
 * Mengambil riwayat pembacaan level air dari Web BFF.
 * Selaras kontrak Core BE & Web BFF: ?hours=24|168&limit=500
 */
export async function fetchTankReadingsApi(
  tankId: string,
  range: ReadingRange,
  limit: number = 500
): Promise<WaterLevelReading[]> {
  const hours = readingRangeToHours(range);
  const response = await api.get<ApiResponse<WaterLevelReading[]>>(
    `/api/tanks/${encodeURIComponent(tankId)}/readings`,
    { params: { hours, limit } }
  );
  if (response.data?.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  throw new Error(response.data?.message || response.data?.error || 'Gagal mengambil riwayat pembacaan tangki');
}

/**
 * Mengambil 20 aktivitas operasional terbaru dari Web BFF.
 */
export async function fetchAuditLogsApi(limit: number = 20): Promise<AuditLog[]> {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 20);
  const response = await api.get<ApiResponse<AuditLog[]>>('/api/audit-logs', {
    params: { limit: safeLimit },
  });
  if (response.data?.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  throw new Error(response.data?.message || response.data?.error || 'Gagal mengambil audit log');
}


/**
 * Mengambil daftar Raspberry Pi Gateway Hub dari Web BFF (/api/gateways).
 */
export async function fetchGatewaysApi(): Promise<Gateway[]> {
  const response = await api.get<ApiResponse<Gateway[]>>('/api/gateways');
  if (response.data?.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  throw new Error(response.data?.message || response.data?.error || 'Gagal mengambil data gateway');
}

/**
 * Mengambil daftar sensor node LoRa STM32 dari Web BFF (/api/nodes).
 */
export async function fetchNodesApi(): Promise<SensorNode[]> {
  const response = await api.get<ApiResponse<SensorNode[]>>('/api/nodes');
  if (response.data?.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  throw new Error(response.data?.message || response.data?.error || 'Gagal mengambil data sensor node');
}


/**
 * Mengambil daftar pengguna/operator dari Web BFF (/api/users).
 */
export async function fetchUsersApi(): Promise<User[]> {
  const response = await api.get<ApiResponse<User[]>>('/api/users');
  if (response.data?.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  throw new Error(response.data?.message || response.data?.error || 'Gagal mengambil daftar pengguna');
}

/**
 * Memperbarui status aktif/nonaktif akun pengguna via Web BFF.
 */
export async function updateUserStatusApi(userId: string, isActive: boolean): Promise<User> {
  const response = await api.patch<ApiResponse<User>>(`/api/users/${encodeURIComponent(userId)}`, {
    isActive,
  });
  if (response.data?.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data?.message || response.data?.error || 'Gagal memperbarui status pengguna');
}

/**
 * Melakukan reset kata sandi darurat pengguna di lapangan via Web BFF.
 */
export async function resetUserPasswordApi(userId: string, newPassword: string): Promise<User> {
  const response = await api.patch<ApiResponse<User>>(`/api/users/${encodeURIComponent(userId)}`, {
    password: newPassword,
  });
  if (response.data?.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data?.message || response.data?.error || 'Gagal mereset kata sandi pengguna');
}
