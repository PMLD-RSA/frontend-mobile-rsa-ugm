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
import { ENV } from '../config/env';
import { useDeviceStore } from '../stores/deviceStore';
import { useTankStore } from '../stores/tankStore';
import { SensorNode } from '../types';
import {
  formatDeviceTime,
  getSignalQuality,
  isGatewayOnline,
  SignalLevel,
} from '../utils/deviceSignal';

type DeviceFilter = 'ALL' | 'ACTIVE' | 'WEAK' | 'OFFLINE';

interface DevicesScreenProps {
  onNavigate: (screen: 'dashboard') => void;
}

export const DevicesScreen: React.FC<DevicesScreenProps> = ({ onNavigate }) => {
  const insets = useSafeAreaInsets();
  const { gateways, nodes, isLoading, error, lastUpdated, fetchDevices, clearError } =
    useDeviceStore();
  const tanks = useTankStore((state) => state.tanks);

  const [filter, setFilter] = useState<DeviceFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
  }, [fetchDevices]);

  // Primary Gateway (RPi Hub)
  const primaryGateway = gateways[0] || null;
  const isGwOnline = isGatewayOnline(primaryGateway);

  // Mapping nama tangki jika node belum membawa tankName
  const getTankNameForNode = (node: SensorNode): string => {
    if (node.tankName) return node.tankName;
    if (node.tankId) {
      const matched = tanks.find((t) => t.id === node.tankId);
      if (matched) return matched.name;
    }
    return 'Tangki Belum Ditentukan';
  };

  // Filter nodes berdasarkan status dan sinyal
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const isOffline = node.status !== 'active';
      const signal = getSignalQuality(node.lastRssi, isOffline);

      if (filter === 'ACTIVE') return node.status === 'active';
      if (filter === 'WEAK') return signal.level === 'poor' || signal.level === 'fair';
      if (filter === 'OFFLINE') return isOffline;
      return true;
    });
  }, [nodes, filter]);

  // Ringkasan metrik
  const metrics = useMemo(() => {
    let activeCount = 0;
    let weakCount = 0;
    let offlineCount = 0;

    nodes.forEach((node) => {
      if (node.status === 'active') {
        activeCount += 1;
        const sig = getSignalQuality(node.lastRssi, false);
        if (sig.level === 'poor' || sig.level === 'fair') {
          weakCount += 1;
        }
      } else {
        offlineCount += 1;
      }
    });

    return { total: nodes.length, active: activeCount, weak: weakCount, offline: offlineCount };
  }, [nodes]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0a354c']} />
      }
    >
      {/* 1. Header Judul & Badge Ringkas */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryText}>
          <Text style={styles.title}>Perangkat & Jaringan</Text>
          <Text style={styles.subtitle}>
            Monitoring modul LoRa STM32 & Raspberry Pi Hub.
          </Text>
        </View>
        <Badge
          text={isGwOnline ? 'Hub Online' : 'Hub Offline'}
          variant={isGwOnline ? 'success' : 'critical'}
        />
      </View>

      {/* 2. Kartu Gateway Hub (Raspberry Pi Gateway) */}
      <Card style={styles.gatewayCard}>
        <View style={styles.cardHeader}>
          <View style={styles.gatewayIconContainer}>
            <Text style={styles.gatewayIcon}>📡</Text>
          </View>
          <View style={styles.gatewayTitleCol}>
            <Text style={styles.gatewayDeviceCode}>
              {primaryGateway?.deviceCode || 'GW-HUB-01'}
            </Text>
            <Text style={styles.gatewaySubtitle}>
              Raspberry Pi Gateway Hub • Sentral LoRa
            </Text>
          </View>
          <Badge
            text={primaryGateway?.status?.toUpperCase() || (isGwOnline ? 'ONLINE' : 'OFFLINE')}
            variant={isGwOnline ? 'success' : 'critical'}
          />
        </View>

        <View style={styles.gatewayDivider} />

        <View style={styles.gatewayMetaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Detak Terakhir (Heartbeat)</Text>
            <Text style={styles.metaValue}>
              {formatDeviceTime(primaryGateway?.lastHeartbeat)}
            </Text>
          </View>
          <View style={styles.metaItemRight}>
            <Text style={styles.metaLabel}>Node Terkoneksi</Text>
            <Text style={styles.metaValue}>{nodes.length} Sensor Node</Text>
          </View>
        </View>
      </Card>

      {/* 3. Grid Ringkasan Status Sinyal & Node */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricNumber}>{metrics.total}</Text>
          <Text style={styles.metricLabel}>Total Sensor</Text>
        </View>
        <View style={[styles.metricBox, styles.metricBoxGreen]}>
          <Text style={[styles.metricNumber, { color: '#065f46' }]}>
            {metrics.active}
          </Text>
          <Text style={styles.metricLabel}>Aktif</Text>
        </View>
        <View style={[styles.metricBox, styles.metricBoxAmber]}>
          <Text style={[styles.metricNumber, { color: '#92400e' }]}>
            {metrics.weak}
          </Text>
          <Text style={styles.metricLabel}>Perlu Cek</Text>
        </View>
        <View style={[styles.metricBox, styles.metricBoxRed]}>
          <Text style={[styles.metricNumber, { color: '#991b1b' }]}>
            {metrics.offline}
          </Text>
          <Text style={styles.metricLabel}>Terputus</Text>
        </View>
      </View>

      {/* 4. Filter Tab Bar */}
      <View style={styles.filterRow}>
        {(
          [
            { key: 'ALL', label: 'Semua' },
            { key: 'ACTIVE', label: 'Aktif' },
            { key: 'WEAK', label: 'Sinyal Lemah' },
            { key: 'OFFLINE', label: 'Terputus' },
          ] as { key: DeviceFilter; label: string }[]
        ).map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}
            onPress={() => setFilter(item.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === item.key }}
          >
            <Text
              style={[
                styles.filterText,
                filter === item.key && styles.filterTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 5. Error State */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              clearError();
              fetchDevices();
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 6. Loading State */}
      {isLoading && !refreshing && (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#0a354c" />
          <Text style={styles.stateText}>Memindai status perangkat lapangan...</Text>
        </View>
      )}

      {/* 7. Empty State */}
      {!isLoading && filteredNodes.length === 0 && (
        <View style={styles.stateBox}>
          <Text style={styles.emptyIcon}>📶</Text>
          <Text style={styles.emptyTitle}>Tidak ada perangkat ditemukan</Text>
          <Text style={styles.stateText}>
            Tidak ada modul sensor node yang cocok dengan filter yang dipilih.
          </Text>
        </View>
      )}

      {/* 8. Daftar Kartu Sensor Node LoRa STM32 */}
      {filteredNodes.map((node) => {
        const isOffline = node.status !== 'active';
        const signal = getSignalQuality(node.lastRssi, isOffline);
        const tankName = getTankNameForNode(node);

        return (
          <Card key={node.id} style={styles.nodeCard}>
            <View style={styles.nodeHeader}>
              <View style={styles.nodeTitleCol}>
                <View style={styles.nodeCodeBadgeRow}>
                  <Text style={styles.nodeCode}>{node.deviceCode}</Text>
                  <View style={styles.sensorTypePill}>
                    <Text style={styles.sensorTypeText}>
                      {node.sensorType?.toUpperCase() || 'ULTRASONIC'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.nodeTankName}>📍 {tankName}</Text>
              </View>

              <Badge
                text={node.status === 'active' ? 'AKTIF' : node.status?.toUpperCase() || 'OFFLINE'}
                variant={node.status === 'active' ? 'success' : 'critical'}
              />
            </View>

            {/* Sinyal LoRa Box */}
            <View style={styles.signalContainer}>
              <View style={styles.signalLeft}>
                <Text style={styles.signalHeading}>Sinyal Radio LoRa</Text>
                <View style={styles.signalDetailsRow}>
                  {/* Visual Bar Sinyal */}
                  <View style={styles.signalBars}>
                    {[1, 2, 3, 4].map((barIdx) => {
                      const isBarActive = barIdx <= signal.bars;
                      return (
                        <View
                          key={barIdx}
                          style={[
                            styles.signalBar,
                            { height: 6 + barIdx * 4 },
                            isBarActive
                              ? { backgroundColor: signal.color }
                              : styles.signalBarInactive,
                          ]}
                        />
                      );
                    })}
                  </View>

                  <Text style={styles.rssiValue}>
                    {node.lastRssi != null ? `${node.lastRssi} dBm` : 'N/A'}
                  </Text>
                </View>
              </View>

              <Badge
                text={signal.label}
                variant={signal.badgeVariant}
                showDot={false}
              />
            </View>

            {/* Footer Transmisi Terakhir */}
            <View style={styles.nodeFooter}>
              <Text style={styles.footerLabel}>
                Terakhir Dilihat:{' '}
                <Text style={styles.footerValue}>
                  {formatDeviceTime(node.lastSeen)}
                </Text>
              </Text>
              <Text style={styles.gatewayTag}>
                Hub: {node.gatewayCode || primaryGateway?.deviceCode || 'GW-HUB-01'}
              </Text>
            </View>
          </Card>
        );
      })}

      {/* 9. Kartu Info Endpoint Jaringan */}
      <Card style={styles.networkInfoCard}>
        <Text style={styles.networkInfoTitle}>Informasi Jaringan & Endpoint</Text>
        <View style={styles.networkRow}>
          <Text style={styles.networkLabel}>Web BFF API:</Text>
          <Text style={styles.networkValue} numberOfLines={1}>
            {ENV.BFF_URL}
          </Text>
        </View>
        <View style={styles.networkRow}>
          <Text style={styles.networkLabel}>WebSocket Realtime:</Text>
          <Text style={styles.networkValue} numberOfLines={1}>
            {ENV.WS_URL}
          </Text>
        </View>
        {lastUpdated && (
          <View style={styles.networkRow}>
            <Text style={styles.networkLabel}>Pembaruan Terakhir:</Text>
            <Text style={styles.networkValue}>
              {new Date(lastUpdated).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </Text>
          </View>
        )}
      </Card>

      {/* 10. Tombol Kembali */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => onNavigate('dashboard')}
      >
        <Text style={styles.backText}>← Kembali ke Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryText: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  gatewayCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gatewayIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gatewayIcon: {
    fontSize: 22,
  },
  gatewayTitleCol: {
    flex: 1,
  },
  gatewayDeviceCode: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  gatewaySubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  gatewayDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  gatewayMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
  },
  metaItemRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    alignItems: 'center',
  },
  metricBoxGreen: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  metricBoxAmber: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  metricBoxRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#0a354c',
    borderColor: '#0a354c',
  },
  filterText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#991b1b',
    flex: 1,
    fontSize: 12,
    marginRight: 8,
  },
  retryButton: {
    minHeight: 40,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  stateBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 32,
    marginBottom: 14,
  },
  stateText: {
    color: '#64748b',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  nodeCard: {
    padding: 16,
    marginBottom: 12,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nodeTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  nodeCodeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nodeCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  sensorTypePill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sensorTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },
  nodeTankName: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
  },
  signalContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalLeft: {
    flex: 1,
  },
  signalHeading: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  signalDetailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 22,
    paddingBottom: 2,
  },
  signalBar: {
    width: 4.5,
    borderRadius: 2,
  },
  signalBarInactive: {
    backgroundColor: '#cbd5e1',
  },
  rssiValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  nodeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  footerValue: {
    color: '#1e293b',
    fontWeight: '700',
  },
  gatewayTag: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  networkInfoCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 6,
  },
  networkInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  networkLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  networkValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0a354c',
    maxWidth: '65%',
  },
  backButton: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  backText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
  },
});
