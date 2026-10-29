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
import { Badge } from '../components/Card';
import { TankCard } from '../components/TankCard';
import { useAuthStore } from '../stores/authStore';
import { useTankStore } from '../stores/tankStore';
import { Tank } from '../types';
import { getTankStatusCategory, sortTanksBySeverity } from '../utils/tankMetrics';
import { validateThresholds } from '../utils/tankThreshold';

interface TankManagementScreenProps {
  onNavigate: (screen: 'dashboard') => void;
}

interface ThresholdForm {
  min: string;
  max: string;
}

export const TankManagementScreen: React.FC<TankManagementScreenProps> = ({ onNavigate }) => {
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0a354c']} />}
      >
        <View style={styles.intro}>
          <View style={styles.introText}>
            <Text style={styles.title}>Manajemen Tangki Air</Text>
            <Text style={styles.subtitle}>Kelola ambang batas peringatan tangki rumah sakit.</Text>
          </View>
          <Badge text={isAdmin ? 'Admin' : 'Read-only'} variant={isAdmin ? 'success' : 'warning'} />
        </View>

        {!isAdmin && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>Mode baca saja. Hanya Admin yang dapat mengubah threshold.</Text>
          </View>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {isLoading && !refreshing && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#0a354c" />
            <Text style={styles.loadingText}>Memuat data tangki...</Text>
          </View>
        )}
        {!isLoading && sortedTanks.length === 0 && !error && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Belum ada data tangki</Text>
            <Text style={styles.emptyText}>Tarik layar ke bawah untuk memuat ulang.</Text>
          </View>
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
                  <Text style={styles.editButtonText}>Edit Threshold</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('dashboard')}>
          <Text style={styles.backButtonText}>← Kembali ke Dashboard</Text>
        </TouchableOpacity>
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
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Simpan Perubahan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  intro: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  introText: { flex: 1, marginRight: 8 },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  subtitle: { marginTop: 4, color: '#64748b', fontSize: 13, lineHeight: 18 },
  notice: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14 },
  noticeText: { color: '#92400e', fontSize: 13 },
  errorText: { color: '#991b1b', backgroundColor: '#fef2f2', padding: 12, borderRadius: 10, marginBottom: 14 },
  loading: { alignItems: 'center', padding: 32 },
  loadingText: { color: '#0a354c', marginTop: 10 },
  empty: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 28 },
  emptyTitle: { fontWeight: '700', color: '#0f172a' },
  emptyText: { color: '#64748b', marginTop: 6 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -8, marginBottom: 14, paddingHorizontal: 4 },
  statusText: { color: '#64748b', fontSize: 12, flex: 1 },
  editButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#0a354c', justifyContent: 'center' },
  editButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  backButton: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  backButtonText: { color: '#334155', fontWeight: '700' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 28 },
  sheetTitle: { color: '#0f172a', fontSize: 20, fontWeight: '800' },
  sheetSubtitle: { color: '#64748b', marginTop: 4, marginBottom: 18 },
  inputLabel: { color: '#334155', fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: { height: 48, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 14, color: '#0f172a', fontSize: 16 },
  formError: { color: '#b91c1c', fontSize: 12, marginTop: 10 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  cancelButton: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#334155', fontWeight: '700' },
  saveButton: { flex: 1.5, minHeight: 48, backgroundColor: '#2563eb', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
