import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme/colors';
import { Button } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/utils/api';
import { supabase } from '../../src/lib/supabase';

const GOALS = [
  { id: 'improve_skills', label: 'Improve my skills', icon: 'trending-up' },
  { id: 'network', label: 'Network with others', icon: 'people' },
  { id: 'create_music', label: 'Create more music', icon: 'musical-notes' },
  { id: 'compete', label: 'Compete in gaming', icon: 'trophy' },
  { id: 'collaborate', label: 'Find collaborators', icon: 'git-merge' },
  { id: 'track_progress', label: 'Track my progress', icon: 'analytics' },
  { id: 'earn_badges', label: 'Earn achievements', icon: 'ribbon' },
  { id: 'have_fun', label: 'Just have fun', icon: 'happy' },
];

export default function Goals() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name: string; roles: string }>();
  const { setUser } = useAuthStore();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleComplete = async () => {
    if (selectedGoals.length === 0) return;

    setIsLoading(true);
    try {
      const roles = params.roles?.split(',') || [];
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: params.name,
          roles,
          goals: selectedGoals,
          onboarding_completed: true,
        },
      });
      if (error) throw error;
      const u = data.user;
      if (!u) throw new Error('Nessun utente');
      const updated = {
        user_id: u.id,
        email: u.email!,
        name: params.name,
        picture: u.user_metadata?.picture || null,
        roles,
        level: 1,
        xp: 0,
        streak_days: 0,
        onboarding_completed: true,
        goals: selectedGoals,
        is_admin: false,
      };
      setUser(updated);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = selectedGoals.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.stepText}>Step 2 of 2</Text>
          <Text style={styles.title}>What Are Your Goals?</Text>
          <Text style={styles.subtitle}>
            Select your goals to help us personalize your experience
          </Text>
        </View>

        {/* Goals Grid */}
        <View style={styles.goalsGrid}>
          {GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardSelected,
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.goalIconContainer,
                    isSelected && styles.goalIconContainerSelected,
                  ]}
                >
                  <Ionicons
                    name={goal.icon as any}
                    size={24}
                    color={isSelected ? colors.accent.primary : colors.text.tertiary}
                  />
                </View>
                <Text
                  style={[
                    styles.goalLabel,
                    isSelected && styles.goalLabelSelected,
                  ]}
                >
                  {goal.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={14} color={colors.text.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.footer}>
        <Button
          title={isLoading ? 'Setting up...' : "Let's Go!"}
          onPress={handleComplete}
          disabled={!isValid || isLoading}
          size="lg"
          style={styles.completeButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stepText: {
    fontSize: typography.sizes.sm,
    color: colors.accent.primary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '48%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.default,
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  goalIconContainerSelected: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  goalLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  goalLabelSelected: {
    color: colors.text.primary,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.background.primary,
  },
  completeButton: {
    width: '100%',
  },
});
