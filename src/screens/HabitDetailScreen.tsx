import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@app-core/theme';
import { useHabits, Habit, HabitEntry } from '@/hooks/useHabits';
import { useUserStore } from '@/store/userStore';
import { ExportManager, ExportFormat } from '@/utils/exportManager';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Palette,
  FileText,
  Check,
  X,
  Edit3,
  Upload,
  Share2,
  Flame,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import ConsistencyHeatmap from '@/components/stats/ConsistencyHeatmap';
import { HeatmapPoint } from '@/utils/analyticsUtils';

type HabitDetailRouteProp = RouteProp<
  { HabitDetail: { habitId: string; habitData: Habit } },
  'HabitDetail'
>;

const { width } = Dimensions.get('window');
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HabitDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<HabitDetailRouteProp>();
  const { theme } = useTheme();
  const {
    habits,
    completeHabit,
    uncompleteHabit,
    resetHabitForDate,
    isHabitCompletedForDate,
    getCompletionProgress
  } = useHabits();
  const { vacationHistory } = useUserStore();

  const { habitId } = route.params;

  // Get the latest habit data from context (in case it was updated)
  const habitData = habits.find(h => h.id === habitId) || route.params.habitData;

  // Export loading state
  const [isExporting, setIsExporting] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const todayISO = getTodayISO();

  // Check if habit is completed for today
  const isCompletedToday = isHabitCompletedForDate(habitId, todayISO);
  const todayProgress = getCompletionProgress(habitId, todayISO);

  // Calculate real stats from completion data
  const calculateStats = () => {
    const completions = habitData.completions || {};
    const completionDates = Object.keys(completions);

    // Total completions: sum of all completion counts
    const totalCompletions = completionDates.reduce((sum, date) => {
      return sum + (completions[date]?.completionCount || 0);
    }, 0);

    // Helper to check if a date is during vacation
    const isVacationDay = (dateStr: string) => {
      return vacationHistory.some(interval => {
        const start = new Date(interval.startDate);
        const end = interval.endDate ? new Date(interval.endDate) : new Date(); // If null, assume ongoing (up to today)
        const check = new Date(dateStr);
        return check >= start && check <= end;
      });
    };

    // Longest streak: calculate from completion history
    const calculateLongestStreak = (): number => {
      if (completionDates.length === 0) return 0;

      const sortedDates = completionDates.sort();
      let longestStreak = 0;
      let currentStreakLength = 0;

      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const completion = completions[sortedDates[i]];

        // Check if this day was completed (met target)
        if (completion && completion.completionCount >= completion.targetCount) {
          if (i === 0) {
            currentStreakLength = 1;
          } else {
            const prevDate = new Date(sortedDates[i - 1]);
            const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            // Consecutive day (considering selectedDays)
            if (daysDiff === 1) {
              currentStreakLength++;
            } else {
              // Check if gap is covered by vacation
              let gapCovered = true;
              for (let j = 1; j < daysDiff; j++) {
                const checkDate = new Date(prevDate);
                checkDate.setDate(checkDate.getDate() + j);
                const checkDateStr = checkDate.toISOString().split('T')[0];

                // If it's a scheduled day AND not vacation, then the chain is broken
                const dayOfWeek = checkDate.getDay();
                if (habitData.selectedDays.includes(dayOfWeek) && !isVacationDay(checkDateStr)) {
                  gapCovered = false;
                  break;
                }
              }

              if (gapCovered) {
                currentStreakLength++;
              } else {
                currentStreakLength = 1;
              }
            }
          }

          longestStreak = Math.max(longestStreak, currentStreakLength);
        } else {
          currentStreakLength = 0;
        }
      }

      return longestStreak;
    };

    // Calculate Current Streak (Backwards from today)
    const calculateCurrentStreak = (): number => {
      let streak = 0;
      const today = new Date();
      let checkDate = new Date(today);

      // If not completed today, start checking from yesterday
      const todayStr = checkDate.toISOString().split('T')[0];
      if (!isHabitCompletedForDate(habitId, todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Look back up to 365 days (safety limit)
      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const dayOfWeek = checkDate.getDay();

        // If not a scheduled day, just skip back
        if (!habitData.selectedDays.includes(dayOfWeek)) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }

        // Check completion
        const completion = completions[dateStr];
        const isCompleted = completion && completion.completionCount >= completion.targetCount;

        if (isCompleted) {
          streak++;
        } else {
          // If not completed, check if vacation
          if (isVacationDay(dateStr)) {
            // Vacation: freeze streak (don't increment, don't break)
          } else {
            // Not completed and not vacation: break streak
            break;
          }
        }

        checkDate.setDate(checkDate.getDate() - 1);
      }

      return streak;
    };

    // Completion rate: % of scheduled days that were completed
    const calculateCompletionRate = (): number => {
      if (!habitData.createdAt) return 0;

      const createdDate = new Date(habitData.createdAt);
      const today = new Date();
      const daysSinceCreation = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceCreation === 0) return 0;

      // Count how many days this habit was scheduled for
      let scheduledDays = 0;
      const currentDate = new Date(createdDate);

      while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];

        // Exclude vacation days from denominator? 
        // Usually completion rate should probably exclude vacation days to be fair.
        if (habitData.selectedDays.includes(dayOfWeek) && !isVacationDay(dateStr)) {
          scheduledDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (scheduledDays === 0) return 0;

      // Count completed days (met target)
      const completedDays = completionDates.filter(date => {
        const completion = completions[date];
        return completion && completion.completionCount >= completion.targetCount;
      }).length;

      return Math.round((completedDays / scheduledDays) * 100);
    };

    return {
      currentStreak: calculateCurrentStreak(),
      longestStreak: calculateLongestStreak(),
      totalCompletions,
      completionRate: calculateCompletionRate(),
    };
  };

  const stats = calculateStats();

  // Generate calendar data from actual completion records
  const generateCalendarData = () => {
    const days = [];
    const today = new Date();

    // Determine the start date (habit creation date or 90 days ago, whichever is more recent)
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);

    // Use habit creation date if available (from habitData.createdAt)
    // If no createdAt, default to showing the last 90 days
    const habitCreatedAt = (habitData as any).createdAt ? new Date((habitData as any).createdAt) : ninetyDaysAgo;
    const startDate = habitCreatedAt > ninetyDaysAgo ? habitCreatedAt : ninetyDaysAgo;

    // Generate array of dates from start date to today
    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const completion = habitData.completions?.[dateStr];

      // Check if this date is a selected day for the habit
      const dayOfWeek = currentDate.getDay();
      const isSelectedDay = habitData.selectedDays.includes(dayOfWeek);

      // Only include days that are part of the habit's schedule
      if (isSelectedDay) {
        const completed = completion ? completion.completionCount >= completion.targetCount : false;
        const hasNote = completion?.entries?.some(e => e.note || e.mood) || false;

        days.push({
          date: dateStr,
          completed,
          hasNote,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const calendarData = generateCalendarData();

  // Generate heatmap data
  const heatmapData: HeatmapPoint[] = calendarData.map(day => ({
    date: day.date,
    count: day.completed ? 1 : 0,
    level: day.completed ? (day.hasNote ? 4 : 2) : 0, // Simple level mapping
  }));

  // Generate recent activity (last 10 days)
  const recentActivity = calendarData.slice(-10).reverse().map((day) => ({
    ...day,
    time: '9:15 AM', // Placeholder time
  }));

  const handleEdit = () => {
    navigation.navigate('EditHabit', {
      habitId: habitData.id,
      habitData,
    });
  };

  const handleToggleComplete = () => {
    // For multi-completion habits that are fully complete: reset to 0
    if (habitData.targetCompletionsPerDay > 1 && isCompletedToday) {
      resetHabitForDate(habitId, todayISO);
      return;
    }

    // If completing (add a completion)
    if (!isCompletedToday) {
      // Check if we can still add more completions
      if (todayProgress.current < todayProgress.target) {
        completeHabit(habitId, todayISO);
      }
    } else {
      // Uncompleting (remove last completion) - for single completion habits
      uncompleteHabit(habitId, todayISO);
    }
  };

  const handleShareStreak = async () => {
    try {
      await Share.share({
        message: `I'm on a ${habitData.streak} day streak with "${habitData.name}" in Habit Tracker! 🔥`,
        title: 'Share My Streak',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Habit Data',
      'Choose export format:',
      [
        {
          text: 'CSV',
          onPress: () => exportHabitData('csv'),
        },
        {
          text: 'JSON',
          onPress: () => exportHabitData('json'),
        },
        {
          text: 'PDF/HTML',
          onPress: () => exportHabitData('pdf'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const exportHabitData = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const result = await ExportManager.exportData({
        format,
        habits: [habitData], // Export only this habit
        includeArchived: false,
      });

      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Export Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export habit data');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      health: '#EF4444',
      fitness: '#22C55E',
      productivity: '#3B82F6',
      mindfulness: '#A855F7',
      learning: '#F59E0B',
      social: '#EC4899',
      finance: '#10B981',
      creativity: '#F97316',
    };
    return colors[category.toLowerCase()] || theme.colors.primary;
  };

  const getScheduleText = () => {
    if (habitData.frequency === 'daily') {
      return 'Every day';
    }
    const days = habitData.selectedDays
      .sort((a, b) => a - b)
      .map(d => DAY_NAMES[d])
      .join(', ');
    return days;
  };

  const renderBentoStats = () => (
    <View style={styles.bentoGrid}>
      {/* Total Completions */}
      <View style={[styles.bentoCard, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <Check size={20} color={theme.colors.primary} strokeWidth={2.5} />
        </View>
        <Text style={[styles.bentoValue, { color: theme.colors.text }]}>{stats.totalCompletions}</Text>
        <Text style={[styles.bentoLabel, { color: theme.colors.textSecondary }]}>Total Wins</Text>
      </View>

      {/* Best Streak */}
      <View style={[styles.bentoCard, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.iconContainer, { backgroundColor: '#F59E0B20' }]}>
          <Award size={20} color="#F59E0B" strokeWidth={2.5} />
        </View>
        <Text style={[styles.bentoValue, { color: theme.colors.text }]}>{stats.longestStreak}</Text>
        <Text style={[styles.bentoLabel, { color: theme.colors.textSecondary }]}>Best Streak</Text>
      </View>

      {/* Completion Rate */}
      <View style={[styles.bentoCard, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.iconContainer, { backgroundColor: '#3B82F620' }]}>
          <Target size={20} color="#3B82F6" strokeWidth={2.5} />
        </View>
        <Text style={[styles.bentoValue, { color: theme.colors.text }]}>{stats.completionRate}%</Text>
        <Text style={[styles.bentoLabel, { color: theme.colors.textSecondary }]}>Success Rate</Text>
      </View>

      {/* Weekly Average (Placeholder logic) */}
      <View style={[styles.bentoCard, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.iconContainer, { backgroundColor: '#8B5CF620' }]}>
          <TrendingUp size={20} color="#8B5CF6" strokeWidth={2.5} />
        </View>
        <Text style={[styles.bentoValue, { color: theme.colors.text }]}>
          {Math.round(stats.totalCompletions / (heatmapData.length / 7) * 10) / 10 || 0}
        </Text>
        <Text style={[styles.bentoLabel, { color: theme.colors.textSecondary }]}>Weekly Avg</Text>
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.activityContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
      <View style={styles.timeline}>
        {recentActivity.slice(0, 5).map((activity, index) => {
          const date = new Date(activity.date);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          let dateLabel = activity.date;
          if (activity.date === today.toISOString().split('T')[0]) {
            dateLabel = 'Today';
          } else if (activity.date === yesterday.toISOString().split('T')[0]) {
            dateLabel = 'Yesterday';
          } else {
            const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            dateLabel = `${daysAgo} days ago`;
          }

          return (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, {
                  backgroundColor: activity.completed ? theme.colors.primary : theme.colors.border,
                  borderColor: theme.colors.background,
                }]} />
                {index < 4 && <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />}
              </View>
              <View style={[styles.timelineContent, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.timelineHeader}>
                  <Text style={[styles.timelineDate, { color: theme.colors.text }]}>{dateLabel}</Text>
                  <Text style={[styles.timelineStatus, {
                    color: activity.completed ? theme.colors.primary : theme.colors.textTertiary
                  }]}>
                    {activity.completed ? 'Completed' : 'Missed'}
                  </Text>
                </View>
                {activity.hasNote && (
                  <View style={[styles.noteContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
                    <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
                      Note added...
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderMoodNoteHistory = () => {
    // Get all entries with notes/moods from completions
    const getAllEntriesWithNotes = () => {
      const entries: Array<{
        id: string;
        date: string;
        mood?: string;
        note?: string;
      }> = [];

      const completions = habitData.completions || {};

      // Iterate through all completion dates
      Object.keys(completions).forEach((dateStr) => {
        const completion = completions[dateStr];
        if (completion?.entries && completion.entries.length > 0) {
          completion.entries.forEach((entry, index) => {
            // Only include entries that have a note or mood
            if (entry.note || entry.mood) {
              entries.push({
                id: `${dateStr}-${index}`,
                date: dateStr,
                mood: entry.mood,
                note: entry.note,
              });
            }
          });
        }
      });

      return entries;
    };

    const allEntries = getAllEntriesWithNotes();
    const sortedEntries = allEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100);

    if (sortedEntries.length === 0) return null;

    return (
      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          History & Notes
        </Text>
        {sortedEntries.map((entry, index) => (
          <View key={entry.id} style={[styles.historyItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.historyDate, { color: theme.colors.textSecondary }]}>{entry.date}</Text>
            {entry.mood && <Text style={styles.historyMood}>{entry.mood}</Text>}
            {entry.note && <Text style={[styles.historyNote, { color: theme.colors.text }]}>{entry.note}</Text>}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Immersive Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[getCategoryColor(habitData.category), theme.colors.background]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.headerNav}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.2)' }]}
            >
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleShareStreak} style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                <Share2 size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.2)', marginLeft: 8 }]}>
                <Edit3 size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroTop}>
              <Text style={styles.heroEmoji}>{habitData.emoji}</Text>
              <View>
                <Text style={styles.heroTitle}>{habitData.name}</Text>
                <Text style={styles.heroSubtitle}>
                  {getScheduleText()} • {habitData.timePeriod}
                </Text>
              </View>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Flame size={24} color="#FFF" fill="#FFF" />
                <Text style={styles.heroStatValue}>{stats.currentStreak}</Text>
                <Text style={styles.heroStatLabel}>Day Streak</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Target size={24} color="#FFF" />
                <Text style={styles.heroStatValue}>{stats.completionRate}%</Text>
                <Text style={styles.heroStatLabel}>Consistency</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Complete Today Button (Floating-ish) */}
        {!isCompletedToday && (
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
            onPress={handleToggleComplete}
            activeOpacity={0.9}
          >
            <Check size={24} color="#FFF" strokeWidth={3} />
            <Text style={styles.completeButtonText}>Complete Today</Text>
          </TouchableOpacity>
        )}

        {/* Bento Stats Grid */}
        {renderBentoStats()}

        {/* Heatmap Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <ConsistencyHeatmap data={heatmapData} />
        </View>

        {/* Recent Activity Timeline */}
        {renderRecentActivity()}

        {/* History & Notes */}
        {renderMoodNoteHistory()}

        {/* Details Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, marginBottom: 100 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Details</Text>

          <View style={styles.detailRow}>
            <Clock size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {habitData.reminderEnabled ? `Reminder at ${habitData.reminderTime}` : 'No reminder'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Palette size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              Theme: <Text style={{ color: habitData.color || theme.colors.primary, fontWeight: 'bold' }}>{habitData.color || 'Default'}</Text>
            </Text>
          </View>

          {habitData.notes && (
            <View style={styles.detailRow}>
              <FileText size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>{habitData.notes}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.exportButton, { borderColor: theme.colors.border }]}
            onPress={handleExportData}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.colors.text} />
            ) : (
              <>
                <Upload size={18} color={theme.colors.text} />
                <Text style={[styles.exportButtonText, { color: theme.colors.text }]}>Export Data</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 300,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  headerSafeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    marginTop: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollContainer: {
    flex: 1,
    marginTop: 320, // Push content down to reveal header (300px height + 20px buffer)
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  bentoCard: {
    width: (width - 52) / 2, // (screen width - padding - gap) / 2
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  bentoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bentoLabel: {
    fontSize: 12,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityContainer: {
    marginBottom: 24,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineStatus: {
    fontSize: 12,
  },
  noteContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  exportButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  historyMood: {
    fontSize: 20,
    marginBottom: 4,
  },
  historyNote: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HabitDetailScreen;
