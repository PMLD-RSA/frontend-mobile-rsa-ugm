import { create } from 'zustand';
import { Tank } from '../types';
import { fetchTanksApi } from '../services/api';
import { sortTanksBySeverity } from '../utils/tankMetrics';

interface TankState {
  tanks: Tank[];
  isLoading: boolean;
  error: string | null;

  fetchTanks: () => Promise<void>;
  updateLevel: (tankId: string, levelPercent: number | string, volumeLiters: number | string) => void;
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
}));
