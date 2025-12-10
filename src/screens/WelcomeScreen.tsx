import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

type WelcomeScreenNavigationProp = StackNavigationProp<any, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { theme } = useTheme();

  // Use custom animation hook
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const handleStartFree = () => {
    // Navigate to Main App with anonymous user
    navigation.navigate('MainApp');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleTerms = () => {
    // In a real app, this would navigate to Terms of Service
    console.log('Navigate to Terms of Service');
  };

  const handlePrivacy = () => {
    // In a real app, this would navigate to Privacy Policy
    console.log('Navigate to Privacy Policy');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.logoText, { color: theme.colors.white, fontFamily: theme.typography.fontFamilyDisplayBold }]}>H</Text>
          </View>
          <Text style={[styles.appName, {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyDisplayBold,
            fontSize: theme.typography.fontSize2XL,
          }]}>
            Habit Tracker
          </Text>
          <Text style={[styles.welcomeMessage, {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeMD,
            lineHeight: theme.typography.lineHeightRelaxed,
          }]}>
            Build better habits, one day at a time
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          {/* Primary CTA - Start Free */}
          <TouchableOpacity
            style={[styles.primaryButton, {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.shadows.shadowMD.shadowColor,
              shadowOffset: theme.shadows.shadowMD.shadowOffset,
              shadowOpacity: theme.shadows.shadowMD.shadowOpacity,
              shadowRadius: theme.shadows.shadowMD.shadowRadius,
              elevation: theme.shadows.shadowMD.elevation,
            }]}
            onPress={handleStartFree}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, {
              color: theme.colors.white,
              fontFamily: theme.typography.fontFamilyBodySemibold,
              fontSize: theme.typography.fontSizeLG,
            }]}>
              Start Free
            </Text>
            <Text style={[styles.primaryButtonSubtext, {
              color: theme.colors.white,
              fontFamily: theme.typography.fontFamilyBody,
              fontSize: theme.typography.fontSizeXS,
            }]}>
              No account required
            </Text>
          </TouchableOpacity>


        </View>

        {/* Footer with Terms and Privacy */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeXS,
          }]}>
            By continuing, you agree to our{' '}
            <Text
              style={[styles.footerLink, { color: theme.colors.primary }]}
              onPress={handleTerms}
            >
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text
              style={[styles.footerLink, { color: theme.colors.primary }]}
              onPress={handlePrivacy}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.12,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 48,
  },
  appName: {
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeMessage: {
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  ctaSection: {
    width: '100%',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    marginBottom: 2,
  },
  primaryButtonSubtext: {
    opacity: 0.9,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    // styles from theme
  },
  tertiaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryButtonText: {
    // styles from theme
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;
