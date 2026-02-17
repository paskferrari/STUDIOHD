import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../src/theme/colors';
import { spring, duration } from '../src/theme/motion';
import { PressableScale } from '../src/components/animation';
import { t } from '../src/i18n';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

export default function Login() {
  const router = useRouter();
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const featuresOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    
    // Staggered entrance animation
    if (!reducedMotion) {
      logoOpacity.value = withDelay(100, withTiming(1, { duration: duration.base }));
      logoScale.value = withDelay(100, withSpring(1, spring.bouncy));
      titleOpacity.value = withDelay(300, withTiming(1, { duration: duration.base }));
      featuresOpacity.value = withDelay(500, withTiming(1, { duration: duration.base }));
      buttonOpacity.value = withDelay(700, withTiming(1, { duration: duration.base }));
    } else {
      logoOpacity.value = 1;
      logoScale.value = 1;
      titleOpacity.value = 1;
      featuresOpacity.value = 1;
      buttonOpacity.value = 1;
    }
  }, [reducedMotion]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const redirectUrl = window.location.origin + '/auth-callback';
      window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    } else {
      // For native apps, we'll handle differently
      console.log('Native auth not implemented');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Ionicons name="musical-notes" size={48} color={colors.accent.primary} />
          </Animated.View>
          <Animated.View style={titleAnimatedStyle}>
            <Text style={styles.title}>STUDIO</Text>
            <Text style={styles.subtitle}>HUB ELITE</Text>
            <Text style={styles.tagline}>{t('onboarding.welcome.tagline')}</Text>
          </Animated.View>
        </View>

        {/* Features Section */}
        <Animated.View style={[styles.featuresSection, featuresAnimatedStyle]}>
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={24} color={colors.accent.secondary} />
              <Text style={styles.featureText}>{t('features.trackAttendance')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="musical-note" size={24} color={colors.accent.primary} />
              <Text style={styles.featureText}>{t('features.musicProjects')}</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Ionicons name="game-controller" size={24} color={colors.accent.tertiary} />
              <Text style={styles.featureText}>{t('features.gamingSessions')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trophy" size={24} color={colors.accent.highlight} />
              <Text style={styles.featureText}>{t('features.leaderboards')}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Login Button */}
        <Animated.View style={[styles.loginSection, buttonAnimatedStyle]}>
          <PressableScale onPress={handleGoogleLogin} style={styles.googleButton}>
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
          </PressableScale>

          <Text style={styles.termsText}>
            {t('auth.termsAgreement')}
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xxl,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
  title: {
    fontSize: 40,
    fontWeight: typography.weights.bold,
    color: colors.accent.primary,
    letterSpacing: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    letterSpacing: 4,
    marginTop: 4,
    textAlign: 'center',
  },
  tagline: {
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  featuresSection: {
    marginVertical: spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  featureItem: {
    alignItems: 'center',
    width: '40%',
  },
  featureText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  loginSection: {
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    width: '100%',
    justifyContent: 'center',
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.accent.primary,
  },
  googleButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.background.primary,
  },
  termsText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
