import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { COLORS, RADIUS } from '../theme/tokens';

export type SkeletonVariant = 'tank' | 'list' | 'chart';

export interface SkeletonListProps {
  variant?: SkeletonVariant;
  count?: number;
}

const SkeletonBlock: React.FC<{
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  opacity: Animated.Value;
}> = ({ width = '100%', height, radius = 6, opacity }) => (
  <Animated.View
    style={[
      styles.block,
      {
        width,
        height,
        borderRadius: radius,
        opacity,
      },
    ]}
  />
);

/**
 * Placeholder Skeleton berbasis native-driver opacity pulse agar transisi
 * Loading -> Data tidak menyebabkan layout jump.
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  variant = 'list',
  count = 3,
}) => {
  const reducedMotion = useReducedMotion();
  const pulse = useRef(new Animated.Value(reducedMotion ? 0.7 : 0.45)).current;

  useEffect(() => {
    if (reducedMotion) {
      pulse.setValue(0.7);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [pulse, reducedMotion]);

  if (variant === 'chart') {
    return (
      <View accessibilityLabel="Memuat grafik tren">
        <View style={styles.metricsRow}>
          {[0, 1, 2, 3].map((idx) => (
            <View key={idx} style={styles.metricCard}>
              <SkeletonBlock width="60%" height={16} opacity={pulse} />
              <View style={styles.spacerXs} />
              <SkeletonBlock width="75%" height={10} opacity={pulse} />
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <SkeletonBlock width="42%" height={16} opacity={pulse} />
          <View style={styles.spacerMd} />
          <SkeletonBlock width="100%" height={150} radius={10} opacity={pulse} />
          <View style={styles.spacerSm} />
          <View style={styles.rowBetween}>
            <SkeletonBlock width={50} height={10} opacity={pulse} />
            <SkeletonBlock width={50} height={10} opacity={pulse} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View accessibilityLabel="Memuat data">
      {Array.from({ length: count }).map((_, idx) =>
        variant === 'tank' ? (
          <View key={idx} style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.flex1}>
                <SkeletonBlock width="58%" height={16} opacity={pulse} />
                <View style={styles.spacerXs} />
                <SkeletonBlock width="42%" height={12} opacity={pulse} />
              </View>
              <SkeletonBlock width={72} height={24} radius={999} opacity={pulse} />
            </View>
            <View style={styles.levelBox}>
              <View style={styles.rowBetween}>
                <SkeletonBlock width={68} height={32} opacity={pulse} />
                <SkeletonBlock width={86} height={24} opacity={pulse} />
              </View>
              <View style={styles.spacerSm} />
              <SkeletonBlock width="100%" height={8} radius={4} opacity={pulse} />
            </View>
            <View style={styles.rowBetween}>
              <SkeletonBlock width="28%" height={24} opacity={pulse} />
              <SkeletonBlock width="28%" height={24} opacity={pulse} />
              <SkeletonBlock width="28%" height={24} opacity={pulse} />
            </View>
          </View>
        ) : (
          <View key={idx} style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.flex1}>
                <SkeletonBlock width="52%" height={15} opacity={pulse} />
                <View style={styles.spacerXs} />
                <SkeletonBlock width="36%" height={11} opacity={pulse} />
              </View>
              <SkeletonBlock width={66} height={22} radius={999} opacity={pulse} />
            </View>
            <View style={styles.spacerMd} />
            <SkeletonBlock width="90%" height={12} opacity={pulse} />
            <View style={styles.spacerXs} />
            <SkeletonBlock width="68%" height={12} opacity={pulse} />
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  block: {
    backgroundColor: '#e2e8f0',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  levelBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginVertical: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  spacerXs: { height: 6 },
  spacerSm: { height: 10 },
  spacerMd: { height: 14 },
});
