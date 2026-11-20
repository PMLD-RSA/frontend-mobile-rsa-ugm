import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
 * 4 Kartu Metrik Utama (Figma Node 912:16121 & design.md § 5.2):
 * Menggunakan token warna Figma (Frame Color 232:2328) dan ikon resmi Ionicons tanpa emoticon.
 * 1. Tanks Online: X/Y (Active Monitoring)
 * 2. Critical Alerts: Z (Below 30% threshold / Semua Normal)
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
          <Ionicons name="water-outline" size={16} color="#0077B6" />
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
          <Ionicons
            name="notifications-outline"
            size={16}
            color={criticalCount > 0 ? '#F21E1E' : '#64748B'}
          />
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
          <Ionicons name="power" size={16} color="#0077B6" />
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
          <Ionicons name="analytics-outline" size={16} color="#0A3F5C" />
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
    backgroundColor: '#FFFFFF', // Pure White sesuai design.md § 2.1
    padding: 12,
    borderRadius: 8, // Radius 8px sesuai design.md § 4.3
    borderWidth: 1,
    borderColor: '#D9D9D9', // Border Neutral sesuai design.md § 2.1
  },
  metricCardCriticalBorder: {
    borderColor: '#F21E1E',
    backgroundColor: '#FFFDFD',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: 24, // Inter 24-32px Bold sesuai design.md § 2.2
    fontWeight: '700',
    color: '#1B1919', // Dark Black sesuai design.md § 2.1
    marginVertical: 2,
    letterSpacing: -0.3,
  },
  safeValue: {
    color: '#0077B6',
  },
  criticalValue: {
    color: '#F21E1E', // Critical Red sesuai design.md § 2.1
  },
  pumpValue: {
    color: '#0077B6', // Secondary Blue sesuai design.md § 2.1
  },
  avgValue: {
    color: '#0A3F5C', // Primary Navy sesuai design.md § 2.1
  },
  metricStatusPositive: {
    fontSize: 10,
    color: '#0077B6',
    fontWeight: '600',
    marginTop: 2,
  },
  metricStatusCritical: {
    fontSize: 10,
    color: '#F21E1E',
    fontWeight: '600',
    marginTop: 2,
  },
  metricStatusInfo: {
    fontSize: 10,
    color: '#0077B6',
    fontWeight: '600',
    marginTop: 2,
  },
  metricStatusMuted: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
});
