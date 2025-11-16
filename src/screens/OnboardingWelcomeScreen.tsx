import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

const { width } = Dimensions.get('window');

type OnboardingWelcomeScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'OnboardingWelcome'
>;

const OnboardingWelcomeScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingWelcomeScreenNavigationProp>();
  const { theme } = useTheme();

  const handleNext = () => navigation.navigate('OnboardingTrack');
  const handleSkip = () => navigation.navigate('PermissionNotification');
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text
          style={[
            styles.skipText,
            {
              color: theme.colors.textSecondary,
              fontWeight: theme.typography.fontWeightMedium,
            },
          ]}
        >
          Skip
        </Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Hero Illustration */}
        <View
          style={[
            styles.illustrationContainer,
            {
              backgroundColor: theme.colors.primaryLight,
            },
          ]}
        >
          <View
            style={[
              styles.illustrationCircle,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
          >
            <Text style={styles.illustrationIcon}>✓</Text>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text
            style={[
              styles.headline,
              {
                color: theme.colors.text,
                fontWeight: theme.typography.fontWeightBold,
              },
            ]}
          >
            Build Habits That Stick
          </Text>

          <Text
            style={[
              styles.subheading,
              {
                color: theme.colors.textSecondary,
                fontWeight: theme.typography.fontWeightRegular,
                lineHeight: theme.typography.lineHeightRelaxed * theme.typography.fontSizeLG,
              },
            ]}
          >
            Track your daily habits, build streaks, and transform your life one
            day at a time
          </Text>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          <View
            style={[
              styles.dot,
              styles.dotActive,
              { backgroundColor: theme.colors.primary },
            ]}
          />
          <View
            style={[
              styles.dot,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <View
            style={[
              styles.dot,
              { backgroundColor: theme.colors.border },
            ]}
          />
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.primaryButtonText,
              {
                color: theme.colors.white,
                fontWeight: theme.typography.fontWeightSemibold,
              },
            ]}
          >
            Get Started
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 60,
    justifyContent: 'space-between',
  },
  illustrationContainer: {
    width: width - 80,
    height: width - 80,
    alignSelf: 'center',
    borderRadius: (width - 80) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.15,
  },
  illustrationCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationIcon: {
    fontSize: 80,
    color: 'white',
  },
  textContent: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 16,
  },
  subheading: {
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
  },
});

export default OnboardingWelcomeScreen;
