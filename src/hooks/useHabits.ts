import { useHabitStore } from '../store/habitStore';
import { Habit, DailyCompletion, HabitEntry } from '../types/habit';

/**
 * Compatibility hook that wraps Zustand store
 * Provides the same API as the old HabitsContext
 * This allows existing components to work without changes
 */
export const useHabits = () => {
  // Select all state and actions from store
  const habits = useHabitStore((state) => state.habits);
  const isHydrated = useHabitStore((state) => state.isHydrated);

  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const archiveHabit = useHabitStore((state) => state.archiveHabit);
  const reorderHabits = useHabitStore((state) => state.reorderHabits);

  const completeHabit = useHabitStore((state) => state.completeHabit);
  const uncompleteHabit = useHabitStore((state) => state.uncompleteHabit);
  const resetHabitForDate = useHabitStore((state) => state.resetHabitForDate);
  const addNoteToCompletion = useHabitStore((state) => state.addNoteToCompletion);
  const addProgress = useHabitStore((state) => state.addProgress);
  const removeProgress = useHabitStore((state) => state.removeProgress);

  const getCompletionForDate = useHabitStore((state) => state.getCompletionForDate);
  const isHabitCompletedForDate = useHabitStore((state) => state.isHabitCompletedForDate);
  const getCompletionProgress = useHabitStore((state) => state.getCompletionProgress);

  // Return same interface as HabitsContext
  return {
    habits,
    isHydrated,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    reorderHabits,
    completeHabit,
    uncompleteHabit,
    resetHabitForDate,
    addNoteToCompletion,
    getCompletionForDate,
    isHabitCompletedForDate,
    getCompletionProgress,
    addProgress,
    removeProgress,
  };
};

// Re-export types for convenience
export type { Habit, DailyCompletion, HabitEntry };
