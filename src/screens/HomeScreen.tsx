import React, { useState, useEffect } from 'react';
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
import { useTheme } from '@/theme';
import { useHabits } from '@/contexts/HabitsContext';
import CelebrationModal from '@/components/CelebrationModal';
import { ProgressRing } from '@/components/ProgressRing';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

type HomeScreenNavigationProp = StackNavigationProp<any, 'Home'>;
type HomeScreenRouteProp = RouteProp<{ Home: { newHabit?: any } }, 'Home'>;

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const { theme } = useTheme();
  const { habits, addHabit, toggleHabit: toggleHabitContext } = useHabits();

  // Use custom animation hook to reduce boilerplate
  const { fadeAnim, slideAnim, fabScale } = useScreenAnimation({ enableFAB: true });

  // Handle new habit creation - optimized to avoid unnecessary re-renders
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
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
        bounces={true}
      >
        {/* Progress Ring */}
        {activeHabits.length > 0 && (
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <ProgressRing
              progress={progressPercentage}
              completedCount={completedCount}
              totalCount={totalCount}
            />
          </Animated.View>
        )}

        {/* Habits List */}
        {activeHabits.length > 0 ? (
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
            {activeHabits.map((habit, index) => (
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
                  onPress={() => toggleHabitContext(habit.id)}
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
    paddingTop: 20,
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
