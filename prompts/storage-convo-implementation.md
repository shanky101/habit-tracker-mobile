# Storage Migration Implementation Plan

## Overview
Migrate from Context API (no persistence) → Zustand + SQLite persistence

**Key Constraints:**
- No users, no existing data to migrate
- Direct path to final architecture (skip AsyncStorage)
- Incremental checkpoints to prevent context loss

---

## Implementation Checkpoints

### ✅ Checkpoint 0: Setup and Dependencies
**Goal:** Install required packages and verify setup

**Tasks:**
- [x] Install `zustand` package
- [x] Install `expo-sqlite` package
- [x] Verify package.json and test import

**Verification:**
- Import statements don't error
- `npm ls zustand expo-sqlite` shows correct versions

**Files Created:**
- None (package updates only)

---

### ✅ Checkpoint 1: SQLite Database Foundation
**Goal:** Create SQLite database schema, client, and initialization

**Tasks:**
- [x] Create directory structure: `src/data/database/`
- [x] Create `schema.sql` with tables (habits, completions, entries)
- [x] Create `client.ts` with database connection
- [x] Create `initialize.ts` with table creation and seeding logic
- [x] Add DEFAULT_HABITS seed data

**Verification:**
- Database file is created on first app launch
- Tables exist with correct schema
- Default habits are inserted on empty database

**Files Created:**
- `src/data/database/schema.sql`
- `src/data/database/client.ts`
- `src/data/database/initialize.ts`
- `src/data/database/index.ts`

**Critical Code:**
```sql
-- schema.sql
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  -- ... all fields
);

CREATE TABLE IF NOT EXISTS completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  -- ...
  UNIQUE(habit_id, date)
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  -- ...
);
```

---

### ✅ Checkpoint 2: Repository Layer - Read Operations
**Goal:** Build repository to read from SQLite and denormalize to Zustand shape

**Tasks:**
- [x] Create directory: `src/data/repositories/`
- [x] Create `habitRepository.ts` with read methods:
  - `getAll(): Promise<Habit[]>` - denormalizes completions
  - `getById(id: string): Promise<Habit | null>`
- [x] Create helper: `denormalize()` - converts DB rows → Habit object
- [x] Test read operations return correct shape

**Verification:**
- `getAll()` returns array of Habit objects with completions as `Record<string, DailyCompletion>`
- Each habit has all fields from HabitsContext interface

**Files Created:**
- `src/data/repositories/habitRepository.ts`
- `src/data/repositories/types.ts` (DB row types)
- `src/data/repositories/index.ts`

**Critical Code:**
```typescript
// habitRepository.ts
export const habitRepository = {
  async getAll(): Promise<Habit[]> {
    const habitRows = db.getAllSync<HabitRow>('SELECT * FROM habits WHERE archived = 0 ORDER BY sort_order');

    return habitRows.map(habitRow => {
      const completionRows = db.getAllSync<CompletionRow>(
        'SELECT * FROM completions WHERE habit_id = ?', [habitRow.id]
      );
      const entryRows = db.getAllSync<EntryRow>(
        'SELECT * FROM entries WHERE habit_id = ?', [habitRow.id]
      );

      return denormalize(habitRow, completionRows, entryRows);
    });
  }
};
```

---

### ✅ Checkpoint 3: Repository Layer - Write Operations
**Goal:** Implement repository write methods for persisting changes

**Tasks:**
- [x] Add write methods to `habitRepository.ts`:
  - `syncAll(habits: Habit[]): Promise<void>` - full state sync
  - `deleteAll(): Promise<void>` - delete all data
- [x] Test write operations persist correctly

**Verification:**
- `upsertHabit()` inserts/updates habit row
- `saveCompletion()` inserts completions + entries
- `syncAll()` replaces all data (used by Zustand persist)

**Files Modified:**
- `src/data/repositories/habitRepository.ts`

**Critical Code:**
```typescript
async syncAll(habits: Habit[]): Promise<void> {
  db.withTransactionSync(() => {
    // Clear existing data
    db.runSync('DELETE FROM entries');
    db.runSync('DELETE FROM completions');
    db.runSync('DELETE FROM habits');

    // Insert all habits and their data
    habits.forEach(habit => {
      // Insert habit
      db.runSync('INSERT INTO habits (...) VALUES (...)', [...]);

      // Insert completions and entries
      Object.entries(habit.completions).forEach(([date, completion]) => {
        db.runSync('INSERT INTO completions (...) VALUES (...)', [...]);
        completion.entries.forEach(entry => {
          db.runSync('INSERT INTO entries (...) VALUES (...)', [...]);
        });
      });
    });
  });
}
```

---

### ✅ Checkpoint 4: Zustand Store Creation
**Goal:** Create Zustand store that mirrors HabitsContext API

