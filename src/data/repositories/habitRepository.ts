import { db } from '../database/client';
import { Habit, DailyCompletion, HabitEntry } from '@/hooks/useHabits';
import { HabitRow, CompletionRow, EntryRow } from './types';

/**
 * Safe JSON parse helpers - return default values on parse failure
 */
const safeParseJSON = <T>(jsonString: string | null, defaultValue: T): T => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('[Repository] JSON parse error:', error);
    return defaultValue;
  }
};

/**
 * Denormalize database rows into Habit object
 * Converts normalized SQLite data into the denormalized shape used by the UI
 */
const denormalize = (
  habitRow: HabitRow,
  completionRows: CompletionRow[],
  entryRows: EntryRow[]
): Habit => {
  // Build completions map
  const completions: Record<string, DailyCompletion> = {};

  completionRows.forEach((completionRow) => {
    const entriesForDate = entryRows.filter(
      (entry) => entry.date === completionRow.date
    );

    const habitEntries: HabitEntry[] = entriesForDate.map((entry) => ({
      id: entry.id,
      date: entry.date,
      mood: entry.mood || undefined,
      note: entry.note || undefined,
      timestamp: entry.timestamp,
    }));

    completions[completionRow.date] = {
      date: completionRow.date,
      completionCount: completionRow.completion_count,
      targetCount: completionRow.target_count,
      timestamps: safeParseJSON<number[]>(completionRow.timestamps, []),
      entries: habitEntries,
    };
  });

  // Parse JSON fields with safe parsing
  const selectedDays = safeParseJSON<number[]>(habitRow.selected_days, [0, 1, 2, 3, 4, 5, 6]);
  const notificationIds = habitRow.notification_ids
    ? safeParseJSON<string[]>(habitRow.notification_ids, [])
    : undefined;

  return {
    id: habitRow.id,
    name: habitRow.name,
    emoji: habitRow.emoji,
    streak: habitRow.streak,
    category: habitRow.category,
    color: habitRow.color,
    frequency: habitRow.frequency,
    frequencyType: habitRow.frequency_type,
    targetCompletionsPerDay: habitRow.target_per_day,
    selectedDays,
    timePeriod: (habitRow.time_period as any) || 'anytime',
    reminderEnabled: habitRow.reminder_enabled === 1,
    reminderTime: habitRow.reminder_time || undefined,
    notificationIds,
    notes: habitRow.notes || undefined,
    completions,
    isDefault: habitRow.is_default === 1,
    archived: habitRow.archived === 1,
    createdAt: habitRow.created_at, // Map database created_at to createdAt
  };
};

/**
 * Repository for habit data access
 */
export const habitRepository = {
  /**
   * Get all habits (excluding archived by default)
   */
  getAll: async (includeArchived = false): Promise<Habit[]> => {
    try {
      const query = includeArchived
        ? 'SELECT * FROM habits ORDER BY sort_order'
        : 'SELECT * FROM habits WHERE archived = 0 ORDER BY sort_order';

      const habitRows = db.getAllSync<HabitRow>(query);

      return habitRows.map((habitRow) => {
        // Get completions for this habit
        const completionRows = db.getAllSync<CompletionRow>(
          'SELECT * FROM completions WHERE habit_id = ?',
          [habitRow.id]
        );

        // Get entries for this habit
        const entryRows = db.getAllSync<EntryRow>(
          'SELECT * FROM entries WHERE habit_id = ?',
          [habitRow.id]
        );

        return denormalize(habitRow, completionRows, entryRows);
      });
    } catch (error) {
      console.error('[Repository] getAll failed:', error);
      throw error;
    }
  },

  /**
   * Get a single habit by ID
   */
  getById: async (id: string): Promise<Habit | null> => {
    try {
      const habitRow = db.getFirstSync<HabitRow>(
        'SELECT * FROM habits WHERE id = ?',
        [id]
      );

      if (!habitRow) {
        return null;
      }

      // Get completions for this habit
      const completionRows = db.getAllSync<CompletionRow>(
        'SELECT * FROM completions WHERE habit_id = ?',
        [id]
      );

      // Get entries for this habit
      const entryRows = db.getAllSync<EntryRow>(
        'SELECT * FROM entries WHERE habit_id = ?',
        [id]
      );

      return denormalize(habitRow, completionRows, entryRows);
    } catch (error) {
      console.error('[Repository] getById failed:', error);
      throw error;
    }
  },

  /**
   * Full sync - replaces all data in database
   * Used by Zustand persist middleware
   */
  syncAll: async (habits: Habit[]): Promise<void> => {
    try {
      db.withTransactionSync(() => {
        // Clear existing data
        db.runSync('DELETE FROM entries');
        db.runSync('DELETE FROM completions');
        db.runSync('DELETE FROM habits');

        const now = new Date().toISOString();

        // Insert all habits and their data
        habits.forEach((habit, index) => {
          // Insert habit
          db.runSync(
            `INSERT INTO habits (
              id, name, emoji, streak, category, color,
              frequency, frequency_type, target_per_day, selected_days, time_period,
              reminder_enabled, reminder_time, notification_ids, notes,
              is_default, archived, sort_order, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              habit.id,
              habit.name,
              habit.emoji,
              habit.streak,
              habit.category,
              habit.color,
              habit.frequency,
              habit.frequencyType || 'single',
              habit.targetCompletionsPerDay,
              JSON.stringify(habit.selectedDays),
              habit.timePeriod || 'anytime',
              habit.reminderEnabled ? 1 : 0,
              habit.reminderTime || null,
              habit.notificationIds ? JSON.stringify(habit.notificationIds) : null,
              habit.notes || null,
              habit.isDefault ? 1 : 0,
              habit.archived ? 1 : 0,
              index,
              now,
              now,
            ]
          );

          // Insert completions and entries
          Object.entries(habit.completions).forEach(([date, completion]) => {
            // Insert completion
            db.runSync(
              `INSERT INTO completions (habit_id, date, completion_count, target_count, timestamps)
               VALUES (?, ?, ?, ?, ?)`,
              [
                habit.id,
                date,
                completion.completionCount,
                completion.targetCount,
                JSON.stringify(completion.timestamps),
              ]
            );

            // Insert entries
            completion.entries.forEach((entry) => {
              db.runSync(
                `INSERT INTO entries (id, habit_id, date, mood, note, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [entry.id, habit.id, date, entry.mood || null, entry.note || null, entry.timestamp]
              );
            });
          });
        });
      });

      console.log(`[Repository] Synced ${habits.length} habits to database`);
    } catch (error) {
      console.error('[Repository] syncAll failed:', error);
      throw error;
    }
  },

  /**
   * Delete all data (for removeItem in storage adapter)
   */
  deleteAll: async (): Promise<void> => {
    try {
      db.withTransactionSync(() => {
        db.runSync('DELETE FROM entries');
        db.runSync('DELETE FROM completions');
        db.runSync('DELETE FROM habits');
      });
      console.log('[Repository] All data deleted');
    } catch (error) {
      console.error('[Repository] deleteAll failed:', error);
      throw error;
    }
  },
};
