import React, { useState } from 'react';
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
import * as Application from 'expo-application';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import {
  ArrowLeft,
  Globe,
  Mail,
  Twitter,
  Instagram,
  Star,
  Upload,
  FileText,
  Lock,
  ChevronRight,
  Heart,
} from 'lucide-react-native';

type AboutNavigationProp = StackNavigationProp<any, 'About'>;

const AboutScreen: React.FC = () => {
  const navigation = useNavigation<AboutNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const [logoTapCount, setLogoTapCount] = useState(0);

  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';

  const handleLogoTap = () => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);

    if (newCount === 7) {
      // Easter egg!
      Alert.alert(
        '🎉 You found an easter egg!',
        'Thanks for being curious! You\'re awesome.',
        [{ text: 'Yay!' }]
      );
      setLogoTapCount(0);
    }
  };

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleEmail = () => {
    openURL('mailto:support@habittracker.app?subject=Habit Tracker Support');
  };

  const handleRateApp = () => {
    // In production, use the actual App Store / Play Store URLs
    Alert.alert(
      'Rate Habit Tracker',
      'Would you like to rate us on the App Store?',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Rate Now',
          onPress: () => {
            // iOS: itms-apps://itunes.apple.com/app/idXXXXXXXXX?action=write-review
            // Android: market://details?id=com.yourapp.package
            openURL('https://apps.apple.com');
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

  const handleTwitter = () => openURL('https://twitter.com/habittracker');
  const handleInstagram = () => openURL('https://instagram.com/habittracker');
  const handleWebsite = () => openURL('https://habittracker.app');
  const handlePrivacy = () => openURL('https://habittracker.app/privacy');
  const handleTerms = () => openURL('https://habittracker.app/terms');

  const renderLinkRow = (
    IconComponent: React.ComponentType<any>,
    label: string,
    subtitle: string | null,
    onPress: () => void,
    showBorder: boolean = true
  ) => (
    <TouchableOpacity
      style={[
        styles.linkRow,
        {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: showBorder ? 1 : 0,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.linkInfo}>
        <View style={styles.linkIconContainer}>
          <IconComponent size={20} color={theme.colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.linkText}>
          <Text
            style={[
              styles.linkLabel,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBodyMedium,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {label}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.linkSubtitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <ChevronRight size={18} color={theme.colors.textTertiary} strokeWidth={2} />
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
          <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
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
          About
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
          {/* App Info Section */}
          <TouchableOpacity
            style={styles.appInfoSection}
            onPress={handleLogoTap}
            activeOpacity={1}
          >
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.logoText}>H</Text>
            </View>
            <Text
              style={[
                styles.appName,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSize2XL,
                },
              ]}
            >
              Habit Tracker
            </Text>
            <Text
              style={[
                styles.appVersion,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              Version {appVersion} (Build {buildNumber})
            </Text>
          </TouchableOpacity>

          {/* Mission Statement */}
          <View
            style={[
              styles.missionCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.missionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              Our Mission
            </Text>
            <Text
              style={[
                styles.missionText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
                },
              ]}
            >
              We believe small actions lead to big changes. Habit Tracker helps you build the habits
              that matter most to you, one day at a time. Whether you're starting your morning routine
              or working toward a life goal, we're here to support your journey.
            </Text>
          </View>

          {/* Links Section */}
          <View
            style={[
              styles.linksSection,
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
              CONNECT WITH US
            </Text>

            {renderLinkRow(Globe, 'Website', 'habittracker.app', handleWebsite)}
            {renderLinkRow(Mail, 'Contact Support', 'support@habittracker.app', handleEmail)}
            {renderLinkRow(Twitter, 'Twitter', '@habittracker', handleTwitter)}
            {renderLinkRow(Instagram, 'Instagram', '@habittracker', handleInstagram, false)}
          </View>

          {/* App Store Actions */}
          <View
            style={[
              styles.linksSection,
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
              SPREAD THE WORD
            </Text>

            {renderLinkRow(Star, 'Rate on App Store', 'Help others discover the app', handleRateApp)}
            {renderLinkRow(Upload, 'Share App', 'Tell your friends about us', handleShareApp, false)}
          </View>

          {/* Legal Section */}
          <View
            style={[
              styles.linksSection,
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

            {renderLinkRow(FileText, 'Terms of Service', null, handleTerms)}
            {renderLinkRow(Lock, 'Privacy Policy', null, handlePrivacy, false)}
          </View>

          {/* Credits */}
          <View style={styles.creditsSection}>
            <Text
              style={[
                styles.creditsTitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              CREDITS
            </Text>

            <View style={styles.creditsList}>
              <Text
                style={[
                  styles.creditItem,
                  {
                    color: theme.colors.textTertiary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Built with React Native & Expo
              </Text>
              <Text
                style={[
                  styles.creditItem,
                  {
                    color: theme.colors.textTertiary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Icons by Lucide
              </Text>
              <Text
                style={[
                  styles.creditItem,
                  {
                    color: theme.colors.textTertiary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                Fonts: Outfit & Plus Jakarta Sans
              </Text>
            </View>

            <View style={styles.madeWithContainer}>
              <Text
                style={[
                  styles.madeWith,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                Made with{' '}
              </Text>
              <Heart size={16} color={theme.colors.error} fill={theme.colors.error} strokeWidth={0} />
              <Text
                style={[
                  styles.madeWith,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                {' '}for habit builders everywhere
              </Text>
            </View>
          </View>

          {/* Copyright */}
          <Text
            style={[
              styles.copyright,
              {
                color: theme.colors.textTertiary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            © {new Date().getFullYear()} Habit Tracker. All rights reserved.
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
    paddingTop: 32,
    paddingBottom: 100,
  },
  appInfoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    marginBottom: 4,
  },
  appVersion: {},
  missionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  missionTitle: {
    marginBottom: 12,
  },
  missionText: {},
  linksSection: {
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
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  linkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkIconContainer: {
    marginRight: 12,
  },
  linkText: {},
  linkLabel: {},
  linkSubtitle: {
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
  },
  creditsSection: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  creditsTitle: {
    marginBottom: 12,
    letterSpacing: 1,
  },
  creditsList: {
    alignItems: 'center',
    marginBottom: 16,
  },
  creditItem: {
    marginBottom: 4,
  },
  madeWithContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  madeWith: {},
  copyright: {
    textAlign: 'center',
  },
});

export default AboutScreen;
