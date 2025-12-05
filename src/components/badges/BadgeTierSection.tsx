/**
 * Badge Tier Section Component
 *
 * Displays a collapsible section of badges for a specific tier
 * Groups badges by tier (1-4) with themed headers
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { StreakBadge, BadgeTier } from '@/services/streaks/types';
import { BADGE_COLORS } from '@/services/streaks/badgeMilestones';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { BadgeCard } from './BadgeCard';

interface BadgeTierSectionProps {
  tier: BadgeTier;
  badges: StreakBadge[];
  onBadgePress: (badge: StreakBadge) => void;
  defaultExpanded?: boolean;
}

const TIER_INFO: Record<BadgeTier, { name: string; theme: string; emoji: string }> = {
  1: {
    name: 'Foundation',
    theme: 'Seedlings to Sapling',
    emoji: '🌱',
  },
  2: {
    name: 'Growth',
    theme: 'Trees to Forest',
    emoji: '🌳',
  },
  3: {
    name: 'Mastery',
    theme: 'Mountains & Peaks',
    emoji: '⛰️',
  },
  4: {
    name: 'Legacy',
    theme: 'Cosmic & Celestial',
    emoji: '🌌',
  },
};

export const BadgeTierSection: React.FC<BadgeTierSectionProps> = ({
  tier,
  badges,
  onBadgePress,
  defaultExpanded = true,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const colors = BADGE_COLORS[tier];
  const tierInfo = TIER_INFO[tier];

  // Calculate completion stats
  const unlockedCount = badges.filter((b) => b.state === 'unlocked').length;
  const totalCount = badges.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={[
          styles.header,
          { backgroundColor: colors.primary + '15' },
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          {/* Tier Emoji */}
          <Text style={styles.emoji}>{tierInfo.emoji}</Text>

          {/* Tier Info */}
          <View style={styles.tierInfo}>
            <View style={styles.tierTitleRow}>
              <Text
                style={[
                  styles.tierName,
                  {
                    color: colors.primary,
                    fontFamily: theme.typography.fontFamilyDisplay,
                    fontSize: theme.typography.fontSizeLG,
                    fontWeight: theme.typography.fontWeightBold,
                  },
                ]}
              >
                Tier {tier}: {tierInfo.name}
              </Text>
            </View>
            <Text
              style={[
                styles.tierTheme,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              {tierInfo.theme}
            </Text>
          </View>
        </View>

        {/* Stats and Chevron */}
        <View style={styles.headerRight}>
          <View style={styles.statsContainer}>
            <Text
              style={[
                styles.statsText,
                {
                  color: colors.primary,
                  fontFamily: theme.typography.fontFamilyMono,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              {unlockedCount}/{totalCount}
            </Text>
            {unlockedCount > 0 && (
              <Text
                style={[
                  styles.percentageText,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyMono,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                {completionPercentage}%
              </Text>
            )}
          </View>
          {isExpanded ? (
            <ChevronDown size={20} color={colors.primary} />
          ) : (
            <ChevronRight size={20} color={colors.primary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Badge Grid */}
      {isExpanded && (
        <View style={styles.badgeGrid}>
          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              size="medium"
              onPress={() => onBadgePress(badge)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierName: {
    marginBottom: 2,
  },
  tierTheme: {
    fontStyle: 'italic',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statsContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  statsText: {
    letterSpacing: 0.5,
  },
  percentageText: {
    marginTop: 2,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingTop: 12,
  },
});
