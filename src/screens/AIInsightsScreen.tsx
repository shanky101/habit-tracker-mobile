import React, { useState } from 'react';
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

type AIInsightsNavigationProp = StackNavigationProp<any, 'AIInsights'>;

interface InsightCard {
  id: string;
  type: 'weekly' | 'recommendation' | 'alert' | 'pattern' | 'motivation' | 'milestone';
  title: string;
  content: string;
  icon: string;
  actionLabel?: string;
  actionRoute?: string;
  urgency?: 'low' | 'medium' | 'high';
}

const AIInsightsScreen: React.FC = () => {
  const navigation = useNavigation<AIInsightsNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsRemaining] = useState(5);

  // Mock AI insights data
  const insights: InsightCard[] = [
    {
      id: '1',
      type: 'weekly',
      title: 'Weekly Summary',
      content: 'This week you completed 18 of 21 habits (86%). That\'s 5% better than last week! Keep it up!',
      icon: '📊',
      actionLabel: 'View Details',
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Habit Recommendation',
      content: 'Based on your morning routine success, consider adding "Stretch for 5 minutes" before breakfast.',
      icon: '💡',
      actionLabel: 'Add Habit',
    },
    {
      id: '3',
      type: 'alert',
      title: 'Streak Risk Alert',
      content: 'You haven\'t checked in "Meditate" yet today. Don\'t break your 24-day streak!',
      icon: '⚠️',
      urgency: 'high',
      actionLabel: 'Check in now',
    },
    {
      id: '4',
      type: 'pattern',
      title: 'Pattern Discovery',
      content: 'You\'re 3x more likely to exercise when you complete your morning routine first. Try habit stacking!',
      icon: '🔍',
    },
    {
      id: '5',
      type: 'motivation',
      title: 'Tip of the Day',
      content: 'Struggling with consistency? Try the "2-minute rule" - start with just 2 minutes and build from there.',
      icon: '🎯',
    },
    {
      id: '6',
      type: 'milestone',
      title: 'Milestone Prediction',
      content: 'At your current pace, you\'ll hit 100 days on "Read 20 pages" in 12 days!',
      icon: '🏆',
    },
  ];

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
        <Text style={styles.insightIcon}>{insight.icon}</Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <Text style={styles.backIcon}>←</Text>
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
            <Text style={styles.refreshIcon}>🔄</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
              <Text style={styles.aiIcon}>✨</Text>
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
              <Text style={styles.askIcon}>💬</Text>
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
                  <Text style={styles.sendIcon}>→</Text>
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
                <Text style={styles.settingIcon}>🕐</Text>
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
                <Text style={styles.settingIcon}>🔔</Text>
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
  backIcon: {
    fontSize: 24,
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
  refreshIcon: {
    fontSize: 20,
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
  aiIcon: {
    fontSize: 14,
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
  insightIcon: {
    fontSize: 28,
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
  askIcon: {
    fontSize: 24,
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
  sendIcon: {
    fontSize: 20,
    color: '#fff',
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
  settingIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  settingLabel: {},
  settingValue: {},
});

export default AIInsightsScreen;
