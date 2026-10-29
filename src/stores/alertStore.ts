import { create } from 'zustand';
import { Alert } from '../types';
import { fetchAlertsApi, resolveAlertApi } from '../services/api';

interface AlertState {
  alerts: Alert[];
  isLoading: boolean;
  resolvingAlertId: number | null;
  error: string | null;

  fetchAlerts: () => Promise<void>;
  addAlert: (alert: Alert) => void;
  markAlertResolved: (alertId: number) => void;
  resolveAlert: (alertId: number) => Promise<boolean>;
  clearError: () => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  return fallback;
}

function sortAlerts(alerts: Alert[]): Alert[] {
  return [...alerts].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  isLoading: false,
  resolvingAlertId: null,
  error: null,

  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await fetchAlertsApi();
      set({ alerts: sortAlerts(alerts), isLoading: false, error: null });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Gagal mengambil daftar peringatan'),
      });
    }
  },

  addAlert: (alert) => {
    set((state) => {
      const existingIndex = state.alerts.findIndex((item) => item.id === alert.id);
      if (existingIndex === -1) {
        return { alerts: sortAlerts([alert, ...state.alerts]) };
      }

      const alerts = [...state.alerts];
      alerts[existingIndex] = { ...alerts[existingIndex], ...alert };
      return { alerts: sortAlerts(alerts) };
    });
  },

  markAlertResolved: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, status: 'resolved', resolvedAt: new Date().toISOString() }
          : alert
      ),
    }));
  },

  resolveAlert: async (alertId) => {
    set({ resolvingAlertId: alertId, error: null });
    try {
      const resolvedAlert = await resolveAlertApi(alertId);
      set((state) => ({
        alerts: state.alerts.map((alert) =>
          alert.id === alertId ? { ...alert, ...resolvedAlert, status: 'resolved' } : alert
        ),
        resolvingAlertId: null,
        error: null,
      }));
      return true;
    } catch (error: unknown) {
      set({
        resolvingAlertId: null,
        error: getErrorMessage(error, 'Gagal menyelesaikan peringatan'),
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
