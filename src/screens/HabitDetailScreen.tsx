import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useHabits, Habit, HabitEntry } from '@/contexts/HabitsContext';

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
  const { habits, toggleHabit } = useHabits();

  const { habitId } = route.params;

  // Get the latest habit data from context (in case it was updated)
  const habitData = habits.find(h => h.id === habitId) || route.params.habitData;

  // Mock data for stats - in production, this would come from stored history
  const stats = {
    currentStreak: habitData.streak || 0,
    longestStreak: (habitData.streak || 0) + 10,
    totalCompletions: Math.floor((habitData.streak || 0) * 1.5) || 42,
    completionRate: 86,
  };

  // Generate mock calendar data for the past 90 days
  const generateCalendarData = () => {
    const days = [];
    const today = new Date();

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Mock completion pattern - 80% completion rate
      const completed = Math.random() > 0.2;

      days.push({
        date: date.toISOString().split('T')[0],
        completed,
        hasNote: completed && Math.random() > 0.8,
      });
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
    toggleHabit(habitId);
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
      'This will export your habit history. Coming soon!',
      [{ text: 'OK' }]
    );
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
            <Text style={styles.detailEmoji}>📅</Text>
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
            <Text style={styles.detailEmoji}>⏰</Text>
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
            <Text style={styles.detailEmoji}>🎨</Text>
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
              <Text style={styles.detailEmoji}>📝</Text>
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
    // Group by weeks
    const weeks: any[][] = [];
    let currentWeek: any[] = [];

    calendarData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === calendarData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return (
      <View style={styles.calendarContainer}>
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
          Activity Heatmap (Last 90 Days)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.calendarScroll}
        >
          <View style={styles.calendarGrid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.calendarWeek}>
                {week.map((day, dayIndex) => {
                  const isToday =
                    day.date === new Date().toISOString().split('T')[0];

                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.calendarDay,
                        {
                          backgroundColor: day.completed
                            ? day.hasNote
                              ? '#22C55E'
                              : '#86EFAC'
                            : theme.colors.border,
                          borderColor: isToday ? theme.colors.primary : 'transparent',
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.calendarLegend}>
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
            Less
          </Text>
          <View style={[styles.legendBox, { backgroundColor: theme.colors.border }]} />
          <View style={[styles.legendBox, { backgroundColor: '#86EFAC' }]} />
          <View style={[styles.legendBox, { backgroundColor: '#22C55E' }]} />
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
            More
          </Text>
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
              <Text style={styles.activityIconText}>
                {activity.completed ? '✓' : '✕'}
              </Text>
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
    const entries = habitData.entries || [];
    if (entries.length === 0) return null;

    // Sort entries by timestamp (newest first)
    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

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
          Mood & Notes History
        </Text>
        {sortedEntries.slice(0, 10).map((entry, index) => {
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
          <Text style={styles.backIcon}>←</Text>
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
          <Text style={styles.editIcon}>✏️</Text>
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
                backgroundColor: habitData.completed ? theme.colors.success + '20' : theme.colors.surface,
                borderColor: habitData.completed ? theme.colors.success : theme.colors.border,
              },
            ]}
            onPress={handleToggleComplete}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.todayCheckbox,
                {
                  backgroundColor: habitData.completed ? theme.colors.success : 'transparent',
                  borderColor: habitData.completed ? theme.colors.success : theme.colors.border,
                },
              ]}
            >
              {habitData.completed && (
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
                {habitData.completed ? 'Completed Today!' : "Today's Check-in"}
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
                {habitData.completed ? 'Tap to undo' : 'Tap to mark as complete'}
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
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <Text style={styles.actionEmoji}>📤</Text>
            <Text
              style={[
                styles.actionText,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSizeSM,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                },
              ]}
            >
              Export Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleShareStreak}
            activeOpacity={0.7}
          >
            <Text style={styles.actionEmoji}>🎉</Text>
            <Text
              style={[
                styles.actionText,
                {
                  color: theme.colors.text,
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
    paddingHorizontal: 24,
  },
  calendarScroll: {
    marginBottom: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    gap: 3,
  },
  calendarWeek: {
    gap: 3,
  },
  calendarDay: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 2,
  },
  calendarLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    marginHorizontal: 4,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
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
    marginTop: 24,
    paddingHorizontal: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {},
});

export default HabitDetailScreen;
