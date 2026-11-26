import { create } from 'zustand';
import { fetchTankReadingsApi } from '../services/api';
import { ReadingRange, WaterLevelReading } from '../types';

interface ReportState {
  selectedTankId: string | null;
  range: ReadingRange;
  readings: WaterLevelReading[];
  isLoading: boolean;
  error: string | null;

  selectTank: (tankId: string) => void;
  setRange: (range: ReadingRange) => void;
  fetchReadings: () => Promise<void>;
  clearError: () => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  selectedTankId: null,
  range: '24h',
  readings: [],
  isLoading: false,
  error: null,

  selectTank: (tankId) => set({ selectedTankId: tankId, readings: [], error: null }),
  setRange: (range) => set({ range, readings: [], error: null }),

  fetchReadings: async () => {
    const { selectedTankId, range } = get();
    if (!selectedTankId) {
      set({ readings: [], error: 'Pilih tangki terlebih dahulu.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const readings = await fetchTankReadingsApi(selectedTankId, range);
      set({ readings, isLoading: false, error: null });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Gagal mengambil riwayat pembacaan tangki',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
