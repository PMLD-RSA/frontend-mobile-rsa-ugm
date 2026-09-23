import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Platform } from 'react-native';
import axios from 'axios';
import { Card, Badge } from './src/components/Card';

export default function App() {
  const [tanks, setTanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gunakan IP lokal mesin Anda untuk BFF Web (bukan localhost, karena emulator Android butuh 10.0.2.2)
  // Ubah 'http://10.0.2.2:3000' menjadi IP IPv4 LAN Anda jika ditest di HP fisik (misal: 'http://192.168.1.15:3000')
  const BFF_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monitoring RSA UGM</Text>
        <Badge text="BFF Connected" variant="success" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
      ) : (
        tanks.map(tank => (
          <Card key={tank.id}>
            <Text style={styles.tankName}>{tank.name}</Text>
            <Text style={styles.location}>{tank.location}</Text>
            
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>75%</Text>
              <Text style={styles.levelSub}>SIMULASI AKTUAL</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Kapasitas: {(tank.capacityLiters/1000).toFixed(1)}k L</Text>
              <Text style={styles.footerTextError}>Min: {tank.minThresholdPercent}%</Text>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingTop: 60,
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
