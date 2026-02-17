import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { api } from '../src/utils/api';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!user && !inAuthGroup && segments[0] !== 'login' && segments[0] !== 'auth-callback') {
      // Not authenticated, redirect to login
      router.replace('/login');
    } else if (user && !user.onboarding_completed && !inOnboarding) {
      // Authenticated but onboarding not complete
      router.replace('/onboarding/profile-setup');
    } else if (user && user.onboarding_completed && (segments[0] === 'login' || segments[0] === 'auth-callback' || inOnboarding)) {
      // Authenticated and onboarding complete, go to main app
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading, isReady]);

  const checkAuth = async () => {
    try {
      const userData = await api.get<any>('/auth/me');
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="auth-callback" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="track/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="match/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
