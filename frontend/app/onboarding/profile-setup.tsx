import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme/colors';
import { Button, Avatar, Card } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';

const ROLES = [
  { id: 'music', label: 'Music', icon: 'musical-notes', color: colors.accent.primary },
  { id: 'gaming', label: 'Gaming', icon: 'game-controller', color: colors.accent.tertiary },
  { id: 'instrument', label: 'Instrument', icon: 'guitar', color: colors.accent.secondary },
] as const;

export default function ProfileSetup() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleContinue = () => {
    if (name.trim() && selectedRoles.length > 0) {
      router.push({
        pathname: '/onboarding/goals',
        params: { name, roles: selectedRoles.join(',') },
      });
    }
  };

  const isValid = name.trim().length > 0 && selectedRoles.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.stepText}>Step 1 of 2</Text>
            <Text style={styles.title}>Set Up Your Profile</Text>
            <Text style={styles.subtitle}>
              Tell us about yourself to personalize your experience
            </Text>
          </View>

          {/* Avatar Preview */}
          <View style={styles.avatarSection}>
            <Avatar uri={user?.picture} name={name} size="xl" showBorder />
            <Text style={styles.avatarHint}>Using your Google profile picture</Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Display Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color={colors.text.tertiary} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>
          </View>

          {/* Role Selection */}
          <View style={styles.roleSection}>
            <Text style={styles.label}>Your Interests</Text>
            <Text style={styles.roleHint}>Select all that apply</Text>
            <View style={styles.rolesGrid}>
              {ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role.id);
                return (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.roleCard,
                      isSelected && { borderColor: role.color, backgroundColor: `${role.color}15` },
                    ]}
                    onPress={() => toggleRole(role.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.roleIconContainer,
                        { backgroundColor: isSelected ? `${role.color}30` : colors.background.elevated },
                      ]}
                    >
                      <Ionicons
                        name={role.icon as any}
                        size={28}
                        color={isSelected ? role.color : colors.text.tertiary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.roleLabel,
                        isSelected && { color: role.color },
                      ]}
                    >
                      {role.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkmark, { backgroundColor: role.color }]}>
                        <Ionicons name="checkmark" size={12} color={colors.text.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!isValid}
            size="lg"
            style={styles.continueButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarHint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
  },
  roleSection: {
    marginBottom: spacing.xl,
  },
  roleHint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  rolesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.default,
    position: 'relative',
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  roleLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.background.primary,
  },
  continueButton: {
    width: '100%',
  },
});
