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
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useUserStore } from '@/store/userStore';
import { useTheme } from '@/theme';
import { useHabits } from '@/hooks/useHabits';
import { useBadgeStore } from '@/store/badgeStore';
import { useSubscription } from '@/context/SubscriptionContext';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { Habit, HabitTimePeriod } from '@/types/habit';
import CelebrationModal from '@/components/CelebrationModal';
import {
  AllHabitsCompleteModal,
  QuickNoteModal,
  ConfirmationDialog,
} from '@/components/HabitModals';
import { useMascot } from '@/context/MascotContext';
import { Mascot, MascotCelebration, DraggableHabitList } from '@/components';
import { User } from 'lucide-react-native';
import { TimeFilter } from '@/components/filters/TimeFilter';
import { BackgroundWrapper } from '@/components/BackgroundWrapper';

import { useSettingsStore } from '@/store/settingsStore';

type HomeScreenNavigationProp = StackNavigationProp<any, 'Home'>;
type HomeScreenRouteProp = RouteProp<{ Home: { newHabit?: any } }, 'Home'>;

const { width } = Dimensions.get('window');

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
  const { triggerReaction, getMascotForProgress, setMood, settings: mascotSettings, toggleMascot, petMascot } = useMascot();
  const dateScrollRef = useRef<ScrollView>(null);

  const { fadeAnim, slideAnim, fabScale } = useScreenAnimation({ enableFAB: true });

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
  const [timePeriodFilter, setTimePeriodFilter] = useState<'all' | HabitTimePeriod>('allday'); // Filter by time period


  // Get time ranges from settings store
  const { timeRanges } = useSettingsStore();

  // Load user name - refresh every time screen  const { profile } = useUserStore();
  const { profile } = useUserStore();
  const userName = profile.name || 'Friend';
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

    // Trigger app open badge check
    useBadgeStore.getState().checkUnlock('app_open', {
      timestamp: Date.now(),
    });
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

  // Filter logic - CHANGED: We now show all habits in sections, filter just highlights/scrolls
  // const isSpecificPeriod = timePeriodFilter !== 'all' && timePeriodFilter !== 'allday';

  // Group habits by time period
  const morningHabits = dateFilteredHabits.filter(h => h.timePeriod === 'morning');
  const afternoonHabits = dateFilteredHabits.filter(h => h.timePeriod === 'afternoon');
  const eveningHabits = dateFilteredHabits.filter(h => h.timePeriod === 'evening');
  const nightHabits = dateFilteredHabits.filter(h => h.timePeriod === 'night');
  const allDayHabits = dateFilteredHabits.filter(h => h.timePeriod === 'allday');

  // Combined list for counts and other logic
  const activeHabits = dateFilteredHabits;

  // Calculate habit counts per time period for filter badges
  const habitCounts: Record<HabitTimePeriod | 'all', number> = {
    all: dateFilteredHabits.length,
    morning: morningHabits.length,
    afternoon: afternoonHabits.length,
    evening: eveningHabits.length,
    night: nightHabits.length,
    allday: allDayHabits.length,
  };

  // Calculate completion count for THE ENTIRE DAY
  const completedCount = dateFilteredHabits.filter((h) => isHabitCompletedForDate(h.id, selectedDateISO)).length;
  const totalCount = dateFilteredHabits.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Refs for scrolling to sections
  const mainScrollRef = useRef<ScrollView>(null);
  const sectionLayouts = useRef<Record<string, number>>({});

  const handleScrollToSection = (period: HabitTimePeriod | 'all') => {
    setTimePeriodFilter(period);

    if (period === 'all') {
      mainScrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    const y = sectionLayouts.current[period];
    if (y !== undefined) {
      mainScrollRef.current?.scrollTo({ y, animated: true });
    }
  };

  const onSectionLayout = (period: string, event: any) => {
    sectionLayouts.current[period] = event.nativeEvent.layout.y;
  };

  const handleAddHabit = () => {
    // Check free tier limit
    // Check free tier limit - exclude default/seed habits
    const totalHabits = habits.filter(h => !h.archived && !h.isDefault).length;
    if (!subscription.isPremium && totalHabits >= FREE_HABIT_LIMIT) {
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
    // Check ALL habits for the day for streak risk, not just filtered view
    const hasStreakAtRisk = dateFilteredHabits.some(h => h.streak > 3 && !isHabitCompletedForDate(h.id, selectedDateISO));
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

  // Handle habit reorder - convert from list index to full habits index
  const handleReorderList = (list: Habit[], fromIndex: number, toIndex: number) => {
    const listIds = list.map(h => h.id);
    const fromHabitId = listIds[fromIndex];
    const toHabitId = listIds[toIndex];

    // Find actual indices in the full array
    const actualFromIndex = habits.findIndex(h => h.id === fromHabitId);
    const actualToIndex = habits.findIndex(h => h.id === toHabitId);

    if (actualFromIndex !== -1 && actualToIndex !== -1) {
      reorderHabits(actualFromIndex, actualToIndex);
    }
  };

  const handleReorderPeriodHabits = (fromIndex: number, toIndex: number) => {
    // This needs to be updated to handle specific lists if needed, 
    // but since we are splitting lists, we might need to pass the specific list to the handler
    // For now, let's assume reordering works within the list passed to DraggableHabitList
  };

  // Helper to render a habit section
  const renderHabitSection = (title: string, period: string, sectionHabits: Habit[]) => {
    if (sectionHabits.length === 0) return null;

    return (
      <View
        key={period}
        onLayout={(event) => onSectionLayout(period, event)}
        style={styles.habitsSection}
      >
        <View style={styles.sectionHeaderContainer}>
          <Text style={[
            styles.sectionHeaderText,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamilyBodySemibold,
            }
          ]}>
            {title}
          </Text>
        </View>
        <DraggableHabitList
          habits={sectionHabits}
          selectedDate={selectedDateISO}
          onToggle={handleToggleHabit}
          onPress={handleHabitPress}
          onEdit={handleEditHabit}
          onArchive={handleArchiveHabit}
          onDelete={handleDeleteHabit}
          onReorder={(from, to) => handleReorderList(sectionHabits, from, to)}
        />
      </View>
    );
  };

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

  const handleSaveQuickNote = (note: string, mood?: string) => {
    if (quickNoteHabitId) {
      const today = new Date().toISOString().split('T')[0];
      // Add the note/mood to today's completion
      addNoteToCompletion(quickNoteHabitId, today, { mood, note });
      console.log('Note/mood saved:', note, mood, 'for habit:', quickNoteHabitId);

      // Trigger badge checks
      if (note) {
        useBadgeStore.getState().checkUnlock('note_add', {
          habitId: quickNoteHabitId,
          timestamp: Date.now(),
        });
      }

      if (mood) {
        useBadgeStore.getState().checkUnlock('mood_log', {
          habitId: quickNoteHabitId,
          mood,
          timestamp: Date.now(),
        });
      }
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
            backgroundColor: isSelected ? theme.colors.secondary : '#4F46E5', // Solid blue like Templates
            borderColor: isTodayDate && !isSelected ? theme.colors.secondary : 'transparent',
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
              color: isSelected ? theme.colors.black : theme.colors.textSecondary,
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
              color: isSelected ? theme.colors.black : theme.colors.text,
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
        Add a habit to begin tracking your progress
      </Text>
    </View>
  );

  // ... (rest of handlers)

  return (
    <BackgroundWrapper>
      <SafeAreaView
        style={[styles.container, { backgroundColor: 'transparent' }]} // Transparent for global gradient
        edges={['top', 'left', 'right']}
      >
        {/* Go Club Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.white }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.subGreeting, { color: theme.colors.white }]}>
              Ready to crush your goals?
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.statsButton, { backgroundColor: '#4F46E5' }]}
            onPress={() => navigation.navigate('Stats')}
          >
            <Ionicons name="stats-chart" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={mainScrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.secondary}
            />
          }
        >
          {/* Premium Upsell Banner */}
          {!subscription.isPremium && (
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']} // Solid gradient like Templates
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumCard}
            >
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                onPress={() => navigation.navigate('Profile', { screen: 'Paywall' })}
                activeOpacity={0.8}
              >
                <View style={styles.premiumIconCircle}>
                  <Text style={styles.premiumIconText}>✨</Text>
                </View>
                <View style={styles.premiumTextContainer}>
                  <Text style={styles.premiumTitle}>Go Premium</Text>
                  <Text style={styles.premiumSubtitle}>$19.99 a year</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
          )}



          {/* Date Picker (Kept for functionality but styled minimally) */}
          <View style={{ marginTop: 24, marginBottom: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {dates.map((date, index) => renderDateItem(date, index))}
            </ScrollView>
          </View>

          {/* Habits List */}
          {dateFilteredHabits.length > 0 ? (
            <View style={styles.habitsContainer}>
              {/* We can group by time period or just show all. Design implies a list. */}
              {/* Showing grouped for now as per existing logic, but with new styles */}
              {renderHabitSection('Morning', 'morning', morningHabits)}
              {renderHabitSection('Afternoon', 'afternoon', afternoonHabits)}
              {renderHabitSection('Evening', 'evening', eveningHabits)}
              {renderHabitSection('Night', 'night', nightHabits)}
              {renderHabitSection('All Day', 'allday', allDayHabits)}
            </View>
          ) : (
            renderEmptyState()
          )}


        </ScrollView >

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
        </Animated.View >

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
            setCelebrationType('allComplete');
            // Trigger mascot celebration animation
            // TODO: Re-add celebration animation after implementing differently
            // setTimeout(() => mascotRef.current?.celebrate(), 100);
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
      </SafeAreaView >
    </BackgroundWrapper>
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  dateText: {
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 18,
    fontFamily: 'Outfit_400Regular',
  },
  subGreeting: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    marginTop: 4,
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
  statsButton: {
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
    paddingBottom: 100,
  },
  datePickerContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  mascotCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
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
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  premiumIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  premiumIconText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumSubtitle: {
    color: '#FFF',
    fontSize: 14,
  },
  goalSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
  },
  viewPlanText: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
  },
  metricUnit: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginLeft: 2,
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  visualizerBar: {
    width: 4,
    borderRadius: 2,
  },
  goldenHourCard: {
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    minHeight: 160,
    justifyContent: 'space-between',
  },
  goldenHourContent: {
    zIndex: 2,
  },
  goldenHourTitle: {
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    marginBottom: 16,
    maxWidth: '80%',
    lineHeight: 32,
  },
  goldenHourButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  goldenHourButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sunDial: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: 'rgba(255,165,0,0.5)',
    zIndex: 1,
  },
  sunDialArc: {
    // Placeholder for arc
  },
  dateItem: {
    width: 60,
    height: 80,
    borderRadius: 30, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateDayName: {
    marginBottom: 4,
  },
  dateNumber: {
    //
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
  habitsContainer: {
    paddingBottom: 20,
  },
  habitsSection: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filtersContainer: {
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
    bottom: 90,
    right: 24,
    zIndex: 100,
  },
  fab: {
    width: 56, // Reduced from likely 64
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 28, // Reduced from likely 32
    fontWeight: '400',
    lineHeight: 28, // Ensure proper centering
    textAlign: 'center',
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
