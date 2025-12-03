import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { sendTestNotification } from '@/utils/notificationService';

type NotificationsSettingsNavigationProp = StackNavigationProp<any, 'NotificationsSettings'>;

interface HabitReminder {
  id: string;
  name: string;
  emoji: string;
  enabled: boolean;
  time: string;
}

const NotificationsSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsSettingsNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  // Notification settings state
  const [masterToggle, setMasterToggle] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [dailyReminderTime, setDailyReminderTime] = useState('9:00 AM');
  const [streakRiskAlerts, setStreakRiskAlerts] = useState(true);
  const [streakMilestones, setStreakMilestones] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [aiInsights, setAIInsights] = useState(false);
  const [aiInsightsFrequency, setAIInsightsFrequency] = useState('weekly');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [badgeEnabled, setBadgeEnabled] = useState(true);
  const [testingNotification, setTestingNotification] = useState(false);

  // Mock habit reminders
  const [habitReminders, setHabitReminders] = useState<HabitReminder[]>([
    { id: '1', name: 'Morning Meditation', emoji: '🧘', enabled: true, time: '7:00 AM' },
    { id: '2', name: 'Read 20 Pages', emoji: '📚', enabled: true, time: '9:00 PM' },
    { id: '3', name: 'Exercise', emoji: '💪', enabled: false, time: '6:00 AM' },
  ]);

  const toggleHabitReminder = (id: string) => {
    setHabitReminders(reminders =>
      reminders.map(r =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  const openSystemSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleTestNotification = async () => {
    setTestingNotification(true);
    const success = await sendTestNotification();
    setTestingNotification(false);

    if (success) {
      Alert.alert(
        'Test Sent! 🎉',
        'Check your notifications. If you didn\'t receive it, make sure notifications are enabled in your device settings.',
        [
          { text: 'OK' },
          { text: 'Open Settings', onPress: openSystemSettings },
        ]
      );
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive habit reminders.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSystemSettings },
        ]
      );
    }
  };

  const renderToggleRow = (
    icon: string,
    label: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    disabled: boolean = false,
    showBorder: boolean = true
  ) => (
    <View
      style={[
        styles.toggleRow,
        {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: showBorder ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleIcon}>{icon}</Text>
        <View style={styles.toggleText}>
          <Text
            style={[
              styles.toggleLabel,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBodyMedium,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {label}
          </Text>
          <Text
            style={[
              styles.toggleDescription,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || !masterToggle}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primaryLight,
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
      />
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
          Notifications
        </Text>
        <View style={styles.placeholder} />
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
          {/* Master Toggle */}
          <View
            style={[
              styles.masterCard,
              {
                backgroundColor: masterToggle
                  ? theme.colors.primaryLight + '20'
                  : theme.colors.backgroundSecondary,
                borderColor: masterToggle
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
          >
            <View style={styles.masterContent}>
              <Text style={styles.masterIcon}>🔔</Text>
              <View style={styles.masterText}>
                <Text
                  style={[
                    styles.masterLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyDisplayBold,
                      fontSize: theme.typography.fontSizeLG,
                    },
                  ]}
                >
                  Enable Notifications
                </Text>
                <Text
                  style={[
                    styles.masterDescription,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  {masterToggle
                    ? 'Notifications are enabled'
                    : 'Turn on to receive reminders'}
                </Text>
              </View>
            </View>
            <Switch
              value={masterToggle}
              onValueChange={setMasterToggle}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primaryLight,
              }}
              thumbColor={masterToggle ? theme.colors.primary : theme.colors.surface}
            />
          </View>

          {/* Test Notification Button */}
          <TouchableOpacity
            style={[
              styles.testButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={handleTestNotification}
            disabled={testingNotification}
            activeOpacity={0.7}
          >
            <View style={styles.testButtonContent}>
              <Text style={styles.testButtonIcon}>🔔</Text>
              <View style={styles.testButtonText}>
                <Text
                  style={[
                    styles.testButtonLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                      fontSize: theme.typography.fontSizeMD,
                    },
                  ]}
                >
                  Test Notifications
                </Text>
                <Text
                  style={[
                    styles.testButtonDescription,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  Send a test notification to verify it works
                </Text>
              </View>
              {testingNotification ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <View
                  style={[
                    styles.testButtonArrow,
                    { backgroundColor: theme.colors.primary + '20' }
                  ]}
                >
                  <Text
                    style={[
                      styles.testButtonArrowText,
                      { color: theme.colors.primary }
                    ]}
                  >
                    →
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Daily Reminders Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: masterToggle ? 1 : 0.5,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              DAILY REMINDERS
            </Text>

            {renderToggleRow(
              '⏰',
              'Daily Reminder',
              'Get a reminder once per day',
              dailyReminder,
              setDailyReminder
            )}

            {dailyReminder && masterToggle && (
              <TouchableOpacity
                style={[
                  styles.timeRow,
                  { borderBottomColor: theme.colors.border },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.timeInfo}>
                  <Text style={styles.timeIcon}>🕐</Text>
                  <Text
                    style={[
                      styles.timeLabel,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBodyMedium,
                        fontSize: theme.typography.fontSizeMD,
                      },
                    ]}
                  >
                    Reminder Time
                  </Text>
                </View>
                <View style={styles.timeValue}>
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color: theme.colors.primary,
                        fontFamily: theme.typography.fontFamilyBodySemibold,
                        fontSize: theme.typography.fontSizeMD,
                      },
                    ]}
                  >
                    {dailyReminderTime}
                  </Text>
                  <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Notification Preview */}
            {dailyReminder && masterToggle && (
              <View
                style={[
                  styles.previewContainer,
                  { backgroundColor: theme.colors.backgroundSecondary },
                ]}
              >
                <Text
                  style={[
                    styles.previewLabel,
                    {
                      color: theme.colors.textTertiary,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  PREVIEW
                </Text>
                <View
                  style={[
                    styles.previewNotification,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={styles.previewIcon}>🎯</Text>
                  <View style={styles.previewContent}>
                    <Text
                      style={[
                        styles.previewTitle,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBodySemibold,
                          fontSize: theme.typography.fontSizeSM,
                        },
                      ]}
                    >
                      Time to check in!
                    </Text>
                    <Text
                      style={[
                        styles.previewBody,
                        {
                          color: theme.colors.textSecondary,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeXS,
                        },
                      ]}
                    >
                      You have 3 habits waiting
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Per-Habit Reminders */}
          {habitReminders.length > 0 && (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  opacity: masterToggle ? 1 : 0.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                HABIT REMINDERS
              </Text>

              {habitReminders.map((habit, index) => (
                <View
                  key={habit.id}
                  style={[
                    styles.habitRow,
                    {
                      borderBottomColor: theme.colors.border,
                      borderBottomWidth: index === habitReminders.length - 1 ? 0 : 1,
                    },
                  ]}
                >
                  <View style={styles.habitInfo}>
                    <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                    <View style={styles.habitText}>
                      <Text
                        style={[
                          styles.habitName,
                          {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamilyBodyMedium,
                            fontSize: theme.typography.fontSizeSM,
                          },
                        ]}
                      >
                        {habit.name}
                      </Text>
                      <Text
                        style={[
                          styles.habitTime,
                          {
                            color: habit.enabled
                              ? theme.colors.primary
                              : theme.colors.textTertiary,
                            fontFamily: theme.typography.fontFamilyBody,
                            fontSize: theme.typography.fontSizeXS,
                          },
                        ]}
                      >
                        {habit.enabled ? habit.time : 'Disabled'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={habit.enabled}
                    onValueChange={() => toggleHabitReminder(habit.id)}
                    disabled={!masterToggle}
                    trackColor={{
                      false: theme.colors.border,
                      true: theme.colors.primaryLight,
                    }}
                    thumbColor={habit.enabled ? theme.colors.primary : theme.colors.surface}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Streak Alerts */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: masterToggle ? 1 : 0.5,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              STREAK ALERTS
            </Text>

            {renderToggleRow(
              '⚠️',
              'Streak Risk Alerts',
              'Notifies if you might break a streak',
              streakRiskAlerts,
              setStreakRiskAlerts
            )}

            {renderToggleRow(
              '🎉',
              'Streak Milestones',
              'Celebrate when you hit milestones',
              streakMilestones,
              setStreakMilestones,
              false,
              false
            )}
          </View>

          {/* Weekly Summary & AI */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: masterToggle ? 1 : 0.5,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              SUMMARIES & INSIGHTS
            </Text>

            {renderToggleRow(
              '📊',
              'Weekly Summary',
              'Recap every Monday',
              weeklySummary,
              setWeeklySummary
            )}

            {renderToggleRow(
              '✨',
              'AI Insights',
              'Personalized habit recommendations',
              aiInsights,
              setAIInsights,
              false,
              false
            )}

            {aiInsights && masterToggle && (
              <View
                style={[
                  styles.frequencyRow,
                  { borderTopColor: theme.colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.frequencyLabel,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  Frequency
                </Text>
                <View style={styles.frequencyOptions}>
                  {['daily', 'weekly', 'monthly'].map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyOption,
                        {
                          backgroundColor: aiInsightsFrequency === freq
                            ? theme.colors.primary
                            : theme.colors.backgroundSecondary,
                          borderColor: aiInsightsFrequency === freq
                            ? theme.colors.primary
                            : theme.colors.border,
                        },
                      ]}
                      onPress={() => setAIInsightsFrequency(freq)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          {
                            color: aiInsightsFrequency === freq
                              ? theme.colors.white
                              : theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamilyBodyMedium,
                            fontSize: theme.typography.fontSizeXS,
                          },
                        ]}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Notification Style */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: masterToggle ? 1 : 0.5,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              NOTIFICATION STYLE
            </Text>

            {renderToggleRow(
              '🔊',
              'Sound',
              'Play a sound with notifications',
              soundEnabled,
              setSoundEnabled
            )}

            {Platform.OS === 'ios' && renderToggleRow(
              '🔴',
              'Badge App Icon',
              'Show incomplete habit count on app icon',
              badgeEnabled,
              setBadgeEnabled,
              false,
              false
            )}
          </View>

          {/* System Settings Link */}
          <TouchableOpacity
            style={[
              styles.systemSettingsButton,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={openSystemSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.systemSettingsIcon}>⚙️</Text>
            <Text
              style={[
                styles.systemSettingsText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              Open System Settings
            </Text>
            <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.footnote,
              {
                color: theme.colors.textTertiary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            For advanced notification controls, open your device's system settings.
          </Text>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  masterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 24,
  },
  masterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  masterText: {
    flex: 1,
  },
  masterLabel: {},
  masterDescription: {
    marginTop: 2,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  toggleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {},
  toggleDescription: {
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  timeLabel: {},
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginRight: 6,
  },
  chevron: {
    fontSize: 18,
  },
  previewContainer: {
    padding: 16,
  },
  previewLabel: {
    marginBottom: 8,
  },
  previewNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  previewContent: {},
  previewTitle: {},
  previewBody: {
    marginTop: 2,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  habitText: {},
  habitName: {},
  habitTime: {
    marginTop: 2,
  },
  frequencyRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  frequencyLabel: {
    marginBottom: 10,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  frequencyText: {},
  systemSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 12,
  },
  systemSettingsIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  systemSettingsText: {
    flex: 1,
  },
  footnote: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  testButton: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  testButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  testButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  testButtonText: {
    flex: 1,
  },
  testButtonLabel: {},
  testButtonDescription: {
    marginTop: 2,
  },
  testButtonArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonArrowText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NotificationsSettingsScreen;
