import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenId, PlaceholderConfig } from '../types';

const PLACEHOLDER_DATA: Record<Exclude<ScreenId, 'dashboard'>, PlaceholderConfig> = {
  tanks: {
    id: 'tanks',
    title: 'Manajemen Tangki Air',
    icon: '⛁',
    description:
      'Halaman ini sedang dalam pengembangan. Mobile team dapat mengimplementasikan Quick Threshold Sheet untuk kalibrasi ambang batas min/max % dan master tangki sesuai PRD-Mobile.md § 4.6.',
    prdSection: 'PRD-Mobile.md § 4.6 (F-06)',
    prdUrl:
      'https://github.com/PMLD-RSA/frontend-mobile-rsa-ugm/blob/dev/docs/PRD-Mobile.md#46-f-06-manajemen-master-tangki-ringkas-quick-threshold-sheet--khusus-admin',
    checklist: [
      'Quick Threshold Bottom Sheet (min/max %)',
      'Form edit ambang batas kapasitas (PUT /api/tanks/:id)',
      'Indikator status batas kritis / peringatan',
      'Role guard khusus Admin',
    ],
  },
  alarms: {
    id: 'alarms',
    title: 'Peringatan & Resolusi Darurat',
    icon: '🔔',
    description:
      'Halaman ini sedang dalam pengembangan. Mobile team dapat mengimplementasikan daftar riwayat alert dan penyelesaian peringatan darurat langsung di lapangan sesuai PRD-Mobile.md § 4.3 & 4.4.',
    prdSection: 'PRD-Mobile.md § 4.3 & 4.4 (F-03 & F-04)',
    prdUrl:
      'https://github.com/PMLD-RSA/frontend-mobile-rsa-ugm/blob/dev/docs/PRD-Mobile.md#43-f-03-peringatan-darurat-realtime-in-app-emergency-alert',
    checklist: [
      'Daftar riwayat alert aktif (GET /api/alerts)',
      'Tombol penyelesaian lapangan (PATCH /api/alerts/:id/resolve)',
      'Haptic feedback & in-app emergency alert banner',
      'Konfirmasi fisik inspeksi tangki',
    ],
  },
  reports: {
    id: 'reports',
    title: 'Tren Riwayat & Laporan',
    icon: '📊',
    description:
      'Halaman ini sedang dalam pengembangan. Mobile team dapat mengimplementasikan visualisasi sparkline tren air 24 jam dan riwayat pembacaan sensor sesuai PRD-Mobile.md § 4.2.',
    prdSection: 'PRD-Mobile.md § 4.2 (F-02)',
    prdUrl:
      'https://github.com/PMLD-RSA/frontend-mobile-rsa-ugm/blob/dev/docs/PRD-Mobile.md#42-f-02-tren-riwayat-air-24-jam-ringkas-sparkline-trend',
    checklist: [
      'Tren grafik garis ringkas 24 jam (Sparkline)',
      'Riwayat pembacaan sensor (GET /api/tanks/:id/readings)',
      'Ringkasan rata-rata konsumsi harian',
      'Filter rentang waktu 24 jam / 7 hari',
    ],
  },
  logs: {
    id: 'logs',
    title: 'Feed Aktivitas & Audit Log',
    icon: '📋',
    description:
      'Halaman ini sedang dalam pengembangan. Mobile team dapat mengimplementasikan timeline aktivitas 20 log terakhir ramah baca sesuai PRD-Mobile.md § 4.8.',
    prdSection: 'PRD-Mobile.md § 4.8 (F-08)',
    prdUrl:
      'https://github.com/PMLD-RSA/frontend-mobile-rsa-ugm/blob/dev/docs/PRD-Mobile.md#48-f-08-feed-aktivitas-terbaru-recent-activity-timeline--khusus-opadmin',
    checklist: [
      'Timeline feed 20 aktivitas terakhir (GET /api/audit-logs?limit=20)',
      'Format naratif ramah baca (nama, aksi, waktu lampau)',
      'Badge kategori aksi (Auth / Tank / Alert / User)',
      'Role guard Operator & Administrator',
    ],
  },
  settings: {
    id: 'settings',
    title: 'Perangkat Sensor & Jaringan',
    icon: '⚙️',
    description:
      'Halaman ini sedang dalam pengembangan. Mobile team dapat mengimplementasikan status modul radio LoRa STM32 & Raspberry Pi Hub sesuai PRD-Mobile.md § 4.5.',
    prdSection: 'PRD-Mobile.md § 4.5 (F-05)',
    prdUrl:
      'https://github.com/PMLD-RSA/frontend-mobile-rsa-ugm/blob/dev/docs/PRD-Mobile.md#45-f-05-status-perangkat-lapangan-connectivity-status',
    checklist: [
      'Status sinyal LoRa RSSI & last heartbeat (dBm)',
      'Status gateway Raspberry Pi Hub (online/offline)',
      'Konfigurasi IP Web BFF & WebSocket Core',
      'Uji latensi koneksi realtime',
    ],
  },
  users: {
    id: 'users',
    title: 'Manajemen Pengguna & Operator',
    icon: '👥',
    description:
      'Halaman ini sedang dalam pengembangan. Mobile team dapat mengimplementasikan kontrol darurat aktivasi akun operator langsung dari HP sesuai PRD-Mobile.md § 4.7.',
    prdSection: 'PRD-Mobile.md § 4.7 (F-07)',
    prdUrl:
      'https://github.com/PMLD-RSA/frontend-mobile-rsa-ugm/blob/dev/docs/PRD-Mobile.md#47-f-07-manajemen-pengguna-ringkas-mobile-operator-management--khusus-admin',
    checklist: [
      'Daftar akun operator (GET /api/users)',
      'Toggle switch aktivasi/deaktivasi operator',
      'Reset sandi sementara darurat di lapangan',
      'Role guard mutlak khusus Administrator',
    ],
  },
};

