import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useTheme } from '@app-core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { useUserStore } from '@/store/userStore';
import { useHabits } from '@/hooks/useHabits';
import { useSubscription, formatPlanName } from '@/context/SubscriptionContext';
import {
  Settings,
  Bell,
  Lock,
  Shield,
  Upload,
  HelpCircle,
  Star,
  Megaphone,
  Info,
  BarChart3,
  Check,
  Trophy,
  Flame,
  Crown,
  X,
  Cloud,
  ChevronRight,
  Palette,
  Sparkles,
  Database,
  ArrowRight,
  Plane
} from 'lucide-react-native';

import HabiCustomizationSheet from '@/components/HabiCustomizationSheet';
import { BadgeIcon } from '@app-core/achievements';
import { useBadgeStore } from '@/store/badgeStore';

type ProfileNavigationProp = StackNavigationProp<any, 'Profile'>;

const USER_NAME_KEY = '@habit_tracker_user_name';
const USER_EMAIL_KEY = '@habit_tracker_user_email';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { subscription } = useSubscription();
  const { profile, isVacationMode, toggleVacationMode, updateProfile } = useUserStore();

  const { habits } = useHabits();
  const userName = profile.name || '';
  const userEmail = profile.email || '';
  const [isHabiSheetVisible, setIsHabiSheetVisible] = useState(false);
  const isPremium = subscription.isPremium;
  const badges = useBadgeStore(state => state.badges);

  // Calculate real user-level stats from all habits
  const calculateUserStats = () => {
    const activeHabits = habits.filter(h => !h.archived);

    // Total habits
    const totalHabits = activeHabits.length;

    // Total completions across all habits
    const totalCompletions = activeHabits.reduce((total, habit) => {
      const habitCompletions = Object.values(habit.completions || {}).reduce((sum, completion) => {
        return sum + (completion?.completionCount || 0);
      }, 0);
      return total + habitCompletions;
    }, 0);

    // Longest streak across all habits
    const longestStreak = activeHabits.reduce((maxStreak, habit) => {
      const completions = habit.completions || {};
      const completionDates = Object.keys(completions).sort();

      let habitLongestStreak = 0;
      let currentStreakLength = 0;

      for (let i = 0; i < completionDates.length; i++) {
        const currentDate = new Date(completionDates[i]);
        const completion = completions[completionDates[i]];

        if (completion && completion.completionCount >= completion.targetCount) {
          if (i === 0) {
            currentStreakLength = 1;
          } else {
            const prevDate = new Date(completionDates[i - 1]);
            const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
              currentStreakLength++;
            } else {
              currentStreakLength = 1;
            }
          }
          habitLongestStreak = Math.max(habitLongestStreak, currentStreakLength);
        } else {
          currentStreakLength = 0;
        }
      }

      return Math.max(maxStreak, habitLongestStreak);
    }, 0);

    // Active streaks (habits with current streak > 0)
    const activeStreaks = activeHabits.filter(h => (h.streak || 0) > 0).length;

    // Member since (oldest habit creation date)
    const oldestHabit = activeHabits.reduce((oldest: Date | null, habit) => {
      if (!habit.createdAt) return oldest;
      const createdDate = new Date(habit.createdAt);
      return !oldest || createdDate < oldest ? createdDate : oldest;
    }, null);

    const memberSince = oldestHabit
      ? oldestHabit.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      totalHabits,
      totalCompletions,
      longestStreak,
      activeStreaks,
      memberSince,
    };
  };

  const stats = calculateUserStats();

  // Gamification Logic
  const calculateLevel = (completions: number) => {
    const level = Math.floor(completions / 10) + 1;
    const progress = (completions % 10) / 10;
    return { level, progress };
  };

  const { level, progress } = calculateLevel(stats.totalCompletions);

  const handleHelpSupport = async () => {
    const supportEmail = 'support@habittracker.app';
    const subject = 'Habit Tracker Support Request';
    const url = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Contact Support',
          `Email us at ${supportEmail}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open email app');
    }
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Habit Tracker',
      'Would you like to rate us on the App Store?',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Rate Now',
          onPress: async () => {
            // iOS: itms-apps://itunes.apple.com/app/idXXXXXXXXX?action=write-review
            // Android: market://details?id=com.yourapp.package
            const url = 'https://apps.apple.com';
            try {
              await Linking.openURL(url);
            } catch (error) {
              Alert.alert('Error', 'Could not open App Store');
            }
          },
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Habit Tracker - the best app for building better habits! Download it now: https://habittracker.app',
        title: 'Share Habit Tracker',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getInitials = () => {
    if (!userName) return '?';
    const names = userName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userName[0].toUpperCase();
  };



  const renderMenuItem = (
    IconComponent: React.ComponentType<any>,
    label: string,
    onPress: () => void,
    showBorder: boolean = true
  ) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: showBorder ? 1 : 0,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <IconComponent size={22} color={theme.colors.primary} strokeWidth={2} />
        </View>
        <Text
          style={[
            styles.menuLabel,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyBodyMedium,
              fontSize: theme.typography.fontSizeMD,
            },
          ]}
        >
          {label}
        </Text>
      </View>
      <ChevronRight size={20} color={theme.colors.textTertiary} strokeWidth={2} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
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
          {/* Immersive Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
              <View style={{ width: 44 }} />
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={[
                  styles.settingsButton,
                  {
                    backgroundColor: theme.colors.surface,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: theme.colors.border
                  }
                ]}
              >
                <Settings size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <View style={[styles.avatarContainer, { borderColor: theme.colors.primary }]}>
                <Text style={[styles.avatarText, { color: theme.colors.white }]}>{getInitials()}</Text>
                {isPremium && (
                  <View style={[styles.premiumBadge, { backgroundColor: '#FFD700' }]}>
                    <Crown size={12} color="#000" fill="#000" />
                  </View>
                )}
              </View>
              <Text style={[styles.userName, { color: theme.colors.text }]}>{userName || 'Guest User'}</Text>
              <Text style={[styles.memberSince, { color: theme.colors.textSecondary }]}>
                Member since {stats.memberSince}
              </Text>
            </View>

            {/* Level / XP Bar */}
            <View style={[styles.levelContainer, { backgroundColor: theme.colors.surface, borderRadius: theme.styles.cardBorderRadius }]}>
              <View style={styles.levelInfo}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>LVL {level}</Text>
                </View>
                <Text style={[styles.xpText, { color: theme.colors.textSecondary }]}>
                  {stats.totalCompletions % 10} / 10 XP to Level {level + 1}
                </Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: theme.colors.primary
                    }
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Bento Grid Stats */}
          <View style={styles.bentoGrid}>
            <View style={[styles.bentoCard, styles.bentoCardLarge, { backgroundColor: theme.colors.surface, borderRadius: theme.styles.cardBorderRadius }]}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
                <Flame size={24} color={theme.colors.primary} fill={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.bentoValue, { color: theme.colors.text }]}>{stats.longestStreak}</Text>
                <Text style={[styles.bentoLabel, { color: theme.colors.textSecondary }]}>Best Streak</Text>
              </View>
            </View>

            <View style={styles.bentoColumn}>
              <View style={[styles.bentoCard, styles.bentoCardSmall, { backgroundColor: theme.colors.surface, borderRadius: theme.styles.cardBorderRadius }]}>
                <Check size={20} color={theme.colors.success} style={{ marginBottom: 8 }} />
                <Text style={[styles.bentoValueSmall, { color: theme.colors.text }]}>{stats.totalCompletions}</Text>
                <Text style={[styles.bentoLabelSmall, { color: theme.colors.textSecondary }]}>Done</Text>
              </View>
              <View style={[styles.bentoCard, styles.bentoCardSmall, { backgroundColor: theme.colors.surface, borderRadius: theme.styles.cardBorderRadius }]}>
                <BarChart3 size={20} color={theme.colors.secondary} style={{ marginBottom: 8 }} />
                <Text style={[styles.bentoValueSmall, { color: theme.colors.text }]}>{stats.totalHabits}</Text>
                <Text style={[styles.bentoLabelSmall, { color: theme.colors.textSecondary }]}>Habits</Text>
              </View>
            </View>
          </View>

          {/* Badges Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Badges</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Badges')}
              style={{ marginHorizontal: 16 }}
            >
              <LinearGradient
                colors={['#D97706', '#B45309']} // Darker/Richer Gold/Amber
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 24,
                  padding: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  shadowColor: "#B45309",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Trophy size={20} color="#FFF" fill="#FFF" />
                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFF' }}>Hall of Fame</Text>
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500' }}>
                    {badges.filter(b => b.isUnlocked).length} Badges Unlocked
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', paddingRight: 10 }}>
                  {badges.filter(b => b.isUnlocked).length > 0 ? (
                    badges.filter(b => b.isUnlocked).slice(0, 3).map((badge, index) => (
                      <View key={badge.id} style={{ marginLeft: index > 0 ? -25 : 0, zIndex: 3 - index }}>
                        {/* Removed scale transform which might cause clipping issues if parent doesn't accommodate */}
                        <BadgeIcon
                          tier={badge.tier}
                          shape={badge.shape}
                          icon={badge.icon}
                          size={50}
                          isLocked={false}
                        />
                      </View>
                    ))
                  ) : (
                    <View style={{ opacity: 0.5 }}>
                      <Trophy size={40} color="#FFF" />
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Premium Banner */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate(isPremium ? 'Subscription' : 'Paywall')}
          >
            <LinearGradient
              colors={isPremium ? ['#F59E0B', '#D97706'] : [theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.premiumBanner, { borderRadius: 100, overflow: 'hidden' }]}
            >
              <View style={styles.premiumContent}>
                <View style={[styles.premiumIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Crown size={24} color="#FFF" fill={isPremium ? "#FFF" : "none"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumTitle}>
                    {isPremium ? 'Premium Member' : 'Upgrade to Premium'}
                  </Text>
                  <Text style={styles.premiumSubtitle}>
                    {isPremium ? 'You have access to all features' : 'Unlock unlimited habits & AI insights'}
                  </Text>
                </View>
                <ChevronRight size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Premium Features Carousel */}
          <View style={styles.carouselContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, marginBottom: 16, paddingHorizontal: 16 }]}>PREMIUM FEATURES</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
            >
              {/* Habi Customization Card */}
              <TouchableOpacity
                style={[styles.featureCard, { backgroundColor: theme.colors.surface, borderRadius: theme.styles.cardBorderRadius }]}
                onPress={() => setIsHabiSheetVisible(true)}
              >
                <LinearGradient
                  colors={['#EC4899', '#DB2777']}
                  style={styles.featureCardGradient}
                >
                  <Sparkles size={24} color="#FFF" />
                </LinearGradient>
                <View style={styles.featureCardContent}>
                  <Text style={[styles.featureCardTitle, { color: theme.colors.text }]}>Habi Style</Text>
                  <Text style={[styles.featureCardSubtitle, { color: theme.colors.textSecondary }]}>Customize your companion</Text>
                </View>
              </TouchableOpacity>

              {/* Themes Card */}
              <TouchableOpacity
                style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate('ThemePicker')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.featureCardGradient}
                >
                  <Palette size={24} color="#FFF" />
                </LinearGradient>
                <View style={styles.featureCardContent}>
                  <Text style={[styles.featureCardTitle, { color: theme.colors.text }]}>Themes</Text>
                  <Text style={[styles.featureCardSubtitle, { color: theme.colors.textSecondary }]}>Paint your journey</Text>
                </View>
              </TouchableOpacity>

              {/* Data Export Card */}
              <TouchableOpacity
                style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate('ExportData')}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.featureCardGradient}
                >
                  <Database size={24} color="#FFF" />
                </LinearGradient>
                <View style={styles.featureCardContent}>
                  <Text style={[styles.featureCardTitle, { color: theme.colors.text }]}>Data Freedom</Text>
                  <Text style={[styles.featureCardSubtitle, { color: theme.colors.textSecondary }]}>Your data, your rules</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Menu Items */}
          {/* PERSONALIZATION section removed - mascot disabled */}
          {/* Menu Items - Simplified */}
          <View style={styles.menuContainer}>
            {/* Support Section */}
            <Text style={[styles.menuSectionTitle, { color: theme.colors.textSecondary }]}>SUPPORT</Text>
            <View style={[styles.menuGroup, { backgroundColor: theme.colors.surface }]}>
              {renderMenuItem(HelpCircle, 'Help & Support', handleHelpSupport, true)}
              {renderMenuItem(Star, 'Rate the App', handleRateApp, true)}
              {renderMenuItem(Megaphone, 'Share App', handleShareApp, true)}

              {/* Vacation Mode Toggle */}
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    borderBottomColor: theme.colors.border,
                    borderBottomWidth: 0,
                  },
                ]}
                onPress={toggleVacationMode}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: isVacationMode ? theme.colors.primary + '20' : 'transparent' }]}>
                    <Plane size={22} color={isVacationMode ? theme.colors.primary : theme.colors.textTertiary} strokeWidth={2} />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.menuLabel,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBodyMedium,
                          fontSize: theme.typography.fontSizeMD,
                        },
                      ]}
                    >
                      Vacation Mode
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                      {isVacationMode ? 'Active - Streaks frozen' : 'Pause streaks'}
                    </Text>
                  </View>
                </View>
                <View style={{
                  width: 40,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: isVacationMode ? theme.colors.primary : theme.colors.border,
                  justifyContent: 'center',
                  alignItems: isVacationMode ? 'flex-end' : 'flex-start',
                  paddingHorizontal: 2,
                }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' }} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Prompt (for anonymous users) */}
          {!userEmail && (
            <View
              style={[
                styles.signUpPrompt,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.signUpIconContainer}>
                <Cloud size={40} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <Text
                style={[
                  styles.signUpTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                Sign up to sync your data
              </Text>
              <Text
                style={[
                  styles.signUpSubtitle,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                Keep your habits safe and access them anywhere
              </Text>
              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  { backgroundColor: theme.colors.primary, borderRadius: theme.styles.buttonBorderRadius },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.signUpButtonText,
                    {
                      color: theme.colors.white,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Log Out Button */}
          {userEmail && (
            <TouchableOpacity
              style={[
                styles.logOutButton,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                  borderRadius: theme.styles.buttonBorderRadius,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.logOutText,
                  {
                    color: theme.colors.error,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                Log Out
              </Text>
            </TouchableOpacity>
          )}

          <Text
            style={[
              styles.versionText,
              {
                color: theme.colors.textTertiary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            Version 1.0.0
          </Text>
        </Animated.View>
      </ScrollView>

      <HabiCustomizationSheet
        visible={isHabiSheetVisible}
        onClose={() => setIsHabiSheetVisible(false)}
      />
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    marginBottom: 12,
    position: 'relative',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
  },
  levelContainer: {
    padding: 16,
    borderRadius: 16,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  bentoCard: {
    borderRadius: 20,
    padding: 16,
  },
  bentoCardLarge: {
    flex: 1,
    justifyContent: 'space-between',
    aspectRatio: 0.85,
  },
  bentoColumn: {
    flex: 1,
    gap: 12,
  },
  bentoCardSmall: {
    flex: 1,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  bentoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  bentoValueSmall: {
    fontSize: 20,
    fontWeight: '700',
  },
  bentoLabelSmall: {
    fontSize: 12,
    fontWeight: '500',
  },
  premiumBanner: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  premiumIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  premiumSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  menuContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuGroup: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
  },
  freeHeader: {
    marginBottom: 16,
  },
  freePlanTitle: {
    marginBottom: 4,
  },
  habitCount: {},
  premiumFeatures: {
    marginBottom: 16,
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
  },
  upgradeButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  upgradeButtonText: {},

  signUpPrompt: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  signUpIconContainer: {
    marginBottom: 12,
  },
  signUpTitle: {
    marginBottom: 4,
    textAlign: 'center',
  },
  signUpSubtitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  signUpButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signUpButtonText: {},
  logOutButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  logOutText: {},
  carouselContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 0, // Removed bottom margin as it's handled by sectionHeader
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  featureCard: {
    width: 160,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureCardGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureCardContent: {
    alignItems: 'center',
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureCardSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  versionText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgesScrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  badgePreviewItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBadges: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    marginLeft: 16,
  },
  emptyBadgesText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ProfileScreen;
