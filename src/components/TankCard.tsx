import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, Badge } from './Card';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Tank } from '../types';
import { COLORS, MOTION, RADIUS } from '../theme/tokens';
import { getTankStatusCategory, formatKiloLiters } from '../utils/tankMetrics';

interface TankCardProps {
  tank: Tank;
}

export const TankCard: React.FC<TankCardProps> = React.memo(({ tank }) => {
  const reducedMotion = useReducedMotion();
  const level = Number(tank.latestReading?.levelPercent || 0);
  const clampedFraction = Math.min(Math.max(level, 0), 100) / 100;
  const volume = Number(tank.latestReading?.volumeLiters || 0);
  const capacity = Number(tank.capacityLiters || 0);
  const minThreshold = Number(tank.minThresholdPercent || 30);
  const maxThreshold = Number(tank.maxThresholdPercent || 90);

  const [trackWidth, setTrackWidth] = useState(0);
  const animatedLevel = useRef(new Animated.Value(clampedFraction)).current;

  useEffect(() => {
    if (reducedMotion) {
      animatedLevel.setValue(clampedFraction);
      return;
    }
    const anim = Animated.timing(animatedLevel, {
      toValue: clampedFraction,
      duration: MOTION.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [clampedFraction, animatedLevel, reducedMotion]);

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0 && nextWidth !== trackWidth) {
      setTrackWidth(nextWidth);
    }
  };

  const { variant, statusText, barColor } = getTankStatusCategory(
    level,
    minThreshold
  );

  const primaryNode = tank.nodes?.[0];
  const nodeLabel = primaryNode?.deviceCode || 'STM32';
  const rssiValue = primaryNode?.lastRssi != null ? `${primaryNode.lastRssi} dBm` : null;

  const barScaleX = animatedLevel.interpolate({
    inputRange: [0, 1],
    outputRange: [0.001, 1],
  });
  const barTranslateX = animatedLevel.interpolate({
    inputRange: [0, 1],
    outputRange: [-trackWidth / 2, 0],
  });

  return (
    <Card>
      {/* Header Kartu Tangki */}
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.tankName}>{tank.name}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color={COLORS.textMuted} />
            <Text style={styles.location} numberOfLines={1}>
              {tank.location || 'Lokasi belum disetel'}
            </Text>
          </View>
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
          <Feather
            name="alert-triangle"
            size={13}
            color={
              tank.activeAlert.level === 'CRITICAL'
                ? COLORS.criticalText
                : COLORS.warningText
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

        <View style={styles.progressBarTrack} onLayout={handleTrackLayout}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: trackWidth > 0 ? trackWidth : `${clampedFraction * 100}%`,
                backgroundColor: barColor,
                transform:
                  trackWidth > 0
                    ? [{ translateX: barTranslateX }, { scaleX: barScaleX }]
                    : undefined,
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
          <View style={styles.sensorRow}>
            {rssiValue ? (
              <Feather name="wifi" size={12} color={COLORS.primarySoft} />
            ) : (
              <Feather name="cpu" size={12} color={COLORS.textMuted} />
            )}
            <Text style={styles.footerValueInline} numberOfLines={1}>
              {nodeLabel}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
});

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
    color: COLORS.heading,
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADIUS.sm + 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
  },
  alertBannerWarning: {
    backgroundColor: COLORS.warningBg,
    borderColor: '#fde68a',
  },
  alertBannerCritical: {
    backgroundColor: COLORS.criticalBg,
    borderColor: '#fecaca',
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  alertTextWarning: {
    color: COLORS.warningText,
  },
  alertTextCritical: {
    color: COLORS.criticalText,
  },
  levelContainer: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: RADIUS.lg,
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
    color: COLORS.textPrimary,
  },
  volumeSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: COLORS.border,
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
    borderTopColor: COLORS.border,
    paddingTop: 10,
    gap: 6,
  },
  footerCol: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  sensorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  footerValueInline: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
});
