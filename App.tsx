import React, { useState, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Header } from './src/components/Header';
import { MobileSidebar } from './src/components/Sidebar';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { useAuthStore } from './src/stores/authStore';
import { ScreenId } from './src/types';

const SCREEN_TITLES: Record<ScreenId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'RSA UGM • SI-POTA v1.0' },
  tanks: { title: 'Manajemen Tangki', subtitle: 'F-06 • Quick Threshold' },
  alarms: { title: 'Peringatan Darurat', subtitle: 'F-03 & F-04 • Realtime Alert' },
  reports: { title: 'Tren & Laporan', subtitle: 'F-02 • Sparkline 24h' },
  logs: { title: 'Audit Logs', subtitle: 'F-08 • Activity Timeline' },
  settings: { title: 'Perangkat & Jaringan', subtitle: 'F-05 • Connectivity Status' },
  users: { title: 'Kelola Pengguna', subtitle: 'F-07 • Operator Accounts' },
};

type AppStage = 'login' | 'dashboard';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [stage, setStage] = useState<AppStage>('login');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');

  const { logout } = useAuthStore();

  // Opacity untuk cross-fade bersih antar layar Login dan Dashboard
  const contentFadeAnim = useRef(new Animated.Value(1)).current;

  // 1. Alur Selesai Splash: Cukup lepas overlay splash (Login Screen sudah siap di bawahnya)
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // 2. Alur Login Berhasil: Fade out Login halus -> pindah ke dashboard -> Fade in Dashboard halus
  const handleLoginSuccess = () => {
    Animated.timing(contentFadeAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setStage('dashboard');
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    });
  };

  // 3. Alur Logout: Fade out dashboard -> tutup drawer/modal & reset sesi -> Fade in Login
  const handleLogout = () => {
    Animated.timing(contentFadeAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(async ({ finished }) => {
      if (finished) {
        setIsDrawerOpen(false);
        setIsProfileOpen(false);
        await logout();
        setStage('login');
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    });
  };

  const { title, subtitle } =
    SCREEN_TITLES[currentScreen] || SCREEN_TITLES.dashboard;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.safeArea}>
        <StatusBar style={showSplash ? 'light' : stage === 'dashboard' ? 'light' : 'dark'} />

        {/* 1. TAHAP LOGIN SCREEN */}
        {stage === 'login' && (
          <Animated.View style={[styles.stageWrapper, { opacity: contentFadeAnim }]}>
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          </Animated.View>
        )}

        {/* 2. TAHAP DASHBOARD & KONTEN UTAMA */}
        {stage === 'dashboard' && (
          <Animated.View style={[styles.stageWrapper, { opacity: contentFadeAnim }]}>
            {/* Top Header */}
            <Header
              title={title}
              subtitle={subtitle}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Main Content */}
            {currentScreen === 'dashboard' ? (
              <HomeScreen />
            ) : (
              <PlaceholderScreen
                screenId={currentScreen}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}

            {/* Drawer Samping */}
            <MobileSidebar
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              currentScreen={currentScreen}
              onSelectScreen={(screen) => setCurrentScreen(screen)}
              onOpenProfile={() => setIsProfileOpen(true)}
              onLogout={handleLogout}
            />

            {/* Modal Layar Profil */}
            <ProfileScreen
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              onLogout={handleLogout}
            />
          </Animated.View>
        )}

        {/* 3. TAHAP SPLASH SCREEN (Murni Overlay di Atas Layar) */}
        {showSplash && (
          <SplashScreen onFinish={handleSplashFinish} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc', // Warna dasar senada Light Theme agar transisi bebas flickering
  },
  stageWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
