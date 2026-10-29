import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert as NativeAlert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Card } from '../components/Card';
import { useAlertStore } from '../stores/alertStore';
import { Alert, AlertLevel } from '../types';

type AlertFilter = 'ALL' | AlertLevel;

interface AlarmsScreenProps {
  onNavigate: (screen: 'dashboard') => void;
}

function formatAlertTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Waktu tidak tersedia';
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function alertVariant(level: AlertLevel): 'critical' | 'warning' {
  return level === 'CRITICAL' ? 'critical' : 'warning';
}

export const AlarmsScreen: React.FC<AlarmsScreenProps> = ({ onNavigate }) => {
  const insets = useSafeAreaInsets();
  const { alerts, isLoading, resolvingAlertId, error, fetchAlerts, resolveAlert, clearError } =
    useAlertStore();
  const [filter, setFilter] = useState<AlertFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const activeAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === 'active'),
    [alerts]
  );
  const filteredAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) => filter === 'ALL' || alert.level === filter
      ),
    [alerts, filter]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  }, [fetchAlerts]);

  const confirmResolve = (alert: Alert) => {
    NativeAlert.alert(
      'Konfirmasi Penyelesaian',
      'Apakah kondisi fisik tangki sudah diperiksa dan dipastikan aman?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Selesaikan',
          style: 'destructive',
          onPress: async () => {
            const resolved = await resolveAlert(alert.id);
            if (resolved) {
              NativeAlert.alert('Berhasil', 'Peringatan telah diselesaikan.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0a354c']} />}
    >
      <View style={styles.summaryRow}>
        <View style={styles.summaryText}>
          <Text style={styles.title}>Peringatan & Resolusi Darurat</Text>
          <Text style={styles.subtitle}>Periksa kondisi fisik sebelum menyelesaikan alert.</Text>
        </View>
        <Badge
          text={`${activeAlerts.length} Aktif`}
          variant={activeAlerts.length > 0 ? 'critical' : 'success'}
        />
      </View>

      <View style={styles.filterRow}>
        {(['ALL', 'CRITICAL', 'WARNING'] as AlertFilter[]).map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.filterButton, filter === item && styles.filterButtonActive]}
            onPress={() => setFilter(item)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === item }}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item === 'ALL' ? 'Semua' : item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => { clearError(); fetchAlerts(); }} style={styles.retryButton}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && !refreshing && (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#0a354c" />
          <Text style={styles.stateText}>Memuat daftar peringatan...</Text>
        </View>
      )}

      {!isLoading && filteredAlerts.length === 0 && (
        <View style={styles.stateBox}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyTitle}>
            {alerts.length === 0 ? 'Tidak ada peringatan' : 'Tidak ada alert pada filter ini'}
          </Text>
          <Text style={styles.stateText}>Semua kondisi terpantau aman.</Text>
        </View>
      )}

      {filteredAlerts.map((alert) => (
        <Card key={alert.id}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <Text style={styles.tankName}>{alert.tankName || `Tangki ${alert.tankId}`}</Text>
              <Text style={styles.createdAt}>{formatAlertTime(alert.createdAt)}</Text>
            </View>
            <Badge text={alert.level} variant={alertVariant(alert.level)} />
          </View>
          <Text style={styles.message}>{alert.message}</Text>
          <View style={styles.cardFooter}>
            <Badge
              text={alert.status === 'active' ? 'AKTIF' : 'SELESAI'}
              variant={alert.status === 'active' ? 'critical' : 'success'}
            />
            {alert.status === 'active' && (
              <TouchableOpacity
                style={styles.resolveButton}
                onPress={() => confirmResolve(alert)}
                disabled={resolvingAlertId === alert.id}
                accessibilityLabel={`Selesaikan peringatan ${alert.tankName || alert.tankId}`}
              >
                {resolvingAlertId === alert.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.resolveText}>Selesaikan</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Card>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('dashboard')}>
        <Text style={styles.backText}>← Kembali ke Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  summaryText: { flex: 1, marginRight: 8 },
  title: { color: '#0f172a', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: 13, lineHeight: 18, marginTop: 4 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff', justifyContent: 'center' },
  filterButtonActive: { backgroundColor: '#0a354c', borderColor: '#0a354c' },
  filterText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center' },
  errorText: { color: '#991b1b', flex: 1, fontSize: 12, marginRight: 8 },
  retryButton: { minHeight: 44, backgroundColor: '#dc2626', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 12 },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stateBox: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', padding: 32, marginBottom: 14 },
  stateText: { color: '#64748b', marginTop: 10, textAlign: 'center' },
  emptyIcon: { color: '#10b981', fontSize: 36, fontWeight: '800' },
  emptyTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700', marginTop: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { flex: 1, marginRight: 8 },
  tankName: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
  createdAt: { color: '#64748b', fontSize: 11, marginTop: 4 },
  message: { color: '#334155', fontSize: 14, lineHeight: 20, marginVertical: 14 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  resolveButton: { minHeight: 44, minWidth: 112, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center' },
  resolveText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  backButton: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  backText: { color: '#334155', fontWeight: '700' },
});
