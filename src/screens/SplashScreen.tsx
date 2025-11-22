import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

type SplashScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'Splash'
>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Gentle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navigate after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace('OnboardingWelcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, pulseAnim, navigation]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Logo Circle */}
        <View
          style={[
            styles.logoCircle,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <Text style={[styles.logoText, { color: theme.colors.white, fontFamily: theme.typography.fontFamilyDisplayBold }]}>
            H
          </Text>
        </View>

        {/* App Name */}
        <Text
          style={[
            styles.appName,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplayBold,
            },
          ]}
        >
          Habit Tracker
        </Text>

        {/* Tagline */}
        <Text
          style={[
            styles.tagline,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamilyBody,
            },
          ]}
        >
          Build Better Habits, One Day at a Time
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 56,
  },
  appName: {
    fontSize: 32,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
});

export default SplashScreen;
