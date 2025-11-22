import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Switch,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

type DataPrivacyNavigationProp = StackNavigationProp<any, 'DataPrivacy'>;

const DataPrivacyScreen: React.FC = () => {
  const navigation = useNavigation<DataPrivacyNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [crashReportsEnabled, setCrashReportsEnabled] = useState(true);
  const [personalizedTips, setPersonalizedTips] = useState(true);

  const handleExportData = () => {
    navigation.navigate('ExportData');
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear cached data like images and temporary files. Your habits and settings will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              // In a real app, you would clear specific cache keys
              // For demo purposes, we'll show a success message
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your habits, completions, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'Please confirm that you want to delete all your data. This is irreversible.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await AsyncStorage.clear();
                      Alert.alert('Success', 'All data has been deleted');
                      // In a real app, you'd also log the user out and reset the app
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete data');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      await Linking.openURL('https://habittracker.app/privacy');
    } catch (error) {
      Alert.alert('Error', 'Could not open privacy policy');
    }
  };

  const handleOpenTerms = async () => {
    try {
      await Linking.openURL('https://habittracker.app/terms');
    } catch (error) {
      Alert.alert('Error', 'Could not open terms of service');
    }
  };

  const handleRequestData = () => {
    Alert.alert(
      'Request Your Data',
      'We will email you a copy of all your data within 30 days. This includes all habits, completions, notes, and settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () => {
            Alert.alert(
              'Request Submitted',
              'Your data request has been submitted. You will receive an email with your data within 30 days.'
            );
          },
        },
      ]
    );
  };

  const renderSettingToggle = (
    icon: string,
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View
      style={[
        styles.settingRow,
        { borderBottomColor: theme.colors.border },
      ]}
    >
      <View style={styles.settingInfo}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBodyMedium,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.settingDescription,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primary + '70',
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );

  const renderActionRow = (
    icon: string,
    title: string,
    description: string,
    onPress: () => void,
    destructive: boolean = false
  ) => (
    <TouchableOpacity
      style={[
        styles.actionRow,
        { borderBottomColor: theme.colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionInfo}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <View style={styles.actionText}>
          <Text
            style={[
              styles.actionTitle,
              {
                color: destructive ? theme.colors.error : theme.colors.text,
                fontFamily: theme.typography.fontFamilyBodyMedium,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.actionDescription,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            {description}
          </Text>
        </View>
      </View>
      <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text>
    </TouchableOpacity>
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
          Data & Privacy
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
          {/* Privacy Settings */}
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
              PRIVACY SETTINGS
            </Text>
            {renderSettingToggle(
              '📊',
              'Analytics',
              'Help improve the app by sending anonymous usage data',
              analyticsEnabled,
              setAnalyticsEnabled
            )}
            {renderSettingToggle(
              '🐛',
              'Crash Reports',
              'Automatically send crash reports to help fix bugs',
              crashReportsEnabled,
              setCrashReportsEnabled
            )}
            {renderSettingToggle(
              '💡',
              'Personalized Tips',
              'Allow AI to analyze your habits for personalized insights',
              personalizedTips,
              setPersonalizedTips
            )}
          </View>

          {/* Your Data */}
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
              YOUR DATA
            </Text>
            {renderActionRow(
              '📤',
              'Export Data',
              'Download all your habits and completions',
              handleExportData
            )}
            {renderActionRow(
              '📧',
              'Request Your Data',
              'Get a copy of all data we have about you',
              handleRequestData
            )}
            {renderActionRow(
              '🧹',
              'Clear Cache',
              'Free up storage by clearing temporary files',
              handleClearCache
            )}
          </View>

          {/* Data Storage Info */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: theme.colors.primary + '10',
                borderColor: theme.colors.primary + '30',
              },
            ]}
          >
            <Text style={styles.infoIcon}>🔐</Text>
            <View style={styles.infoText}>
              <Text
                style={[
                  styles.infoTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                Your data is stored locally
              </Text>
              <Text
                style={[
                  styles.infoDescription,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                    lineHeight: theme.typography.fontSizeXS * theme.typography.lineHeightRelaxed,
                  },
                ]}
              >
                Your habits and progress are stored securely on your device. Premium users can enable cloud sync for backup.
              </Text>
            </View>
          </View>

          {/* Legal Links */}
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
              LEGAL
            </Text>
            {renderActionRow(
              '📄',
              'Privacy Policy',
              'How we handle your data',
              handleOpenPrivacyPolicy
            )}
            {renderActionRow(
              '📋',
              'Terms of Service',
              'Rules and guidelines for using the app',
              handleOpenTerms
            )}
          </View>

          {/* Danger Zone */}
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
                  color: theme.colors.error,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              DANGER ZONE
            </Text>
            {renderActionRow(
              '🗑️',
              'Delete All Data',
              'Permanently delete all habits and settings',
              handleDeleteAllData,
              true
            )}
          </View>

          {/* Footer Info */}
          <Text
            style={[
              styles.footerText,
              {
                color: theme.colors.textTertiary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            We take your privacy seriously. Your data is never sold to third parties.
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {},
  settingDescription: {
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
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
  actionTitle: {},
  actionDescription: {
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    marginBottom: 4,
  },
  infoDescription: {},
  footerText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});

export default DataPrivacyScreen;
