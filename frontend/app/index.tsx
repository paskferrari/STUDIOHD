import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography } from '../src/theme/colors';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    // This will be handled by _layout.tsx
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>STUDIO</Text>
      <Text style={styles.subtitle}>HUB ELITE</Text>
      <ActivityIndicator size="large" color={colors.accent.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    color: colors.accent.primary,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    letterSpacing: 4,
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
});
