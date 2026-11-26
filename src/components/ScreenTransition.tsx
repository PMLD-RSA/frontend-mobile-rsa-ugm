import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MOTION } from '../theme/tokens';

export interface ScreenTransitionProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Transisi masuk layar yang halus (fade + subtle glide 8dp) berjalan 100% di native UI thread.
 * Otomatis nonaktif jika pengguna mengaktifkan Reduce Motion di perangkat.
 */
export const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, style }) => {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reducedMotion ? 0 : 8)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(8);

    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: MOTION.fast,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: MOTION.fast,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    anim.start();
    return () => anim.stop();
  }, [opacity, translateY, reducedMotion]);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
