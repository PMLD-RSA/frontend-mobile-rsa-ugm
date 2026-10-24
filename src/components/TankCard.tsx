import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Badge } from './Card';
import { Tank } from '../types';
import { getTankStatusCategory, formatKiloLiters } from '../utils/tankMetrics';

interface TankCardProps {
  tank: Tank;
}

export const TankCard: React.FC<TankCardProps> = ({ tank }) => {
  const level = Number(tank.latestReading?.levelPercent || 0);
  const volume = Number(tank.latestReading?.volumeLiters || 0);
  const capacity = Number(tank.capacityLiters || 0);
  const minThreshold = Number(tank.minThresholdPercent || 30);
  const maxThreshold = Number(tank.maxThresholdPercent || 90);

  // Menggunakan helper murni tankMetrics
  const { variant, statusText, barColor } = getTankStatusCategory(
    level,
    minThreshold
  );

  // Identifikasi modul sensor utama jika ada
  const primaryNode = tank.nodes?.[0];
  const nodeLabel = primaryNode?.deviceCode || 'STM32';
  const rssiValue = primaryNode?.lastRssi != null ? `${primaryNode.lastRssi} dBm` : null;

  return (
    <Card key={tank.id}>
      {/* Header Kartu Tangki */}
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.tankName}>{tank.name}</Text>
          <Text style={styles.location}>
            📍 {tank.location || 'Lokasi belum disetel'}
          </Text>
        </View>
        <Badge text={statusText} variant={variant} />
      </View>

      {/* Banner Peringatan Aktif (Jika Ada) */}
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

        {/* Visual Progress Bar */}
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
        <View style={styles.footerCol}>
          <Text style={styles.footerLabel}>Kapasitas Total</Text>
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
            {rssiValue ? `📶 ${nodeLabel}` : nodeLabel}
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
  levelText: {
    fontSize: 32,
    fontWeight: '800',
  },
  volumeBox: {
    alignItems: 'flex-end',
  },
  volumeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  volumeSub: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 0.5,
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
