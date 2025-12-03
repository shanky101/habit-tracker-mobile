import React, { useState, useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useHabits } from '@/contexts/HabitsContext';
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
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const [selectedRange, setSelectedRange] = useState('30 days');
  const [isPremium] = useState(true); // For demo, set to true

  // Get active and archived habits
  const activeHabits = habits.filter((h) => !h.archived);
  const archivedCount = habits.filter((h) => h.archived).length;

  // Calculate analytics data based on selected range
  const analyticsData = useMemo(() => {
    // Multiplier based on selected range to simulate different data
    const rangeMultipliers: Record<string, number> = {
      '7 days': 0.25,
      '30 days': 1,
      '90 days': 3,
      'All time': 6,
    };

    const multiplier = rangeMultipliers[selectedRange] || 1;
    const baseCompletions = activeHabits.reduce((sum, h) => sum + (h.completed ? 1 : 0), 0);

    // Generate different data for each range
    const totalCompletions = Math.round((baseCompletions + activeHabits.length * 5) * multiplier);

    // Consistency varies by range
    const consistencyScores: Record<string, number> = {
      '7 days': 92,
      '30 days': 87,
      '90 days': 78,
      'All time': 73,
    };

    // Day of week data varies by range
    const dayOfWeekDataByRange: Record<string, Array<{ day: string; value: number }>> = {
      '7 days': [
        { day: 'Mon', value: 100 },
        { day: 'Tue', value: 85 },
        { day: 'Wed', value: 90 },
        { day: 'Thu', value: 100 },
        { day: 'Fri', value: 75 },
        { day: 'Sat', value: 50 },
        { day: 'Sun', value: 65 },
      ],
      '30 days': [
        { day: 'Mon', value: 92 },
        { day: 'Tue', value: 88 },
        { day: 'Wed', value: 75 },
        { day: 'Thu', value: 90 },
        { day: 'Fri', value: 85 },
        { day: 'Sat', value: 60 },
        { day: 'Sun', value: 55 },
      ],
      '90 days': [
        { day: 'Mon', value: 85 },
        { day: 'Tue', value: 80 },
        { day: 'Wed', value: 78 },
        { day: 'Thu', value: 82 },
        { day: 'Fri', value: 75 },
        { day: 'Sat', value: 55 },
        { day: 'Sun', value: 50 },
      ],
      'All time': [
        { day: 'Mon', value: 78 },
        { day: 'Tue', value: 75 },
        { day: 'Wed', value: 72 },
        { day: 'Thu', value: 76 },
        { day: 'Fri', value: 70 },
        { day: 'Sat', value: 52 },
        { day: 'Sun', value: 48 },
      ],
    };

    // Trend percentages by range
    const trendPercentages: Record<string, string> = {
      '7 days': '+18%',
      '30 days': '+12%',
      '90 days': '+8%',
      'All time': '+5%',
    };

    // Best day insight by range
    const bestDayInsights: Record<string, string> = {
      '7 days': "You're crushing it on Mondays & Thursdays this week!",
      '30 days': "You're most productive on Mondays!",
      '90 days': "Monday has been your most consistent day",
      'All time': "Mondays have historically been your best days",
    };

    // AI insights by range
    const aiInsightsByRange: Record<string, string[]> = {
      '7 days': [
        "100% completion on Monday and Thursday this week",
        "Weekend habits need attention",
        "Current streak: You're on fire!",
      ],
      '30 days': [
        "Your morning habits have 92% completion rate",
        "You're 3x more likely to meditate after exercising",
        "Best streak: 58 days on 'Read 20 pages'",
      ],
      '90 days': [
        "Weekday habits are 35% more consistent than weekends",
        "Exercise correlates with better sleep habits",
        "You've improved consistency by 15% over last quarter",
      ],
      'All time': [
        "Total habits tracked: " + habits.length,
        "Average habit lifespan: 67 days",
        "Most successful category: Health & Fitness",
      ],
    };

    return {
      totalCompletions,
      consistencyScore: consistencyScores[selectedRange] || 87,
      dayOfWeekData: dayOfWeekDataByRange[selectedRange] || dayOfWeekDataByRange['30 days'],
      trendPercentage: trendPercentages[selectedRange] || '+12%',
      bestDayInsight: bestDayInsights[selectedRange] || bestDayInsights['30 days'],
      aiInsights: aiInsightsByRange[selectedRange] || aiInsightsByRange['30 days'],
    };
  }, [selectedRange, activeHabits, habits.length]);

  const averageStreak = activeHabits.length > 0
    ? Math.round(activeHabits.reduce((sum, h) => sum + h.streak, 0) / activeHabits.length)
    : 0;

  const maxDayValue = Math.max(...analyticsData.dayOfWeekData.map((d) => d.value));

  if (!isPremium) {
    // Premium Gate Screen
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
        contentContainerStyle={styles.scrollContent}
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
          {activeHabits.slice(0, 5).map((habit) => (
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
                  {Math.floor(Math.random() * 20) + 80}%
                </Text>
                <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
              </View>
            </TouchableOpacity>
          ))}
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
