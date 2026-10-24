import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../stores/authStore';

export interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    const success = await login(username.trim(), password.trim());
    if (success) {
      // Pertahankan status submitting selama transisi fade out ke dashboard
      onLoginSuccess();
    } else {
      setIsSubmitting(false);
    }
  };

  // Pilihan akun cepat untuk pengujian role tim
  const handleSelectQuickRole = (u: string, p: string) => {
    clearError();
    setUsername(u);
    setPassword(p);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.animatedWrapper}>
          {/* Header & Logo RSA UGM */}
          <View style={styles.headerBox}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>💧</Text>
            </View>
            <Text style={styles.appTitle}>SI-POTA</Text>
            <Text style={styles.appSubtitle}>
              Sistem Informasi Pemantauan Tangki Air
            </Text>
            <Text style={styles.hospitalTag}>
              Rumah Sakit Akademik UGM
            </Text>
          </View>

          {/* Kartu Form Login (Clean Light Medical Surface) */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Masuk ke Akun</Text>
            <Text style={styles.cardDescription}>
              Gunakan akun staf atau teknisi resmi fasilitas RSA UGM.
            </Text>

            {/* Banner Pesan Error */}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Input Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Pengguna (Username)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.fieldIcon}>👤</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan username Anda"
                  placeholderTextColor="#94a3b8"
                  value={username}
                  onChangeText={(text) => {
                    clearError();
                    setUsername(text);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi (Password)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.fieldIcon}>🔒</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan kata sandi"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    clearError();
                    setPassword(text);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tombol Masuk */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (isLoading || isSubmitting) && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading || isSubmitting}
              activeOpacity={0.8}
            >
              {isLoading || isSubmitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loginButtonText}>Memverifikasi...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Masuk ke Sistem</Text>
              )}
            </TouchableOpacity>

            {/* Pemisah Section Akun Uji */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>AKUN PENGUJIAN CEPAT</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Role Tester Pills */}
            <View style={styles.quickRoleContainer}>
              <TouchableOpacity
                style={[
                  styles.rolePill,
                  username === 'admin' && styles.rolePillActive,
                ]}
                onPress={() => handleSelectQuickRole('admin', 'admin123')}
                activeOpacity={0.7}
              >
                <Text style={styles.roleDot}>👑</Text>
                <Text style={styles.rolePillText}>Admin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rolePill,
                  username === 'operator' && styles.rolePillActive,
                ]}
                onPress={() => handleSelectQuickRole('operator', 'operator123')}
                activeOpacity={0.7}
              >
                <Text style={styles.roleDot}>🔧</Text>
                <Text style={styles.rolePillText}>Operator</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rolePill,
                  username === 'viewer' && styles.rolePillActive,
                ]}
                onPress={() => handleSelectQuickRole('viewer', 'viewer123')}
                activeOpacity={0.7}
              >
                <Text style={styles.roleDot}>👁️</Text>
                <Text style={styles.rolePillText}>Viewer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Info Keamanan */}
          <Text style={styles.footerSecurityNote}>
            🔒 Sesi terenkripsi hardware via Expo SecureStore.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc', // Clean Light Background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  animatedWrapper: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0a354c', // Brand Primary
    borderWidth: 2,
    borderColor: '#eab308', // Gold Accent
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  logoIcon: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0a354c',
    letterSpacing: 1.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
    marginTop: 2,
  },
  hospitalTag: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 18,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
    flex: 1,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  fieldIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: 8,
  },
  eyeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#0a354c', // Brand Primary
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#0a354c',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    paddingHorizontal: 10,
    letterSpacing: 0.5,
  },
  quickRoleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rolePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  rolePillActive: {
    borderColor: '#0a354c',
    backgroundColor: 'rgba(10, 53, 76, 0.08)',
  },
  roleDot: {
    fontSize: 12,
    marginRight: 4,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  footerSecurityNote: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 20,
    textAlign: 'center',
  },
});
