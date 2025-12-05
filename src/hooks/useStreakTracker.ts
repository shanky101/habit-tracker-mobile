/**
 * Streak Tracker Hook
 *
 * Integrates automatic streak tracking with the habit store
 * Subscribes to habit changes and triggers streak recalculation
 */

import { useEffect, useRef } from 'react';
import { useHabitStore } from '@/store/habitStore';
import { StreakTracker } from '@/services/streaks';
import { BadgeUnlockEvent } from '@/services/streaks/types';

/**
 * Hook to automatically track streaks when habits change
 * Call this once in your root App component
 */
export const useStreakTrackerIntegration = (
  onBadgeUnlock?: (events: BadgeUnlockEvent[]) => void
) => {
  const habits = useHabitStore((state) => state.habits);
  const isHydrated = useHabitStore((state) => state.isHydrated);
  const previousHabitsRef = useRef(habits);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Wait for hydration before initializing
    if (!isHydrated) return;

    // Initialize on first hydration
    if (!hasInitialized.current) {
      console.log('[useStreakTracker] Initializing streak tracking...');
      hasInitialized.current = true;

      // Calculate streaks on first load
      StreakTracker.updateStreaks().catch((error) => {
        console.error('[useStreakTracker] Initial calculation failed:', error);
      });

      // Register unlock listener if provided
      if (onBadgeUnlock) {
        const unsubscribe = StreakTracker.onBadgeUnlock(onBadgeUnlock);
        return () => {
          unsubscribe();
        };
      }

      return;
    }

    // Check if completions have changed
    const previousHabits = previousHabitsRef.current;
    const hasCompletionChanges = habits.some((habit) => {
      const prevHabit = previousHabits.find((h) => h.id === habit.id);
      if (!prevHabit) return true;

      // Check if completions object has changed
      return (
        JSON.stringify(habit.completions) !== JSON.stringify(prevHabit.completions)
      );
    });

    if (hasCompletionChanges) {
      console.log('[useStreakTracker] Completions changed, recalculating streaks...');
      StreakTracker.updateStreaks().catch((error) => {
        console.error('[useStreakTracker] Update failed:', error);
      });
    }

    // Update ref for next comparison
    previousHabitsRef.current = habits;
  }, [habits, isHydrated, onBadgeUnlock]);
};

/**
 * Hook to get current streak statistics
 * Returns current and longest streak counts
 */
export const useStreakStats = () => {
  const habits = useHabitStore((state) => state.habits);
  const isHydrated = useHabitStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    // Trigger update when habits change
    StreakTracker.updateStreaks().catch((error) => {
      console.error('[useStreakStats] Update failed:', error);
    });
  }, [habits, isHydrated]);

  return {
    getCurrentStats: StreakTracker.getCurrentStats,
    forceRecalculate: StreakTracker.forceRecalculate,
  };
};
