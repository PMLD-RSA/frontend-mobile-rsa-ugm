import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface MetricsOverviewProps {
  tanksCount: number;
  totalCapacity?: number;
  totalWater?: number;
  activeAlertsCount?: number;
  criticalAlertsCount?: number;
  tanksOnlineCount?: number;
  pumpsActiveCount?: number;
  averageLevelPercent?: number;
}

/**
 * 4 Grid KPI Metric Cards sesuai Dokumentasi Desain design.md § 5.2:
 * 1. Tanks Online: X/Y (Active Monitoring)
 * 2. Critical Alerts: Z (Below 30% threshold / Kondisi Aman)
 * 3. Pump Active: N (Currently Running)
 * 4. Avg. Water Level: P% (Network Average)
 */
export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  tanksCount,
  criticalAlertsCount = 0,
  tanksOnlineCount,
  pumpsActiveCount = 0,
  averageLevelPercent = 0,
  activeAlertsCount = 0,
}) => {
  const onlineCount = tanksOnlineCount ?? tanksCount;
  const criticalCount = criticalAlertsCount || activeAlertsCount;

  return (
    <View style={styles.gridContainer}>
      {/* 1. Tanks Online */}
      <View style={styles.metricCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.metricLabel}>TANKS ONLINE</Text>
          <Text style={styles.cardIcon}>💧</Text>
        </View>
        <Text style={styles.metricValue}>
          {onlineCount}/{tanksCount}
        </Text>
        <Text style={styles.metricStatusPositive}>• Active Monitoring</Text>
      </View>

      {/* 2. Critical Alerts */}
      <View
        style={[
          styles.metricCard,
          criticalCount > 0 && styles.metricCardCriticalBorder,
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.metricLabel}>CRITICAL ALERTS</Text>
          <Text style={styles.cardIcon}>⚠️</Text>
        </View>
        <Text
          style={[
            styles.metricValue,
            criticalCount > 0 ? styles.criticalValue : styles.safeValue,
          ]}
        >
          {criticalCount}
        </Text>
        <Text
          style={
            criticalCount > 0
              ? styles.metricStatusCritical
              : styles.metricStatusPositive
          }
        >
          {criticalCount > 0 ? 'Below 30% threshold' : 'Semua Normal'}
        </Text>
      </View>

      {/* 3. Pump Active */}
      <View style={styles.metricCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.metricLabel}>PUMP ACTIVE</Text>
          <Text style={styles.cardIcon}>⚡</Text>
        </View>
        <Text style={[styles.metricValue, styles.pumpValue]}>
          {pumpsActiveCount}
        </Text>
        <Text style={styles.metricStatusInfo}>• Currently Running</Text>
      </View>

      {/* 4. Avg. Water Level */}
      <View style={styles.metricCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.metricLabel}>AVG. WATER LEVEL</Text>
          <Text style={styles.cardIcon}>📊</Text>
        </View>
        <Text style={[styles.metricValue, styles.avgValue]}>
          {averageLevelPercent}%
        </Text>
        <Text style={styles.metricStatusMuted}>Network Average</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0a3f5c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  metricCardCriticalBorder: {
    borderColor: '#fecaca',
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
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  cardIcon: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 2,
    letterSpacing: -0.3,
  },
  safeValue: {
    color: '#10b981',
  },
  criticalValue: {
    color: '#f21e1e', // Critical Red sesuai design.md § 2.1
  },
  pumpValue: {
    color: '#0077b6', // Secondary Blue sesuai design.md § 2.1
  },
  avgValue: {
    color: '#0a3f5c', // Primary Navy sesuai design.md § 2.1
  },
  metricStatusPositive: {
    fontSize: 10,
    color: '#0077b6',
    fontWeight: '600',
    marginTop: 2,
  },
  metricStatusCritical: {
    fontSize: 10,
    color: '#f21e1e',
    fontWeight: '600',
    marginTop: 2,
  },
  metricStatusInfo: {
    fontSize: 10,
    color: '#0077b6',
    fontWeight: '600',
    marginTop: 2,
  },
  metricStatusMuted: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
});
