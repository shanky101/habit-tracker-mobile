import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

const { width } = Dimensions.get('window');

type PermissionNotificationScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'PermissionNotification'
>;

const PermissionNotificationScreen: React.FC = () => {
  const navigation = useNavigation<PermissionNotificationScreenNavigationProp>();
  const { theme } = useTheme();

  const handleEnableNotifications = () => {
    // TODO: Request actual notification permissions
    // For now, navigate to Welcome screen
    navigation.navigate('Welcome');
  };

  const handleMaybeLater = () => {
    // Navigate to Welcome screen
    navigation.navigate('Welcome');
  };

  const handleSkip = () => {
    // Navigate to Welcome screen
    navigation.navigate('Welcome');
  };
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bellAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Bell swing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnim, {
          toValue: -1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    ).start();
  }, [fadeAnim, bellAnim]);

  const bellRotation = bellAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim },
        ]}
      >
        {/* Bell Icon Container */}
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: theme.colors.primaryLight,
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.bellIcon,
                {
                  transform: [{ rotate: bellRotation }],
                },
              ]}
            >
              🔔
            </Animated.Text>
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
            Stay on Track with Reminders
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
            We'll send you a gentle reminder each day so you never miss your
            habits. You choose the time.
          </Text>

          {/* Notification Preview */}
          <View
            style={[
              styles.notificationPreview,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.notificationHeader}>
              <View
                style={[
                  styles.appIconSmall,
                  {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={styles.appIconText}>H</Text>
              </View>
              <View style={styles.notificationHeaderText}>
                <Text
                  style={[
                    styles.notificationAppName,
                    {
                      color: theme.colors.text,
                      fontWeight: theme.typography.fontWeightSemibold,
                    },
                  ]}
                >
                  Habit Tracker
                </Text>
                <Text
                  style={[
                    styles.notificationTime,
                    {
                      color: theme.colors.textTertiary,
                      fontWeight: theme.typography.fontWeightRegular,
                    },
                  ]}
                >
                  now
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.notificationMessage,
                {
                  color: theme.colors.text,
                  fontWeight: theme.typography.fontWeightRegular,
                },
              ]}
            >
              Time to check in! You have 3 habits waiting 🎯
            </Text>
          </View>

          {/* Trust Indicator */}
          <Text
            style={[
              styles.trustText,
              {
                color: theme.colors.textTertiary,
                fontWeight: theme.typography.fontWeightRegular,
              },
            ]}
          >
            You can change this anytime in Settings
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Primary Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={handleEnableNotifications}
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
              Enable Notifications
            </Text>
          </TouchableOpacity>

          {/* Secondary Button */}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleMaybeLater}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: theme.colors.text,
                  fontWeight: theme.typography.fontWeightSemibold,
                },
              ]}
            >
              Maybe Later
            </Text>
          </TouchableOpacity>

          {/* Skip Link */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text
              style={[
                styles.skipText,
                {
                  color: theme.colors.textSecondary,
                  fontWeight: theme.typography.fontWeightMedium,
                },
              ]}
            >
              I'll set it up later
            </Text>
          </TouchableOpacity>
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
    paddingTop: 100,
    paddingBottom: 60,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.2,
  },
  bellIcon: {
    fontSize: 64,
  },
  textContent: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  notificationPreview: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  appIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  notificationHeaderText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationAppName: {
    fontSize: 14,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  trustText: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
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
  secondaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
  },
});

export default PermissionNotificationScreen;
