import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, borderRadius, typography } from '../../theme/colors';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = '',
  size = 'md',
  style,
  showBorder = false,
}) => {
  const getSize = (): number => {
    switch (size) {
      case 'sm': return 32;
      case 'lg': return 56;
      case 'xl': return 80;
      default: return 44;
    }
  };
  
  const getFontSize = (): number => {
    switch (size) {
      case 'sm': return typography.sizes.sm;
      case 'lg': return typography.sizes.xl;
      case 'xl': return typography.sizes.xxxl;
      default: return typography.sizes.lg;
    }
  };
  
  const dimensions = getSize();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const containerStyle: ViewStyle = {
    width: dimensions,
    height: dimensions,
    borderRadius: dimensions / 2,
    overflow: 'hidden',
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...(showBorder && {
      borderWidth: 2,
      borderColor: colors.accent.secondary,
    }),
  };
  
  if (uri) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={{ uri }}
          style={{ width: dimensions, height: dimensions }}
          contentFit="cover"
        />
      </View>
    );
  }
  
  return (
    <View style={[containerStyle, style]}>
      <Text style={[styles.initials, { fontSize: getFontSize() }]}>
        {initials || '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  initials: {
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
});
