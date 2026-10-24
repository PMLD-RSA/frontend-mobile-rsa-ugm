import axios from 'axios';
import { API_BASE_URL, useAuthStore } from '../stores/authStore';
import { Tank, ApiResponse } from '../types';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Interceptor untuk menyematkan Authorization Bearer Token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchTanksApi(): Promise<Tank[]> {
  // Pastikan token sudah siap
  await useAuthStore.getState().ensureAuthenticated();

  const response = await apiClient.get<ApiResponse<Tank[]>>('/api/tanks');
  if (response.data && response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
}
