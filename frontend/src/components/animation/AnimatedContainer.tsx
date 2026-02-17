import React, { useEffect, useRef } from 'react';
import { ViewStyle, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { duration, easing, spring, stagger, presets } from '../../theme/motion';

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'fadeInRight' | 'scaleIn' | 'fadeIn';
  delay?: number;
  index?: number;
  staggerType?: 'fast' | 'base' | 'slow';
  style?: ViewStyle;
  onAnimationComplete?: () => void;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  index = 0,
  staggerType = 'base',
  style,
  onAnimationComplete,
}) => {
  const progress = useSharedValue(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    
    const totalDelay = delay + (index * stagger[staggerType]);
    
    progress.value = withDelay(
      reducedMotion ? 0 : totalDelay,
      withTiming(1, {
        duration: reducedMotion ? 0 : duration.base,
        easing: easing.enter,
      }, (finished) => {
        if (finished && onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    switch (animation) {
      case 'fadeInUp':
        return {
          opacity: progress.value,
          transform: [
            { translateY: interpolate(progress.value, [0, 1], [20, 0]) },
          ],
        };
      case 'fadeInRight':
        return {
          opacity: progress.value,
          transform: [
            { translateX: interpolate(progress.value, [0, 1], [20, 0]) },
          ],
        };
      case 'scaleIn':
        return {
          opacity: progress.value,
          transform: [
            { scale: interpolate(progress.value, [0, 1], [0.9, 1]) },
          ],
        };
      case 'fadeIn':
      default:
        return {
          opacity: progress.value,
        };
    }
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};
