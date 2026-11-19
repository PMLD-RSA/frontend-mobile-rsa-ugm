import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert as NativeAlert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Card } from '../components/Card';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { User, UserRole } from '../types';
import {
  formatUserDate,
  generateTempPassword,
  ROLE_CONFIGS,
} from '../utils/userManagement';

type UserFilter = 'ALL' | 'OPERATOR' | 'ACTIVE' | 'INACTIVE';

interface UsersScreenProps {
  onNavigate: (screen: 'dashboard') => void;
}

export const UsersScreen: React.FC<UsersScreenProps> = ({ onNavigate }) => {
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.user);
  const {
    users,
    isLoading,
    updatingUserId,
    error,
    successMessage,
    fetchUsers,
    toggleUserStatus,
    resetPassword,
    clearError,
    clearSuccessMessage,
  } = useUserStore();

  const [filter, setFilter] = useState<UserFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // State untuk modal reset kata sandi
  const [resetModalUser, setResetModalUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState<string>('');
  const [resetCompletedPassword, setResetCompletedPassword] = useState<string | null>(null);
  const [isSubmittingReset, setIsSubmittingReset] = useState<boolean>(false);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, [fetchUsers]);

  // Buka dialog modal reset sandi
  const openResetModal = (targetUser: User) => {
    setResetModalUser(targetUser);
    setTempPassword(generateTempPassword());
    setResetCompletedPassword(null);
  };

  const closeResetModal = () => {
    setResetModalUser(null);
    setTempPassword('');
    setResetCompletedPassword(null);
    setIsSubmittingReset(false);
  };

  const handleApplyResetPassword = async () => {
    if (!resetModalUser || !tempPassword) return;

    setIsSubmittingReset(true);
    const success = await resetPassword(resetModalUser.id, tempPassword);
    setIsSubmittingReset(false);

    if (success) {
      setResetCompletedPassword(tempPassword);
    }
  };

  // Konfirmasi toggle switch status
  const handleToggleStatus = (targetUser: User) => {
    const nextStatus = !targetUser.isActive;

    if (targetUser.id === currentUser?.id && !nextStatus) {
      NativeAlert.alert(
        'Tindakan Ditolak',
        'Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif digunakan.'
      );
      return;
    }

    if (!nextStatus) {
      NativeAlert.alert(
        'Konfirmasi Penonaktifan Akun',
        `Apakah Anda yakin ingin menonaktifkan akun "${targetUser.username}"? Pengguna tidak akan dapat masuk ke sistem.`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Nonaktifkan',
            style: 'destructive',
            onPress: () => toggleUserStatus(targetUser.id, false, currentUser?.id),
          },
        ]
      );
    } else {
      toggleUserStatus(targetUser.id, true, currentUser?.id);
    }
  };

  // Ringkasan metrik
  const metrics = useMemo(() => {
    let operatorCount = 0;
    let activeCount = 0;
    let inactiveCount = 0;

    users.forEach((u) => {
      if (u.role === 'operator') operatorCount += 1;
      if (u.isActive) activeCount += 1;
      else inactiveCount += 1;
    });

    return { total: users.length, operators: operatorCount, active: activeCount, inactive: inactiveCount };
  }, [users]);

  // Filter daftar pengguna
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filter === 'OPERATOR') return u.role === 'operator';
      if (filter === 'ACTIVE') return u.isActive;
      if (filter === 'INACTIVE') return !u.isActive;
      return true;
    });
  }, [users, filter]);

  // 1. Role Guard Mutlak: Khusus Administrator
  if (!isAdmin) {
    return (
      <View style={[styles.accessDenied, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.accessIconContainer}>
          <Text style={styles.accessIcon}>🔒</Text>
        </View>
        <Text style={styles.accessTitle}>Akses Kelola Pengguna Ditolak</Text>
        <Text style={styles.accessText}>
          Halaman Manajemen Pengguna & Operator hanya dapat diakses oleh Administrator sistem.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('dashboard')}>
          <Text style={styles.backText}>← Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0a354c']} />
      }
    >
      {/* 2. Header Judul & Badge Mode Admin */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryText}>
          <Text style={styles.title}>Kelola Pengguna</Text>
          <Text style={styles.subtitle}>
            F-07 • Manajemen Akun Operator & Hak Akses
          </Text>
        </View>
        <Badge text="Administrator" variant="info" />
      </View>

      {/* 3. Metrik Ringkasan Pengguna */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricNumber}>{metrics.total}</Text>
          <Text style={styles.metricLabel}>Total Akun</Text>
        </View>
        <View style={[styles.metricBox, styles.metricBoxBlue]}>
          <Text style={[styles.metricNumber, { color: '#0369a1' }]}>
            {metrics.operators}
          </Text>
          <Text style={styles.metricLabel}>Operator</Text>
        </View>
        <View style={[styles.metricBox, styles.metricBoxGreen]}>
          <Text style={[styles.metricNumber, { color: '#065f46' }]}>
            {metrics.active}
          </Text>
          <Text style={styles.metricLabel}>Aktif</Text>
        </View>
        <View style={[styles.metricBox, styles.metricBoxRed]}>
          <Text style={[styles.metricNumber, { color: '#991b1b' }]}>
            {metrics.inactive}
          </Text>
          <Text style={styles.metricLabel}>Nonaktif</Text>
        </View>
      </View>

      {/* 4. Feedback Pesan Sukses / Error */}
      {successMessage && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ {successMessage}</Text>
          <TouchableOpacity onPress={clearSuccessMessage}>
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5. Filter Tab Bar */}
      <View style={styles.filterRow}>
        {(
          [
            { key: 'ALL', label: 'Semua' },
            { key: 'OPERATOR', label: 'Operator' },
            { key: 'ACTIVE', label: 'Aktif' },
            { key: 'INACTIVE', label: 'Nonaktif' },
          ] as { key: UserFilter; label: string }[]
        ).map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}
            onPress={() => setFilter(item.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === item.key }}
          >
            <Text
              style={[
                styles.filterText,
                filter === item.key && styles.filterTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 6. Loading State */}
      {isLoading && !refreshing && (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#0a354c" />
          <Text style={styles.stateText}>Memuat daftar akun pengguna...</Text>
        </View>
      )}

      {/* 7. Empty State */}
      {!isLoading && filteredUsers.length === 0 && (
        <View style={styles.stateBox}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>Tidak ada pengguna ditemukan</Text>
          <Text style={styles.stateText}>
            Tidak ada akun pengguna yang cocok dengan filter yang dipilih.
          </Text>
        </View>
      )}

      {/* 8. Daftar Kartu Pengguna */}
      {filteredUsers.map((item) => {
        const roleConfig = ROLE_CONFIGS[item.role] || ROLE_CONFIGS.operator;
        const isSelf = item.id === currentUser?.id;
        const isUpdating = updatingUserId === item.id;

        return (
          <Card key={item.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              {/* Avatar Inisial */}
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: roleConfig.avatarBg },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: roleConfig.avatarColor },
                  ]}
                >
                  {(item.username || '?').slice(0, 1).toUpperCase()}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.usernameText}>{item.username}</Text>
                  {isSelf && (
                    <View style={styles.selfPill}>
                      <Text style={styles.selfPillText}>Anda</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userJoinedText}>
                  Terdaftar: {formatUserDate(item.createdAt)}
                </Text>
              </View>

              <Badge text={roleConfig.label} variant={roleConfig.badgeVariant} />
            </View>

            {/* Status Switch Row */}
            <View style={styles.statusRow}>
              <View style={styles.statusLabelCol}>
                <Text style={styles.statusLabel}>Status Akun</Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: item.isActive ? '#065f46' : '#991b1b' },
                  ]}
                >
                  {item.isActive ? '● AKTIF' : '○ NONAKTIF'}
                </Text>
              </View>

              {isUpdating ? (
                <ActivityIndicator size="small" color="#0a354c" />
              ) : (
                <Switch
                  value={item.isActive}
                  onValueChange={() => handleToggleStatus(item)}
                  disabled={isSelf}
                  trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
                  thumbColor={item.isActive ? '#10b981' : '#f1f5f9'}
                  accessibilityLabel={`Ubah status akun ${item.username}`}
                />
              )}
            </View>

            {/* Action Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => openResetModal(item)}
                accessibilityLabel={`Reset kata sandi ${item.username}`}
              >
                <Text style={styles.resetButtonText}>🔑 Reset Sandi</Text>
              </TouchableOpacity>
            </View>
          </Card>
        );
      })}

      {/* 9. Tombol Kembali ke Dashboard */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => onNavigate('dashboard')}
      >
        <Text style={styles.backText}>← Kembali ke Dashboard</Text>
      </TouchableOpacity>

      {/* 10. Modal Dialog Reset Kata Sandi Darurat */}
      <Modal
        visible={resetModalUser !== null}
        transparent
        animationType="fade"
        onRequestClose={closeResetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Sandi Darurat</Text>
              <TouchableOpacity onPress={closeResetModal} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {resetCompletedPassword ? (
              /* State Sukses: Menampilkan Sandi yang Berhasil Diganti */
              <View style={styles.modalSuccessBody}>
                <Text style={styles.modalSuccessIcon}>✓</Text>
                <Text style={styles.modalSuccessTitle}>Kata Sandi Berhasil Direset</Text>
                <Text style={styles.modalDesc}>
                  Berikan kata sandi sementara berikut kepada operator{' '}
                  <Text style={styles.modalBold}>{resetModalUser?.username}</Text>:
                </Text>

                <View style={styles.passwordDisplayBox}>
                  <Text style={styles.passwordDisplayText} selectable>
                    {resetCompletedPassword}
                  </Text>
                </View>

                <Text style={styles.modalHint}>
                  Operator wajib segera mengganti kata sandi ini setelah berhasil masuk.
                </Text>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={closeResetModal}
                >
                  <Text style={styles.modalPrimaryBtnText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* State Form: Konfirmasi Pembuatan Sandi Sementara */
              <View style={styles.modalBody}>
                <Text style={styles.modalDesc}>
                  Buat kata sandi sementara untuk akun operator{' '}
                  <Text style={styles.modalBold}>{resetModalUser?.username}</Text>:
                </Text>

                <View style={styles.passwordGeneratorBox}>
                  <Text style={styles.generatedPasswordText} selectable>
                    {tempPassword}
                  </Text>
                  <TouchableOpacity
                    style={styles.regenerateBtn}
                    onPress={() => setTempPassword(generateTempPassword())}
                  >
                    <Text style={styles.regenerateBtnText}>Acak Ulang</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalWarning}>
                  ⚠ Sandi lama akan langsung tidak berlaku setelah Anda menekan tombol di bawah.
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={closeResetModal}
                    disabled={isSubmittingReset}
                  >
                    <Text style={styles.modalCancelText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSubmitBtn}
                    onPress={handleApplyResetPassword}
                    disabled={isSubmittingReset}
                  >
                    {isSubmittingReset ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.modalSubmitText}>Terapkan Sandi</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryText: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    alignItems: 'center',
  },
  metricBoxBlue: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  metricBoxGreen: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  metricBoxRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  successBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successText: {
    color: '#065f46',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  dismissText: {
    color: '#64748b',
    fontSize: 14,
    paddingHorizontal: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#0a354c',
    borderColor: '#0a354c',
  },
  filterText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  stateBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 32,
    marginBottom: 14,
  },
  stateText: {
    color: '#64748b',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  userCard: {
    padding: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  selfPill: {
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  selfPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369a1',
  },
  userJoinedText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusLabelCol: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  resetButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '700',
  },
  backButton: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  backText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
  },
  accessDenied: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  accessIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  accessIcon: {
    fontSize: 30,
  },
  accessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  accessText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  modalDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  modalBold: {
    fontWeight: '800',
    color: '#0f172a',
  },
  passwordGeneratorBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginVertical: 14,
    alignItems: 'center',
  },
  generatedPasswordText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a354c',
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  regenerateBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  regenerateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  modalWarning: {
    fontSize: 11,
    color: '#b45309',
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalCancelBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  modalSubmitBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: '#0a354c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalSuccessBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalSuccessIcon: {
    fontSize: 36,
    color: '#10b981',
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSuccessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  passwordDisplayBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginVertical: 12,
  },
  passwordDisplayText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e40af',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  modalHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalPrimaryBtn: {
    backgroundColor: '#0a354c',
    borderRadius: 8,
    width: '100%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
