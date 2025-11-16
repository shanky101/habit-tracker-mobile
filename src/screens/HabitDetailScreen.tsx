import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';

type HabitDetailRouteProp = RouteProp<
  { HabitDetail: { habitId: string; habitData: any } },
  'HabitDetail'
>;

const { width } = Dimensions.get('window');
const CALENDAR_CELL_SIZE = (width - 48) / 12; // 12 months

const HabitDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<HabitDetailRouteProp>();
  const { theme } = useTheme();

  const { habitData } = route.params;

  // Mock data for stats - in production, this would come from stored history
  const stats = {
    currentStreak: habitData.streak || 0,
    longestStreak: habitData.streak + 10 || 24,
    totalCompletions: Math.floor(habitData.streak * 1.5) || 42,
    completionRate: 86,
  };

  // Generate mock calendar data for the past 90 days
  const generateCalendarData = () => {
    const days = [];
    const today = new Date();

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Mock completion pattern - 80% completion rate
      // NOTE: Math.random() is only used here for UI mock data, not security-sensitive operations
      const completed = Math.random() > 0.2;

      days.push({
        date: date.toISOString().split('T')[0],
        completed,
        hasNote: completed && Math.random() > 0.8,
      });
    }

    return days;
  };

  const calendarData = generateCalendarData();

  // Generate recent activity (last 10 days)
  const recentActivity = calendarData.slice(-10).reverse().map((day) => ({
    ...day,
    time: '9:15 AM',
  }));

  const handleEdit = () => {
    navigation.navigate('EditHabit', {
      habitId: habitData.id,
      habitData,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      health: '#EF4444',
      fitness: '#22C55E',
      productivity: '#3B82F6',
      mindfulness: '#A855F7',
      learning: '#F59E0B',
      social: '#EC4899',
      finance: '#10B981',
      creativity: '#F97316',
    };
    return colors[category.toLowerCase()] || theme.colors.primary;
  };

  const renderStatCard = (
    icon: string,
    value: string | number,
    label: string,
    index: number
  ) => (
    <View
      key={index}
      style={[
        styles.statCard,
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
      <Text style={styles.statIcon}>{icon}</Text>
      <Text
        style={[
          styles.statValue,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyDisplay,
            fontSize: 32,
            fontWeight: theme.typography.fontWeightBold,
          },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeXS,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  const renderCalendarHeatmap = () => {
    // Group by weeks
    const weeks: any[][] = [];
    let currentWeek: any[] = [];

    calendarData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === calendarData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return (
      <View style={styles.calendarContainer}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyBody,
              fontSize: theme.typography.fontSizeMD,
              fontWeight: theme.typography.fontWeightSemibold,
            },
          ]}
        >
          Activity Heatmap (Last 90 Days)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.calendarScroll}
        >
          <View style={styles.calendarGrid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.calendarWeek}>
                {week.map((day, dayIndex) => {
                  const isToday =
                    day.date === new Date().toISOString().split('T')[0];

                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.calendarDay,
                        {
                          backgroundColor: day.completed
                            ? day.hasNote
                              ? '#22C55E'
                              : '#86EFAC'
                            : theme.colors.border,
                          borderColor: isToday ? theme.colors.primary : 'transparent',
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.calendarLegend}>
          <Text
            style={[
              styles.legendText,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            Less
          </Text>
          <View style={[styles.legendBox, { backgroundColor: theme.colors.border }]} />
          <View style={[styles.legendBox, { backgroundColor: '#86EFAC' }]} />
          <View style={[styles.legendBox, { backgroundColor: '#22C55E' }]} />
          <Text
            style={[
              styles.legendText,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            More
          </Text>
        </View>
      </View>
    );
  };

  const renderRecentActivity = () => (
    <View style={styles.activityContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeMD,
            fontWeight: theme.typography.fontWeightSemibold,
          },
        ]}
      >
        Recent Activity
      </Text>
      {recentActivity.map((activity, index) => {
        const date = new Date(activity.date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateLabel = activity.date;
        if (activity.date === today.toISOString().split('T')[0]) {
          dateLabel = 'Today';
        } else if (activity.date === yesterday.toISOString().split('T')[0]) {
          dateLabel = 'Yesterday';
        } else {
          const daysAgo = Math.floor(
            (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
          );
          dateLabel = `${daysAgo} days ago`;
        }

        return (
          <View
            key={index}
            style={[
              styles.activityItem,
              {
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.activityIcon,
                {
                  backgroundColor: activity.completed
                    ? '#22C55E20'
                    : theme.colors.border,
                },
              ]}
            >
              <Text style={styles.activityIconText}>
                {activity.completed ? '✓' : '✕'}
              </Text>
            </View>
            <View style={styles.activityInfo}>
              <Text
                style={[
                  styles.activityDate,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                    fontWeight: theme.typography.fontWeightMedium,
                  },
                ]}
              >
                {dateLabel}
              </Text>
              <Text
                style={[
                  styles.activityTime,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                {activity.completed ? activity.time : 'Missed'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
        <View style={styles.headerCenter}>
          <View style={styles.habitHeader}>
            <Text style={styles.habitEmoji}>{habitData.emoji}</Text>
            <View>
              <Text
                style={[
                  styles.habitName,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplay,
                    fontSize: theme.typography.fontSizeLG,
                    fontWeight: theme.typography.fontWeightBold,
                  },
                ]}
              >
                {habitData.name}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: `${getCategoryColor(habitData.category)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: getCategoryColor(habitData.category),
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                      fontWeight: theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  {habitData.category.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={styles.statsContainer}
        >
          {renderStatCard('🔥', stats.currentStreak, 'Current Streak', 0)}
          {renderStatCard('🏆', stats.longestStreak, 'Longest Streak', 1)}
          {renderStatCard('✓', stats.totalCompletions, 'Total Completions', 2)}
          {renderStatCard('📈', `${stats.completionRate}%`, 'Completion Rate', 3)}
        </ScrollView>

        {/* Calendar Heatmap */}
        {renderCalendarHeatmap()}

        {/* Recent Activity */}
        {renderRecentActivity()}

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.actionEmoji}>📤</Text>
            <Text
              style={[
                styles.actionText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight: theme.typography.fontWeightMedium,
                },
              ]}
            >
              Export Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.actionEmoji}>🎉</Text>
            <Text
              style={[
                styles.actionText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight: theme.typography.fontWeightMedium,
                },
              ]}
            >
              Share Streak
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  habitName: {
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  statsScroll: {
    marginTop: 16,
  },
  statsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  calendarContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  calendarScroll: {
    marginBottom: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    gap: 3,
  },
  calendarWeek: {
    gap: 3,
  },
  calendarDay: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 2,
  },
  calendarLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    marginHorizontal: 4,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  activityContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityDate: {
    marginBottom: 2,
  },
  activityTime: {},
  actionsContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {},
});

export default HabitDetailScreen;
