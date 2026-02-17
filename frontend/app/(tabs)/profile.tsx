import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../src/theme/colors';
import { Card, Avatar, Badge, ProgressRing, Button, LoadingSkeleton } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/utils/api';

export default function Profile() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [gamificationStats, setGamificationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, badgesData, statsData] = await Promise.all([
        api.get<any>('/users/profile'),
        api.get<any[]>('/user/badges'),
        api.get<any>('/gamification/stats'),
      ]);

      setProfile(profileData);
      setBadges(badgesData);
      setGamificationStats(statsData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/auth/logout', {});
              setUser(null);
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const getRarityColor = (rarity: string) => {
    return colors.rarity[rarity as keyof typeof colors.rarity] || colors.text.secondary;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton height={150} style={{ marginBottom: spacing.lg }} />
          <LoadingSkeleton height={100} style={{ marginBottom: spacing.md }} />
          <LoadingSkeleton height={200} />
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
        {/* Header Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar uri={user?.picture} name={user?.name} size="xl" showBorder />
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          
          {/* Role Badges */}
          <View style={styles.rolesRow}>
            {user?.roles?.map((role) => (
              <Badge
                key={role}
                label={role.charAt(0).toUpperCase() + role.slice(1)}
                variant="accent"
                icon={role === 'music' ? 'musical-notes' : role === 'gaming' ? 'game-controller' : 'guitar'}
              />
            ))}
          </View>
        </Card>

        {/* Level & XP */}
        <Card style={styles.levelCard}>
          <View style={styles.levelRow}>
            <View style={styles.levelInfo}>
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={18} color={colors.accent.secondary} />
                <Text style={styles.levelText}>Level {profile?.level || 1}</Text>
              </View>
              <Text style={styles.xpText}>{gamificationStats?.xp || 0} / {gamificationStats?.xp_for_next_level || 1000} XP</Text>
            </View>
            <ProgressRing
              progress={gamificationStats?.progress_percent || 0}
              size={70}
              color={colors.accent.secondary}
            />
          </View>
          
          {/* Streak */}
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={22} color={colors.accent.primary} />
            <Text style={styles.streakValue}>{profile?.streak_days || 0}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </Card>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statBox}>
            <Ionicons name="calendar" size={24} color={colors.accent.primary} />
            <Text style={styles.statValue}>{profile?.stats?.attendance_count || 0}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </Card>
          <Card style={styles.statBox}>
            <Ionicons name="musical-notes" size={24} color={colors.accent.secondary} />
            <Text style={styles.statValue}>{profile?.stats?.track_count || 0}</Text>
            <Text style={styles.statLabel}>Tracks</Text>
          </Card>
          <Card style={styles.statBox}>
            <Ionicons name="git-merge" size={24} color={colors.accent.tertiary} />
            <Text style={styles.statValue}>{profile?.stats?.contribution_count || 0}</Text>
            <Text style={styles.statLabel}>Contributions</Text>
          </Card>
          <Card style={styles.statBox}>
            <Ionicons name="game-controller" size={24} color={colors.status.info} />
            <Text style={styles.statValue}>{profile?.stats?.match_count || 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </Card>
        </View>

        {/* Badges Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Badge label={`${badges.length} earned`} variant="gold" size="sm" />
        </View>
        
        {badges.length > 0 ? (
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <Card key={badge.badge_id} style={styles.badgeCard}>
                <View style={[styles.badgeIconContainer, { backgroundColor: `${getRarityColor(badge.rarity)}20` }]}>
                  <Ionicons
                    name={badge.icon as any}
                    size={28}
                    color={getRarityColor(badge.rarity)}
                  />
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeRarity}>{badge.rarity}</Text>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyBadges}>
            <Ionicons name="ribbon-outline" size={36} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No badges yet</Text>
            <Text style={styles.emptySubtext}>Complete activities to earn badges!</Text>
          </Card>
        )}

        {/* Recent XP Events */}
        {gamificationStats?.recent_events?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {gamificationStats.recent_events.slice(0, 5).map((event: any) => (
              <Card key={event.event_id} style={styles.eventCard}>
                <View style={styles.eventContent}>
                  <View style={styles.eventIcon}>
                    <Ionicons
                      name={event.event_type === 'attendance' ? 'calendar' : event.event_type === 'music' ? 'musical-notes' : 'star'}
                      size={18}
                      color={colors.accent.secondary}
                    />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                    <Text style={styles.eventTime}>
                      {new Date(event.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Badge label={`+${event.xp_amount} XP`} variant="gold" size="sm" />
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingsItem}>
            <Ionicons name="person-outline" size={22} color={colors.text.secondary} />
            <Text style={styles.settingsText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
          <View style={styles.settingsDivider} />
          <TouchableOpacity style={styles.settingsItem}>
            <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
            <Text style={styles.settingsText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
          <View style={styles.settingsDivider} />
          <TouchableOpacity style={styles.settingsItem}>
            <Ionicons name="help-circle-outline" size={22} color={colors.text.secondary} />
            <Text style={styles.settingsText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          icon={<Ionicons name="log-out" size={18} color={colors.accent.primary} style={{ marginRight: spacing.sm }} />}
        />

        {/* Version */}
        <Text style={styles.versionText}>Studio Hub Elite v1.0.0</Text>
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  profileEmail: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  rolesRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  levelCard: {
    marginBottom: spacing.lg,
  },
  levelRow: {
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.accent.secondary,
    marginLeft: spacing.xs,
  },
  xpText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  streakValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  streakLabel: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  badgeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  badgeRarity: {
    fontSize: 10,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  emptyBadges: {
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
  eventCard: {
    marginBottom: spacing.sm,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  eventTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingsText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  logoutButton: {
    marginBottom: spacing.md,
  },
  versionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
