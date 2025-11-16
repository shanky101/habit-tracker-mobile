import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/theme';

const { width } = Dimensions.get('window');

interface StreakBrokenModalProps {
  visible: boolean;
  habitName: string;
  brokenStreak: number;
  onDismiss: () => void;
  onCheckInNow: () => void;
}

const StreakBrokenModal: React.FC<StreakBrokenModalProps> = ({
  visible,
  habitName,
  brokenStreak,
  onDismiss,
  onCheckInNow,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.content,
            {
              backgroundColor: theme.colors.background,
              shadowColor: theme.shadows.shadowXL.shadowColor,
              shadowOffset: theme.shadows.shadowXL.shadowOffset,
              shadowOpacity: theme.shadows.shadowXL.shadowOpacity,
              shadowRadius: theme.shadows.shadowXL.shadowRadius,
              elevation: theme.shadows.shadowXL.elevation,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>😔</Text>
            </View>

            {/* Message */}
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSizeXL,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              Don't worry, it happens!
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              You missed your "{habitName}" habit
            </Text>

            {/* Broken Streak Info */}
            <View
              style={[
                styles.streakCard,
                {
                  backgroundColor: `${theme.colors.error}15`,
                  borderColor: `${theme.colors.error}30`,
                },
              ]}
            >
              <Text style={styles.streakEmoji}>💔</Text>
              <Text
                style={[
                  styles.streakText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                You had a{' '}
                <Text
                  style={[
                    styles.streakNumber,
                    {
                      color: theme.colors.error,
                      fontWeight: theme.typography.fontWeightBold,
                    },
                  ]}
                >
                  {brokenStreak}-day streak
                </Text>
              </Text>
            </View>

            {/* Encouragement */}
            <View style={styles.encouragementSection}>
              <Text
                style={[
                  styles.encouragementTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                    fontWeight: theme.typography.fontWeightSemibold,
                  },
                ]}
              >
                Start again today! 💪
              </Text>
              <Text
                style={[
                  styles.encouragementText,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                Building habits is a journey, not a destination. Missing one day doesn't
                erase your progress. What matters is getting back on track.
              </Text>
            </View>

            {/* Recovery Tips */}
            <View
              style={[
                styles.tipsCard,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tipsTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                    fontWeight: theme.typography.fontWeightSemibold,
                  },
                ]}
              >
                Quick Recovery Tips:
              </Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Text style={styles.tipBullet}>✓</Text>
                  <Text
                    style={[
                      styles.tipText,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    Check in right now to start fresh
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Text style={styles.tipBullet}>✓</Text>
                  <Text
                    style={[
                      styles.tipText,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    Set a reminder to avoid missing again
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Text style={styles.tipBullet}>✓</Text>
                  <Text
                    style={[
                      styles.tipText,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    Focus on consistency, not perfection
                  </Text>
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={onCheckInNow}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    {
                      color: theme.colors.white,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeMD,
                      fontWeight: theme.typography.fontWeightSemibold,
                    },
                  ]}
                >
                  Check In Now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: 'transparent',
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={onDismiss}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeMD,
                      fontWeight: theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  Dismiss
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: width - 48,
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  streakEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  streakText: {
    lineHeight: 24,
  },
  streakNumber: {
    fontSize: 16,
  },
  encouragementSection: {
    marginBottom: 24,
  },
  encouragementTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  encouragementText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipsTitle: {
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  tipText: {
    flex: 1,
    lineHeight: 18,
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {},
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {},
});

export default StreakBrokenModal;
