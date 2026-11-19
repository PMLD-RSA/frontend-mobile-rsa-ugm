import { create } from 'zustand';
import { fetchGatewaysApi, fetchNodesApi } from '../services/api';
import { Gateway, SensorNode } from '../types';

interface DeviceState {
  gateways: Gateway[];
  nodes: SensorNode[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  fetchDevices: () => Promise<void>;
  clearError: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  gateways: [],
  nodes: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      const [gatewaysData, nodesData] = await Promise.all([
        fetchGatewaysApi().catch(() => [] as Gateway[]),
        fetchNodesApi().catch(() => [] as SensorNode[]),
      ]);

      set({
        gateways: gatewaysData,
        nodes: nodesData,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Gagal memuat status perangkat',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
