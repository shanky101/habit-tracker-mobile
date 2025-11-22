import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

type AccountSettingsNavigationProp = StackNavigationProp<any, 'AccountSettings'>;

const USER_EMAIL_KEY = '@habit_tracker_user_email';

const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation<AccountSettingsNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState('2 minutes ago');

  // Connected accounts state
  const [connectedApple, setConnectedApple] = useState(false);
  const [connectedGoogle, setConnectedGoogle] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const email = await AsyncStorage.getItem(USER_EMAIL_KEY);
      if (email) {
        setUserEmail(email);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced('Just now');
    }, 2000);
  };

  const handleChangeEmail = () => {
    Alert.alert(
      'Change Email',
      'You will need to verify your new email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {} },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'You will need to enter your current password.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {} },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your habits and history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All your data will be lost forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Everything',
                  style: 'destructive',
                  onPress: () => {},
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Enter your password to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: () => {},
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderActionRow = (
    icon: string,
    label: string,
    value: string | null,
    onPress: () => void,
    showBorder: boolean = true
  ) => (
    <TouchableOpacity
      style={[
        styles.actionRow,
        {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: showBorder ? 1 : 0,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionInfo}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <View style={styles.actionText}>
          <Text
            style={[
              styles.actionLabel,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBodyMedium,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {label}
          </Text>
          {value && (
            <Text
              style={[
                styles.actionValue,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              {value}
            </Text>
          )}
        </View>
      </View>
      <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text>
    </TouchableOpacity>
  );

  const renderConnectedAccount = (
    icon: string,
    provider: string,
    connected: boolean,
    onToggle: () => void,
    showBorder: boolean = true
  ) => (
    <View
      style={[
        styles.connectedRow,
        {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: showBorder ? 1 : 0,
        },
      ]}
    >
      <View style={styles.connectedInfo}>
        <Text style={styles.connectedIcon}>{icon}</Text>
        <Text
          style={[
            styles.connectedLabel,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyBodyMedium,
              fontSize: theme.typography.fontSizeMD,
            },
          ]}
        >
          {provider}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.connectButton,
          {
            backgroundColor: connected
              ? theme.colors.backgroundSecondary
              : theme.colors.primary,
            borderColor: connected ? theme.colors.border : theme.colors.primary,
          },
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.connectButtonText,
            {
              color: connected ? theme.colors.textSecondary : theme.colors.white,
              fontFamily: theme.typography.fontFamilyBodySemibold,
              fontSize: theme.typography.fontSizeXS,
            },
          ]}
        >
          {connected ? 'Disconnect' : 'Connect'}
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
            borderBottomColor: theme.colors.border,
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplayBold,
              fontSize: theme.typography.fontSizeXL,
            },
          ]}
        >
          Account
        </Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Anonymous User Prompt */}
          {!isLoggedIn && (
            <View
              style={[
                styles.anonymousCard,
                {
                  backgroundColor: theme.colors.primaryLight + '20',
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Text style={styles.anonymousIcon}>☁️</Text>
              <Text
                style={[
                  styles.anonymousTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: theme.typography.fontSizeLG,
                  },
                ]}
              >
                You're using a local account
              </Text>
              <Text
                style={[
                  styles.anonymousDescription,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                Sign up to backup your data and sync across devices
              </Text>

              <View style={styles.benefitsList}>
                {[
                  { icon: '☁️', text: 'Cloud backup' },
                  { icon: '🔄', text: 'Sync across devices' },
                  { icon: '✨', text: 'Access premium features' },
                ].map((benefit, index) => (
                  <View key={index} style={styles.benefitRow}>
                    <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                    <Text
                      style={[
                        styles.benefitText,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeSM,
                        },
                      ]}
                    >
                      {benefit.text}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.createAccountButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.createAccountButtonText,
                    {
                      color: theme.colors.white,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                      fontSize: theme.typography.fontSizeMD,
                    },
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7}>
                <Text
                  style={[
                    styles.laterText,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  I'll do this later
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Account Info (if logged in) */}
          {isLoggedIn && (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                ACCOUNT INFO
              </Text>

              {renderActionRow(
                '✉️',
                'Email',
                userEmail || 'user@example.com',
                handleChangeEmail
              )}

              {renderActionRow(
                '🔑',
                'Password',
                '••••••••',
                handleChangePassword
              )}

              {renderActionRow(
                '📷',
                'Profile Picture',
                'Tap to change',
                () => {},
                false
              )}
            </View>
          )}

          {/* Cloud Sync (Premium) */}
          {isLoggedIn && (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                CLOUD SYNC
              </Text>

              <View style={styles.syncRow}>
                <View style={styles.syncInfo}>
                  <Text style={styles.syncIcon}>☁️</Text>
                  <View style={styles.syncText}>
                    <Text
                      style={[
                        styles.syncLabel,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBodyMedium,
                          fontSize: theme.typography.fontSizeMD,
                        },
                      ]}
                    >
                      Last synced
                    </Text>
                    <Text
                      style={[
                        styles.syncValue,
                        {
                          color: theme.colors.textSecondary,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeXS,
                        },
                      ]}
                    >
                      {lastSynced}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.syncButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleSync}
                  activeOpacity={0.8}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <Text
                      style={[
                        styles.syncButtonText,
                        {
                          color: theme.colors.white,
                          fontFamily: theme.typography.fontFamilyBodySemibold,
                          fontSize: theme.typography.fontSizeXS,
                        },
                      ]}
                    >
                      Sync Now
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.conflictRow,
                  { borderTopColor: theme.colors.border },
                ]}
              >
                <Text style={styles.conflictIcon}>⚡</Text>
                <View style={styles.conflictText}>
                  <Text
                    style={[
                      styles.conflictLabel,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBodyMedium,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    Conflict Resolution
                  </Text>
                  <Text
                    style={[
                      styles.conflictValue,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    Last write wins
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Connected Accounts */}
          {isLoggedIn && (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                CONNECTED ACCOUNTS
              </Text>

              {renderConnectedAccount(
                '🍎',
                'Apple ID',
                connectedApple,
                () => setConnectedApple(!connectedApple)
              )}

              {renderConnectedAccount(
                '📧',
                'Google',
                connectedGoogle,
                () => setConnectedGoogle(!connectedGoogle),
                false
              )}
            </View>
          )}

          {/* Data Management */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              DATA MANAGEMENT
            </Text>

            {renderActionRow(
              '📤',
              'Download Your Data',
              'Export all habits and history',
              () => navigation.navigate('ExportData')
            )}

            <TouchableOpacity
              style={[
                styles.dangerRow,
                { borderBottomColor: theme.colors.border },
              ]}
              onPress={handleDeleteData}
              activeOpacity={0.7}
            >
              <View style={styles.actionInfo}>
                <Text style={styles.actionIcon}>🗑️</Text>
                <View style={styles.actionText}>
                  <Text
                    style={[
                      styles.dangerLabel,
                      {
                        color: theme.colors.error,
                        fontFamily: theme.typography.fontFamilyBodyMedium,
                        fontSize: theme.typography.fontSizeMD,
                      },
                    ]}
                  >
                    Delete All Data
                  </Text>
                  <Text
                    style={[
                      styles.actionValue,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    Remove all habits and history
                  </Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Account Deletion */}
          {isLoggedIn && (
            <View
              style={[
                styles.dangerSection,
                {
                  backgroundColor: theme.colors.errorLight,
                  borderColor: theme.colors.error + '40',
                },
              ]}
            >
              <Text
                style={[
                  styles.dangerSectionTitle,
                  {
                    color: theme.colors.error,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                DANGER ZONE
              </Text>

              <TouchableOpacity
                style={styles.deleteAccountRow}
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
              >
                <View style={styles.deleteAccountInfo}>
                  <Text style={styles.deleteAccountIcon}>⚠️</Text>
                  <View style={styles.deleteAccountText}>
                    <Text
                      style={[
                        styles.deleteAccountLabel,
                        {
                          color: theme.colors.error,
                          fontFamily: theme.typography.fontFamilyBodySemibold,
                          fontSize: theme.typography.fontSizeMD,
                        },
                      ]}
                    >
                      Delete Account
                    </Text>
                    <Text
                      style={[
                        styles.deleteAccountDescription,
                        {
                          color: theme.colors.textSecondary,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeXS,
                        },
                      ]}
                    >
                      Permanently delete account and all data
                    </Text>
                  </View>
                </View>
                <Text style={[styles.chevron, { color: theme.colors.error }]}>›</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text
            style={[
              styles.footnote,
              {
                color: theme.colors.textTertiary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            {isLoggedIn
              ? 'Account deletion is permanent and cannot be undone. Your premium subscription will be cancelled.'
              : 'Create an account to backup your data and access all features.'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  anonymousCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  anonymousIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  anonymousTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  anonymousDescription: {
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  benefitText: {},
  createAccountButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  createAccountButtonText: {},
  laterText: {
    textAlign: 'center',
    paddingVertical: 8,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {},
  actionValue: {
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  syncText: {},
  syncLabel: {},
  syncValue: {
    marginTop: 2,
  },
  syncButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  syncButtonText: {},
  conflictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  conflictIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  conflictText: {},
  conflictLabel: {},
  conflictValue: {
    marginTop: 2,
  },
  connectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  connectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  connectedLabel: {},
  connectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  connectButtonText: {},
  dangerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
  },
  dangerLabel: {},
  dangerSection: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dangerSectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 1,
  },
  deleteAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  deleteAccountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deleteAccountIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  deleteAccountText: {
    flex: 1,
  },
  deleteAccountLabel: {},
  deleteAccountDescription: {
    marginTop: 2,
  },
  footnote: {
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
});

export default AccountSettingsScreen;
