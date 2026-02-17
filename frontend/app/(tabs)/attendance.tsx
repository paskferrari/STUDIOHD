import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme/colors';
import { Card, Button, Badge, LoadingSkeleton } from '../../src/components/ui';
import { AnimatedContainer, PressableScale } from '../../src/components/animation';
import { useAuthStore } from '../../src/store/authStore';
import { useAttendanceStore } from '../../src/store/attendanceStore';
import { api } from '../../src/utils/api';
import { t, formatDate } from '../../src/i18n';

export default function Attendance() {
  const { user } = useAuthStore();
  const { isCheckedIn, currentAttendance, setCheckedIn } = useAttendanceStore();
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statusData, historyData, heatmapData] = await Promise.all([
        api.get<any>('/attendance/status'),
        api.get<any[]>('/attendance/history?limit=20'),
        api.get<Record<string, any>>('/attendance/heatmap'),
      ]);

      setCheckedIn(statusData.is_checked_in, statusData.attendance);
      setHistory(historyData);
      setHeatmap(heatmapData);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const response = await api.post<any>('/attendance/check-in', {});
      setCheckedIn(true, response);
      Alert.alert(t('attendance.checkInSuccess'), t('attendance.checkInMessage'));
      await loadData();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('errors.generic'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const response = await api.post<any>('/attendance/check-out', {});
      setCheckedIn(false, null);
      Alert.alert(
        t('attendance.checkOutSuccess'),
        t('attendance.checkOutMessage', { duration: response.duration_minutes, xp: response.xp_earned })
      );
      await loadData();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('errors.generic'));
    } finally {
      setActionLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Calculate stats
  const totalSessions = history.length;
  const totalMinutes = history.reduce((sum, h) => sum + (h.duration_minutes || 0), 0);
  const totalXP = history.reduce((sum, h) => sum + (h.xp_earned || 0), 0);

  // Get last 30 days for heatmap visualization
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      days.push({
        date: key,
        day: date.getDate(),
        weekday: date.toLocaleDateString('it-IT', { weekday: 'short' }),
        data: heatmap[key],
      });
    }
    return days;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton height={180} style={{ marginBottom: spacing.lg }} />
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
        {/* Header */}
        <AnimatedContainer animation="fadeInUp">
          <Text style={styles.pageTitle}>{t('attendance.title')}</Text>
        </AnimatedContainer>

        {/* Check-In/Out Card */}
        <AnimatedContainer animation="fadeInUp" delay={100}>
          <Card variant="elevated" style={styles.checkCard}>
            <View style={styles.checkCardContent}>
              <View
                style={[
                  styles.statusIndicator,
                  isCheckedIn ? styles.statusActive : styles.statusInactive,
                ]}
              >
                <Ionicons
                  name={isCheckedIn ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isCheckedIn ? colors.status.success : colors.text.tertiary}
                />
                <Text
                  style={[
                    styles.statusText,
                    isCheckedIn && { color: colors.status.success },
                  ]}
                >
                  {isCheckedIn ? t('attendance.currentlyCheckedIn') : t('attendance.notCheckedIn')}
                </Text>
              </View>

              {isCheckedIn && currentAttendance && (
                <View style={styles.sessionInfo}>
                  <Ionicons name="time" size={16} color={colors.text.tertiary} />
                  <Text style={styles.sessionTime}>
                    {t('attendance.startedAt')}{' '}
                    {formatDate(currentAttendance.check_in, 'time')}
                  </Text>
                </View>
              )}

              <Button
                title={isCheckedIn ? t('attendance.checkOut') : t('attendance.checkIn')}
                onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
                variant={isCheckedIn ? 'secondary' : 'primary'}
                loading={actionLoading}
                size="lg"
                style={styles.checkButton}
                icon={
                  <Ionicons
                    name={isCheckedIn ? 'log-out' : 'log-in'}
                    size={20}
                    color={colors.text.primary}
                    style={{ marginRight: spacing.sm }}
                  />
                }
              />
            </View>
          </Card>
        </AnimatedContainer>

        {/* Stats Row */}
        <AnimatedContainer animation="fadeInUp" delay={200}>
          <View style={styles.statsRow}>
            <PressableScale style={styles.statBox}>
              <Ionicons name="calendar" size={24} color={colors.accent.primary} />
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>{t('attendance.totalSessions')}</Text>
            </PressableScale>
            <PressableScale style={styles.statBox}>
              <Ionicons name="time" size={24} color={colors.accent.secondary} />
              <Text style={styles.statValue}>{formatDuration(totalMinutes)}</Text>
              <Text style={styles.statLabel}>{t('attendance.totalTime')}</Text>
            </PressableScale>
            <PressableScale style={styles.statBox}>
              <Ionicons name="star" size={24} color={colors.accent.tertiary} />
              <Text style={styles.statValue}>{totalXP}</Text>
              <Text style={styles.statLabel}>{t('attendance.xpEarned')}</Text>
            </PressableScale>
          </View>
        </AnimatedContainer>

        {/* Heatmap */}
        <AnimatedContainer animation="fadeInUp" delay={300}>
          <Text style={styles.sectionTitle}>{t('attendance.activityLast30')}</Text>
          <Card style={styles.heatmapCard}>
            <View style={styles.heatmapGrid}>
              {getLast30Days().map((day, index) => {
                const intensity = day.data ? Math.min(day.data.count * 0.3 + 0.2, 1) : 0;
                return (
                  <View key={day.date} style={styles.heatmapDay}>
                    <View
                      style={[
                        styles.heatmapCell,
                        {
                          backgroundColor: intensity > 0
                            ? `rgba(220, 38, 38, ${intensity})`
                            : colors.background.elevated,
                        },
                      ]}
                    />
                    {index % 7 === 0 && (
                      <Text style={styles.heatmapLabel}>{day.day}</Text>
                    )}
                  </View>
                );
              })}
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={styles.legendText}>{t('attendance.less')}</Text>
              <View style={[styles.legendCell, { backgroundColor: colors.background.elevated }]} />
              <View style={[styles.legendCell, { backgroundColor: 'rgba(220, 38, 38, 0.3)' }]} />
              <View style={[styles.legendCell, { backgroundColor: 'rgba(220, 38, 38, 0.6)' }]} />
              <View style={[styles.legendCell, { backgroundColor: 'rgba(220, 38, 38, 0.9)' }]} />
              <Text style={styles.legendText}>{t('attendance.more')}</Text>
            </View>
          </Card>
        </AnimatedContainer>

        {/* History */}
        <AnimatedContainer animation="fadeInUp" delay={400}>
          <Text style={styles.sectionTitle}>{t('attendance.recentSessions')}</Text>
        </AnimatedContainer>
        {history.length > 0 ? (
          history.map((record, index) => (
            <AnimatedContainer key={record.attendance_id} animation="fadeInUp" delay={450 + index * 50}>
              <Card style={styles.historyCard}>
                <View style={styles.historyContent}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>
                      {formatDate(record.check_in, 'long')}
                    </Text>
                    <Text style={styles.historyTime}>
                      {formatDate(record.check_in, 'time')}
                      {record.check_out && (
                        <> - {formatDate(record.check_out, 'time')}</>
                      )}
                    </Text>
                  </View>
                  <View style={styles.historyStats}>
                    {record.duration_minutes > 0 && (
                      <Badge label={formatDuration(record.duration_minutes)} variant="default" size="sm" />
                    )}
                    {record.xp_earned > 0 && (
                      <Badge label={`+${record.xp_earned} XP`} variant="gold" size="sm" style={{ marginTop: 4 }} />
                    )}
                  </View>
                </View>
              </Card>
            </AnimatedContainer>
          ))
        ) : (
          <AnimatedContainer animation="fadeInUp" delay={450}>
            <Card style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={40} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>{t('attendance.noSessions')}</Text>
              <Text style={styles.emptySubtext}>{t('attendance.startTracking')}</Text>
            </Card>
          </AnimatedContainer>
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
  pageTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  checkCard: {
    marginBottom: spacing.lg,
  },
  checkCardContent: {
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  statusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusInactive: {
    backgroundColor: colors.background.elevated,
  },
  statusText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sessionTime: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  checkButton: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statBox: {
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
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  heatmapCard: {
    marginBottom: spacing.lg,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  heatmapDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
  },
  heatmapCell: {
    width: '100%',
    height: '70%',
    borderRadius: 4,
  },
  heatmapLabel: {
    fontSize: 8,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  legendText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginHorizontal: spacing.xs,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  historyCard: {
    marginBottom: spacing.sm,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  historyTime: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  historyStats: {
    alignItems: 'flex-end',
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
});
