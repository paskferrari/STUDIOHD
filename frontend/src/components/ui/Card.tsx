import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'accent';
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  padding = 'md',
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.xl,
    };
    
    // Padding
    switch (padding) {
      case 'none':
        baseStyle.padding = 0;
        break;
      case 'sm':
        baseStyle.padding = spacing.sm;
        break;
      case 'lg':
        baseStyle.padding = spacing.lg;
        break;
      default:
        baseStyle.padding = spacing.md;
    }
    
    // Variant
    switch (variant) {
      case 'elevated':
        baseStyle.backgroundColor = colors.background.elevated;
        baseStyle.shadowColor = '#000';
        baseStyle.shadowOffset = { width: 0, height: 4 };
        baseStyle.shadowOpacity = 0.3;
        baseStyle.shadowRadius = 8;
        baseStyle.elevation = 8;
        break;
      case 'accent':
        baseStyle.backgroundColor = colors.background.card;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border.accent;
        break;
      default:
        baseStyle.backgroundColor = colors.background.card;
    }
    
    return baseStyle;
  };
  
  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};
