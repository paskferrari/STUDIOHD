import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, spacing, typography } from '../../theme/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: { value: number; label: string };
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = colors.accent.primary,
  trend,
  style,
}) => {
  return (
    <Card style={[styles.container, style]}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={trend.value >= 0 ? 'trending-up' : 'trending-down'}
            size={14}
            color={trend.value >= 0 ? colors.status.success : colors.status.error}
          />
          <Text
            style={[
              styles.trendText,
              { color: trend.value >= 0 ? colors.status.success : colors.status.error },
            ]}
          >
            {Math.abs(trend.value)}% {trend.label}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  value: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  trendText: {
    fontSize: typography.sizes.sm,
    marginLeft: spacing.xs,
  },
});
