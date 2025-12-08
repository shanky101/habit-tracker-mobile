import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { useTheme } from '@/theme';
import { useHabits } from '@/hooks/useHabits';
import { useSubscription } from '@/context/SubscriptionContext';

const { width } = Dimensions.get('window');
const CALENDAR_PADDING = 24;
const DAY_SIZE = (width - CALENDAR_PADDING * 2) / 7;

const CalendarViewScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { theme } = useTheme();
  const { habits, completeHabit, uncompleteHabit, isHabitCompletedForDate } = useHabits();
  const { subscription } = useSubscription();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedHabitFilter, setSelectedHabitFilter] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const activeHabits = habits.filter((h) => !h.archived);
  const filteredHabits = selectedHabitFilter
    ? activeHabits.filter((h) => h.id === selectedHabitFilter)
    : activeHabits;

  // Check if date is in the past (for retroactive check-in)
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Handle retroactive check-in (Premium only)
  const handleRetroactiveCheckIn = (habitId: string, date: Date) => {
    if (!subscription.isPremium) {
      Alert.alert(
        'Premium Feature',
        'Retroactive check-ins are available for Premium users. Upgrade to mark past habits as complete.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => navigation.navigate('Profile', { screen: 'Paywall' }),
          },
        ]
      );
      return;
    }
    // Toggle habit for the past date
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCompleted = isHabitCompletedForDate(habitId, dateStr);

    if (isCompleted) {
      uncompleteHabit(habitId, dateStr);
    } else {
      completeHabit(habitId, dateStr);
    }

    Alert.alert('Check-in Updated', `Habit marked for ${date.toLocaleDateString()}`);
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  // Get real completion data for a day
  const getDayCompletionData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const totalHabits = filteredHabits.length;

    // Count how many habits were completed on this date
    const completedHabits = filteredHabits.filter(habit => {
      const completion = habit.completions?.[dateStr];
      if (!completion) return false;

      // Check if habit was completed (met target)
      return completion.completionCount >= completion.targetCount;
    }).length;

    return {
      total: totalHabits,
      completed: completedHabits,
      percentage: totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0,
    };
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage === 0) return theme.colors.border;
    if (percentage < 50) return '#FCA5A5'; // Light red
    if (percentage < 100) return '#FCD34D'; // Yellow
    return '#86EFAC'; // Light green
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayPress = (date: Date | null) => {
    if (date) {
      setSelectedDay(date);
    }
  };

  const getMonthYear = () => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const renderDayDetailModal = () => {
    if (!selectedDay) return null;

    const completionData = getDayCompletionData(selectedDay);
    const dateString = selectedDay.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const isPast = isPastDate(selectedDay);

    return (
      <Modal
        visible={selectedDay !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDay(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedDay(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
            {/* Modal Handle */}
            <View
              style={[styles.modalHandle, { backgroundColor: theme.colors.border }]}
            />

            {/* Date Header */}
            <Text
              style={[
                styles.modalDate,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSizeLG,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                },
              ]}
            >
              {dateString}
            </Text>

            {/* Completion Summary */}
            <Text
              style={[
                styles.modalSummary,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              {completionData.completed} of {completionData.total} habits completed
            </Text>

            {/* Retroactive Notice for Past Dates */}
            {isPast && (
              <View
                style={[
                  styles.retroactiveNotice,
                  {
                    backgroundColor: subscription.isPremium
                      ? theme.colors.primaryLight + '20'
                      : theme.colors.warning + '20',
                    borderColor: subscription.isPremium
                      ? theme.colors.primary + '40'
                      : theme.colors.warning + '40',
                  },
                ]}
              >
                <Text style={styles.retroactiveIcon}>
                  {subscription.isPremium ? '✏️' : '🔒'}
                </Text>
                <Text
                  style={[
                    styles.retroactiveText,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {subscription.isPremium
                    ? 'Tap a habit to update past check-in'
                    : 'Upgrade to Premium for retroactive check-ins'}
                </Text>
              </View>
            )}

            {/* Habit List */}
            <ScrollView style={styles.habitsList} showsVerticalScrollIndicator={false}>
              {filteredHabits.map((habit, index) => {
                // Get real completion status for this habit on selected day
                const dateStr = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
                const completion = habit.completions?.[dateStr];
                const completed = completion ? completion.completionCount >= completion.targetCount : false;

                return (
                  <TouchableOpacity
                    key={habit.id}
                    style={[
                      styles.habitItem,
                      {
                        borderBottomColor: theme.colors.border,
                        borderBottomWidth: index < filteredHabits.length - 1 ? 1 : 0,
                      },
                    ]}
                    onPress={() => {
                      if (isPast) {
                        handleRetroactiveCheckIn(habit.id, selectedDay);
                      }
                    }}
                    activeOpacity={isPast ? 0.7 : 1}
                  >
                    <View style={styles.habitItemLeft}>
                      <Text style={styles.habitItemEmoji}>{habit.emoji}</Text>
                      <Text
                        style={[
                          styles.habitItemName,
                          {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamilyBody,
                            fontSize: theme.typography.fontSizeSM,
                          },
                        ]}
                      >
                        {habit.name}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.habitItemStatus,
                        {
                          backgroundColor: completed ? '#22C55E20' : '#EF444420',
                        },
                      ]}
                    >
                      <Text style={styles.habitItemStatusIcon}>
                        {completed ? '✓' : '✕'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedDay(null)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.closeButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSizeMD,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                  },
                ]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.background,
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

        <View style={styles.monthNavigation}>
          <TouchableOpacity
            onPress={handlePreviousMonth}
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>‹</Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.monthYear,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSizeLG,
                fontFamily: theme.typography.fontFamilyDisplayBold,
              },
            ]}
          >
            {getMonthYear()}
          </Text>

          <TouchableOpacity
            onPress={handleNextMonth}
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.todayButton,
            { backgroundColor: theme.colors.backgroundSecondary },
          ]}
          onPress={handleToday}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.todayText,
              {
                color: theme.colors.primary,
                fontSize: theme.typography.fontSizeXS,
                fontFamily: theme.typography.fontFamilyBodySemibold,
              },
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>
      </View>

      {/* Habit Filter Dropdown */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeSM,
              },
            ]}
          >
            {selectedHabitFilter
              ? activeHabits.find((h) => h.id === selectedHabitFilter)?.name || 'All Habits'
              : 'All Habits'}
          </Text>
          <Text style={[styles.filterChevron, { color: theme.colors.textSecondary }]}>
            {showFilterDropdown ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showFilterDropdown && (
          <View
            style={[
              styles.filterDropdown,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                shadowColor: theme.shadows.shadowLG.shadowColor,
                shadowOffset: theme.shadows.shadowLG.shadowOffset,
                shadowOpacity: theme.shadows.shadowLG.shadowOpacity,
                shadowRadius: theme.shadows.shadowLG.shadowRadius,
                elevation: theme.shadows.shadowLG.elevation,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.filterOption,
                { borderBottomColor: theme.colors.border },
              ]}
              onPress={() => {
                setSelectedHabitFilter(null);
                setShowFilterDropdown(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  {
                    color: !selectedHabitFilter ? theme.colors.primary : theme.colors.text,
                    fontFamily: !selectedHabitFilter
                      ? theme.typography.fontFamilyBodySemibold
                      : theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                All Habits
              </Text>
              {!selectedHabitFilter && (
                <Text style={[styles.filterCheck, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
            {activeHabits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.filterOption,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={() => {
                  setSelectedHabitFilter(habit.id);
                  setShowFilterDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.filterOptionContent}>
                  <Text style={styles.filterOptionEmoji}>{habit.emoji}</Text>
                  <Text
                    style={[
                      styles.filterOptionText,
                      {
                        color: selectedHabitFilter === habit.id ? theme.colors.primary : theme.colors.text,
                        fontFamily: selectedHabitFilter === habit.id
                          ? theme.typography.fontFamilyBodySemibold
                          : theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {habit.name}
                  </Text>
                </View>
                {selectedHabitFilter === habit.id && (
                  <Text style={[styles.filterCheck, { color: theme.colors.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Calendar Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <View key={index} style={[styles.dayHeader, { width: DAY_SIZE }]}>
              <Text
                style={[
                  styles.dayHeaderText,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSizeXS,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                  },
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (!day) {
              return <View key={`empty-${index}`} style={[styles.dayCell, { width: DAY_SIZE, height: DAY_SIZE }]} />;
            }

            const completionData = getDayCompletionData(day);
            const today = isToday(day);
            const selected = isSameDay(day, selectedDay);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  {
                    width: DAY_SIZE,
                    height: DAY_SIZE,
                    borderColor: today ? theme.colors.primary : 'transparent',
                    backgroundColor: selected
                      ? `${theme.colors.primary}20`
                      : 'transparent',
                  },
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    {
                      color: today ? theme.colors.primary : theme.colors.text,
                      fontSize: theme.typography.fontSizeSM,
                      fontFamily: today
                        ? theme.typography.fontFamilyBodyBold
                        : theme.typography.fontFamilyBodyMedium,
                    },
                  ]}
                >
                  {day.getDate()}
                </Text>

                {/* Completion Indicator */}
                {completionData.total > 0 && (
                  <View
                    style={[
                      styles.completionIndicator,
                      {
                        backgroundColor: getCompletionColor(
                          completionData.percentage
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.completionText}>
                      {completionData.completed}/{completionData.total}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text
            style={[
              styles.legendTitle,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSizeXS,
                fontFamily: theme.typography.fontFamilyBodySemibold,
              },
            ]}
          >
            COMPLETION STATUS
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: theme.colors.border }]}
              />
              <Text
                style={[
                  styles.legendLabel,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                None
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FCA5A5' }]} />
              <Text
                style={[
                  styles.legendLabel,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Partial
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#86EFAC' }]} />
              <Text
                style={[
                  styles.legendLabel,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Complete
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Day Detail Modal */}
      {renderDayDetailModal()}
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
    justifyContent: 'space-between',
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
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  navButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 32,
  },
  monthYear: {
    marginHorizontal: 16,
    minWidth: 180,
    textAlign: 'center',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  todayText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: CALENDAR_PADDING,
    marginTop: 16,
    marginBottom: 8,
  },
  dayHeader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayHeaderText: {
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: CALENDAR_PADDING,
  },
  dayCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 8,
    padding: 4,
  },
  dayNumber: {
    marginBottom: 4,
  },
  completionIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  completionText: {
    fontSize: 9,
    color: '#000',
  },
  legend: {
    marginTop: 24,
    paddingHorizontal: CALENDAR_PADDING,
  },
  legendTitle: {
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendLabel: {},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalDate: {
    marginBottom: 8,
  },
  modalSummary: {
    marginBottom: 24,
  },
  habitsList: {
    marginBottom: 24,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  habitItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitItemEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  habitItemName: {},
  habitItemStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitItemStatusIcon: {
    fontSize: 16,
  },
  closeButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeButtonText: {},
  filterContainer: {
    paddingHorizontal: CALENDAR_PADDING,
    paddingVertical: 12,
    zIndex: 100,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterButtonText: {},
  filterChevron: {
    fontSize: 10,
    marginLeft: 8,
  },
  filterDropdown: {
    position: 'absolute',
    top: 60,
    left: CALENDAR_PADDING,
    right: CALENDAR_PADDING,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 101,
    overflow: 'hidden',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterOptionEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  filterOptionText: {},
  filterCheck: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  retroactiveNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  retroactiveIcon: {
    fontSize: 18,
  },
  retroactiveText: {
    flex: 1,
  },
});

export default CalendarViewScreen;
