import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../src/theme/colors';
import { Button } from '../src/components/ui';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

export default function Login() {
  const router = useRouter();

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
          <View style={styles.logoContainer}>
            <Ionicons name="musical-notes" size={48} color={colors.accent.primary} />
          </View>
          <Text style={styles.title}>STUDIO</Text>
          <Text style={styles.subtitle}>HUB ELITE</Text>
          <Text style={styles.tagline}>Your Private Recording Studio Community</Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={24} color={colors.accent.secondary} />
              <Text style={styles.featureText}>Track Attendance</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="musical-note" size={24} color={colors.accent.primary} />
              <Text style={styles.featureText}>Music Projects</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Ionicons name="game-controller" size={24} color={colors.accent.tertiary} />
              <Text style={styles.featureText}>Gaming Sessions</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trophy" size={24} color={colors.accent.highlight} />
              <Text style={styles.featureText}>Leaderboards</Text>
            </View>
          </View>
        </View>

        {/* Login Button */}
        <View style={styles.loginSection}>
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
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
  },
  subtitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    letterSpacing: 4,
    marginTop: 4,
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
