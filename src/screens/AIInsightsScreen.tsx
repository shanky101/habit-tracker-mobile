import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { useHabits } from '@/hooks/useHabits';
import {
  ArrowLeft,
  RefreshCw,
  Sparkles,
  MessageCircle,
  ArrowRight,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Search,
  Target,
  Trophy,
  Clock,
  Bell,
} from 'lucide-react-native';

type AIInsightsNavigationProp = StackNavigationProp<any, 'AIInsights'>;

interface InsightCard {
  id: string;
  type: 'weekly' | 'recommendation' | 'alert' | 'pattern' | 'motivation' | 'milestone';
  title: string;
  content: string;
  IconComponent: React.ComponentType<any>;
  actionLabel?: string;
  actionRoute?: string;
  urgency?: 'low' | 'medium' | 'high';
}

const AIInsightsScreen: React.FC = () => {
  const navigation = useNavigation<AIInsightsNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { habits } = useHabits();

  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsRemaining] = useState(5);

  // Generate real insights from habit data
  const insights = useMemo(() => {
    const activeHabits = habits.filter(h => !h.archived);
    const insightCards: InsightCard[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Weekly Summary - calculate real completion rate
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let weeklyScheduled = 0;
    let weeklyCompleted = 0;

    activeHabits.forEach(habit => {
      const completions = habit.completions || {};
      const currentDate = new Date(weekAgo);

      while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];

        if (habit.selectedDays.includes(dayOfWeek)) {
          weeklyScheduled++;
          const completion = completions[dateStr];
          if (completion && completion.completionCount >= completion.targetCount) {
            weeklyCompleted++;
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    const weeklyRate = weeklyScheduled > 0 ? Math.round((weeklyCompleted / weeklyScheduled) * 100) : 0;

    insightCards.push({
      id: '1',
      type: 'weekly',
      title: 'Weekly Summary',
      content: weeklyScheduled > 0
        ? `This week you completed ${weeklyCompleted} of ${weeklyScheduled} scheduled habits (${weeklyRate}%).`
        : 'Complete some habits this week to see your summary!',
      IconComponent: BarChart3,
      actionLabel: 'View Details',
    });

    // Streak Risk Alert - find habits not completed today with active streaks
    const habitsAtRisk = activeHabits.filter(habit => {
      if (habit.streak < 3) return false;
      const todayDayOfWeek = today.getDay();
      if (!habit.selectedDays.includes(todayDayOfWeek)) return false;

      const completion = habit.completions?.[todayStr];
      return !completion || completion.completionCount < completion.targetCount;
    });

    if (habitsAtRisk.length > 0) {
      const topRiskHabit = habitsAtRisk.reduce((a, b) => a.streak > b.streak ? a : b);
      insightCards.push({
        id: '2',
        type: 'alert',
        title: 'Streak Risk Alert',
        content: `You haven't completed "${topRiskHabit.name}" today. Don't break your ${topRiskHabit.streak}-day streak!`,
        IconComponent: AlertTriangle,
        urgency: 'high',
        actionLabel: 'Check in now',
      });
    }

    // Best Day Pattern - find which day has highest completion rate
    const dayStats = Array(7).fill(null).map(() => ({ scheduled: 0, completed: 0 }));

    activeHabits.forEach(habit => {
      const completions = habit.completions || {};
      Object.entries(completions).forEach(([dateStr, completion]) => {
        const dayOfWeek = new Date(dateStr).getDay();
        if (habit.selectedDays.includes(dayOfWeek)) {
          dayStats[dayOfWeek].scheduled++;
          if (completion && completion.completionCount >= completion.targetCount) {
            dayStats[dayOfWeek].completed++;
          }
        }
      });
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDay = dayStats.reduce((best, stat, index) => {
      const rate = stat.scheduled > 0 ? stat.completed / stat.scheduled : 0;
      const bestRate = best.stat.scheduled > 0 ? best.stat.completed / best.stat.scheduled : 0;
      return rate > bestRate ? { index, stat } : best;
    }, { index: 0, stat: dayStats[0] });

    const bestDayRate = bestDay.stat.scheduled > 0
      ? Math.round((bestDay.stat.completed / bestDay.stat.scheduled) * 100)
      : 0;

    if (bestDayRate > 0) {
      insightCards.push({
        id: '3',
        type: 'pattern',
        title: 'Pattern Discovery',
        content: `${dayNames[bestDay.index]} is your best day with ${bestDayRate}% completion rate. Schedule important habits then!`,
        IconComponent: Search,
      });
    }

    // Top Streak Milestone
    const habitsWithStreaks = activeHabits.filter(h => h.streak > 0);
    if (habitsWithStreaks.length > 0) {
      const topStreakHabit = habitsWithStreaks.reduce((a, b) => a.streak > b.streak ? a : b);
      const daysToMilestone = [7, 14, 30, 60, 90, 100].find(m => m > topStreakHabit.streak);

      if (daysToMilestone) {
        const daysLeft = daysToMilestone - topStreakHabit.streak;
        insightCards.push({
          id: '4',
          type: 'milestone',
          title: 'Milestone Prediction',
          content: `"${topStreakHabit.name}" is on a ${topStreakHabit.streak}-day streak! ${daysLeft} more days to reach ${daysToMilestone}!`,
          IconComponent: Trophy,
        });
      }
    }

    // Motivation tip (static but useful)
    insightCards.push({
      id: '5',
      type: 'motivation',
      title: 'Tip of the Day',
      content: 'Struggling with consistency? Try the "2-minute rule" - start with just 2 minutes and build from there.',
      IconComponent: Target,
    });

    return insightCards;
  }, [habits]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleAskQuestion = () => {
    if (!question.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setQuestion('');
      // In production, this would add the response to a chat history
    }, 2000);
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  const renderInsightCard = (insight: InsightCard) => (
    <View
      key={insight.id}
      style={[
        styles.insightCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: insight.urgency === 'high'
            ? theme.colors.error + '40'
            : theme.colors.border,
          borderLeftColor: getUrgencyColor(insight.urgency),
        },
      ]}
    >
      <View style={styles.insightHeader}>
        <View style={styles.insightIconContainer}>
          <insight.IconComponent size={28} color={getUrgencyColor(insight.urgency)} strokeWidth={2} />
        </View>
        <View style={styles.insightHeaderText}>
          <Text
            style={[
              styles.insightTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBodySemibold,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {insight.title}
          </Text>
          {insight.urgency && (
            <View
              style={[
                styles.urgencyBadge,
                { backgroundColor: getUrgencyColor(insight.urgency) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.urgencyText,
                  {
                    color: getUrgencyColor(insight.urgency),
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: 10,
                  },
                ]}
              >
                {insight.urgency.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text
        style={[
          styles.insightContent,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeSM,
            lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
          },
        ]}
      >
        {insight.content}
      </Text>

      {insight.actionLabel && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: insight.urgency === 'high'
                ? theme.colors.error
                : theme.colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: theme.colors.white,
                fontFamily: theme.typography.fontFamilyBodySemibold,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            {insight.actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
            borderBottomColor: theme.colors.border,
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
          <View style={styles.backIconContainer}>
            <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplayBold,
                fontSize: theme.typography.fontSizeXL,
              },
            ]}
          >
            AI Insights
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            Personalized habit coaching
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <View style={styles.refreshIconContainer}>
              <RefreshCw size={20} color={theme.colors.primary} strokeWidth={2} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* AI Badge */}
          <View style={styles.aiBadgeContainer}>
            <View
              style={[
                styles.aiBadge,
                {
                  backgroundColor: theme.colors.primaryLight + '20',
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <View style={styles.aiIconContainer}>
                <Sparkles size={14} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <Text
                style={[
                  styles.aiBadgeText,
                  {
                    color: theme.colors.primary,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Powered by AI
              </Text>
            </View>
          </View>

          {/* Insight Cards */}
          <View style={styles.insightsContainer}>
            {insights.map(renderInsightCard)}
          </View>

          {/* Ask AI Section */}
          <View
            style={[
              styles.askSection,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.askHeader}>
              <View style={styles.askIconContainer}>
                <MessageCircle size={24} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <Text
                style={[
                  styles.askTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: theme.typography.fontSizeLG,
                  },
                ]}
              >
                Ask AI
              </Text>
            </View>

            <Text
              style={[
                styles.askDescription,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              Get personalized advice about your habits
            </Text>

            <View style={styles.exampleQuestions}>
              <Text
                style={[
                  styles.exampleLabel,
                  {
                    color: theme.colors.textTertiary,
                    fontFamily: theme.typography.fontFamilyBodyMedium,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Try asking:
              </Text>
              {[
                'Why do I skip meditation on weekends?',
                'How can I improve my consistency?',
                'What time should I exercise?',
              ].map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.exampleChip,
                    { backgroundColor: theme.colors.backgroundSecondary },
                  ]}
                  onPress={() => setQuestion(example)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.exampleText,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    "{example}"
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
                placeholder="Ask about your habits..."
                placeholderTextColor={theme.colors.textTertiary}
                value={question}
                onChangeText={setQuestion}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: question.trim()
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={handleAskQuestion}
                activeOpacity={0.8}
                disabled={!question.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <View style={styles.sendIconContainer}>
                    <ArrowRight size={20} color="#fff" strokeWidth={2} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.questionsRemaining,
                {
                  color: theme.colors.textTertiary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              {questionsRemaining} questions remaining today
            </Text>
          </View>

          {/* Settings */}
          <View
            style={[
              styles.settingsSection,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.settingsTitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              INSIGHT SETTINGS
            </Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Clock size={18} color={theme.colors.primary} strokeWidth={2} />
                </View>
                <Text
                  style={[
                    styles.settingLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Insight Frequency
                </Text>
              </View>
              <Text
                style={[
                  styles.settingValue,
                  {
                    color: theme.colors.primary,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                Weekly
              </Text>
            </View>

            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Bell size={18} color={theme.colors.primary} strokeWidth={2} />
                </View>
                <Text
                  style={[
                    styles.settingLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Notifications
                </Text>
              </View>
              <Text
                style={[
                  styles.settingValue,
                  {
                    color: theme.colors.success,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                On
              </Text>
            </View>
          </View>
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
    alignItems: 'center',
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
  backIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {},
  headerSubtitle: {
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  aiBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  aiIconContainer: {
    marginRight: 6,
  },
  aiBadgeText: {},
  insightsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIconContainer: {
    marginRight: 12,
  },
  insightHeaderText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  insightTitle: {},
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgencyText: {},
  insightContent: {},
  actionButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  actionButtonText: {},
  askSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  askHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  askIconContainer: {
    marginRight: 10,
  },
  askTitle: {},
  askDescription: {
    marginBottom: 16,
  },
  exampleQuestions: {
    marginBottom: 16,
    gap: 8,
  },
  exampleLabel: {
    marginBottom: 4,
  },
  exampleChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  exampleText: {},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionsRemaining: {
    textAlign: 'center',
  },
  settingsSection: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    marginRight: 10,
  },
  settingLabel: {},
  settingValue: {},
});

export default AIInsightsScreen;
