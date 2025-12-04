If you observe the code in the repo you will see few things.

Context is used for persistence instead of zustand or redux. Im thinking this may become slow. What do you think?
Persistence as of now for habits is via a record I believe? For scaling out from here we need to use sqllite. expo-sqlite? How do I migrate from existing structure to sqllite?
Assume you are the tech architect and are giving solid instructions on how to proceed next. Dont code, just give me a rundown on what needs to be done for both of the above points. Once the plan is good, we can implement the same.

I'll explore your codebase to understand the current architecture before providing recommendations.

Task
Explore state and persistence architecture
Bash
find /home/user/habit-tracker-mobile -type f -name "*.json" | grep -E "(package|tsconfig)" | head -20
/home/user/habit-tracker-mobile/package.json
/home/user/habit-tracker-mobile/package-lock.json
/home/user/habit-tracker-mobile/tsconfig.json
... +3 lines
Read
/home/user/habit-tracker-mobile
EISDIR: illegal operation on a directory, read
Read
/home/user/habit-tracker-mobile/package.json
Read 74 lines
Bash
ls -la /home/user/habit-tracker-mobile/ | head -30
drwxr-xr-x 11 root root   4096 Dec  4 04:10 src
-rw-r--r--  1 root root    150 Dec  4 04:10 tsconfig.json
drwxr-xr-x  6 root root   4096 Dec  4 04:10 web-marketing
... +17 lines
Bash
find /home/user/habit-tracker-mobile/src -type f -name "*.ts" -o -name "*.tsx" | head -50
/home/user/habit-tracker-mobile/src/components/Mascot.tsx
/home/user/habit-tracker-mobile/src/components/MascotCelebration.tsx
/home/user/habit-tracker-mobile/src/components/index.ts
... +47 lines
Bash
ls -la /home/user/habit-tracker-mobile/src/
drwxr-xr-x  2 root root 4096 Dec  4 04:10 theme
drwxr-xr-x  2 root root 4096 Dec  4 04:10 types
drwxr-xr-x  2 root root 4096 Dec  4 04:10 utils
... +9 lines
Bash
ls -la /home/user/habit-tracker-mobile/src/context/ && echo "---" && ls -la /home/user/habit-tracker-mobile/src/contexts/
drwxr-xr-x 11 root root  4096 Dec  4 04:10 ..
-rw-r--r--  1 root root 11645 Dec  4 04:10 HabitsContext.tsx
-rw-r--r--  1 root root  4280 Dec  4 04:10 TemplateContext.tsx
... +8 lines
Bash
ls -la /home/user/habit-tracker-mobile/src/types/ && echo "---" && ls -la /home/user/habit-tracker-mobile/src/utils/
drwxr-xr-x 11 root root  4096 Dec  4 04:10 ..
-rw-r--r--  1 root root 22352 Dec  4 04:10 exportManager.ts
-rw-r--r--  1 root root  4840 Dec  4 04:10 notificationService.ts
... +7 lines
Read
/home/user/habit-tracker-mobile/src/contexts/HabitsContext.tsx
Read 381 lines
Read
/home/user/habit-tracker-mobile/src/contexts/TemplateContext.tsx
Read 147 lines
Read
/home/user/habit-tracker-mobile/src/context/MascotContext.tsx
Read 352 lines
Read
/home/user/habit-tracker-mobile/src/context/SubscriptionContext.tsx
Read 205 lines
Read
/home/user/habit-tracker-mobile/src/types/HabitTemplate.ts
Read 372 lines
Bash
grep -r "useHabits\|HabitsProvider" /home/user/habit-tracker-mobile/src --include="*.tsx" --include="*.ts" | head -20
/home/user/habit-tracker-mobile/src/screens/HomeScreen.tsx:  } = useHabits();
/home/user/habit-tracker-mobile/src/components/SwipeableHabitCard.tsx:import { Habit, useHabits } from '@/contexts/HabitsContext';
/home/user/habit-tracker-mobile/src/components/SwipeableHabitCard.tsx:  const { getCompletionProgress, isHabitCompletedForDate } = useHabits();
... +17 lines
Read
/home/user/habit-tracker-mobile/App.tsx
Read 73 lines
Bash
grep -r "AsyncStorage\|SecureStore\|saveHabits\|loadHabits\|persistence" /home/user/habit-tracker-mobile/src --include="*.tsx" --include="*.ts" | grep -v node_modules
/home/user/habit-tracker-mobile/src/context/SubscriptionContext.tsx:      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(newSubscription));
/home/user/habit-tracker-mobile/src/context/SubscriptionContext.tsx:      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updatedSubscription));
/home/user/habit-tracker-mobile/src/context/SubscriptionContext.tsx:      const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
... +30 lines
Bash
ls -la /home/user/habit-tracker-mobile/src/utils/
drwxr-xr-x 11 root root  4096 Dec  4 04:10 ..
-rw-r--r--  1 root root 22352 Dec  4 04:10 exportManager.ts
-rw-r--r--  1 root root  4840 Dec  4 04:10 notificationService.ts
... +2 lines
Read
/home/user/habit-tracker-mobile/src/utils/exportManager.ts
Read 633 lines
Read
/home/user/habit-tracker-mobile/src/utils/notificationService.ts
Read 169 lines
Bash
grep -r "toggleHabit\|saveHabit\|loadHabit\|persistHabit" /home/user/habit-tracker-mobile/src --include="*.tsx" --include="*.ts" 2>/dev/null | head -20
/home/user/habit-tracker-mobile/src/screens/ExportDataScreen.tsx:                    onPress={() => toggleHabitSelection(habit.id)}
/home/user/habit-tracker-mobile/src/screens/NotificationsSettingsScreen.tsx:  const toggleHabitReminder = (id: string) => {
/home/user/habit-tracker-mobile/src/screens/NotificationsSettingsScreen.tsx:                    onValueChange={() => toggleHabitReminder(habit.id)}
... +3 lines
Bash
grep -n "toggleHabit" /home/user/habit-tracker-mobile/src/contexts/HabitsContext.tsx
(No content)
Bash
grep -r "const toggleHabit\|function toggleHabit" /home/user/habit-tracker-mobile/src --include="*.tsx" --include="*.ts"
/home/user/habit-tracker-mobile/src/screens/ExportDataScreen.tsx:  const toggleHabitSelection = (id: string) => {
/home/user/habit-tracker-mobile/src/screens/NotificationsSettingsScreen.tsx:  const toggleHabitReminder = (id: string) => {
Read
/home/user/habit-tracker-mobile/src/screens/CalendarViewScreen.tsx
Read 100 lines
Read
/home/user/habit-tracker-mobile/src/screens/HomeScreen.tsx
Read 150 lines
Read
/home/user/habit-tracker-mobile/src/theme/ThemeContext.tsx
Read 100 lines
Bash
git log --oneline -20
232a99f Merge pull request #4 from shanky101/claude/implement-screens-16-20-011uoLjnLrvx5V16PCWYWAo7
c51dec1 Merge pull request #5 from shanky101/claude/merge-typography-to-main-017Z5FVJgJdGMKpByT8azZhT
d3a0519 Polish and improve UX for screens 16-20
... +17 lines
Bash
git diff --name-only
(No content)
Bash
git log --oneline -1
9dcb000 Replace more screens with icons from emoji
Bash
find /home/user/habit-tracker-mobile/src/components -name "*.tsx" -o -name "*.ts" | head -20
/home/user/habit-tracker-mobile/src/components/DraggableHabitList.tsx
/home/user/habit-tracker-mobile/src/components/StreakBrokenModal.tsx
/home/user/habit-tracker-mobile/src/components/ProgressRing.tsx
... +10 lines
Read
/home/user/habit-tracker-mobile/src/components/SwipeableHabitCard.tsx
Read 100 lines
Bash
ls -la /home/user/habit-tracker-mobile/src/hooks/
total 10
drwxr-xr-x  2 root root 4096 Dec  4 04:10 .
drwxr-xr-x 11 root root 4096 Dec  4 04:10 ..
-rw-r--r--  1 root root 1643 Dec  4 04:10 useScreenAnimation.ts
Bash
grep -r "useState\|useReducer" /home/user/habit-tracker-mobile/src/contexts/HabitsContext.tsx | head -5
import React, { createContext, useContext, useState, ReactNode } from 'react';
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
Bash
git branch -a -v
* claude/review-state-persistence-01Ue1JvJAapiLmTnds9MXG1B                9dcb000 Replace more screens with icons from emoji
  remotes/origin/claude/review-state-persistence-01Ue1JvJAapiLmTnds9MXG1B 9dcb000 Replace more screens with icons from emoji
Bash
grep -n "AsyncStorage\|useEffect" /home/user/habit-tracker-mobile/src/contexts/HabitsContext.tsx | head -20
(No content)
Read
/home/user/habit-tracker-mobile/src/contexts/HabitsContext.tsx
Read 80 lines
Bash
wc -l /home/user/habit-tracker-mobile/src/contexts/HabitsContext.tsx /home/user/habit-tracker-mobile/src/contexts/TemplateContext.tsx /home/user/habit-tracker-mobile/src/context/MascotContext.tsx /home/user/habit-tracker-mobile/src/context/SubscriptionContext.tsx
  347 /home/user/habit-tracker-mobile/src/context/MascotContext.tsx
  200 /home/user/habit-tracker-mobile/src/context/SubscriptionContext.tsx
 1065 total
... +2 lines
Excellent - I now have a complete picture of your architecture. Let me provide my assessment and recommendations.

Architectural Analysis & Recommendations
1. Context vs Zustand/Redux - Performance Assessment
Current State:

You're using React Context for all state management across 5 contexts
HabitsContext is consumed by 15+ screens
No memoization or optimization patterns in place
My Assessment:

Context is acceptable for your current scale, but you're right to be concerned. Here's the nuanced take:

Factor	Context	Zustand
Re-renders	Every consumer re-renders on ANY state change	Granular subscriptions - only re-render on used slice
Boilerplate	Minimal	Minimal (even less than Context)
DevTools	React DevTools	Dedicated Zustand devtools
Persistence	Manual (AsyncStorage)	Built-in persist middleware
Bundle size	0kb (built-in)	~2kb
When Context becomes a problem:

50+ habits with frequent completions
Complex analytics screens pulling aggregated data
Multiple components subscribing to different "slices" of habit data
Recommendation: Migrate to Zustand before adding SQLite. Here's why:

Zustand's persist middleware handles AsyncStorage/SQLite seamlessly
Granular subscriptions prevent re-renders (e.g., HomeScreen only subscribes to habits, not addHabit)
The migration is straightforward since you're already using hooks (useHabits())
It decouples persistence from UI state naturally
2. Critical Finding: HabitsContext Has NO Persistence!
This is your immediate problem. Looking at src/contexts/HabitsContext.tsx:

const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
// No AsyncStorage load/save - data is lost on app restart!

Meanwhile, TemplateContext, SubscriptionContext, and MascotContext all properly persist with AsyncStorage.

Before SQLite, you need basic persistence working.

3. Current Data Structure Analysis
Your habits use a Record-based completion tracking:

interface Habit {
  id: string;
  name: string;
  // ...
  completions: Record<string, DailyCompletion>; // "YYYY-MM-DD" → completion data
}

interface DailyCompletion {
  date: string;
  completionCount: number;
  targetCount: number;
  timestamps: number[];
  entries: HabitEntry[];  // mood, notes per check-in
}

Problems with this for scaling:

Monolithic blob - Loading 1 habit loads ALL its historical completions
No efficient queries - "Show me all habits completed last week" requires loading everything
Growing payload - After 1 year, each habit carries 365+ completion records
No relational queries - Can't easily answer "What's my best day of the week?"
4. SQLite Migration Strategy
Recommended Approach: Phased Migration

Phase 1: Add Persistence to Current Architecture (Immediate)
Add AsyncStorage persistence to HabitsContext (follow TemplateContext pattern)
This unblocks users while you build SQLite layer
Estimated effort: Small
Phase 2: Migrate State to Zustand (Foundation)
Create useHabitStore with Zustand
Use persist middleware with AsyncStorage initially
Keep same API (useHabits() hook signature)
Screens don't need to change much
Phase 3: Design SQLite Schema (Architecture)
-- Core tables
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  category TEXT,
  color TEXT,
  frequency TEXT CHECK(frequency IN ('daily', 'weekly')),
  frequency_type TEXT CHECK(frequency_type IN ('single', 'multiple')),
  target_per_day INTEGER DEFAULT 1,
  selected_days TEXT, -- JSON array [0,1,2,3,4,5,6]
  reminder_enabled INTEGER DEFAULT 0,
  reminder_time TEXT,
  notes TEXT,
  archived INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Completions separate from habits (key insight!)
CREATE TABLE completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  completion_count INTEGER DEFAULT 0,
  target_count INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  UNIQUE(habit_id, date)
);

-- Individual check-in entries
CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  completion_date TEXT NOT NULL,
  mood TEXT,
  note TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

-- Efficient indexes
CREATE INDEX idx_completions_date ON completions(date);
CREATE INDEX idx_completions_habit ON completions(habit_id);
CREATE INDEX idx_entries_habit_date ON entries(habit_id, completion_date);

Phase 4: Build Repository Layer
Create a data access layer that abstracts storage:

src/
  data/
    repositories/
      habitRepository.ts      # CRUD for habits
      completionRepository.ts # Check-in queries
    database/
      schema.ts               # Table definitions
      migrations.ts           # Version migrations
      client.ts               # expo-sqlite connection
    index.ts                  # Unified export

Phase 5: Migration Script
// Pseudo-code for migration
async function migrateFromAsyncStorageToSQLite() {
  // 1. Check if migration needed
  const migrationDone = await db.get('migration_v1_complete');
  if (migrationDone) return;

  // 2. Load existing data from AsyncStorage
  const legacyHabits = await AsyncStorage.getItem('@habits');
  
  // 3. Transform and insert into SQLite
  for (const habit of JSON.parse(legacyHabits)) {
    await db.run('INSERT INTO habits...', habit);
    
    // Flatten completions Record → rows
    for (const [date, completion] of Object.entries(habit.completions)) {
      await db.run('INSERT INTO completions...', { habit_id: habit.id, date, ...completion });
      
      for (const entry of completion.entries) {
        await db.run('INSERT INTO entries...', entry);
      }
    }
  }
  
  // 4. Mark migration complete
  await db.run('INSERT INTO meta VALUES ("migration_v1_complete", 1)');
  
  // 5. Clear AsyncStorage (optional, keep as backup initially)
}

Phase 6: Update Zustand Store
Replace the persist middleware storage adapter:

// Before (AsyncStorage)
persist(habitStore, {
  name: 'habits-storage',
  storage: createJSONStorage(() => AsyncStorage),
})

// After (SQLite)
persist(habitStore, {
  name: 'habits-storage',
  storage: createSQLiteStorage(habitRepository),
})

5. expo-sqlite Specifics
Package: expo-sqlite (already Expo-compatible)

Key APIs:

import * as SQLite from 'expo-sqlite';

// Sync API (New in SDK 50+)
const db = SQLite.openDatabaseSync('habits.db');

// Async API
const db = await SQLite.openDatabaseAsync('habits.db');

// Queries
const habits = db.getAllSync('SELECT * FROM habits WHERE archived = 0');
const habit = db.getFirstSync('SELECT * FROM habits WHERE id = ?', [id]);

Considerations:

Use expo-sqlite/next for the modern async API
Implement connection pooling for performance
Use transactions for batch operations (migration, bulk imports)
6. Recommended Implementation Order
Step	Task	Dependencies	Effort
1	Add AsyncStorage persistence to HabitsContext	None	Small
2	Install & configure Zustand	Step 1	Small
3	Migrate HabitsContext → Zustand store	Step 2	Medium
4	Migrate other contexts → Zustand (optional)	Step 3	Medium
5	Install expo-sqlite, create schema	Step 3	Small
6	Build repository layer	Step 5	Medium
7	Write migration script	Step 6	Medium
8	Swap Zustand persist adapter	Step 7	Small
9	Add optimized queries for analytics	Step 8	Medium
7. Quick Wins Before Full Migration
If you want incremental progress:

Fix persistence today - Add AsyncStorage to HabitsContext (copy pattern from TemplateContext)
Add the missing toggleHabit function - CalendarViewScreen is broken without it
Add isLoading state - Prevent flash of default habits on load
Summary
Question	Answer
Is Context slow?	Not yet, but will be at scale. Zustand is better.
Current persistence?	Broken - HabitsContext has none!
SQLite worth it?	Yes, for analytics queries and large datasets
Migration approach?	Phased: Fix persistence → Zustand → SQLite schema → Repository layer → Migration script
Would you like me to proceed with implementing any of these phases? I'd recommend starting with Phase 1 (fixing the broken persistence) as an immediate priority.

What should I do first? Migrate to redux or zustand? Or migrate to async and then to sqllite? What’s the order preferred. Deep dive and tell me the best path ahead. Be super technical. Think hard.

Let me think through this systematically. This is an important architectural decision.

Deep Technical Analysis: Optimal Migration Path
The Core Constraint
Your app is currently broken - habits don't persist. But the fix approach matters because you'll either:

Write throwaway code (fast but wasteful)
Write foundational code (slightly slower but compounds)
Let me analyze each path:

Path Analysis
Path A: Context → AsyncStorage → Zustand → SQLite
[Context + Memory] → [Context + AsyncStorage] → [Zustand + AsyncStorage] → [Zustand + SQLite]
     (now)              (throwaway)               (refactor)               (final)

Problem: The AsyncStorage code in Context is throwaway. You'll rewrite persistence logic when moving to Zustand.

Path B: Context → Zustand + AsyncStorage → Zustand + SQLite
[Context + Memory] → [Zustand + AsyncStorage] → [Zustand + SQLite]
     (now)              (foundation)               (final)

Better: Zustand's persist middleware means storage is a swappable adapter. No throwaway code.

Path C: Context → Zustand + SQLite (skip AsyncStorage)
[Context + Memory] → [Zustand + SQLite]
     (now)              (final)

Risky: Longer time with broken persistence. SQLite schema mistakes are costly to fix.

My Recommendation: Path B
Zustand first, then SQLite. Here's the deep technical reasoning:

Why Zustand Before SQLite
1. Zustand's Persist Middleware is the Key Abstraction
// Zustand persist middleware signature
persist(store, {
  name: 'habit-storage',
  storage: createJSONStorage(() => AsyncStorage), // ← THIS IS SWAPPABLE
})

The storage parameter accepts any object implementing StateStorage:

interface StateStorage {
  getItem: (name: string) => string | null | Promise<string | null>
  setItem: (name: string, value: string) => void | Promise<void>
  removeItem: (name: string) => void | Promise<void>
}

This means: You write persistence logic ONCE. Swapping AsyncStorage → SQLite is a configuration change, not a rewrite.

2. Zustand Solves Problems SQLite Cannot
Problem	SQLite Fixes?	Zustand Fixes?
No persistence	✅	✅
Context re-renders	❌	✅
Hydration loading states	❌	✅ (built-in)
Async state updates	❌	✅
Granular subscriptions	❌	✅
DevTools debugging	❌	✅
SQLite is a storage engine. Zustand is a state management solution. You need both, but state management is the foundation.

3. The Re-render Problem is Real
Look at your current HabitsContext consumption:

// HomeScreen.tsx - uses everything
const { habits, completeHabit, uncompleteHabit, isHabitCompletedForDate } = useHabits();

// HabitDetailScreen.tsx - uses subset
const { habits, updateHabit, deleteHabit } = useHabits();

// AnalyticsDashboardScreen.tsx - only reads
const { habits } = useHabits();

With Context: When you call completeHabit(), ALL these screens re-render. Even AnalyticsDashboard re-renders when you check off a habit on HomeScreen.

With Zustand:

// Only re-renders when habits array changes
const habits = useHabitStore((state) => state.habits);

// Never causes re-renders (stable reference)
const completeHabit = useHabitStore((state) => state.completeHabit);

This is selector-based subscriptions - components only re-render when their selected slice changes.

Why AsyncStorage Before SQLite
1. Incremental De-risking
Day 1: Zustand + AsyncStorage → App works, habits persist
Day 2-5: Build SQLite layer in parallel → App still works
Day 6: Swap adapter → App works with SQLite

vs.

Day 1-5: Build Zustand + SQLite together → App broken entire time
Day 6: Deploy → Hope it works

2. AsyncStorage as Migration Source
You need to migrate existing user data. If you go straight to SQLite, where do you migrate FROM?

// Migration flow
async function migrateToSQLite() {
  // 1. Check if SQLite has data
  const sqliteHabits = await habitRepository.getAll();
  if (sqliteHabits.length > 0) return; // Already migrated

  // 2. Read from AsyncStorage (old format)
  const asyncData = await AsyncStorage.getItem('habit-storage');
  if (!asyncData) return; // Fresh install

  // 3. Parse and transform
  const { state } = JSON.parse(asyncData);
  
  // 4. Write to SQLite (normalized)
  await habitRepository.bulkInsert(state.habits);
  
  // 5. Mark complete
  await AsyncStorage.setItem('migration_v1', 'complete');
}

AsyncStorage serves as the migration source and fallback during the transition.

3. SQLite Schema Iteration
Your first SQLite schema WILL have issues. Common discoveries:

"I need an index on completions(date) for the calendar view"
"The entries table should have habit_id for direct queries"
"I need a streaks table for performance"
With AsyncStorage as fallback, you can iterate on SQLite schema without data loss risk.

Why Zustand Over Redux
Factor	Zustand	Redux Toolkit
Bundle size	~2kb	~11kb (redux + toolkit)
Boilerplate	Minimal	Moderate
Persist middleware	Built-in	Separate package (redux-persist)
Learning curve	30 min	2-3 hours
React Native compat	Excellent	Good
Hooks-first	Yes	Yes (with toolkit)
DevTools	Chrome extension	Chrome extension
For a mobile habit tracker, Redux is overkill. Zustand gives you:

Same capabilities
Less code
Faster bundle
Built-in persistence
The Optimal Implementation Order
Phase 1: Zustand Foundation (Day 1)
├── Install zustand
├── Create habitStore mirroring Context API
├── Add persist middleware with AsyncStorage
├── Update useHabits() hook to use store
└── Result: Working persistence, better performance

Phase 2: Component Migration (Day 1-2)  
├── Update imports in all screens
├── Remove HabitsProvider from App.tsx
├── Delete HabitsContext.tsx
└── Result: Cleaner architecture

Phase 3: SQLite Schema Design (Day 2-3)
├── Install expo-sqlite
├── Design normalized schema
├── Create migration versioning system
├── Build database client
└── Result: Schema ready

Phase 4: Repository Layer (Day 3-4)
├── habitRepository (CRUD)
├── completionRepository (check-ins)
├── Shape translation (normalized ↔ denormalized)
└── Result: Data access abstraction

Phase 5: Custom Storage Adapter (Day 4-5)
├── Implement StateStorage interface
├── Wire to repository layer
├── Handle hydration edge cases
└── Result: Zustand ↔ SQLite bridge

Phase 6: Migration & Cutover (Day 5)
├── Write AsyncStorage → SQLite migration
├── Swap storage adapter
├── Test migration paths
└── Result: Full SQLite persistence

Technical Implementation Details
Phase 1: Zustand Store Structure
// src/store/habitStore.ts
interface HabitState {
  // State
  habits: Habit[];
  isHydrated: boolean;
  
  // Actions
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => void;
  reorderHabits: (fromIndex: number, toIndex: number) => void;
  
  // Completions
  completeHabit: (id: string, date: string, entry?: HabitEntry) => void;
  uncompleteHabit: (id: string, date: string) => void;
  resetHabitForDate: (id: string, date: string) => void;
  
  // Selectors (derived)
  getCompletionForDate: (id: string, date: string) => DailyCompletion | undefined;
  isHabitCompletedForDate: (id: string, date: string) => boolean;
  getCompletionProgress: (id: string, date: string) => { current: number; target: number };
}

Phase 3: SQLite Schema
-- Normalized schema optimized for queries
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '✓',
  category TEXT NOT NULL DEFAULT 'general',
  color TEXT NOT NULL DEFAULT 'blue',
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK(frequency IN ('daily', 'weekly')),
  frequency_type TEXT NOT NULL DEFAULT 'single' CHECK(frequency_type IN ('single', 'multiple')),
  target_per_day INTEGER NOT NULL DEFAULT 1,
  selected_days TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]', -- JSON array
  reminder_enabled INTEGER NOT NULL DEFAULT 0,
  reminder_time TEXT,
  notification_ids TEXT, -- JSON array
  notes TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  completion_count INTEGER NOT NULL DEFAULT 0,
  target_count INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(habit_id, date)
);

CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD (denormalized for query speed)
  mood TEXT,
  note TEXT,
  timestamp INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Critical indexes for performance
CREATE INDEX idx_completions_habit_date ON completions(habit_id, date);
CREATE INDEX idx_completions_date ON completions(date); -- Calendar view
CREATE INDEX idx_entries_habit_date ON entries(habit_id, date);
CREATE INDEX idx_habits_archived ON habits(archived, sort_order);

-- Migration tracking
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

Phase 5: Custom Storage Adapter
// src/store/sqliteStorage.ts
import { StateStorage } from 'zustand/middleware';
import { habitRepository } from '../data/repositories';

// Transforms between Zustand shape (denormalized) and SQLite (normalized)
export const createSQLiteStorage = (): StateStorage => ({
  getItem: async (name) => {
    // Load from SQLite, denormalize for Zustand
    const habits = await habitRepository.getAllWithCompletions();
    
    // Return in Zustand persist format
    return JSON.stringify({
      state: { habits },
      version: 1,
    });
  },
  
  setItem: async (name, value) => {
    const { state } = JSON.parse(value);
    
    // Sync changes to SQLite (normalized)
    await habitRepository.syncFromState(state.habits);
  },
  
  removeItem: async (name) => {
    await habitRepository.deleteAll();
  },
});

