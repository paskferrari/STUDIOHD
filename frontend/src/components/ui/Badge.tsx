import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../../theme/colors';

interface BadgeProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gold' | 'accent';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  icon,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'success': return 'rgba(34, 197, 94, 0.2)';
      case 'warning': return 'rgba(245, 158, 11, 0.2)';
      case 'error': return 'rgba(220, 38, 38, 0.2)';
      case 'gold': return 'rgba(245, 158, 11, 0.2)';
      case 'accent': return 'rgba(220, 38, 38, 0.2)';
      default: return colors.background.elevated;
    }
  };
  
  const getTextColor = (): string => {
    switch (variant) {
      case 'success': return colors.status.success;
      case 'warning': return colors.status.warning;
      case 'error': return colors.status.error;
      case 'gold': return colors.accent.secondary;
      case 'accent': return colors.accent.primary;
      default: return colors.text.secondary;
    }
  };
  
  const isSmall = size === 'sm';
  
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: isSmall ? 2 : spacing.xs,
          paddingHorizontal: isSmall ? spacing.sm : spacing.sm + 2,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSmall ? 10 : 12}
          color={getTextColor()}
          style={{ marginRight: label ? 4 : 0 }}
        />
      )}
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: getTextColor(),
              fontSize: isSmall ? typography.sizes.xs : typography.sizes.sm,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  label: {
    fontWeight: typography.weights.medium,
  },
});
