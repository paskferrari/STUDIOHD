import React, { useEffect, useRef } from 'react';
import { Text, TextStyle, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { duration, easing } from '../../theme/motion';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  formatNumber?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration: animDuration = duration.slow,
  delay = 0,
  prefix = '',
  suffix = '',
  style,
  formatNumber = true,
}) => {
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    animatedValue.value = withDelay(
      delay,
      withTiming(value, {
        duration: animDuration,
        easing: easing.standard,
      })
    );

    // Update display value in intervals
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime - delay;
      if (elapsed < 0) return;
      
      const progress = Math.min(elapsed / animDuration, 1);
      const currentValue = Math.round(startValue + diff * progress);
      setDisplayValue(currentValue);
      
      if (progress >= 1) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value, reducedMotion]);

  const formattedValue = formatNumber
    ? displayValue.toLocaleString('it-IT')
    : displayValue.toString();

  return (
    <Text style={style}>
      {prefix}{formattedValue}{suffix}
    </Text>
  );
};
