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
import { useAuthStore } from '../../src/store/authStore';
import { useAttendanceStore } from '../../src/store/attendanceStore';
import { api } from '../../src/utils/api';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isCheckedIn, setCheckedIn } = useAttendanceStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
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
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Member'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Avatar uri={user?.picture} name={user?.name} size="md" showBorder />
          </TouchableOpacity>
        </View>

        {/* Level & XP Card */}
        <Card variant="accent" style={styles.levelCard}>
          <View style={styles.levelContent}>
            <View style={styles.levelInfo}>
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={16} color={colors.accent.secondary} />
                <Text style={styles.levelText}>Level {stats?.level || 1}</Text>
              </View>
              <Text style={styles.xpText}>{stats?.xp || 0} XP</Text>
              <Text style={styles.xpSubtext}>{1000 - (stats?.xp % 1000 || 0)} XP to next level</Text>
            </View>
            <ProgressRing
              progress={xpProgress}
              size={70}
              color={colors.accent.secondary}
              showPercentage={false}
              label="Progress"
            />
          </View>
          
          {/* Streak */}
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={20} color={colors.accent.primary} />
            <Text style={styles.streakText}>{stats?.streak_days || 0} day streak</Text>
            {(stats?.streak_days || 0) >= 7 && (
              <Badge label="On Fire!" variant="gold" size="sm" />
            )}
          </View>
        </Card>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          <StatCard
            title="Sessions"
            value={stats?.stats?.attendance_count || 0}
            icon="calendar"
            iconColor={colors.accent.primary}
            style={styles.statCard}
          />
          <StatCard
            title="Tracks"
            value={stats?.stats?.track_count || 0}
            icon="musical-notes"
            iconColor={colors.accent.secondary}
            style={styles.statCard}
          />
          <StatCard
            title="Contributions"
            value={stats?.stats?.contribution_count || 0}
            icon="git-merge"
            iconColor={colors.accent.tertiary}
            style={styles.statCard}
          />
          <StatCard
            title="Matches"
            value={stats?.stats?.match_count || 0}
            icon="game-controller"
            iconColor={colors.status.info}
            style={styles.statCard}
          />
        </ScrollView>

        {/* Check-In Card */}
        <Card variant="elevated" style={styles.checkInCard}>
          <View style={styles.checkInContent}>
            <View>
              <Text style={styles.checkInTitle}>
                {isCheckedIn ? 'Currently Checked In' : 'Ready to Start?'}
              </Text>
              <Text style={styles.checkInSubtitle}>
                {isCheckedIn
                  ? 'Tap to check out and earn XP'
                  : 'Check in to track your studio time'}
              </Text>
            </View>
            <TouchableOpacity
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
            </TouchableOpacity>
          </View>
        </Card>

        {/* Upcoming Sessions */}
        {sessions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {sessions.map((session) => (
              <Card key={session.session_id} style={styles.sessionCard}>
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
                      {new Date(session.start_time).toLocaleDateString()} at{' '}
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Badge label={session.session_type} variant="accent" size="sm" />
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Activity Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Activity</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <Card key={activity.activity_id} style={styles.activityCard}>
              <View style={styles.activityContent}>
                <Avatar name={activity.user_name} size="sm" />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>{activity.description}</Text>
                  <Text style={styles.activityTime}>
                    {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={32} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No recent activity</Text>
            <Text style={styles.emptySubtext}>Be the first to create some buzz!</Text>
          </Card>
        )}

        {/* Badges Preview */}
        {stats?.badges && stats.badges.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Badges</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesRow}
            >
              {stats.badges.slice(0, 5).map((badge: any) => (
                <View key={badge.badge_id} style={styles.badgeItem}>
                  <View style={[styles.badgeIcon, { backgroundColor: `${colors.rarity[badge.rarity as keyof typeof colors.rarity]}20` }]}>
                    <Ionicons
                      name={badge.icon as any}
                      size={24}
                      color={colors.rarity[badge.rarity as keyof typeof colors.rarity] || colors.text.secondary}
                    />
                  </View>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
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
