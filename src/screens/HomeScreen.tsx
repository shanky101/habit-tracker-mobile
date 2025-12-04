import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  RefreshControl,
  Share,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme';
import { useHabits, Habit } from '@/contexts/HabitsContext';
import CelebrationModal from '@/components/CelebrationModal';
import {
  AllHabitsCompleteModal,
  QuickNoteModal,
  StreakBrokenModal,
  ConfirmationDialog,
} from '@/components/HabitModals';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { useSubscription } from '@/context/SubscriptionContext';
import { useMascot } from '@/context/MascotContext';
import { Mascot, MascotCelebration, DraggableHabitList } from '@/components';
import { User } from 'lucide-react-native';

type HomeScreenNavigationProp = StackNavigationProp<any, 'Home'>;
type HomeScreenRouteProp = RouteProp<{ Home: { newHabit?: any } }, 'Home'>;

const { width } = Dimensions.get('window');
const USER_NAME_KEY = '@habit_tracker_user_name';

// Generate dates for the horizontal date picker
const generateDates = (daysCount: number = 14) => {
  const dates = [];
  const today = new Date();

  // Start from 7 days ago
  for (let i = -7; i < daysCount - 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const formatDayName = (date: Date) => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[date.getDay()];
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const FREE_HABIT_LIMIT = 5;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const { theme } = useTheme();
  const {
    habits,
    addHabit,
    deleteHabit,
    updateHabit,
    completeHabit,
    uncompleteHabit,
    resetHabitForDate,
    addNoteToCompletion,
    getCompletionProgress,
    isHabitCompletedForDate,
    reorderHabits,
  } = useHabits();
  const { subscription } = useSubscription();
  const { triggerReaction, getMascotForProgress, setMood, settings: mascotSettings, toggleMascot } = useMascot();
  const dateScrollRef = useRef<ScrollView>(null);

  const { fadeAnim, slideAnim, fabScale } = useScreenAnimation({ enableFAB: true });

  const [userName, setUserName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dates] = useState(generateDates(14));
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'firstCheckin' | 'allComplete' | 'streak'>('firstCheckin');
  const [celebrationHabit, setCelebrationHabit] = useState('');
  const [showAllCompleteModal, setShowAllCompleteModal] = useState(false);
  const [showMascotCelebration, setShowMascotCelebration] = useState(false);
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false);
  const [quickNoteHabitId, setQuickNoteHabitId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [pendingAllComplete, setPendingAllComplete] = useState(false); // Track if celebration is pending
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'single' | 'multiple'>('all'); // Filter for single vs multiple frequency habits

  // Load user name - refresh every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadUserName = async () => {
        try {
          const name = await AsyncStorage.getItem(USER_NAME_KEY);
          if (name) setUserName(name);
        } catch (error) {
          console.error('Error loading user name:', error);
        }
      };
      loadUserName();
    }, [])
  );

  // Scroll to today on mount
  useEffect(() => {
    setTimeout(() => {
      const todayIndex = dates.findIndex(d => isToday(d));
      if (todayIndex !== -1 && dateScrollRef.current) {
        dateScrollRef.current.scrollTo({
          x: Math.max(0, (todayIndex - 2) * 72),
          animated: true,
        });
      }
    }, 100);
  }, [dates]);

  // Handle new habit creation
  const newHabit = route.params?.newHabit;
  useEffect(() => {
    if (newHabit) {
      addHabit(newHabit);
      navigation.setParams({ newHabit: undefined });
    }
  }, [newHabit]);

  // Filter habits based on selected date
  const getHabitsForDate = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    return habits.filter((h) => {
      // Filter out archived habits
      if (h.archived) return false;

      // For daily habits, check if this day is selected
      if (h.frequency === 'daily') {
        return h.selectedDays.includes(dayOfWeek);
      }

      // For weekly habits, check if this day is selected
      if (h.frequency === 'weekly') {
        return h.selectedDays.includes(dayOfWeek);
      }

      return true;
    });
  };

  // Helper to format date as YYYY-MM-DD
  const formatDateISO = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const selectedDateISO = formatDateISO(selectedDate);

  // Filter out archived habits and filter by selected date
  const dateFilteredHabits = getHabitsForDate(selectedDate);

  // Apply frequency type filter (single vs multiple)
  const activeHabits = frequencyFilter === 'all'
    ? dateFilteredHabits
    : dateFilteredHabits.filter((h) => h.frequencyType === frequencyFilter);

  // Calculate completion count based on selected date
  const completedCount = activeHabits.filter((h) => isHabitCompletedForDate(h.id, selectedDateISO)).length;
  const totalCount = activeHabits.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddHabit = () => {
    // Check free tier limit
    if (!subscription.isPremium && activeHabits.length >= FREE_HABIT_LIMIT) {
      navigation.navigate('Profile', { screen: 'Paywall' });
      return;
    }
    navigation.navigate('AddHabitStep1');
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate sync - in real app this would sync with cloud
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Update mascot mood based on progress (only when counts change)
  useEffect(() => {
    const hasStreakAtRisk = activeHabits.some(h => h.streak > 3 && !isHabitCompletedForDate(h.id, selectedDateISO));
    const newMood = getMascotForProgress(completedCount, totalCount, hasStreakAtRisk);
    setMood(newMood);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCount, totalCount]);

  // Handle habit check-in with celebrations
  const handleToggleHabit = (habitId: string) => {
    const habit = activeHabits.find(h => h.id === habitId);
    if (!habit) return;

    const wasCompleted = isHabitCompletedForDate(habitId, selectedDateISO);
    const progress = getCompletionProgress(habitId, selectedDateISO);

    // For multi-completion habits that are fully complete: reset to 0
    if (habit.targetCompletionsPerDay > 1 && wasCompleted) {
      resetHabitForDate(habitId, selectedDateISO);
      return;
    }

    // If completing (add a completion)
    if (!wasCompleted) {
      // Check if we can still add more completions
      if (progress.current < progress.target) {
        completeHabit(habitId, selectedDateISO);
      }
    } else {
      // Uncompleting (remove last completion) - for single completion habits
      uncompleteHabit(habitId, selectedDateISO);
    }

    // If completing (not uncompleting)
    if (!wasCompleted && progress.current + 1 >= progress.target) {
      // Haptic feedback for completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Trigger mascot reaction (only if mascot is enabled)
      if (mascotSettings.enabled) {
        triggerReaction('proud', `Great job on "${habit.name}"! 🎯`);
      }

      // Check if all habits will be complete
      const willAllBeComplete = completedCount + 1 === totalCount;

      // Always show quick note modal when completing a habit
      setQuickNoteHabitId(habitId);
      setShowQuickNoteModal(true);
      // If all complete, mark as pending so celebration shows after modal closes
      if (willAllBeComplete) {
        setPendingAllComplete(true);
      }
      // The original `else if (willAllBeComplete)` block is now handled by `pendingAllComplete`
      // and the quick note modal's `handleSaveQuickNote` or `handleSkipQuickNote`
      // So, we remove the direct celebration trigger here.

      // Check for streak milestones
      if (habit.streak === 6 || habit.streak === 29 || habit.streak === 99) {
        setCelebrationHabit(habit.name);
        setCelebrationType('streak');
        if (mascotSettings.enabled) {
          triggerReaction('celebrating', `${habit.streak + 1} day streak! You're amazing! 🔥`);
        }
        setTimeout(() => setShowCelebration(true), 300);
      }
    } else {
      // Uncompleting a habit
      if (mascotSettings.enabled) {
        triggerReaction('encouraging', "Changed your mind? That's okay!");
      }
    }
  };

  // Handle habit deletion
  const handleDeleteHabit = (habit: Habit) => {
    setHabitToDelete(habit);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteHabit = () => {
    if (habitToDelete) {
      // Haptic feedback for deletion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      deleteHabit(habitToDelete.id);
      setHabitToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Handle habit archive (from swipe action)
  const handleArchiveHabit = (habit: Habit) => {
    updateHabit(habit.id, { archived: true });
    if (mascotSettings.enabled) {
      triggerReaction('encouraging', `"${habit.name}" archived. You can restore it in Settings.`);
    }
  };

  // Handle habit edit (from swipe action)
  const handleEditHabit = (habit: Habit) => {
    navigation.navigate('EditHabit', { habitId: habit.id, habitData: habit });
  };

  // Handle habit card press
  const handleHabitPress = (habit: Habit) => {
    navigation.navigate('HabitDetail', { habitId: habit.id, habitData: habit });
  };

  // Handle habit reorder - convert from activeHabits index to full habits index
  const handleReorderHabits = (fromIndex: number, toIndex: number) => {
    // Get the actual indices in the full habits array
    const activeHabitIds = activeHabits.map(h => h.id);
    const fromHabitId = activeHabitIds[fromIndex];
    const toHabitId = activeHabitIds[toIndex];

    // Find actual indices in the full array
    const actualFromIndex = habits.findIndex(h => h.id === fromHabitId);
    const actualToIndex = habits.findIndex(h => h.id === toHabitId);

    if (actualFromIndex !== -1 && actualToIndex !== -1) {
      reorderHabits(actualFromIndex, actualToIndex);
    }
  };

  // Handle share all complete
  const handleShareAllComplete = async () => {
    try {
      await Share.share({
        message: `I just completed all ${totalCount} habits today! 🎉 Building better habits one day at a time with Habit Tracker.`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
    setShowAllCompleteModal(false);
  };

  // Handle quick note save
  const handleSaveQuickNote = (note: string, mood?: string) => {
    if (quickNoteHabitId) {
      const today = new Date().toISOString().split('T')[0];
      // Add the note/mood to today's completion
      addNoteToCompletion(quickNoteHabitId, today, { mood, note });
      console.log('Note/mood saved:', note, mood, 'for habit:', quickNoteHabitId);
    }

    setShowQuickNoteModal(false);
    setQuickNoteHabitId(null);

    // If all habits were completed, now show celebration
    if (pendingAllComplete) {
      setPendingAllComplete(false);
      if (mascotSettings.enabled) {
        triggerReaction('ecstatic', "YOU DID IT! All habits complete! 🎉🎊");
      }
      if (mascotSettings.enabled && mascotSettings.showCelebrations) {
        setTimeout(() => setShowMascotCelebration(true), 300);
      } else {
        // No mascot, show share modal directly
        setTimeout(() => setShowAllCompleteModal(true), 300);
      }
    }
  };

  // Handle quick note skip
  const handleSkipQuickNote = () => {
    setShowQuickNoteModal(false);
    setQuickNoteHabitId(null);

    // If all habits were completed, now show celebration
    if (pendingAllComplete) {
      setPendingAllComplete(false);
      if (mascotSettings.enabled) {
        triggerReaction('ecstatic', "YOU DID IT! All habits complete! 🎉🎊");
      }
      if (mascotSettings.enabled && mascotSettings.showCelebrations) {
        setTimeout(() => setShowMascotCelebration(true), 300);
      } else {
        // No mascot, show share modal directly
        setTimeout(() => setShowAllCompleteModal(true), 300);
      }
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile', { screen: 'ProfileMain' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const now = selectedDate;
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  };

  const getSectionTitle = () => {
    if (isToday(selectedDate)) {
      return "Today's Habits";
    }
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
  };

  const getInitials = () => {
    if (!userName) return '?';
    const names = userName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userName[0].toUpperCase();
  };

  const getMotivationalMessage = () => {
    if (totalCount === 0) return 'Add habits to get started!';
    if (completedCount === totalCount) return 'Amazing! All done for today! 🎉';
    if (progressPercentage >= 60) return "Keep it up! You're on fire 🔥";
    if (progressPercentage >= 30) return "Good progress! Keep going 💪";
    return "Let's build some habits! 🌟";
  };

  const renderDateItem = (date: Date, index: number) => {
    const isSelected = isSameDay(date, selectedDate);
    const isTodayDate = isToday(date);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dateItem,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
            borderColor: isTodayDate && !isSelected ? theme.colors.primary : 'transparent',
            borderWidth: isTodayDate && !isSelected ? 2 : 0,
          },
        ]}
        onPress={() => setSelectedDate(date)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dateDayName,
            {
              color: isSelected ? theme.colors.white : theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamilyBodyMedium,
              fontSize: theme.typography.fontSizeXS,
            },
          ]}
        >
          {formatDayName(date)}
        </Text>
        <Text
          style={[
            styles.dateNumber,
            {
              color: isSelected ? theme.colors.white : theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplayBold,
              fontSize: theme.typography.fontSizeLG,
            },
          ]}
        >
          {date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyEmoji, { fontSize: 64 }]}>🌱</Text>
      <Text
        style={[
          styles.emptyTitle,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyDisplayBold,
            fontSize: theme.typography.fontSizeXL,
          },
        ]}
      >
        Start Your Journey
      </Text>
      <Text
        style={[
          styles.emptyMessage,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeMD,
            lineHeight: 16 * theme.typography.lineHeightRelaxed,
          },
        ]}
      >
        Add your first habit to begin tracking your progress
      </Text>
      <TouchableOpacity
        style={[
          styles.emptyButton,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={handleAddHabit}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.emptyButtonText,
            {
              color: theme.colors.white,
              fontFamily: theme.typography.fontFamilyBodySemibold,
              fontSize: theme.typography.fontSizeMD,
            },
          ]}
        >
          Add Your First Habit
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text
            style={[
              styles.dateText,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
                letterSpacing: 1,
              },
            ]}
          >
            {getFormattedDate()}
          </Text>
          <Text
            style={[
              styles.greeting,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplayBold,
                fontSize: theme.typography.fontSize2XL,
              },
            ]}
          >
            Hi, {userName || 'there'} 👋
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.profileButton,
            {
              backgroundColor: theme.colors.primary + '30',
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <User size={22} color={theme.colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Date Picker */}
        <Animated.View
          style={[
            styles.datePickerContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
            },
          ]}
        >
          <ScrollView
            ref={dateScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datePickerContent}
          >
            {dates.map((date, index) => renderDateItem(date, index))}
          </ScrollView>
        </Animated.View>

        {/* Mascot Companion - Hero Display */}
        {mascotSettings.enabled ? (
          <Animated.View
            style={[
              styles.mascotCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: fadeAnim,
                overflow: 'hidden',
              },
            ]}
          >
            {/* Hide mascot button - subtle, top right */}
            <TouchableOpacity
              style={[
                styles.mascotToggleButton,
                {
                  backgroundColor: theme.colors.background + 'CC',
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => toggleMascot(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.mascotToggleText, { color: theme.colors.textSecondary }]}>
                Hide
              </Text>
            </TouchableOpacity>
            <Mascot variant="hero" size="medium" showName />
          </Animated.View>
        ) : (
          /* Show Habi pill when mascot is hidden */
          <TouchableOpacity
            style={[
              styles.showMascotPill,
              {
                backgroundColor: theme.colors.primary + '15',
                borderColor: theme.colors.primary + '30',
              },
            ]}
            onPress={() => toggleMascot(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.showMascotEmoji}>🐾</Text>
            <Text
              style={[
                styles.showMascotText,
                {
                  color: theme.colors.primary,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              Show Habi
            </Text>
          </TouchableOpacity>
        )}

        {/* Progress Card */}
        {activeHabits.length > 0 && (
          <Animated.View
            style={[
              styles.progressCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.progressInfo}>
              <Text
                style={[
                  styles.progressTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: theme.typography.fontSize2XL,
                  },
                ]}
              >
                {completedCount}/{totalCount} Done
              </Text>
              <Text
                style={[
                  styles.progressSubtitle,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                {getMotivationalMessage()}
              </Text>
            </View>
            <View style={styles.progressRingContainer}>
              <Svg width="70" height="70" style={styles.progressSvg}>
                {/* Background circle */}
                <Circle
                  cx="35"
                  cy="35"
                  r="31"
                  stroke={theme.colors.border}
                  strokeWidth="4"
                  fill="none"
                />
                {/* Progress circle */}
                <Circle
                  cx="35"
                  cy="35"
                  r="31"
                  stroke={theme.colors.primary}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 31}`}
                  strokeDashoffset={`${2 * Math.PI * 31 * (1 - progressPercentage / 100)}`}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="35, 35"
                />
              </Svg>
              <View style={styles.progressPercentageContainer}>
                <Text
                  style={[
                    styles.progressPercentage,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyDisplayBold,
                      fontSize: theme.typography.fontSizeLG,
                    },
                  ]}
                >
                  {progressPercentage}%
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Habits List */}
        {activeHabits.length > 0 ? (
          <Animated.View
            style={[
              styles.habitsSection,
              { opacity: fadeAnim },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSizeLG,
                },
              ]}
            >
              {getSectionTitle()}
            </Text>

            {/* Frequency Filter Chips */}
            <View style={styles.filterChipsContainer}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: frequencyFilter === 'all' ? theme.colors.primary : theme.colors.surface,
                    borderColor: frequencyFilter === 'all' ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setFrequencyFilter('all')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: frequencyFilter === 'all' ? theme.colors.white : theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: frequencyFilter === 'single' ? theme.colors.primary : theme.colors.surface,
                    borderColor: frequencyFilter === 'single' ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setFrequencyFilter('single')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: frequencyFilter === 'single' ? theme.colors.white : theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  Single
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: frequencyFilter === 'multiple' ? theme.colors.primary : theme.colors.surface,
                    borderColor: frequencyFilter === 'multiple' ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setFrequencyFilter('multiple')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: frequencyFilter === 'multiple' ? theme.colors.white : theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  Multiple
                </Text>
              </TouchableOpacity>
            </View>

            <DraggableHabitList
              habits={activeHabits}
              selectedDate={selectedDateISO}
              onToggle={handleToggleHabit}
              onPress={handleHabitPress}
              onEdit={handleEditHabit}
              onArchive={handleArchiveHabit}
              onDelete={handleDeleteHabit}
              onReorder={handleReorderHabits}
            />
          </Animated.View>
        ) : (
          renderEmptyState()
        )}

        {/* Free Tier Limit Indicator */}
        {!subscription.isPremium && activeHabits.length > 0 && (
          <TouchableOpacity
            style={[
              styles.limitBanner,
              {
                backgroundColor: theme.colors.primaryLight + '20',
                borderColor: theme.colors.primary + '40',
              },
            ]}
            onPress={() => navigation.navigate('Profile', { screen: 'Paywall' })}
            activeOpacity={0.8}
          >
            <View style={styles.limitBannerLeft}>
              <Text style={styles.limitBannerIcon}>✨</Text>
              <View>
                <Text
                  style={[
                    styles.limitBannerText,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  {activeHabits.length}/{FREE_HABIT_LIMIT} free habits used
                </Text>
                <Text
                  style={[
                    styles.limitBannerSubtext,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  Upgrade for unlimited
                </Text>
              </View>
            </View>
            <Text style={[styles.limitBannerChevron, { color: theme.colors.primary }]}>→</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          { transform: [{ scale: fabScale }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.shadows.shadowLG.shadowColor,
              shadowOffset: theme.shadows.shadowLG.shadowOffset,
              shadowOpacity: theme.shadows.shadowLG.shadowOpacity,
              shadowRadius: theme.shadows.shadowLG.shadowRadius,
              elevation: theme.shadows.shadowLG.elevation,
            },
          ]}
          onPress={handleAddHabit}
          activeOpacity={0.8}
        >
          <Text style={[styles.fabText, { color: theme.colors.white }]}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Celebration Modal */}
      <CelebrationModal
        visible={showCelebration}
        type={celebrationType}
        habitName={celebrationHabit}
        streakDays={7}
        onDismiss={() => setShowCelebration(false)}
        onShare={() => {
          console.log('Share achievement');
          setShowCelebration(false);
        }}
      />

      {/* Mascot Celebration - Shows when all habits complete */}
      <MascotCelebration
        visible={showMascotCelebration}
        type="allComplete"
        title="All Done! 🎉"
        message={`You completed all ${totalCount} habits today! ${userName ? userName + ', you' : 'You'}'re absolutely crushing it!`}
        onDismiss={() => {
          setShowMascotCelebration(false);
          // Optionally show share modal after
          setTimeout(() => setShowAllCompleteModal(true), 300);
        }}
      />

      {/* All Habits Complete Modal (Share option) */}
      <AllHabitsCompleteModal
        visible={showAllCompleteModal}
        completedCount={totalCount}
        activeStreaks={activeHabits.filter(h => h.streak > 0).length}
        onDismiss={() => setShowAllCompleteModal(false)}
        onShare={handleShareAllComplete}
      />

      {/* Quick Note Modal */}
      <QuickNoteModal
        visible={showQuickNoteModal}
        habitName={quickNoteHabitId ? activeHabits.find(h => h.id === quickNoteHabitId)?.name || '' : ''}
        onSave={handleSaveQuickNote}
        onSkip={handleSkipQuickNote}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        visible={showDeleteConfirm}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habitToDelete?.name}"? This will delete all history and cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={confirmDeleteHabit}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setHabitToDelete(null);
        }}
      />
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  dateText: {
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  greeting: {
    // styles from theme
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  profileInitials: {
    // styles from theme
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20, // Reduced from 100 to avoid blank space above tab bar
  },
  datePickerContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  mascotCard: {
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    paddingVertical: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  mascotToggleButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 10,
  },
  mascotToggleText: {
    fontSize: 12,
  },
  showMascotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  showMascotEmoji: {
    fontSize: 16,
  },
  showMascotText: {},
  datePickerContent: {
    gap: 8,
  },
  dateItem: {
    width: 64,
    height: 72,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dateDayName: {
    marginBottom: 4,
  },
  dateNumber: {
    // styles from theme
  },
  progressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    marginBottom: 4,
  },
  progressSubtitle: {
    // styles from theme
  },
  progressRingContainer: {
    width: 70,
    height: 70,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSvg: {
    position: 'absolute',
  },
  progressPercentageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    // styles from theme
  },
  habitsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    marginBottom: 24,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  emptyButtonText: {
    // styles from theme
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 32,
    fontWeight: '300',
  },
  limitBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  limitBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  limitBannerIcon: {
    fontSize: 24,
  },
  limitBannerText: {},
  limitBannerSubtext: {
    marginTop: 2,
  },
  limitBannerChevron: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
