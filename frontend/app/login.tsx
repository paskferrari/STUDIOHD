import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  AccessibilityInfo,
  Alert,
  TextInput,
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
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/authStore';

export default function Login() {
  const router = useRouter();
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const featuresOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { setUser } = useAuthStore();

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

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const u = data.user;
      if (!u) throw new Error('Nessun utente');
      const userData = {
        user_id: u.id,
        email: u.email!,
        name: u.user_metadata?.name || u.email!,
        picture: u.user_metadata?.picture || null,
        roles: [],
        level: 1,
        xp: 0,
        streak_days: 0,
        onboarding_completed: false,
        goals: [],
        is_admin: false,
      };
      setUser(userData);
      router.replace('/onboarding/profile-setup');
    } catch (e: any) {
      Alert.alert('Errore', e.message || 'Accesso non riuscito');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (!data.session) {
        Alert.alert('Registrazione', 'Controlla la tua email per confermare');
        setIsSignUp(false);
        return;
      }
      const u = data.session.user;
      const userData = {
        user_id: u.id,
        email: u.email!,
        name: u.user_metadata?.name || u.email!,
        picture: u.user_metadata?.picture || null,
        roles: [],
        level: 1,
        xp: 0,
        streak_days: 0,
        onboarding_completed: false,
        goals: [],
        is_admin: false,
      };
      setUser(userData);
      router.replace('/onboarding/profile-setup');
    } catch (e: any) {
      Alert.alert('Errore', e.message || 'Registrazione non riuscita');
    } finally {
      setLoading(false);
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

        {/* Auth Form */}
        <Animated.View style={[styles.loginSection, buttonAnimatedStyle]}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.text.tertiary}
            secureTextEntry
            style={styles.input}
          />
          <PressableScale
            onPress={isSignUp ? handleSignUp : handleSignIn}
            style={styles.authButton}
            disabled={loading}
          >
            <Text style={styles.authButtonText}>
              {isSignUp ? 'Registrati' : 'Accedi'}
            </Text>
          </PressableScale>
          <TouchableOpacity onPress={() => setIsSignUp((v) => !v)} disabled={loading}>
            <Text style={styles.toggleText}>
              {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
            </Text>
          </TouchableOpacity>

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
  input: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  authButton: {
    alignItems: 'center',
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    width: '100%',
    justifyContent: 'center',
  },
  authButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.background.primary,
  },
  toggleText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  termsText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
