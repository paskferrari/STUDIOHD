import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.lg,
    };
    
    // Size
    switch (size) {
      case 'sm':
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.md;
        break;
      case 'lg':
        baseStyle.paddingVertical = spacing.md + 4;
        baseStyle.paddingHorizontal = spacing.xl;
        break;
      default:
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.lg;
    }
    
    // Variant
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = colors.accent.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.accent.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      default:
        baseStyle.backgroundColor = colors.accent.primary;
    }
    
    if (disabled) {
      baseStyle.opacity = 0.5;
    }
    
    return baseStyle;
  };
  
  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: typography.weights.semibold,
    };
    
    // Size
    switch (size) {
      case 'sm':
        baseStyle.fontSize = typography.sizes.sm;
        break;
      case 'lg':
        baseStyle.fontSize = typography.sizes.lg;
        break;
      default:
        baseStyle.fontSize = typography.sizes.md;
    }
    
    // Variant
    switch (variant) {
      case 'outline':
      case 'ghost':
        baseStyle.color = colors.accent.primary;
        break;
      default:
        baseStyle.color = colors.text.primary;
    }
    
    return baseStyle;
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), icon && { marginLeft: spacing.sm }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
