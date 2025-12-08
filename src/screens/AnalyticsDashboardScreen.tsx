import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useHabits } from '@/hooks/useHabits';
import { useSubscription } from '@/context/SubscriptionContext';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import {
  Lock,
  Check,
  Upload,
  TrendingUp,
  Flame,
  BarChart3,
  Clipboard,
  Lightbulb,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';

type AnalyticsDashboardNavigationProp = StackNavigationProp<any, 'AnalyticsDashboard'>;

const { width } = Dimensions.get('window');

const DATE_RANGES = ['7 days', '30 days', '90 days', 'All time'];

const AnalyticsDashboardScreen: React.FC = () => {
  const navigation = useNavigation<AnalyticsDashboardNavigationProp>();
  const { theme } = useTheme();
  const { habits } = useHabits();
  const { subscription } = useSubscription();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const [selectedRange, setSelectedRange] = useState<'7 days' | '30 days' | '90 days' | 'All time'>('30 days');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh or refetch data if needed
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Filter out archived habits
  const activeHabits = habits.filter(h => !h.archived);

  // Helper function to get start date for a range
  const getStartDateForRange = (range: string): Date => {
    const now = new Date();
    const startDate = new Date(now);

    switch (range) {
      case '7 days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30 days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90 days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'All time':
        // Find earliest habit creation date
        const earliestHabit = activeHabits.reduce((earliest: Date | null, habit) => {
          if (!habit.createdAt) return earliest;
          const createdDate = new Date(habit.createdAt);
          return !earliest || createdDate < earliest ? createdDate : earliest;
        }, null);
        return earliestHabit || new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      default:
        startDate.setDate(now.getDate() - 30);
    }

    return startDate;
  };

  // Helper function to calculate completion rate for a habit
  const calculateCompletionRate = (habit: any): number => {
    if (!habit.createdAt) return 0;

    const createdDate = new Date(habit.createdAt);
    const today = new Date();
    const completions = habit.completions || {};

    // Count scheduled days since creation
    let scheduledDays = 0;
    const currentDate = new Date(createdDate);

    while (currentDate <= today) {
      const dayOfWeek = currentDate.getDay();
      if (habit.selectedDays.includes(dayOfWeek)) {
        scheduledDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (scheduledDays === 0) return 0;

    // Count completed days (met target)
    const completedDays = Object.keys(completions).filter(date => {
      const completion = completions[date];
      return completion && completion.completionCount >= completion.targetCount;
    }).length;

    return Math.round((completedDays / scheduledDays) * 100);
  };
  const archivedCount = habits.filter((h) => h.archived).length;

  // Calculate analytics data based on selected range
  const analyticsData = useMemo(() => {
    const now = new Date();
    const startDate = getStartDateForRange(selectedRange);

    // Calculate real total completions within the selected range
    const totalCompletions = activeHabits.reduce((sum, habit) => {
      const completions = habit.completions || {};

      // For "All time", don't filter by date - count all completions
      const completionsInRange = selectedRange === 'All time'
        ? Object.keys(completions)
        : Object.keys(completions).filter(dateStr => {
          const completionDate = new Date(dateStr);
          return completionDate >= startDate && completionDate <= now;
        });

      // Sum up all completion counts in range
      return sum + completionsInRange.reduce((dateSum, dateStr) => {
        const completion = completions[dateStr];
        return dateSum + (completion?.completionCount || 0);
      }, 0);
    }, 0);

    // Calculate real consistency score (avg completion rate across scheduled days)
    const calculateConsistencyScore = () => {
      if (activeHabits.length === 0) return 0;

      const now = new Date();
      const startDate = getStartDateForRange(selectedRange);

      let totalScheduledDays = 0;
      let totalCompletedDays = 0;

      activeHabits.forEach(habit => {
        const completions = habit.completions || {};
        const currentDate = new Date(startDate);

        while (currentDate <= now) {
          const dayOfWeek = currentDate.getDay();
          const dateStr = currentDate.toISOString().split('T')[0];

          // Check if this habit is scheduled for this day
          if (habit.selectedDays.includes(dayOfWeek)) {
            // Only count days on or after habit creation
            if (!habit.createdAt || new Date(habit.createdAt) <= currentDate) {
              totalScheduledDays++;
              const completion = completions[dateStr];
              if (completion && completion.completionCount >= completion.targetCount) {
                totalCompletedDays++;
              }
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      return totalScheduledDays > 0 ? Math.round((totalCompletedDays / totalScheduledDays) * 100) : 0;
    };

    // Calculate real day of week data from completion history
    const calculateDayOfWeekData = () => {
      const dayStats = Array(7).fill(null).map(() => ({ scheduled: 0, completed: 0 }));
      const now = new Date();
      const startDate = getStartDateForRange(selectedRange);

      activeHabits.forEach(habit => {
        const completions = habit.completions || {};
        const currentDate = new Date(startDate);

        while (currentDate <= now) {
          const dayOfWeek = currentDate.getDay();
          const dateStr = currentDate.toISOString().split('T')[0];

          if (habit.selectedDays.includes(dayOfWeek)) {
            if (!habit.createdAt || new Date(habit.createdAt) <= currentDate) {
              dayStats[dayOfWeek].scheduled++;
              const completion = completions[dateStr];
              if (completion && completion.completionCount >= completion.targetCount) {
                dayStats[dayOfWeek].completed++;
              }
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      return dayStats.map((stat, index) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
        value: stat.scheduled > 0
          ? Math.round((stat.completed / stat.scheduled) * 100)
          : 0
      }));
    };

    // Calculate real trend: compare current period to previous period
    const calculateTrend = () => {
      const now = new Date();
      const currentStart = getStartDateForRange(selectedRange);
      const periodLength = Math.ceil((now.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));

      const previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      const previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - periodLength);

      // Calculate completions for previous period
      const previousCompletions = activeHabits.reduce((sum, habit) => {
        const completions = habit.completions || {};
        return sum + Object.keys(completions).filter(dateStr => {
          const d = new Date(dateStr);
          return d >= previousStart && d <= previousEnd;
        }).reduce((dateSum, dateStr) => {
          return dateSum + (completions[dateStr]?.completionCount || 0);
        }, 0);
      }, 0);

      if (previousCompletions === 0) return totalCompletions > 0 ? '+100%' : '0%';
      const change = Math.round(((totalCompletions - previousCompletions) / previousCompletions) * 100);
      return change >= 0 ? `+${change}%` : `${change}%`;
    };

    // Generate real AI insights from habit data
    const generateRealInsights = () => {
      const insights: string[] = [];

      // Best day insight
      const bestDay = dayOfWeekData.reduce((best, current) =>
        current.value > best.value ? current : best
        , dayOfWeekData[0]);
      if (bestDay.value > 0) {
        insights.push(`${bestDay.day} is your best day with ${bestDay.value}% completion rate`);
      }

      // Streak insights
      const habitsWithStreaks = activeHabits.filter(h => h.streak > 3);
      if (habitsWithStreaks.length > 0) {
        const topStreak = habitsWithStreaks.reduce((a, b) => a.streak > b.streak ? a : b);
        insights.push(`"${topStreak.name}" has a ${topStreak.streak} day streak - keep it going!`);
      }

      // Consistency insight
      if (consistencyScore >= 80) {
        insights.push(`${consistencyScore}% consistency - you're crushing it!`);
      } else if (consistencyScore >= 50) {
        insights.push(`${consistencyScore}% consistency - room for improvement`);
      } else if (consistencyScore > 0) {
        insights.push(`${consistencyScore}% consistency - try starting smaller`);
      }

      // Habits at risk (low completion)
      const lowCompletionHabits = activeHabits.filter(h => {
        const rate = calculateCompletionRate(h);
        return rate < 50 && rate > 0;
      });
      if (lowCompletionHabits.length > 0) {
        insights.push(`${lowCompletionHabits.length} habit(s) need attention`);
      }

      return insights.length > 0 ? insights : ['Complete more habits to see insights'];
    };

    const consistencyScore = calculateConsistencyScore();
    const dayOfWeekData = calculateDayOfWeekData();
    const trendPercentage = calculateTrend();
    const aiInsights = generateRealInsights();

    // Find best day from real data
    const bestDay = dayOfWeekData.reduce((best, current) =>
      current.value > best.value ? current : best
      , dayOfWeekData[0]);

    const bestDayInsight = bestDay.value > 0
      ? `You're most productive on ${bestDay.day}s with ${bestDay.value}% completion!`
      : "Complete more habits to see insights";

    return {
      totalCompletions,
      consistencyScore,
      dayOfWeekData,
      trendPercentage,
      bestDayInsight,
      aiInsights,
    };
  }, [selectedRange, activeHabits, habits.length]);

  const averageStreak = activeHabits.length > 0
    ? Math.round(activeHabits.reduce((sum, h) => sum + h.streak, 0) / activeHabits.length)
    : 0;

  const maxDayValue = Math.max(...analyticsData.dayOfWeekData.map((d) => d.value));

  // Use real subscription status
  const isPremium = subscription.isPremium;

  if (!isPremium) {
    // Premium Gate Screen
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top', 'left', 'right']}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.premiumGate}>
            <View style={styles.blurOverlay}>
              <View style={styles.lockIconContainer}>
                <Lock size={64} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <Text
                style={[
                  styles.gateTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: theme.typography.fontSize2XL,
                  },
                ]}
              >
                Unlock Analytics with Premium
              </Text>
              <View style={styles.featureList}>
                {['Advanced statistics', 'AI-powered insights', 'Habit correlations', 'Export reports'].map(
                  (feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Check size={18} color="#22C55E" strokeWidth={2.5} />
                      <Text
                        style={[
                          styles.featureText,
                          {
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamilyBody,
                            fontSize: theme.typography.fontSizeMD,
                          },
                        ]}
                      >
                        {feature}
                      </Text>
                    </View>
                  )
                )}
              </View>
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('Subscription')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.upgradeButtonText,
                    {
                      color: theme.colors.white,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                      fontSize: theme.typography.fontSizeMD,
                    },
                  ]}
                >
                  Upgrade Now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gateBackButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.gateBackButtonText,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView >
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplayBold,
              fontSize: theme.typography.fontSizeXL,
            },
          ]}
        >
          Analytics
        </Text>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: theme.colors.backgroundSecondary }]}
          onPress={() => navigation.navigate('ExportData')}
          activeOpacity={0.7}
        >
          <Upload size={20} color={theme.colors.primary} strokeWidth={2} />
        </TouchableOpacity>
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
            {
              opacity: fadeAnim,
            },
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
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                      fontWeight:
                        selectedRange === range
                          ? theme.typography.fontWeightSemibold
                          : theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Summary Cards */}
        <Animated.View
          style={[
            styles.summaryGrid,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Total Completions */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.summaryIconContainer}>
              <Check size={24} color={theme.colors.primary} strokeWidth={2} />
            </View>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSize2XL,
                },
              ]}
            >
              {analyticsData.totalCompletions}
            </Text>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Completions
            </Text>
            <View style={styles.trendIndicator}>
              <TrendingUp size={12} color="#22C55E" strokeWidth={2} />
              <Text
                style={[
                  styles.trendText,
                  {
                    color: theme.colors.success,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                {analyticsData.trendPercentage}
              </Text>
            </View>
          </View>

          {/* Average Streak */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.summaryIconContainer}>
              <Flame size={24} color={theme.colors.primary} strokeWidth={2} />
            </View>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSize2XL,
                },
              ]}
            >
              {averageStreak}
            </Text>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Avg Streak
            </Text>
          </View>

          {/* Consistency Score */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.summaryIconContainer}>
              <BarChart3 size={24} color={theme.colors.primary} strokeWidth={2} />
            </View>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: analyticsData.consistencyScore >= 80 ? theme.colors.success : theme.colors.warning,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSize2XL,
                },
              ]}
            >
              {analyticsData.consistencyScore}%
            </Text>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Consistency
            </Text>
          </View>

          {/* Active Habits */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.summaryIconContainer}>
              <Clipboard size={24} color={theme.colors.primary} strokeWidth={2} />
            </View>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSize2XL,
                },
              ]}
            >
              {activeHabits.length}
            </Text>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Active Habits
            </Text>
            {archivedCount > 0 && (
              <Text
                style={[
                  styles.archivedText,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: 10,
                  },
                ]}
              >
                {archivedCount} archived
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Day of Week Analysis */}
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
            Completion by Day of Week
          </Text>
          <View style={styles.barChart}>
            {analyticsData.dayOfWeekData.map((item, index) => (
              <View key={item.day} style={styles.barContainer}>
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
                          item.value === maxDayValue
                            ? theme.colors.primary
                            : theme.colors.primaryLight || `${theme.colors.primary}60`,
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
                        item.value === maxDayValue
                          ? theme.colors.primary
                          : theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                      fontWeight:
                        item.value === maxDayValue
                          ? theme.typography.fontWeightSemibold
                          : theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  {item.day}
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
            <View style={styles.insightIconContainer}>
              <Lightbulb size={16} color={theme.colors.primary} strokeWidth={2} />
            </View>
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
              {analyticsData.bestDayInsight}
            </Text>
          </View>
        </Animated.View>

        {/* Habits Performance Table */}
        <Animated.View
          style={[
            styles.tableSection,
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
            Habits Performance
          </Text>
          {activeHabits.length === 0 ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📊</Text>
              <Text
                style={[
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                    textAlign: 'center',
                    paddingHorizontal: 24,
                    lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
                  },
                ]}
              >
                Complete a few habits to see detailed performance insights and track your progress over time.
              </Text>
            </View>
          ) : (
            activeHabits.slice(0, 5).map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[styles.habitRow, { borderBottomColor: theme.colors.border }]}
                onPress={() =>
                  navigation.navigate('HabitDeepDive', { habitId: habit.id, habitData: habit })
                }
                activeOpacity={0.7}
              >
                <View style={styles.habitInfo}>
                  <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                  <Text
                    style={[
                      styles.habitName,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBodyMedium,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {habit.name}
                  </Text>
                </View>
                <View style={styles.habitStats}>
                  <View style={styles.statBadge}>
                    <Flame size={12} color={theme.colors.primary} strokeWidth={2} />
                    <Text
                      style={[
                        styles.statText,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeXS,
                        },
                      ]}
                    >
                      {habit.streak}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.completionRate,
                      {
                        color: theme.colors.success,
                        fontFamily: theme.typography.fontFamilyBodySemibold,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {calculateCompletionRate(habit)}%
                  </Text>
                  <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>

        {/* AI Insights Panel */}
        <Animated.View
          style={[
            styles.aiSection,
            {
              backgroundColor: `${theme.colors.primary}10`,
              borderColor: `${theme.colors.primary}30`,
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.aiHeader}>
            <View style={styles.aiIconContainer}>
              <Sparkles size={20} color={theme.colors.primary} strokeWidth={2} />
            </View>
            <Text
              style={[
                styles.aiTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              AI Insights
            </Text>
            <View
              style={[styles.aiBadge, { backgroundColor: theme.colors.primary }]}
            >
              <Text
                style={{
                  color: theme.colors.white,
                  fontSize: 10,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                }}
              >
                PREMIUM
              </Text>
            </View>
          </View>
          {analyticsData.aiInsights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightBullet}>•</Text>
              <Text
                style={[
                  styles.insightItemText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                {insight}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.refreshButton, { borderColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AIInsights')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.refreshButtonText,
                {
                  color: theme.colors.primary,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              View All Insights →
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            onPress={() => navigation.navigate('ExportData')}
            activeOpacity={0.7}
          >
            <Upload size={18} color={theme.colors.primary} strokeWidth={2} />
            <Text
              style={[
                styles.actionText,
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
              styles.actionButton,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            onPress={() => console.log('Share report')}
            activeOpacity={0.7}
          >
            <BarChart3 size={18} color={theme.colors.primary} strokeWidth={2} />
            <Text
              style={[
                styles.actionText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              Share Report
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  summaryCard: {
    width: (width - 48 - 24) / 2,
    margin: 6,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryIconContainer: {
    marginBottom: 8,
  },
  summaryValue: {
    marginBottom: 4,
  },
  summaryLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 2,
  },
  trendText: {},
  archivedText: {
    marginTop: 4,
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
    height: 150,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    marginBottom: 8,
  },
  barBackground: {
    flex: 1,
    width: 28,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 14,
  },
  barLabel: {
    marginTop: 8,
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  insightIconContainer: {
    marginRight: 8,
  },
  insightText: {},
  tableSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  habitName: {
    flex: 1,
  },
  habitStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  statText: {},
  completionRate: {
    marginRight: 8,
    minWidth: 40,
    textAlign: 'right',
  },
  aiSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiIconContainer: {
    marginRight: 8,
  },
  aiTitle: {
    flex: 1,
  },
  aiBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  insightBullet: {
    fontSize: 16,
    marginRight: 8,
    color: '#6B7280',
  },
  insightItemText: {
    flex: 1,
    lineHeight: 22,
  },
  refreshButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButtonText: {},
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {},
  // Premium Gate styles
  premiumGate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  blurOverlay: {
    alignItems: 'center',
    width: '100%',
  },
  lockIconContainer: {
    marginBottom: 24,
  },
  gateTitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  featureList: {
    marginBottom: 32,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {},
  upgradeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeButtonText: {},
  gateBackButton: {
    paddingVertical: 12,
  },
  gateBackButtonText: {},
});

export default AnalyticsDashboardScreen;
