import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
  BackHandler,
} from 'react-native';

const ugmLogo = require('../../assets/ugm-logo.png');
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useAuthStore } from '../stores/authStore';
import { useAlertStore } from '../stores/alertStore';
import { COLORS, MOTION } from '../theme/tokens';
import { ScreenId } from '../types';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface NavMenuItem {
  id: ScreenId;
  icon: FeatherIconName;
  label: string;
  badge?: boolean;
  adminOnly?: boolean;
}

const MENU_ITEMS: NavMenuItem[] = [
  { id: 'dashboard', icon: 'grid', label: 'Dashboard' },
  { id: 'tanks', icon: 'database', label: 'Tanks' },
  { id: 'alarms', icon: 'bell', label: 'Alarms', badge: true },
  { id: 'reports', icon: 'bar-chart-2', label: 'Reports' },
  { id: 'logs', icon: 'clipboard', label: 'Audit Logs', adminOnly: true },
  { id: 'settings', icon: 'radio', label: 'Devices' },
  { id: 'users', icon: 'users', label: 'Users', adminOnly: true },
];

export interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen?: ScreenId;
  onSelectScreen?: (screen: ScreenId) => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  currentScreen = 'dashboard',
  onSelectScreen,
  onOpenProfile,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const activeAlertsCount = useAlertStore((s) =>
    s.alerts.filter((a) => a.status === 'active').length
  );
  const initials = (user?.username || 'A').slice(0, 2).toUpperCase();
  const { width } = useWindowDimensions();

  // Batasi lebar drawer proporsional terhadap layar (maksimal 320dp)
  const safeWidth = width > 0 ? width : 400;
  const DRAWER_WIDTH = Math.min(safeWidth * 0.75, 320);

  // Single progress value (0 = Tertutup di -DRAWER_WIDTH, 1 = Terbuka di 0)
  const animProgress = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(isOpen);

  // Menangani tombol hardware Back di Android agar menutup drawer
  useEffect(() => {
    if (isOpen) {
      const backAction = () => {
        onClose();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => backHandler.remove();
    }
  }, [isOpen, onClose]);

  // Mengelola animasi Buka dan Tutup secara murni pada sumbu X
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      if (reducedMotion) {
        animProgress.setValue(1);
        return;
      }
      const openAnim = Animated.spring(animProgress, {
        toValue: 1,
        ...MOTION.spring,
        useNativeDriver: true,
      });
      openAnim.start();
      return () => openAnim.stop();
    } else if (isRendered) {
      if (reducedMotion) {
        animProgress.setValue(0);
        setIsRendered(false);
        return;
      }
      const closeAnim = Animated.timing(animProgress, {
        toValue: 0,
        duration: MOTION.normal,
        easing: Easing.bezier(0.36, 0.66, 0.04, 1),
        useNativeDriver: true,
      });
      closeAnim.start(({ finished }) => {
        if (finished) {
          setIsRendered(false);
        }
      });
      return () => closeAnim.stop();
    }
  }, [isOpen, isRendered, animProgress, reducedMotion]);

  if (!isRendered && !isOpen) {
    return null;
  }

  const handleItemPress = (screenId: ScreenId) => {
    onClose();
    if (onSelectScreen) {
      onSelectScreen(screenId);
    }
  };

  const handleProfilePress = () => {
    onClose();
    if (onOpenProfile) {
      onOpenProfile();
    }
  };

  const handleLogoutPress = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Interpolasi opacity backdrop (0 -> 0.6)
  const backdropOpacity = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  // Interpolasi posisi horizontal drawer (-DRAWER_WIDTH -> 0)
  const translateX = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  return (
    <View style={styles.overlay} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* 1. Backdrop Semi-Transparan (Murni Animasi Opacity) */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
          accessibilityLabel="Tutup menu navigasi"
        />
      </Animated.View>

      {/* 2. Sliding Drawer Panel (Murni Animasi TranslateX) */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Header Drawer */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image
              source={ugmLogo}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
              accessibilityLabel="Lambang UGM"
            />
          </View>
          <View style={styles.headerTextBox}>
            <Text style={styles.headerTitle}>SI-POTA</Text>
            <Text style={styles.headerSub}>SV UGM • Mobile</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Tutup menu"
          >
            <Feather name="x" size={18} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.filter((item) => !item.adminOnly || user?.role === 'admin').map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              active={currentScreen === item.id}
              showBadge={Boolean(item.badge && activeAlertsCount > 0)}
              onPress={handleItemPress}
            />
          ))}
        </View>

        {/* Footer Profil Pengguna & Tombol Keluar */}
        <View style={styles.footer}>
          {/* Kartu Profil Klik-able */}
          <TouchableOpacity
            style={styles.profileBox}
            onPress={handleProfilePress}
            activeOpacity={0.75}
            accessibilityLabel="Buka halaman profil"
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfoBox}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user ? user.username : 'Admin'}
              </Text>
              <Text style={styles.profileRole} numberOfLines={1}>
                {user ? user.role.toUpperCase() : 'ADMINISTRATOR'}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.65)" />
          </TouchableOpacity>

          {/* Tombol Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogoutPress}
            activeOpacity={0.75}
            accessibilityLabel="Keluar dari akun"
          >
            <Feather name="log-out" size={16} color="#fca5a5" />
            <Text style={styles.logoutText}>Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

interface MenuItemProps {
  item: NavMenuItem;
  active: boolean;
  showBadge: boolean;
  onPress: (id: ScreenId) => void;
}

const MenuItem: React.FC<MenuItemProps> = React.memo(({ item, active, showBadge, onPress }) => (
  <TouchableOpacity
    style={[styles.menuItem, active && styles.menuItemActive]}
    activeOpacity={0.7}
    onPress={() => onPress(item.id)}
    accessibilityLabel={item.label}
  >
    <View style={styles.iconContainer}>
      <Feather
        name={item.icon}
        size={19}
        color={active ? COLORS.accentBright : 'rgba(255,255,255,0.82)'}
      />
      {showBadge && <View style={styles.badge} />}
    </View>
    <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
      {item.label}
    </Text>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    zIndex: 10000,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.accentBright,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTextBox: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.textOnPrimary,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuList: {
    flex: 1,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  iconContainer: {
    width: 30,
    position: 'relative',
    marginRight: 10,
    alignItems: 'center',
  },
  menuLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 15,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: COLORS.textOnPrimary,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    backgroundColor: COLORS.critical,
    borderRadius: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.accentBright,
  },
  profileAvatarText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  profileInfoBox: {
    flex: 1,
  },
  profileName: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  profileRole: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: 0.3,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 8,
    minHeight: 42,
  },
  logoutText: {
    color: '#fca5a5',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
