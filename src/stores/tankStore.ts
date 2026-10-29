import { create } from 'zustand';
import { Tank } from '../types';
import { fetchTanksApi } from '../services/api';
import { updateTankThresholdApi } from '../services/api';
import { useAuthStore } from './authStore';
import { sortTanksBySeverity } from '../utils/tankMetrics';

interface TankState {
  tanks: Tank[];
  isLoading: boolean;
  error: string | null;

  fetchTanks: () => Promise<void>;
  updateLevel: (tankId: string, levelPercent: number | string, volumeLiters: number | string) => void;
  updateThreshold: (
    tankId: string,
    minThresholdPercent: number,
    maxThresholdPercent: number
  ) => Promise<boolean>;
}

export const useTankStore = create<TankState>((set) => ({
  tanks: [],
  isLoading: false,
  error: null,

  fetchTanks: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchTanksApi();
      const sorted = sortTanksBySeverity(data);
      set({ tanks: sorted, isLoading: false, error: null });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Gagal mengambil data dari Web BFF',
        isLoading: false,
      });
    }
  },

  updateLevel: (tankId, levelPercent, volumeLiters) => {
    set((state) => ({
      tanks: state.tanks.map((tank) => {
        if (tank.id !== tankId) return tank;
        return {
          ...tank,
          latestReading: tank.latestReading
            ? { ...tank.latestReading, levelPercent, volumeLiters }
            : {
                id: Date.now(),
                tankId,
                levelPercent,
                volumeLiters,
                recordedAt: new Date().toISOString(),
              },
        };
      }),
    }));
  },

  updateThreshold: async (tankId, minThresholdPercent, maxThresholdPercent) => {
    if (useAuthStore.getState().user?.role !== 'admin') {
      set({ error: 'Hanya Admin yang dapat mengubah ambang batas tangki' });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const updatedTank = await updateTankThresholdApi(tankId, {
        minThresholdPercent,
        maxThresholdPercent,
      });
      set((state) => ({
        tanks: sortTanksBySeverity(
          state.tanks.map((tank) => (tank.id === tankId ? { ...tank, ...updatedTank } : tank))
        ),
        isLoading: false,
        error: null,
      }));
      return true;
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response !== null &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'message' in err.response.data &&
        typeof err.response.data.message === 'string'
          ? err.response.data.message
          : err instanceof Error
            ? err.message
            : 'Gagal memperbarui ambang batas tangki';
      set({ isLoading: false, error: message });
      return false;
    }
  },
}));
