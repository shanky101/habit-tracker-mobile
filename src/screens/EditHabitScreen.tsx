import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useHabits } from '@/contexts/HabitsContext';
import { CATEGORIES, COLORS } from './AddHabitStep2Screen';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

type EditHabitScreenNavigationProp = StackNavigationProp<any, 'EditHabit'>;
type EditHabitScreenRouteProp = RouteProp<
  {
    EditHabit: {
      habitId: string;
      habitData: {
        name: string;
        emoji: string;
        category: string;
        color: string;
        frequency: 'daily' | 'weekly';
        selectedDays: number[];
        reminderEnabled: boolean;
        reminderTime: string | null;
        notes?: string;
        streak?: number;
        completed?: boolean;
      };
    };
  },
  'EditHabit'
>;

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const EditHabitScreen: React.FC = () => {
  const navigation = useNavigation<EditHabitScreenNavigationProp>();
  const route = useRoute<EditHabitScreenRouteProp>();
  const { theme } = useTheme();
  const { updateHabit, deleteHabit, archiveHabit } = useHabits();

  const { habitId, habitData } = route.params;

  const [habitName, setHabitName] = useState(habitData.name);
  const [selectedCategory, setSelectedCategory] = useState(habitData.category);
  const [selectedColor, setSelectedColor] = useState(habitData.color);
  const [frequency, setFrequency] = useState(habitData.frequency);
  const [selectedDays, setSelectedDays] = useState(habitData.selectedDays);
  const [reminderEnabled, setReminderEnabled] = useState(habitData.reminderEnabled);
  const [reminderTime, setReminderTime] = useState(habitData.reminderTime || '09:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState(habitData.notes || '');

  // Use custom animation hook
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    // On Android, close picker immediately
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setReminderTime(`${hours}:${minutes}`);
    }
  };

  const handleTimePickerDismiss = () => {
    // For iOS, add a dismiss button
    if (Platform.OS === 'ios') {
      setShowTimePicker(false);
    }
  };

  const handleTimePickerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTimePicker(true);
  };

  const handleSave = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    const updates = {
      name: habitName.trim(),
      category: selectedCategory,
      color: selectedColor,
      frequency,
      selectedDays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : null,
      notes: notes.trim() || undefined,
    };

    updateHabit(habitId, updates);
    navigation.goBack();
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Habit',
      "Archived habits won't show in daily list but keep their history.",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Archive',
          onPress: () => {
            archiveHabit(habitId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      `Delete ${habitName}?`,
      "This will delete all history. This can't be undone.",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteHabit(habitId);
            navigation.navigate('HomeMain');
          },
        },
      ]
    );
  };

  const handleDayToggle = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
      }
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const getSelectedColor = () => {
    return COLORS.find((c) => c.id === selectedColor)?.value || '#3B82F6';
  };

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
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton} activeOpacity={0.7}>
              <Text style={[styles.headerButtonText, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamilyBodySemibold }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSizeLG,
                },
              ]}
            >
              Edit Habit
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton} activeOpacity={0.7}>
              <Text style={[styles.headerButtonText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamilyBodySemibold }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          {/* Habit Name */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSizeSM,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                },
              ]}
            >
              Habit Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
              value={habitName}
              onChangeText={setHabitName}
              placeholder="Enter habit name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSizeSM,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                },
              ]}
            >
              Category
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor:
                        selectedCategory === category.id ? theme.colors.primary : theme.colors.border,
                      borderWidth: selectedCategory === category.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSizeSM,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                },
              ]}
            >
              Color
            </Text>
            <View style={styles.colorGrid}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: color.value,
                      borderColor: selectedColor === color.id ? theme.colors.text : 'transparent',
                      borderWidth: selectedColor === color.id ? 3 : 0,
                    },
                  ]}
                  onPress={() => setSelectedColor(color.id)}
                  activeOpacity={0.7}
                >
                  {selectedColor === color.id && (
                    <Text style={styles.colorCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSizeSM,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                },
              ]}
            >
              Frequency
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
              <Text
                style={[
                  styles.radioLabel,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                Every day
              </Text>
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
              <Text
                style={[
                  styles.radioLabel,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                Specific days
              </Text>
            </TouchableOpacity>

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
                          color: selectedDays.includes(index) ? theme.colors.white : theme.colors.text,
                          fontSize: theme.typography.fontSizeSM,
                          fontFamily: theme.typography.fontFamilyBodySemibold,
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

          {/* Reminder */}
          <View style={styles.section}>
            <View style={styles.reminderHeader}>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSizeSM,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                  },
                ]}
              >
                Reminder
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
              <TouchableOpacity
                style={[
                  styles.reminderTimeContainer,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={handleTimePickerPress}
                activeOpacity={0.7}
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
                      fontFamily: theme.typography.fontFamilyDisplayBold,
                      fontSize: theme.typography.fontSizeXL,
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
                  Tap to change time 🕐
                </Text>
              </TouchableOpacity>
            )}

            {reminderEnabled && showTimePicker && (
              <View style={styles.timePickerContainer}>
                <DateTimePicker
                  value={(() => {
                    const [hours, minutes] = reminderTime.split(':');
                    const date = new Date();
                    date.setHours(parseInt(hours, 10));
                    date.setMinutes(parseInt(minutes, 10));
                    return date;
                  })()}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[
                      styles.doneButton,
                      { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={handleTimePickerDismiss}
                  >
                    <Text
                      style={[
                        styles.doneButtonText,
                        {
                          color: theme.colors.white,
                          fontFamily: theme.typography.fontFamilyBodySemibold,
                        }
                      ]}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Notes Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSizeSM,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                },
              ]}
            >
              Notes
            </Text>
            <Text
              style={[
                styles.notesSubtitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                  marginBottom: 12,
                },
              ]}
            >
              Add motivation or tips for this habit (optional)
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
              placeholder="e.g., Why this habit matters to me..."
              placeholderTextColor={theme.colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text
              style={[
                styles.characterCount,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              {notes.length}/200
            </Text>
          </View>

          {/* Destructive Actions */}
          <View style={styles.destructiveSection}>
            <TouchableOpacity
              style={[
                styles.archiveButton,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={handleArchive}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.archiveButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSizeMD,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                  },
                ]}
              >
                Archive Habit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                {
                  backgroundColor: theme.colors.error,
                },
              ]}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.deleteButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSizeMD,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                  },
                ]}
              >
                Delete Habit
              </Text>
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerButtonText: {
    fontSize: 16,
  },
  headerTitle: {
    // styles from theme
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    margin: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCheckmark: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  radioOption: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
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
  timePickerContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  doneButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
  },
  notesSubtitle: {
    // styles from theme
  },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 100,
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 6,
  },
  destructiveSection: {
    marginTop: 24,
  },
  archiveButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  archiveButtonText: {
    // styles from theme
  },
  deleteButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    // styles from theme
  },
});

export default EditHabitScreen;
