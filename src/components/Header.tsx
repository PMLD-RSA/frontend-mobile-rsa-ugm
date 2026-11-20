import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenDrawer: () => void;
  onOpenProfile?: () => void;
}

/**
 * App Bar Header (Figma Component App Bar: 123:1857)
 * - Tinggi: 64px (+ insets.top)
 * - Background: #0A3F5C (Primary Navy)
 * - Kiri: Ionicons name="menu" (24px, #FFFFFF)
 * - Tengah: Title Inter 18px Bold #FFFFFF, Subtitle Gama-Sans/Inter 11px Regular #F3F1F1
 * - Kanan: Ionicons name="person-circle-outline" (26px, #FFFFFF)
 */
export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard Overview',
  subtitle = 'SV UGM • SI-POTA v1.0',
  onOpenDrawer,
  onOpenProfile,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  return (
    <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 12) }]}>
      <TouchableOpacity
        onPress={onOpenDrawer}
        style={styles.navBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Buka menu navigasi"
      >
        <Ionicons name="menu" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.headerTitleBox}>
        <Text style={styles.headerTitleMain} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.headerTitleSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onOpenProfile || onOpenDrawer}
        style={styles.profileBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Profil pengguna"
      >
        <Ionicons name="person-circle-outline" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A3F5C', // Primary Navy sesuai design.md § 2.1
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  navBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerTitleMain: {
    color: '#FFFFFF',
    fontSize: 18, // Inter 18px Bold sesuai design.md § 4.1
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerTitleSub: {
    color: '#F3F1F1', // Surface Gray sesuai design.md § 4.1
    fontSize: 11,
    marginTop: 2,
    fontWeight: '400',
  },
  profileBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