Data Shape Translation
The key complexity is translating between shapes:

// Zustand shape (UI-friendly, denormalized)
{
  habits: [
    {
      id: "1",
      name: "Meditate",
      completions: {
        "2024-01-15": { completionCount: 1, entries: [...] },
        "2024-01-16": { completionCount: 2, entries: [...] },
      }
    }
  ]
}

// SQLite shape (query-friendly, normalized)
habits:      [{ id: "1", name: "Meditate", ... }]
completions: [{ habit_id: "1", date: "2024-01-15", ... }, ...]
entries:     [{ habit_id: "1", date: "2024-01-15", ... }, ...]

The repository layer handles this:

// habitRepository.ts
async function getAllWithCompletions(): Promise<Habit[]> {
  const habits = db.getAllSync<HabitRow>('SELECT * FROM habits WHERE archived = 0');
  
  return Promise.all(habits.map(async (habit) => {
    const completions = db.getAllSync<CompletionRow>(
      'SELECT * FROM completions WHERE habit_id = ?',
      [habit.id]
    );
    
    const entries = db.getAllSync<EntryRow>(
      'SELECT * FROM entries WHERE habit_id = ?',
      [habit.id]
    );
    
    // Denormalize into Record<string, DailyCompletion>
    const completionsMap = completions.reduce((acc, c) => {
      acc[c.date] = {
        date: c.date,
        completionCount: c.completion_count,
        targetCount: c.target_count,
        timestamps: [], // Derived from entries
        entries: entries.filter(e => e.date === c.date),
      };
      return acc;
    }, {} as Record<string, DailyCompletion>);
    
    return { ...habit, completions: completionsMap };
  }));
}

