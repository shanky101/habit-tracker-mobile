/**
 * Badge Manager Service
 *
 * Manages badge unlocking, tracking, and state management
 */

import { db } from '@/data/database/client';
import {
  StreakBadge,
  StreakStats,
  BadgeUnlockEvent,
  NextMilestoneInfo,
  StreakBadgeRow,
  STREAK_METADATA_KEYS,
} from './types';
import {
  BADGE_MILESTONES,
  getNextBadge,
  getUnlockedBadges,
  getBadgeById,
} from './badgeMilestones';

/**
 * Badge Manager - Handles all badge-related operations
 */
export class BadgeManager {
  private static readonly USER_ID = 'default'; // Single user for now

  /**
   * Check for new badge unlocks based on current streak
   * Returns array of newly unlocked badges
   */
  static async checkForNewUnlocks(
    currentStreak: number
  ): Promise<BadgeUnlockEvent[]> {
    const unlockedEvents: BadgeUnlockEvent[] = [];

    // Get all badges that should be unlocked for this streak
    const shouldBeUnlocked = getUnlockedBadges(currentStreak);

    // Get currently unlocked badges from database
    const alreadyUnlocked = await this.getUserBadges();
    const unlockedBadgeIds = new Set(alreadyUnlocked.map((b) => b.badgeId));

    // Find badges that are newly unlocked
    const newUnlocks = shouldBeUnlocked.filter(
      (milestone) => !unlockedBadgeIds.has(milestone.id)
    );

    // Unlock each new badge
    for (const milestone of newUnlocks) {
      const badge = await this.unlockBadge(milestone.id, currentStreak);
      if (badge) {
        unlockedEvents.push({
          badge,
          unlockedAt: badge.unlockedAt,
          streakCount: currentStreak,
          isNew: true,
        });
      }
    }

    return unlockedEvents;
  }

