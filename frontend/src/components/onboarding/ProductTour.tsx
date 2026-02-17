import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { spring, duration } from '../../theme/motion';
import { t } from '../../i18n';
import { useOnboardingStore } from '../../store/onboardingStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TourStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    titleKey: 'onboarding.tutorial.dashboardTitle',
    descriptionKey: 'onboarding.tutorial.dashboardDesc',
    icon: 'home',
    color: colors.accent.primary,
  },
  {
    id: 'attendance',
    titleKey: 'onboarding.tutorial.attendanceTitle',
    descriptionKey: 'onboarding.tutorial.attendanceDesc',
    icon: 'calendar',
    color: colors.accent.secondary,
  },
  {
    id: 'music',
    titleKey: 'onboarding.tutorial.musicTitle',
    descriptionKey: 'onboarding.tutorial.musicDesc',
    icon: 'musical-notes',
    color: colors.accent.tertiary,
  },
  {
    id: 'gaming',
    titleKey: 'onboarding.tutorial.gamingTitle',
    descriptionKey: 'onboarding.tutorial.gamingDesc',
    icon: 'game-controller',
    color: colors.status.info,
  },
  {
    id: 'leaderboard',
    titleKey: 'onboarding.tutorial.leaderboardTitle',
    descriptionKey: 'onboarding.tutorial.leaderboardDesc',
    icon: 'trophy',
    color: colors.accent.highlight,
  },
  {
    id: 'profile',
    titleKey: 'onboarding.tutorial.profileTitle',
    descriptionKey: 'onboarding.tutorial.profileDesc',
    icon: 'person',
    color: colors.rarity.epic,
  },
];

interface ProductTourProps {
  visible: boolean;
  onComplete: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({
  visible,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { setTutorialCompleted } = useOnboardingStore();
  const progress = useSharedValue(0);

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
      progress.value = withTiming((currentStep + 1) / TOUR_STEPS.length, {
        duration: duration.base,
      });
    }
  };

  const handleComplete = () => {
    setTutorialCompleted(true);
    onComplete();
    setCurrentStep(0);
  };

  const handleSkip = () => {
    setTutorialCompleted(true);
    onComplete();
    setCurrentStep(0);
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(duration.base)}
          exiting={FadeOut.duration(duration.fast)}
          style={styles.container}
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
            <Text style={styles.stepCounter}>
              {currentStep + 1} / {TOUR_STEPS.length}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: `${step.color}20` }]}>
              <Ionicons name={step.icon as any} size={48} color={step.color} />
            </View>
            
            <Text style={styles.title}>{t(step.titleKey)}</Text>
            <Text style={styles.description}>{t(step.descriptionKey)}</Text>
          </View>

          {/* Navigation Dots */}
          <View style={styles.dotsContainer}>
            {TOUR_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.dotActive,
                  index < currentStep && styles.dotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>{t('onboarding.tutorial.skipTutorial')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextText}>
                {isLastStep ? t('onboarding.tutorial.gotIt') : t('common.next')}
              </Text>
              <Ionicons
                name={isLastStep ? 'checkmark' : 'arrow-forward'}
                size={18}
                color={colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
  stepCounter: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.elevated,
    marginHorizontal: spacing.xs,
  },
  dotActive: {
    backgroundColor: colors.accent.primary,
    width: 24,
  },
  dotCompleted: {
    backgroundColor: colors.accent.secondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  nextText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
});
