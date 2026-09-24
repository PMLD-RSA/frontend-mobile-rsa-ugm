import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, useWindowDimensions, Modal } from 'react-native';

export const MobileSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { width } = useWindowDimensions();
  // Provide a safe fallback width just in case useWindowDimensions is 0 momentarily
  const safeWidth = width > 0 ? width : 400; 
  const DRAWER_WIDTH = Math.min(safeWidth * 0.75, 320);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [modalVisible, setModalVisible] = useState(isOpen);

  // 1. Handle Mounting and Unmounting
  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
    } else {
      // If closing, animate out FIRST, then hide modal
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [isOpen, DRAWER_WIDTH, fadeAnim, slideAnim]);

  // 2. Handle Animation In (ONLY AFTER component is mounted)
  useEffect(() => {
    if (modalVisible && isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [modalVisible, isOpen, fadeAnim, slideAnim]);

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.overlay}>
        {/* Dark Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={onClose} activeOpacity={1} />
        </Animated.View>
        
        {/* Sliding Drawer */}
        <Animated.View style={[styles.drawer, { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] }]}>
          {/* Header Logo */}
          <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>⬡</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>RSA UGM</Text>
            <Text style={styles.headerSub}>SI-POTA v1.0</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
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

        {/* Footer Profile */}
        <View style={styles.footer}>
          <View style={styles.profileBox}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarIcon}>👤</Text>
            </View>
            <View>
              <Text style={styles.profileName}>Budi</Text>
              <Text style={styles.profileRole}>Admin</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  </Modal>
  );
};

const MenuItem = ({ icon, label, active, badge }: any) => (
  <TouchableOpacity style={[styles.menuItem, active && styles.menuItemActive]}>
    <View style={styles.iconContainer}>
      <Text style={[styles.menuIcon, active && styles.menuIconActive]}>{icon}</Text>
      {badge && <View style={styles.badge} />}
    </View>
    <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#0a354c', // Dark blue-teal
    paddingTop: Platform.OS === 'android' ? 40 : 20,
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
    padding: 5,
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
    color: '#eab308', // Yellow icons
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
    backgroundColor: 'red',
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
    backgroundColor: '#0c4a6e', // Lighter blue for active box
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
  }
});