Final Recommendation
┌─────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED PATH                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. ZUSTAND + ASYNCSTORAGE (Foundation)                        │
│     - Gets persistence working immediately                      │
│     - Fixes re-render performance                               │
│     - No throwaway code                                         │
│                                                                 │
│  2. SQLITE SCHEMA + REPOSITORY (In parallel)                   │
│     - Design normalized tables                                  │
│     - Build data access layer                                   │
│     - App keeps working during development                      │
│                                                                 │
│  3. SWAP ADAPTER (Cutover)                                     │
│     - Implement StateStorage for SQLite                         │
│     - Write migration script                                    │
│     - Single config change to switch                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Do NOT:

Add AsyncStorage to Context (throwaway code)
Skip straight to SQLite (too risky, too long without persistence)
Use Redux (overkill for this app)
DO:

Start with Zustand + persist middleware + AsyncStorage
Build SQLite layer while app is functional
Swap adapters when SQLite is proven
Ready to implement Phase 1 (Zustand + AsyncStorage)?

Here’s the thing. The app is still in development. It’s not yet pushed to App Store. No users. So can’t I directly switch to zustand and sqliite? I have nothing to lose. Think critically.

You're absolutely right. I was over-engineering for constraints that don't exist.

Revised Analysis
Constraints I Assumed (Wrong)
❌ Need to keep app working for users → No users
❌ Need to migrate existing data → No data
❌ Need fallback if SQLite breaks → Can just fix it
❌ Risk mitigation for production → Not in production
Actual Constraints
✅ Development phase
✅ Clean slate
✅ Final architecture is Zustand + SQLite
✅ No migration overhead
The Direct Path
[Context + Memory] ──────────────────→ [Zustand + SQLite]
     (now)                                  (final)

