/**
 * Streak Calculator Service
 *
 * Calculates global streak statistics across all user habits
 * Implements the core streak calculation algorithm as specified in the design doc
 */

import { StreakCalculationResult, HabitCompletion } from './types';

/**
 * Date utility functions
 */
const DateUtils = {
  /**
   * Format date to YYYY-MM-DD string
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Get today's date as YYYY-MM-DD
   */
  getToday(): string {
    return this.formatDate(new Date());
  },

  /**
   * Parse YYYY-MM-DD string to Date
   */
  parseDate(dateStr: string): Date {
    return new Date(dateStr);
  },

  /**
   * Calculate difference in days between two dates
   */
  daysDifference(date1: string, date2: string): number {
    const d1 = this.parseDate(date1);
    const d2 = this.parseDate(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Check if date1 is exactly 1 day before date2
   */
  isConsecutiveDay(date1: string, date2: string): boolean {
    return this.daysDifference(date1, date2) === 1;
  },

  /**
   * Get date N days ago from today
   */
  getDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.formatDate(date);
  },
};

/**
 * Streak Calculator
 */
export class StreakCalculator {
  /**
   * Calculate global streak from habit completions
   * Uses the "longest ever streak" method as specified in the design doc
   *
   * @param completionsByHabit - Map of habit ID to array of completion records
   * @returns Streak calculation result with current and longest streaks
   */
  static calculateGlobalStreak(
    completionsByHabit: Map<string, HabitCompletion[]>
  ): StreakCalculationResult {
    // Collect all unique dates where ANY habit was completed successfully
    const allCompletionDates = new Set<string>();

    completionsByHabit.forEach((completions) => {
      completions.forEach((completion) => {
        // Only count dates where the target was met
        if (completion.isComplete) {
          allCompletionDates.add(completion.date);
        }
      });
    });

    // Convert to sorted array
    const sortedDates = Array.from(allCompletionDates).sort();

    if (sortedDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        completionDates: [],
        lastCompletionDate: null,
      };
    }

    // Calculate longest streak
    const longestStreak = this.findLongestConsecutiveStreak(sortedDates);

    // Calculate current active streak (from today backwards)
    const currentStreak = this.findCurrentActiveStreak(sortedDates);

    return {
      currentStreak,
      longestStreak,
      completionDates: sortedDates,
      lastCompletionDate: sortedDates[sortedDates.length - 1] || null,
    };
  }

  /**
   * Find the longest consecutive streak in a sorted array of dates
   */
  private static findLongestConsecutiveStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];

      if (DateUtils.isConsecutiveDay(prevDate, currDate)) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  /**
   * Find current active streak (from today backwards)
   * Breaks if user misses a day
   */
  private static findCurrentActiveStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    const today = DateUtils.getToday();
    const lastCompletionDate = sortedDates[sortedDates.length - 1];

    // Check if last completion was today or yesterday
    const daysSinceLastCompletion = DateUtils.daysDifference(
      lastCompletionDate,
      today
    );

    // If last completion was more than 1 day ago, streak is broken
    if (daysSinceLastCompletion > 1) {
      return 0;
    }

    // Count backwards from last completion date
    let streak = 1;
    let currentDate = lastCompletionDate;

    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const prevDate = sortedDates[i];

      if (DateUtils.isConsecutiveDay(prevDate, currentDate)) {
        streak++;
        currentDate = prevDate;
      } else {
        break; // Streak is broken
      }
    }

    return streak;
  }

  /**
   * Calculate streak from raw database completion records
   * Converts database format to HabitCompletion format
   */
  static calculateStreakFromDB(
    completions: Array<{
      habit_id: string;
      date: string;
      completion_count: number;
      target_count: number;
    }>
  ): StreakCalculationResult {
    // Group completions by habit
    const completionsByHabit = new Map<string, HabitCompletion[]>();

    completions.forEach((record) => {
      if (!completionsByHabit.has(record.habit_id)) {
        completionsByHabit.set(record.habit_id, []);
      }

      completionsByHabit.get(record.habit_id)!.push({
        date: record.date,
        completionCount: record.completion_count,
        targetCount: record.target_count,
        isComplete: record.completion_count >= record.target_count,
      });
    });

    return this.calculateGlobalStreak(completionsByHabit);
  }

  /**
   * Check if a streak is active (completed today or yesterday)
   */
  static isStreakActive(lastCompletionDate: string | null): boolean {
    if (!lastCompletionDate) return false;

    const today = DateUtils.getToday();
    const daysSince = DateUtils.daysDifference(lastCompletionDate, today);

    return daysSince <= 1;
  }

  /**
   * Get all dates in a streak range
   */
  static getStreakDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = DateUtils.parseDate(startDate);
    const end = DateUtils.parseDate(endDate);

    const current = new Date(start);
    while (current <= end) {
      dates.push(DateUtils.formatDate(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }
}

export { DateUtils };
