import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { Bell, Target } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type PermissionNotificationScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'PermissionNotification'
>;

const PermissionNotificationScreen: React.FC = () => {
  const navigation = useNavigation<PermissionNotificationScreenNavigationProp>();
  const { theme } = useTheme();
  const [isRequesting, setIsRequesting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bellAnim = useRef(new Animated.Value(0)).current;

  const handleEnableNotifications = async () => {
    setIsRequesting(true);

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        // Permission granted - configure notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        // Continue to main app
        navigation.navigate('MainApp');
      } else {
        // Permission denied, still continue to main app
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive habit reminders.',
          [
            { text: 'OK' },
            { text: 'Continue', onPress: () => navigation.navigate('MainApp'), style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Alert.alert('Error', 'Failed to request notification permissions. Please try again.');
      // On error, still proceed
      navigation.navigate('MainApp');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleMaybeLater = () => {
    // Navigate to Welcome screen without requesting permissions
    navigation.navigate('Welcome');
  };

  const handleSkip = () => {
    // Navigate to Welcome screen without requesting permissions
    navigation.navigate('Welcome');
  };

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
            <Animated.View
              style={[
                styles.bellIconContainer,
                {
                  transform: [{ rotate: bellRotation }],
                },
              ]}
            >
              <Bell size={64} color={theme.colors.primary} strokeWidth={2} />
            </Animated.View>
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
            Stay on Track with Reminders
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
                      fontFamily: theme.typography.fontFamilyBodySemibold,
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
                      fontFamily: theme.typography.fontFamilyBody,
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
                  fontFamily: theme.typography.fontFamilyBody,
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
                fontFamily: theme.typography.fontFamilyBody,
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
                opacity: isRequesting ? 0.7 : 1,
              },
            ]}
            onPress={handleEnableNotifications}
            activeOpacity={0.8}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text
                style={[
                  styles.primaryButtonText,
                  {
                    color: theme.colors.white,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                  },
                ]}
              >
                Enable Notifications
              </Text>
            )}
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
                  fontFamily: theme.typography.fontFamilyBodySemibold,
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
                  fontFamily: theme.typography.fontFamilyBodyMedium,
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
  bellIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
