import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';

export interface HeaderProps {
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
        style={styles.navBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Buka menu navigasi"
      >
        <Text style={styles.menuIcon}>≡</Text>
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
        onPress={onOpenDrawer}
        style={styles.profileBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Profil pengguna"
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.profileIcon}>{user ? '👤' : '⚙️'}</Text>
        </View>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  navBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  headerTitleMain: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerTitleSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    marginTop: 1,
  },
  profileBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 16,
  },
});
