import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import { Card } from '../ui/Card';
import { useOnboardingStore } from '../../store/onboardingStore';
import { t } from '../../i18n';
import { AnimatedContainer } from '../animation/AnimatedContainer';

interface ChecklistItem {
  id: keyof typeof checklistItemsConfig;
  label: string;
  completed: boolean;
  icon: string;
}

const checklistItemsConfig = {
  profileCompleted: { icon: 'person', labelKey: 'onboarding.checklist.completeProfile' },
  firstCheckIn: { icon: 'log-in', labelKey: 'onboarding.checklist.firstCheckIn' },
  firstTrack: { icon: 'musical-notes', labelKey: 'onboarding.checklist.createTrack' },
  firstMatch: { icon: 'game-controller', labelKey: 'onboarding.checklist.joinMatch' },
  viewedLeaderboard: { icon: 'trophy', labelKey: 'onboarding.checklist.viewLeaderboard' },
  earnedBadge: { icon: 'ribbon', labelKey: 'onboarding.checklist.earnBadge' },
};

interface OnboardingChecklistProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  collapsed = false,
  onToggle,
}) => {
  const { checklistItems, getChecklistProgress } = useOnboardingStore();
  const progress = getChecklistProgress();

  const items: ChecklistItem[] = Object.entries(checklistItemsConfig).map(([key, config]) => ({
    id: key as keyof typeof checklistItemsConfig,
    label: t(config.labelKey),
    completed: checklistItems[key as keyof typeof checklistItems],
    icon: config.icon,
  }));

  // Don't show if all completed
  if (progress.percentage === 100) return null;

  return (
    <AnimatedContainer animation="fadeInUp">
      <Card style={styles.container}>
        <TouchableOpacity
          style={styles.header}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <Ionicons name="rocket" size={20} color={colors.accent.secondary} />
            <Text style={styles.title}>{t('onboarding.checklist.title')}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.progressText}>
              {progress.completed}/{progress.total}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress.percentage}%` }]}
              />
            </View>
            <Ionicons
              name={collapsed ? 'chevron-down' : 'chevron-up'}
              size={20}
              color={colors.text.tertiary}
            />
          </View>
        </TouchableOpacity>

        {!collapsed && (
          <View style={styles.itemsContainer}>
            {items.map((item, index) => (
              <AnimatedContainer
                key={item.id}
                animation="fadeInRight"
                index={index}
                staggerType="fast"
              >
                <View style={styles.item}>
                  <View
                    style={[
                      styles.itemIcon,
                      item.completed && styles.itemIconCompleted,
                    ]}
                  >
                    {item.completed ? (
                      <Ionicons name="checkmark" size={14} color={colors.text.primary} />
                    ) : (
                      <Ionicons
                        name={item.icon as any}
                        size={14}
                        color={colors.text.tertiary}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.itemLabel,
                      item.completed && styles.itemLabelCompleted,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              </AnimatedContainer>
            ))}
          </View>
        )}
      </Card>
    </AnimatedContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.secondary,
    borderRadius: 2,
  },
  itemsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  itemIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  itemIconCompleted: {
    backgroundColor: colors.status.success,
  },
  itemLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  itemLabelCompleted: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
});
