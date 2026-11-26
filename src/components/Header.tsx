import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { COLORS } from '../theme/tokens';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenDrawer: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard Overview',
  subtitle = 'RSA UGM • SI-POTA v1.0',
  onOpenDrawer,
  onOpenProfile,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const initials = (user?.username || 'U').slice(0, 2).toUpperCase();

  return (
    <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 12) }]}>
      <TouchableOpacity
        onPress={onOpenDrawer}
        style={styles.navBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Buka menu navigasi"
      >
        <Feather name="menu" size={22} color={COLORS.textOnPrimary} />
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
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  navBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  headerTitleMain: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerTitleSub: {
    color: 'rgba(255, 255, 255, 0.78)',
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accentBright,
  },
  avatarInitials: {
    color: COLORS.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
