import { useUserStore } from '../src/stores/userStore';
import { fetchUsersApi, updateUserStatusApi, resetUserPasswordApi } from '../src/services/api';
import { User } from '../src/types';

jest.mock('../src/services/api', () => ({
  fetchUsersApi: jest.fn(),
  updateUserStatusApi: jest.fn(),
  resetUserPasswordApi: jest.fn(),
}));

const mockedFetchUsersApi = jest.mocked(fetchUsersApi);
const mockedUpdateUserStatusApi = jest.mocked(updateUserStatusApi);
const mockedResetUserPasswordApi = jest.mocked(resetUserPasswordApi);

const mockUsers: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    role: 'admin',
    isActive: true,
    createdAt: '2026-09-14T06:00:00.000Z',
  },
  {
    id: 'user-op1',
    username: 'operator01',
    role: 'operator',
    isActive: true,
    createdAt: '2026-09-15T07:00:00.000Z',
  },
];

describe('UserStore Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({
      users: [],
      isLoading: false,
      updatingUserId: null,
      error: null,
      successMessage: null,
    });
  });

  it('fetches users list successfully', async () => {
    mockedFetchUsersApi.mockResolvedValue(mockUsers);

    await useUserStore.getState().fetchUsers();

    const state = useUserStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.users).toHaveLength(2);
    expect(state.users[0].username).toBe('admin');
  });

  it('handles fetch error gracefully', async () => {
    mockedFetchUsersApi.mockRejectedValue(new Error('Koneksi terputus'));

    await useUserStore.getState().fetchUsers();

    const state = useUserStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Koneksi terputus');
    expect(state.users).toEqual([]);
  });

  it('prevents current admin from deactivating their own active account', async () => {
    useUserStore.setState({ users: mockUsers });

    const result = await useUserStore
      .getState()
      .toggleUserStatus('user-admin', false, 'user-admin');

    expect(result).toBe(false);
    expect(mockedUpdateUserStatusApi).not.toHaveBeenCalled();
    expect(useUserStore.getState().error).toContain('tidak dapat menonaktifkan akun Anda sendiri');
  });

  it('successfully updates operator status', async () => {
    useUserStore.setState({ users: mockUsers });
    mockedUpdateUserStatusApi.mockResolvedValue({
      ...mockUsers[1],
      isActive: false,
    });

    const result = await useUserStore
      .getState()
      .toggleUserStatus('user-op1', false, 'user-admin');

    expect(result).toBe(true);
    expect(mockedUpdateUserStatusApi).toHaveBeenCalledWith('user-op1', false);

    const updatedUser = useUserStore.getState().users.find((u) => u.id === 'user-op1');
    expect(updatedUser?.isActive).toBe(false);
    expect(useUserStore.getState().successMessage).toContain('dinonaktifkan');
  });

  it('successfully resets user password', async () => {
    useUserStore.setState({ users: mockUsers });
    mockedResetUserPasswordApi.mockResolvedValue(mockUsers[1]);

    const result = await useUserStore
      .getState()
      .resetPassword('user-op1', 'RSA-Test1!');

    expect(result).toBe(true);
    expect(mockedResetUserPasswordApi).toHaveBeenCalledWith('user-op1', 'RSA-Test1!');
    expect(useUserStore.getState().successMessage).toContain('berhasil direset');
  });

  it('clears error and success messages properly', () => {
    useUserStore.setState({ error: 'Kesalahan uji', successMessage: 'Sukses uji' });

    useUserStore.getState().clearError();
    expect(useUserStore.getState().error).toBeNull();

    useUserStore.getState().clearSuccessMessage();
    expect(useUserStore.getState().successMessage).toBeNull();
  });
});
