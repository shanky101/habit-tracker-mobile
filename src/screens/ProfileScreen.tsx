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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { useSubscription, formatPlanName } from '@/context/SubscriptionContext';

type ProfileNavigationProp = StackNavigationProp<any, 'Profile'>;

const USER_NAME_KEY = '@habit_tracker_user_name';
const USER_EMAIL_KEY = '@habit_tracker_user_email';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { subscription } = useSubscription();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const isPremium = subscription.isPremium;

  // Mock stats data
  const stats = {
    totalHabits: 5,
    totalCompletions: 142,
    longestStreak: 24,
    activeStreaks: 3,
    memberSince: 'October 2024',
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem(USER_NAME_KEY);
      const email = await AsyncStorage.getItem(USER_EMAIL_KEY);
      if (name) setUserName(name);
      if (email) setUserEmail(email);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

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

  const renderStatCard = (icon: string, value: string | number, label: string) => (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text
        style={[
          styles.statValue,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyDisplayBold,
            fontSize: theme.typography.fontSizeXL,
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

  const renderMenuItem = (
    icon: string,
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
        <Text style={styles.menuIcon}>{icon}</Text>
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
      <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
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
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primaryLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  {
                    color: theme.colors.white,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: 32,
                  },
                ]}
              >
                {getInitials()}
              </Text>
              {isPremium && (
                <View
                  style={[
                    styles.premiumBadge,
                    { backgroundColor: theme.colors.accent1 },
                  ]}
                >
                  <Text style={styles.premiumBadgeText}>PRO</Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.userName,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSize2XL,
                },
              ]}
            >
              {userName || 'Guest User'}
            </Text>

            {userEmail ? (
              <Text
                style={[
                  styles.userEmail,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                {userEmail}
              </Text>
            ) : (
              <Text
                style={[
                  styles.userEmail,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                Member since {stats.memberSince}
              </Text>
            )}
          </View>

          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScroll}
            >
              {renderStatCard('📊', stats.totalHabits, 'Habits')}
              {renderStatCard('✓', stats.totalCompletions, 'Completions')}
              {renderStatCard('🏆', stats.longestStreak, 'Best Streak')}
              {renderStatCard('🔥', stats.activeStreaks, 'Active')}
            </ScrollView>
          </View>

          {/* Subscription Status */}
          <View
            style={[
              styles.subscriptionCard,
              {
                backgroundColor: isPremium ? theme.colors.primaryLight + '20' : theme.colors.backgroundSecondary,
                borderColor: isPremium ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            {isPremium ? (
              <>
                <View style={styles.subscriptionHeader}>
                  <Text style={styles.subscriptionIcon}>👑</Text>
                  <View>
                    <Text
                      style={[
                        styles.subscriptionTitle,
                        {
                          color: theme.colors.primary,
                          fontFamily: theme.typography.fontFamilyDisplayBold,
                          fontSize: theme.typography.fontSizeLG,
                        },
                      ]}
                    >
                      Premium Member
                    </Text>
                    <Text
                      style={[
                        styles.subscriptionSubtitle,
                        {
                          color: theme.colors.textSecondary,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeXS,
                        },
                      ]}
                    >
                      {subscription.plan === 'lifetime'
                        ? 'Lifetime access'
                        : subscription.expiresAt
                        ? `Renews: ${new Date(subscription.expiresAt).toLocaleDateString()}`
                        : formatPlanName(subscription.plan)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.manageButton, { borderColor: theme.colors.primary }]}
                  onPress={() => navigation.navigate('Subscription')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.manageButtonText,
                      {
                        color: theme.colors.primary,
                        fontFamily: theme.typography.fontFamilyBodySemibold,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    Manage Subscription
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.freeHeader}>
                  <Text
                    style={[
                      styles.freePlanTitle,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyDisplayBold,
                        fontSize: theme.typography.fontSizeLG,
                      },
                    ]}
                  >
                    Free Plan
                  </Text>
                  <Text
                    style={[
                      styles.habitCount,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {stats.totalHabits}/5 habits used
                  </Text>
                </View>

                <View style={styles.premiumFeatures}>
                  <View style={styles.featureRow}>
                    <Text style={[styles.featureX, { color: theme.colors.error }]}>✕</Text>
                    <Text style={[styles.featureText, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamilyBody }]}>
                      Cloud sync
                    </Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Text style={[styles.featureX, { color: theme.colors.error }]}>✕</Text>
                    <Text style={[styles.featureText, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamilyBody }]}>
                      Unlimited habits
                    </Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Text style={[styles.featureX, { color: theme.colors.error }]}>✕</Text>
                    <Text style={[styles.featureText, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamilyBody }]}>
                      AI insights
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.upgradeButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => navigation.navigate('Paywall')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.upgradeButtonText,
                      {
                        color: theme.colors.white,
                        fontFamily: theme.typography.fontFamilyBodySemibold,
                        fontSize: theme.typography.fontSizeMD,
                      },
                    ]}
                  >
                    Upgrade to Premium
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Menu Items */}
          <View
            style={[
              styles.menuSection,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.menuSectionTitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              ACCOUNT
            </Text>
            {renderMenuItem('⚙️', 'Settings', () => navigation.navigate('Settings'))}
            {renderMenuItem('🔔', 'Notifications', () => navigation.navigate('NotificationsSettings'))}
            {renderMenuItem('🔒', 'Account', () => navigation.navigate('AccountSettings'))}
            {renderMenuItem('🛡️', 'Data & Privacy', () => navigation.navigate('DataPrivacy'))}
            {renderMenuItem('📤', 'Export Data', () => navigation.navigate('ExportData'), false)}
          </View>

          <View
            style={[
              styles.menuSection,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.menuSectionTitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              SUPPORT
            </Text>
            {renderMenuItem('❓', 'Help & Support', handleHelpSupport)}
            {renderMenuItem('⭐', 'Rate the App', handleRateApp)}
            {renderMenuItem('📢', 'Share App', handleShareApp)}
            {renderMenuItem('ℹ️', 'About', () => navigation.navigate('About'), false)}
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
              <Text style={styles.signUpIcon}>☁️</Text>
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
                  { backgroundColor: theme.colors.primary },
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
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    marginBottom: 16,
    position: 'relative',
  },
  avatarText: {},
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userName: {
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsScroll: {
    gap: 12,
  },
  statCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
  subscriptionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  subscriptionTitle: {},
  subscriptionSubtitle: {
    marginTop: 2,
  },
  manageButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  manageButtonText: {},
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
  },
  featureX: {
    fontSize: 14,
    marginRight: 8,
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
  menuSection: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuSectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {},
  chevron: {
    fontSize: 20,
  },
  signUpPrompt: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  signUpIcon: {
    fontSize: 40,
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
  versionText: {
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default ProfileScreen;