Skip AsyncStorage entirely. It would just be throwaway code.

Why This Is Better
Factor	With AsyncStorage Detour	Direct to SQLite
Total code written	More (adapter + migration)	Less
Throwaway code	Yes (AsyncStorage adapter)	None
Migration logic	Required	Not needed
Time to final arch	Longer	Shorter
Complexity	Higher	Lower
Streamlined Implementation Plan
Phase 1: Zustand Store (Day 1)
Set up the store with the exact shape your UI expects:

// Store mirrors your current Context API
interface HabitStore {
  habits: Habit[];
  isHydrated: boolean;
  
  // All existing actions
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string, date: string, entry?: HabitEntry) => void;
  uncompleteHabit: (id: string, date: string) => void;
  // ... etc
}

Phase 2: SQLite Foundation (Day 1-2)
src/
  data/
    database/
      client.ts        # expo-sqlite connection
      schema.sql       # Table definitions
      initialize.ts    # Create tables on first run
    repositories/
      habitRepository.ts
      completionRepository.ts

Schema (normalized for queries):

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  frequency TEXT NOT NULL,
  frequency_type TEXT NOT NULL,
  target_per_day INTEGER NOT NULL DEFAULT 1,
  selected_days TEXT NOT NULL, -- JSON array
  reminder_enabled INTEGER NOT NULL DEFAULT 0,
  reminder_time TEXT,
  notification_ids TEXT,
  notes TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  completion_count INTEGER NOT NULL DEFAULT 0,
  target_count INTEGER NOT NULL,
  UNIQUE(habit_id, date)
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  mood TEXT,
  note TEXT,
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_completions_lookup ON completions(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);
CREATE INDEX IF NOT EXISTS idx_entries_lookup ON entries(habit_id, date);

