import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import CelebrationModal from '@/components/CelebrationModal';

type HomeScreenNavigationProp = StackNavigationProp<any, 'Home'>;
type HomeScreenRouteProp = RouteProp<{ Home: { newHabit?: any } }, 'Home'>;

interface Habit {
  id: string;
  name: string;
  emoji: string;
  completed: boolean;
  streak: number;
  category: string;
  color: string;
  frequency: 'daily' | 'weekly';
  selectedDays: number[];
  reminderEnabled: boolean;
  reminderTime: string | null;
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const { theme } = useTheme();

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Morning Meditation',
      emoji: '🧘',
      completed: true,
      streak: 7,
      category: 'mindfulness',
      color: 'purple',
      frequency: 'daily',
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      reminderEnabled: true,
      reminderTime: '07:00',
    },
    {
      id: '2',
      name: 'Read 30 minutes',
      emoji: '📚',
      completed: false,
      streak: 12,
      category: 'learning',
      color: 'blue',
      frequency: 'daily',
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      reminderEnabled: false,
      reminderTime: null,
    },
    {
      id: '3',
      name: 'Drink 8 glasses of water',
      emoji: '💧',
      completed: true,
      streak: 5,
      category: 'health',
      color: 'teal',
      frequency: 'daily',
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      reminderEnabled: true,
      reminderTime: '09:00',
    },
    {
      id: '4',
      name: 'Exercise',
      emoji: '🏃',
      completed: false,
      streak: 3,
      category: 'fitness',
      color: 'green',
      frequency: 'weekly',
      selectedDays: [1, 3, 5],
      reminderEnabled: true,
      reminderTime: '18:00',
    },
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate FAB with delay
    Animated.spring(fabScale, {
      toValue: 1,
      delay: 300,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [fadeAnim, slideAnim, fabScale]);

  // Handle new habit creation
  useEffect(() => {
    if (route.params?.newHabit) {
      setHabits((prevHabits) => [route.params.newHabit, ...prevHabits]);
      // Clear the param to avoid re-adding on subsequent renders
      navigation.setParams({ newHabit: undefined });
    }
  }, [route.params?.newHabit]);

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleHabit = (id: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'firstCheckin' | 'allComplete' | 'streak'>('firstCheckin');
  const [celebrationHabit, setCelebrationHabit] = useState('');

  const handleAddHabit = () => {
    navigation.navigate('AddHabitStep1');
  };

  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
    const now = new Date();
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    return `${dayName}, ${monthName} ${date}`;
  };

  const renderProgressRing = () => {
    const size = 120;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
      <View style={styles.progressRingContainer}>
        <View style={styles.progressRing}>
          {/* Background Circle */}
          <View
            style={[
              styles.progressCircleBg,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: theme.colors.borderLight,
              },
            ]}
          />
          {/* Progress Circle - simplified for React Native without SVG */}
          <View style={styles.progressContent}>
            <Text
              style={[
                styles.progressPercentage,
                {
                  color: theme.colors.primary,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSize2XL,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              {Math.round(progressPercentage)}%
            </Text>
            <Text
              style={[
                styles.progressLabel,
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
        <Text
          style={[
            styles.progressSubtext,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamilyBody,
              fontSize: theme.typography.fontSizeSM,
            },
          ]}
        >
          {completedCount} of {totalCount} habits
        </Text>
      </View>
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
            fontFamily: theme.typography.fontFamilyDisplay,
            fontSize: theme.typography.fontSizeLG,
            fontWeight: theme.typography.fontWeightBold,
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
            lineHeight: theme.typography.lineHeightRelaxed,
          },
        ]}
      >
        Add your first habit to begin tracking your progress
      </Text>
      <TouchableOpacity
        style={[
          styles.emptyButton,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}
        onPress={handleAddHabit}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.emptyButtonText,
            {
              color: theme.colors.white,
              fontFamily: theme.typography.fontFamilyBody,
              fontSize: theme.typography.fontSizeMD,
              fontWeight: theme.typography.fontWeightSemibold,
            },
          ]}
        >
          Add Your First Habit
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
        <View>
          <Text
            style={[
              styles.greeting,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeSM,
              },
            ]}
          >
            Today
          </Text>
          <Text
            style={[
              styles.date,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplay,
                fontSize: theme.typography.fontSizeXL,
                fontWeight: theme.typography.fontWeightBold,
              },
            ]}
          >
            {getCurrentDate()}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: theme.colors.backgroundSecondary }]}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 24 }}>👤</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Ring */}
        {habits.length > 0 && (
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {renderProgressRing()}
          </Animated.View>
        )}

        {/* Habits List */}
        {habits.length > 0 ? (
          <Animated.View
            style={[
              styles.habitsSection,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight: theme.typography.fontWeightSemibold,
                },
              ]}
            >
              YOUR HABITS
            </Text>
            {habits.map((habit, index) => (
              <Animated.View
                key={habit.id}
                style={[
                  styles.habitCard,
                  {
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                    shadowColor: theme.shadows.shadowSM.shadowColor,
                    shadowOffset: theme.shadows.shadowSM.shadowOffset,
                    shadowOpacity: theme.shadows.shadowSM.shadowOpacity,
                    shadowRadius: theme.shadows.shadowSM.shadowRadius,
                    elevation: theme.shadows.shadowSM.elevation,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.habitInfo}
                  onPress={() =>
                    navigation.navigate('EditHabit', {
                      habitId: habit.id,
                      habitData: habit,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                  <View style={styles.habitDetails}>
                    <Text
                      style={[
                        styles.habitName,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeMD,
                          fontWeight: theme.typography.fontWeightMedium,
                        },
                      ]}
                    >
                      {habit.name}
                    </Text>
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
                        {habit.streak} day streak
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    {
                      borderColor: habit.completed
                        ? theme.colors.primary
                        : theme.colors.border,
                      backgroundColor: habit.completed
                        ? theme.colors.primary
                        : 'transparent',
                    },
                  ]}
                  onPress={() => toggleHabit(habit.id)}
                  activeOpacity={0.7}
                >
                  {habit.completed && (
                    <Text style={[styles.checkmark, { color: theme.colors.white }]}>✓</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
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
          {
            transform: [{ scale: fabScale }],
          },
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
    </View>
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
    // styles from theme
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  progressRingContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  progressRing: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressCircleBg: {
    position: 'absolute',
  },
  progressContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressPercentage: {
    marginBottom: 2,
  },
  progressLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressSubtext: {
    marginTop: 4,
  },
  habitsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  habitCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    marginBottom: 4,
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
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
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
