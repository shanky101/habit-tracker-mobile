import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  scheduleHabitNotifications,
  cancelHabitNotifications,
  requestNotificationPermissions,
} from '@/utils/notificationService';

export interface HabitEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  mood?: string; // emoji representing mood
  note?: string; // optional text note
  timestamp: number; // Unix timestamp
}

// Daily completion record for a specific date
export interface DailyCompletion {
  date: string; // ISO date string (YYYY-MM-DD)
  completionCount: number; // How many times completed today
  targetCount: number; // How many times needed today
  timestamps: number[]; // Unix timestamps for each completion
  entries: HabitEntry[]; // Mood/note entries for each completion
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  category: string;
  color: string;
  frequency: 'daily' | 'weekly';
  frequencyType?: 'single' | 'multiple'; // single = once per day, multiple = multiple times per day
  targetCompletionsPerDay: number; // How many times per day (1-20), defaults to 1
  selectedDays: number[];
  reminderEnabled: boolean;
  reminderTime: string | null;
  notificationIds?: string[]; // IDs of scheduled notifications for this habit
  notes?: string; // Optional notes/description for the habit
  completions: Record<string, DailyCompletion>; // Date-indexed completion records (YYYY-MM-DD)
  isDefault?: boolean; // Track if this is a default habit
  archived?: boolean; // Track if this habit is archived
  createdAt?: string; // ISO timestamp of when habit was created
}

interface HabitsContextType {
  habits: Habit[];
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => void;
  reorderHabits: (fromIndex: number, toIndex: number) => void;
  completeHabit: (id: string, date: string, entry?: { mood?: string; note?: string }) => void;
  uncompleteHabit: (id: string, date: string) => void;
  resetHabitForDate: (id: string, date: string) => void;
  addNoteToCompletion: (id: string, date: string, entry: { mood?: string; note?: string }) => void;
  getCompletionForDate: (id: string, date: string) => DailyCompletion | undefined;
  isHabitCompletedForDate: (id: string, date: string) => boolean;
  getCompletionProgress: (id: string, date: string) => { current: number; target: number };
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

const DEFAULT_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Morning Meditation',
    emoji: '🧘',
    streak: 0,
    category: 'mindfulness',
    color: 'purple',
    frequency: 'daily',
    frequencyType: 'single',
    targetCompletionsPerDay: 1,
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: true,
    reminderTime: '07:00',
    isDefault: true,
    completions: {},
  },
  {
    id: '2',
    name: 'Read 30 minutes',
    emoji: '📚',
    streak: 0,
    category: 'learning',
    color: 'blue',
    frequency: 'daily',
    frequencyType: 'multiple',
    targetCompletionsPerDay: 2,
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: false,
    reminderTime: null,
    isDefault: true,
    completions: {},
  },
  {
    id: '3',
    name: 'Drink 8 glasses of water',
    emoji: '💧',
    streak: 0,
    category: 'health',
    color: 'teal',
    frequency: 'daily',
    frequencyType: 'multiple',
    targetCompletionsPerDay: 8,
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: true,
    reminderTime: '09:00',
    isDefault: true,
    completions: {},
  },
  {
    id: '4',
    name: 'Exercise',
    emoji: '🏃',
    streak: 0,
    category: 'fitness',
    color: 'green',
    frequency: 'weekly',
    frequencyType: 'single',
    targetCompletionsPerDay: 1,
    selectedDays: [1, 3, 5],
    reminderEnabled: true,
    reminderTime: '18:00',
    isDefault: true,
    completions: {},
  },
];

