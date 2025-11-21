import React, { useState } from 'react';
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
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { Habit } from '@/contexts/HabitsContext';

type HabitDeepDiveNavigationProp = StackNavigationProp<any, 'HabitDeepDive'>;
type HabitDeepDiveRouteProp = RouteProp<
  { HabitDeepDive: { habitId: string; habitData: Habit } },
  'HabitDeepDive'
>;

const { width } = Dimensions.get('window');

const DATE_RANGES = ['7 days', '30 days', '90 days', 'All time'];
const HOURS = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];

const HabitDeepDiveScreen: React.FC = () => {
  const navigation = useNavigation<HabitDeepDiveNavigationProp>();
  const route = useRoute<HabitDeepDiveRouteProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const { habitData } = route.params;
  const [selectedRange, setSelectedRange] = useState('30 days');

  // Mock data
  const currentStreak = habitData.streak;
  const longestStreak = Math.max(currentStreak + 24, 58);
  const totalCompletions = 142;
  const completionRate = 86;

  // Mock completion by hour data
  const completionByHour = [
    { hour: '6am', value: 15 },
    { hour: '9am', value: 85 },
    { hour: '12pm', value: 45 },
    { hour: '3pm', value: 25 },
    { hour: '6pm', value: 55 },
    { hour: '9pm', value: 35 },
  ];
  const maxHourValue = Math.max(...completionByHour.map((h) => h.value));

  // Mock day of week breakdown
  const dayOfWeekData = [
    { day: 'Mon', value: 95 },
    { day: 'Tue', value: 90 },
    { day: 'Wed', value: 82 },
    { day: 'Thu', value: 88 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 65 },
    { day: 'Sun', value: 60 },
  ];

  // Mock milestones
  const milestones = [
    { date: 'Oct 15, 2024', event: 'Habit Created', icon: '🌱' },
    { date: 'Oct 22, 2024', event: '7 Day Streak', icon: '🔥' },
    { date: 'Nov 15, 2024', event: '30 Day Streak', icon: '🏆' },
    { date: 'Nov 20, 2024', event: '100th Completion', icon: '💯' },
  ];

  // Mock patterns
  const patterns = [
    "You complete this habit most on weekday mornings",
    "Your success rate is higher on Mondays (95%)",
    "You tend to skip this habit on weekends",
  ];

  // Mock recent notes
  const recentNotes = [
    { date: 'Today', note: 'Felt really focused today!', mood: '😊' },
    { date: 'Yesterday', note: 'Quick session but effective', mood: '🙂' },
    { date: '3 days ago', note: 'Struggled a bit but pushed through', mood: '💪' },
  ];

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.habitHeader}>
            <Text style={styles.habitEmoji}>{habitData.emoji}</Text>
            <View style={styles.habitTitleContainer}>
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
                numberOfLines={1}
              >
                {habitData.name}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: `${theme.colors.primary}20` },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {habitData.category}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Range Selector */}
        <Animated.View
          style={[
            styles.dateRangeContainer,
            { opacity: fadeAnim },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DATE_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.dateRangeButton,
                  {
                    backgroundColor:
                      selectedRange === range
                        ? theme.colors.primary
                        : theme.colors.backgroundSecondary,
                    borderColor:
                      selectedRange === range ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setSelectedRange(range)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateRangeText,
                    {
                      color:
                        selectedRange === range ? theme.colors.white : theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                      fontWeight:
                        selectedRange === range
                          ? theme.typography.fontWeightSemibold
                          : theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Hero Stats */}
        <Animated.View
          style={[
            styles.heroStats,
            { opacity: fadeAnim },
          ]}
        >
          {/* Current Streak */}
          <View
            style={[
              styles.heroCard,
              styles.heroCardLarge,
              {
                backgroundColor: `${theme.colors.primary}15`,
                borderColor: `${theme.colors.primary}30`,
              },
            ]}
          >
            <Text style={styles.heroIcon}>🔥</Text>
            <Text
              style={[
                styles.heroValue,
                {
                  color: theme.colors.primary,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: 48,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              {currentStreak}
            </Text>
            <Text
              style={[
                styles.heroLabel,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight: theme.typography.fontWeightMedium,
                },
              ]}
            >
              Current Streak
            </Text>
          </View>

          <View style={styles.heroSmallCards}>
            {/* Longest Streak */}
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.heroIcon}>🏆</Text>
              <Text
                style={[
                  styles.heroValueSmall,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplay,
                    fontSize: theme.typography.fontSize2XL,
                    fontWeight: theme.typography.fontWeightBold,
                  },
                ]}
              >
                {longestStreak}
              </Text>
              <Text
                style={[
                  styles.heroLabelSmall,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Longest Streak
              </Text>
            </View>

            {/* Total Completions */}
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.heroIcon}>✓</Text>
              <Text
                style={[
                  styles.heroValueSmall,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplay,
                    fontSize: theme.typography.fontSize2XL,
                    fontWeight: theme.typography.fontWeightBold,
                  },
                ]}
              >
                {totalCompletions}
              </Text>
              <Text
                style={[
                  styles.heroLabelSmall,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                All Time
              </Text>
            </View>

            {/* Completion Rate */}
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.heroIcon}>📈</Text>
              <Text
                style={[
                  styles.heroValueSmall,
                  {
                    color: theme.colors.success,
                    fontFamily: theme.typography.fontFamilyDisplay,
                    fontSize: theme.typography.fontSize2XL,
                    fontWeight: theme.typography.fontWeightBold,
                  },
                ]}
              >
                {completionRate}%
              </Text>
              <Text
                style={[
                  styles.heroLabelSmall,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Last 30 Days
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Completion by Hour */}
        <Animated.View
          style={[
            styles.chartSection,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
            },
          ]}
        >
          <Text
            style={[
              styles.chartTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeMD,
                fontWeight: theme.typography.fontWeightSemibold,
              },
            ]}
          >
            Completion by Time of Day
          </Text>
          <View style={styles.barChart}>
            {completionByHour.map((item) => (
              <View key={item.hour} style={styles.barContainer}>
                <Text
                  style={[
                    styles.barValue,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: 10,
                    },
                  ]}
                >
                  {item.value}%
                </Text>
                <View
                  style={[
                    styles.barBackground,
                    { backgroundColor: theme.colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor:
                          item.value === maxHourValue
                            ? theme.colors.primary
                            : `${theme.colors.primary}60`,
                        height: `${item.value}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    {
                      color:
                        item.value === maxHourValue
                          ? theme.colors.primary
                          : theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: 10,
                      fontWeight:
                        item.value === maxHourValue
                          ? theme.typography.fontWeightSemibold
                          : theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  {item.hour}
                </Text>
              </View>
            ))}
          </View>
          <View
            style={[
              styles.insightBadge,
              { backgroundColor: `${theme.colors.primary}15` },
            ]}
          >
            <Text style={styles.insightEmoji}>💡</Text>
            <Text
              style={[
                styles.insightText,
                {
                  color: theme.colors.primary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              You usually complete this at 9 AM
            </Text>
          </View>
        </Animated.View>

        {/* Pattern Recognition */}
        <Animated.View
          style={[
            styles.patternsSection,
            {
              backgroundColor: `${theme.colors.primary}10`,
              borderColor: `${theme.colors.primary}30`,
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✨</Text>
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
              AI Pattern Recognition
            </Text>
          </View>
          {patterns.map((pattern, index) => (
            <View key={index} style={styles.patternItem}>
              <Text style={styles.patternBullet}>•</Text>
              <Text
                style={[
                  styles.patternText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                {pattern}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Milestones Timeline */}
        <Animated.View
          style={[
            styles.milestonesSection,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
            },
          ]}
        >
          <Text
            style={[
              styles.chartTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeMD,
                fontWeight: theme.typography.fontWeightSemibold,
              },
            ]}
          >
            Milestones
          </Text>
          <View style={styles.timeline}>
            {milestones.map((milestone, index) => (
              <View key={index} style={styles.milestoneItem}>
                <View
                  style={[
                    styles.milestoneIcon,
                    { backgroundColor: `${theme.colors.primary}20` },
                  ]}
                >
                  <Text style={styles.milestoneEmoji}>{milestone.icon}</Text>
                </View>
                <View
                  style={[
                    styles.milestoneLine,
                    {
                      backgroundColor: theme.colors.border,
                      display: index === milestones.length - 1 ? 'none' : 'flex',
                    },
                  ]}
                />
                <View style={styles.milestoneContent}>
                  <Text
                    style={[
                      styles.milestoneEvent,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                        fontWeight: theme.typography.fontWeightMedium,
                      },
                    ]}
                  >
                    {milestone.event}
                  </Text>
                  <Text
                    style={[
                      styles.milestoneDate,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    {milestone.date}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Notes */}
        <Animated.View
          style={[
            styles.notesSection,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.notesSectionHeader}>
            <Text
              style={[
                styles.chartTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                  fontWeight: theme.typography.fontWeightSemibold,
                },
              ]}
            >
              Recent Notes
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text
                style={[
                  styles.viewAllText,
                  {
                    color: theme.colors.primary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {recentNotes.map((note, index) => (
            <View
              key={index}
              style={[
                styles.noteItem,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <View style={styles.noteHeader}>
                <Text style={styles.noteMood}>{note.mood}</Text>
                <Text
                  style={[
                    styles.noteDate,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {note.date}
                </Text>
              </View>
              <Text
                style={[
                  styles.noteText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                {note.note}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Export Actions */}
        <View style={styles.exportActions}>
          <TouchableOpacity
            style={[
              styles.exportButton,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            onPress={() => navigation.navigate('ExportData')}
            activeOpacity={0.7}
          >
            <Text style={styles.exportIcon}>📤</Text>
            <Text
              style={[
                styles.exportText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              Export Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.exportButton,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            onPress={() => console.log('Share streak')}
            activeOpacity={0.7}
          >
            <Text style={styles.exportIcon}>📣</Text>
            <Text
              style={[
                styles.exportText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  habitTitleContainer: {
    flex: 1,
  },
  habitName: {},
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  categoryText: {
    textTransform: 'capitalize',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  dateRangeContainer: {
    marginBottom: 24,
  },
  dateRangeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  dateRangeText: {},
  heroStats: {
    marginBottom: 24,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  heroCardLarge: {
    marginBottom: 12,
  },
  heroSmallCards: {
    flexDirection: 'row',
    gap: 8,
  },
  heroIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  heroValue: {},
  heroValueSmall: {},
  heroLabel: {},
  heroLabelSmall: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  chartSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  chartTitle: {
    marginBottom: 20,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 130,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    marginBottom: 6,
  },
  barBackground: {
    flex: 1,
    width: 24,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  barLabel: {
    marginTop: 6,
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  insightEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  insightText: {},
  patternsSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {},
  patternItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  patternBullet: {
    fontSize: 16,
    marginRight: 10,
    color: '#6B7280',
  },
  patternText: {
    flex: 1,
    lineHeight: 22,
  },
  milestonesSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  timeline: {},
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  milestoneEmoji: {
    fontSize: 20,
  },
  milestoneLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 32,
  },
  milestoneContent: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 4,
  },
  milestoneEvent: {},
  milestoneDate: {
    marginTop: 2,
  },
  notesSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {},
  noteItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteMood: {
    fontSize: 18,
    marginRight: 8,
  },
  noteDate: {},
  noteText: {
    lineHeight: 22,
  },
  exportActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  exportIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  exportText: {},
});

export default HabitDeepDiveScreen;
