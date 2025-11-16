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

type OnboardingTrackScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'OnboardingTrack'
>;

const OnboardingTrackScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingTrackScreenNavigationProp>();
  const { theme } = useTheme();

  const handleNext = () => navigation.navigate('OnboardingStreaks');
  const handleBack = () => navigation.goBack();
  const handleSkip = () => navigation.navigate('PermissionNotification');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Looping check animation
    const loopAnimation = () => {
      checkAnim.setValue(0);
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(checkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ]).start(() => loopAnimation());
    };

    loopAnimation();
  }, [fadeAnim, checkAnim]);

  const checkScale = checkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const checkOpacity = checkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navButton} onPress={handleBack}>
          <Text
            style={[
              styles.navText,
              {
                color: theme.colors.textSecondary,
                fontWeight: theme.typography.fontWeightMedium,
              },
            ]}
          >
            ← Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleSkip}>
          <Text
            style={[
              styles.navText,
              {
                color: theme.colors.textSecondary,
                fontWeight: theme.typography.fontWeightMedium,
              },
            ]}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim },
        ]}
      >
        {/* Interactive Demo */}
        <View style={styles.demoContainer}>
          {/* Mock Habit Cards */}
          <View
            style={[
              styles.habitCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.habitCardContent}>
              <View>
                <Text
                  style={[
                    styles.habitName,
                    {
                      color: theme.colors.text,
                      fontWeight: theme.typography.fontWeightSemibold,
                    },
                  ]}
                >
                  Morning Meditation
                </Text>
                <Text
                  style={[
                    styles.habitTime,
                    {
                      color: theme.colors.textSecondary,
                      fontWeight: theme.typography.fontWeightRegular,
                    },
                  ]}
                >
                  8:00 AM • 10 min
                </Text>
              </View>

              <Animated.View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: theme.colors.success,
                    borderColor: theme.colors.success,
                    transform: [{ scale: checkScale }],
                    opacity: checkOpacity,
                  },
                ]}
              >
                <Text style={styles.checkmark}>✓</Text>
              </Animated.View>
            </View>
          </View>

          <View
            style={[
              styles.habitCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.habitCardContent}>
              <View>
                <Text
                  style={[
                    styles.habitName,
                    {
                      color: theme.colors.text,
                      fontWeight: theme.typography.fontWeightSemibold,
                    },
                  ]}
                >
                  Read 20 Pages
                </Text>
                <Text
                  style={[
                    styles.habitTime,
                    {
                      color: theme.colors.textSecondary,
                      fontWeight: theme.typography.fontWeightRegular,
                    },
                  ]}
                >
                  9:00 PM • 30 min
                </Text>
              </View>

              <View
                style={[
                  styles.checkbox,
                  styles.checkboxEmpty,
                  {
                    borderColor: theme.colors.border,
                  },
                ]}
              />
            </View>
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
            One Tap to Check In
          </Text>

          <Text
            style={[
              styles.subheading,
              {
                color: theme.colors.textSecondary,
                fontWeight: theme.typography.fontWeightRegular,
                lineHeight: theme.typography.lineHeightRelaxed * theme.typography.fontSizeMD,
              },
            ]}
          >
            Mark your habits complete in seconds. No complex logging required.
          </Text>

          {/* Feature Bullets */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Text
                style={[
                  styles.featureIcon,
                  { color: theme.colors.success },
                ]}
              >
                ✓
              </Text>
              <Text
                style={[
                  styles.featureText,
                  {
                    color: theme.colors.textSecondary,
                    fontWeight: theme.typography.fontWeightRegular,
                  },
                ]}
              >
                Quick daily check-ins
              </Text>
            </View>

            <View style={styles.featureRow}>
              <Text
                style={[
                  styles.featureIcon,
                  { color: theme.colors.success },
                ]}
              >
                ✓
              </Text>
              <Text
                style={[
                  styles.featureText,
                  {
                    color: theme.colors.textSecondary,
                    fontWeight: theme.typography.fontWeightRegular,
                  },
                ]}
              >
                Visual progress tracking
              </Text>
            </View>

            <View style={styles.featureRow}>
              <Text
                style={[
                  styles.featureIcon,
                  { color: theme.colors.success },
                ]}
              >
                ✓
              </Text>
              <Text
                style={[
                  styles.featureText,
                  {
                    color: theme.colors.textSecondary,
                    fontWeight: theme.typography.fontWeightRegular,
                  },
                ]}
              >
                Smart reminders
              </Text>
            </View>
          </View>
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
        </View>

        {/* Next Button */}
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
            Next
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
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  demoContainer: {
    gap: 12,
    paddingVertical: 24,
  },
  habitCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  habitCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitName: {
    fontSize: 16,
    marginBottom: 4,
  },
  habitTime: {
    fontSize: 14,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxEmpty: {
    backgroundColor: 'transparent',
  },
  checkmark: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
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
    marginBottom: 24,
  },
  features: {
    gap: 12,
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
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

export default OnboardingTrackScreen;