export const HabitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);

  const addHabit = async (habit: Habit) => {
    // Schedule notifications if enabled
    let notificationIds: string[] = [];
    if (habit.reminderEnabled && habit.reminderTime) {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        notificationIds = await scheduleHabitNotifications({
          habitId: habit.id,
          habitName: habit.name,
          habitEmoji: habit.emoji,
          reminderTime: habit.reminderTime,
          selectedDays: habit.selectedDays,
        });
      }
    }

    setHabits((prevHabits) => [{ ...habit, notificationIds }, ...prevHabits]);
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    // Cancel old notifications if they exist
    if (habit.notificationIds && habit.notificationIds.length > 0) {
      await cancelHabitNotifications(habit.notificationIds);
    }

    // Schedule new notifications if reminder is enabled
    let notificationIds: string[] = [];
    const updatedHabit = { ...habit, ...updates };
    if (updatedHabit.reminderEnabled && updatedHabit.reminderTime) {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        notificationIds = await scheduleHabitNotifications({
          habitId: updatedHabit.id,
          habitName: updatedHabit.name,
          habitEmoji: updatedHabit.emoji,
          reminderTime: updatedHabit.reminderTime,
          selectedDays: updatedHabit.selectedDays,
        });
      }
    }

    setHabits((prevHabits) =>
      prevHabits.map((h) =>
        h.id === id ? { ...updatedHabit, notificationIds } : h
      )
    );
  };

  const deleteHabit = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit?.notificationIds && habit.notificationIds.length > 0) {
      await cancelHabitNotifications(habit.notificationIds);
    }
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id));
  };

  const archiveHabit = (id: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id ? { ...habit, archived: true } : habit
      )
    );
  };

  const reorderHabits = (fromIndex: number, toIndex: number) => {
    setHabits((prevHabits) => {
      const result = [...prevHabits];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Complete a habit for a specific date (increment completion count)
  const completeHabit = (id: string, date: string, entry?: { mood?: string; note?: string }) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== id) return habit;

        const completions = { ...habit.completions };
        const existing = completions[date];
        const timestamp = Date.now();

        if (existing) {
          // Increment existing completion
          if (existing.completionCount < existing.targetCount) {
            const newEntry: HabitEntry | undefined = entry
              ? {
                id: `${id}-${date}-${timestamp}`,
                date,
                mood: entry.mood,
                note: entry.note,
                timestamp,
              }
              : undefined;

            completions[date] = {
              ...existing,
              completionCount: existing.completionCount + 1,
              timestamps: [...existing.timestamps, timestamp],
              entries: newEntry ? [...existing.entries, newEntry] : existing.entries,
            };
          }
        } else {
          // Create new completion record for this date
          const newEntry: HabitEntry | undefined = entry
            ? {
              id: `${id}-${date}-${timestamp}`,
              date,
              mood: entry.mood,
              note: entry.note,
              timestamp,
            }
            : undefined;

          completions[date] = {
            date,
            completionCount: 1,
            targetCount: habit.targetCompletionsPerDay,
            timestamps: [timestamp],
            entries: newEntry ? [newEntry] : [],
          };
        }

        return { ...habit, completions };
      })
    );
  };

  // Decrement or remove completion for a specific date
  const uncompleteHabit = (id: string, date: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== id) return habit;

        const completions = { ...habit.completions };
        const existing = completions[date];

        if (!existing) return habit;

        if (existing.completionCount <= 1) {
          // Remove the completion record entirely
          delete completions[date];
        } else {
          // Decrement the count
          const newTimestamps = [...existing.timestamps];
          newTimestamps.pop(); // Remove last timestamp
          const newEntries = [...existing.entries];
          if (newEntries.length > 0) {
            newEntries.pop(); // Remove last entry if exists
          }

          completions[date] = {
            ...existing,
            completionCount: existing.completionCount - 1,
            timestamps: newTimestamps,
            entries: newEntries,
          };
        }

        return { ...habit, completions };
      })
    );
  };

  // Reset habit completion for a specific date (remove all completions)
  const resetHabitForDate = (id: string, date: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== id) return habit;

        const completions = { ...habit.completions };
        delete completions[date];

        return { ...habit, completions };
      })
    );
  };

  // Add or update a note/mood for an existing completion
  const addNoteToCompletion = (id: string, date: string, entry: { mood?: string; note?: string }) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== id) return habit;

        const completions = { ...habit.completions };
        const existing = completions[date];

        if (!existing) {
          // No completion exists for this date, create one with the note/mood
          const timestamp = Date.now();
          const newEntry: HabitEntry = {
            id: `${id}-${date}-${timestamp}`,
            date,
            mood: entry.mood,
            note: entry.note,
            timestamp,
          };

          completions[date] = {
            date,
            completionCount: 1,
            targetCount: habit.targetCompletionsPerDay,
            timestamps: [timestamp],
            entries: [newEntry],
          };
        } else {
          // Completion exists, add the note/mood to the most recent entry or create a new one
          const timestamp = Date.now();
          const newEntry: HabitEntry = {
            id: `${id}-${date}-${timestamp}`,
            date,
            mood: entry.mood,
            note: entry.note,
            timestamp,
          };

          completions[date] = {
            ...existing,
            entries: [...existing.entries, newEntry],
          };
        }

        return { ...habit, completions };
      })
    );
  };

  // Get completion record for a specific date
  const getCompletionForDate = (id: string, date: string): DailyCompletion | undefined => {
    const habit = habits.find((h) => h.id === id);
    return habit?.completions[date];
  };

  // Check if habit is fully completed for a specific date
  const isHabitCompletedForDate = (id: string, date: string): boolean => {
    const completion = getCompletionForDate(id, date);
    if (!completion) return false;
    return completion.completionCount >= completion.targetCount;
  };

  // Get completion progress for a specific date
  const getCompletionProgress = (id: string, date: string): { current: number; target: number } => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return { current: 0, target: 1 };

    const completion = habit.completions[date];
    if (!completion) {
      return { current: 0, target: habit.targetCompletionsPerDay };
    }

    return {
      current: completion.completionCount,
      target: completion.targetCount,
    };
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
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
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

// Re-export the new Zustand-based useHabits hook for backward compatibility
export { useHabits } from '../hooks/useHabits';
