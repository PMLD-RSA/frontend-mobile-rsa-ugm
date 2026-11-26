import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { MetricsOverview } from '../components/MetricsOverview';
import { TankCard } from '../components/TankCard';
import { useTankStore } from '../stores/tankStore';
import { ENV } from '../config/env';
import { COLORS, RADIUS } from '../theme/tokens';
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

  const { totalCapacity, totalWater, activeAlertsCount } = useMemo(
    () => calculateMetricsOverview(tanks),
    [tanks]
  );

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
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Sub Header & Status Koneksi Web BFF */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.title}>Pemantauan Tangki</Text>
          <Text style={styles.subtitle}>Data telemetri langsung via Web BFF</Text>
        </View>
        <Badge
          text={error ? 'BFF Offline' : 'BFF Terhubung'}
          variant={error ? 'critical' : 'success'}
        />
      </View>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => fetchTanks()}
        />
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
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Menghubungkan ke Web BFF...</Text>
          <Text style={styles.loadingSub}>{ENV.BFF_URL}</Text>
        </View>
      )}

      {/* State Kosong (Empty State) */}
      {!isLoading && sortedTanks.length === 0 && !error && (
        <EmptyState
          icon="droplet"
          title="Belum Ada Data Tangki"
          description="Tangki belum terdaftar di database rumah sakit atau belum ada data yang dikirim dari sensor."
          actionLabel="Muat Ulang"
          onAction={() => fetchTanks()}
        />
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
    backgroundColor: COLORS.background,
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
    color: COLORS.heading,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 10,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
