import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../src/theme/colors';
import { Card, Button, Avatar, Badge, LoadingSkeleton } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/utils/api';

const GAME_TYPES = [
  { id: 'fps', label: 'FPS', icon: 'skull' },
  { id: 'fighting', label: 'Fighting', icon: 'flash' },
  { id: 'racing', label: 'Racing', icon: 'car-sport' },
  { id: 'sports', label: 'Sports', icon: 'football' },
  { id: 'strategy', label: 'Strategy', icon: 'grid' },
  { id: 'battle_royale', label: 'Battle Royale', icon: 'flame' },
];

export default function Gaming() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMatch, setNewMatch] = useState({
    title: '',
    game_type: 'fps',
    game_name: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const matchesData = await api.get<any[]>('/matches?limit=30');
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleCreateMatch = async () => {
    if (!newMatch.title.trim() || !newMatch.game_name.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setCreateLoading(true);
    try {
      await api.post('/matches', {
        title: newMatch.title,
        game_type: newMatch.game_type,
        game_name: newMatch.game_name,
        participants: [user?.user_id],
      });
      setShowCreateModal(false);
      setNewMatch({ title: '', game_type: 'fps', game_name: '' });
      Alert.alert('Success', 'Match created!');
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create match');
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.status.success;
      case 'in_progress': return colors.accent.secondary;
      default: return colors.text.tertiary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  // Calculate stats
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const wins = matches.filter(m => m.winner_id === user?.user_id).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton height={40} width="50%" style={{ marginBottom: spacing.lg }} />
          <LoadingSkeleton height={100} style={{ marginBottom: spacing.md }} />
          <LoadingSkeleton height={120} style={{ marginBottom: spacing.md }} />
          <LoadingSkeleton height={120} />
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
          <Text style={styles.pageTitle}>Gaming</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="game-controller" size={20} color={colors.accent.tertiary} />
            <Text style={styles.statValue}>{totalMatches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="trophy" size={20} color={colors.accent.secondary} />
            <Text style={styles.statValue}>{wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="stats-chart" size={20} color={colors.status.info} />
            <Text style={styles.statValue}>
              {completedMatches > 0 ? Math.round((wins / completedMatches) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </Card>
        </View>

        {/* Active Matches */}
        {matches.filter(m => m.status !== 'completed').length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active Matches</Text>
            {matches
              .filter(m => m.status !== 'completed')
              .map((match) => (
                <Card key={match.match_id} style={styles.matchCard}>
                  <TouchableOpacity
                    onPress={() => router.push(`/match/${match.match_id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.matchHeader}>
                      <View style={styles.gameTypeIcon}>
                        <Ionicons
                          name={GAME_TYPES.find(g => g.id === match.game_type)?.icon as any || 'game-controller'}
                          size={24}
                          color={colors.accent.tertiary}
                        />
                      </View>
                      <View style={styles.matchInfo}>
                        <Text style={styles.matchTitle}>{match.title}</Text>
                        <Text style={styles.gameName}>{match.game_name}</Text>
                      </View>
                      <Badge
                        label={getStatusLabel(match.status)}
                        variant={match.status === 'in_progress' ? 'warning' : 'default'}
                        size="sm"
                      />
                    </View>

                    {/* Participants */}
                    <View style={styles.participantsRow}>
                      <View style={styles.avatarStack}>
                        {match.participant_details?.slice(0, 4).map((p: any, i: number) => (
                          <View key={p.user_id} style={[styles.stackedAvatar, { marginLeft: i > 0 ? -10 : 0 }]}>
                            <Avatar uri={p.picture} name={p.name} size="sm" />
                          </View>
                        ))}
                      </View>
                      <Text style={styles.participantsText}>
                        {match.participants?.length || 0} player{(match.participants?.length || 0) !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
          </>
        )}

        {/* Completed Matches */}
        <Text style={styles.sectionTitle}>Match History</Text>
        {matches.filter(m => m.status === 'completed').length > 0 ? (
          matches
            .filter(m => m.status === 'completed')
            .map((match) => (
              <Card key={match.match_id} style={styles.matchCard}>
                <TouchableOpacity
                  onPress={() => router.push(`/match/${match.match_id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.matchHeader}>
                    <View style={[styles.gameTypeIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                      <Ionicons
                        name={GAME_TYPES.find(g => g.id === match.game_type)?.icon as any || 'game-controller'}
                        size={24}
                        color={colors.status.success}
                      />
                    </View>
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchTitle}>{match.title}</Text>
                      <Text style={styles.gameName}>{match.game_name}</Text>
                    </View>
                    {match.winner_id === user?.user_id ? (
                      <Badge label="Victory!" variant="success" size="sm" icon="trophy" />
                    ) : (
                      <Badge label="Completed" variant="default" size="sm" />
                    )}
                  </View>

                  {/* Scores */}
                  {match.scores && match.scores.length > 0 && (
                    <View style={styles.scoresRow}>
                      {match.scores.slice(0, 3).map((score: any, i: number) => (
                        <View key={score.score_id} style={styles.scoreItem}>
                          <Text style={styles.scoreRank}>#{i + 1}</Text>
                          <Text style={styles.scoreValue}>{score.score}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              </Card>
            ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="game-controller-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No matches yet</Text>
            <Text style={styles.emptySubtext}>Create a match to start competing!</Text>
            <Button
              title="Create Match"
              onPress={() => setShowCreateModal(true)}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}
      </ScrollView>

      {/* Create Match Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Match</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Match Title *</Text>
              <TextInput
                style={styles.input}
                value={newMatch.title}
                onChangeText={(text) => setNewMatch({ ...newMatch, title: text })}
                placeholder="e.g., Friday Night Tournament"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Game Name *</Text>
              <TextInput
                style={styles.input}
                value={newMatch.game_name}
                onChangeText={(text) => setNewMatch({ ...newMatch, game_name: text })}
                placeholder="e.g., Call of Duty, FIFA 25"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Game Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.gameTypesRow}>
                  {GAME_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.gameTypeOption,
                        newMatch.game_type === type.id && styles.gameTypeOptionSelected,
                      ]}
                      onPress={() => setNewMatch({ ...newMatch, game_type: type.id })}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={20}
                        color={newMatch.game_type === type.id ? colors.accent.tertiary : colors.text.tertiary}
                      />
                      <Text
                        style={[
                          styles.gameTypeLabel,
                          newMatch.game_type === type.id && { color: colors.accent.tertiary },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <Button
              title="Create Match"
              onPress={handleCreateMatch}
              loading={createLoading}
              size="lg"
              style={{ marginTop: spacing.md }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  pageTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.md,
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
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  matchCard: {
    marginBottom: spacing.md,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  gameName: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  stackedAvatar: {
    borderWidth: 2,
    borderColor: colors.background.card,
    borderRadius: 16,
  },
  participantsText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  scoresRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  scoreRank: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.accent.secondary,
    marginRight: spacing.xs,
  },
  scoreValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  gameTypesRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  gameTypeOption: {
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
  gameTypeOptionSelected: {
    borderColor: colors.accent.tertiary,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  gameTypeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
});
