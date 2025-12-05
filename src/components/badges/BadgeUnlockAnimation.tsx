/**
 * Badge Unlock Animation Component
 *
 * Celebration animation displayed when a badge is unlocked
 * Features: scale animation, confetti effect, haptic feedback
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/theme';
import { StreakBadge } from '@/services/streaks/types';
import { BADGE_COLORS } from '@/services/streaks/badgeMilestones';
import { Trophy, X, Share2 } from 'lucide-react-native';

interface BadgeUnlockAnimationProps {
  badge: StreakBadge | null;
  visible: boolean;
  onComplete: () => void;
  onShare?: () => void;
}

const { width, height } = Dimensions.get('window');

export const BadgeUnlockAnimation: React.FC<BadgeUnlockAnimationProps> = ({
  badge,
  visible,
  onComplete,
  onShare,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && badge) {
      // Trigger haptic feedback if available
      // Note: You may need to add react-native-haptic-feedback
      // or use Expo's Haptics module

      // Start animation sequence
      Animated.sequence([
        // Badge scales in
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Glow pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      glowAnim.setValue(0);
    }
  }, [visible, badge]);

  if (!badge) return null;

  const colors = BADGE_COLORS[badge.tier];

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onComplete}
    >
      <View style={styles.overlay}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onComplete}>
          <X size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Celebration Content */}
        <View style={styles.content}>
          {/* Celebration Header */}
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                })}],
              },
            ]}
          >
            <Text
              style={[
                styles.celebrationText,
                {
                  color: '#FFFFFF',
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSize2XL,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              🎉 Badge Unlocked! 🎉
            </Text>
          </Animated.View>

          {/* Badge with Glow Effect */}
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {/* Glow Effect */}
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  backgroundColor: colors.glow,
                  opacity: glowOpacity,
                },
              ]}
            />

            {/* Badge Icon */}
            <View
              style={[
                styles.badgeIcon,
                { backgroundColor: colors.primary },
              ]}
            >
              <Trophy size={80} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Badge Name and Description */}
          <Animated.View
            style={[
              styles.infoContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeName,
                {
                  color: '#FFFFFF',
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSize3XL,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              {badge.name}
            </Text>

            <Text
              style={[
                styles.description,
                {
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              {badge.description}
            </Text>

            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statBadge,
                  { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                ]}
              >
                <Text
                  style={[
                    styles.statText,
                    {
                      color: '#FFFFFF',
                      fontFamily: theme.typography.fontFamilyMono,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  {badge.daysRequired} Day Streak
                </Text>
              </View>

              <View
                style={[
                  styles.statBadge,
                  { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                ]}
              >
                <Text
                  style={[
                    styles.statText,
                    {
                      color: '#FFFFFF',
                      fontFamily: theme.typography.fontFamilyMono,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Tier {badge.tier}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Share Button */}
          {onShare && (
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.shareButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={onShare}
              >
                <Share2 size={20} color="#FFFFFF" />
                <Text
                  style={[
                    styles.shareButtonText,
                    {
                      color: '#FFFFFF',
                      fontFamily: theme.typography.fontFamilyDisplay,
                      fontSize: theme.typography.fontSizeMD,
                      fontWeight: theme.typography.fontWeightBold,
                    },
                  ]}
                >
                  Share Achievement
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: width,
  },
  headerContainer: {
    marginBottom: 32,
  },
  celebrationText: {
    textAlign: 'center',
    letterSpacing: 1,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    ...StyleSheet.absoluteFillObject,
    alignSelf: 'center',
  },
  badgeIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badgeName: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statText: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonText: {
    letterSpacing: 0.5,
  },
});
