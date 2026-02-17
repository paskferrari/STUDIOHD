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
import { colors, spacing, typography, borderRadius } from '../../src/theme/colors';
import { Card, Avatar, Badge, LoadingSkeleton } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/utils/api';

const PERIODS = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'seasonal', label: 'Season' },
  { id: 'all_time', label: 'All Time' },
];

const CATEGORY_ICONS: Record<string, string> = {
  attendance_monthly: 'calendar',
  music_impact: 'musical-notes',
  gaming_ranked: 'game-controller',
  hybrid_master: 'star',
};

const CATEGORY_COLORS: Record<string, string> = {
  attendance_monthly: colors.accent.primary,
  music_impact: colors.accent.secondary,
  gaming_ranked: colors.accent.tertiary,
  hybrid_master: colors.accent.highlight,
};

export default function Leaderboards() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('attendance_monthly');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCategory, selectedPeriod]);

  const loadCategories = async () => {
    try {
      const data = await api.get<any[]>('/leaderboards');
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.get<any>(`/leaderboards/${selectedCategory}?period=${selectedPeriod}`);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, [selectedCategory, selectedPeriod]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return colors.text.tertiary;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'trophy';
      case 2: return 'medal';
      case 3: return 'medal-outline';
      default: return null;
    }
  };

  const userRank = leaderboardData?.entries?.findIndex((e: any) => e.user_id === user?.user_id) + 1 || null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Rankings</Text>
        {userRank && (
          <Badge label={`#${userRank}`} variant="gold" />
        )}
      </View>

      {/* Category Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && {
                borderColor: CATEGORY_COLORS[cat.id],
                backgroundColor: `${CATEGORY_COLORS[cat.id]}15`,
              },
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons
              name={CATEGORY_ICONS[cat.id] as any}
              size={18}
              color={selectedCategory === cat.id ? CATEGORY_COLORS[cat.id] : colors.text.tertiary}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && { color: CATEGORY_COLORS[cat.id] },
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Period Selector */}
      <View style={styles.periodRow}>
        {PERIODS.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.id && styles.periodTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard */}
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
        {loading ? (
          <>
            <LoadingSkeleton height={80} style={{ marginBottom: spacing.md }} />
            <LoadingSkeleton height={60} style={{ marginBottom: spacing.sm }} />
            <LoadingSkeleton height={60} style={{ marginBottom: spacing.sm }} />
            <LoadingSkeleton height={60} style={{ marginBottom: spacing.sm }} />
          </>
        ) : leaderboardData?.entries?.length > 0 ? (
          <>
            {/* Top 3 Podium */}
            <View style={styles.podium}>
              {/* 2nd Place */}
              {leaderboardData.entries[1] && (
                <View style={[styles.podiumPlace, styles.podiumSecond]}>
                  <Avatar
                    uri={leaderboardData.entries[1].picture}
                    name={leaderboardData.entries[1].name}
                    size="md"
                  />
                  <View style={[styles.podiumRank, { backgroundColor: '#C0C0C0' }]}>
                    <Text style={styles.podiumRankText}>2</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {leaderboardData.entries[1].name?.split(' ')[0]}
                  </Text>
                  <Text style={styles.podiumScore}>
                    {Math.round(leaderboardData.entries[1].score)}
                  </Text>
                </View>
              )}

              {/* 1st Place */}
              {leaderboardData.entries[0] && (
                <View style={[styles.podiumPlace, styles.podiumFirst]}>
                  <Ionicons name="trophy" size={24} color="#FFD700" style={{ marginBottom: 8 }} />
                  <Avatar
                    uri={leaderboardData.entries[0].picture}
                    name={leaderboardData.entries[0].name}
                    size="lg"
                    showBorder
                  />
                  <View style={[styles.podiumRank, { backgroundColor: '#FFD700' }]}>
                    <Text style={styles.podiumRankText}>1</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {leaderboardData.entries[0].name?.split(' ')[0]}
                  </Text>
                  <Text style={styles.podiumScore}>
                    {Math.round(leaderboardData.entries[0].score)}
                  </Text>
                </View>
              )}

              {/* 3rd Place */}
              {leaderboardData.entries[2] && (
                <View style={[styles.podiumPlace, styles.podiumThird]}>
                  <Avatar
                    uri={leaderboardData.entries[2].picture}
                    name={leaderboardData.entries[2].name}
                    size="md"
                  />
                  <View style={[styles.podiumRank, { backgroundColor: '#CD7F32' }]}>
                    <Text style={styles.podiumRankText}>3</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {leaderboardData.entries[2].name?.split(' ')[0]}
                  </Text>
                  <Text style={styles.podiumScore}>
                    {Math.round(leaderboardData.entries[2].score)}
                  </Text>
                </View>
              )}
            </View>

            {/* Rest of Rankings */}
            {leaderboardData.entries.slice(3).map((entry: any) => (
              <Card
                key={entry.user_id}
                style={[
                  styles.rankCard,
                  entry.user_id === user?.user_id && styles.currentUserCard,
                ]}
              >
                <View style={styles.rankContent}>
                  <Text style={styles.rankNumber}>#{entry.rank}</Text>
                  <Avatar uri={entry.picture} name={entry.name} size="sm" />
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankName}>{entry.name}</Text>
                    <Text style={styles.rankLevel}>Level {entry.level}</Text>
                  </View>
                  <Text style={styles.rankScore}>{Math.round(entry.score)}</Text>
                </View>
              </Card>
            ))}
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="trophy-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No rankings yet</Text>
            <Text style={styles.emptySubtext}>Be the first to climb the leaderboard!</Text>
          </Card>
        )}

        {/* Scoring Info */}
        {categories.find(c => c.id === selectedCategory) && (
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={18} color={colors.accent.secondary} />
              <Text style={styles.infoTitle}>Scoring Formula</Text>
            </View>
            <Text style={styles.infoFormula}>
              {categories.find(c => c.id === selectedCategory)?.formula}
            </Text>
          </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  pageTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  categoriesRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  categoryText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs / 2,
  },
  periodButtonActive: {
    backgroundColor: colors.accent.primary,
  },
  periodText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.tertiary,
  },
  periodTextActive: {
    color: colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  podiumPlace: {
    alignItems: 'center',
    width: 100,
  },
  podiumFirst: {
    marginBottom: spacing.lg,
  },
  podiumSecond: {
    marginRight: spacing.sm,
  },
  podiumThird: {
    marginLeft: spacing.sm,
  },
  podiumRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
    marginBottom: spacing.xs,
  },
  podiumRankText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
  podiumName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginTop: spacing.xs,
    maxWidth: 80,
  },
  podiumScore: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.accent.secondary,
    marginTop: 2,
  },
  rankCard: {
    marginBottom: spacing.sm,
  },
  currentUserCard: {
    borderWidth: 1,
    borderColor: colors.accent.primary,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  rankContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.tertiary,
    width: 40,
  },
  rankInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  rankName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  rankLevel: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  rankScore: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.accent.secondary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  infoCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.background.tertiary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.accent.secondary,
    marginLeft: spacing.xs,
  },
  infoFormula: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});
