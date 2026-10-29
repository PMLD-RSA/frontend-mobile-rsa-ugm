import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { useAlertStore } from '../stores/alertStore';
import { connectAlertSocket } from '../services/alertSocket';
import { Alert } from '../types';

export const EmergencyAlertBanner: React.FC = () => {
  const alerts = useAlertStore((state) => state.alerts);
  const addAlert = useAlertStore((state) => state.addAlert);
  const markAlertResolved = useAlertStore((state) => state.markAlertResolved);
  const [dismissedAlertId, setDismissedAlertId] = useState<number | null>(null);

  useEffect(() => {
    return connectAlertSocket({
      onAlert: (alert: Alert) => {
        addAlert(alert);
        if (alert.level === 'CRITICAL' && alert.status === 'active') {
          setDismissedAlertId(null);
          Vibration.vibrate([0, 250, 150, 250]);
        }
      },
      onResolved: markAlertResolved,
    });
  }, [addAlert, markAlertResolved]);

  const criticalAlert = useMemo(
    () =>
      alerts.find(
        (alert) =>
          alert.status === 'active' &&
          alert.level === 'CRITICAL' &&
          alert.id !== dismissedAlertId
      ),
    [alerts, dismissedAlertId]
  );

  if (!criticalAlert) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.title}>⚠️ PERINGATAN KRITIS</Text>
        <Text style={styles.message} numberOfLines={2}>
          {criticalAlert.tankName || `Tangki ${criticalAlert.tankId}`}: {criticalAlert.message}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={() => setDismissedAlertId(criticalAlert.id)}
        accessibilityLabel="Tutup banner peringatan kritis"
      >
        <Text style={styles.dismissText}>Tutup</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
  },
  content: { flex: 1, marginRight: 10 },
  title: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  message: { color: '#fee2e2', fontSize: 12, marginTop: 4, lineHeight: 17 },
  dismissButton: {
    minHeight: 44,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dismissText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
