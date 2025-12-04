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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useHabits, Habit, HabitEntry } from '@/hooks/useHabits';
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
} from 'lucide-react-native';

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
              currentStreakLength = 1;
            }
          }

          longestStreak = Math.max(longestStreak, currentStreakLength);
        } else {
          currentStreakLength = 0;
        }
      }

      return longestStreak;
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
        if (habitData.selectedDays.includes(dayOfWeek)) {
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
      currentStreak: habitData.streak || 0,
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

  // Generate recent activity (last 10 days)
  const recentActivity = calendarData.slice(-10).reverse().map((day) => ({
    ...day,
    time: '9:15 AM',
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

  const renderStatCard = (
    icon: string,
    value: string | number,
    label: string,
    index: number
  ) => (
    <View
      key={index}
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderColor: theme.colors.border,
          shadowColor: theme.shadows.shadowSM.shadowColor,
          shadowOffset: theme.shadows.shadowSM.shadowOffset,
          shadowOpacity: theme.shadows.shadowSM.shadowOpacity,
          shadowRadius: theme.shadows.shadowSM.shadowRadius,
          elevation: theme.shadows.shadowSM.elevation,
        },
      ]}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text
        style={[
          styles.statValue,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyDisplayBold,
            fontSize: 28,
          },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeXS,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  const renderHabitDetails = () => (
    <View style={styles.detailsContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyBodySemibold,
            fontSize: theme.typography.fontSizeMD,
          },
        ]}
      >
        Habit Details
      </Text>
      <View
        style={[
          styles.detailsCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {/* Schedule */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Calendar size={20} color={theme.colors.textSecondary} strokeWidth={2} />
          </View>
          <View style={styles.detailContent}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Schedule
            </Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              {getScheduleText()}
            </Text>
          </View>
        </View>

        {/* Reminder */}
        <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
          <View style={styles.detailIcon}>
            <Clock size={20} color={theme.colors.textSecondary} strokeWidth={2} />
          </View>
          <View style={styles.detailContent}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Reminder
            </Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              {habitData.reminderEnabled && habitData.reminderTime
                ? `Daily at ${habitData.reminderTime}`
                : 'No reminder set'}
            </Text>
          </View>
        </View>

        {/* Color */}
        <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
          <View style={styles.detailIcon}>
            <Palette size={20} color={theme.colors.textSecondary} strokeWidth={2} />
          </View>
          <View style={styles.detailContent}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Color Theme
            </Text>
            <View style={styles.colorDisplay}>
              <View
                style={[
                  styles.colorCircle,
                  { backgroundColor: getCategoryColor(habitData.category) },
                ]}
              />
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodyMedium,
                    fontSize: theme.typography.fontSizeSM,
                    textTransform: 'capitalize',
                  },
                ]}
              >
                {habitData.color || 'Default'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes - only show if notes exist */}
        {habitData.notes && (
          <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
            <View style={styles.detailIcon}>
              <FileText size={20} color={theme.colors.textSecondary} strokeWidth={2} />
            </View>
            <View style={styles.detailContent}>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Notes
              </Text>
              <Text
                style={[
                  styles.notesText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                    lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
                  },
                ]}
              >
                {habitData.notes}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderCalendarHeatmap = () => {
    // Group by months for better readability
    const monthGroups: { [key: string]: any[] } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    calendarData.forEach((day) => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(day);
    });

    // Calculate stats
    const completedDays = calendarData.filter(d => d.completed).length;
    const completionRate = Math.round((completedDays / calendarData.length) * 100);

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBodySemibold,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            Activity Heatmap
          </Text>
          <View style={styles.statsRow}>
            <Text
              style={[
                styles.statsText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              {completedDays} days • {completionRate}% complete
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.calendarScroll}
          contentContainerStyle={styles.calendarScrollContent}
        >
          {Object.keys(monthGroups).reverse().map((monthKey) => {
            const days = monthGroups[monthKey];
            const date = new Date(days[0].date);
            const monthLabel = `${monthNames[date.getMonth()]} '${String(date.getFullYear()).slice(2)}`;

            return (
              <View key={monthKey} style={styles.monthGroup}>
                <Text
                  style={[
                    styles.monthLabel,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {monthLabel}
                </Text>
                <View style={styles.monthGrid}>
                  {days.map((day, index) => {
                    const isToday = day.date === new Date().toISOString().split('T')[0];
                    const dayOfWeek = new Date(day.date).getDay();

                    return (
                      <View
                        key={index}
                        style={[
                          styles.calendarDay,
                          {
                            backgroundColor: day.completed
                              ? day.hasNote
                                ? theme.colors.primary
                                : theme.colors.primary + '60'
                              : theme.colors.backgroundSecondary,
                            borderColor: isToday ? theme.colors.primary : theme.colors.border,
                            borderWidth: isToday ? 2 : 1,
                          },
                        ]}
                      >
                        {day.completed && (
                          <Check size={12} color="#fff" strokeWidth={3} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: theme.colors.backgroundSecondary, borderWidth: 1, borderColor: theme.colors.border }]} />
            <Text
              style={[
                styles.legendText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Not done
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: theme.colors.primary + '60' }]} />
            <Text
              style={[
                styles.legendText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Done
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: theme.colors.primary }]} />
            <Text
              style={[
                styles.legendText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Done with notes
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRecentActivity = () => (
    <View style={styles.activityContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyBodySemibold,
            fontSize: theme.typography.fontSizeMD,
          },
        ]}
      >
        Recent Activity
      </Text>
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
          const daysAgo = Math.floor(
            (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
          );
          dateLabel = `${daysAgo} days ago`;
        }

        return (
          <View
            key={index}
            style={[
              styles.activityItem,
              {
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.activityIcon,
                {
                  backgroundColor: activity.completed
                    ? '#22C55E20'
                    : theme.colors.border,
                },
              ]}
            >
              {activity.completed ? (
                <Check size={14} color="#22C55E" strokeWidth={3} />
              ) : (
                <X size={14} color={theme.colors.textTertiary} strokeWidth={3} />
              )}
            </View>
            <View style={styles.activityInfo}>
              <Text
                style={[
                  styles.activityDate,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodyMedium,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                {dateLabel}
              </Text>
              <Text
                style={[
                  styles.activityTime,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                {activity.completed ? activity.time : 'Missed'}
              </Text>
            </View>
          </View>
        );
      })}
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

    // Sort by date (most recent first) and limit to 100
    const sortedEntries = allEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100);

    if (sortedEntries.length === 0) {
      return null;
    }

    return (
      <View style={styles.moodNoteContainer}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyBodySemibold,
              fontSize: theme.typography.fontSizeMD,
            },
          ]}
        >
          Recent Notes ({sortedEntries.length})
        </Text>
        <ScrollView
          style={styles.notesScrollView}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {sortedEntries.map((entry, index) => {
            const date = new Date(entry.date);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateLabel = entry.date;
            if (entry.date === today.toISOString().split('T')[0]) {
              dateLabel = 'Today';
            } else if (entry.date === yesterday.toISOString().split('T')[0]) {
              dateLabel = 'Yesterday';
            } else {
              const daysAgo = Math.floor(
                (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
              );
              if (daysAgo < 30) {
                dateLabel = `${daysAgo} days ago`;
              } else {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                dateLabel = `${months[date.getMonth()]} ${date.getDate()}`;
              }
            }

            return (
              <View
                key={entry.id}
                style={[
                  styles.moodNoteItem,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                  index === sortedEntries.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.moodNoteHeader}>
                  {entry.mood && (
                    <Text style={styles.moodEmoji}>{entry.mood}</Text>
                  )}
                  <Text
                    style={[
                      styles.moodNoteDate,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    {dateLabel}
                  </Text>
                </View>
                {entry.note && (
                  <Text
                    style={[
                      styles.moodNoteText,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                        lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
                      },
                    ]}
                  >
                    {entry.note}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.habitHeader}>
            <Text style={styles.habitEmoji}>{habitData.emoji}</Text>
            <View style={styles.habitTitleContainer}>
              <Text
                style={[
                  styles.habitName,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: theme.typography.fontSizeLG,
                  },
                ]}
              >
                {habitData.name}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: `${getCategoryColor(habitData.category)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: getCategoryColor(habitData.category),
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {habitData.category.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Edit3 size={20} color={theme.colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Status */}
        <View style={styles.todayStatusContainer}>
          <TouchableOpacity
            style={[
              styles.todayStatusCard,
              {
                backgroundColor: isCompletedToday ? theme.colors.success + '20' : theme.colors.surface,
                borderColor: isCompletedToday ? theme.colors.success : theme.colors.border,
              },
            ]}
            onPress={handleToggleComplete}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.todayCheckbox,
                {
                  backgroundColor: isCompletedToday ? theme.colors.success : 'transparent',
                  borderColor: isCompletedToday ? theme.colors.success : theme.colors.border,
                },
              ]}
            >
              {isCompletedToday && (
                <Text style={[styles.todayCheckmark, { color: theme.colors.white }]}>✓</Text>
              )}
            </View>
            <View style={styles.todayInfo}>
              <Text
                style={[
                  styles.todayLabel,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                {isCompletedToday ? 'Completed Today!' : "Today's Check-in"}
              </Text>
              <Text
                style={[
                  styles.todayHint,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                {habitData.targetCompletionsPerDay > 1
                  ? `${todayProgress.current} / ${todayProgress.target} times${isCompletedToday ? ' - Tap to reset' : ' - Tap to check in'}`
                  : isCompletedToday ? 'Tap to undo' : 'Tap to mark as complete'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={styles.statsContainer}
        >
          {renderStatCard('🔥', stats.currentStreak, 'Current Streak', 0)}
          {renderStatCard('🏆', stats.longestStreak, 'Longest Streak', 1)}
          {renderStatCard('✓', stats.totalCompletions, 'Total Completions', 2)}
          {renderStatCard('📈', `${stats.completionRate}%`, 'Completion Rate', 3)}
        </ScrollView>

        {/* Habit Details Section */}
        {renderHabitDetails()}

        {/* Calendar Heatmap */}
        {renderCalendarHeatmap()}

        {/* Recent Activity */}
        {renderRecentActivity()}

        {/* Mood & Notes History */}
        {renderMoodNoteHistory()}

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: isExporting ? 0.5 : 1,
              },
            ]}
            onPress={handleExportData}
            activeOpacity={0.7}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <Upload size={18} color={theme.colors.white} strokeWidth={2.5} />
                <Text
                  style={[
                    styles.actionText,
                    {
                      color: theme.colors.white,
                      fontSize: theme.typography.fontSizeSM,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                    },
                  ]}
                >
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.success,
              },
            ]}
            onPress={handleShareStreak}
            activeOpacity={0.7}
          >
            <Share2 size={18} color={theme.colors.white} strokeWidth={2.5} />
            <Text
              style={[
                styles.actionText,
                {
                  color: theme.colors.white,
                  fontSize: theme.typography.fontSizeSM,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                },
              ]}
            >
              Share Streak
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  habitTitleContainer: {
    flex: 1,
  },
  habitName: {
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  todayStatusContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  todayStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  todayCheckbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  todayCheckmark: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  todayInfo: {
    flex: 1,
  },
  todayLabel: {
    marginBottom: 2,
  },
  todayHint: {},
  statsScroll: {
    marginTop: 16,
  },
  statsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    width: 130,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  detailIcon: {
    width: 36,
    marginRight: 12,
  },
  detailEmoji: {
    fontSize: 20,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {},
  colorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  notesText: {
    marginTop: 2,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  calendarContainer: {
    marginTop: 24,
  },
  calendarHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsRow: {
    marginTop: 4,
  },
  statsText: {
    lineHeight: 16,
  },
  calendarScroll: {
    marginBottom: 16,
  },
  calendarScrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  monthGroup: {
    gap: 8,
  },
  monthLabel: {
    marginBottom: 4,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    maxWidth: 200,
  },
  calendarDay: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    lineHeight: 16,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  activityContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityDate: {
    marginBottom: 2,
  },
  activityTime: {},
  moodNoteContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  notesScrollView: {
    maxHeight: 400,
    marginTop: 12,
  },
  moodNoteItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  moodNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  moodNoteDate: {
    flex: 1,
  },
  moodNoteText: {
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  actionText: {
    // styles from theme
  },
});

export default HabitDetailScreen;
