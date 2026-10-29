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
import { Badge, Card } from '../components/Card';
import { useReportStore } from '../stores/reportStore';
import { useTankStore } from '../stores/tankStore';
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#0a354c']} />}
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
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && !refreshing && (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#0a354c" />
          <Text style={styles.stateText}>Memuat riwayat pembacaan...</Text>
        </View>
      )}

      {!isLoading && !error && validReadings.length === 0 && (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>Belum ada riwayat pembacaan</Text>
          <Text style={styles.stateText}>Belum tersedia data sensor untuk rentang waktu ini.</Text>
        </View>
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
        <Text style={styles.backText}>← Kembali ke Dashboard</Text>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  headingText: { flex: 1, marginRight: 8 },
  title: { color: '#0f172a', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: 13, lineHeight: 18, marginTop: 4 },
  sectionLabel: { color: '#334155', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  tankOptions: { gap: 8, paddingBottom: 4 },
  tankOption: { minHeight: 44, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff', justifyContent: 'center' },
  tankOptionActive: { backgroundColor: '#0a354c', borderColor: '#0a354c' },
  tankOptionText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  tankOptionTextActive: { color: '#fff' },
  rangeRow: { flexDirection: 'row', gap: 8, marginVertical: 14 },
  rangeButton: { flex: 1, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  rangeButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  rangeText: { color: '#475569', fontWeight: '700', fontSize: 13 },
  rangeTextActive: { color: '#fff' },
  selectedLabel: { color: '#64748b', fontSize: 12, marginBottom: 10 },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center' },
  errorText: { color: '#991b1b', flex: 1, fontSize: 12, marginRight: 8 },
  retryButton: { minHeight: 44, backgroundColor: '#dc2626', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 12 },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stateBox: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', padding: 32, marginBottom: 14 },
  stateText: { color: '#64748b', marginTop: 10, textAlign: 'center' },
  emptyTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
  metricsRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  metric: { flex: 1, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 10, alignItems: 'center' },
  metricValue: { color: '#0a354c', fontSize: 14, fontWeight: '800' },
  metricLabel: { color: '#64748b', fontSize: 10, marginTop: 4 },
  cardTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  chart: { height: 150, flexDirection: 'row', alignItems: 'flex-end', gap: 2, borderBottomWidth: 1, borderLeftWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 4 },
  chartColumn: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  chartBar: { width: '100%', minHeight: 4, backgroundColor: '#2563eb', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  chartLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendText: { color: '#94a3b8', fontSize: 10 },
  readingCount: { color: '#64748b', fontSize: 11, marginTop: 12, textAlign: 'center' },
  backButton: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  backText: { color: '#334155', fontWeight: '700' },
});
