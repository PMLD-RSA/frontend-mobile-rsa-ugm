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
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from './src/components/Card';
import { MobileSidebar } from './src/components/Sidebar';
import { Tank } from './src/types';
import { fetchTanksApi } from './src/services/api';
import { useAuthStore, API_BASE_URL } from './src/stores/authStore';

function MainScreen() {
  const insets = useSafeAreaInsets();
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const user = useAuthStore((s) => s.user);

  const loadData = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage(null);

    try {
      const data = await fetchTanksApi();
      setTanks(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Gagal memuat data dari server VPS';
      setErrorMessage(msg);
      console.error('Error fetching tanks from VPS:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Perhitungan ringkasan tangki
  const totalCapacity = tanks.reduce((acc, t) => acc + Number(t.capacityLiters || 0), 0);
  const totalWater = tanks.reduce((acc, t) => acc + Number(t.latestReading?.volumeLiters || 0), 0);
  const activeAlertsCount = tanks.filter((t) => t.activeAlert != null).length;

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Top Header matching Figma */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          onPress={() => setIsDrawerOpen(true)}
          style={styles.menuBtn}
          accessibilityLabel="Buka menu"
        >
          <Text style={styles.menuIcon}>≡</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitleMain}>Dashboard Overview</Text>
          <Text style={styles.headerTitleSub}>RSA UGM • SI-POTA v1.0</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsDrawerOpen(true)}
          style={styles.profileBtn}
          accessibilityLabel="Profil pengguna"
        >
          <Text style={styles.profileIcon}>{user ? '👤' : '⚙️'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={['#0a354c']}
            tintColor="#0a354c"
          />
        }
      >
        {/* Sub Header & VPS Status */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Pemantauan Tangki</Text>
            <Text style={styles.subtitle}>Data Sensor Live (VPS Core)</Text>
          </View>
          <Badge
            text={errorMessage ? 'VPS Offline' : 'VPS Connected'}
            variant={errorMessage ? 'critical' : 'success'}
          />
        </View>

        {/* Error Banner jika gagal koneksi */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            <TouchableOpacity onPress={() => loadData()} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ringkasan Metrik Dashboard */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Tangki</Text>
            <Text style={styles.metricValue}>{tanks.length}</Text>
            <Text style={styles.metricSub}>Kapasitas {(totalCapacity / 1000).toFixed(0)}k L</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Air Tertampung</Text>
            <Text style={styles.metricValue}>{(totalWater / 1000).toFixed(1)}k L</Text>
            <Text style={styles.metricSub}>
              {totalCapacity > 0 ? ((totalWater / totalCapacity) * 100).toFixed(0) : 0}% Kapasitas
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Peringatan Aktif</Text>
            <Text style={[styles.metricValue, { color: activeAlertsCount > 0 ? '#b45309' : '#166534' }]}>
              {activeAlertsCount}
            </Text>
            <Text style={styles.metricSub}>
              {activeAlertsCount > 0 ? 'Perlu dicek' : 'Kondisi aman'}
            </Text>
          </View>
        </View>

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0a354c" />
            <Text style={styles.loadingText}>Menghubungkan ke Backend VPS...</Text>
            <Text style={styles.loadingSub}>{API_BASE_URL}</Text>
          </View>
        ) : (
          tanks.map((tank) => {
            const level = Number(tank.latestReading?.levelPercent || 0);
            const volume = Number(tank.latestReading?.volumeLiters || 0);
            const capacity = Number(tank.capacityLiters || 0);
            const minThreshold = Number(tank.minThresholdPercent || 30);
            const maxThreshold = Number(tank.maxThresholdPercent || 90);

            // Kategori status PRD:
            // < minThreshold (30%) = CRITICAL (Merah)
            // 30% - 60% = WARNING (Kuning)
            // > 60% = NORMAL (Hijau)
            let variant: 'success' | 'warning' | 'critical' = 'success';
            let statusText = 'NORMAL';
            let barColor = '#10b981';

            if (level < minThreshold) {
              variant = 'critical';
              statusText = 'CRITICAL';
              barColor = '#ef4444';
            } else if (level <= 60) {
              variant = 'warning';
              statusText = 'WARNING';
              barColor = '#f59e0b';
            }

            return (
              <Card key={tank.id}>
                {/* Header Kartu Tangki */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.tankName}>{tank.name}</Text>
                    <Text style={styles.location}>📍 {tank.location || 'Lokasi belum disetel'}</Text>
                  </View>
                  <Badge text={statusText} variant={variant} />
                </View>

                {/* Banner Peringatan Aktif */}
                {tank.activeAlert && (
                  <View style={styles.alertBanner}>
                    <Text style={styles.alertText}>
                      ⚠️ {tank.activeAlert.message}
                    </Text>
                  </View>
                )}

                {/* Indikator Level Air & Progress Bar */}
                <View style={styles.levelContainer}>
                  <View style={styles.levelRow}>
                    <Text style={[styles.levelText, { color: barColor }]}>
                      {level.toFixed(0)}%
                    </Text>
                    <View style={styles.volumeBox}>
                      <Text style={styles.volumeText}>
                        {volume.toLocaleString('id-ID')} L
                      </Text>
                      <Text style={styles.volumeSub}>VOLUME AKTUAL</Text>
                    </View>
                  </View>

                  {/* Progress Bar Visualizer */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(Math.max(level, 0), 100)}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Detail Ambang Batas & Sensor Node */}
                <View style={styles.footer}>
                  <View>
                    <Text style={styles.footerLabel}>Kapasitas Total</Text>
                    <Text style={styles.footerValue}>{(capacity / 1000).toFixed(1)}k Liter</Text>
                  </View>
                  <View>
                    <Text style={styles.footerLabel}>Ambang Batas</Text>
                    <Text style={styles.footerValue}>
                      {minThreshold}% - {maxThreshold}%
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.footerLabel}>Modul Sensor</Text>
                    <Text style={styles.footerValue}>
                      {tank.nodes?.[0]?.deviceCode || 'STM32'}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Drawer Overlay */}
      <MobileSidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a354c',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuBtn: {
    padding: 6,
  },
  menuIcon: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitleMain: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitleSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  profileBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileIcon: {
    fontSize: 16,
  },
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 10,
    color: '#94a3b8',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tankName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  location: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 3,
  },
  alertBanner: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  alertText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  levelContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    borderRadius: 10,
    marginVertical: 14,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  volumeBox: {
    alignItems: 'flex-end',
  },
  volumeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  volumeSub: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  footerLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 2,
  },
});
