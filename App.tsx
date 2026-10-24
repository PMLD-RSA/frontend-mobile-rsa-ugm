import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Header } from './src/components/Header';
import { MobileSidebar } from './src/components/Sidebar';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
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

export default function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');

  const { title, subtitle } = SCREEN_TITLES[currentScreen] || SCREEN_TITLES.dashboard;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.safeArea}>
        <StatusBar style="light" />

        {/* Top Header: Hamburger menu '≡' selalu aktif untuk membuka Drawer */}
        <Header
          title={title}
          subtitle={subtitle}
          onOpenDrawer={() => setIsDrawerOpen(true)}
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

        {/* Drawer Overlay */}
        <MobileSidebar
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentScreen={currentScreen}
          onSelectScreen={(screen) => setCurrentScreen(screen)}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
