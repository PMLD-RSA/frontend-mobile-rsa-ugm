import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Header } from './src/components/Header';
import { MobileSidebar } from './src/components/Sidebar';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.safeArea}>
        <StatusBar style="light" />

        {/* Top Header */}
        <Header onOpenDrawer={() => setIsDrawerOpen(true)} />

        {/* Main Content */}
        <HomeScreen />

        {/* Drawer Overlay */}
        <MobileSidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
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
