import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../src/theme/colors';
import { Card } from '../src/components/ui';
import { AnimatedContainer, StaggeredList } from '../src/components/animation';
import { t } from '../src/i18n';

interface HelpSection {
  id: string;
  titleKey: string;
  icon: string;
  color: string;
  items: { questionKey: string; answerKey: string }[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'quickstart',
    titleKey: 'help.quickStart',
    icon: 'rocket',
    color: colors.accent.primary,
    items: [
      { questionKey: 'help.guides.gettingStarted', answerKey: '' },
      { questionKey: 'help.guides.trackAttendance', answerKey: '' },
      { questionKey: 'help.guides.createMusic', answerKey: '' },
      { questionKey: 'help.guides.playGames', answerKey: '' },
      { questionKey: 'help.guides.earnBadges', answerKey: '' },
      { questionKey: 'help.guides.climbRankings', answerKey: '' },
    ],
  },
  {
    id: 'faq',
    titleKey: 'help.faq',
    icon: 'help-circle',
    color: colors.accent.secondary,
    items: [
      { questionKey: 'help.faqItems.whatIsXp', answerKey: 'help.faqItems.whatIsXpAnswer' },
      { questionKey: 'help.faqItems.howLevelUp', answerKey: 'help.faqItems.howLevelUpAnswer' },
      { questionKey: 'help.faqItems.whatAreBadges', answerKey: 'help.faqItems.whatAreBadgesAnswer' },
      { questionKey: 'help.faqItems.whatIsStreak', answerKey: 'help.faqItems.whatIsStreakAnswer' },
      { questionKey: 'help.faqItems.howLeaderboards', answerKey: 'help.faqItems.howLeaderboardsAnswer' },
    ],
  },
  {
    id: 'glossary',
    titleKey: 'help.glossary',
    icon: 'book',
    color: colors.accent.tertiary,
    items: [
      { questionKey: 'help.glossaryItems.xp', answerKey: '' },
      { questionKey: 'help.glossaryItems.level', answerKey: '' },
      { questionKey: 'help.glossaryItems.streak', answerKey: '' },
      { questionKey: 'help.glossaryItems.badge', answerKey: '' },
      { questionKey: 'help.glossaryItems.track', answerKey: '' },
      { questionKey: 'help.glossaryItems.contribution', answerKey: '' },
      { questionKey: 'help.glossaryItems.match', answerKey: '' },
      { questionKey: 'help.glossaryItems.checkIn', answerKey: '' },
    ],
  },
  {
    id: 'troubleshooting',
    titleKey: 'help.troubleshooting',
    icon: 'construct',
    color: colors.status.warning,
    items: [
      { questionKey: 'help.troubleshootingItems.cantCheckIn', answerKey: 'help.troubleshootingItems.cantCheckInSolution' },
      { questionKey: 'help.troubleshootingItems.xpNotUpdating', answerKey: 'help.troubleshootingItems.xpNotUpdatingSolution' },
      { questionKey: 'help.troubleshootingItems.badgeNotShowing', answerKey: 'help.troubleshootingItems.badgeNotShowingSolution' },
    ],
  },
];

export default function HelpCenter() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(['faq']);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleItem = (itemKey: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemKey)
        ? prev.filter((key) => key !== itemKey)
        : [...prev, itemKey]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('help.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <AnimatedContainer animation="fadeInUp">
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="help-buoy" size={48} color={colors.accent.primary} />
            </View>
            <Text style={styles.heroTitle}>{t('help.title')}</Text>
            <Text style={styles.heroSubtitle}>
              Trova risposte alle tue domande e scopri come ottenere il massimo dall'app.
            </Text>
          </View>
        </AnimatedContainer>

        {/* Sections */}
        {HELP_SECTIONS.map((section, sectionIndex) => {
          const isExpanded = expandedSections.includes(section.id);
          
          return (
            <AnimatedContainer
              key={section.id}
              animation="fadeInUp"
              index={sectionIndex}
              staggerType="base"
            >
              <Card style={styles.sectionCard}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.sectionIcon, { backgroundColor: `${section.color}20` }]}>
                    <Ionicons name={section.icon as any} size={20} color={section.color} />
                  </View>
                  <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.itemsContainer}>
                    {section.items.map((item, itemIndex) => {
                      const isItemExpanded = expandedItems.includes(item.questionKey);
                      const hasAnswer = item.answerKey !== '';
                      
                      return (
                        <View key={item.questionKey}>
                          <TouchableOpacity
                            style={styles.item}
                            onPress={() => hasAnswer && toggleItem(item.questionKey)}
                            activeOpacity={hasAnswer ? 0.7 : 1}
                          >
                            <Text style={styles.itemQuestion}>{t(item.questionKey)}</Text>
                            {hasAnswer && (
                              <Ionicons
                                name={isItemExpanded ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={colors.text.tertiary}
                              />
                            )}
                          </TouchableOpacity>
                          {isItemExpanded && hasAnswer && (
                            <Text style={styles.itemAnswer}>{t(item.answerKey)}</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </Card>
            </AnimatedContainer>
          );
        })}

        {/* Contact */}
        <AnimatedContainer animation="fadeInUp" delay={400}>
          <Card style={styles.contactCard}>
            <Ionicons name="mail" size={32} color={colors.accent.secondary} />
            <Text style={styles.contactTitle}>{t('help.contact')}</Text>
            <Text style={styles.contactText}>
              Hai ancora bisogno di aiuto? Contattaci all'indirizzo support@studiohub.elite
            </Text>
          </Card>
        </AnimatedContainer>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sectionTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
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
  itemQuestion: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  itemAnswer: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    paddingLeft: spacing.md,
    paddingBottom: spacing.sm,
  },
  contactCard: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  contactTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  contactText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