**Tasks:**
- [x] Create `src/store/habitStore.ts`
- [x] Define `HabitState` interface with all Context methods
- [x] Implement all action methods (addHabit, updateHabit, deleteHabit, etc.)
- [x] Implement completion methods (completeHabit, uncompleteHabit, etc.)
- [x] Implement selector methods (getCompletionForDate, isHabitCompletedForDate, etc.)
- [x] Add `isHydrated` state for loading indicator

**Verification:**
- Store has exact same methods as HabitsContext
- Actions update state correctly (test without persistence first)
- No TypeScript errors

**Files Created:**
- `src/store/habitStore.ts`
- `src/store/index.ts`

**Critical Code:**
```typescript
// habitStore.ts
interface HabitState {
  // State
  habits: Habit[];
  isHydrated: boolean;

  // Actions (all methods from HabitsContext)
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  reorderHabits: (fromIndex: number, toIndex: number) => void;

  // Completions
  completeHabit: (id: string, date: string, entry?: HabitEntry) => void;
  uncompleteHabit: (id: string, date: string) => void;
  resetHabitForDate: (id: string, date: string) => void;

  // Selectors
  getCompletionForDate: (id: string, date: string) => DailyCompletion | undefined;
  isHabitCompletedForDate: (id: string, date: string) => boolean;
  getCompletionProgress: (id: string, date: string) => { current: number; target: number };

  // Internal
  setHydrated: (hydrated: boolean) => void;
}

export const useHabitStore = create<HabitState>()((set, get) => ({
  habits: [],
  isHydrated: false,

  addHabit: (habit) => set((state) => ({
    habits: [...state.habits, habit]
  })),

  // ... implement all methods
}));
```

---

### ✅ Checkpoint 5: SQLite Storage Adapter
**Goal:** Create custom storage adapter for Zustand persist middleware

**Tasks:**
- [x] Create `src/store/sqliteStorage.ts`
- [x] Implement `StateStorage` interface:
  - `getItem()` - loads from SQLite via repository
  - `setItem()` - saves to SQLite via repository
  - `removeItem()` - clears database
- [x] Handle hydration (loading state)
- [x] Add error handling (let errors bubble in dev)

**Verification:**
- `getItem()` returns Zustand-compatible JSON string
- `setItem()` persists all habits to SQLite
- Store hydrates on app launch

**Files Created:**
- `src/store/sqliteStorage.ts`

**Critical Code:**
```typescript
// sqliteStorage.ts
import { StateStorage } from 'zustand/middleware';
import { habitRepository } from '../data/repositories';

export const sqliteStorage: StateStorage = {
  getItem: async (name: string) => {
    try {
      const habits = await habitRepository.getAll();
      return JSON.stringify({
        state: { habits, isHydrated: false },
        version: 1
      });
    } catch (error) {
      console.error('SQLite getItem error:', error);
      throw error; // Let it crash in dev
    }
  },

  setItem: async (name: string, value: string) => {
    try {
      const { state } = JSON.parse(value);
      await habitRepository.syncAll(state.habits);
    } catch (error) {
      console.error('SQLite setItem error:', error);
      throw error;
    }
  },

  removeItem: async (name: string) => {
    try {
      await habitRepository.deleteAll();
    } catch (error) {
      console.error('SQLite removeItem error:', error);
      throw error;
    }
  },
};
```

---

### ✅ Checkpoint 6: Wire Zustand Store with Persistence
**Goal:** Add persist middleware to Zustand store with SQLite adapter

**Tasks:**
- [x] Wrap store with `persist` middleware
- [x] Configure storage to use `sqliteStorage`
- [x] Add `onRehydrateStorage` to set hydrated flag
- [x] Test full persistence cycle (write → close app → reopen → read)

**Verification:**
- Adding a habit persists to SQLite
- Closing and reopening app loads habits from SQLite
- `isHydrated` becomes true after loading

**Files Modified:**
- `src/store/habitStore.ts`

**Critical Code:**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sqliteStorage } from './sqliteStorage';

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      // ... all state and actions
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
```

---

### ✅ Checkpoint 7: Compatibility Hook
**Goal:** Create `useHabits()` hook that wraps Zustand store

**Tasks:**
- [x] Create `src/hooks/useHabits.ts`
- [x] Map all Zustand selectors to Context API shape
- [x] Ensure zero breaking changes for components
- [x] Keep same import path (`@/contexts/HabitsContext`)

**Verification:**
- Components can import `useHabits()` without changes
- All methods work identically to Context version

**Files Created:**
- `src/hooks/useHabits.ts`

**Files Modified:**
- `src/contexts/HabitsContext.tsx` (update export to re-export hook)

**Critical Code:**
```typescript
// src/hooks/useHabits.ts
import { useHabitStore } from '../store/habitStore';
import { Habit, DailyCompletion, HabitEntry } from '../types/Habit';

