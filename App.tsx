import React, { useCallback, useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Animated, BackHandler, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Header } from './src/components/Header';
import { MobileSidebar } from './src/components/Sidebar';
import { ScreenTransition } from './src/components/ScreenTransition';
import { HomeScreen } from './src/screens/HomeScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { TankManagementScreen } from './src/screens/TankManagementScreen';
import { AlarmsScreen } from './src/screens/AlarmsScreen';
import { EmergencyAlertBanner } from './src/components/EmergencyAlertBanner';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { AuditLogsScreen } from './src/screens/AuditLogsScreen';
import { DevicesScreen } from './src/screens/DevicesScreen';
import { UsersScreen } from './src/screens/UsersScreen';
import { useAuthStore } from './src/stores/authStore';
import { useTankStore } from './src/stores/tankStore';
import { COLORS } from './src/theme/tokens';
import { ScreenId } from './src/types';

const SCREEN_TITLES: Record<ScreenId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'RSA UGM • SI-POTA' },
  tanks: { title: 'Manajemen Tangki', subtitle: 'Konfigurasi Ambang Batas' },
  alarms: { title: 'Peringatan Darurat', subtitle: 'Monitoring & Resolusi Alert' },
  reports: { title: 'Tren & Laporan', subtitle: 'Riwayat Pembacaan Sensor' },
  logs: { title: 'Audit Logs', subtitle: 'Catatan Aktivitas Sistem' },
  settings: { title: 'Perangkat & Jaringan', subtitle: 'Status Gateway & Node LoRa' },
  users: { title: 'Kelola Pengguna', subtitle: 'Manajemen Akun & Hak Akses' },
};

type AppStage = 'login' | 'dashboard';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [stage, setStage] = useState<AppStage>('login');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');

  const logout = useAuthStore((state) => state.logout);

  // Opacity untuk Dashboard (0 = tersembunyi di balik login, 1 = tampil penuh di atas login)
  const dashboardFadeAnim = useRef(new Animated.Value(0)).current;

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    useTankStore.getState().fetchTanks();

    setIsTransitioning(true);
    setStage('dashboard');
    Animated.timing(dashboardFadeAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsTransitioning(false);
      }
    });
  }, [dashboardFadeAnim]);

  const handleLogout = useCallback(async () => {
    setIsDrawerOpen(false);
    setIsProfileOpen(false);
    setIsTransitioning(true);
    await logout();

    Animated.timing(dashboardFadeAnim, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setStage('login');
        setIsTransitioning(false);
      }
    });
  }, [dashboardFadeAnim, logout]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const openProfile = useCallback(() => setIsProfileOpen(true), []);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);
  const handleSelectScreen = useCallback((screen: ScreenId) => setCurrentScreen(screen), []);

  // Tombol hardware Back Android: kembali ke Dashboard jika sedang di layar lain
  useEffect(() => {
    if (stage !== 'dashboard' || isDrawerOpen || isProfileOpen || currentScreen === 'dashboard') {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setCurrentScreen('dashboard');
      return true;
    });
    return () => sub.remove();
  }, [stage, isDrawerOpen, isProfileOpen, currentScreen]);

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
              onOpenDrawer={openDrawer}
              onOpenProfile={openProfile}
            />
            <EmergencyAlertBanner />

            {/* Main Content dengan transisi halus antar layar */}
            <ScreenTransition key={currentScreen}>
              {currentScreen === 'dashboard' ? (
                <HomeScreen />
              ) : currentScreen === 'tanks' ? (
                <TankManagementScreen />
              ) : currentScreen === 'alarms' ? (
                <AlarmsScreen />
              ) : currentScreen === 'reports' ? (
                <ReportsScreen />
              ) : currentScreen === 'logs' ? (
                <AuditLogsScreen onNavigate={handleSelectScreen} />
              ) : currentScreen === 'settings' ? (
                <DevicesScreen />
              ) : currentScreen === 'users' ? (
                <UsersScreen onNavigate={handleSelectScreen} />
              ) : (
                <HomeScreen />
              )}
            </ScreenTransition>

            {/* Drawer Samping */}
            <MobileSidebar
              isOpen={isDrawerOpen}
              onClose={closeDrawer}
              currentScreen={currentScreen}
              onSelectScreen={handleSelectScreen}
              onOpenProfile={openProfile}
              onLogout={handleLogout}
            />

            {/* Modal Layar Profil */}
            <ProfileScreen
              isOpen={isProfileOpen}
              onClose={closeProfile}
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
    backgroundColor: COLORS.background,
  },
  dashboardWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
