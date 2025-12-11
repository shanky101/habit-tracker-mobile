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
import { useUserStore } from '@/store/userStore';
import { ThemeProvider, useTheme, themes, themeMetadata } from '@app-core/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation'; // Restored import
import { useMascot, MASCOT_NAME } from '@features/mascot';
import { useSubscription } from '@/context/SubscriptionContext';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Palette,
  Sparkles,
  PartyPopper,
  Smartphone,
  Lightbulb,
  ChevronRight,
  Bell,
  Lock,
  Shield,
  Upload,
  Cloud,
  LogOut,
  Crown,
  Mail
} from 'lucide-react-native';

type SettingsNavigationProp = StackNavigationProp<any, 'Settings'>;



const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { theme, themeVariant, themeMode } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { settings: mascotSettings, toggleMascot, toggleCelebrations } = useMascot();
  const { subscription } = useSubscription();
  const isPremium = subscription.isPremium;

  const { profile, updateProfile } = useUserStore();
  const userName = profile.name || '';
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const saveUserName = async () => {
    try {
      await updateProfile({ name: tempName });
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Nudge (if free) */}
        {!isPremium && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Paywall')}
              style={styles.premiumNudge}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumGradient}
              >
                <View style={styles.premiumIcon}>
                  <Crown size={20} color="#FFF" fill="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nudgeTitle}>Upgrade to Premium</Text>
                  <Text style={styles.nudgeSubtitle}>Unlock unlimited habits & cloud sync</Text>
                </View>
                <ChevronRight size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Account Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>ACCOUNT</Text>
        </View>
        <View style={[styles.sectionGroup, { backgroundColor: theme.colors.surface }]}>
          {isEditingName ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.primary,
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
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
              style={styles.settingRow}
              onPress={startEditingName}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                <User size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Name</Text>
                <Text style={[styles.rowValue, { color: theme.colors.textSecondary }]}>{userName || 'Set Name'}</Text>
              </View>
              <ChevronRight size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}

          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('AccountSettings')}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.colors.secondary + '15' }]}>
              <Lock size={20} color={theme.colors.secondary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Account Security</Text>
            </View>
            <ChevronRight size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PREFERENCES</Text>
        </View>
        <View style={[styles.sectionGroup, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('ThemePicker')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#8B5CF615' }]}>
              <Palette size={20} color="#8B5CF6" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Theme</Text>
              <View style={styles.themePreview}>
                {themeMetadata[themeVariant].previewColors.slice(0, 3).map((color, index) => (
                  <View key={index} style={[styles.previewDot, { backgroundColor: color }]} />
                ))}
              </View>
            </View>
            <ChevronRight size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('NotificationsSettings')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#F59E0B15' }]}>
              <Bell size={20} color="#F59E0B" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Notifications</Text>
            </View>
            <ChevronRight size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />

          <View style={styles.settingRow}>
            <View style={[styles.iconBox, { backgroundColor: '#EC489915' }]}>
              <Sparkles size={20} color="#EC4899" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Show {MASCOT_NAME}</Text>
            </View>
            <Switch
              value={mascotSettings.enabled}
              onValueChange={toggleMascot}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>DATA & PRIVACY</Text>
        </View>
        <View style={[styles.sectionGroup, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('DataPrivacy')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#10B98115' }]}>
              <Shield size={20} color="#10B981" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Privacy Policy</Text>
            </View>
            <ChevronRight size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('ExportData')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#3B82F615' }]}>
              <Upload size={20} color="#3B82F6" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Export Data</Text>
            </View>
            <ChevronRight size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>SUPPORT</Text>
        </View>
        <View style={[styles.sectionGroup, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleSendFeedback}
          >
            <View style={[styles.iconBox, { backgroundColor: '#6366F115' }]}>
              <Mail size={20} color="#6366F1" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Send Feedback</Text>
            </View>
            <ChevronRight size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />

          <View style={styles.settingRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.textTertiary + '15' }]}>
              <Smartphone size={20} color={theme.colors.textTertiary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Version</Text>
              <Text style={[styles.rowValue, { color: theme.colors.textSecondary }]}>1.0.0</Text>
            </View>
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {},
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginLeft: 4,
  },
  sectionGroup: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 56,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginLeft: 60, // Align with text start (16 padding + 32 icon + 12 margin)
  },
  themePreview: {
    flexDirection: 'row',
    gap: 6,
  },
  previewDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  premiumNudge: {
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  premiumIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nudgeTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  nudgeSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  editNameContainer: {
    padding: 16,
  },
  nameInput: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 16,
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
