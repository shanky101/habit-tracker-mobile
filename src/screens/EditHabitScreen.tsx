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
        category: string;
        color: string;
        frequency: 'daily' | 'weekly';
        selectedDays: number[];
        reminderEnabled: boolean;
        reminderTime: string | null;
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

  // Use custom animation hook
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const handleCancel = () => {
    navigation.goBack();
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
            navigation.navigate('Home');
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
              <Text style={[styles.headerButtonText, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSizeLG,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              Edit Habit
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton} activeOpacity={0.7}>
              <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
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
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight: theme.typography.fontWeightSemibold,
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
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight: theme.typography.fontWeightSemibold,
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
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight: theme.typography.fontWeightSemibold,
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
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight: theme.typography.fontWeightSemibold,
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

          {/* Reminder */}
          <View style={styles.section}>
            <View style={styles.reminderHeader}>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                    fontWeight: theme.typography.fontWeightSemibold,
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
            )}
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
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                    fontWeight: theme.typography.fontWeightSemibold,
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
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                    fontWeight: theme.typography.fontWeightSemibold,
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
    fontWeight: '600',
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
    fontWeight: 'bold',
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
  reminderTimeText: {
    marginTop: 16,
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
