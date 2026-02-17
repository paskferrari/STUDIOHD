import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../src/theme/colors';
import { Card, Avatar, Badge, StatCard, ProgressRing, LoadingSkeleton } from '../../src/components/ui';
import { AnimatedContainer, AnimatedCounter, PressableScale, StaggeredList } from '../../src/components/animation';
import { OnboardingChecklist, ProductTour } from '../../src/components/onboarding';
import { useAuthStore } from '../../src/store/authStore';
import { useAttendanceStore } from '../../src/store/attendanceStore';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { api } from '../../src/utils/api';
import { t, formatDate, formatRelativeTime } from '../../src/i18n';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isCheckedIn, setCheckedIn } = useAttendanceStore();
  const { 
    tutorialCompleted, 
    showTutorial, 
    setShowTutorial,
    completeChecklistItem,
  } = useOnboardingStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checklistCollapsed, setChecklistCollapsed] = useState(false);

  useEffect(() => {
    loadData();
    // Show tutorial for new users
    if (!tutorialCompleted && user?.onboarding_completed) {
      setTimeout(() => setShowTutorial(true), 1000);
    }
  }, []);

  const loadData = async () => {
    try {
      const [profileData, activityData, sessionData, attendanceStatus] = await Promise.all([
        api.get<any>('/users/profile'),
        api.get<any[]>('/activity/feed?limit=5'),
        api.get<any[]>('/sessions?upcoming=true&limit=3'),
        api.get<any>('/attendance/status'),
      ]);

      setStats(profileData);
      setActivities(activityData);
      setSessions(sessionData);
      setCheckedIn(attendanceStatus.is_checked_in, attendanceStatus.attendance);
      
      // Update checklist items
      if (profileData.onboarding_completed) completeChecklistItem('profileCompleted');
      if (profileData.stats?.attendance_count > 0) completeChecklistItem('firstCheckIn');
      if (profileData.stats?.track_count > 0) completeChecklistItem('firstTrack');
      if (profileData.stats?.match_count > 0) completeChecklistItem('firstMatch');
      if (profileData.badges?.length > 0) completeChecklistItem('earnedBadge');
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const xpProgress = stats ? ((stats.xp % 1000) / 10) : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton width="60%" height={32} style={{ marginBottom: spacing.md }} />
          <LoadingSkeleton width="40%" height={20} style={{ marginBottom: spacing.xl }} />
          <LoadingSkeleton height={120} style={{ marginBottom: spacing.md }} />
          <LoadingSkeleton height={120} style={{ marginBottom: spacing.md }} />
          <LoadingSkeleton height={80} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Product Tour */}
      <ProductTour
        visible={showTutorial}
        onComplete={() => setShowTutorial(false)}
      />

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
        <AnimatedContainer animation="fadeInUp">
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{t('dashboard.welcomeBack')}</Text>
              <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Membro'}</Text>
            </View>
            <PressableScale onPress={() => router.push('/(tabs)/profile')}>
              <Avatar uri={user?.picture} name={user?.name} size="md" showBorder />
            </PressableScale>
          </View>
        </AnimatedContainer>

        {/* Onboarding Checklist */}
        <OnboardingChecklist
          collapsed={checklistCollapsed}
          onToggle={() => setChecklistCollapsed(!checklistCollapsed)}
        />

        {/* Level & XP Card */}
        <AnimatedContainer animation="fadeInUp" delay={100}>
          <Card variant="accent" style={styles.levelCard}>
            <View style={styles.levelContent}>
              <View style={styles.levelInfo}>
                <View style={styles.levelBadge}>
                  <Ionicons name="star" size={16} color={colors.accent.secondary} />
                  <Text style={styles.levelText}>{t('dashboard.level', { level: stats?.level || 1 })}</Text>
                </View>
                <AnimatedCounter
                  value={stats?.xp || 0}
                  suffix=" XP"
                  style={styles.xpText}
                />
                <Text style={styles.xpSubtext}>
                  {t('dashboard.xpToNextLevel', { xp: 1000 - (stats?.xp % 1000 || 0) })}
                </Text>
              </View>
              <ProgressRing
                progress={xpProgress}
                size={70}
                color={colors.accent.secondary}
                showPercentage={false}
                label={t('dashboard.progress')}
              />
            </View>
            
            {/* Streak */}
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={20} color={colors.accent.primary} />
              <Text style={styles.streakText}>
                {t('dashboard.dayStreak', { count: stats?.streak_days || 0 })}
              </Text>
              {(stats?.streak_days || 0) >= 7 && (
                <Badge label={t('dashboard.onFire')} variant="gold" size="sm" />
              )}
            </View>
          </Card>
        </AnimatedContainer>

        {/* Quick Stats */}
        <AnimatedContainer animation="fadeInUp" delay={200}>
          <Text style={styles.sectionTitle}>{t('dashboard.yourStats')}</Text>
        </AnimatedContainer>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          <AnimatedContainer animation="fadeInRight" delay={250}>
            <StatCard
              title={t('dashboard.sessions')}
              value={stats?.stats?.attendance_count || 0}
              icon="calendar"
              iconColor={colors.accent.primary}
              style={styles.statCard}
            />
          </AnimatedContainer>
          <AnimatedContainer animation="fadeInRight" delay={300}>
            <StatCard
              title={t('dashboard.tracks')}
              value={stats?.stats?.track_count || 0}
              icon="musical-notes"
              iconColor={colors.accent.secondary}
              style={styles.statCard}
            />
          </AnimatedContainer>
          <AnimatedContainer animation="fadeInRight" delay={350}>
            <StatCard
              title={t('dashboard.contributions')}
              value={stats?.stats?.contribution_count || 0}
              icon="git-merge"
              iconColor={colors.accent.tertiary}
              style={styles.statCard}
            />
          </AnimatedContainer>
          <AnimatedContainer animation="fadeInRight" delay={400}>
            <StatCard
              title={t('dashboard.matches')}
              value={stats?.stats?.match_count || 0}
              icon="game-controller"
              iconColor={colors.status.info}
              style={styles.statCard}
            />
          </AnimatedContainer>
        </ScrollView>

        {/* Check-In Card */}
        <AnimatedContainer animation="fadeInUp" delay={300}>
          <Card variant="elevated" style={styles.checkInCard}>
            <View style={styles.checkInContent}>
              <View>
                <Text style={styles.checkInTitle}>
                  {isCheckedIn ? t('dashboard.currentlyCheckedIn') : t('dashboard.readyToStart')}
                </Text>
                <Text style={styles.checkInSubtitle}>
                  {isCheckedIn
                    ? t('dashboard.checkOutPrompt')
                    : t('dashboard.checkInPrompt')}
                </Text>
              </View>
              <PressableScale
                style={[
                  styles.checkInButton,
                  isCheckedIn && styles.checkOutButton,
                ]}
                onPress={() => router.push('/(tabs)/attendance')}
              >
                <Ionicons
                  name={isCheckedIn ? 'log-out' : 'log-in'}
                  size={24}
                  color={colors.text.primary}
                />
              </PressableScale>
            </View>
          </Card>
        </AnimatedContainer>

        {/* Upcoming Sessions */}
        {sessions.length > 0 && (
          <>
            <AnimatedContainer animation="fadeInUp" delay={400}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('dashboard.upcomingSessions')}</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
                </TouchableOpacity>
              </View>
            </AnimatedContainer>
            {sessions.map((session, index) => (
              <AnimatedContainer key={session.session_id} animation="fadeInUp" delay={450 + index * 50}>
                <Card style={styles.sessionCard}>
                  <View style={styles.sessionContent}>
                    <View style={styles.sessionIcon}>
                      <Ionicons
                        name={session.session_type === 'music' ? 'musical-notes' : 'game-controller'}
                        size={20}
                        color={colors.accent.primary}
                      />
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.sessionTime}>
                        {formatDate(session.start_time, 'short')} {t('time.at')} {formatDate(session.start_time, 'time')}
                      </Text>
                    </View>
                    <Badge label={session.session_type} variant="accent" size="sm" />
                  </View>
                </Card>
              </AnimatedContainer>
            ))}
          </>
        )}

        {/* Activity Feed */}
        <AnimatedContainer animation="fadeInUp" delay={500}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.communityActivity')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
        </AnimatedContainer>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <AnimatedContainer key={activity.activity_id} animation="fadeInUp" delay={550 + index * 50}>
              <Card style={styles.activityCard}>
                <View style={styles.activityContent}>
                  <Avatar name={activity.user_name} size="sm" />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityText}>{activity.description}</Text>
                    <Text style={styles.activityTime}>
                      {formatRelativeTime(activity.created_at)}
                    </Text>
                  </View>
                </View>
              </Card>
            </AnimatedContainer>
          ))
        ) : (
          <AnimatedContainer animation="fadeInUp" delay={550}>
            <Card style={styles.emptyCard}>
              <Ionicons name="chatbubbles-outline" size={32} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>{t('dashboard.noActivity')}</Text>
              <Text style={styles.emptySubtext}>{t('dashboard.beFirst')}</Text>
            </Card>
          </AnimatedContainer>
        )}

        {/* Badges Preview */}
        {stats?.badges && stats.badges.length > 0 && (
          <>
            <AnimatedContainer animation="fadeInUp" delay={600}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('dashboard.recentBadges')}</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                  <Text style={styles.seeAllText}>{t('common.viewAll')}</Text>
                </TouchableOpacity>
              </View>
            </AnimatedContainer>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesRow}
            >
              {stats.badges.slice(0, 5).map((badge: any, index: number) => (
                <AnimatedContainer key={badge.badge_id} animation="scaleIn" delay={650 + index * 50}>
                  <View style={styles.badgeItem}>
                    <View style={[styles.badgeIcon, { backgroundColor: `${colors.rarity[badge.rarity as keyof typeof colors.rarity]}20` }]}>
                      <Ionicons
                        name={badge.icon as any}
                        size={24}
                        color={colors.rarity[badge.rarity as keyof typeof colors.rarity] || colors.text.secondary}
                      />
                    </View>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                  </View>
                </AnimatedContainer>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    padding: spacing.lg,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {},
  greeting: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  levelCard: {
    marginBottom: spacing.lg,
  },
  levelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelInfo: {},
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  levelText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.accent.secondary,
    marginLeft: spacing.xs,
  },
  xpText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  xpSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  streakText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.accent.primary,
    fontWeight: typography.weights.medium,
  },
  statsRow: {
    paddingRight: spacing.lg,
    marginBottom: spacing.md,
  },
  statCard: {
    marginRight: spacing.md,
    minWidth: 130,
  },
  checkInCard: {
    marginTop: spacing.md,
  },
  checkInContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkInTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  checkInSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  checkInButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOutButton: {
    backgroundColor: colors.accent.secondary,
  },
  sessionCard: {
    marginBottom: spacing.sm,
  },
  sessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  sessionTime: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  activityCard: {
    marginBottom: spacing.sm,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  activityText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  activityTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  badgesRow: {
    paddingRight: spacing.lg,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 70,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badgeName: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
