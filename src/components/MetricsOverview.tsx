import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Total Tangki</Text>
        <Text style={styles.metricValue}>{tanksCount}</Text>
        <Text style={styles.metricSub}>
          Kapasitas {(totalCapacity / 1000).toFixed(0)}k L
        </Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Air Tertampung</Text>
        <Text style={styles.metricValue}>{(totalWater / 1000).toFixed(1)}k L</Text>
        <Text style={styles.metricSub}>{percentageFilled}% Kapasitas</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Peringatan Aktif</Text>
        <Text
          style={[
            styles.metricValue,
            { color: activeAlertsCount > 0 ? '#b45309' : '#166534' },
          ]}
        >
          {activeAlertsCount}
        </Text>
        <Text style={styles.metricSub}>
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
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
});
