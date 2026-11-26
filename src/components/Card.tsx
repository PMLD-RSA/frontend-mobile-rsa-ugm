import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS } from '../theme/tokens';

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
          bg: COLORS.criticalBg,
          border: '#fecaca',
          text: COLORS.criticalText,
          dot: COLORS.critical,
        };
      case 'warning':
        return {
          bg: COLORS.warningBg,
          border: '#fde68a',
          text: COLORS.warningText,
          dot: COLORS.warning,
        };
      case 'success':
        return {
          bg: COLORS.normalBg,
          border: '#a7f3d0',
          text: COLORS.normalText,
          dot: COLORS.normal,
        };
      default:
        return {
          bg: COLORS.infoBg,
          border: '#bae6fd',
          text: COLORS.infoText,
          dot: COLORS.primarySoft,
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
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.textPrimary,
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
    borderRadius: RADIUS.pill,
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
