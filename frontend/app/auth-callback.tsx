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
import { api } from '../src/utils/api';

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

      // Extract session_id from URL fragment
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (!sessionIdMatch) {
        throw new Error('No session ID found');
      }

      const sessionId = sessionIdMatch[1];

      // Exchange session_id for session_token
      const response = await api.post<any>('/auth/session', {
        session_id: sessionId,
      });

      if (response.user) {
        setUser(response.user);
        
        // Clean URL and redirect
        window.history.replaceState(null, '', window.location.pathname);
        
        if (response.user.onboarding_completed) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding/profile-setup');
        }
      } else {
        throw new Error('No user data received');
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
