import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert as NativeAlert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Badge, Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { COLORS, RADIUS } from '../theme/tokens';
import { User } from '../types';
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
  const handleToggleStatus = useCallback(
    (targetUser: User) => {
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
    },
    [currentUser?.id, toggleUserStatus]
  );

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

  const renderUserItem = useCallback(
    ({ item }: { item: User }) => {
      const roleConfig = ROLE_CONFIGS[item.role] || ROLE_CONFIGS.operator;
      const isSelf = item.id === currentUser?.id;
      const isUpdating = updatingUserId === item.id;

      return (
        <Card style={styles.userCard}>
          <View style={styles.userHeader}>
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
              <ActivityIndicator size="small" color={COLORS.primary} />
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

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => openResetModal(item)}
              accessibilityLabel={`Reset kata sandi ${item.username}`}
            >
              <Feather name="key" size={13} color={COLORS.primary} />
              <Text style={styles.resetButtonText}>Reset Sandi</Text>
            </TouchableOpacity>
          </View>
        </Card>
      );
    },
    [currentUser?.id, handleToggleStatus, updatingUserId]
  );

  // 1. Role Guard Mutlak: Khusus Administrator
  if (!isAdmin) {
    return (
      <View style={[styles.accessDenied, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.accessIconContainer}>
          <Feather name="lock" size={28} color={COLORS.criticalText} />
        </View>
        <Text style={styles.accessTitle}>Akses Kelola Pengguna Ditolak</Text>
        <Text style={styles.accessText}>
          Halaman Manajemen Pengguna & Operator hanya dapat diakses oleh Administrator sistem.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('dashboard')}>
          <Feather name="arrow-left" size={15} color={COLORS.textSecondary} />
          <Text style={styles.backText}>Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
        data={isLoading && !refreshing ? [] : filteredUsers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderUserItem}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={
          <>
            {/* 2. Header Judul & Badge Mode Admin */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryText}>
                <Text style={styles.title}>Kelola Pengguna</Text>
                <Text style={styles.subtitle}>
                  Manajemen Akun Operator & Hak Akses
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
                <Feather name="check-circle" size={16} color={COLORS.normalText} />
                <Text style={styles.successText}>{successMessage}</Text>
                <TouchableOpacity onPress={clearSuccessMessage} accessibilityLabel="Tutup notifikasi">
                  <Feather name="x" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={16} color={COLORS.criticalText} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={clearError} accessibilityLabel="Tutup pesan error">
                  <Feather name="x" size={16} color={COLORS.textSecondary} />
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

            {/* 6. Loading Skeleton */}
            {isLoading && !refreshing && <SkeletonList variant="list" count={3} />}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="users"
              title="Tidak ada pengguna ditemukan"
              description="Tidak ada akun pengguna yang cocok dengan filter yang dipilih."
            />
          ) : undefined
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => onNavigate('dashboard')}
          >
            <Feather name="arrow-left" size={15} color={COLORS.textSecondary} />
            <Text style={styles.backText}>Kembali ke Dashboard</Text>
          </TouchableOpacity>
        }
      />

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
              <TouchableOpacity onPress={closeResetModal} style={styles.modalCloseBtn} accessibilityLabel="Tutup modal">
                <Feather name="x" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {resetCompletedPassword ? (
              <View style={styles.modalSuccessBody}>
                <View style={styles.modalSuccessIconBox}>
                  <Feather name="check-circle" size={28} color={COLORS.normal} />
                </View>
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
                    <Feather name="refresh-cw" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.regenerateBtnText}>Acak Ulang</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalWarningBox}>
                  <Feather name="alert-triangle" size={14} color={COLORS.warningText} />
                  <Text style={styles.modalWarning}>
                    Sandi lama akan langsung tidak berlaku setelah Anda menekan tombol di bawah.
                  </Text>
                </View>

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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.heading,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  metricBoxBlue: {
    backgroundColor: COLORS.infoBg,
    borderColor: '#bae6fd',
  },
  metricBoxGreen: {
    backgroundColor: COLORS.normalBg,
    borderColor: '#a7f3d0',
  },
  metricBoxRed: {
    backgroundColor: COLORS.criticalBg,
    borderColor: '#fecaca',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.heading,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  successBox: {
    backgroundColor: COLORS.normalBg,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    color: COLORS.normalText,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  errorBox: {
    backgroundColor: COLORS.criticalBg,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: COLORS.criticalText,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: COLORS.textOnPrimary,
  },
  stateBox: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 32,
    marginBottom: 14,
  },
  stateText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
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
    borderRadius: RADIUS.lg,
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
    color: COLORS.heading,
  },
  selfPill: {
    backgroundColor: COLORS.infoBg,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  selfPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.infoText,
  },
  userJoinedText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusLabelCol: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
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
    borderTopColor: COLORS.border,
  },
  resetButton: {
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
    backgroundColor: COLORS.infoBg,
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: RADIUS.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    gap: 6,
    minHeight: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 18,
  },
  backText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  accessDenied: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  accessIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.criticalBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  accessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.heading,
    marginBottom: 8,
    textAlign: 'center',
  },
  accessText: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    shadowColor: COLORS.textPrimary,
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
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.heading,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  modalBold: {
    fontWeight: '800',
    color: COLORS.heading,
  },
  passwordGeneratorBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginVertical: 14,
    alignItems: 'center',
  },
  generatedPasswordText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  regenerateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 16,
  },
  modalWarning: {
    flex: 1,
    fontSize: 11,
    color: COLORS.warningText,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalCancelBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: RADIUS.sm + 2,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalSubmitBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: RADIUS.sm + 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  modalSuccessBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalSuccessIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.normalBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalSuccessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.heading,
    marginBottom: 8,
    textAlign: 'center',
  },
  passwordDisplayBox: {
    backgroundColor: COLORS.infoBg,
    borderWidth: 1.5,
    borderColor: '#7dd3fc',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginVertical: 12,
  },
  passwordDisplayText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  modalHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalPrimaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm + 2,
    width: '100%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
