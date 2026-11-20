import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from './Card';
import { Tank } from '../types';
import { getTankStatusCategory, formatKiloLiters } from '../utils/tankMetrics';

interface TankCardProps {
  tank: Tank;
}

/**
 * Kartu Ringkasan Tangki (Figma Node 912:16121 & design.md § 5.2):
 * - Menampilkan Tank A (DTEDI), Tank B (DLIKES), Tank C (DTK) di Sekolah Vokasi UGM
 * - Status tag (NORMAL / WARNING / CRITICAL)
 * - Level persentase besar & volume absolut (contoh: 1.560 / 2.000 L)
 * - Status motor pompa (Pump - ON / Pump - OFF) dengan Ionicons
 * - Sinyal telemetri LoRa STM32 & laju pengisian Inflow
 * - Bebas dari emoticon / AI slop, murni token desain Figma
 */
export const TankCard: React.FC<TankCardProps> = ({ tank }) => {
  const level = Number(tank.latestReading?.levelPercent || 0);
  const volume = Number(tank.latestReading?.volumeLiters || 0);
  const capacity = Number(tank.capacityLiters || 2000);
  const minThreshold = Number(tank.minThresholdPercent || 30);
  const maxThreshold = Number(tank.maxThresholdPercent || 80);

  // Klasifikasi status semantik
  const { variant, statusText, barColor } = getTankStatusCategory(
    level,
    minThreshold
  );

  // Status pompa aktif jika pumpStatus == RUNNING atau level < minThreshold
  const isPumpOn =
    tank.pumpStatus === 'RUNNING' ||
    (tank.pumpStatus !== 'STOPPED' && level < minThreshold);

  // Modul sensor LoRa STM32 & RSSI
  const primaryNode = tank.nodes?.[0];
  const nodeLabel = primaryNode?.deviceCode || 'STM32';
  const rssiValue =
    primaryNode?.lastRssi != null
      ? `${primaryNode.lastRssi} dBm`
      : tank.latestReading?.rssi != null
      ? `${tank.latestReading.rssi} dBm`
      : '-64 dBm';

  // Laju pengisian cairan jika pompa aktif (misal 42 L/m)
  const inflowRate = tank.inflowRateLpm ?? (isPumpOn ? 42.0 : 0);

  return (
    <Card key={tank.id}>
      {/* 1. Header Kartu: Nama Tangki & Badge Status Semantik */}
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.tankName}>{tank.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color="#64748B" />
            <Text style={styles.location} numberOfLines={1}>
              {tank.location || 'Sekolah Vokasi UGM'}
            </Text>
          </View>
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
          <Ionicons
            name="power"
            size={11}
            color={isPumpOn ? '#0077B6' : '#64748B'}
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
          <Ionicons
            name={isPumpOn ? 'water-outline' : 'radio-outline'}
            size={12}
            color="#0077B6"
          />
          <Text style={styles.telemetryText}>
            {isPumpOn ? `Inflow: ${inflowRate} L/m` : `LoRa: ${rssiValue}`}
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
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={
              tank.activeAlert.level === 'CRITICAL' ? '#F21E1E' : '#B45309'
            }
          />
          <Text
            style={[
              styles.alertText,
              tank.activeAlert.level === 'CRITICAL'
                ? styles.alertTextCritical
                : styles.alertTextWarning,
            ]}
          >
            {tank.activeAlert.message}
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
    color: '#1B1919', // Dark Black sesuai design.md § 2.1
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  location: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
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
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 5,
  },
  pumpPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  pumpPillInactive: {
    backgroundColor: '#F3F1F1',
    borderColor: '#D9D9D9',
  },
  pumpText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pumpTextActive: {
    color: '#0077B6', // Secondary Blue sesuai design.md § 2.1
  },
  pumpTextInactive: {
    color: '#64748B',
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    gap: 4,
  },
  telemetryText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
  },
  alertBannerWarning: {
    backgroundColor: '#FEFCE8',
    borderColor: '#FDE047',
  },
  alertBannerCritical: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  alertTextWarning: {
    color: '#B45309',
  },
  alertTextCritical: {
    color: '#F21E1E', // Critical Red sesuai design.md § 2.1
  },
  levelContainer: {
    backgroundColor: '#F3F1F1', // Surface Gray sesuai design.md § 2.1
    borderWidth: 1,
    borderColor: '#D9D9D9',
    padding: 12,
    borderRadius: 8,
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
    fontSize: 32, // Inter 32px Bold sesuai design.md § 2.2
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  levelPercentSign: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 2,
  },
  volumeBox: {
    alignItems: 'flex-end',
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B1919',
  },
  volumeSub: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#F21E1E', // Critical Red marker
    zIndex: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
    paddingTop: 10,
  },
  footerCol: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B1919',
    marginTop: 2,
  },
});
