import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard Overview',
  subtitle = 'RSA UGM • SI-POTA v1.0',
  onOpenDrawer,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  return (
    <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 12) }]}>
      <TouchableOpacity
        onPress={onOpenDrawer}
        style={styles.menuBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Buka menu navigasi"
      >
        <Text style={styles.menuIcon}>≡</Text>
      </TouchableOpacity>

      <View style={styles.headerTitleBox}>
        <Text style={styles.headerTitleMain}>{title}</Text>
        <Text style={styles.headerTitleSub}>{subtitle}</Text>
      </View>

      <TouchableOpacity
        onPress={onOpenDrawer}
        style={styles.profileBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Profil pengguna"
      >
        <Text style={styles.profileIcon}>{user ? '👤' : '⚙️'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a354c',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitleMain: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitleSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  profileBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 18,
  },
});
