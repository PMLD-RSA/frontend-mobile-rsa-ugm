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
import { useTankStore } from './src/stores/tankStore';
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');

  const { logout } = useAuthStore();

  // Opacity untuk Dashboard (0 = tersembunyi di balik login, 1 = tampil penuh di atas login)
  const dashboardFadeAnim = useRef(new Animated.Value(0)).current;

  // 1. Selesai Splash: Cukup lepas overlay splash (Login Screen sudah siap di bawahnya)
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // 2. Alur Login Berhasil:
  // Render Dashboard di atas LoginScreen secara absolut, lalu cross-dissolve fade-in 0 -> 1.
  // LoginScreen tetap tenang di bawahnya tanpa jump, flash, atau pergeseran posisi.
  const handleLoginSuccess = () => {
    // Mulai pre-fetch tank telemetri lebih awal agar saat dashboard tampil data sudah siap
    useTankStore.getState().fetchTanks();

    setIsTransitioning(true);
    setStage('dashboard');
    Animated.timing(dashboardFadeAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsTransitioning(false);
      }
    });
  };

  // 3. Alur Logout:
  // Tutup drawer/modal, aktifkan LoginScreen di layer bawah, lalu fade-out Dashboard 1 -> 0.
  const handleLogout = async () => {
    setIsDrawerOpen(false);
    setIsProfileOpen(false);
    setIsTransitioning(true);
    await logout();

    Animated.timing(dashboardFadeAnim, {
      toValue: 0,
      duration: 240,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setStage('login');
        setIsTransitioning(false);
      }
    });
  };

  const { title, subtitle } =
    SCREEN_TITLES[currentScreen] || SCREEN_TITLES.dashboard;

  const renderLogin = stage === 'login' || isTransitioning;
  const renderDashboard = stage === 'dashboard' || isTransitioning;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.safeArea}>
        <StatusBar
          style={
            showSplash || (stage === 'dashboard' && !isTransitioning)
              ? 'light'
              : 'dark'
          }
        />

        {/* LAYER 1: LOGIN SCREEN (Layer bawah stabil tanpa pergeseran layout) */}
        {renderLogin && (
          <View style={StyleSheet.absoluteFill}>
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          </View>
        )}

        {/* LAYER 2: DASHBOARD & KONTEN UTAMA (Layer atas dengan cross-dissolve opacity) */}
        {renderDashboard && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.dashboardWrapper,
              { opacity: dashboardFadeAnim },
            ]}
          >
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

        {/* LAYER 3: SPLASH SCREEN (Murni Overlay di Atas Layar saat start-up) */}
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
    backgroundColor: '#f8fafc',
  },
  dashboardWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
