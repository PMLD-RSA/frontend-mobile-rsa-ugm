import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';

export interface ProfileScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);

  const [isRendered, setIsRendered] = useState(isOpen);

  // Nilai animasi: 0 = tertutup di bawah, 1 = terbuka penuh
  const animProgress = useRef(new Animated.Value(0)).current;

  // Tangani hardware Back Button di Android
  useEffect(() => {
    if (isOpen) {
      const backAction = () => {
        handleClose();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => backHandler.remove();
    }
  }, [isOpen]);

  // Kelola animasi Buka dan Tutup
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      Animated.spring(animProgress, {
        toValue: 1,
        damping: 26,
        stiffness: 240,
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

  const handleClose = () => {
    Animated.timing(animProgress, {
      toValue: 0,
      duration: 200,
      easing: Easing.bezier(0.36, 0.66, 0.04, 1),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  };

  const handleLogoutPress = () => {
    if (onLogout) {
      onLogout();
    }
  };

  if (!isRendered && !isOpen) {
    return null;
  }

  // Interpolasi backdrop fade (0% -> 50% hitam)
  const backdropOpacity = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.55],
  });

  // Interpolasi slide up dari bawah layar
  const translateY = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [height > 0 ? height * 0.7 : 500, 0],
  });

  // Warna badge role
  const role = user?.role || 'admin';
  const roleColor =
    role === 'admin' ? '#0a354c' : role === 'operator' ? '#0284c7' : '#64748b';
  const roleLabel =
    role === 'admin'
      ? 'ADMINISTRATOR'
      : role === 'operator'
      ? 'OPERATOR LAPANGAN'
      : 'VIEWER MEDIS';

  return (
    <View style={styles.overlay} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Backdrop semi-transparan untuk menutup modal jika ditekan */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          activeOpacity={1}
          accessibilityLabel="Tutup profil"
        />
      </Animated.View>

      {/* Sheet Konten Profil Meluncur dari Bawah */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            paddingBottom: Math.max(insets.bottom, 24),
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Handle bar kecil di atas modal */}
        <View style={styles.dragHandleBox}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header Modal Profil */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Profil Pengguna</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Tutup profil"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section: Foto Profil Placeholder & Nama */}
        <View style={styles.profileHero}>
          <View style={[styles.avatarRing, { borderColor: roleColor }]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
          </View>
          <Text style={styles.userName}>
            {user ? user.username : 'Petugas Fasilitas'}
          </Text>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: `${roleColor}18`, borderColor: roleColor },
            ]}
          >
            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
            <Text style={[styles.roleText, { color: roleColor }]}>
              {roleLabel}
            </Text>
          </View>
        </View>

        {/* Detail Informasi Akun */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status Sesi</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDotGreen} />
              <Text style={styles.statusTextGreen}>Aktif (Tersinkron)</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Institusi</Text>
            <Text style={styles.infoValue}>RSA Universitas Gadjah Mada</Text>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hak Akses</Text>
            <Text style={styles.infoValue}>
              {role === 'admin'
                ? 'Full Control & Kalibrasi'
                : role === 'operator'
                ? 'Resolve Alert & Monitoring'
                : 'Pemantauan Read-Only'}
            </Text>
          </View>
        </View>

        {/* Tombol Aksi */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogoutPress}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutBtnText}>Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0a354c',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandleBox: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '700',
  },
  profileHero: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  avatarCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 38,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  statusDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 5,
  },
  statusTextGreen: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  actionSection: {
    gap: 10,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    minHeight: 46,
    gap: 6,
  },
  logoutIcon: {
    fontSize: 16,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
  },
});