export const useHabits = () => {
  const habits = useHabitStore((state) => state.habits);
  const isHydrated = useHabitStore((state) => state.isHydrated);
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  // ... map all methods

  return {
    habits,
    isHydrated,
    addHabit,
    updateHabit,
    deleteHabit,
    // ... return all methods
  };
};

// Re-export types
export type { Habit, DailyCompletion, HabitEntry };
```

```typescript
// src/contexts/HabitsContext.tsx (simplified)
// Re-export the new hook so imports don't break
export { useHabits } from '../hooks/useHabits';
export type { Habit, DailyCompletion, HabitEntry } from '../types/Habit';
```

---

### ✅ Checkpoint 8: Remove Context Provider
**Goal:** Remove HabitsProvider from App.tsx and clean up old Context

**Tasks:**
- [x] Remove `<HabitsProvider>` from App.tsx
- [x] Initialize database in App.tsx before rendering
- [ ] Test that app still works without Context Provider
- [ ] Verify all screens still function correctly

**Verification:**
- App launches without errors
- All habit operations work (add, complete, delete)
- Data persists across app restarts

**Files Modified:**
- `App.tsx`
- `src/contexts/HabitsContext.tsx` (can delete or keep as re-export only)

**Critical Code:**
```typescript
// App.tsx
import { initializeDatabase } from './src/data/database/initialize';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <MascotProvider>
        {/* NO MORE HabitsProvider! */}
        <NavigationContainer>
          {/* ... */}
        </NavigationContainer>
      </MascotProvider>
    </ThemeProvider>
  );
}
```

---

### ✅ Checkpoint 9: Testing and Validation
**Goal:** Comprehensive testing of entire migration

**Tasks:**
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Test completion flows (multiple check-ins per day)
- [ ] Test archive/unarchive
- [ ] Test reorder habits
- [ ] Test app restart (persistence)
- [ ] Test on both iOS and Android simulators
- [ ] Check for memory leaks or performance issues

**Verification:**
- All screens work identically to before
- No console errors
- Data persists correctly
- Performance is same or better

**Test Checklist:**
- [ ] HomeScreen: Add habit, complete habit, view progress
- [ ] HabitDetailScreen: View stats, edit habit
- [ ] CalendarViewScreen: View historical completions
- [ ] AnalyticsDashboardScreen: Aggregated stats load correctly
- [ ] Restart app: Data is preserved

---

### ✅ Checkpoint 10: Optimization (Optional for Later)
**Goal:** Optimize for performance once basic migration is complete

**Future Tasks (not now):**
- [ ] Replace full sync with incremental writes in high-frequency actions
- [ ] Add database indexes if queries are slow
- [ ] Implement query-based analytics (instead of loading all habits)
- [ ] Add database versioning for future schema migrations

**Note:** These optimizations should be done AFTER the basic migration is working and tested.

---

## Progress Tracking

**Current Checkpoint:** Checkpoint 9 (Testing and Validation)

**Completed Checkpoints:**
- ✅ Checkpoint 0: Setup and Dependencies
- ✅ Checkpoint 1: SQLite Database Foundation
- ✅ Checkpoint 2: Repository Layer - Read Operations
- ✅ Checkpoint 3: Repository Layer - Write Operations
- ✅ Checkpoint 4: Zustand Store Creation
- ✅ Checkpoint 5: SQLite Storage Adapter
- ✅ Checkpoint 6: Wire Zustand with Persistence
- ✅ Checkpoint 7: Compatibility Hook
- ✅ Checkpoint 8: Remove Context Provider

**Next Steps:**
1. Test all CRUD operations
2. Test persistence across app restarts
3. Verify all screens work correctly

---

## Recovery Instructions

If conversation is interrupted, resume with:
> "Resume implementation from Checkpoint N. Show me the current state of [file] and continue from where we left off."

## Critical Files Reference

**Database Layer:**
- `src/data/database/schema.sql`
- `src/data/database/client.ts`
- `src/data/database/initialize.ts`

**Repository Layer:**
- `src/data/repositories/habitRepository.ts`
- `src/data/repositories/types.ts`

**Store Layer:**
- `src/store/habitStore.ts`
- `src/store/sqliteStorage.ts`

**Hook Layer:**
- `src/hooks/useHabits.ts`

**App Entry:**
- `App.tsx` (initialize DB)

---

## Rollback Plan

If migration fails:
1. Revert to commit before Checkpoint 1
2. HabitsContext still exists as fallback
3. Components use same `useHabits()` import

**Safety:** The compatibility hook pattern ensures components never break during migration.
