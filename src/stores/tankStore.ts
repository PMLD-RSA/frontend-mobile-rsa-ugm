import { create } from 'zustand';
import { NodeStatus, Tank } from '../types';
import { fetchTanksApi } from '../services/api';
import { updateTankThresholdApi } from '../services/api';
import { useAuthStore } from './authStore';
import { sortTanksBySeverity } from '../utils/tankMetrics';

interface NodeStatusUpdate {
  nodeCode?: string;
  tankId?: string;
  status?: NodeStatus;
  rssi?: number | null;
  lastSeen?: string;
}

interface TankState {
  tanks: Tank[];
  isLoading: boolean;
  error: string | null;

  fetchTanks: () => Promise<void>;
  updateLevel: (
    tankId: string,
    levelPercent: number | string,
    volumeLiters: number | string,
    meta?: { distanceCm?: number | null; rssi?: number | null; recordedAt?: string }
  ) => void;
  updateNodeStatus: (update: NodeStatusUpdate) => void;
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

  updateLevel: (tankId, levelPercent, volumeLiters, meta) => {
    set((state) => ({
      tanks: sortTanksBySeverity(
        state.tanks.map((tank) => {
          if (tank.id !== tankId) return tank;
          const recordedAt = meta?.recordedAt || new Date().toISOString();
          return {
            ...tank,
            latestReading: tank.latestReading
              ? {
                  ...tank.latestReading,
                  levelPercent,
                  volumeLiters,
                  distanceCm: meta?.distanceCm ?? tank.latestReading.distanceCm,
                  rssi: meta?.rssi !== undefined ? meta.rssi : tank.latestReading.rssi,
                  recordedAt,
                }
              : {
                  id: Date.now(),
                  tankId,
                  levelPercent,
                  volumeLiters,
                  distanceCm: meta?.distanceCm ?? null,
                  rssi: meta?.rssi ?? null,
                  recordedAt,
                },
          };
        })
      ),
    }));
  },

  updateNodeStatus: (update) => {
    set((state) => ({
      tanks: state.tanks.map((tank) => {
        if (!tank.nodes?.length) return tank;
        const matchesTank = Boolean(update.tankId && tank.id === update.tankId);
        let changed = false;
        const updatedNodes = tank.nodes.map((node) => {
          const matchesNode = Boolean(
            update.nodeCode &&
              node.deviceCode.toLowerCase() === update.nodeCode.toLowerCase()
          );
          if (!matchesTank && !matchesNode) return node;
          changed = true;
          return {
            ...node,
            status: update.status ?? node.status,
            lastRssi: update.rssi !== undefined ? update.rssi : node.lastRssi,
            lastSeen: update.lastSeen ?? node.lastSeen,
          };
        });
        return changed ? { ...tank, nodes: updatedNodes } : tank;
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
