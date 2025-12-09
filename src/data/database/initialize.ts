import { db, enableForeignKeys } from './client';
import { Habit } from '@/hooks/useHabits';

// Default habits to seed on first run
const DEFAULT_HABITS: Omit<Habit, 'completions'>[] = [
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
    timePeriod: 'morning',
    reminderEnabled: true,
    reminderTime: '07:00',
    isDefault: true,
    type: 'positive',
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
    timePeriod: 'evening',
    reminderEnabled: false,
    isDefault: true,
    type: 'positive',
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
    timePeriod: 'allday',
    reminderEnabled: true,
    reminderTime: '09:00',
    isDefault: true,
    type: 'positive',
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
    timePeriod: 'morning',
    reminderEnabled: true,
    reminderTime: '18:00',
    isDefault: true,
    type: 'positive',
  },
];

/**
 * Initialize database schema and seed default data
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('[DB] Initializing database...');

    // Enable foreign keys first
    enableForeignKeys();

    // Drop and recreate tables to ensure clean schema
    // This is safe because Zustand will repopulate from memory
    db.execSync(`
      -- Habits Table
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL,
        streak INTEGER NOT NULL DEFAULT 0,
        category TEXT NOT NULL,
        color TEXT NOT NULL,
        frequency TEXT NOT NULL DEFAULT 'daily',
        frequency_type TEXT NOT NULL DEFAULT 'single',
        target_per_day INTEGER NOT NULL DEFAULT 1,
        selected_days TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
        time_period TEXT NOT NULL DEFAULT 'allday',
        reminder_enabled INTEGER NOT NULL DEFAULT 0,
        reminder_time TEXT,
        notification_ids TEXT,
        notes TEXT,
        is_default INTEGER NOT NULL DEFAULT 0,
        archived INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- App Metadata Table
      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      -- Completions Table
      CREATE TABLE IF NOT EXISTS completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        completion_count INTEGER NOT NULL DEFAULT 0,
        target_count INTEGER NOT NULL DEFAULT 1,
        timestamps TEXT NOT NULL DEFAULT '[]',
        UNIQUE(habit_id, date)
      );

      -- Entries Table
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        mood TEXT,
        note TEXT,
        timestamp INTEGER NOT NULL
      );

      -- Mascot Customization Table
      CREATE TABLE IF NOT EXISTS mascot_customization (
        id TEXT PRIMARY KEY DEFAULT 'default',
        name TEXT NOT NULL,
        eyes TEXT NOT NULL DEFAULT 'happy',
        eyebrows TEXT NOT NULL DEFAULT 'normal',
        mouth TEXT NOT NULL DEFAULT 'smile',
        blush_enabled INTEGER NOT NULL DEFAULT 1,
        blush_color TEXT NOT NULL DEFAULT '#FFB6C1',
        hair_style TEXT NOT NULL DEFAULT 'none',
        hair_color TEXT NOT NULL DEFAULT '#8B4513',
        hat TEXT NOT NULL DEFAULT 'none',
        glasses TEXT NOT NULL DEFAULT 'none',
        body_color TEXT NOT NULL DEFAULT '#7FD1AE',
        pattern TEXT NOT NULL DEFAULT 'solid',
        pattern_color TEXT,
        necklace TEXT NOT NULL DEFAULT 'none',
        special_effect TEXT NOT NULL DEFAULT 'none',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Habit Templates Table
      CREATE TABLE IF NOT EXISTS habit_templates (
        id TEXT PRIMARY KEY,
        version TEXT NOT NULL DEFAULT '1.0',
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        notes TEXT,
        author TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        duration TEXT NOT NULL,
        benefits TEXT NOT NULL DEFAULT '[]',
        outcomes TEXT NOT NULL DEFAULT '[]',
        timeline TEXT NOT NULL DEFAULT '[]',
        emoji TEXT NOT NULL,
        color TEXT NOT NULL,
        habits TEXT NOT NULL DEFAULT '[]'
      );

      -- Vacation Intervals Table
      CREATE TABLE IF NOT EXISTS vacation_intervals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_date TEXT NOT NULL,
        end_date TEXT,
        created_at TEXT NOT NULL
      );

      -- User Profile Table
      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY DEFAULT 'default',
        name TEXT,
        email TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- User Badges Table
      CREATE TABLE IF NOT EXISTS user_badges (
        badge_id TEXT NOT NULL PRIMARY KEY,
        unlocked_at TEXT NOT NULL,
        is_seen INTEGER DEFAULT 0
      );

      -- Badge Progress Table
      CREATE TABLE IF NOT EXISTS badge_progress (
        badge_id TEXT NOT NULL PRIMARY KEY,
        current_value INTEGER NOT NULL DEFAULT 0,
        meta TEXT,
        last_updated TEXT NOT NULL
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON completions(habit_id);
      CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);
      CREATE INDEX IF NOT EXISTS idx_entries_habit_id ON entries(habit_id);
      CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
      CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived);
      CREATE INDEX IF NOT EXISTS idx_habits_sort_order ON habits(sort_order);
      CREATE INDEX IF NOT EXISTS idx_templates_type ON habit_templates(type);
      CREATE INDEX IF NOT EXISTS idx_vacation_start ON vacation_intervals(start_date);
    `);

    console.log('[DB] Schema created successfully');

    // Check if we've already seeded
    try {
      const seedCheck = db.getFirstSync<{ value: string }>('SELECT value FROM app_metadata WHERE key = ?', ['initial_seed_done']);
      const isSeeded = seedCheck?.value === 'true';

      if (!isSeeded) {
        // Check if database is empty (no habits)
        const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM habits');
        const habitCount = result?.count ?? 0;

        if (habitCount === 0) {
          console.log('[DB] Database is empty, seeding default habits...');
          await seedDefaultHabits();
        } else {
          console.log(`[DB] Database already has ${habitCount} habits`);
        }

        // Mark as seeded
        db.runSync('INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)', ['initial_seed_done', 'true']);
      } else {
        console.log('[DB] Database already seeded, skipping');
      }
    } catch (seedError) {
      console.warn('[DB] Seed check failed, attempting seed anyway:', seedError);
      try {
        await seedDefaultHabits();
        db.runSync('INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)', ['initial_seed_done', 'true']);
      } catch (e) {
        console.warn('[DB] Seed failed (may already exist):', e);
      }
    }

    console.log('[DB] Initialization complete');
  } catch (error) {
    console.error('[DB] Initialization failed:', error);
    throw error;
  }
};

/**
 * Seed default habits into database
 */
const seedDefaultHabits = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();

    db.withTransactionSync(() => {
      DEFAULT_HABITS.forEach((habit, index) => {
        db.runSync(
          `INSERT OR IGNORE INTO habits (
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
            habit.timePeriod || 'allday',
            habit.reminderEnabled ? 1 : 0,
            habit.reminderTime || null,
            null,
            null,
            habit.isDefault ? 1 : 0,
            0,
            index,
            now,
            now,
          ]
        );
      });
    });

    console.log(`[DB] Seeded ${DEFAULT_HABITS.length} default habits`);
  } catch (error) {
    console.error('[DB] Failed to seed default habits:', error);
    throw error;
  }
};
