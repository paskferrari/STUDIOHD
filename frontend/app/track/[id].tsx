import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../src/theme/colors';
import { Card, Avatar, Badge, Button, LoadingSkeleton } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/utils/api';

const CONTRIBUTION_TYPES = [
  { id: 'vocals', label: 'Vocals', icon: 'mic' },
  { id: 'beat', label: 'Beat', icon: 'musical-note' },
  { id: 'mix', label: 'Mix', icon: 'options' },
  { id: 'master', label: 'Master', icon: 'flash' },
  { id: 'instrument', label: 'Instrument', icon: 'guitar' },
  { id: 'writing', label: 'Writing', icon: 'create' },
  { id: 'production', label: 'Production', icon: 'headset' },
];

export default function TrackDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<string | null>(null);
  const [contributeLoading, setContributeLoading] = useState(false);

  useEffect(() => {
    loadTrack();
  }, [id]);

  const loadTrack = async () => {
    try {
      const data = await api.get<any>(`/tracks/${id}`);
      setTrack(data);
    } catch (error) {
      console.error('Error loading track:', error);
      Alert.alert('Error', 'Failed to load track');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await api.post(`/tracks/${id}/like`, {});
      setTrack((prev: any) => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    } catch (error) {
      console.error('Error liking track:', error);
    }
  };

  const handleContribute = async () => {
    if (!selectedContribution) return;

    setContributeLoading(true);
    try {
      await api.post(`/tracks/${id}/contributions`, {
        contribution_type: selectedContribution,
      });
      Alert.alert('Success', '+30 XP earned for your contribution!');
      setShowContributeModal(false);
      setSelectedContribution(null);
      await loadTrack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add contribution');
    } finally {
      setContributeLoading(false);
    }
  };

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

  if (!track) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.status.error} />
          <Text style={styles.errorText}>Track not found</Text>
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
          <Text style={styles.headerTitle}>Track Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Track Cover */}
        <View style={styles.coverSection}>
          <View style={styles.coverArt}>
            <Ionicons name="musical-notes" size={64} color={colors.accent.primary} />
          </View>
          <Text style={styles.trackTitle}>{track.title}</Text>
          {track.genre && <Badge label={track.genre} variant="accent" />}
          {track.description && (
            <Text style={styles.description}>{track.description}</Text>
          )}
        </View>

        {/* Metrics */}
        <View style={styles.metricsRow}>
          <TouchableOpacity style={styles.metricBox} onPress={handleLike}>
            <Ionicons name="heart" size={24} color={colors.accent.tertiary} />
            <Text style={styles.metricValue}>{track.likes || 0}</Text>
            <Text style={styles.metricLabel}>Likes</Text>
          </TouchableOpacity>
          <View style={styles.metricBox}>
            <Ionicons name="headset" size={24} color={colors.accent.secondary} />
            <Text style={styles.metricValue}>{track.listens || 0}</Text>
            <Text style={styles.metricLabel}>Listens</Text>
          </View>
          <View style={styles.metricBox}>
            <Ionicons name="share" size={24} color={colors.status.info} />
            <Text style={styles.metricValue}>{track.shares || 0}</Text>
            <Text style={styles.metricLabel}>Shares</Text>
          </View>
        </View>

        {/* Contributors */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contributors</Text>
          <Button
            title="Add Contribution"
            onPress={() => setShowContributeModal(true)}
            variant="ghost"
            size="sm"
          />
        </View>

        {track.contributions && track.contributions.length > 0 ? (
          track.contributions.map((contrib: any) => {
            const contributorDetails = track.contributor_details?.find(
              (c: any) => c.user_id === contrib.user_id
            );
            const typeInfo = CONTRIBUTION_TYPES.find((t) => t.id === contrib.contribution_type);
            
            return (
              <Card key={contrib.contribution_id} style={styles.contributorCard}>
                <View style={styles.contributorContent}>
                  <Avatar
                    uri={contributorDetails?.picture}
                    name={contributorDetails?.name || 'Unknown'}
                    size="md"
                  />
                  <View style={styles.contributorInfo}>
                    <Text style={styles.contributorName}>
                      {contributorDetails?.name || 'Unknown'}
                    </Text>
                    <View style={styles.contributionBadge}>
                      <Ionicons
                        name={typeInfo?.icon as any || 'musical-note'}
                        size={14}
                        color={colors.accent.secondary}
                      />
                      <Text style={styles.contributionType}>
                        {typeInfo?.label || contrib.contribution_type}
                      </Text>
                    </View>
                  </View>
                  <Badge label={`+${contrib.xp_earned || 30} XP`} variant="gold" size="sm" />
                </View>
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No contributions yet</Text>
            <Text style={styles.emptySubtext}>Be the first to contribute!</Text>
          </Card>
        )}

        {/* Track Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Track Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(track.created_at).toLocaleDateString()}
            </Text>
          </View>
          {track.duration_seconds > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>
                {Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, '0')}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contributors</Text>
            <Text style={styles.infoValue}>{track.contributors?.length || 0}</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Contribute Modal */}
      <Modal
        visible={showContributeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContributeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Contribution</Text>
              <TouchableOpacity onPress={() => setShowContributeModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Select your contribution type</Text>

            <View style={styles.contributionGrid}>
              {CONTRIBUTION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.contributionOption,
                    selectedContribution === type.id && styles.contributionOptionSelected,
                  ]}
                  onPress={() => setSelectedContribution(type.id)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={selectedContribution === type.id ? colors.accent.primary : colors.text.tertiary}
                  />
                  <Text
                    style={[
                      styles.contributionLabel,
                      selectedContribution === type.id && { color: colors.accent.primary },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Add Contribution (+30 XP)"
              onPress={handleContribute}
              loading={contributeLoading}
              disabled={!selectedContribution}
              size="lg"
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
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
  coverSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  coverArt: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  trackTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  metricBox: {
    alignItems: 'center',
    padding: spacing.md,
  },
  metricValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  metricLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  contributorCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  contributorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contributorInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contributorName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  contributionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  contributionType: {
    fontSize: typography.sizes.sm,
    color: colors.accent.secondary,
    marginLeft: spacing.xs,
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
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
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
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  contributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contributionOption: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border.default,
  },
  contributionOptionSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  contributionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
