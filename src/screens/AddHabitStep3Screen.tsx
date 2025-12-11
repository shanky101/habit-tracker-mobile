import React, { useState, useEffect } from 'react';
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
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@app-core/theme';
import { CATEGORIES, COLORS } from '@/data/habitOptions';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { HabitTimePeriod } from '@/types/habit';
import { TimePeriodSelector } from '@app-core/ui';
import { useSettingsStore } from '@/store/settingsStore';
import { Calendar, Clock, Sun, Moon, Check, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type AddHabitStep3ScreenNavigationProp = StackNavigationProp<any, 'AddHabitStep3'>;
type AddHabitStep3ScreenRouteProp = RouteProp<
  {
    AddHabitStep3: {
      habitName: string;
      habitType: 'positive' | 'negative';
      category: string;
      color: string;
    };
  },
  'AddHabitStep3'
>;

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const AddHabitStep3Screen: React.FC = () => {
  const navigation = useNavigation<AddHabitStep3ScreenNavigationProp>();
  const route = useRoute<AddHabitStep3ScreenRouteProp>();
  const { theme } = useTheme();

  const { habitName, habitType, category, color } = route.params;

  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [targetCompletionsPerDay, setTargetCompletionsPerDay] = useState<number>(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState<HabitTimePeriod>('allday');

  const { timeRanges } = useSettingsStore();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const handleDayToggle = (dayIndex: number) => {
    Haptics.selectionAsync();
    if (selectedDays.includes(dayIndex)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
      }
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setReminderTime(`${hours}:${minutes}`);
    }
  };

  const handleCreateHabit = async () => {
    setIsLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Map category to a fallback emoji string for storage/types
    const getCategoryEmoji = (catId: string) => {
      switch (catId) {
        case 'health': return '❤️';
        case 'fitness': return '💪';
        case 'productivity': return '✅';
        case 'mindfulness': return '🧘';
        case 'learning': return '📚';
        case 'social': return '👥';
        case 'finance': return '💰';
        case 'creativity': return '🎨';
        default: return '⭐';
      }
    };

    const newHabit = {
      id: Date.now().toString(),
      name: habitName,
      emoji: getCategoryEmoji(category), // Store string for type compatibility
      category,
      color,
      frequency,
      frequencyType: targetCompletionsPerDay > 1 ? 'multiple' : 'single',
      targetCompletionsPerDay,
      selectedDays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
      timePeriod,
      type: habitType,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : null,
      notes: notes.trim() || undefined,
      streak: 0,
      completions: {},
      createdAt: new Date().toISOString(),
    };

    setIsLoading(false);
    navigation.navigate('HomeMain', { newHabit });
  };

  const getSelectedColorValue = () => {
    return COLORS.find((c: any) => c.id === color)?.value || theme.colors.primary;
  };

  const activeColor = getSelectedColorValue();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>Back</Text>
            </TouchableOpacity>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.stepDot, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.stepDot, { backgroundColor: theme.colors.primary }]} />
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              The Routine 📅
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Set your schedule for success.
            </Text>
          </View>

          {/* Frequency */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>FREQUENCY</Text>

            <View style={styles.frequencyToggle}>
              <TouchableOpacity
                style={[
                  styles.freqOption,
                  frequency === 'daily' && { backgroundColor: activeColor }
                ]}
                onPress={() => {
                  setFrequency('daily');
                  setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[
                  styles.freqText,
                  { color: frequency === 'daily' ? '#FFF' : theme.colors.textSecondary }
                ]}>Every Day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.freqOption,
                  frequency === 'weekly' && { backgroundColor: activeColor }
                ]}
                onPress={() => {
                  setFrequency('weekly');
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[
                  styles.freqText,
                  { color: frequency === 'weekly' ? '#FFF' : theme.colors.textSecondary }
                ]}>Specific Days</Text>
              </TouchableOpacity>
            </View>

            {frequency === 'weekly' && (
              <View style={styles.dayPicker}>
                {DAYS.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: selectedDays.includes(index) ? activeColor : theme.colors.backgroundSecondary,
                        borderColor: selectedDays.includes(index) ? activeColor : theme.colors.border
                      }
                    ]}
                    onPress={() => handleDayToggle(index)}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: selectedDays.includes(index) ? '#FFF' : theme.colors.text }
                    ]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Time Period */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>TIME OF DAY</Text>
            <TimePeriodSelector
              selected={timePeriod}
              onSelect={setTimePeriod}
              timeRanges={timeRanges}
            />
          </View>

          {/* Reminders */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.reminderToggleCard,
                {
                  backgroundColor: reminderEnabled ? activeColor + '15' : theme.colors.backgroundSecondary,
                  borderColor: reminderEnabled ? activeColor : 'transparent',
                  borderWidth: 1,
                }
              ]}
              onPress={() => {
                setReminderEnabled(!reminderEnabled);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.reminderInfo}>
                <View style={[styles.reminderIcon, { backgroundColor: reminderEnabled ? activeColor : theme.colors.border }]}>
                  <Clock size={20} color="#FFF" />
                </View>
                <View>
                  <Text style={[styles.reminderTitle, { color: theme.colors.text }]}>Reminders</Text>
                  <Text style={[styles.reminderSubtitle, { color: theme.colors.textSecondary }]}>
                    {reminderEnabled ? 'On' : 'Off'}
                  </Text>
                </View>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={(val) => {
                  setReminderEnabled(val);
                  Haptics.selectionAsync();
                }}
                trackColor={{ false: theme.colors.border, true: activeColor }}
              />
            </TouchableOpacity>

            {reminderEnabled && (
              <TouchableOpacity
                style={[styles.timeCard, { backgroundColor: theme.colors.backgroundSecondary }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={24} color={activeColor} />
                <Text style={[styles.timeDisplay, { color: theme.colors.text }]}>
                  {reminderTime}
                </Text>
                <Text style={[styles.timeHint, { color: theme.colors.textSecondary }]}>Tap to change</Text>
              </TouchableOpacity>
            )}

            {showTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [h, m] = reminderTime.split(':');
                  const d = new Date();
                  d.setHours(parseInt(h));
                  d.setMinutes(parseInt(m));
                  return d;
                })()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
            {Platform.OS === 'ios' && showTimePicker && (
              <TouchableOpacity
                style={[styles.doneButton, { backgroundColor: activeColor }]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>NOTES (OPTIONAL)</Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }
              ]}
              placeholder="Why do you want to build this habit?"
              placeholderTextColor={theme.colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={200}
            />
          </View>

        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[
            styles.createButton,
            {
              backgroundColor: activeColor,
              shadowColor: activeColor,
            },
            isLoading && { opacity: 0.7 }
          ]}
          onPress={handleCreateHabit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.createButtonText}>Start Habit</Text>
              <Check color="#FFF" size={24} strokeWidth={3} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Reduced from 100
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
    opacity: 0.7,
  },
  frequencyToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  freqOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  freqText: {
    fontWeight: '600',
  },
  dayPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dayText: {
    fontWeight: '600',
  },
  reminderToggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  reminderSubtitle: {
    fontSize: 13,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: '700',
    flex: 1,
  },
  timeHint: {
    fontSize: 12,
  },
  doneButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    textAlign: 'center',
    fontSize: 28,
  },
  targetCountHint: {
    marginTop: 8,
    textAlign: 'center',
  },
  targetCountHelper: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
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
    flexDirection: 'row', // Ensure row layout
    gap: 12, // Add gap between text and icon
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  notesInput: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});

export default AddHabitStep3Screen;
