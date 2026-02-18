import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography } from '../src/theme/colors';
import { useAuthStore } from '../src/store/authStore';
import { supabase } from '../src/lib/supabase';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

export default function AuthCallback() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const hasProcessed = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    processAuth();
  }, []);

  const processAuth = async () => {
    try {
      if (Platform.OS !== 'web' || typeof window === 'undefined') {
        throw new Error('Web platform required');
      }

      // Handle Supabase OAuth callback
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!session) throw new Error('Nessuna sessione trovata');

      // Extract user data from Supabase session
      const userData = {
        user_id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || session.user.email!,
        picture: session.user.user_metadata?.picture || null,
        roles: [],
        level: 1,
        xp: 0,
        streak_days: 0,
        onboarding_completed: false,
        goals: [],
        is_admin: false,
      };

      setUser(userData);

      // Clean URL and redirect
      window.history.replaceState(null, '', window.location.pathname);
      
      if (userData.onboarding_completed) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/profile-setup');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.subText}>Redirecting to login...</Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.text}>Authenticating...</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
    marginTop: 20,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.status.error,
    textAlign: 'center',
  },
  subText: {
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
    marginTop: 10,
  },
});
