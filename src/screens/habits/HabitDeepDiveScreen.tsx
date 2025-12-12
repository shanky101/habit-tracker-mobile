import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@app-core/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { Habit, HabitEntry, useHabits } from '@/hooks/useHabits';

type HabitDeepDiveNavigationProp = StackNavigationProp<any, 'HabitDeepDive'>;
type HabitDeepDiveRouteProp = RouteProp<
  { HabitDeepDive: { habitId: string; habitData: Habit } },
  'HabitDeepDive'
>;

const { width } = Dimensions.get('window');

const DATE_RANGES = ['7 days', '30 days', '90 days', 'All time'];
const HOURS = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];

const HabitDeepDiveScreen: React.FC = () => {
  const navigation = useNavigation<HabitDeepDiveNavigationProp>();
  const route = useRoute<HabitDeepDiveRouteProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { habits } = useHabits();

  const { habitId } = route.params;
  const [selectedRange, setSelectedRange] = useState('30 days');

  // Get the latest habit data from context (includes updated entries)
  const habitData = habits.find(h => h.id === habitId) || route.params.habitData;

  // Calculate real stats from completion data
  const calculateBasicStats = () => {
    const completions = habitData.completions || {};
    const completionDates = Object.keys(completions);

    // Current streak (already real)
    const currentStreak = habitData.streak || 0;

    // Total completions: sum all completion counts
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

            // Consecutive day
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

    // Completion rate for last 30 days
    const calculateCompletionRate = (): number => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let scheduledDays = 0;
      let completedDays = 0;
      const currentDate = new Date(thirtyDaysAgo);

      while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];

        if (habitData.selectedDays.includes(dayOfWeek)) {
          scheduledDays++;
          const completion = completions[dateStr];
          if (completion && completion.completionCount >= completion.targetCount) {
            completedDays++;
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return scheduledDays > 0 ? Math.round((completedDays / scheduledDays) * 100) : 0;
    };

    return {
      currentStreak,
      longestStreak: calculateLongestStreak(),
      totalCompletions,
      completionRate: calculateCompletionRate(),
    };
  };

  const stats = calculateBasicStats();
  const currentStreak = stats.currentStreak;
  const longestStreak = stats.longestStreak;
  const totalCompletions = stats.totalCompletions;
  const completionRate = stats.completionRate;


  // Calculate real day of week breakdown
  const calculateDayOfWeekStats = () => {
    const completions = habitData.completions || {};
    const dayStats = Array(7).fill(null).map(() => ({ scheduled: 0, completed: 0 }));

    Object.entries(completions).forEach(([dateStr, completion]) => {
      const dayOfWeek = new Date(dateStr).getDay();
      dayStats[dayOfWeek].scheduled++;
      if (completion && completion.completionCount >= completion.targetCount) {
        dayStats[dayOfWeek].completed++;
      }
    });

    return dayStats.map((stat, index) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
      value: stat.scheduled > 0
        ? Math.round((stat.completed / stat.scheduled) * 100)
        : 0
    }));
  };

  const dayOfWeekData = calculateDayOfWeekStats();

  // Calculate real milestones from habit history
  const calculateMilestones = () => {
    const milestones: Array<{ date: string; event: string; icon: string }> = [];
    const completions = habitData.completions || {};
    const completionDates = Object.keys(completions).sort();

    // 1. Habit Created milestone
    if (habitData.createdAt) {
      const createdDate = new Date(habitData.createdAt);
      milestones.push({
        date: createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        event: 'Habit Created',
        icon: '🌱',
      });
    }

    // 2. Completion count milestones (10th, 25th, 50th, 100th, 200th, 500th, 1000th)
    const completionMilestones = [10, 25, 50, 100, 200, 500, 1000];
    const completionMilestoneIcons: { [key: number]: string } = {
      10: '⭐',
      25: '🎯',
      50: '🏅',
      100: '💯',
      200: '🎖️',
      500: '👑',
      1000: '🏆',
    };

    let cumulativeCompletions = 0;
    const milestoneTracker = new Set<number>();

    for (const dateStr of completionDates) {
      const completion = completions[dateStr];
      cumulativeCompletions += completion?.completionCount || 0;

      // Check if we've crossed any milestone thresholds
      for (const milestone of completionMilestones) {
        if (cumulativeCompletions >= milestone && !milestoneTracker.has(milestone)) {
          milestoneTracker.add(milestone);
          const milestoneDate = new Date(dateStr);
          milestones.push({
            date: milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            event: `${milestone}${milestone === 100 ? 'th' : milestone === 1000 ? 'th' : milestone === 10 ? 'th' : milestone === 25 ? 'th' : milestone === 50 ? 'th' : 'th'} Completion`,
            icon: completionMilestoneIcons[milestone] || '🎉',
          });
        }
      }
    }

    // 3. Streak milestones (7, 14, 30, 60, 90, 180, 365 days)
    const streakMilestones = [7, 14, 30, 60, 90, 180, 365];
    const streakMilestoneIcons: { [key: number]: string } = {
      7: '🔥',
      14: '💪',
      30: '🏆',
      60: '⚡',
      90: '🌟',
      180: '💎',
      365: '👑',
    };

    let currentStreakLength = 0;
    let streakStartDate: string | null = null;
    const streakMilestoneTracker = new Set<number>();

    for (let i = 0; i < completionDates.length; i++) {
      const currentDate = new Date(completionDates[i]);
      const completion = completions[completionDates[i]];

      // Check if this day was completed (met target)
      if (completion && completion.completionCount >= completion.targetCount) {
        if (i === 0) {
          currentStreakLength = 1;
          streakStartDate = completionDates[i];
        } else {
          const prevDate = new Date(completionDates[i - 1]);
          const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            currentStreakLength++;
          } else {
            // Streak broken, reset
            currentStreakLength = 1;
            streakStartDate = completionDates[i];
            streakMilestoneTracker.clear();
          }
        }

        // Check if current streak has reached any milestone
        for (const milestone of streakMilestones) {
          if (currentStreakLength === milestone && !streakMilestoneTracker.has(milestone)) {
            streakMilestoneTracker.add(milestone);
            const milestoneDate = new Date(completionDates[i]);
            milestones.push({
              date: milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              event: `${milestone} Day Streak`,
              icon: streakMilestoneIcons[milestone] || '🔥',
            });
          }
        }
      } else {
        // Day not completed, streak broken
        currentStreakLength = 0;
        streakStartDate = null;
        streakMilestoneTracker.clear();
      }
    }

    // Sort milestones chronologically (oldest first)
    return milestones.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const milestones = calculateMilestones();


  // Get real notes from habit completions
  const getRecentNotes = () => {
    // Get all entries from all daily completions
    const allEntries: HabitEntry[] = [];
    Object.values(habitData.completions || {}).forEach(completion => {
      allEntries.push(...completion.entries);
    });

    if (allEntries.length === 0) return [];

    // Sort by timestamp (newest first) and take the 5 most recent with notes
    const entriesWithNotes = allEntries
      .filter(entry => entry.note || entry.mood)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    // Format dates
    return entriesWithNotes.map(entry => {
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

      return {
        date: dateLabel,
        note: entry.note || '',
        mood: entry.mood || '📝',
      };
    });
  };

  const recentNotes = getRecentNotes();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
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
                numberOfLines={1}
              >
                {habitData.name}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: `${theme.colors.primary}20` },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {habitData.category}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Range Selector */}
        <Animated.View
          style={[
            styles.dateRangeContainer,
            { opacity: fadeAnim },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DATE_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.dateRangeButton,
                  {
                    backgroundColor:
                      selectedRange === range
                        ? theme.colors.primary
                        : theme.colors.backgroundSecondary,
                    borderColor:
                      selectedRange === range ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setSelectedRange(range)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateRangeText,
                    {
                      color:
                        selectedRange === range ? theme.colors.white : theme.colors.text,
                      fontSize: theme.typography.fontSizeSM,
                      fontFamily:
                        selectedRange === range
                          ? theme.typography.fontFamilyBodySemibold
                          : theme.typography.fontFamilyBodyMedium,
                    },
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Hero Stats */}
        <Animated.View
          style={[
            styles.heroStats,
            { opacity: fadeAnim },
          ]}
        >
          {/* Current Streak */}
          <View
            style={[
              styles.heroCard,
              styles.heroCardLarge,
              {
                backgroundColor: `${theme.colors.primary}15`,
                borderColor: `${theme.colors.primary}30`,
              },
            ]}
          >
            <Text style={styles.heroIcon}>🔥</Text>
            <Text
              style={[
                styles.heroValue,
                {
                  color: theme.colors.primary,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: 48,
                },
              ]}
            >
              {currentStreak}
            </Text>
            <Text
              style={[
                styles.heroLabel,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              Current Streak
            </Text>
          </View>

          <View style={styles.heroSmallCards}>
            {/* Longest Streak */}
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.heroIcon}>🏆</Text>
              <Text
                style={[
                  styles.heroValueSmall,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: theme.typography.fontSize2XL,
                  },
                ]}
              >
                {longestStreak}
              </Text>
              <Text
                style={[
                  styles.heroLabelSmall,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Longest Streak
              </Text>
            </View>

            {/* Total Completions */}
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.heroIcon}>✓</Text>
              <Text
                style={[
                  styles.heroValueSmall,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: theme.typography.fontSize2XL,
                  },
                ]}
              >
                {totalCompletions}
              </Text>
              <Text
                style={[
                  styles.heroLabelSmall,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                All Time
              </Text>
            </View>

            {/* Completion Rate */}
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.heroIcon}>📈</Text>
              <Text
                style={[
                  styles.heroValueSmall,
                  {
                    color: theme.colors.success,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: theme.typography.fontSize2XL,
                  },
                ]}
              >
                {completionRate}%
              </Text>
              <Text
                style={[
                  styles.heroLabelSmall,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Last 30 Days
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Completion by Hour - DISABLED (requires timestamp tracking)
         Feature disabled: Time-of-day analytics require timestamp data which is not currently tracked.
         To enable this feature, update the data model to store completion timestamps.
        
        <Animated.View
          style={[
            styles.chartSection,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
            },
          ]}
        >
          <Text
            style={[
              styles.chartTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBodySemibold,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            Completion by Time of Day
          </Text>
          <View style={styles.barChart}>
            {completionByHour.map((item) => (
              <View key={item.hour} style={styles.barContainer}>
                <Text
                  style={[
                    styles.barValue,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: 10,
                    },
                  ]}
                >
                  {item.value}%
                </Text>
                <View
                  style={[
                    styles.barBackground,
                    { backgroundColor: theme.colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor:
                          item.value === maxHourValue
                            ? theme.colors.primary
                            : `${theme.colors.primary}60`,
                        height: `${item.value}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    {
                      color:
                        item.value === maxHourValue
                          ? theme.colors.primary
                          : theme.colors.textSecondary,
                      fontSize: 10,
                      fontFamily:
                        item.value === maxHourValue
                          ? theme.typography.fontFamilyBodySemibold
                          : theme.typography.fontFamilyBodyMedium,
                    },
                  ]}
                >
                  {item.hour}
                </Text>
              </View>
            ))}
          </View>
          <View
            style={[
              styles.insightBadge,
              { backgroundColor: `${theme.colors.primary}15` },
            ]}
          >
            <Text style={styles.insightEmoji}>💡</Text>
            <Text
              style={[
                styles.insightText,
                {
                  color: theme.colors.primary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              You usually complete this at 9 AM
            </Text>
          </View>
        </Animated.View>
        */}

        {/* Pattern Recognition - DISABLED (requires ML/pattern detection algorithms)
         Feature disabled: AI pattern insights require complex analytics or ML models.
         Consider implementing simple rule-based insights in the future.
         
        <Animated.View
          style={[
            styles.patternsSection,
            {
              backgroundColor: `${theme.colors.primary}10`,
              borderColor: `${theme.colors.primary}30`,
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✨</Text>
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
              AI Pattern Recognition
            </Text>
          </View>
          {patterns.map((pattern, index) => (
            <View key={index} style={styles.patternItem}>
              <Text style={styles.patternBullet}>•</Text>
              <Text
                style={[
                  styles.patternText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                {pattern}
              </Text>
            </View>
          ))}
        </Animated.View>
        */}

        {/* Milestones Timeline */}
        <Animated.View
          style={[
            styles.milestonesSection,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
            },
          ]}
        >
          <Text
            style={[
              styles.chartTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBodySemibold,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            Milestones
          </Text>
          <View style={styles.timeline}>
            {milestones.map((milestone, index) => (
              <View key={index} style={styles.milestoneItem}>
                <View
                  style={[
                    styles.milestoneIcon,
                    { backgroundColor: `${theme.colors.primary}20` },
                  ]}
                >
                  <Text style={styles.milestoneEmoji}>{milestone.icon}</Text>
                </View>
                <View
                  style={[
                    styles.milestoneLine,
                    {
                      backgroundColor: theme.colors.border,
                      display: index === milestones.length - 1 ? 'none' : 'flex',
                    },
                  ]}
                />
                <View style={styles.milestoneContent}>
                  <Text
                    style={[
                      styles.milestoneEvent,
                      {
                        color: theme.colors.text,
                        fontSize: theme.typography.fontSizeSM,
                        fontFamily: theme.typography.fontFamilyBodyMedium,
                      },
                    ]}
                  >
                    {milestone.event}
                  </Text>
                  <Text
                    style={[
                      styles.milestoneDate,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    {milestone.date}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Notes */}
        <Animated.View
          style={[
            styles.notesSection,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.notesSectionHeader}>
            <Text
              style={[
                styles.chartTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              Recent Notes
            </Text>
            {recentNotes.length > 0 && (
              <TouchableOpacity activeOpacity={0.7}>
                <Text
                  style={[
                    styles.viewAllText,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {recentNotes.length === 0 ? (
            <View style={styles.emptyNotesContainer}>
              <Text style={styles.emptyNotesEmoji}>📝</Text>
              <Text
                style={[
                  styles.emptyNotesText,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                No notes yet. Add a note when you complete this habit!
              </Text>
            </View>
          ) : (
            recentNotes.map((note, index) => (
              <View
                key={index}
                style={[
                  styles.noteItem,
                  {
                    borderBottomColor: theme.colors.border,
                    borderBottomWidth: index === recentNotes.length - 1 ? 0 : 1,
                  },
                ]}
              >
                <View style={styles.noteHeader}>
                  <Text style={styles.noteMood}>{note.mood}</Text>
                  <Text
                    style={[
                      styles.noteDate,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    {note.date}
                  </Text>
                </View>
                {note.note && (
                  <Text
                    style={[
                      styles.noteText,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {note.note}
                  </Text>
                )}
              </View>
            ))
          )}
        </Animated.View>

        {/* Export Actions */}
        <View style={styles.exportActions}>
          <TouchableOpacity
            style={[
              styles.exportButton,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            onPress={() => navigation.navigate('ExportData')}
            activeOpacity={0.7}
          >
            <Text style={styles.exportIcon}>📤</Text>
            <Text
              style={[
                styles.exportText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              Export Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.exportButton,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            onPress={() => console.log('Share streak')}
            activeOpacity={0.7}
          >
            <Text style={styles.exportIcon}>📣</Text>
            <Text
              style={[
                styles.exportText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  habitTitleContainer: {
    flex: 1,
  },
  habitName: {},
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  categoryText: {
    textTransform: 'capitalize',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  dateRangeContainer: {
    marginBottom: 24,
  },
  dateRangeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  dateRangeText: {},
  heroStats: {
    marginBottom: 24,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  heroCardLarge: {
    marginBottom: 12,
  },
  heroSmallCards: {
    flexDirection: 'row',
    gap: 8,
  },
  heroIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  heroValue: {},
  heroValueSmall: {},
  heroLabel: {},
  heroLabelSmall: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  chartSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  chartTitle: {
    marginBottom: 20,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 130,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    marginBottom: 6,
  },
  barBackground: {
    flex: 1,
    width: 24,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  barLabel: {
    marginTop: 6,
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  insightEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  insightText: {},
  patternsSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {},
  patternItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  patternBullet: {
    fontSize: 16,
    marginRight: 10,
    color: '#6B7280',
  },
  patternText: {
    flex: 1,
    lineHeight: 22,
  },
  milestonesSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  timeline: {},
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  milestoneEmoji: {
    fontSize: 20,
  },
  milestoneLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 32,
  },
  milestoneContent: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 4,
  },
  milestoneEvent: {},
  milestoneDate: {
    marginTop: 2,
  },
  notesSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {},
  noteItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteMood: {
    fontSize: 18,
    marginRight: 8,
  },
  noteDate: {},
  noteText: {
    lineHeight: 22,
  },
  emptyNotesContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyNotesEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyNotesText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  exportActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  exportIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  exportText: {},
});

export default HabitDeepDiveScreen;
