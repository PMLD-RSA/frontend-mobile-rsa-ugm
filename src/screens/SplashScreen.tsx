import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Animasi Opacity Container (Fade in saat muncul, Fade out saat selesai)
  const containerOpacity = useRef(new Animated.Value(0)).current;

  // Animasi Scale & Opacity Logo
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Animasi Pulse Loading Bar
  const loadingProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Fade in & Pop-in Logo awal
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Animasi progress bar simulasi pemuatan sistem (0% -> 100% dalam 2.2 detik)
    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 2200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false, // Digunakan untuk animasi width progress bar
    }).start();

    // 3. Timer transisi halus ke halaman berikutnya
    const timer = setTimeout(() => {
      // Fade out halus sebelum berpindah layar
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onFinish();
        }
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [containerOpacity, logoScale, logoOpacity, loadingProgress, onFinish]);

  // Interpolasi lebar progress bar (0% sampai 100%)
  const progressWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <StatusBar style="light" />

      {/* Area Tengah: Logo & Brand Identitas RSA UGM */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>💧</Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: logoOpacity, alignItems: 'center' }}>
          <Text style={styles.title}>SI-POTA</Text>
          <Text style={styles.versionBadge}>v1.0 • Mobile Edition</Text>
          <Text style={styles.subtitle}>
            Sistem Informasi Pemantauan Tangki Air
          </Text>
          <Text style={styles.hospitalName}>
            Rumah Sakit Akademik Universitas Gadjah Mada
          </Text>
        </Animated.View>
      </View>

      {/* Area Bawah: Loading Indicator & Copyright */}
      <View style={styles.footer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[styles.progressBarFill, { width: progressWidth }]}
          />
        </View>
        <Text style={styles.loadingText}>Menyiapkan sistem telemetri...</Text>
        <Text style={styles.copyrightText}>
          Work Package 4 (WP-4) • RSA UGM © 2026
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0a354c', // Brand Primary resmi RSA UGM
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    zIndex: 99999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2,
    borderColor: '#eab308', // Aksen Emas resmi
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  logoIcon: {
    fontSize: 42,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    textAlign: 'center',
  },
  versionBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#eab308',
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  hospitalName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 12,
  },
  progressBarBackground: {
    width: 180,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8', // Light sky blue accent
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  copyrightText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.2,
  },
});
