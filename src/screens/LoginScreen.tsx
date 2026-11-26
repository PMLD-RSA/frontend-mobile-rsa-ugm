import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { COLORS, RADIUS } from '../theme/tokens';

export interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState(__DEV__ ? 'admin' : '');
  const [password, setPassword] = useState(__DEV__ ? 'admin123' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    const success = await login(username.trim(), password.trim());
    if (success) {
      onLoginSuccess();
    } else {
      setIsSubmitting(false);
    }
  };

  const handleSelectQuickRole = (u: string, p: string) => {
    clearError();
    setUsername(u);
    setPassword(p);
  };

  const isSubmitDisabled = isLoading || isSubmitting || !username.trim() || !password.trim();

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.animatedWrapper}>
          {/* Header & Logo RSA UGM */}
          <View style={styles.headerBox}>
            <View style={styles.logoBadge}>
              <Image
                source={require('../../assets/ugm-logo.png')}
                style={{ width: 66, height: 66 }}
                resizeMode="contain"
                accessibilityLabel="Lambang UGM"
              />
            </View>
            <Text style={styles.appTitle}>SI-POTA</Text>
            <Text style={styles.appSubtitle}>
              Sistem Informasi Pemantauan Tangki Air
            </Text>
            <Text style={styles.hospitalTag}>
              Rumah Sakit Akademik UGM
            </Text>
          </View>

          {/* Kartu Form Login */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Masuk ke Akun</Text>
            <Text style={styles.cardDescription}>
              Gunakan akun staf atau teknisi resmi fasilitas RSA UGM.
            </Text>

            {error && (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <Feather name="alert-circle" size={16} color={COLORS.criticalText} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Input Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Pengguna (Username)</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'username' && styles.inputContainerFocused,
                ]}
              >
                <Feather
                  name="user"
                  size={16}
                  color={focusedField === 'username' ? COLORS.primarySoft : COLORS.textMuted}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan username Anda"
                  placeholderTextColor="#94a3b8"
                  value={username}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(text) => {
                    clearError();
                    setUsername(text);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi (Password)</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'password' && styles.inputContainerFocused,
                ]}
              >
                <Feather
                  name="lock"
                  size={16}
                  color={focusedField === 'password' ? COLORS.primarySoft : COLORS.textMuted}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan kata sandi"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(text) => {
                    clearError();
                    setPassword(text);
                  }}
                  onSubmitEditing={handleLogin}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={17}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tombol Masuk */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isSubmitDisabled && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isSubmitDisabled}
              activeOpacity={0.8}
            >
              {isLoading || isSubmitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={COLORS.textOnPrimary} />
                  <Text style={styles.loginButtonText}>Memverifikasi...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Masuk ke Sistem</Text>
              )}
            </TouchableOpacity>

            {/* Quick Role Tester Pills (hanya aktif saat mode development) */}
            {__DEV__ && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>AKUN PENGUJIAN (DEV)</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.quickRoleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.rolePill,
                      username === 'admin' && styles.rolePillActive,
                    ]}
                    onPress={() => handleSelectQuickRole('admin', 'admin123')}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="shield"
                      size={13}
                      color={username === 'admin' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.rolePillText,
                        username === 'admin' && styles.rolePillTextActive,
                      ]}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.rolePill,
                      username === 'operator' && styles.rolePillActive,
                    ]}
                    onPress={() => handleSelectQuickRole('operator', 'operator123')}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="tool"
                      size={13}
                      color={username === 'operator' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.rolePillText,
                        username === 'operator' && styles.rolePillTextActive,
                      ]}
                    >
                      Operator
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.rolePill,
                      username === 'viewer' && styles.rolePillActive,
                    ]}
                    onPress={() => handleSelectQuickRole('viewer', 'viewer123')}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="eye"
                      size={13}
                      color={username === 'viewer' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.rolePillText,
                        username === 'viewer' && styles.rolePillTextActive,
                      ]}
                    >
                      Viewer
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Footer Info Keamanan */}
          <View style={styles.footerSecurityRow}>
            <Feather name="shield" size={12} color={COLORS.textMuted} />
            <Text style={styles.footerSecurityNote}>
              Sesi terenkripsi via Expo SecureStore
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.accentBright,
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
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.heading,
    letterSpacing: 1.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  hospitalTag: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.textPrimary,
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
    color: COLORS.heading,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 18,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.criticalBg,
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.sm + 2,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.criticalText,
    flex: 1,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  inputContainerFocused: {
    borderColor: COLORS.primarySoft,
    backgroundColor: COLORS.surface,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 8,
  },
  eyeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
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
    opacity: 0.65,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
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
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
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
    gap: 5,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm + 2,
    paddingVertical: 8,
    paddingHorizontal: 6,
    minHeight: 38,
  },
  rolePillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.infoBg,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  rolePillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  footerSecurityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  footerSecurityNote: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
