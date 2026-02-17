import React, { useEffect } from 'react';
import { ViewStyle, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { spring, duration } from '../../theme/motion';

interface BadgeUnlockAnimationProps {
  children: React.ReactNode;
  isUnlocking?: boolean;
  delay?: number;
  style?: ViewStyle;
  onComplete?: () => void;
}

export const BadgeUnlockAnimation: React.FC<BadgeUnlockAnimationProps> = ({
  children,
  isUnlocking = false,
  delay = 0,
  style,
  onComplete,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  useEffect(() => {
    if (isUnlocking && !reducedMotion) {
      scale.value = withDelay(
        delay,
        withSequence(
          withSpring(0.8, spring.stiff),
          withSpring(1.2, spring.bouncy),
          withSpring(1, spring.gentle)
        )
      );
      
      rotation.value = withDelay(
        delay,
        withSequence(
          withSpring(-5, spring.responsive),
          withSpring(5, spring.responsive),
          withSpring(0, spring.gentle)
        )
      );
      
      glow.value = withDelay(
        delay,
        withSequence(
          withSpring(1, spring.responsive),
          withSpring(0, { ...spring.gentle, damping: 30 })
        )
      );
      
      if (onComplete) {
        setTimeout(onComplete, delay + duration.extended);
      }
    }
  }, [isUnlocking]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: interpolate(glow.value, [0, 1], [0, 0.8]),
      shadowRadius: interpolate(glow.value, [0, 1], [0, 20]),
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};
