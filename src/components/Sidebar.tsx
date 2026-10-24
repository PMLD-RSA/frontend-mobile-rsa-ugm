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

export const MobileSidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
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
      // Animasi Buka: Meluncur dari kiri dengan kurva spring natural
      Animated.spring(animProgress, {
        toValue: 1,
        damping: 28,
        stiffness: 260,
        mass: 0.85,
        useNativeDriver: true,
      }).start();
    } else if (isRendered) {
      // Animasi Tutup: Meluncur kembali ke kiri dengan kurva bezier halus
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

  // Jika drawer sedang tertutup penuh, jangan render apa pun agar hemat memori & bebas touch blockage
  if (!isRendered) {
    return null;
  }

  // Interpolasi posisi horizontal drawer (seluruh elemen bergerak 100% bersamaan pada sumbu X)
  const translateX = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
    extrapolate: 'clamp',
  });

  // Interpolasi opasitas latar belakang gelap (dari 0 ke 0.55)
  const backdropOpacity = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.55],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Dark Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
          accessibilityLabel="Tutup menu samping"
        />
      </Animated.View>

      {/* Sliding Drawer Container: Header, menu list, dan footer profil adalah 1 kesatuan kaku */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Header Drawer Logo */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>⬡</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>RSA UGM</Text>
            <Text style={styles.headerSub}>SI-POTA v1.0</Text>
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
          <MenuItem icon="⊞" label="Dashboard" active />
          <MenuItem icon="⛁" label="Tanks" />
          <MenuItem icon="🔔" label="Alarms" badge />
          <MenuItem icon="📊" label="Reports" />
          <MenuItem icon="📋" label="Audit Logs" />
          <MenuItem icon="⚙️" label="Settings" />
          <MenuItem icon="👥" label="Users" />
        </View>

        {/* Footer Profil Pengguna - Statis di dalam container drawer */}
        <View style={styles.footer}>
          <View style={styles.profileBox}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarIcon}>👤</Text>
            </View>
            <View>
              <Text style={styles.profileName}>
                {user ? user.username : 'Admin'}
              </Text>
              <Text style={styles.profileRole}>
                {user ? user.role.toUpperCase() : 'ADMIN'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const MenuItem = ({ icon, label, active, badge }: any) => (
  <TouchableOpacity
    style={[styles.menuItem, active && styles.menuItemActive]}
    activeOpacity={0.7}
    accessibilityLabel={label}
  >
    <View style={styles.iconContainer}>
      <Text style={[styles.menuIcon, active && styles.menuIconActive]}>
        {icon}
      </Text>
      {badge && <View style={styles.badge} />}
    </View>
    <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
      {label}
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
    backgroundColor: '#0a354c', // Dark blue-teal
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
    borderWidth: 1,
    borderColor: '#eab308',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoIcon: {
    color: '#eab308',
    fontSize: 20,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  closeBtn: {
    marginLeft: 'auto',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: 'white',
    fontSize: 20,
  },
  menuList: {
    flex: 1,
    padding: 10,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    minHeight: 44,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    marginRight: 12,
    position: 'relative',
  },
  menuIcon: {
    fontSize: 18,
    color: '#eab308',
    opacity: 0.8,
  },
  menuIconActive: {
    opacity: 1,
  },
  menuLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: 'white',
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
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c4a6e',
    padding: 12,
    borderRadius: 8,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileAvatarIcon: {
    color: 'white',
  },
  profileName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileRole: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});
