import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme';
import { useHabits } from '@/contexts/HabitsContext';
import CelebrationModal from '@/components/CelebrationModal';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

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

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const { theme } = useTheme();
  const { habits, addHabit, toggleHabit: toggleHabitContext } = useHabits();
  const dateScrollRef = useRef<ScrollView>(null);

  const { fadeAnim, slideAnim, fabScale } = useScreenAnimation({ enableFAB: true });

  const [userName, setUserName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dates] = useState(generateDates(14));

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'firstCheckin' | 'allComplete' | 'streak'>('firstCheckin');
  const [celebrationHabit, setCelebrationHabit] = useState('');

  // Load user name
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const name = await AsyncStorage.getItem(USER_NAME_KEY);
        if (name) setUserName(name);
      } catch (error) {
        console.error('Error loading user name:', error);
      }
    };
    loadUserName();
  }, []);

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

  // Filter out archived habits
  const activeHabits = habits.filter((h) => !h.archived);
  const completedCount = activeHabits.filter((h) => h.completed).length;
  const totalCount = activeHabits.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddHabit = () => {
    navigation.navigate('AddHabitStep1');
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
          <Text
            style={[
              styles.profileInitials,
              {
                color: theme.colors.primary,
                fontFamily: theme.typography.fontFamilyDisplayBold,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {getInitials()}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
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
              <View
                style={[
                  styles.progressRingOuter,
                  {
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.progressRingInner,
                    {
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                >
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
              {/* Progress arc overlay */}
              <View
                style={[
                  styles.progressArc,
                  {
                    borderColor: theme.colors.primary,
                    borderRightColor: 'transparent',
                    borderBottomColor: progressPercentage > 50 ? theme.colors.primary : 'transparent',
                    transform: [{ rotate: `${(progressPercentage / 100) * 360}deg` }],
                  },
                ]}
              />
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
              Today's Habits
            </Text>
            {activeHabits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.habitCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: habit.completed ? theme.colors.primary : theme.colors.border,
                    borderWidth: habit.completed ? 2 : 1,
                  },
                ]}
                onPress={() =>
                  navigation.navigate('HabitDetail', {
                    habitId: habit.id,
                    habitData: habit,
                  })
                }
                activeOpacity={0.7}
              >
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: habit.completed ? theme.colors.primary : 'transparent',
                      borderColor: habit.completed ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => toggleHabitContext(habit.id)}
                  activeOpacity={0.7}
                >
                  {habit.completed && (
                    <Text style={[styles.checkmark, { color: theme.colors.white }]}>✓</Text>
                  )}
                </TouchableOpacity>
                <View style={styles.habitInfo}>
                  <Text
                    style={[
                      styles.habitName,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBodySemibold,
                        fontSize: theme.typography.fontSizeMD,
                        textDecorationLine: habit.completed ? 'line-through' : 'none',
                        opacity: habit.completed ? 0.7 : 1,
                      },
                    ]}
                  >
                    {habit.name}
                  </Text>
                  <View style={styles.habitMeta}>
                    <View
                      style={[
                        styles.categoryTag,
                        { backgroundColor: theme.colors.primary + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          {
                            color: theme.colors.primary,
                            fontFamily: theme.typography.fontFamilyBodyMedium,
                            fontSize: theme.typography.fontSizeXS,
                          },
                        ]}
                      >
                        {habit.category || 'General'}
                      </Text>
                    </View>
                    <View style={styles.streakContainer}>
                      <Text style={styles.streakEmoji}>🔥</Text>
                      <Text
                        style={[
                          styles.streakText,
                          {
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamilyBody,
                            fontSize: theme.typography.fontSizeXS,
                          },
                        ]}
                      >
                        {habit.streak} days
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        ) : (
          renderEmptyState()
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
    paddingBottom: 100,
  },
  datePickerContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
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
  },
  progressRingOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    // styles from theme
  },
  progressArc: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
  },
  habitsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    marginBottom: 6,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    // styles from theme
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  streakText: {
    // styles from theme
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
});

export default HomeScreen;
