import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Badge, Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonList } from '../components/Skeleton';
import { useAuthStore } from '../stores/authStore';
import { useAuditLogStore } from '../stores/auditLogStore';
import { COLORS, RADIUS } from '../theme/tokens';
import { AuditLog, AuditLogCategory } from '../types';
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

  const canView = user?.role === 'admin';

  useEffect(() => {
    if (canView) fetchLogs();
  }, [canView, fetchLogs]);

  const visibleLogs = useMemo(() => logs.slice(0, 20), [logs]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  }, [fetchLogs]);

  const renderLogItem = useCallback(
    ({ item: log, index }: { item: AuditLog; index: number }) => {
      const category = getAuditLogCategory(log);
      return (
        <View style={styles.timelineRow}>
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
    },
    [visibleLogs.length]
  );

  if (!canView) {
    return (
      <View style={[styles.accessDenied, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.accessIconBox}>
          <Feather name="lock" size={28} color={COLORS.criticalText} />
        </View>
        <Text style={styles.accessTitle}>Akses Audit Log Ditolak</Text>
        <Text style={styles.accessText}>
          Audit log hanya dapat diakses oleh Administrator.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('dashboard')}>
          <Feather name="arrow-left" size={15} color={COLORS.textSecondary} />
          <Text style={styles.backText}>Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
      data={isLoading && !refreshing ? [] : visibleLogs}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={renderLogItem}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={5}
      removeClippedSubviews={Platform.OS === 'android'}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
      }
      ListHeaderComponent={
        <>
          <View style={styles.heading}>
            <View style={styles.headingText}>
              <Text style={styles.title}>Feed Aktivitas & Audit Log</Text>
              <Text style={styles.subtitle}>20 aktivitas operasional terbaru.</Text>
            </View>
            <Badge text="Admin" variant="info" />
          </View>

          {error && (
            <ErrorBanner
              message={error}
              onRetry={() => {
                clearError();
                fetchLogs();
              }}
            />
          )}

          {isLoading && !refreshing && <SkeletonList variant="list" count={4} />}
        </>
      }
      ListEmptyComponent={
        !isLoading && !error ? (
          <EmptyState
            icon="clipboard"
            title="Belum ada aktivitas"
            description="Aktivitas operasional akan muncul di sini."
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  headingText: { flex: 1, marginRight: 8 },
  title: { color: COLORS.heading, fontSize: 20, fontWeight: '800' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 4 },
  timelineRow: { flexDirection: 'row' },
  timelineRail: { width: 24, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primarySoft, marginTop: 20 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#bae6fd', marginVertical: 2 },
  logCard: { flex: 1, marginLeft: 8 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { color: COLORS.textMuted, fontSize: 11 },
  description: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 20, marginTop: 12 },
  actor: { color: COLORS.textSecondary, fontSize: 11, marginTop: 8 },
  stateBox: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: 32, marginBottom: 14 },
  stateText: { color: COLORS.textSecondary, marginTop: 10, textAlign: 'center' },
  accessDenied: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  accessIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: COLORS.criticalBg, borderWidth: 1, borderColor: '#fecaca', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  accessTitle: { color: COLORS.heading, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  accessText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  backButton: { flexDirection: 'row', gap: 6, minHeight: 44, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingHorizontal: 18 },
  backText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 13 },
});
