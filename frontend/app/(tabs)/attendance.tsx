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
import { colors, spacing, typography, borderRadius } from '../../src/theme/colors';
import { Card, Button, Badge, LoadingSkeleton } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useAttendanceStore } from '../../src/store/attendanceStore';
import { api } from '../../src/utils/api';

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
      Alert.alert('Checked In!', 'Have a great session at the studio!');
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check in');
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
        'Checked Out!',
        `Session complete! Duration: ${response.duration_minutes} minutes. XP earned: ${response.xp_earned}`
      );
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check out');
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
        weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
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
        <Text style={styles.pageTitle}>Attendance</Text>

        {/* Check-In/Out Card */}
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
                {isCheckedIn ? 'Currently Checked In' : 'Not Checked In'}
              </Text>
            </View>

            {isCheckedIn && currentAttendance && (
              <View style={styles.sessionInfo}>
                <Ionicons name="time" size={16} color={colors.text.tertiary} />
                <Text style={styles.sessionTime}>
                  Started at{' '}
                  {new Date(currentAttendance.check_in).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}

            <Button
              title={isCheckedIn ? 'Check Out' : 'Check In'}
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

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statBox}>
            <Ionicons name="calendar" size={24} color={colors.accent.primary} />
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </Card>
          <Card style={styles.statBox}>
            <Ionicons name="time" size={24} color={colors.accent.secondary} />
            <Text style={styles.statValue}>{formatDuration(totalMinutes)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </Card>
          <Card style={styles.statBox}>
            <Ionicons name="star" size={24} color={colors.accent.tertiary} />
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </Card>
        </View>

        {/* Heatmap */}
        <Text style={styles.sectionTitle}>Activity (Last 30 Days)</Text>
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
            <Text style={styles.legendText}>Less</Text>
            <View style={[styles.legendCell, { backgroundColor: colors.background.elevated }]} />
            <View style={[styles.legendCell, { backgroundColor: 'rgba(220, 38, 38, 0.3)' }]} />
            <View style={[styles.legendCell, { backgroundColor: 'rgba(220, 38, 38, 0.6)' }]} />
            <View style={[styles.legendCell, { backgroundColor: 'rgba(220, 38, 38, 0.9)' }]} />
            <Text style={styles.legendText}>More</Text>
          </View>
        </Card>

        {/* History */}
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {history.length > 0 ? (
          history.map((record) => (
            <Card key={record.attendance_id} style={styles.historyCard}>
              <View style={styles.historyContent}>
                <View style={styles.historyIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDate}>
                    {new Date(record.check_in).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.historyTime}>
                    {new Date(record.check_in).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {record.check_out && (
                      <> - {new Date(record.check_out).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}</>
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
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={40} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptySubtext}>Check in to start tracking!</Text>
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
