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
import { AnimatedContainer, PressableScale } from '../../src/components/animation';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/utils/api';
import { t } from '../../src/i18n';

const CONTRIBUTION_TYPES = [
  { id: 'vocals', labelKey: 'music.contributionTypes.vocals', icon: 'mic' },
  { id: 'beat', labelKey: 'music.contributionTypes.beat', icon: 'musical-note' },
  { id: 'mix', labelKey: 'music.contributionTypes.mix', icon: 'options' },
  { id: 'master', labelKey: 'music.contributionTypes.master', icon: 'flash' },
  { id: 'instrument', labelKey: 'music.contributionTypes.instrument', icon: 'guitar' },
  { id: 'writing', labelKey: 'music.contributionTypes.writing', icon: 'create' },
  { id: 'production', labelKey: 'music.contributionTypes.production', icon: 'headset' },
];

export default function Music() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTrack, setNewTrack] = useState({ title: '', description: '', genre: '' });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const tracksData = await api.get<any[]>('/tracks?limit=30');
      setTracks(tracksData);
    } catch (error) {
      console.error('Error loading tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleCreateTrack = async () => {
    if (!newTrack.title.trim()) {
      Alert.alert(t('common.error'), t('music.enterTitle'));
      return;
    }

    setCreateLoading(true);
    try {
      await api.post('/tracks', {
        title: newTrack.title,
        description: newTrack.description,
        genre: newTrack.genre,
      });
      setShowCreateModal(false);
      setNewTrack({ title: '', description: '', genre: '' });
      Alert.alert(t('common.success'), t('music.trackCreated'));
      await loadData();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('errors.generic'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLike = async (trackId: string) => {
    try {
      await api.post(`/tracks/${trackId}/like`, {});
      await loadData();
    } catch (error) {
      console.error('Error liking track:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton height={40} width="50%" style={{ marginBottom: spacing.lg }} />
          <LoadingSkeleton height={120} style={{ marginBottom: spacing.md }} />
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
        <AnimatedContainer animation="fadeInUp">
          <View style={styles.header}>
            <Text style={styles.pageTitle}>{t('music.title')}</Text>
            <PressableScale
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={24} color={colors.text.primary} />
            </PressableScale>
          </View>
        </AnimatedContainer>

        {/* Stats */}
        <AnimatedContainer animation="fadeInUp" delay={100}>
          <View style={styles.statsRow}>
            <PressableScale style={styles.statCard}>
              <Ionicons name="musical-notes" size={20} color={colors.accent.primary} />
              <Text style={styles.statValue}>{tracks.length}</Text>
              <Text style={styles.statLabel}>{t('dashboard.tracks')}</Text>
            </PressableScale>
            <PressableScale style={styles.statCard}>
              <Ionicons name="heart" size={20} color={colors.accent.tertiary} />
              <Text style={styles.statValue}>
                {tracks.reduce((sum, t) => sum + (t.likes || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>{t('music.totalLikes')}</Text>
            </PressableScale>
            <PressableScale style={styles.statCard}>
              <Ionicons name="headset" size={20} color={colors.accent.secondary} />
              <Text style={styles.statValue}>
                {tracks.reduce((sum, t) => sum + (t.listens || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>{t('music.listens')}</Text>
            </PressableScale>
          </View>
        </AnimatedContainer>

        {/* Tracks List */}
        <AnimatedContainer animation="fadeInUp" delay={200}>
          <Text style={styles.sectionTitle}>{t('music.allTracks')}</Text>
        </AnimatedContainer>
        {tracks.length > 0 ? (
          tracks.map((track, index) => (
            <AnimatedContainer key={track.track_id} animation="fadeInUp" delay={250 + index * 50}>
              <Card style={styles.trackCard}>
                <PressableScale
                  onPress={() => router.push(`/track/${track.track_id}`)}
                >
                  <View style={styles.trackHeader}>
                    <View style={styles.trackCover}>
                      <Ionicons name="musical-notes" size={28} color={colors.accent.primary} />
                    </View>
                    <View style={styles.trackInfo}>
                      <Text style={styles.trackTitle}>{track.title}</Text>
                      {track.genre && (
                        <Badge label={track.genre} variant="accent" size="sm" />
                      )}
                      <Text style={styles.trackCreator}>
                        {t('music.by')} {track.created_by === user?.user_id ? t('music.you') : 'Membro'}
                      </Text>
                    </View>
                  </View>

                  {/* Contributors */}
                  {track.contributor_details && track.contributor_details.length > 0 && (
                    <View style={styles.contributorsRow}>
                      <View style={styles.avatarStack}>
                        {track.contributor_details.slice(0, 4).map((c: any, i: number) => (
                          <View key={c.user_id} style={[styles.stackedAvatar, { marginLeft: i > 0 ? -10 : 0 }]}>
                            <Avatar uri={c.picture} name={c.name} size="sm" />
                          </View>
                        ))}
                      </View>
                      <Text style={styles.contributorsText}>
                        {track.contributor_details.length} {t('music.contributors').toLowerCase()}
                      </Text>
                    </View>
                  )}

                  {/* Metrics */}
                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Ionicons name="headset" size={16} color={colors.text.tertiary} />
                      <Text style={styles.metricText}>{track.listens || 0}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.metricItem}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleLike(track.track_id);
                      }}
                    >
                      <Ionicons name="heart" size={16} color={colors.accent.tertiary} />
                      <Text style={styles.metricText}>{track.likes || 0}</Text>
                    </TouchableOpacity>
                    <View style={styles.metricItem}>
                      <Ionicons name="share" size={16} color={colors.text.tertiary} />
                      <Text style={styles.metricText}>{track.shares || 0}</Text>
                    </View>
                  </View>
                </PressableScale>
              </Card>
            </AnimatedContainer>
          ))
        ) : (
          <AnimatedContainer animation="fadeInUp" delay={250}>
            <Card style={styles.emptyCard}>
              <Ionicons name="musical-notes-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>{t('music.noTracks')}</Text>
              <Text style={styles.emptySubtext}>{t('music.createFirst')}</Text>
              <Button
                title={t('music.createTrack')}
                onPress={() => setShowCreateModal(true)}
                style={{ marginTop: spacing.md }}
              />
            </Card>
          </AnimatedContainer>
        )}
      </ScrollView>

      {/* Create Track Modal */}
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
              <Text style={styles.modalTitle}>{t('music.createTrack')}</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('music.trackTitle')} *</Text>
              <TextInput
                style={styles.input}
                value={newTrack.title}
                onChangeText={(text) => setNewTrack({ ...newTrack, title: text })}
                placeholder={t('music.trackTitlePlaceholder')}
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('music.genre')}</Text>
              <TextInput
                style={styles.input}
                value={newTrack.genre}
                onChangeText={(text) => setNewTrack({ ...newTrack, genre: text })}
                placeholder={t('music.genrePlaceholder')}
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('music.description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newTrack.description}
                onChangeText={(text) => setNewTrack({ ...newTrack, description: text })}
                placeholder={t('music.descriptionPlaceholder')}
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
              />
            </View>

            <Button
              title={t('music.createTrack')}
              onPress={handleCreateTrack}
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
    backgroundColor: colors.accent.primary,
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
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
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
  },
  trackCard: {
    marginBottom: spacing.md,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackCover: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  trackCreator: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  contributorsRow: {
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
  contributorsText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: spacing.md,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  metricText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
