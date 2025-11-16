import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/theme';

const { width, height } = Dimensions.get('window');

export type CelebrationType = 'firstCheckin' | 'allComplete' | 'streak';

export interface CelebrationModalProps {
  visible: boolean;
  type: CelebrationType;
  habitName?: string;
  streakDays?: number;
  completedCount?: number;
  totalCount?: number;
  activeStreaks?: number;
  onDismiss: () => void;
  onShare?: () => void;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  type,
  habitName,
  streakDays = 0,
  completedCount = 0,
  totalCount = 0,
  activeStreaks = 0,
  onDismiss,
  onShare,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      confettiAnim.setValue(0);

      // Run animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, fadeAnim, confettiAnim]);

  const getMotivationalQuote = () => {
    const quotes = [
      "Success is the sum of small efforts repeated day in and day out.",
      "The secret of getting ahead is getting started.",
      "You don't have to be great to start, but you have to start to be great.",
      "Small daily improvements are the key to staggering long-term results.",
      "The only way to do great work is to love what you do.",
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return quotes[dayOfYear % quotes.length];
  };

  const getMessage = () => {
    switch (type) {
      case 'allComplete':
        return {
          emoji: '🎉',
          title: 'All Habits Complete!',
          subtitle: `${completedCount}/${totalCount} habits • ${activeStreaks} active streaks`,
          quote: getMotivationalQuote(),
        };
      case 'streak':
        if (streakDays === 3) {
          return {
            emoji: '🔥',
            title: 'Great Start!',
            subtitle: `${streakDays} day streak on ${habitName || 'your habit'}`,
            quote: undefined,
          };
        } else if (streakDays === 7) {
          return {
            emoji: '🎉',
            title: 'One Week!',
            subtitle: `${streakDays} day streak! You're building momentum`,
            quote: undefined,
          };
        } else if (streakDays === 30) {
          return {
            emoji: '🏆',
            title: 'One Month!',
            subtitle: 'Incredible! 30 days of consistency',
            quote: undefined,
          };
        } else if (streakDays === 100) {
          return {
            emoji: '💯',
            title: 'Century!',
            subtitle: "You're unstoppable! 100 days!",
            quote: undefined,
          };
        } else if (streakDays === 365) {
          return {
            emoji: '👑',
            title: 'One Year!',
            subtitle: 'Legend status! 365 days!',
            quote: undefined,
          };
        }
        return {
          emoji: '🔥',
          title: `${streakDays} Day Streak!`,
          subtitle: "Keep the momentum going!",
          quote: undefined,
        };
      case 'firstCheckin':
      default:
        return {
          emoji: '✓',
          title: 'Nice!',
          subtitle: 'Habit checked in',
          quote: undefined,
        };
    }
  };

  const message = getMessage();
  const showShareButton = type === 'streak' && streakDays >= 7;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Confetti effect (simplified) */}
          {type === 'allComplete' || (type === 'streak' && streakDays >= 7) ? (
            <View style={styles.confettiContainer}>
              <Text style={styles.confetti}>🎊</Text>
              <Text style={styles.confetti}>✨</Text>
              <Text style={styles.confetti}>🌟</Text>
              <Text style={styles.confetti}>🎉</Text>
            </View>
          ) : null}

          {/* Main Content */}
          <Text style={styles.emoji}>{message.emoji}</Text>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplay,
                fontSize: theme.typography.fontSize2XL,
                fontWeight: theme.typography.fontWeightBold,
              },
            ]}
          >
            {message.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeMD,
                lineHeight: theme.typography.lineHeightRelaxed,
              },
            ]}
          >
            {message.subtitle}
          </Text>

          {/* Motivational Quote (for allComplete) */}
          {type === 'allComplete' && message.quote && (
            <View style={[styles.quoteContainer, { backgroundColor: theme.colors.background }]}>
              <Text
                style={[
                  styles.quote,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                    fontStyle: 'italic',
                    lineHeight: theme.typography.lineHeightRelaxed,
                  },
                ]}
              >
                "{message.quote}"
              </Text>
            </View>
          )}

          {/* Stats (for streaks) */}
          {type === 'streak' && (
            <View
              style={[styles.statsContainer, { backgroundColor: theme.colors.background }]}
            >
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyDisplay,
                      fontSize: theme.typography.fontSizeXL,
                      fontWeight: theme.typography.fontWeightBold,
                    },
                  ]}
                >
                  {streakDays}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  Day Streak
                </Text>
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.shadows.shadowMD.shadowColor,
                  shadowOffset: theme.shadows.shadowMD.shadowOffset,
                  shadowOpacity: theme.shadows.shadowMD.shadowOpacity,
                  shadowRadius: theme.shadows.shadowMD.shadowRadius,
                  elevation: theme.shadows.shadowMD.elevation,
                },
              ]}
              onPress={onDismiss}
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
                Continue
              </Text>
            </TouchableOpacity>

            {showShareButton && onShare && (
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
                onPress={onShare}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                      fontWeight: theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  Share Achievement
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  confetti: {
    fontSize: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  quoteContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  quote: {
    textAlign: 'center',
  },
  statsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    // styles from theme
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    // styles from theme
  },
});

export default CelebrationModal;
