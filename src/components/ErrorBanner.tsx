import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../theme/tokens';

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  retryLabel = 'Coba Lagi',
}) => (
  <View style={styles.container} accessibilityRole="alert">
    <View style={styles.messageRow}>
      <Feather name="alert-circle" size={16} color={COLORS.criticalText} />
      <Text style={styles.message}>{message}</Text>
    </View>
    {onRetry ? (
      <TouchableOpacity
        onPress={onRetry}
        style={styles.retryBtn}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={retryLabel}
      >
        <Text style={styles.retryText}>{retryLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.criticalBg,
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  messageRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  message: {
    color: COLORS.criticalText,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: COLORS.critical,
    paddingHorizontal: 14,
    minHeight: 40,
    borderRadius: RADIUS.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: COLORS.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});