Phase 3: Repository Layer (Day 2)
The critical piece - translates between normalized (SQLite) and denormalized (Zustand):

// habitRepository.ts
export const habitRepository = {
  // Read: SQLite → Zustand shape
  async getAll(): Promise<Habit[]> {
    const habits = db.getAllSync<HabitRow>('SELECT * FROM habits ORDER BY sort_order');
    
    return habits.map(habit => {
      const completions = db.getAllSync<CompletionRow>(
        'SELECT * FROM completions WHERE habit_id = ?', [habit.id]
      );
      const entries = db.getAllSync<EntryRow>(
        'SELECT * FROM entries WHERE habit_id = ?', [habit.id]
      );
      
      // Build Record<string, DailyCompletion> from rows
      return denormalize(habit, completions, entries);
    });
  },
  
  // Write: Zustand shape → SQLite
  async upsertHabit(habit: Habit): Promise<void> {
    db.runSync(`INSERT OR REPLACE INTO habits (...) VALUES (...)`, [...]);
  },
  
  async saveCompletion(habitId: string, date: string, completion: DailyCompletion): Promise<void> {
    db.runSync(`INSERT OR REPLACE INTO completions (...) VALUES (...)`, [...]);
    // Also sync entries
  },
  
  // Useful queries SQLite enables
  async getCompletionsInRange(startDate: string, endDate: string): Promise<...> {
    return db.getAllSync(
      'SELECT * FROM completions WHERE date BETWEEN ? AND ?',
      [startDate, endDate]
    );
  },
  
  async getStreakData(habitId: string): Promise<...> {
    // Complex streak calculation via SQL
  }
};

