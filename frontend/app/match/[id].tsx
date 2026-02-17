import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../src/theme/colors';
import { Card, Avatar, Badge, Button, LoadingSkeleton } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/utils/api';

const GAME_TYPE_ICONS: Record<string, string> = {
  fps: 'skull',
  fighting: 'flash',
  racing: 'car-sport',
  sports: 'football',
  strategy: 'grid',
  battle_royale: 'flame',
};

export default function MatchDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState({ score: '', kills: '', deaths: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadMatch();
  }, [id]);

  const loadMatch = async () => {
    try {
      const data = await api.get<any>(`/matches/${id}`);
      setMatch(data);
    } catch (error) {
      console.error('Error loading match:', error);
      Alert.alert('Error', 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = async () => {
    setActionLoading(true);
    try {
      await api.post(`/matches/${id}/start`, {});
      Alert.alert('Match Started!', 'Good luck!');
      await loadMatch();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start match');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteMatch = async () => {
    Alert.alert(
      'Complete Match',
      'Are you sure you want to end this match?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setActionLoading(true);
            try {
              await api.post(`/matches/${id}/complete`, {});
              Alert.alert('Match Completed!', 'Winner has been determined');
              await loadMatch();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to complete match');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmitScore = async () => {
    if (!scoreData.score) {
      Alert.alert('Error', 'Please enter a score');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post(`/matches/${id}/scores`, {
        user_id: user?.user_id,
        score: parseInt(scoreData.score) || 0,
        kills: parseInt(scoreData.kills) || 0,
        deaths: parseInt(scoreData.deaths) || 0,
        rank_position: 0,
      });
      Alert.alert('Score Submitted!', 'XP earned based on your performance');
      setShowScoreModal(false);
      setScoreData({ score: '', kills: '', deaths: '' });
      await loadMatch();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit score');
    } finally {
      setSubmitLoading(false);
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

  const isCreator = match?.created_by === user?.user_id;
  const isParticipant = match?.participants?.includes(user?.user_id);
  const hasSubmittedScore = match?.scores?.some((s: any) => s.user_id === user?.user_id);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton height={200} style={{ marginBottom: spacing.lg }} />
          <LoadingSkeleton height={100} style={{ marginBottom: spacing.md }} />
          <LoadingSkeleton height={150} />
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.status.error} />
          <Text style={styles.errorText}>Match not found</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Match Info Card */}
        <Card variant="elevated" style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <View style={styles.gameTypeIcon}>
              <Ionicons
                name={GAME_TYPE_ICONS[match.game_type] as any || 'game-controller'}
                size={32}
                color={colors.accent.tertiary}
              />
            </View>
            <View style={styles.matchInfo}>
              <Text style={styles.matchTitle}>{match.title}</Text>
              <Text style={styles.gameName}>{match.game_name}</Text>
              <Badge
                label={getStatusLabel(match.status)}
                variant={match.status === 'completed' ? 'success' : match.status === 'in_progress' ? 'warning' : 'default'}
              />
            </View>
          </View>

          {/* Winner Banner */}
          {match.status === 'completed' && match.winner_id && (
            <View style={styles.winnerBanner}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.winnerText}>
                Winner: {match.participant_details?.find((p: any) => p.user_id === match.winner_id)?.name || 'Unknown'}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {match.status === 'pending' && isCreator && (
            <Button
              title="Start Match"
              onPress={handleStartMatch}
              loading={actionLoading}
              style={{ marginTop: spacing.md }}
            />
          )}

          {match.status === 'in_progress' && isParticipant && !hasSubmittedScore && (
            <Button
              title="Submit Score"
              onPress={() => setShowScoreModal(true)}
              variant="secondary"
              style={{ marginTop: spacing.md }}
            />
          )}

          {match.status === 'in_progress' && isCreator && (
            <Button
              title="Complete Match"
              onPress={handleCompleteMatch}
              loading={actionLoading}
              variant="outline"
              style={{ marginTop: spacing.sm }}
            />
          )}
        </Card>

        {/* Participants */}
        <Text style={styles.sectionTitle}>Participants</Text>
        {match.participant_details && match.participant_details.length > 0 ? (
          match.participant_details.map((participant: any) => {
            const score = match.scores?.find((s: any) => s.user_id === participant.user_id);
            const isWinner = match.winner_id === participant.user_id;
            
            return (
              <Card
                key={participant.user_id}
                style={[styles.participantCard, isWinner && styles.winnerCard]}
              >
                <View style={styles.participantContent}>
                  <Avatar uri={participant.picture} name={participant.name} size="md" />
                  <View style={styles.participantInfo}>
                    <View style={styles.participantNameRow}>
                      <Text style={styles.participantName}>{participant.name}</Text>
                      {isWinner && (
                        <Ionicons name="trophy" size={16} color="#FFD700" style={{ marginLeft: 8 }} />
                      )}
                    </View>
                    <Text style={styles.participantLevel}>Level {participant.level}</Text>
                  </View>
                  {score ? (
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreValue}>{score.score}</Text>
                      <Text style={styles.scoreLabel}>pts</Text>
                    </View>
                  ) : (
                    <Text style={styles.noScore}>--</Text>
                  )}
                </View>

                {/* Detailed Stats */}
                {score && (score.kills > 0 || score.deaths > 0) && (
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{score.kills}</Text>
                      <Text style={styles.statLabel}>Kills</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{score.deaths}</Text>
                      <Text style={styles.statLabel}>Deaths</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {score.deaths > 0 ? (score.kills / score.deaths).toFixed(2) : score.kills}
                      </Text>
                      <Text style={styles.statLabel}>K/D</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>+{score.xp_earned}</Text>
                      <Text style={styles.statLabel}>XP</Text>
                    </View>
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No participants yet</Text>
          </Card>
        )}

        {/* Match Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Match Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Game Type</Text>
            <Badge label={match.game_type.replace('_', ' ')} variant="accent" size="sm" />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(match.created_at).toLocaleDateString()}
            </Text>
          </View>
          {match.started_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Started</Text>
              <Text style={styles.infoValue}>
                {new Date(match.started_at).toLocaleTimeString()}
              </Text>
            </View>
          )}
          {match.ended_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ended</Text>
              <Text style={styles.infoValue}>
                {new Date(match.ended_at).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Submit Score Modal */}
      <Modal
        visible={showScoreModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowScoreModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Score</Text>
              <TouchableOpacity onPress={() => setShowScoreModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Score *</Text>
              <TextInput
                style={styles.input}
                value={scoreData.score}
                onChangeText={(text) => setScoreData({ ...scoreData, score: text })}
                placeholder="Enter your score"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.statsInputRow}>
              <View style={styles.statsInputBox}>
                <Text style={styles.inputLabel}>Kills</Text>
                <TextInput
                  style={styles.input}
                  value={scoreData.kills}
                  onChangeText={(text) => setScoreData({ ...scoreData, kills: text })}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.statsInputBox}>
                <Text style={styles.inputLabel}>Deaths</Text>
                <TextInput
                  style={styles.input}
                  value={scoreData.deaths}
                  onChangeText={(text) => setScoreData({ ...scoreData, deaths: text })}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Button
              title="Submit Score"
              onPress={handleSubmitScore}
              loading={submitLoading}
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
    marginVertical: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  matchCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  gameName: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  winnerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  winnerText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFD700',
    marginLeft: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  participantCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  winnerCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  participantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  participantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  participantLevel: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.accent.secondary,
  },
  scoreLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  noScore: {
    fontSize: typography.sizes.lg,
    color: colors.text.tertiary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  infoTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
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
  statsInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsInputBox: {
    width: '48%',
  },
});
