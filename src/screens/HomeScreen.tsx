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
import { Badge } from '../components/Card';
import { MetricsOverview } from '../components/MetricsOverview';
import { TankCard } from '../components/TankCard';
import { useTankStore } from '../stores/tankStore';
import { ENV } from '../config/env';
import {
  sortTanksBySeverity,
  calculateMetricsOverview,
} from '../utils/tankMetrics';

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

  // Perhitungan ringkasan tangki via helper murni
  const { totalCapacity, totalWater, activeAlertsCount } = useMemo(
    () => calculateMetricsOverview(tanks),
    [tanks]
  );

  // Auto-Sort by Severity sesuai PRD-Mobile.md § 4.1
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
          colors={['#0a354c']}
          tintColor="#0a354c"
        />
      }
    >
      {/* Sub Header & Status Koneksi Web BFF */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.title}>Pemantauan Tangki</Text>
          <Text style={styles.subtitle}>Data live via Web BFF (:3000)</Text>
        </View>
        <Badge
          text={error ? 'BFF Offline' : 'BFF Terhubung'}
          variant={error ? 'critical' : 'success'}
        />
      </View>

      {/* Error Banner jika koneksi ke Web BFF gagal */}
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

      {/* Ringkasan Metrik Dashboard */}
      <MetricsOverview
        tanksCount={tanks.length}
        totalCapacity={totalCapacity}
        totalWater={totalWater}
        activeAlertsCount={activeAlertsCount}
      />

      {/* State Loading Indikator */}
      {isLoading && !refreshing && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0a354c" />
          <Text style={styles.loadingText}>Menghubungkan ke Web BFF...</Text>
          <Text style={styles.loadingSub}>{ENV.BFF_URL}</Text>
        </View>
      )}

      {/* State Kosong (Empty State) */}
      {!isLoading && sortedTanks.length === 0 && !error && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>💧</Text>
          <Text style={styles.emptyTitle}>Belum Ada Data Tangki</Text>
          <Text style={styles.emptySub}>
            Tangki belum terdaftar di database rumah sakit atau belum ada data yang dikirim dari sensor.
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

      {/* Daftar Kartu Tangki (Terurut berdasarkan Tingkat Keparahan) */}
      {sortedTanks.map((tank) => (
        <TankCard key={tank.id} tank={tank} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
    minHeight: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
    marginTop: 14,
    fontSize: 14,
    color: '#0a354c',
    fontWeight: '700',
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 280,
  },
  emptyReloadBtn: {
    backgroundColor: '#0a354c',
    paddingHorizontal: 20,
    minHeight: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyReloadText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
