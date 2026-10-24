import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { ScreenId } from '../types';

interface NavMenuItem {
  id: ScreenId;
  icon: string;
  label: string;
  badge?: boolean;
}

const MENU_ITEMS: NavMenuItem[] = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'tanks', icon: '⛁', label: 'Tanks' },
  { id: 'alarms', icon: '🔔', label: 'Alarms', badge: true },
  { id: 'reports', icon: '📊', label: 'Reports' },
  { id: 'logs', icon: '📋', label: 'Audit Logs' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
  { id: 'users', icon: '👥', label: 'Users' },
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
  const user = useAuthStore((s) => s.user);
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
      Animated.spring(animProgress, {
        toValue: 1,
        damping: 28,
        stiffness: 260,
        mass: 0.85,
        useNativeDriver: true,
      }).start();
    } else if (isRendered) {
      Animated.timing(animProgress, {
        toValue: 0,
        duration: 220,
        easing: Easing.bezier(0.36, 0.66, 0.04, 1),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsRendered(false);
        }
      });
    }
  }, [isOpen, isRendered, animProgress]);

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
            <Text style={styles.logoIcon}>💧</Text>
          </View>
          <View style={styles.headerTextBox}>
            <Text style={styles.headerTitle}>SI-POTA</Text>
            <Text style={styles.headerSub}>RSA UGM • Mobile</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Tutup menu"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              active={currentScreen === item.id}
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
              <Text style={styles.profileAvatarIcon}>👤</Text>
            </View>
            <View style={styles.profileInfoBox}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user ? user.username : 'Admin'}
              </Text>
              <Text style={styles.profileRole} numberOfLines={1}>
                {user ? user.role.toUpperCase() : 'ADMINISTRATOR'}
              </Text>
            </View>
            <Text style={styles.profileArrow}>›</Text>
          </TouchableOpacity>

          {/* Tombol Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogoutPress}
            activeOpacity={0.75}
            accessibilityLabel="Keluar dari akun"
          >
            <Text style={styles.logoutIcon}>🚪</Text>
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
  onPress: (id: ScreenId) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, active, onPress }) => (
  <TouchableOpacity
    style={[styles.menuItem, active && styles.menuItemActive]}
    activeOpacity={0.7}
    onPress={() => onPress(item.id)}
    accessibilityLabel={item.label}
  >
    <View style={styles.iconContainer}>
      <Text style={[styles.menuIcon, active && styles.menuIconActive]}>
        {item.icon}
      </Text>
      {item.badge && <View style={styles.badge} />}
    </View>
    <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
      {item.label}
    </Text>
  </TouchableOpacity>
);

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
    backgroundColor: '#0a354c', // Brand Primary
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
    borderColor: '#eab308',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoIcon: {
    fontSize: 18,
  },
  headerTextBox: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
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
  closeBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
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
  menuIcon: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
  },
  menuIconActive: {
    color: '#38bdf8',
  },
  menuLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
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
    borderColor: '#eab308',
  },
  profileAvatarIcon: {
    fontSize: 18,
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
  profileArrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 4,
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
  logoutIcon: {
    fontSize: 15,
  },
  logoutText: {
    color: '#fca5a5',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
