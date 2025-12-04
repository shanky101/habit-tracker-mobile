import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Habit, DailyCompletion, HabitEntry } from '../types/habit';
import { sqliteStorage } from './sqliteStorage';

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
      addHabit: (habit) =>
        set((state) => ({
          habits: [habit, ...state.habits],
        })),

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
      completeHabit: (id, date, entry) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;

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
        })),

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
