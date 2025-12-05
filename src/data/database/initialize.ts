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
    timePeriod: 'morning',
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
    timePeriod: 'evening',
    reminderEnabled: false,
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
    timePeriod: 'allday',
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
    timePeriod: 'morning',
    reminderEnabled: true,
    reminderTime: '18:00',
    isDefault: true,
    completions: {},
  },
];

// Schema SQL
const SCHEMA_VERSION = 4; // Increment version for migration

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
  time_period TEXT NOT NULL DEFAULT 'allday' CHECK (time_period IN ('allday', 'morning', 'afternoon', 'evening', 'night')),
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
 * Check current schema version and run migrations if needed
 */
const runMigrations = (): void => {
  try {
    // Get current version (default to 1 if no version table)
    let currentVersion = 1;

    try {
      const versionResult = db.getFirstSync<{ version: number }>('SELECT version FROM schema_version LIMIT 1');
      currentVersion = versionResult?.version ?? 1;
    } catch (error) {
      // schema_version table doesn't exist, this is version 1
      db.execSync(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY
        );
        INSERT INTO schema_version (version) VALUES (1);
      `);
    }

    console.log(`[DB] Current schema version: ${currentVersion}`);

    // Run migrations
    if (currentVersion < 2) {
      console.log('[DB] Running migration to version 2: Adding time_period column...');

      // Check if column already exists
      const columns = db.getAllSync<{ name: string }>('PRAGMA table_info(habits)');
      const hasTimePeriod = columns.some(col => col.name === 'time_period');

      if (!hasTimePeriod) {
        db.execSync(`
          ALTER TABLE habits ADD COLUMN time_period TEXT NOT NULL DEFAULT 'anytime' CHECK (time_period IN ('anytime', 'morning', 'afternoon', 'evening', 'night'));
        `);
        console.log('[DB] Added time_period column successfully');
      } else {
        console.log('[DB] time_period column already exists, skipping');
      }

      // Update version
      db.runSync('UPDATE schema_version SET version = 2');
      console.log('[DB] Migration to version 2 complete');
    }

    // Migration to version 3: Fix existing seed habits to have is_default=1
    if (currentVersion < 3) {
      console.log('[DB] Migrating to version 3: Fixing seed habits is_default flag');
      // Update the 5 seed habits (IDs 1-5) to mark them as default
      db.runSync(`
        UPDATE habits 
        SET is_default = 1 
        WHERE id IN ('1', '2', '3', '4', '5')
      `);
      console.log('[DB] Marked seed habits as default');

      // Update version
      db.runSync('UPDATE schema_version SET version = 3');
      console.log('[DB] Migration to version 3 complete');
    }

    // Migration to version 4: Fix CHECK constraint for time_period (anytime -> allday)
    if (currentVersion < 4) {
      console.log('[DB] Migrating to version 4: Updating time_period constraint');

      db.withTransactionSync(() => {
        // 1. Rename existing table
        db.runSync('ALTER TABLE habits RENAME TO habits_old');

        // 2. Create new table with correct constraint
        db.runSync(`
          CREATE TABLE habits (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            emoji TEXT NOT NULL,
            streak INTEGER NOT NULL DEFAULT 0,
            category TEXT NOT NULL,
            color TEXT NOT NULL,
            frequency TEXT NOT NULL,
            frequency_type TEXT NOT NULL DEFAULT 'single',
            target_per_day INTEGER NOT NULL DEFAULT 1,
            selected_days TEXT NOT NULL,
            time_period TEXT NOT NULL DEFAULT 'allday' CHECK (time_period IN ('allday', 'morning', 'afternoon', 'evening', 'night')),
            reminder_enabled INTEGER NOT NULL DEFAULT 0,
            reminder_time TEXT,
            notification_ids TEXT,
            notes TEXT,
            is_default INTEGER NOT NULL DEFAULT 0,
            archived INTEGER NOT NULL DEFAULT 0,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        `);

        // 3. Copy data, converting 'anytime' to 'allday'
        db.runSync(`
          INSERT INTO habits (
            id, name, emoji, streak, category, color, frequency, frequency_type,
            target_per_day, selected_days, time_period, reminder_enabled, reminder_time,
            notification_ids, notes, is_default, archived, sort_order, created_at, updated_at
          )
          SELECT 
            id, name, emoji, streak, category, color, frequency, frequency_type,
            target_per_day, selected_days, 
            CASE WHEN time_period = 'anytime' THEN 'allday' ELSE time_period END,
            reminder_enabled, reminder_time,
            notification_ids, notes, is_default, archived, sort_order, created_at, updated_at
          FROM habits_old
        `);

        // 4. Drop old table
        db.runSync('DROP TABLE habits_old');

        // 5. Recreate indexes
        db.runSync('CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived)');
        db.runSync('CREATE INDEX IF NOT EXISTS idx_habits_sort_order ON habits(sort_order)');
      });

      console.log('[DB] Updated habits table with correct constraint');

      // Update version
      db.runSync('UPDATE schema_version SET version = 4');
      console.log('[DB] Migration to version 4 complete');
    }

    if (currentVersion < SCHEMA_VERSION) {
      console.log(`[DB] Schema updated to version ${SCHEMA_VERSION}`);
    }
  } catch (error) {
    console.error('[DB] Migration failed:', error);
    throw error;
  }
};

/**
 * Initialize database schema and seed default data
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('[DB] Initializing database...');

    // Enable foreign keys
    enableForeignKeys();

    // Create tables
    db.execSync(`
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
    `);

    // Additional tables
    db.execSync(`
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
    `);

    console.log('[DB] Schema created successfully');

    // Run migrations for existing databases
    runMigrations();

    // Check if we've already seeded
    const seedCheck = db.getFirstSync<{ value: string }>('SELECT value FROM app_metadata WHERE key = ?', ['initial_seed_done']);
    const isSeeded = seedCheck?.value === 'true';

    // Check if database is empty (no habits)
    const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM habits');
    const habitCount = result?.count ?? 0;

    if (!isSeeded) {
      if (habitCount === 0) {
        console.log('[DB] Database is empty and not seeded, seeding default habits...');
        await seedDefaultHabits();
      } else {
        console.log(`[DB] Database already has ${habitCount} habits, marking as seeded`);
      }

      // Mark as seeded
      db.runSync('INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)', ['initial_seed_done', 'true']);
    } else {
      console.log('[DB] Database already seeded, skipping');
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
      });
    });

    console.log(`[DB] Seeded ${DEFAULT_HABITS.length} default habits`);
  } catch (error) {
    console.error('[DB] Failed to seed default habits:', error);
    throw error;
  }
};
