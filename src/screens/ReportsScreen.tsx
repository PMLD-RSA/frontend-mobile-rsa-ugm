import React, { useEffect, useMemo, useState } from 'react';
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
import { Feather } from '@expo/vector-icons';
import { Badge, Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { useReportStore } from '../stores/reportStore';
import { useTankStore } from '../stores/tankStore';
import { COLORS, RADIUS } from '../theme/tokens';
import { ReadingRange } from '../types';
import { calculateReadingSummary, getValidReadings, normalizeReadingValues } from '../utils/reportMetrics';

interface ReportsScreenProps {
  onNavigate: (screen: 'dashboard') => void;
}

const rangeOptions: Array<{ value: ReadingRange; label: string }> = [
  { value: '24h', label: '24 Jam' },
  { value: '7d', label: '7 Hari' },
];

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onNavigate }) => {
  const insets = useSafeAreaInsets();
  const tanks = useTankStore((state) => state.tanks);
  const { selectedTankId, range, readings, isLoading, error, selectTank, setRange, fetchReadings } =
    useReportStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (tanks.length > 0 && !selectedTankId) selectTank(tanks[0].id);
  }, [selectedTankId, selectTank, tanks]);

  useEffect(() => {
    if (selectedTankId) fetchReadings();
  }, [fetchReadings, range, selectedTankId]);

  const validReadings = useMemo(() => getValidReadings(readings), [readings]);
  const values = useMemo(() => normalizeReadingValues(readings), [readings]);
  const summary = useMemo(() => calculateReadingSummary(readings), [readings]);
  const selectedTank = tanks.find((tank) => tank.id === selectedTankId);

  const refresh = async () => {
    setRefreshing(true);
    await fetchReadings();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
    >
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.title}>Tren Riwayat & Laporan</Text>
          <Text style={styles.subtitle}>Pergerakan level air berdasarkan pembacaan sensor.</Text>
        </View>
        <Badge text={range === '24h' ? '24 JAM' : '7 HARI'} variant="info" />
      </View>

      <Text style={styles.sectionLabel}>Pilih Tangki</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tankOptions}>
        {tanks.map((tank) => (
          <TouchableOpacity
            key={tank.id}
            style={[styles.tankOption, tank.id === selectedTankId && styles.tankOptionActive]}
            onPress={() => selectTank(tank.id)}
          >
            <Text style={[styles.tankOptionText, tank.id === selectedTankId && styles.tankOptionTextActive]}>
              {tank.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.rangeRow}>
        {rangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.rangeButton, range === option.value && styles.rangeButtonActive]}
            onPress={() => setRange(option.value)}
            accessibilityState={{ selected: range === option.value }}
          >
            <Text style={[styles.rangeText, range === option.value && styles.rangeTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTank && <Text style={styles.selectedLabel}>{selectedTank.name}</Text>}
      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {isLoading && !refreshing && (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.stateText}>Memuat riwayat pembacaan...</Text>
        </View>
      )}

      {!isLoading && !error && validReadings.length === 0 && (
        <EmptyState
          icon="bar-chart-2"
          title="Belum ada riwayat pembacaan"
          description="Belum tersedia data sensor untuk rentang waktu ini."
        />
      )}

      {!isLoading && validReadings.length > 0 && (
        <>
          <View style={styles.metricsRow}>
            <Metric label="Terakhir" value={summary.latest} />
            <Metric label="Minimum" value={summary.minimum} />
            <Metric label="Maksimum" value={summary.maximum} />
            <Metric label="Rata-rata" value={summary.average} />
          </View>
          <Card>
            <Text style={styles.cardTitle}>Tren Level Air</Text>
            <View style={styles.chart} accessibilityLabel="Sparkline tren level air">
              {values.map((value, index) => (
                <View key={`${validReadings[index].id}-${index}`} style={styles.chartColumn}>
                  <View style={[styles.chartBar, { height: `${Math.max(value, 4)}%` }]} />
                </View>
              ))}
            </View>
            <View style={styles.chartLegend}>
              <Text style={styles.legendText}>Rendah</Text>
              <Text style={styles.legendText}>Tinggi</Text>
            </View>
            <Text style={styles.readingCount}>{validReadings.length} pembacaan valid</Text>
          </Card>
        </>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('dashboard')}>
        <Feather name="arrow-left" size={15} color={COLORS.textSecondary} />
        <Text style={styles.backText}>Kembali ke Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Metric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.metric}>
    <Text style={styles.metricValue}>{value.toFixed(1)}%</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  headingText: { flex: 1, marginRight: 8 },
  title: { color: COLORS.heading, fontSize: 20, fontWeight: '800' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 4 },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  tankOptions: { gap: 8, paddingBottom: 4 },
  tankOption: { minHeight: 44, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: COLORS.surface, justifyContent: 'center' },
  tankOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tankOptionText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  tankOptionTextActive: { color: COLORS.textOnPrimary },
  rangeRow: { flexDirection: 'row', gap: 8, marginVertical: 14 },
  rangeButton: { flex: 1, minHeight: 44, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  rangeButtonActive: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primarySoft },
  rangeText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 13 },
  rangeTextActive: { color: COLORS.textOnPrimary },
  selectedLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 10 },
  stateBox: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: 32, marginBottom: 14 },
  stateText: { color: COLORS.textSecondary, marginTop: 10, textAlign: 'center' },
  metricsRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  metric: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 10, alignItems: 'center' },
  metricValue: { color: COLORS.primary, fontSize: 14, fontWeight: '800' },
  metricLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 4 },
  cardTitle: { color: COLORS.heading, fontSize: 16, fontWeight: '700', marginBottom: 16 },
  chart: { height: 150, flexDirection: 'row', alignItems: 'flex-end', gap: 2, borderBottomWidth: 1, borderLeftWidth: 1, borderColor: COLORS.borderStrong, paddingHorizontal: 4 },
  chartColumn: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  chartBar: { width: '100%', minHeight: 4, backgroundColor: COLORS.primarySoft, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  chartLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendText: { color: COLORS.textMuted, fontSize: 10 },
  readingCount: { color: COLORS.textSecondary, fontSize: 11, marginTop: 12, textAlign: 'center' },
  backButton: { flexDirection: 'row', gap: 6, minHeight: 44, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  backText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 13 },
});
