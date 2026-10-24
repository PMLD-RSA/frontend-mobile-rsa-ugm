import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';

export type BadgeVariant = 'critical' | 'warning' | 'success' | 'info';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  showDot?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'info',
  style,
  textStyle,
  showDot = true,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'critical':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#991b1b',
          dot: '#ef4444',
        };
      case 'warning':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
          dot: '#f59e0b',
        };
      case 'success':
        return {
          bg: '#ecfdf5',
          border: '#a7f3d0',
          text: '#065f46',
          dot: '#10b981',
        };
      default:
        return {
          bg: '#eff6ff',
          border: '#bfdbfe',
          text: '#1e40af',
          dot: '#3b82f6',
        };
    }
  };
  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: colors.border },
        style,
      ]}
    >
      {showDot && (
        <View style={[styles.dot, { backgroundColor: colors.dot }]} />
      )}
      <Text style={[styles.badgeText, { color: colors.text }, textStyle]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
