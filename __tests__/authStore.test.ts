import { useAuthStore } from '../src/stores/authStore';
import * as secureStore from '../src/services/secureStore';

// Mock secureStore
jest.mock('../src/services/secureStore', () => ({
  saveAuthToken: jest.fn().mockResolvedValue(undefined),
  getAuthToken: jest.fn().mockResolvedValue(null),
  removeAuthToken: jest.fn().mockResolvedValue(undefined),
}));

describe('AuthStore Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('harus memiliki initial state yang bersih (unauthenticated)', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('harus membersihkan error saat clearError dipanggil', () => {
    useAuthStore.setState({ error: 'Username atau password salah' });
    expect(useAuthStore.getState().error).toBe('Username atau password salah');

    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('harus mereset sesi pengguna saat logout dipanggil', async () => {
    useAuthStore.setState({
      user: {
        id: 'user-01',
        username: 'admin',
        role: 'admin',
        isActive: true,
      },
      token: 'jwt-token-sample',
      isAuthenticated: true,
    });

    await useAuthStore.getState().logout();

    expect(secureStore.removeAuthToken).toHaveBeenCalledTimes(1);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
