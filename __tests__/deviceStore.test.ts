import { useDeviceStore } from '../src/stores/deviceStore';
import { fetchGatewaysApi, fetchNodesApi } from '../src/services/api';
import { Gateway, SensorNode } from '../src/types';

jest.mock('../src/services/api', () => ({
  fetchGatewaysApi: jest.fn(),
  fetchNodesApi: jest.fn(),
}));

const mockedFetchGatewaysApi = jest.mocked(fetchGatewaysApi);
const mockedFetchNodesApi = jest.mocked(fetchNodesApi);

const mockGateway: Gateway = {
  id: 'gw-101',
  deviceCode: 'GW-HUB-01',
  status: 'online',
  lastHeartbeat: '2026-11-19T08:00:00.000Z',
};

const mockNode: SensorNode = {
  id: 'node-101',
  deviceCode: 'STM32-ATA',
  sensorType: 'ultrasonic',
  status: 'active',
  lastRssi: -74,
  lastSeen: '2026-11-19T08:05:00.000Z',
  tankId: 'tank-01',
};

describe('DeviceStore Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDeviceStore.setState({
      gateways: [],
      nodes: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  });

  it('fetches gateways and nodes successfully and updates lastUpdated', async () => {
    mockedFetchGatewaysApi.mockResolvedValue([mockGateway]);
    mockedFetchNodesApi.mockResolvedValue([mockNode]);

    await useDeviceStore.getState().fetchDevices();

    const state = useDeviceStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.gateways).toHaveLength(1);
    expect(state.gateways[0].deviceCode).toBe('GW-HUB-01');
    expect(state.nodes).toHaveLength(1);
    expect(state.nodes[0].deviceCode).toBe('STM32-ATA');
    expect(state.lastUpdated).toBeTruthy();
  });

  it('handles errors gracefully during fetchDevices', async () => {
    mockedFetchGatewaysApi.mockRejectedValue(new Error('Koneksi terputus'));
    mockedFetchNodesApi.mockRejectedValue(new Error('Koneksi terputus'));

    await useDeviceStore.getState().fetchDevices();

    const state = useDeviceStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.gateways).toEqual([]);
    expect(state.nodes).toEqual([]);
  });

  it('clears error correctly', () => {
    useDeviceStore.setState({ error: 'Beberapa kesalahan terjadi' });
    expect(useDeviceStore.getState().error).toBe('Beberapa kesalahan terjadi');

    useDeviceStore.getState().clearError();
    expect(useDeviceStore.getState().error).toBeNull();
  });
});
