import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert as NativeAlert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonList } from '../components/Skeleton';
import { useAlertStore } from '../stores/alertStore';
import { useAuthStore } from '../stores/authStore';
import { COLORS, RADIUS } from '../theme/tokens';
import { Alert, AlertLevel } from '../types';

type AlertFilter = 'ALL' | AlertLevel;

function formatAlertTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Waktu tidak tersedia';
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function alertVariant(level: AlertLevel): 'critical' | 'warning' {
  return level === 'CRITICAL' ? 'critical' : 'warning';
}

export const AlarmsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const canResolve = user?.role === 'admin' || user?.role === 'operator';
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

  const confirmResolve = useCallback(
    (alert: Alert) => {
      if (!canResolve) return;
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
    },
    [canResolve, resolveAlert]
  );

  const renderAlertItem = useCallback(
    ({ item: alert }: { item: Alert }) => (
      <Card>
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
          {alert.status === 'active' && canResolve && (
            <TouchableOpacity
              style={styles.resolveButton}
              onPress={() => confirmResolve(alert)}
              disabled={resolvingAlertId === alert.id}
              accessibilityLabel={`Selesaikan peringatan ${alert.tankName || alert.tankId}`}
            >
              {resolvingAlertId === alert.id ? (
                <ActivityIndicator color={COLORS.textOnPrimary} />
              ) : (
                <Text style={styles.resolveText}>Selesaikan</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Card>
    ),
    [canResolve, confirmResolve, resolvingAlertId]
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
      data={isLoading && !refreshing ? [] : filteredAlerts}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderAlertItem}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={5}
      removeClippedSubviews={Platform.OS === 'android'}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
      ListHeaderComponent={
        <>
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
            <ErrorBanner
              message={error}
              onRetry={() => {
                clearError();
                fetchAlerts();
              }}
            />
          )}

          {isLoading && !refreshing && <SkeletonList variant="list" count={3} />}
        </>
      }
      ListEmptyComponent={
        !isLoading ? (
          <EmptyState
            icon="check-circle"
            title={alerts.length === 0 ? 'Tidak ada peringatan' : 'Tidak ada alert pada filter ini'}
            description="Semua kondisi tangki terpantau aman."
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  summaryText: { flex: 1, marginRight: 8 },
  title: { color: COLORS.heading, fontSize: 20, fontWeight: '800' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 4 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: COLORS.surface, justifyContent: 'center' },
  filterButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: COLORS.textOnPrimary },
  stateBox: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: 32, marginBottom: 14 },
  stateText: { color: COLORS.textSecondary, marginTop: 10, textAlign: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { flex: 1, marginRight: 8 },
  tankName: { color: COLORS.heading, fontSize: 16, fontWeight: '700' },
  createdAt: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  message: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 20, marginVertical: 14 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  resolveButton: { minHeight: 44, minWidth: 112, paddingHorizontal: 14, borderRadius: RADIUS.sm + 2, backgroundColor: COLORS.critical, justifyContent: 'center', alignItems: 'center' },
  resolveText: { color: COLORS.textOnPrimary, fontSize: 12, fontWeight: '700' },
});
