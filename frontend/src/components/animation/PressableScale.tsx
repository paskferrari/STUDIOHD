import React, { useEffect } from 'react';
import { TouchableOpacity, TouchableOpacityProps, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { duration, spring, presets } from '../../theme/motion';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface PressableScaleProps extends TouchableOpacityProps {
  scaleValue?: number;
  children: React.ReactNode;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  scaleValue = presets.buttonPress.scale,
  children,
  onPressIn,
  onPressOut,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = (e: any) => {
    if (!reducedMotion) {
      scale.value = withSpring(scaleValue, spring.responsive);
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (!reducedMotion) {
      scale.value = withSpring(1, spring.responsive);
    }
    onPressOut?.(e);
  };

  return (
    <AnimatedTouchable
      {...props}
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {children}
    </AnimatedTouchable>
  );
};
