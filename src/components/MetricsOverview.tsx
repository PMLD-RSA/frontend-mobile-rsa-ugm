import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../theme/tokens';

interface MetricsOverviewProps {
  tanksCount: number;
  totalCapacity: number;
  totalWater: number;
  activeAlertsCount: number;
  criticalAlertsCount?: number;
  tanksOnlineCount?: number;
  averageLevelPercent?: number;
}

/**
 * 2x2 KPI Grid Dashboard SI-POTA RSA UGM:
 * 1. Tangki Online   2. Peringatan Kritis
 * 3. Air Tertampung  4. Rata-rata Level Air
 */
export const MetricsOverview: React.FC<MetricsOverviewProps> = React.memo(({
  tanksCount,
  totalCapacity,
  totalWater,
  activeAlertsCount,
  criticalAlertsCount = 0,
  tanksOnlineCount = 0,
  averageLevelPercent = 0,
}) => {
  const percentageFilled =
    totalCapacity > 0 ? ((totalWater / totalCapacity) * 100).toFixed(0) : '0';
  const criticalTotal = Math.max(criticalAlertsCount, activeAlertsCount);

  return (
    <View style={styles.gridContainer}>
      {/* 1. Tangki Online */}
      <View style={styles.metricCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.metricLabel}>TANGKI ONLINE</Text>
          <Feather name="radio" size={15} color={COLORS.primarySoft} />
        </View>
        <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
          {tanksOnlineCount}/{tanksCount}
        </Text>
        <Text style={[styles.metricSub, { color: COLORS.primarySoft }]} numberOfLines={1}>
          Sensor aktif
        </Text>
      </View>

      {/* 2. Peringatan Kritis */}
      <View
        style={[
          styles.metricCard,
          criticalTotal > 0 && styles.metricCardCriticalBorder,
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.metricLabel}>PERINGATAN</Text>
          <Feather
            name="alert-triangle"
            size={15}
            color={criticalTotal > 0 ? COLORS.critical : COLORS.normalText}
          />
        </View>
        <Text
          style={[
            styles.metricValue,
            { color: criticalTotal > 0 ? COLORS.critical : COLORS.normalText },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {criticalTotal}
        </Text>
        <Text
          style={[
            styles.metricSub,
            { color: criticalTotal > 0 ? COLORS.criticalText : COLORS.normalText },
          ]}
          numberOfLines={1}
        >
          {criticalTotal > 0 ? 'Perlu diperiksa' : 'Semua aman'}
        </Text>
      </View>

      {/* 3. Air Tertampung */}
      <View style={styles.metricCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.metricLabel}>AIR TERTAMPUNG</Text>
          <Feather name="database" size={15} color={COLORS.primarySoft} />
        </View>
        <Text
          style={[styles.metricValue, styles.waterValue]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {(totalWater / 1000).toFixed(1)}k L
        </Text>
        <Text style={styles.metricSub} numberOfLines={1}>
          {percentageFilled}% Terisi
        </Text>
      </View>

      {/* 4. Rata-rata Level Air */}
      <View style={styles.metricCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.metricLabel}>RATA-RATA LEVEL</Text>
          <Feather name="activity" size={15} color={COLORS.primary} />
        </View>
        <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
          {averageLevelPercent}%
        </Text>
        <Text style={styles.metricSub} numberOfLines={1}>
          {(totalCapacity / 1000).toFixed(0)}k L Kapasitas
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    rowGap: 10,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 0,
  },
  metricCardCriticalBorder: {
    borderColor: COLORS.critical,
    backgroundColor: '#fffdfd',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.4,
    flex: 1,
    marginRight: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.heading,
    marginVertical: 2,
  },
  waterValue: {
    color: COLORS.primarySoft,
  },
  metricSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
