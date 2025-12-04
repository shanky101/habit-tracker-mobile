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
  selected_days TEXT NOT NULL, -- JSON array of day indices [0-6]
  reminder_enabled INTEGER NOT NULL DEFAULT 0, -- SQLite boolean (0 or 1)
  reminder_time TEXT,
  notification_ids TEXT, -- JSON array of notification IDs
  notes TEXT,
  is_default INTEGER NOT NULL DEFAULT 0, -- SQLite boolean
  archived INTEGER NOT NULL DEFAULT 0, -- SQLite boolean
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Completions Table
-- Stores daily completion records for each habit
CREATE TABLE IF NOT EXISTS completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
  completion_count INTEGER NOT NULL DEFAULT 0,
  target_count INTEGER NOT NULL,
  timestamps TEXT NOT NULL, -- JSON array of Unix timestamps
  UNIQUE(habit_id, date)
);

-- Entries Table
-- Stores mood/note entries for each completion
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
  mood TEXT, -- emoji representing mood
  note TEXT, -- optional text note
  timestamp INTEGER NOT NULL -- Unix timestamp
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);
CREATE INDEX IF NOT EXISTS idx_entries_habit_id ON entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived);
CREATE INDEX IF NOT EXISTS idx_habits_sort_order ON habits(sort_order);
