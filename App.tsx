import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Platform, TouchableOpacity, StatusBar } from 'react-native';
import axios from 'axios';
import { Card, Badge } from './src/components/Card';
import { MobileSidebar } from './src/components/Sidebar';

export default function App() {
  const [tanks, setTanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Gunakan IP lokal mesin Anda untuk BFF Web (bukan localhost, karena emulator Android butuh 10.0.2.2)
  // Ubah 'http://10.0.2.2:3000' menjadi IP IPv4 LAN Anda jika ditest di HP fisik (misal: 'http://192.168.1.15:3000')
  const BFF_URL = 'http://10.33.195.43:3000'; // IP Laptop Anda (WiFi Tethering/Kampus)

  useEffect(() => {
    axios.get(`${BFF_URL}/api/tanks`)
      .then(res => {
        setTanks(res.data.data);
      })
      .catch(err => {
        console.error("Gagal konek ke BFF. Pastikan Web Staging berjalan di port 3000", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a354c" />
      
      {/* Top Header matching Figma */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>≡</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitleMain}>Dashboard Overview</Text>
          <Text style={styles.headerTitleSub}>RSA UGM • SI-POTA v1.0</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pemantauan Tangki</Text>
          <Badge text="BFF Connected" variant="success" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0a354c" style={{ marginTop: 50 }} />
        ) : (
          tanks.map(tank => (
            <Card key={tank.id}>
              <Text style={styles.tankName}>{tank.name}</Text>
              <Text style={styles.location}>{tank.location}</Text>
              
              <View style={styles.levelContainer}>
                <Text style={styles.levelText}>75%</Text>
                <Text style={styles.levelSub}>LEVEL AIR AKTUAL</Text>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Kapasitas: {(tank.capacityLiters/1000).toFixed(1)}k L</Text>
                <Text style={styles.footerTextError}>Min: {tank.minThresholdPercent}%</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Drawer Overlay */}
      <MobileSidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc', 
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a354c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 40 : 12, // Status bar padding for non-SafeAreaView
  },
  menuBtn: {
    padding: 4,
  },
  menuIcon: {
    color: 'white',
    fontSize: 28,
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitleMain: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitleSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    color: 'white',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  tankName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  location: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  levelContainer: {
    backgroundColor: '#f1f5f9',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  levelText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  levelSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#475569',
  },
  footerTextError: {
    fontSize: 12,
    color: '#b45309',
  }
});
