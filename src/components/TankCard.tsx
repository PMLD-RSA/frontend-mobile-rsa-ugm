import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Badge } from './Card';
import { Tank } from '../types';
import { getTankStatusCategory, formatKiloLiters } from '../utils/tankMetrics';

interface TankCardProps {
  tank: Tank;
}

/**
 * Kartu Tangki Air sesuai Spesifikasi Desain design.md § 4.5 & § 5.2:
 * - Menampilkan nama tangki (DTEDI, DLIKES, DTK) & lokasi spesifik di SV UGM
 * - Status tag (NORMAL / WARNING / CRITICAL)
 * - Level persentase besar (32px Bold) & volume absolut (contoh: 1.560 / 2.000 L)
 * - Status motor pompa (Pump - ON / Pump - OFF)
 * - Sensor telemetri radio LoRa (dBm RSSI) & ambang batas
 */
export const TankCard: React.FC<TankCardProps> = ({ tank }) => {
  const level = Number(tank.latestReading?.levelPercent || 0);
  const volume = Number(tank.latestReading?.volumeLiters || 0);
  const capacity = Number(tank.capacityLiters || 2000);
  const minThreshold = Number(tank.minThresholdPercent || 30);
  const maxThreshold = Number(tank.maxThresholdPercent || 90);

  // Klasifikasi status semantik
  const { variant, statusText, barColor } = getTankStatusCategory(
    level,
    minThreshold
  );

  // Status pompa aktif jika pumpStatus == RUNNING atau level < minThreshold (auto pump on)
  const isPumpOn =
    tank.pumpStatus === 'RUNNING' ||
    (tank.pumpStatus !== 'STOPPED' && level < minThreshold);

  // Modul sensor LoRa STM32 & RSSI
  const primaryNode = tank.nodes?.[0];
  const nodeLabel = primaryNode?.deviceCode || 'STM32-LORA';
  const rssiValue =
    primaryNode?.lastRssi != null
      ? `${primaryNode.lastRssi} dBm`
      : tank.latestReading?.rssi != null
      ? `${tank.latestReading.rssi} dBm`
      : '-68 dBm';

  // Laju pengisian cairan jika pompa aktif (misal 42 L/m)
  const inflowRate = tank.inflowRateLpm ?? (isPumpOn ? 42.0 : 0);

  return (
    <Card key={tank.id}>
      {/* 1. Header Kartu: Nama Tangki & Badge Status Semantik */}
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.tankName}>{tank.name}</Text>
          <Text style={styles.location} numberOfLines={1}>
            📍 {tank.location || 'Sekolah Vokasi UGM'}
          </Text>
        </View>
        <Badge text={statusText} variant={variant} />
      </View>

      {/* 2. Sub-Row: Status Motor Pompa & Sinyal Radio LoRa */}
      <View style={styles.subInfoRow}>
        <View
          style={[
            styles.pumpPill,
            isPumpOn ? styles.pumpPillActive : styles.pumpPillInactive,
          ]}
        >
          <View
            style={[
              styles.pumpDot,
              isPumpOn ? styles.pumpDotActive : styles.pumpDotInactive,
            ]}
          />
          <Text
            style={[
              styles.pumpText,
              isPumpOn ? styles.pumpTextActive : styles.pumpTextInactive,
            ]}
          >
            {isPumpOn ? 'Pump - ON' : 'Pump - OFF'}
          </Text>
        </View>

        <View style={styles.telemetryPill}>
          <Text style={styles.telemetryText}>
            {isPumpOn ? `💧 Inflow: ${inflowRate} L/m` : `📶 LoRa: ${rssiValue}`}
          </Text>
        </View>
      </View>

      {/* 3. Banner Peringatan Darurat (Jika Ada Alert Aktif) */}
      {tank.activeAlert && (
        <View
          style={[
            styles.alertBanner,
            tank.activeAlert.level === 'CRITICAL'
              ? styles.alertBannerCritical
              : styles.alertBannerWarning,
          ]}
        >
          <Text
            style={[
              styles.alertText,
              tank.activeAlert.level === 'CRITICAL'
                ? styles.alertTextCritical
                : styles.alertTextWarning,
            ]}
          >
            ⚠️ {tank.activeAlert.message}
          </Text>
        </View>
      )}

      {/* 4. Display Level Air & Volume Aktual */}
      <View style={styles.levelContainer}>
        <View style={styles.levelRow}>
          <View style={styles.levelNumberRow}>
            <Text style={[styles.levelText, { color: barColor }]}>
              {level.toFixed(0)}
            </Text>
            <Text style={[styles.levelPercentSign, { color: barColor }]}>%</Text>
          </View>
          <View style={styles.volumeBox}>
            <Text style={styles.volumeText}>
              {volume.toLocaleString('id-ID')} / {capacity.toLocaleString('id-ID')} L
            </Text>
            <Text style={styles.volumeSub}>
              VOLUME OF {formatKiloLiters(capacity)}
            </Text>
          </View>
        </View>

        {/* Visual Progress Bar dengan penanda batas kritis 30% */}
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
          {/* Garis Penanda Ambang Kritis 30% */}
          <View
            style={[
              styles.thresholdMarker,
              { left: `${minThreshold}%` },
            ]}
          />
        </View>
      </View>

      {/* 5. Footer Spesifikasi Ambang Batas & Sensor */}
      <View style={styles.footer}>
        <View style={styles.footerCol}>
          <Text style={styles.footerLabel}>Kapasitas</Text>
          <Text style={styles.footerValue}>{formatKiloLiters(capacity)}</Text>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerLabel}>Ambang Batas</Text>
          <Text style={styles.footerValue}>
            {minThreshold}% - {maxThreshold}%
          </Text>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerLabel}>Modul Sensor</Text>
          <Text style={styles.footerValue} numberOfLines={1}>
            {nodeLabel}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  tankName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  location: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  pumpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 5,
  },
  pumpPillActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  pumpPillInactive: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  pumpDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pumpDotActive: {
    backgroundColor: '#10b981',
  },
  pumpDotInactive: {
    backgroundColor: '#94a3b8',
  },
  pumpText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pumpTextActive: {
    color: '#065f46',
  },
  pumpTextInactive: {
    color: '#64748b',
  },
  telemetryPill: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  telemetryText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  alertBanner: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
  },
  alertBannerWarning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  alertBannerCritical: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertTextWarning: {
    color: '#92400e',
  },
  alertTextCritical: {
    color: '#991b1b',
  },
  levelContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  levelNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  levelText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  levelPercentSign: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 2,
  },
  volumeBox: {
    alignItems: 'flex-end',
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  volumeSub: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 9,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#ef4444',
    zIndex: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  footerCol: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
  },
});