  /**
   * Unlock a specific badge
   */
  static async unlockBadge(
    badgeId: string,
    streakCount: number
  ): Promise<StreakBadge | null> {
    const milestone = getBadgeById(badgeId);
    if (!milestone) {
      console.error(`Badge not found: ${badgeId}`);
      return null;
    }

    const now = new Date().toISOString();
    const id = `${this.USER_ID}_${badgeId}_${Date.now()}`;

    try {
      // Insert into database
      db.runSync(
        `INSERT INTO streak_badges (id, user_id, badge_id, days_required, unlocked_at, streak_count, shared_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, this.USER_ID, badgeId, milestone.days, now, streakCount, 0]
      );

      // Update metadata
      db.runSync(
        'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
        [STREAK_METADATA_KEYS.LAST_BADGE_ID, badgeId]
      );

      db.runSync(
        'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
        [STREAK_METADATA_KEYS.LAST_BADGE_DATE, now]
      );

      console.log(`[BadgeManager] Unlocked badge: ${milestone.name}`);

      return {
        id,
        userId: this.USER_ID,
        badgeId,
        name: milestone.name,
        description: milestone.description,
        daysRequired: milestone.days,
        tier: milestone.tier,
        unlockedAt: now,
        streakCount,
        sharedCount: 0,
        state: 'unlocked',
      };
    } catch (error) {
      console.error(`[BadgeManager] Failed to unlock badge ${badgeId}:`, error);
      return null;
    }
  }

  /**
   * Get all badges for the user
   */
  static async getUserBadges(): Promise<StreakBadge[]> {
    try {
      const rows = db.getAllSync<StreakBadgeRow>(
        'SELECT * FROM streak_badges WHERE user_id = ? ORDER BY unlocked_at ASC',
        [this.USER_ID]
      );

      return rows.map((row) => {
        const milestone = getBadgeById(row.badge_id);
        return {
          id: row.id,
          userId: row.user_id,
          badgeId: row.badge_id,
          name: milestone?.name || 'Unknown Badge',
          description: milestone?.description || '',
          daysRequired: row.days_required,
          tier: (milestone?.tier || 1) as 1 | 2 | 3 | 4,
          unlockedAt: row.unlocked_at,
          streakCount: row.streak_count,
          sharedCount: row.shared_count,
          state: 'unlocked',
        };
      });
    } catch (error) {
      console.error('[BadgeManager] Failed to get user badges:', error);
      return [];
    }
  }

  /**
   * Get badge statistics for the user
   */
  static async getBadgeStats(currentStreak: number): Promise<StreakStats> {
    const unlockedBadges = await this.getUserBadges();

    // Count badges by tier
    const badgesByTier = {
      tier1: unlockedBadges.filter((b) => b.tier === 1).length,
      tier2: unlockedBadges.filter((b) => b.tier === 2).length,
      tier3: unlockedBadges.filter((b) => b.tier === 3).length,
      tier4: unlockedBadges.filter((b) => b.tier === 4).length,
    };

    // Get next milestone
    const nextMilestone = this.getNextMilestone(currentStreak);

    // Get longest streak from metadata
    const longestStreakRow = db.getFirstSync<{ value: string }>(
      'SELECT value FROM app_metadata WHERE key = ?',
      [STREAK_METADATA_KEYS.LONGEST_STREAK]
    );
    const longestStreak = longestStreakRow
      ? parseInt(longestStreakRow.value, 10)
      : currentStreak;

    return {
      currentStreak,
      longestStreak,
      totalBadgesUnlocked: unlockedBadges.length,
      badgesByTier,
      nextMilestone,
    };
  }

  /**
   * Get information about the next milestone
   */
  static getNextMilestone(currentStreak: number): NextMilestoneInfo | null {
    const nextBadge = getNextBadge(currentStreak);
    if (!nextBadge) return null;

    const daysRemaining = nextBadge.days - currentStreak;
    const progress = (currentStreak / nextBadge.days) * 100;

    return {
      badgeId: nextBadge.id,
      name: nextBadge.name,
      daysRequired: nextBadge.days,
      daysRemaining,
      progress: Math.min(Math.round(progress), 100),
    };
  }

  /**
   * Increment share count for a badge
   */
  static async incrementShareCount(badgeId: string): Promise<void> {
    try {
      db.runSync(
        'UPDATE streak_badges SET shared_count = shared_count + 1 WHERE badge_id = ? AND user_id = ?',
        [badgeId, this.USER_ID]
      );
      console.log(`[BadgeManager] Incremented share count for ${badgeId}`);
    } catch (error) {
      console.error('[BadgeManager] Failed to increment share count:', error);
    }
  }

  /**
   * Get all available badges with their current state
   */
  static async getAllBadgesWithState(
    currentStreak: number
  ): Promise<StreakBadge[]> {
    const unlockedBadges = await this.getUserBadges();
    const unlockedBadgeIds = new Set(unlockedBadges.map((b) => b.badgeId));

    return BADGE_MILESTONES.map((milestone) => {
      const isUnlocked = unlockedBadgeIds.has(milestone.id);
      const unlockedBadge = unlockedBadges.find(
        (b) => b.badgeId === milestone.id
      );

      if (isUnlocked && unlockedBadge) {
        return unlockedBadge;
      }

      // Determine state: active (in progress) or locked
      const isActive = currentStreak < milestone.days;
      const progress = isActive
        ? Math.round((currentStreak / milestone.days) * 100)
        : 0;

      return {
        id: `pending_${milestone.id}`,
        userId: this.USER_ID,
        badgeId: milestone.id,
        name: milestone.name,
        description: milestone.description,
        daysRequired: milestone.days,
        tier: milestone.tier,
        unlockedAt: '',
        streakCount: 0,
        sharedCount: 0,
        state: isActive ? 'active' : 'locked',
        progress,
      };
    });
  }

  /**
   * Update streak metadata in database
   */
  static async updateStreakMetadata(
    currentStreak: number,
    longestStreak: number
  ): Promise<void> {
    try {
      const now = new Date().toISOString();

      db.withTransactionSync(() => {
        db.runSync(
          'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
          [STREAK_METADATA_KEYS.CURRENT_STREAK, currentStreak.toString()]
        );

        db.runSync(
          'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
          [STREAK_METADATA_KEYS.LONGEST_STREAK, longestStreak.toString()]
        );

        db.runSync(
          'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
          [STREAK_METADATA_KEYS.LAST_UPDATED, now]
        );
      });

      console.log(
        `[BadgeManager] Updated streak metadata: current=${currentStreak}, longest=${longestStreak}`
      );
    } catch (error) {
      console.error('[BadgeManager] Failed to update streak metadata:', error);
    }
  }
}
