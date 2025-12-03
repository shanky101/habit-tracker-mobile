import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Linking,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, themes, themeMetadata } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { useMascot, MASCOT_NAME } from '@/context/MascotContext';
import { User, Palette, Sparkles, PartyPopper, Smartphone, Lightbulb } from 'lucide-react-native';

type SettingsNavigationProp = StackNavigationProp<any, 'Settings'>;

const USER_NAME_KEY = '@habit_tracker_user_name';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { theme, themeVariant, themeMode } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { settings: mascotSettings, toggleMascot, toggleCelebrations } = useMascot();

  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem(USER_NAME_KEY);
      if (name) {
        setUserName(name);
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const saveUserName = async () => {
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, tempName);
      setUserName(tempName);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error saving user name:', error);
    }
  };

  const startEditingName = () => {
    setTempName(userName);
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setTempName('');
    setIsEditingName(false);
  };

  const currentThemeName = themes[themeVariant].name;
  const displayThemeMode = themeMode === 'auto' ? 'Auto (System)' : currentThemeName;

  const handleSendFeedback = async () => {
    const feedbackEmail = 'feedback@habittracker.app';
    const subject = 'Habit Tracker Feedback';
    const url = `mailto:${feedbackEmail}?subject=${encodeURIComponent(subject)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Send Feedback',
          `Email us at ${feedbackEmail}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open email app');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplayBold,
              fontSize: theme.typography.fontSizeXL,
            },
          ]}
        >
          Settings
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <Animated.View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
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
            PROFILE
          </Text>

          {isEditingName ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.primary,
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textTertiary}
                autoFocus
              />
              <View style={styles.editNameButtons}>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: theme.colors.border }]}
                  onPress={cancelEditingName}
                >
                  <Text style={{ color: theme.colors.text }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
                  onPress={saveUserName}
                >
                  <Text style={{ color: theme.colors.white }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}
              onPress={startEditingName}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <User size={22} color={theme.colors.primary} strokeWidth={2} />
                </View>
                <View>
                  <Text
                    style={[
                      styles.settingLabel,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBodyMedium,
                        fontSize: theme.typography.fontSizeMD,
                      },
                    ]}
                  >
                    Name
                  </Text>
                  <Text
                    style={[
                      styles.settingValue,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {userName || 'Tap to set your name'}
                  </Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Appearance Section */}
        <Animated.View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
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
            APPEARANCE
          </Text>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}
            onPress={() => navigation.navigate('ThemePicker')}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Palette size={22} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <View>
                <Text
                  style={[
                    styles.settingLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeMD,
                    },
                  ]}
                >
                  Theme
                </Text>
                <Text
                  style={[
                    styles.settingValue,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  {displayThemeMode}
                </Text>
              </View>
            </View>
            <View style={styles.themePreview}>
              {themeMetadata[themeVariant].previewColors.slice(0, 3).map((color, index) => (
                <View
                  key={index}
                  style={[
                    styles.previewDot,
                    { backgroundColor: color },
                  ]}
                />
              ))}
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Mascot Section */}
        <Animated.View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
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
            {MASCOT_NAME.toUpperCase()} MASCOT
          </Text>

          <View style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Sparkles size={22} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text
                  style={[
                    styles.settingLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeMD,
                    },
                  ]}
                >
                  Show {MASCOT_NAME}
                </Text>
                <Text
                  style={[
                    styles.settingValue,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Your friendly habit companion
                </Text>
              </View>
            </View>
            <Switch
              value={mascotSettings.enabled}
              onValueChange={toggleMascot}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '60' }}
              thumbColor={mascotSettings.enabled ? theme.colors.primary : theme.colors.surface}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0, opacity: mascotSettings.enabled ? 1 : 0.5 }]}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <PartyPopper size={22} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text
                  style={[
                    styles.settingLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeMD,
                    },
                  ]}
                >
                  Celebrations
                </Text>
                <Text
                  style={[
                    styles.settingValue,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Show {MASCOT_NAME} when completing all habits
                </Text>
              </View>
            </View>
            <Switch
              value={mascotSettings.showCelebrations}
              onValueChange={toggleCelebrations}
              disabled={!mascotSettings.enabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '60' }}
              thumbColor={mascotSettings.showCelebrations && mascotSettings.enabled ? theme.colors.primary : theme.colors.surface}
            />
          </View>
        </Animated.View>

        {/* About Section */}
        <Animated.View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
              opacity: fadeAnim,
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
            ABOUT
          </Text>

          <View style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Smartphone size={22} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <View>
                <Text
                  style={[
                    styles.settingLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeMD,
                    },
                  ]}
                >
                  Version
                </Text>
                <Text
                  style={[
                    styles.settingValue,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  1.0.0
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
            onPress={handleSendFeedback}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Lightbulb size={22} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <View>
                <Text
                  style={[
                    styles.settingLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeMD,
                    },
                  ]}
                >
                  Send Feedback
                </Text>
                <Text
                  style={[
                    styles.settingValue,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Help us improve the app
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {},
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    marginRight: 14,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {},
  settingValue: {
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  editNameContainer: {
    padding: 16,
  },
  nameInput: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 12,
  },
  editNameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});

export default SettingsScreen;
