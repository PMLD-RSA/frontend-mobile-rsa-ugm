import React, { useEffect, useState, useCallback } from 'react';
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

  // Perhitungan ringkasan tangki
  const totalCapacity = tanks.reduce((acc, t) => acc + Number(t.capacityLiters || 0), 0);
  const totalWater = tanks.reduce((acc, t) => acc + Number(t.latestReading?.volumeLiters || 0), 0);
  const activeAlertsCount = tanks.filter((t) => t.activeAlert != null).length;

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
      style={styles.container}
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
        <View>
          <Text style={styles.title}>Pemantauan Tangki</Text>
          <Text style={styles.subtitle}>Data via Web BFF (:3000)</Text>
        </View>
        <Badge
          text={error ? 'BFF Offline' : 'BFF Connected'}
          variant={error ? 'critical' : 'success'}
        />
      </View>

      {/* Error Banner jika gagal koneksi ke Web BFF */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={() => fetchTanks()} style={styles.retryBtn}>
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

      {/* Loading Indicator */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0a354c" />
          <Text style={styles.loadingText}>Menghubungkan ke Web BFF...</Text>
          <Text style={styles.loadingSub}>{ENV.BFF_URL}</Text>
        </View>
      ) : (
        tanks.map((tank) => <TankCard key={tank.id} tank={tank} />)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
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
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  retryBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#0a354c',
    fontWeight: '600',
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 11,
    color: '#94a3b8',
  },
});
