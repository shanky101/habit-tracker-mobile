/**
 * Streak Badges Screen
 *
 * Main screen for viewing all streak badges
 * Shows progress, unlocked badges, and next milestones
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import {
  BadgeProgressRing,
  BadgeDetailModal,
  BadgeTierSection,
  BadgeUnlockAnimation,
} from '@/components/badges';
import { StreakTracker, BadgeManager } from '@/services/streaks';
import { StreakBadge, StreakStats, BadgeUnlockEvent } from '@/services/streaks/types';
import { getBadgesByTier } from '@/services/streaks/badgeMilestones';

const StreakBadgesScreen: React.FC = () => {
  const { theme } = useTheme();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [allBadges, setAllBadges] = useState<StreakBadge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<StreakBadge | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<StreakBadge | null>(null);

  /**
   * Load badges and stats
   */
  const loadData = useCallback(async () => {
    try {
      // Get current streak statistics
      const currentStats = await StreakTracker.getCurrentStats();

      // Get badge statistics
      const badgeStats = await BadgeManager.getBadgeStats(currentStats.longestStreak);

      setStats(badgeStats);

      // Get all badges with state
      const badges = await BadgeManager.getAllBadgesWithState(currentStats.longestStreak);
      setAllBadges(badges);
    } catch (error) {
      console.error('[StreakBadgesScreen] Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await StreakTracker.forceRecalculate();
    await loadData();
  }, [loadData]);

  /**
   * Handle badge unlock events
   */
  const handleBadgeUnlock = useCallback((events: BadgeUnlockEvent[]) => {
    if (events.length > 0) {
      // Show animation for the first new badge
      const firstBadge = events[0].badge;
      setNewlyUnlockedBadge(firstBadge);
      setShowUnlockAnimation(true);

      // Reload data to reflect new badges
      loadData();
    }
  }, [loadData]);

  /**
   * Register unlock listener on mount
   */
  useEffect(() => {
    const unsubscribe = StreakTracker.onBadgeUnlock(handleBadgeUnlock);
    return () => {
      unsubscribe();
    };
  }, [handleBadgeUnlock]);

  /**
   * Load initial data
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Get badges for a specific tier
   */
  const getBadgesForTier = (tier: 1 | 2 | 3 | 4): StreakBadge[] => {
    return allBadges.filter((badge) => badge.tier === tier);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            Loading badges...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplay,
              fontSize: theme.typography.fontSize3XL,
              fontWeight: theme.typography.fontWeightBold,
            },
          ]}
        >
          Streak Badges
        </Text>

        <Text
          style={[
            styles.headerSubtitle,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamilyBody,
              fontSize: theme.typography.fontSizeMD,
            },
          ]}
        >
          {stats?.totalBadgesUnlocked} / {allBadges.length} Unlocked
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Progress Ring */}
        {stats?.nextMilestone && (
          <BadgeProgressRing
            nextMilestone={stats.nextMilestone}
            currentStreak={stats.currentStreak}
          />
        )}

        {/* No next milestone - user has all badges! */}
        {!stats?.nextMilestone && (
          <View style={styles.completionContainer}>
            <Text
              style={[
                styles.completionText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSize2XL,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              🏆 All Badges Unlocked! 🏆
            </Text>
            <Text
              style={[
                styles.completionSubtext,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              You're a true habit champion!
            </Text>
          </View>
        )}

        {/* Tier Sections */}
        <View style={styles.tiersContainer}>
          <BadgeTierSection
            tier={1}
            badges={getBadgesForTier(1)}
            onBadgePress={setSelectedBadge}
            defaultExpanded={true}
          />

          <BadgeTierSection
            tier={2}
            badges={getBadgesForTier(2)}
            onBadgePress={setSelectedBadge}
            defaultExpanded={false}
          />

          <BadgeTierSection
            tier={3}
            badges={getBadgesForTier(3)}
            onBadgePress={setSelectedBadge}
            defaultExpanded={false}
          />

          <BadgeTierSection
            tier={4}
            badges={getBadgesForTier(4)}
            onBadgePress={setSelectedBadge}
            defaultExpanded={false}
          />
        </View>
      </ScrollView>

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        visible={selectedBadge !== null}
        onClose={() => setSelectedBadge(null)}
        onShare={() => {
          // TODO: Implement share functionality in Checkpoint 6
          console.log('Share badge:', selectedBadge?.name);
        }}
      />

      {/* Badge Unlock Animation */}
      <BadgeUnlockAnimation
        badge={newlyUnlockedBadge}
        visible={showUnlockAnimation}
        onComplete={() => {
          setShowUnlockAnimation(false);
          setNewlyUnlockedBadge(null);
        }}
        onShare={() => {
          // TODO: Implement share functionality in Checkpoint 6
          console.log('Share unlocked badge:', newlyUnlockedBadge?.name);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  completionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  completionText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  completionSubtext: {
    textAlign: 'center',
  },
  tiersContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default StreakBadgesScreen;
