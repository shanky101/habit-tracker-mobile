import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@app-core/theme';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { ArrowLeft, Flame, TrendingUp, Target, Trophy } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type OnboardingStreaksScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'OnboardingStreaks'
>;

const OnboardingStreaksScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingStreaksScreenNavigationProp>();
  const { theme } = useTheme();

  const handleNext = () => navigation.navigate('PermissionNotification');
  const handleBack = () => navigation.goBack();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const streakCountAnim = useRef(new Animated.Value(0)).current;
  const flameScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Animate streak counter from 0 to 30
    Animated.timing(streakCountAnim, {
      toValue: 30,
      duration: 2000,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Pulse flame icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameScaleAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(flameScaleAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, streakCountAnim, flameScaleAnim]);

  // Swipe gesture handler
  const panGesture = Gesture.Pan()
    .activeOffsetX([-50, 50])
    .failOffsetY([-20, 20]) // Allow vertical scrolling
    .onEnd((event) => {
      const { translationX } = event;
      // Swipe left to go to next screen
      if (translationX < -50) {
        handleNext();
      }
      // Swipe right to go to previous screen
      else if (translationX > 50) {
        handleBack();
      }
    });

  const streakCount = streakCountAnim.interpolate({
    inputRange: [0, 30],
    outputRange: [0, 30],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Back Button */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navButton} onPress={handleBack}>
          <View style={styles.backButtonContent}>
            <ArrowLeft size={16} color={theme.colors.textSecondary} strokeWidth={2} />
            <Text
              style={[
                styles.navText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                },
              ]}
            >
              Back
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim },
          ]}
        >
        {/* Streak Visualization */}
        <View style={styles.streakContainer}>
          {/* Flame Icon */}
          <Animated.View
            style={[
              styles.flameIconContainer,
              {
                transform: [{ scale: flameScaleAnim }],
              },
            ]}
          >
            <Flame size={80} color={theme.colors.primary} strokeWidth={2} fill={theme.colors.primary} />
          </Animated.View>

          {/* Animated Counter */}
          <View style={styles.counterContainer}>
            <Animated.Text
              style={[
                styles.streakNumber,
                {
                  color: theme.colors.primary,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                },
              ]}
            >
              30
            </Animated.Text>
            <Text
              style={[
                styles.streakLabel,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                },
              ]}
            >
              Day Streak
            </Text>
          </View>

          {/* Mini Calendar Grid */}
          <View style={styles.calendarGrid}>
            {Array.from({ length: 30 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.calendarDay,
                  {
                    backgroundColor:
                      index < 30
                        ? theme.colors.success
                        : theme.colors.borderLight,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text
            style={[
              styles.headline,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplayBold,
              },
            ]}
          >
            Watch Your Streaks Grow
          </Text>

          <Text
            style={[
              styles.subheading,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                lineHeight: theme.typography.lineHeightRelaxed * theme.typography.fontSizeMD,
              },
            ]}
          >
            Stay consistent and build momentum. Every day counts!
          </Text>

          {/* Benefits */}
          <View style={styles.benefits}>
            <View style={styles.benefitRow}>
              <TrendingUp size={24} color={theme.colors.primary} strokeWidth={2} />
              <Text
                style={[
                  styles.benefitText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodyMedium,
                  },
                ]}
              >
                Track your progress
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <Target size={24} color={theme.colors.primary} strokeWidth={2} />
              <Text
                style={[
                  styles.benefitText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodyMedium,
                  },
                ]}
              >
                Hit milestones
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <Trophy size={24} color={theme.colors.primary} strokeWidth={2} />
              <Text
                style={[
                  styles.benefitText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodyMedium,
                  },
                ]}
              >
                Celebrate achievements
              </Text>
            </View>
          </View>

          {/* Social Proof */}
          <Text
            style={[
              styles.socialProof,
              {
                color: theme.colors.textTertiary,
                fontFamily: theme.typography.fontFamilyBody,
              },
            ]}
          >
            Join 10,000+ people building better habits
          </Text>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
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
          <View
            style={[
              styles.dot,
              styles.dotActive,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        </View>

        {/* Let's Start Button */}
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
                fontFamily: theme.typography.fontFamilyBodySemibold,
              },
            ]}
          >
            Let's Start
          </Text>
        </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 60,
    justifyContent: 'space-between',
  },
  streakContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  flameIconContainer: {
    marginBottom: 16,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  streakNumber: {
    fontSize: 56,
    lineHeight: 64,
  },
  streakLabel: {
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    maxWidth: 280,
    justifyContent: 'center',
  },
  calendarDay: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  textContent: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  benefits: {
    gap: 16,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
  },
  socialProof: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
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

export default OnboardingStreaksScreen;
