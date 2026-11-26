import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MetricsOverview } from '../components/MetricsOverview';
import { TankCard } from '../components/TankCard';
import { useTankStore } from '../stores/tankStore';
import { ENV } from '../config/env';
import {
  sortTanksBySeverity,
  calculateMetricsOverview,
} from '../utils/tankMetrics';

/**
 * HomeScreen (Dashboard Overview) sesuai Spesifikasi design.md § 5.2
 * - Lokasi: Sekolah Vokasi UGM (DTEDI, DLIKES, DTK)
 * - 4 Grid KPI Metric Cards
 * - Live Sync Badge (#0F172A, #34D399)
 * - Auto-sort by severity (CRITICAL -> WARNING -> NORMAL)
 */
export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const { tanks, isLoading, error, fetchTanks } = useTankStore();

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTanks();
    setRefreshing(false);
  }, [fetchTanks]);

  // Perhitungan 4 Grid KPI Metrik via helper murni tankMetrics
  const metrics = useMemo(
    () => calculateMetricsOverview(tanks),
    [tanks]
  );

  // Auto-Sort by Severity sesuai PRD-Mobile.md § 4.1 & design.md § 5.2
  const sortedTanks = useMemo(() => sortTanksBySeverity(tanks), [tanks]);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 24),
        paddingHorizontal: 16,
        paddingTop: 16,
      }}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#0a3f5c']}
          tintColor="#0a3f5c"
        />
      }
    >
      {/* 1. Header Banner & Live Sync Status Capsule */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.title}>Pemantauan Tangki SV UGM</Text>
          <Text style={styles.subtitle}>
            Zonasi DTEDI • DLIKES • DTK • Reservoir SV
          </Text>
        </View>

        {/* Live Sync Badge sesuai design.md § 4.4 */}
        <View
          style={[
            styles.liveSyncBadge,
            error ? styles.liveSyncBadgeError : null,
          ]}
        >
          <View
            style={[
              styles.liveDot,
              error ? styles.liveDotError : styles.liveDotSuccess,
            ]}
          />
          <Text
            style={[
              styles.liveSyncText,
              error ? styles.liveSyncTextError : null,
            ]}
          >
            {error ? 'BFF Offline' : '• LIVE UPDATE'}
          </Text>
        </View>
      </View>

      {/* 2. Error Banner jika koneksi ke Web BFF gagal */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity
            onPress={() => fetchTanks()}
            style={styles.retryBtn}
            activeOpacity={0.7}
            accessibilityLabel="Coba sambungkan kembali ke Web BFF"
          >
            <Text style={styles.retryBtnText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Ringkasan Metrik Dashboard (4 Grid KPI sesuai design.md § 5.2) */}
      <MetricsOverview
        tanksCount={tanks.length}
        criticalAlertsCount={metrics.criticalAlertsCount}
        tanksOnlineCount={metrics.tanksOnlineCount}
        pumpsActiveCount={metrics.pumpsActiveCount}
        averageLevelPercent={metrics.averageLevelPercent}
        activeAlertsCount={metrics.activeAlertsCount}
      />

      {/* 4. Section Heading: Daftar Tangki */}
      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>Daftar Unit Tangki</Text>
        <Text style={styles.sectionSubHeading}>
          {sortedTanks.length} Tangki Terdaftar
        </Text>
      </View>

      {/* State Loading Indikator */}
      {isLoading && !refreshing && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0a3f5c" />
          <Text style={styles.loadingText}>Menghubungkan ke Web BFF...</Text>
          <Text style={styles.loadingSub}>{ENV.BFF_URL}</Text>
        </View>
      )}

      {/* State Kosong (Empty State) */}
      {!isLoading && sortedTanks.length === 0 && !error && (
        <View style={styles.emptyBox}>
          <Ionicons name="water-outline" size={44} color="#0077B6" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>Belum Ada Data Tangki</Text>
          <Text style={styles.emptySub}>
            Tangki belum terdaftar di database Sekolah Vokasi UGM atau belum ada data yang dikirim dari modul LoRa.
          </Text>
          <TouchableOpacity
            onPress={() => fetchTanks()}
            style={styles.emptyReloadBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.emptyReloadText}>Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5. Daftar Kartu Tangki (Terurut berdasarkan Tingkat Keparahan) */}
      {sortedTanks.map((tank) => (
        <TankCard key={tank.id} tank={tank} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f1f1', // Surface Gray sesuai design.md § 2.1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleBox: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a', // Dark Capsule sesuai design.md § 4.4
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 6,
  },
  liveSyncBadgeError: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveDotSuccess: {
    backgroundColor: '#34d399',
  },
  liveDotError: {
    backgroundColor: '#ef4444',
  },
  liveSyncText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
    letterSpacing: 0.3,
  },
  liveSyncTextError: {
    color: '#dc2626',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 13,
    flex: 1,
    marginRight: 10,
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    minHeight: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  sectionSubHeading: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 11,
    color: '#64748b',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 10,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyReloadBtn: {
    backgroundColor: '#0a3f5c',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyReloadText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
