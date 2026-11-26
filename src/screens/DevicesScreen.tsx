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
import { ENV } from '../config/env';
import { useDeviceStore } from '../stores/deviceStore';
import { useTankStore } from '../stores/tankStore';
import { COLORS, RADIUS } from '../theme/tokens';
import { SensorNode } from '../types';
import {
  formatDeviceTime,
  getSignalQuality,
  isGatewayOnline,
  SignalLevel,
} from '../utils/deviceSignal';

type DeviceFilter = 'ALL' | 'ACTIVE' | 'WEAK' | 'OFFLINE';

export const DevicesScreen: React.FC = () => {
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
  const getTankNameForNode = useCallback(
    (node: SensorNode): string => {
      if (node.tankName) return node.tankName;
      if (node.tankId) {
        const matched = tanks.find((t) => t.id === node.tankId);
        if (matched) return matched.name;
      }
      return 'Tangki Belum Ditentukan';
    },
    [tanks]
  );

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

  const renderNodeItem = useCallback(
    ({ item: node }: { item: SensorNode }) => {
      const isOffline = node.status !== 'active';
      const signal = getSignalQuality(node.lastRssi, isOffline);
      const tankName = getTankNameForNode(node);

      return (
        <Card style={styles.nodeCard}>
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
              <View style={styles.nodeTankRow}>
                <Feather name="map-pin" size={12} color={COLORS.textMuted} />
                <Text style={styles.nodeTankName}>{tankName}</Text>
              </View>
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
    },
    [getTankNameForNode, primaryGateway?.deviceCode]
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
      data={isLoading && !refreshing ? [] : filteredNodes}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderNodeItem}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={5}
      removeClippedSubviews={Platform.OS === 'android'}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
      }
      ListHeaderComponent={
        <>
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
                <Feather name="radio" size={22} color={COLORS.primary} />
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
            <ErrorBanner
              message={error}
              onRetry={() => {
                clearError();
                fetchDevices();
              }}
            />
          )}

          {/* 6. Loading Skeleton */}
          {isLoading && !refreshing && <SkeletonList variant="list" count={3} />}
        </>
      }
      ListEmptyComponent={
        !isLoading ? (
          <EmptyState
            icon="wifi-off"
            title="Tidak ada perangkat ditemukan"
            description="Tidak ada modul sensor node yang cocok dengan filter yang dipilih."
          />
        ) : undefined
      }
      ListFooterComponent={
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
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.heading,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  gatewayCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gatewayIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gatewayTitleCol: {
    flex: 1,
  },
  gatewayDeviceCode: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.heading,
  },
  gatewaySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  gatewayDivider: {
    height: 1,
    backgroundColor: COLORS.border,
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
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  metricBoxGreen: {
    backgroundColor: COLORS.normalBg,
    borderColor: '#a7f3d0',
  },
  metricBoxAmber: {
    backgroundColor: COLORS.warningBg,
    borderColor: '#fde68a',
  },
  metricBoxRed: {
    backgroundColor: COLORS.criticalBg,
    borderColor: '#fecaca',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.heading,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: COLORS.textOnPrimary,
  },
  stateBox: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 32,
    marginBottom: 14,
  },
  stateText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
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
    color: COLORS.heading,
  },
  sensorTypePill: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  sensorTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  nodeTankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  nodeTankName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  signalContainer: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.borderStrong,
  },
  rssiValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  nodeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  footerValue: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  gatewayTag: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  networkInfoCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    padding: 14,
    marginTop: 6,
  },
  networkInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
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
    color: COLORS.textMuted,
  },
  networkValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    maxWidth: '65%',
  },
});
