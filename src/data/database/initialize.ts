import { db, enableForeignKeys } from './client';
import { Habit } from '@/hooks/useHabits';

// Default habits to seed on first run
const DEFAULT_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Morning Meditation',
    emoji: '🧘',
    streak: 7,
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
    streak: 12,
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
    streak: 5,
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
    streak: 3,
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

// Schema SQL
const SCHEMA_SQL = `
-- Habits Table
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  streak INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  frequency_type TEXT NOT NULL DEFAULT 'single' CHECK (frequency_type IN ('single', 'multiple')),
  target_per_day INTEGER NOT NULL DEFAULT 1,
  selected_days TEXT NOT NULL,
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

-- Completions Table
CREATE TABLE IF NOT EXISTS completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  completion_count INTEGER NOT NULL DEFAULT 0,
  target_count INTEGER NOT NULL,
  timestamps TEXT NOT NULL,
  UNIQUE(habit_id, date)
);

-- Entries Table
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  mood TEXT,
  note TEXT,
  timestamp INTEGER NOT NULL
);

-- Mascot Customization Table
CREATE TABLE IF NOT EXISTS mascot_customization (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL,

  -- Face
  eyes TEXT NOT NULL DEFAULT 'happy',
  eyebrows TEXT NOT NULL DEFAULT 'normal',
  mouth TEXT NOT NULL DEFAULT 'smile',
  blush_enabled INTEGER NOT NULL DEFAULT 1,
  blush_color TEXT NOT NULL DEFAULT '#FFB6C1',

  -- Head Accessories
  hair_style TEXT NOT NULL DEFAULT 'none',
  hair_color TEXT NOT NULL DEFAULT '#8B4513',
  hat TEXT NOT NULL DEFAULT 'none',
  glasses TEXT NOT NULL DEFAULT 'none',

  -- Body
  body_color TEXT NOT NULL DEFAULT '#7FD1AE',
  pattern TEXT NOT NULL DEFAULT 'solid',
  pattern_color TEXT,

  -- Accessories
  necklace TEXT NOT NULL DEFAULT 'none',
  special_effect TEXT NOT NULL DEFAULT 'none',

  -- Metadata
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);
CREATE INDEX IF NOT EXISTS idx_entries_habit_id ON entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived);
CREATE INDEX IF NOT EXISTS idx_habits_sort_order ON habits(sort_order);
CREATE INDEX IF NOT EXISTS idx_mascot_updated ON mascot_customization(updated_at);
`;

/**
 * Initialize database schema and seed default data
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('[DB] Initializing database...');

    // Enable foreign keys
    enableForeignKeys();

    // Create tables
    db.execSync(SCHEMA_SQL);
    console.log('[DB] Schema created successfully');

    // Check if database is empty (no habits)
    const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM habits');
    const habitCount = result?.count ?? 0;

    if (habitCount === 0) {
      console.log('[DB] Database is empty, seeding default habits...');
      await seedDefaultHabits();
    } else {
      console.log(`[DB] Database already has ${habitCount} habits`);
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
          `INSERT INTO habits (
            id, name, emoji, streak, category, color,
            frequency, frequency_type, target_per_day, selected_days,
            reminder_enabled, reminder_time, notification_ids, notes,
            is_default, archived, sort_order, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            habit.reminderEnabled ? 1 : 0,
            habit.reminderTime,
            habit.notificationIds ? JSON.stringify(habit.notificationIds) : null,
            habit.notes || null,
            habit.isDefault ? 1 : 0,
            habit.archived ? 1 : 0,
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