interface PlaceholderScreenProps {
  screenId: Exclude<ScreenId, 'dashboard'>;
  onNavigate: (screen: ScreenId) => void;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  screenId,
  onNavigate,
}) => {
  const insets = useSafeAreaInsets();
  const config = PLACEHOLDER_DATA[screenId] || PLACEHOLDER_DATA.tanks;

  // Tangani hardware Back button untuk kembali ke dashboard
  useEffect(() => {
    const backAction = () => {
      onNavigate('dashboard');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onNavigate]);

  const handleOpenPrd = () => {
    Linking.openURL(config.prdUrl).catch(() => {
      // Fallback url bila link spesifik gagal dibuka
      Linking.openURL(
        'https://github.com/PMLD-RSA/frontend-mobile-rsa-ugm/blob/dev/docs/PRD-Mobile.md'
      );
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, 28) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Icon Badge */}
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{config.icon}</Text>
      </View>

      {/* Title & Description */}
      <View style={styles.headerBlock}>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>
          Halaman ini sedang dalam pengembangan. Mobile team dapat mengimplementasikan fitur
          ini sesuai <Text style={styles.boldText}>{config.prdSection}</Text>.
        </Text>
      </View>

      {/* Checklist Box */}
      <View style={styles.checklistCard}>
        <Text style={styles.checklistTitle}>📋 Yang perlu diimplementasi:</Text>
        <View style={styles.checklistItems}>
          {config.checklist.map((item, idx) => (
            <View key={idx} style={styles.checklistItemRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.checklistItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => onNavigate('dashboard')}
          activeOpacity={0.7}
          accessibilityLabel="Kembali ke Dashboard"
        >
          <Text style={styles.btnSecondaryText}>← Kembali ke Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleOpenPrd}
          activeOpacity={0.7}
          accessibilityLabel="Buka PRD Mobile"
        >
          <Text style={styles.btnPrimaryText}>
            📖 Lihat {config.prdSection.split(' ')[0]} →
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 32,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 24,
    maxWidth: 340,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '700',
    color: '#1e3a8a',
  },
  checklistCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 16,
    marginBottom: 28,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  checklistItems: {
    gap: 6,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    color: '#2563eb',
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  checklistItemText: {
    flex: 1,
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 18,
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 360,
    gap: 12,
  },
  btnSecondary: {
    width: '100%',
    minHeight: 46,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  btnPrimary: {
    width: '100%',
    minHeight: 46,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
