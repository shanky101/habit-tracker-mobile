import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Habit, DailyCompletion, HabitEntry } from '../types/habit';
import { sqliteStorage } from './sqliteStorage';
import { useBadgeStore } from './badgeStore';

interface HabitState {
  // State
  habits: Habit[];
  isHydrated: boolean;

  // Actions - Habit CRUD
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  reorderHabits: (fromIndex: number, toIndex: number) => void;

  // Completion actions
  completeHabit: (id: string, date: string, entry?: { mood?: string; note?: string }) => void;
  uncompleteHabit: (id: string, date: string) => void;
  resetHabitForDate: (id: string, date: string) => void;
  addNoteToCompletion: (id: string, date: string, entry: { mood?: string; note?: string }) => void;

  // Selectors
  getCompletionForDate: (id: string, date: string) => DailyCompletion | undefined;
  isHabitCompletedForDate: (id: string, date: string) => boolean;
  getCompletionProgress: (id: string, date: string) => { current: number; target: number };

  // Internal
  setHydrated: (hydrated: boolean) => void;
  _setHabits: (habits: Habit[]) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      // Initial state
      habits: [],
      isHydrated: false,

      // Habit CRUD operations
      addHabit: (habit) => {
        set((state) => ({
          habits: [habit, ...state.habits],
        }));

        // Check for creation badges
        // We need to pass the new total count of habits
        const currentHabits = get().habits;
        useBadgeStore.getState().checkUnlock('habit_create', {
          habitsCount: currentHabits.length,
          category: habit.category,
          type: habit.type,
        });
      },

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updates } : habit
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),

      archiveHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, archived: true } : habit
          ),
        })),

      reorderHabits: (fromIndex, toIndex) =>
        set((state) => {
          const newHabits = [...state.habits];
          const [movedHabit] = newHabits.splice(fromIndex, 1);
          newHabits.splice(toIndex, 0, movedHabit);
          return { habits: newHabits };
        }),

      // Completion operations
      completeHabit: (id, date, entry) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;

            // Prevent future completions
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const completionDate = new Date(date);
            completionDate.setHours(0, 0, 0, 0);

            if (completionDate > today) {
              console.warn('Cannot complete habit for future date');
              return habit;
            }

            const existingCompletion = habit.completions[date];
            const now = Date.now();

            // Create new entry if mood or note provided
            const newEntry: HabitEntry | undefined =
              entry?.mood || entry?.note
                ? {
                  id: `${id}-${date}-${now}`,
                  date,
                  mood: entry.mood,
                  note: entry.note,
                  timestamp: now,
                }
                : undefined;

            if (existingCompletion) {
              // Increment existing completion
              return {
                ...habit,
                completions: {
                  ...habit.completions,
                  [date]: {
                    ...existingCompletion,
                    completionCount: existingCompletion.completionCount + 1,
                    timestamps: [...existingCompletion.timestamps, now],
                    entries: newEntry
                      ? [...existingCompletion.entries, newEntry]
                      : existingCompletion.entries,
                  },
                },
              };
            } else {
              // Create new completion
              return {
                ...habit,
                completions: {
                  ...habit.completions,
                  [date]: {
                    date,
                    completionCount: 1,
                    targetCount: habit.targetCompletionsPerDay,
                    timestamps: [now],
                    entries: newEntry ? [newEntry] : [],
                  },
                },
              };
            }
          }),
        }));

        // Trigger badge check
        const habit = get().habits.find(h => h.id === id);
        if (habit) {
          const completion = habit.completions[date];
          const currentStreak = calculateStreak(habit); // Helper needed or simplified logic

          // Calculate total completions across all habits
          const allHabits = get().habits;
          const totalCompletions = allHabits.reduce((acc, h) => {
            return acc + Object.values(h.completions).reduce((sum, c) => sum + c.completionCount, 0);
          }, 0);

          useBadgeStore.getState().checkUnlock('habit_complete', {
            streak: currentStreak,
            totalCompletions,
            timestamp: Date.now(),
            category: habit.category,
            habitId: id,
            // Add other context as needed
          });
        }
      },

      uncompleteHabit: (id, date) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;

            const existingCompletion = habit.completions[date];
            if (!existingCompletion) return habit;

            if (existingCompletion.completionCount <= 1) {
              // Remove completion entirely
              const { [date]: removed, ...remainingCompletions } = habit.completions;
              return {
                ...habit,
                completions: remainingCompletions,
              };
            } else {
              // Decrement completion count
              const newTimestamps = [...existingCompletion.timestamps];
              newTimestamps.pop(); // Remove last timestamp

              const newEntries = [...existingCompletion.entries];
              newEntries.pop(); // Remove last entry

              return {
                ...habit,
                completions: {
                  ...habit.completions,
                  [date]: {
                    ...existingCompletion,
                    completionCount: existingCompletion.completionCount - 1,
                    timestamps: newTimestamps,
                    entries: newEntries,
                  },
                },
              };
            }
          }),
        })),

      resetHabitForDate: (id, date) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;

            const { [date]: removed, ...remainingCompletions } = habit.completions;
            return {
              ...habit,
              completions: remainingCompletions,
            };
          }),
        })),

      // Add or update note/mood for existing completion
      addNoteToCompletion: (id, date, entry) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;

            const existingCompletion = habit.completions[date];
            const now = Date.now();

            const newEntry: HabitEntry = {
              id: `${id}-${date}-${now}`,
              date,
              mood: entry.mood,
              note: entry.note,
              timestamp: now,
            };

            if (!existingCompletion) {
              // No completion exists, create one with the note
              return {
                ...habit,
                completions: {
                  ...habit.completions,
                  [date]: {
                    date,
                    completionCount: 1,
                    targetCount: habit.targetCompletionsPerDay,
                    timestamps: [now],
                    entries: [newEntry],
                  },
                },
              };
            } else {
              // Add note to existing completion
              return {
                ...habit,
                completions: {
                  ...habit.completions,
                  [date]: {
                    ...existingCompletion,
                    entries: [...existingCompletion.entries, newEntry],
                  },
                },
              };
            }
          }),
        })),

      // Selectors
      getCompletionForDate: (id, date) => {
        const habit = get().habits.find((h) => h.id === id);
        return habit?.completions[date];
      },

      isHabitCompletedForDate: (id, date) => {
        const completion = get().getCompletionForDate(id, date);
        if (!completion) return false;
        return completion.completionCount >= completion.targetCount;
      },

      getCompletionProgress: (id, date) => {
        const habit = get().habits.find((h) => h.id === id);
        const completion = habit?.completions[date];

        return {
          current: completion?.completionCount || 0,
          target: habit?.targetCompletionsPerDay || 1,
        };
      },

      // Internal methods
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      _setHabits: (habits) => set({ habits }),
    }),
    {
      name: 'habit-store',
      storage: createJSONStorage(() => sqliteStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // No migration needed yet, just return the state as-is
        // This prevents the "no migrate function" warning
        return persistedState;
      },
      onRehydrateStorage: () => {
        console.log('[Store] Starting hydration...');
        return (state, error) => {
          if (error) {
            console.error('[Store] Hydration error:', error);
          } else {
            console.log('[Store] Hydration complete');
            state?.setHydrated(true);
          }
        };
      },
    }
  )
);

// Helper to calculate current streak
function calculateStreak(habit: Habit): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let checkDate = new Date(today);

  // Check today first
  const todayStr = checkDate.toISOString().split('T')[0];
  const todayCompletion = habit.completions[todayStr];

  if (todayCompletion && todayCompletion.completionCount >= habit.targetCompletionsPerDay) {
    streak++;
  }

  // Iterate backwards
  while (true) {
    checkDate.setDate(checkDate.getDate() - 1);
    const dateStr = checkDate.toISOString().split('T')[0];
    const completion = habit.completions[dateStr];

    if (completion && completion.completionCount >= habit.targetCompletionsPerDay) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
