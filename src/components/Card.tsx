import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Card = ({ children, style }: any) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

export const Badge = ({ text, variant = 'info' }: any) => {
  const getColors = () => {
    switch (variant) {
      case 'critical': return { bg: '#fee2e2', text: '#991b1b' };
      case 'warning': return { bg: '#fef3c7', text: '#92400e' };
      case 'success': return { bg: '#dcfce3', text: '#166534' };
      default: return { bg: '#dbeafe', text: '#1e40af' };
    }
  };
  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});
