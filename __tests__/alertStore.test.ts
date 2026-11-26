import { useAlertStore } from '../src/stores/alertStore';
import { Alert } from '../src/types';
import { fetchAlertsApi, resolveAlertApi } from '../src/services/api';

jest.mock('../src/services/api', () => ({
  fetchAlertsApi: jest.fn(),
  resolveAlertApi: jest.fn(),
}));

const mockedFetchAlertsApi = jest.mocked(fetchAlertsApi);
const mockedResolveAlertApi = jest.mocked(resolveAlertApi);

const activeAlert: Alert = {
  id: 1,
  tankId: 'tank-01',
  tankName: 'Tangki Gedung Utama',
  level: 'CRITICAL',
  message: 'Level air kritis',
  status: 'active',
  createdAt: '2026-10-29T10:00:00.000Z',
};

describe('AlertStore Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAlertStore.setState({
      alerts: [],
      isLoading: false,
      resolvingAlertId: null,
      error: null,
    });
  });

  it('sorts fetched alerts from newest to oldest', async () => {
    mockedFetchAlertsApi.mockResolvedValue([
      { ...activeAlert, id: 1, createdAt: '2026-10-29T09:00:00.000Z' },
      { ...activeAlert, id: 2, createdAt: '2026-10-29T10:00:00.000Z' },
    ]);

    await useAlertStore.getState().fetchAlerts();

    expect(useAlertStore.getState().alerts.map((alert) => alert.id)).toEqual([2, 1]);
    expect(useAlertStore.getState().error).toBeNull();
  });

  it('does not duplicate an alert received more than once', () => {
    useAlertStore.getState().addAlert(activeAlert);
    useAlertStore.getState().addAlert(activeAlert);

    expect(useAlertStore.getState().alerts).toHaveLength(1);
  });

  it('updates an alert after resolve succeeds', async () => {
    useAlertStore.setState({ alerts: [activeAlert] });
    mockedResolveAlertApi.mockResolvedValue({
      ...activeAlert,
      status: 'resolved',
      resolvedAt: '2026-10-29T10:05:00.000Z',
    });

    await expect(useAlertStore.getState().resolveAlert(activeAlert.id)).resolves.toBe(true);

    expect(useAlertStore.getState().alerts[0].status).toBe('resolved');
    expect(useAlertStore.getState().resolvingAlertId).toBeNull();
  });

  it('keeps an alert active when resolve fails', async () => {
    useAlertStore.setState({ alerts: [activeAlert] });
    mockedResolveAlertApi.mockRejectedValue(new Error('BFF unavailable'));

    await expect(useAlertStore.getState().resolveAlert(activeAlert.id)).resolves.toBe(false);

    expect(useAlertStore.getState().alerts[0].status).toBe('active');
    expect(useAlertStore.getState().error).toBe('BFF unavailable');
  });
});
