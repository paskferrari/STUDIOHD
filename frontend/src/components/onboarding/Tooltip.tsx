import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { spring, duration } from '../../theme/motion';
import { t } from '../../i18n';

interface TooltipProps {
  visible: boolean;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  targetRect?: { x: number; y: number; width: number; height: number };
  onDismiss: () => void;
  onNext?: () => void;
  showNextButton?: boolean;
  stepInfo?: { current: number; total: number };
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Tooltip: React.FC<TooltipProps> = ({
  visible,
  title,
  description,
  position = 'bottom',
  targetRect,
  onDismiss,
  onNext,
  showNextButton = false,
  stepInfo,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  useEffect(() => {
    if (visible) {
      opacity.value = reducedMotion ? 1 : withDelay(100, withTiming(1, { duration: duration.base }));
      scale.value = reducedMotion ? 1 : withSpring(1, spring.responsive);
    } else {
      opacity.value = withTiming(0, { duration: duration.fast });
      scale.value = withTiming(0.9, { duration: duration.fast });
    }
  }, [visible, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const getTooltipPosition = () => {
    if (!targetRect) {
      return {
        top: SCREEN_HEIGHT / 2 - 80,
        left: spacing.lg,
        right: spacing.lg,
      };
    }

    const tooltipWidth = SCREEN_WIDTH - spacing.lg * 2;
    const tooltipHeight = 150;

    switch (position) {
      case 'top':
        return {
          bottom: SCREEN_HEIGHT - targetRect.y + spacing.sm,
          left: spacing.lg,
          right: spacing.lg,
        };
      case 'bottom':
      default:
        return {
          top: targetRect.y + targetRect.height + spacing.sm,
          left: spacing.lg,
          right: spacing.lg,
        };
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        {/* Spotlight effect */}
        {targetRect && (
          <View
            style={[
              styles.spotlight,
              {
                top: targetRect.y - spacing.sm,
                left: targetRect.x - spacing.sm,
                width: targetRect.width + spacing.md,
                height: targetRect.height + spacing.md,
              },
            ]}
          />
        )}

        <Animated.View
          style={[styles.tooltipContainer, getTooltipPosition(), animatedStyle]}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.tooltipContent}>
              {/* Header */}
              <View style={styles.tooltipHeader}>
                <Text style={styles.tooltipTitle}>{title}</Text>
                <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>

              {/* Description */}
              <Text style={styles.tooltipDescription}>{description}</Text>

              {/* Footer */}
              <View style={styles.tooltipFooter}>
                {stepInfo && (
                  <Text style={styles.stepText}>
                    {stepInfo.current} / {stepInfo.total}
                  </Text>
                )}
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={onDismiss} style={styles.skipButton}>
                    <Text style={styles.skipText}>{t('common.skip')}</Text>
                  </TouchableOpacity>
                  {showNextButton && onNext && (
                    <TouchableOpacity onPress={onNext} style={styles.nextButton}>
                      <Text style={styles.nextText}>{t('common.next')}</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.text.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  spotlight: {
    position: 'absolute',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    backgroundColor: 'transparent',
  },
  tooltipContainer: {
    position: 'absolute',
  },
  tooltipContent: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tooltipTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  tooltipDescription: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  tooltipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  skipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  nextText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
});
