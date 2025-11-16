import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { CATEGORIES } from './AddHabitStep2Screen';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

type AddHabitStep3ScreenNavigationProp = StackNavigationProp<any, 'AddHabitStep3'>;
type AddHabitStep3ScreenRouteProp = RouteProp<
  {
    AddHabitStep3: {
      habitName: string;
      category: string;
      color: string;
    };
  },
  'AddHabitStep3'
>;

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AddHabitStep3Screen: React.FC = () => {
  const navigation = useNavigation<AddHabitStep3ScreenNavigationProp>();
  const route = useRoute<AddHabitStep3ScreenRouteProp>();
  const { theme } = useTheme();

  const { habitName, category, color } = route.params;

  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isLoading, setIsLoading] = useState(false);

  // Use custom animation hook
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDayToggle = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      // Must have at least one day selected
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
      }
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const handleCreateHabit = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get category icon
    const categoryIcon = CATEGORIES.find((c) => c.id === category)?.icon || '⭐';

    // In a real app, save to local storage and/or cloud
    const newHabit = {
      id: Date.now().toString(),
      name: habitName,
      emoji: categoryIcon,
      category,
      color,
      frequency,
      selectedDays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : null,
      completed: false,
      streak: 0,
      createdAt: new Date().toISOString(),
    };

    console.log('Creating habit:', newHabit);

    setIsLoading(false);

    // Navigate back to Home with the new habit
    navigation.navigate('Home', { newHabit });
  };

  const getCategoryLabel = () => {
    return CATEGORIES.find((c) => c.id === category)?.label || 'Other';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                ← Back
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.primary,
                    width: '100%',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.stepText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Step 3 of 3
            </Text>
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplay,
                fontSize: theme.typography.fontSize2XL,
                fontWeight: theme.typography.fontWeightBold,
              },
            ]}
          >
            Set Schedule
          </Text>

          {/* Frequency Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSizeLG,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              How often? 📅
            </Text>

            <TouchableOpacity
              style={[
                styles.radioOption,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: frequency === 'daily' ? theme.colors.primary : theme.colors.border,
                  borderWidth: frequency === 'daily' ? 2 : 1,
                },
              ]}
              onPress={() => {
                setFrequency('daily');
                setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.radioContent}>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: frequency === 'daily' ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  {frequency === 'daily' && (
                    <View style={[styles.radioSelected, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeMD,
                      fontWeight: theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  Every day
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioOption,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: frequency === 'weekly' ? theme.colors.primary : theme.colors.border,
                  borderWidth: frequency === 'weekly' ? 2 : 1,
                },
              ]}
              onPress={() => setFrequency('weekly')}
              activeOpacity={0.7}
            >
              <View style={styles.radioContent}>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: frequency === 'weekly' ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  {frequency === 'weekly' && (
                    <View style={[styles.radioSelected, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeMD,
                      fontWeight: theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  Specific days
                </Text>
              </View>
            </TouchableOpacity>

            {/* Day Picker */}
            {frequency === 'weekly' && (
              <View style={styles.dayPicker}>
                {DAYS.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: selectedDays.includes(index)
                          ? theme.colors.primary
                          : theme.colors.backgroundSecondary,
                        borderColor: selectedDays.includes(index)
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    onPress={() => handleDayToggle(index)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: selectedDays.includes(index)
                            ? theme.colors.white
                            : theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeSM,
                          fontWeight: theme.typography.fontWeightSemibold,
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Reminder Section */}
          <View style={styles.section}>
            <View style={styles.reminderHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplay,
                    fontSize: theme.typography.fontSizeLG,
                    fontWeight: theme.typography.fontWeightBold,
                  },
                ]}
              >
                Reminder? ⏰
              </Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={Platform.OS === 'ios' ? theme.colors.white : theme.colors.white}
              />
            </View>

            {reminderEnabled && (
              <View
                style={[
                  styles.reminderTimeContainer,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.reminderLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Remind me at
                </Text>
                <Text
                  style={[
                    styles.reminderTimeText,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyDisplay,
                      fontSize: theme.typography.fontSizeXL,
                      fontWeight: theme.typography.fontWeightBold,
                    },
                  ]}
                >
                  {reminderTime}
                </Text>
                <Text
                  style={[
                    styles.reminderHint,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  Time to check in! Complete your habits 🎯
                </Text>
              </View>
            )}
          </View>

          {/* Summary Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSizeLG,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              Your habit ✨
            </Text>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.summaryText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                <Text style={{ fontWeight: theme.typography.fontWeightBold, fontSize: 18 }}>
                  {habitName}
                </Text>
                {'\n\n'}
                <Text style={{ color: theme.colors.textSecondary }}>
                  📅 {frequency === 'daily' ? 'Every day' : `${selectedDays.length} days per week`}
                </Text>
                {'\n'}
                {reminderEnabled && (
                  <Text style={{ color: theme.colors.textSecondary }}>
                    ⏰ Daily reminder at {reminderTime}
                  </Text>
                )}
                {reminderEnabled && '\n'}
                <Text style={{ color: theme.colors.textSecondary }}>
                  🏷️ {getCategoryLabel()}
                </Text>
              </Text>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.shadows.shadowMD.shadowColor,
                shadowOffset: theme.shadows.shadowMD.shadowOffset,
                shadowOpacity: theme.shadows.shadowMD.shadowOpacity,
                shadowRadius: theme.shadows.shadowMD.shadowRadius,
                elevation: theme.shadows.shadowMD.elevation,
              },
              isLoading && { opacity: 0.7 },
            ]}
            onPress={handleCreateHabit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text
                style={[
                  styles.createButtonText,
                  {
                    color: theme.colors.white,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                    fontWeight: theme.typography.fontWeightSemibold,
                  },
                ]}
              >
                Create Habit
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 36,
  },
  sectionLabel: {
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  radioOption: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioLabel: {
    // styles from theme
  },
  dayPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    // styles from theme
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTimeContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  reminderLabel: {
    marginBottom: 8,
  },
  reminderTimeText: {
    marginBottom: 8,
  },
  reminderHint: {
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  summaryText: {
    lineHeight: 24,
  },
  createButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  createButtonText: {
    // styles from theme
  },
});

export default AddHabitStep3Screen;
