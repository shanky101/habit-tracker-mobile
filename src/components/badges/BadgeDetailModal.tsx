/**
 * Badge Detail Modal Component
 *
 * Full-screen modal showing detailed information about a badge
 * Displayed when user taps on a badge card
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/theme';
import { StreakBadge } from '@/services/streaks/types';
import { BADGE_COLORS } from '@/services/streaks/badgeMilestones';
import { X, Trophy, Lock, Star, Calendar, Award } from 'lucide-react-native';

interface BadgeDetailModalProps {
  badge: StreakBadge | null;
  visible: boolean;
  onClose: () => void;
  onShare?: () => void;
}

const { width } = Dimensions.get('window');

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  visible,
  onClose,
  onShare,
}) => {
  const { theme } = useTheme();

  if (!badge) return null;

  const colors = BADGE_COLORS[badge.tier];

  const getStateIcon = () => {
    const iconSize = 120;
    const iconColor = badge.state === 'unlocked' ? colors.primary : theme.colors.textSecondary;

    switch (badge.state) {
      case 'unlocked':
        return <Trophy size={iconSize} color={iconColor} fill={iconColor} />;
      case 'active':
        return <Star size={iconSize} color={colors.accent} />;
      case 'locked':
      default:
        return <Lock size={iconSize} color={iconColor} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTierName = (tier: number) => {
    switch (tier) {
      case 1:
        return 'Foundation';
      case 2:
        return 'Growth';
      case 3:
        return 'Mastery';
      case 4:
        return 'Legacy';
      default:
        return 'Unknown';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Badge Icon */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              {getStateIcon()}
            </View>

            {/* Badge Name */}
            <Text
              style={[
                styles.badgeName,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSize3XL,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              {badge.name}
            </Text>

            {/* Tier Badge */}
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: colors.primary + '30' },
              ]}
            >
              <Text
                style={[
                  styles.tierText,
                  {
                    color: colors.primary,
                    fontFamily: theme.typography.fontFamilyMono,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                TIER {badge.tier} • {getTierName(badge.tier).toUpperCase()}
              </Text>
            </View>

            {/* Description */}
            <Text
              style={[
                styles.description,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              {badge.description}
            </Text>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              {/* Days Required */}
              <View style={styles.statItem}>
                <Calendar size={24} color={colors.primary} />
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Days Required
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyMono,
                      fontSize: theme.typography.fontSizeXL,
                      fontWeight: theme.typography.fontWeightBold,
                    },
                  ]}
                >
                  {badge.daysRequired}
                </Text>
              </View>

              {/* Unlock Date (if unlocked) */}
              {badge.state === 'unlocked' && badge.unlockedAt && (
                <View style={styles.statItem}>
                  <Award size={24} color={colors.primary} />
                  <Text
                    style={[
                      styles.statLabel,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    Unlocked On
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {formatDate(badge.unlockedAt)}
                  </Text>
                </View>
              )}

              {/* Progress (if active) */}
              {badge.state === 'active' && badge.progress !== undefined && (
                <View style={styles.statItem}>
                  <Star size={24} color={colors.accent} />
                  <Text
                    style={[
                      styles.statLabel,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    Progress
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyMono,
                        fontSize: theme.typography.fontSizeXL,
                        fontWeight: theme.typography.fontWeightBold,
                      },
                    ]}
                  >
                    {badge.progress}%
                  </Text>
                </View>
              )}
            </View>

            {/* Share Button (only for unlocked badges) */}
            {badge.state === 'unlocked' && onShare && (
              <TouchableOpacity
                style={[
                  styles.shareButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={onShare}
              >
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
                  📤 Share Badge
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  badgeName: {
    textAlign: 'center',
    marginBottom: 12,
  },
  tierBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  tierText: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statLabel: {
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    marginTop: 4,
  },
  shareButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  shareButtonText: {
    letterSpacing: 0.5,
  },
});
