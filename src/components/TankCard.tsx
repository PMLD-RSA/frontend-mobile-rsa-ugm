import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Badge } from './Card';
import { Tank } from '../types';

interface TankCardProps {
  tank: Tank;
}

export const TankCard: React.FC<TankCardProps> = ({ tank }) => {
  const level = Number(tank.latestReading?.levelPercent || 0);
  const volume = Number(tank.latestReading?.volumeLiters || 0);
  const capacity = Number(tank.capacityLiters || 0);
  const minThreshold = Number(tank.minThresholdPercent || 30);
  const maxThreshold = Number(tank.maxThresholdPercent || 90);

  // Klasifikasi ambang batas sesuai PRD:
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
        <View style={styles.titleArea}>
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
