/**
 * Streak Tracker Service
 *
 * Automatically calculates global streaks and checks for badge unlocks
 * Runs after habit completion changes
 */

import { db } from '@/data/database/client';
import { StreakCalculator } from './StreakCalculator';
import { BadgeManager } from './BadgeManager';
import { BadgeUnlockEvent } from './types';

/**
 * Streak Tracker - Background service for streak calculation and badge unlocking
 */
export class StreakTracker {
  private static isProcessing = false;
  private static listeners: Array<(events: BadgeUnlockEvent[]) => void> = [];

  /**
   * Register a listener for badge unlock events
   */
  static onBadgeUnlock(listener: (events: BadgeUnlockEvent[]) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of badge unlock events
   */
  private static notifyListeners(events: BadgeUnlockEvent[]): void {
    if (events.length === 0) return;

    this.listeners.forEach((listener) => {
      try {
        listener(events);
      } catch (error) {
        console.error('[StreakTracker] Listener error:', error);
      }
    });
  }

  /**
   * Update streaks after habit completions change
   * This is the main entry point called after habit data changes
   */
  static async updateStreaks(): Promise<void> {
    // Prevent concurrent executions
    if (this.isProcessing) {
      console.log('[StreakTracker] Already processing, skipping...');
      return;
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      console.log('[StreakTracker] Starting streak calculation...');

      // Get all completion records from database
      const completions = db.getAllSync<{
        habit_id: string;
        date: string;
        completion_count: number;
        target_count: number;
      }>('SELECT habit_id, date, completion_count, target_count FROM completions');

      if (completions.length === 0) {
        console.log('[StreakTracker] No completions found');
        await BadgeManager.updateStreakMetadata(0, 0);
        this.isProcessing = false;
        return;
      }

      // Calculate global streak
      const streakResult = StreakCalculator.calculateStreakFromDB(completions);
      console.log(
        `[StreakTracker] Calculated streaks - Current: ${streakResult.currentStreak}, Longest: ${streakResult.longestStreak}`
      );

      // Update metadata in database
      await BadgeManager.updateStreakMetadata(
        streakResult.currentStreak,
        streakResult.longestStreak
      );

      // Check for new badge unlocks based on longest streak
      const newUnlocks = await BadgeManager.checkForNewUnlocks(
        streakResult.longestStreak
      );

      if (newUnlocks.length > 0) {
        console.log(
          `[StreakTracker] 🎉 Unlocked ${newUnlocks.length} new badge(s)!`,
          newUnlocks.map((u) => u.badge.name)
        );

        // Notify listeners (for animations, etc.)
        this.notifyListeners(newUnlocks);
      }

      const duration = Date.now() - startTime;
      console.log(`[StreakTracker] Completed in ${duration}ms`);
    } catch (error) {
      console.error('[StreakTracker] Error updating streaks:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get current streak statistics
   * Fast read-only operation from metadata
   */
  static async getCurrentStats(): Promise<{
    currentStreak: number;
    longestStreak: number;
  }> {
    try {
      const currentRow = db.getFirstSync<{ value: string }>(
        'SELECT value FROM app_metadata WHERE key = ?',
        ['global_streak_current']
      );

      const longestRow = db.getFirstSync<{ value: string }>(
        'SELECT value FROM app_metadata WHERE key = ?',
        ['global_streak_longest']
      );

      return {
        currentStreak: currentRow ? parseInt(currentRow.value, 10) : 0,
        longestStreak: longestRow ? parseInt(longestRow.value, 10) : 0,
      };
    } catch (error) {
      console.error('[StreakTracker] Error getting current stats:', error);
      return { currentStreak: 0, longestStreak: 0 };
    }
  }

  /**
   * Force recalculation of all streaks
   * Use this for debugging or data migration
   */
  static async forceRecalculate(): Promise<void> {
    console.log('[StreakTracker] Force recalculating all streaks...');
    await this.updateStreaks();
  }
}