Phase 4: Zustand + SQLite Integration (Day 2-3)
Custom persist storage that uses your repository:

// sqliteStorage.ts
import { StateStorage } from 'zustand/middleware';
import { habitRepository } from './repositories/habitRepository';

export const sqliteStorage: StateStorage = {
  getItem: async () => {
    const habits = await habitRepository.getAll();
    return JSON.stringify({ state: { habits }, version: 1 });
  },
  
  setItem: async (_, value) => {
    const { state } = JSON.parse(value);
    await habitRepository.syncAll(state.habits);
  },
  
  removeItem: async () => {
    await habitRepository.deleteAll();
  },
};

Wire it up:

// habitStore.ts
export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      isHydrated: false,
      
      addHabit: (habit) => {
        set((state) => ({ habits: [...state.habits, habit] }));
      },
      // ... other actions
    }),
    {
      name: 'habit-store',
      storage: createJSONStorage(() => sqliteStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

Phase 5: Swap Context → Zustand in Components (Day 3)
Minimal changes since API is similar:

// Before
const { habits, completeHabit } = useHabits(); // Context

// After  
const habits = useHabitStore((s) => s.habits);
const completeHabit = useHabitStore((s) => s.completeHabit);

Or create a compatibility hook:

// useHabits.ts - drop-in replacement
export const useHabits = () => ({
  habits: useHabitStore((s) => s.habits),
  addHabit: useHabitStore((s) => s.addHabit),
  completeHabit: useHabitStore((s) => s.completeHabit),
  // ... map all methods
});

Dev Convenience: Database Reset
Since you're iterating on schema, add a dev reset function:

// Only in __DEV__
export const resetDatabase = async () => {
  db.execSync('DROP TABLE IF EXISTS entries');
  db.execSync('DROP TABLE IF EXISTS completions');
  db.execSync('DROP TABLE IF EXISTS habits');
  await initializeDatabase();
};

Trigger from a hidden dev menu or shake gesture.

Summary
Phase	Deliverable	Time
1	Zustand store (shape + actions)	Day 1
2	SQLite schema + client	Day 1-2
3	Repository layer	Day 2
4	SQLite storage adapter	Day 2-3
5	Swap components to Zustand	Day 3
Total: ~3 days to final architecture

No throwaway code. No migration logic. Clean slate advantage.

Want me to start implementing? I'd begin with the Zustand store structure and SQLite schema.

Yeah. Start executing phase 1 to phase 3 now. Think hard. Ensure nothing breaks or even if it breaks fixes are easy. Once done you can start next few phases.

I'll start implementing phases 1-3. Let me first read the existing code to ensure I replicate the exact API and data structures.

Update Todos
 Reading existing HabitsContext and understanding current API
 Install zustand and expo-sqlite dependencies
 Create Zustand habit store with same API as Context
 Create SQLite schema and database client
 Create repository layer for habits and completions
 Create SQLite storage adapter for Zustand
