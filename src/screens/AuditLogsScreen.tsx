import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Card } from '../components/Card';
import { useAuthStore } from '../stores/authStore';
import { useAuditLogStore } from '../stores/auditLogStore';
import { AuditLogCategory } from '../types';
import {
  formatRelativeTime,
  getAuditLogCategory,
  getAuditLogDescription,
} from '../utils/auditLog';

interface AuditLogsScreenProps {
  onNavigate: (screen: 'dashboard') => void;
}

const categoryVariant: Record<
  AuditLogCategory,
  'critical' | 'warning' | 'success' | 'info'
> = {
  AUTH: 'info',
  TANK: 'warning',
  ALERT: 'critical',
  USER: 'success',
  OTHER: 'info',
};

export const AuditLogsScreen: React.FC<AuditLogsScreenProps> = ({ onNavigate }) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const { logs, isLoading, error, fetchLogs, clearError } = useAuditLogStore();
  const [refreshing, setRefreshing] = useState(false);

  const canView = user?.role === 'admin' || user?.role === 'operator';

  useEffect(() => {
    if (canView) fetchLogs();
  }, [canView, fetchLogs]);

  const visibleLogs = useMemo(() => logs.slice(0, 20), [logs]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  }, [fetchLogs]);

  if (!canView) {
    return (
      <View style={[styles.accessDenied, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Text style={styles.accessIcon}>🔒</Text>
        <Text style={styles.accessTitle}>Akses Audit Log Ditolak</Text>
        <Text style={styles.accessText}>
          Audit log hanya dapat diakses oleh Admin dan Operator.
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
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#0a354c']} />
      }
    >
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.title}>Feed Aktivitas & Audit Log</Text>
          <Text style={styles.subtitle}>20 aktivitas operasional terbaru.</Text>
        </View>
        <Badge text={user?.role === 'admin' ? 'Admin' : 'Operator'} variant="info" />
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              clearError();
              fetchLogs();
            }}
          >
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && !refreshing && (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#0a354c" />
          <Text style={styles.stateText}>Memuat aktivitas terbaru...</Text>
        </View>
      )}

      {!isLoading && !error && visibleLogs.length === 0 && (
        <View style={styles.stateBox}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Belum ada aktivitas</Text>
          <Text style={styles.stateText}>Aktivitas operasional akan muncul di sini.</Text>
        </View>
      )}

      {visibleLogs.map((log, index) => {
        const category = getAuditLogCategory(log);
        return (
          <View key={`${log.id}-${index}`} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View style={styles.timelineDot} />
              {index < visibleLogs.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <Card style={styles.logCard}>
              <View style={styles.logHeader}>
                <Badge text={category} variant={categoryVariant[category]} />
                <Text style={styles.time}>{formatRelativeTime(log.createdAt)}</Text>
              </View>
              <Text style={styles.description}>{getAuditLogDescription(log)}</Text>
              {log.username && <Text style={styles.actor}>Oleh: {log.username}</Text>}
            </Card>
          </View>
        );
      })}

      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('dashboard')}>
        <Text style={styles.backText}>← Kembali ke Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  headingText: { flex: 1, marginRight: 8 },
  title: { color: '#0f172a', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: 13, lineHeight: 18, marginTop: 4 },
  timelineRow: { flexDirection: 'row' },
  timelineRail: { width: 24, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563eb', marginTop: 20 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#bfdbfe', marginVertical: 2 },
  logCard: { flex: 1, marginLeft: 8 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { color: '#64748b', fontSize: 11 },
  description: { color: '#0f172a', fontSize: 14, lineHeight: 20, marginTop: 12 },
  actor: { color: '#64748b', fontSize: 11, marginTop: 8 },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center' },
  errorText: { color: '#991b1b', flex: 1, fontSize: 12, marginRight: 8 },
  retryButton: { minHeight: 44, backgroundColor: '#dc2626', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 12 },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stateBox: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', padding: 32, marginBottom: 14 },
  stateText: { color: '#64748b', marginTop: 10, textAlign: 'center' },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700', marginTop: 8 },
  accessDenied: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: 24 },
  accessIcon: { fontSize: 42, marginBottom: 12 },
  accessTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  accessText: { color: '#64748b', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  backButton: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingHorizontal: 18 },
  backText: { color: '#334155', fontWeight: '700' },
});
