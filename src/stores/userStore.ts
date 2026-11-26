import { create } from 'zustand';
import { fetchUsersApi, updateUserStatusApi, resetUserPasswordApi } from '../services/api';
import { User } from '../types';

interface UserState {
  users: User[];
  isLoading: boolean;
  updatingUserId: string | null;
  error: string | null;
  successMessage: string | null;

  fetchUsers: () => Promise<void>;
  toggleUserStatus: (
    userId: string,
    nextStatus: boolean,
    currentLoggedInUserId?: string
  ) => Promise<boolean>;
  resetPassword: (userId: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  updatingUserId: null,
  error: null,
  successMessage: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchUsersApi();
      set({ users: data, isLoading: false, error: null });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Gagal memuat daftar pengguna',
      });
    }
  },

  toggleUserStatus: async (userId, nextStatus, currentLoggedInUserId) => {
    // Pengaman: Jangan biarkan admin menonaktifkan akun sendiri
    if (userId === currentLoggedInUserId && !nextStatus) {
      set({ error: 'Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif.' });
      return false;
    }

    set({ updatingUserId: userId, error: null });
    try {
      const updated = await updateUserStatusApi(userId, nextStatus);

      set((state) => ({
        updatingUserId: null,
        users: state.users.map((u) => (u.id === userId ? { ...u, isActive: updated.isActive } : u)),
        successMessage: `Akun ${updated.username} berhasil ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
      }));
      return true;
    } catch (err: unknown) {
      set({
        updatingUserId: null,
        error: err instanceof Error ? err.message : 'Gagal mengubah status pengguna',
      });
      return false;
    }
  },

  resetPassword: async (userId, newPassword) => {
    set({ updatingUserId: userId, error: null });
    try {
      const updated = await resetUserPasswordApi(userId, newPassword);

      set({
        updatingUserId: null,
        successMessage: `Kata sandi akun ${updated.username} berhasil direset.`,
      });
      return true;
    } catch (err: unknown) {
      set({
        updatingUserId: null,
        error: err instanceof Error ? err.message : 'Gagal mereset kata sandi pengguna',
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  clearSuccessMessage: () => set({ successMessage: null }),
}));
