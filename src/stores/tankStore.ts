import { create } from 'zustand';
import { Tank } from '../types';
import { fetchTanksApi } from '../services/api';
import { useAuthStore } from './authStore';

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
      await useAuthStore.getState().ensureAuthenticated();
      const data = await fetchTanksApi();

      // Sesuai PRD F-01: Auto-sort by severity
      // Urutan: CRITICAL (< minThreshold) -> WARNING (30%-60%) -> NORMAL (> 60%)
      const sorted = [...data].sort((a, b) => {
        const getScore = (t: Tank) => {
          const lvl = Number(t.latestReading?.levelPercent || 0);
          const min = Number(t.minThresholdPercent || 30);
          if (lvl < min) return 0; // CRITICAL
          if (lvl <= 60) return 1; // WARNING
          return 2; // NORMAL
        };
        return getScore(a) - getScore(b);
      });

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
