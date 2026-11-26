import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../theme/tokens';

interface MetricsOverviewProps {
  tanksCount: number;
  totalCapacity: number;
  totalWater: number;
  activeAlertsCount: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  tanksCount,
  totalCapacity,
  totalWater,
  activeAlertsCount,
}) => {
  const percentageFilled =
    totalCapacity > 0 ? ((totalWater / totalCapacity) * 100).toFixed(0) : '0';

  return (
    <View style={styles.metricsRow}>
      {/* Total Tangki */}
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Total Tangki</Text>
        <Text
          style={styles.metricValue}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {tanksCount}
        </Text>
        <Text style={styles.metricSub} numberOfLines={1}>
          {(totalCapacity / 1000).toFixed(0)}k L Kapasitas
        </Text>
      </View>

      {/* Air Tertampung */}
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Air Tertampung</Text>
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

      {/* Peringatan Aktif */}
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Peringatan</Text>
        <Text
          style={[
            styles.metricValue,
            { color: activeAlertsCount > 0 ? COLORS.critical : COLORS.normalText },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {activeAlertsCount}
        </Text>
        <Text
          style={[
            styles.metricSub,
            { color: activeAlertsCount > 0 ? COLORS.criticalText : COLORS.normalText },
          ]}
          numberOfLines={1}
        >
          {activeAlertsCount > 0 ? 'Perlu dicek' : 'Kondisi aman'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  metricCard: {
    flex: 1,
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
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.heading,
    marginVertical: 4,
  },
  waterValue: {
    color: COLORS.primarySoft,
  },
  metricSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
