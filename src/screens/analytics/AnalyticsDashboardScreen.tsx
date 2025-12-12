import React, { useState, useMemo } from 'react';
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
import { useTheme } from '@app-core/theme';
import { useHabits } from '@/hooks/useHabits';
import { useSubscription } from '@/context/SubscriptionContext';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import {
  Lock,
  Check,
  Upload,
  TrendingUp,
  Flame,
  Award,
  Zap,
  Calendar,
  PieChart as PieChartIcon,
  Clock,
  ChevronRight,
} from 'lucide-react-native';

// New Components & Utils
import { StatCard, ConsistencyHeatmap, CategoryDistributionChart, TimeOfDayChart } from '@app-core/ui';
import {
  getConsistencyHeatmapData,
  getCategoryDistribution,
  getTimeOfDayDistribution,
  getPerfectDaysCount,
  getUserLevel,
} from '@/utils/analyticsUtils';

type AnalyticsDashboardNavigationProp = StackNavigationProp<any, 'AnalyticsDashboard'>;

const { width } = Dimensions.get('window');

const AnalyticsDashboardScreen: React.FC = () => {
  const navigation = useNavigation<AnalyticsDashboardNavigationProp>();
  const { theme } = useTheme();
  const { habits } = useHabits();
  const { subscription } = useSubscription();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const activeHabits = habits.filter(h => !h.archived);
  const isPremium = subscription.isPremium;

  // --- Metrics Calculation ---
  const metrics = useMemo(() => {
    const heatmapData = getConsistencyHeatmapData(habits, 90);
    const categoryData = getCategoryDistribution(habits, theme.colors);
    const timeOfDayData = getTimeOfDayDistribution(habits, theme.colors);
    const perfectDays = getPerfectDaysCount(habits);
    const userLevel = getUserLevel(habits);

    // Calculate average streak
    const avgStreak = activeHabits.length > 0
      ? Math.round(activeHabits.reduce((sum, h) => sum + h.streak, 0) / activeHabits.length)
      : 0;

    // Calculate consistency score (simple average of last 30 days)
    // This is a simplified version for the demo
    const consistencyScore = Math.min(Math.round((userLevel.totalCompletions / (activeHabits.length * 30 || 1)) * 100), 100);

    return {
      heatmapData,
      categoryData,
      timeOfDayData,
      perfectDays,
      userLevel,
      avgStreak,
      consistencyScore,
    };
  }, [habits, activeHabits.length, theme.colors]);

  // --- Premium Gate ---
  if (!isPremium) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={styles.premiumGate}>
            <View style={styles.blurOverlay}>
              <View style={styles.lockIconContainer}>
                <Lock size={64} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.gateTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamilyDisplayBold }]}>
                Unlock Advanced Analytics
              </Text>
              <Text style={[styles.gateSubtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamilyBody }]}>
                Gain deep insights into your habits, track your consistency, and level up your life.
              </Text>
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('Subscription')}
                activeOpacity={0.8}
              >
                <Text style={[styles.upgradeButtonText, { color: theme.colors.white, fontFamily: theme.typography.fontFamilyBodySemibold }]}>
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamilyDisplayBold }]}>
            Analytics
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamilyBody }]}>
            Level {metrics.userLevel.level} • {metrics.userLevel.xp} XP
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: theme.colors.backgroundSecondary }]}
          onPress={() => navigation.navigate('ExportData')}
        >
          <Upload size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Level Progress */}
        <Animated.View style={[styles.levelContainer, { opacity: fadeAnim }]}>
          <View style={styles.levelHeader}>
            <Text style={[styles.levelText, { color: theme.colors.text, fontFamily: theme.typography.fontFamilyBodySemibold }]}>
              Progress to Level {metrics.userLevel.level + 1}
            </Text>
            <Text style={[styles.xpText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamilyBodyMedium }]}>
              {Math.round(metrics.userLevel.progress * 100)}%
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${metrics.userLevel.progress * 100}%`
                }
              ]}
            />
          </View>
        </Animated.View>

        {/* Time Travel / History Card */}
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 12 }}>
          <StatCard
            title="Time Travel"
            subtitle="View your entire journey"
            icon={Calendar}
            gradientColors={['#8B5CF6', '#6366F1']} // Violet to Indigo
            fullWidth
            height={100}
            onPress={() => navigation.navigate('CalendarHistory')}
          />
        </Animated.View>

        {/* Bento Grid Layout */}
        <Animated.View style={[styles.bentoGrid, { opacity: fadeAnim }]}>

          {/* Row 1: Consistency & Streak */}
          <View style={styles.row}>
            <StatCard
              title="Consistency"
              value={`${metrics.consistencyScore}%`}
              subtitle="Last 30 Days"
              icon={TrendingUp}
              gradientColors={[theme.colors.primary, theme.colors.secondary]}
              fullWidth={false}
              height={160}
              onPress={() => navigation.navigate('StatDetail', {
                statType: 'consistency',
                metrics
              })}
            />
            <StatCard
              title="Avg Streak"
              value={`${metrics.avgStreak}`}
              subtitle="Days"
              icon={Flame}
              fullWidth={false}
              height={160}
              onPress={() => navigation.navigate('StatDetail', {
                statType: 'streak',
                metrics
              })}
            />
          </View>

          {/* Row 2: Heatmap (Full Width) */}
          <StatCard
            title="Consistency Map"
            icon={Calendar}
            fullWidth
            style={{ paddingBottom: 0 }}
            onPress={() => navigation.navigate('StatDetail', {
              statType: 'heatmap',
              metrics
            })}
          >
            <ConsistencyHeatmap data={metrics.heatmapData} />
          </StatCard>

          {/* Row 3: Category & Time of Day */}
          <View style={styles.row}>
            <StatCard
              title="Life Balance"
              icon={PieChartIcon}
              fullWidth={false}
              onPress={() => navigation.navigate('StatDetail', {
                statType: 'balance',
                metrics
              })}
            >
              <CategoryDistributionChart data={metrics.categoryData} />
            </StatCard>
            <StatCard
              title="Chronotype"
              icon={Clock}
              fullWidth={false}
              onPress={() => navigation.navigate('StatDetail', {
                statType: 'chronotype',
                metrics
              })}
            >
              <TimeOfDayChart data={metrics.timeOfDayData} />
            </StatCard>
          </View>

          {/* Row 4: Perfect Days & Total */}
          <View style={styles.row}>
            <StatCard
              title="Perfect Days"
              value={`${metrics.perfectDays}`}
              subtitle="100% Completion"
              icon={Award}
              gradientColors={['#F59E0B', '#D97706']} // Gold gradient
              fullWidth={false}
              height={140}
              onPress={() => navigation.navigate('StatDetail', {
                statType: 'perfectDays',
                metrics
              })}
            />
            <StatCard
              title="User Level"
              value={`Lvl ${metrics.userLevel.level}`}
              subtitle={`${metrics.userLevel.xp} XP`}
              icon={Check}
              fullWidth={false}
              height={140}
              onPress={() => navigation.navigate('StatDetail', {
                statType: 'level',
                metrics
              })}
            />
          </View>

          {/* AI Insights Teaser */}
          <TouchableOpacity
            style={[styles.aiCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('AIInsights')} // Assuming this screen exists or will exist
            activeOpacity={0.8}
          >
            <View style={styles.aiHeader}>
              <View style={[styles.aiIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Zap size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.aiTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamilyBodySemibold }]}>
                AI Insights
              </Text>
            </View>
            <Text style={[styles.aiText, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamilyBody }]}>
              View personalized recommendations based on your habit data.
            </Text>
            <ChevronRight size={20} color={theme.colors.textSecondary} style={styles.aiArrow} />
          </TouchableOpacity>

        </Animated.View>
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  levelContainer: {
    marginBottom: 24,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 14,
  },
  xpText: {
    fontSize: 14,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  bentoGrid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  aiCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiIconContainer: {
    marginRight: 8,
  },
  aiTitle: {
    fontSize: 16,
    flex: 1,
  },
  aiText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  aiArrow: {
    marginLeft: 8,
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
    marginBottom: 12,
  },
  gateSubtitle: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
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
