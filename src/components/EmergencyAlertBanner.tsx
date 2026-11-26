import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useAlertStore } from '../stores/alertStore';
import { useAuthStore } from '../stores/authStore';
import { useTankStore } from '../stores/tankStore';
import { connectAlertSocket } from '../services/alertSocket';
import { COLORS, MOTION } from '../theme/tokens';
import { Alert } from '../types';

export const EmergencyAlertBanner: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const token = useAuthStore((state) => state.token);
  const alerts = useAlertStore((state) => state.alerts);
  const addAlert = useAlertStore((state) => state.addAlert);
  const markAlertResolved = useAlertStore((state) => state.markAlertResolved);
  const updateLevel = useTankStore((state) => state.updateLevel);
  const updateNodeStatus = useTankStore((state) => state.updateNodeStatus);
  const [dismissedAlertId, setDismissedAlertId] = useState<number | null>(null);
  const enterAnim = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    return connectAlertSocket({
      token,
      onAlert: (alert: Alert) => {
        addAlert(alert);
        if (alert.level === 'CRITICAL' && alert.status === 'active') {
          setDismissedAlertId(null);
          Vibration.vibrate([0, 250, 150, 250]);
        }
      },
      onResolved: markAlertResolved,
      onLevelUpdate: (update) => {
        updateLevel(update.tankId, update.levelPercent, update.volumeLiters, {
          distanceCm: update.distanceCm,
          rssi: update.rssi,
          recordedAt: update.recordedAt,
        });
      },
      onNodeStatus: updateNodeStatus,
    });
  }, [token, addAlert, markAlertResolved, updateLevel, updateNodeStatus]);

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

  useEffect(() => {
    if (!criticalAlert) return;
    if (reducedMotion) {
      enterAnim.setValue(1);
      return;
    }
    enterAnim.setValue(0);
    const anim = Animated.timing(enterAnim, {
      toValue: 1,
      duration: MOTION.normal,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [criticalAlert?.id, enterAnim, reducedMotion]);

  if (!criticalAlert) return null;

  const translateY = enterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-14, 0],
  });

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          opacity: enterAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Feather name="alert-triangle" size={14} color={COLORS.textOnPrimary} />
          <Text style={styles.title}>PERINGATAN KRITIS</Text>
        </View>
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.critical,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
  },
  content: { flex: 1, marginRight: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: COLORS.textOnPrimary, fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  message: { color: COLORS.criticalBg, fontSize: 12, marginTop: 4, lineHeight: 17 },
  dismissButton: {
    minHeight: 44,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.criticalBg,
  },
  dismissText: { color: COLORS.textOnPrimary, fontSize: 12, fontWeight: '700' },
});
