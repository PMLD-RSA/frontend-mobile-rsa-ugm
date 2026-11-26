import { create } from 'zustand';
import { fetchAuditLogsApi } from '../services/api';
import { AuditLog } from '../types';
import { sortAuditLogs } from '../utils/auditLog';

interface AuditLogState {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;

  fetchLogs: () => Promise<void>;
  clearError: () => void;
}

export const useAuditLogStore = create<AuditLogState>((set) => ({
  logs: [],
  isLoading: false,
  error: null,

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const logs = await fetchAuditLogsApi(20);
      set({ logs: sortAuditLogs(logs).slice(0, 20), isLoading: false, error: null });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Gagal mengambil audit log',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
