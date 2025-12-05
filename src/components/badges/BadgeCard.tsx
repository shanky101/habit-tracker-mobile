/**
 * Badge Card Component
 *
 * Displays a single badge in grid layout
 * Shows different states: locked, active (in progress), unlocked
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '@/theme';
import { StreakBadge } from '@/services/streaks/types';
import { BADGE_COLORS } from '@/services/streaks/badgeMilestones';
import { Lock, Trophy, Star } from 'lucide-react-native';

interface BadgeCardProps {
  badge: StreakBadge;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

const CARD_SIZES = {
  small: 80,
  medium: 100,
  large: 120,
};

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  size = 'medium',
  onPress,
}) => {
  const { theme } = useTheme();
  const cardSize = CARD_SIZES[size];
  const colors = BADGE_COLORS[badge.tier];

  // Determine visual appearance based on state
  const getStateStyles = () => {
    switch (badge.state) {
      case 'unlocked':
        return {
          backgroundColor: colors.primary + '20', // 20% opacity
          borderColor: colors.primary,
          borderWidth: 2,
          opacity: 1,
        };
      case 'active':
        return {
          backgroundColor: theme.colors.surfaceAlt,
          borderColor: colors.accent,
          borderWidth: 2,
          borderStyle: 'dashed' as const,
          opacity: 0.8,
        };
      case 'locked':
      default:
        return {
          backgroundColor: theme.colors.surfaceAlt,
          borderColor: theme.colors.borderLight,
          borderWidth: 1,
          opacity: 0.5,
        };
    }
  };

  const getStateIcon = () => {
    const iconSize = size === 'small' ? 24 : size === 'medium' ? 32 : 40;
    const iconColor =
      badge.state === 'unlocked'
        ? colors.primary
        : badge.state === 'active'
        ? colors.accent
        : theme.colors.textSecondary;

    switch (badge.state) {
      case 'unlocked':
        return <Trophy size={iconSize} color={iconColor} fill={iconColor} />;
      case 'active':
        return <Star size={iconSize} color={iconColor} />;
      case 'locked':
      default:
        return <Lock size={iconSize} color={iconColor} />;
    }
  };

  const stateStyles = getStateStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          width: cardSize,
          height: cardSize,
          ...stateStyles,
        },
      ]}
    >
      {/* Badge Icon */}
      <View style={styles.iconContainer}>{getStateIcon()}</View>

      {/* Progress indicator for active badges */}
      {badge.state === 'active' && badge.progress !== undefined && (
        <View style={styles.progressContainer}>
          <Text
            style={[
              styles.progressText,
              {
                color: colors.accent,
                fontFamily: theme.typography.fontFamilyMono,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            {badge.progress}%
          </Text>
        </View>
      )}

      {/* Day requirement label */}
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.daysLabel,
            {
              color:
                badge.state === 'unlocked'
                  ? colors.primary
                  : theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamilyMono,
              fontSize: theme.typography.fontSizeXS,
            },
          ]}
        >
          {badge.daysRequired}d
        </Text>
      </View>

      {/* NEW badge indicator */}
      {badge.state === 'unlocked' &&
        badge.unlockedAt &&
        isRecentlyUnlocked(badge.unlockedAt) && (
          <View
            style={[
              styles.newBadge,
              { backgroundColor: colors.glow },
            ]}
          >
            <Text
              style={[
                styles.newText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: 8,
                },
              ]}
            >
              NEW
            </Text>
          </View>
        )}
    </TouchableOpacity>
  );
};

/**
 * Check if badge was unlocked in the last 7 days
 */
function isRecentlyUnlocked(unlockedAt: string): boolean {
  const unlockDate = new Date(unlockedAt);
  const now = new Date();
  const daysDiff = Math.floor(
    (now.getTime() - unlockDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysDiff <= 7;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    margin: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  progressContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  progressText: {
    fontWeight: '700',
  },
  labelContainer: {
    marginTop: 4,
  },
  daysLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newText: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
