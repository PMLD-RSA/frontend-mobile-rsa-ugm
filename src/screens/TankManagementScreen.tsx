import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Badge } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonList } from '../components/Skeleton';
import { TankCard } from '../components/TankCard';
import { useAuthStore } from '../stores/authStore';
import { useTankStore } from '../stores/tankStore';
import { COLORS, RADIUS } from '../theme/tokens';
import { Tank } from '../types';
import { getTankStatusCategory, sortTanksBySeverity } from '../utils/tankMetrics';
import { validateThresholds } from '../utils/tankThreshold';

interface ThresholdForm {
  min: string;
  max: string;
}

export const TankManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const { tanks, isLoading, error, fetchTanks, updateThreshold } = useTankStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);
  const [form, setForm] = useState<ThresholdForm>({ min: '', max: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  const sortedTanks = useMemo(() => sortTanksBySeverity(tanks), [tanks]);

  const openEditor = (tank: Tank) => {
    if (!isAdmin) return;
    setSelectedTank(tank);
    setForm({
      min: String(tank.minThresholdPercent ?? 30),
      max: String(tank.maxThresholdPercent ?? 90),
    });
    setFormError(null);
  };

  const closeEditor = () => {
    if (isSaving) return;
    setSelectedTank(null);
    setFormError(null);
  };

  const saveThreshold = async () => {
    if (!selectedTank || !isAdmin) {
      setFormError('Hanya Admin yang dapat mengubah ambang batas tangki.');
      return;
    }
    const validationError = validateThresholds(form.min, form.max);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);
    const saved = await updateThreshold(
      selectedTank.id,
      Number(form.min),
      Number(form.max)
    );
    setIsSaving(false);
    if (saved) closeEditor();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTanks();
    setRefreshing(false);
  }, [fetchTanks]);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
      >
        <View style={styles.intro}>
          <View style={styles.introText}>
            <Text style={styles.title}>Manajemen Tangki Air</Text>
            <Text style={styles.subtitle}>Kelola ambang batas peringatan tangki SV UGM.</Text>
          </View>
          <Badge text={isAdmin ? 'Admin' : 'Read-only'} variant={isAdmin ? 'success' : 'warning'} />
        </View>

        {!isAdmin && (
          <View style={styles.notice}>
            <Feather name="info" size={15} color={COLORS.warningText} />
            <Text style={styles.noticeText}>Mode baca saja. Hanya Admin yang dapat mengubah threshold.</Text>
          </View>
        )}
        {error && <ErrorBanner message={error} onRetry={fetchTanks} />}
        {isLoading && !refreshing && <SkeletonList variant="tank" count={2} />}
        {!isLoading && sortedTanks.length === 0 && !error && (
          <EmptyState
            icon="database"
            title="Belum ada data tangki"
            description="Tarik layar ke bawah atau tekan tombol untuk memuat ulang."
            actionLabel="Muat Ulang"
            onAction={fetchTanks}
          />
        )}
        {sortedTanks.map((tank) => (
          <View key={tank.id}>
            <TankCard tank={tank} />
            <View style={styles.actions}>
              <Text style={styles.statusText}>
                Status: {getTankStatusCategory(Number(tank.latestReading?.levelPercent || 0), Number(tank.minThresholdPercent || 30)).statusText}
              </Text>
              {isAdmin && (
                <TouchableOpacity style={styles.editButton} onPress={() => openEditor(tank)} accessibilityLabel={`Edit threshold ${tank.name}`}>
                  <Feather name="sliders" size={13} color={COLORS.textOnPrimary} />
                  <Text style={styles.editButtonText}>Edit Threshold</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={selectedTank !== null} transparent animationType="slide" onRequestClose={closeEditor}>
        <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={closeEditor} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Quick Threshold</Text>
            <Text style={styles.sheetSubtitle}>{selectedTank?.name}</Text>
            <Text style={styles.inputLabel}>Min Threshold (%)</Text>
            <TextInput
              style={styles.input}
              value={form.min}
              onChangeText={(value) => setForm({ ...form, min: value })}
              keyboardType="decimal-pad"
              maxLength={5}
              editable={!isSaving}
              accessibilityLabel="Nilai minimum threshold"
            />
            <Text style={styles.inputLabel}>Max Threshold (%)</Text>
            <TextInput
              style={styles.input}
              value={form.max}
              onChangeText={(value) => setForm({ ...form, max: value })}
              keyboardType="decimal-pad"
              maxLength={5}
              editable={!isSaving}
              accessibilityLabel="Nilai maksimum threshold"
            />
            {formError && <Text style={styles.formError}>{formError}</Text>}
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeEditor} disabled={isSaving}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveThreshold} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color={COLORS.textOnPrimary} /> : <Text style={styles.saveText}>Simpan Perubahan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  intro: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  introText: { flex: 1, marginRight: 8 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.heading },
  subtitle: { marginTop: 4, color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.warningBg, borderColor: '#fde68a', borderWidth: 1, borderRadius: RADIUS.md, padding: 12, marginBottom: 14 },
  noticeText: { color: COLORS.warningText, fontSize: 13, flex: 1 },
  loading: { alignItems: 'center', padding: 32 },
  loadingText: { color: COLORS.primary, marginTop: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -8, marginBottom: 14, paddingHorizontal: 4 },
  statusText: { color: COLORS.textSecondary, fontSize: 12, flex: 1 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14, borderRadius: RADIUS.sm + 2, backgroundColor: COLORS.primary, justifyContent: 'center' },
  editButtonText: { color: COLORS.textOnPrimary, fontSize: 12, fontWeight: '700' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 28 },
  sheetTitle: { color: COLORS.heading, fontSize: 20, fontWeight: '800' },
  sheetSubtitle: { color: COLORS.textSecondary, marginTop: 4, marginBottom: 18 },
  inputLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: { height: 48, borderWidth: 1, borderColor: COLORS.borderStrong, borderRadius: RADIUS.md, paddingHorizontal: 14, color: COLORS.textPrimary, fontSize: 16, backgroundColor: COLORS.surfaceSubtle },
  formError: { color: COLORS.criticalText, fontSize: 12, marginTop: 10 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  cancelButton: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: COLORS.borderStrong, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: COLORS.textSecondary, fontWeight: '700' },
  saveButton: { flex: 1.5, minHeight: 48, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: COLORS.textOnPrimary, fontWeight: '700' },
});
