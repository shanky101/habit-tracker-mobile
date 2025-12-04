# Mock Data Elimination - Implementation Plan

## Phase 1: Critical Screens ✅ COMPLETE

### Completed Fixes
- [x] HabitDetailScreen.tsx - Stats tiles (longest streak, total completions, completion rate)
- [x] HabitDetailScreen.tsx - Calendar heatmap
- [x] CalendarViewScreen.tsx - Day completion indicators
- [x] CalendarViewScreen.tsx - Habit list modal
- [x] AnalyticsDashboardScreen.tsx - Completion rates

**Result**: All primary user-facing mock data has been replaced with real calculations.

---

## Phase 2: HabitDeepDiveScreen Analytics (PLANNED)

### Overview
HabitDeepDiveScreen has 5 distinct mock data sections requiring different approaches.

### 2.1 Basic Stats (Feasible - RECOMMENDED)
**Lines 43-46**: Mock stats that can be calculated from existing data

**Current Mock Code**:
```typescript
const currentStreak = habitData.streak; // ✅ Already real
const longestStreak = Math.max(currentStreak + 24, 58); // 🔴 Mock
const totalCompletions = 142; // 🔴 Mock
const completionRate = 86; // 🔴 Mock
```

**Implementation Plan**:
- [x] **Checkpoint 2.1.1**: Calculate `longestStreak` from completion history
  - Reuse logic from HabitDetailScreen `calculateLongestStreak()`
  - Extract to shared utility if not already done
  
- [x] **Checkpoint 2.1.2**: Calculate `totalCompletions`
  - Sum all `completionCount` values across all dates
  - Match logic from HabitDetailScreen
  
- [x] **Checkpoint 2.1.3**: Calculate `completionRate`
  - Reuse logic from HabitDetailScreen or AnalyticsDashboardScreen
  - Consider date range (last 30 days vs all time)

**Status**: ✅ COMPLETE
**Estimated Effort**: 10 minutes
**Data Required**: ✅ Available (uses existing `habitData.completions`)

---

### 2.2 Day of Week Breakdown (Feasible - RECOMMENDED)
**Lines 60-68**: Mock day-of-week performance data

**Current Mock Code**:
```typescript
const dayOfWeekData = [
  { day: 'Mon', value: 95 },
  { day: 'Tue', value: 90 },
  // ... hardcoded for all 7 days
];
```

**Implementation Plan**:
- [x] **Checkpoint 2.2.1**: Create `calculateDayOfWeekStats()` function
  - Group completions by day of week (0-6)
  - Calculate completion rate for each day
  - Formula: `(completed days / scheduled days) * 100` per weekday

- [x] **Checkpoint 2.2.2**: Handle edge cases
  - What if habit only scheduled for certain days?
  - What if no data for a specific weekday?
  - Display "N/A" or 0% appropriately

**Status**: ✅ COMPLETE
**Estimated Effort**: 20 minutes
**Data Required**: ✅ Available (uses `habitData.completions` + `habitData.selectedDays`)

**Sample Implementation**:
```typescript
const calculateDayOfWeekStats = () => {
  const dayStats = Array(7).fill({ scheduled: 0, completed: 0 });
  
  Object.entries(completions).forEach(([dateStr, completion]) => {
    const dayOfWeek = new Date(dateStr).getDay();
    dayStats[dayOfWeek].scheduled++;
    if (completion.completionCount >= completion.targetCount) {
      dayStats[dayOfWeek].completed++;
    }
  });
  
  return dayStats.map((stat, index) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
    value: stat.scheduled > 0 
      ? Math.round((stat.completed / stat.scheduled) * 100) 
      : 0
  }));
};
```

---

### 2.3 Completion by Hour (NOT FEASIBLE - RECOMMEND DISABLE)
**Lines 49-56**: Mock time-of-day completion data

**Current Mock Code**:
```typescript
const completionByHour = [
  { hour: '6am', value: 15 },
  { hour: '9am', value: 85 },
  // ... 6 time slots
];
```

**Problem**: 
- ❌ Current data model doesn't track **timestamps** of completions
- ❌ Only tracks **dates** (YYYY-MM-DD format)
- ❌ `HabitEntry.timestamp` exists but is milliseconds since epoch, not time-of-day

**Options**:

**Option A: Disable Feature (RECOMMENDED)**
- [x] Hide/remove the "Completion by Time of Day" section
- [x] Add comment: `// Feature disabled - requires timestamp tracking`
- Simplest solution, no data model changes needed

**Status**: ✅ DISABLED (Option A selected)
**Reason**: Current data model tracks dates only, not time-of-day timestamps

**Option B: Add Timestamp Tracking (COMPLEX - NOT RECOMMENDED NOW)**
- Would require:
  - Database schema change to store time-of-day
  - Migration for existing data
  - UI updates to capture completion time
- Estimated effort: 2-3 hours + testing

**Recommendation**: Choose Option A (disable). Revisit later if time-tracking becomes a priority.

---

### 2.4 Milestones Timeline (PARTIALLY FEASIBLE)
**Lines 71-76**: Mock milestone events

**Current Mock Code**:
```typescript
const milestones = [
  { date: 'Oct 15, 2024', event: 'Habit Created', icon: '🌱' },
  { date: 'Oct 22, 2024', event: '7 Day Streak', icon: '🔥' },
  { date: 'Nov 15, 2024', event: '30 Day Streak', icon: '🏆' },
  { date: 'Nov 20, 2024', event: '100th Completion', icon: '💯' },
];
```

**Implementation Plan**:

- [ ] **Checkpoint 2.4.1**: Calculate automated milestones
  - ✅ Habit Created: Use `habitData.createdAt`
  - ✅ Completion milestones (10th, 25th, 50th, 100th)
  - ✅ Streak milestones (7, 14, 30, 60, 90 days)

- [ ] **Checkpoint 2.4.2**: Scan completion history for milestone dates
  - When did user hit 10th completion?
  - When did user achieve first 7-day streak?
  - Calculate retroactively from `habitData.completions`

- [ ] **Checkpoint 2.4.3**: Sort chronologically and display

**Estimated Effort**: 30-45 minutes
**Data Required**: ✅ Available (uses `habitData.createdAt` + `completions`)

**Limitation**: Can only show milestones that actually happened. If user hasn't hit 100 completions, won't show that milestone.

---

### 2.5 AI Pattern Insights (NOT FEASIBLE - RECOMMEND DISABLE)
**Lines 79-83**: Mock pattern recognition text

**Current Mock Code**:
```typescript
const patterns = [
  "You complete this habit most on weekday mornings",
  "Your success rate is higher on Mondays (95%)",
  "You tend to skip this habit on weekends",
];
```

**Options**:

**Option A: Simple Rule-Based Insights (MEDIUM EFFORT)**
- [ ] Calculate simple patterns from day-of-week data:
  - Best day: "Your highest success rate is on {day} ({rate}%)"
  - Worst day: "You struggle most with {day} ({rate}%)"
  - Streak pattern: "Your average streak is {X} days"
- Estimated effort: 45 minutes
- No AI needed, just template strings + calculations

**Option B: Fully Disable (RECOMMENDED FOR NOW)**
- [x] Hide "AI Pattern Recognition" section
- [x] Add placeholder: "Pattern insights coming soon"
- Estimated effort: 2 minutes

**Status**: ✅ DISABLED (Option B selected)
**Reason**: AI patterns require ML models or complex algorithms not currently implemented

**Recommendation**: Choose Option B initially. Can upgrade to Option A later if desired.

---

## Phase 3: ProfileScreen (FEASIBLE)

### Overview
Calculate user-level aggregate stats across all habits.

**Location**: Line 55 (mock stats comment)

### Implementation Plan
- [ ] **Checkpoint 3.1**: Identify what stats to show
  - Total habits created
  - Total active habits
  - Overall completion rate (across all habits)
  - Total completions (all habits combined)
  - Longest streak (best across all habits)
  - Current active streaks count

- [ ] **Checkpoint 3.2**: Create aggregation functions
  - Iterate through all active habits
  - Sum/average relevant metrics
  - Handle edge cases (no habits, all archived, etc.)

- [ ] **Checkpoint 3.3**: Update UI to display real stats

**Estimated Effort**: 30 minutes
**Data Required**: ✅ Available (aggregate from all `habits`)

---

## Phase 4: AIInsightsScreen (DEFER OR DISABLE)

### Overview
Mock AI insights data (line 55)

**Options**:

**Option A: Disable Entirely**
- Mark as "Premium Feature - Coming Soon"
- Estimated effort: 5 minutes

**Option B: Simple Insights**
- Basic pattern detection (similar to 2.5 Option A)
- "You're most consistent with {habit name}"
- "Your overall completion rate is {X}%"
- Estimated effort: 1 hour

**Recommendation**: Option A (disable/defer). True AI insights require ML models or external APIs.

---

## Phase 5: HomeScreen Note Display (VERIFY)

### Overview
**Location**: Line 259 - Random note display logic

**Current Code**:
```typescript
const shouldShowNote = Math.random() < 0.2; // 20% chance
```

### Investigation Needed
- [ ] **Checkpoint 5.1**: Check if this is actually mock or intentional randomness
- [ ] **Checkpoint 5.2**: If mock, replace with: "Show note if entry has `.note` or `.mood`"

**Estimated Effort**: 5 minutes

---

## Recommended Implementation Order

### Quick Wins (COMPLETE ✅)
1. ✅ **Phase 2.1**: HabitDeepDiveScreen - Basic Stats (10 min) - DONE
2. ✅ **Phase 2.2**: HabitDeepDiveScreen - Day of Week (20 min) - DONE
3. ⏭️ **Phase 3**: ProfileScreen aggregate stats (30 min) - NEXT

### Medium Effort (Optional)
4. ⚠️ **Phase 2.4**: HabitDeepDiveScreen - Milestones (45 min) - SKIP FOR NOW

### Disabled (COMPLETE ✅)
5. ✅ **Phase 2.3**: Completion by Hour → **DISABLED**
6. ✅ **Phase 2.5**: AI Patterns → **DISABLED**
7. ⏭️ **Phase 4**: AIInsightsScreen → **DEFER**

### Quick Verification (Remaining)
8. ✓ **Phase 5**: HomeScreen note logic (5 min) - TODO

---

## Total Estimated Effort
- **Must-Do**: ~1 hour 15 minutes (Phases 2.1, 2.2, 3, 5)
- **Nice-to-Have**: +45 minutes (Phase 2.4)
- **Defer**: Phases 2.3, 2.5, 4

---

## Implementation Checkpoints

Use these as save points:

- **Checkpoint A**: After completing Phase 2.1 (Basic Stats)
  - Test HabitDeepDiveScreen shows correct stats
  - Verify no errors

- **Checkpoint B**: After completing Phase 2.2 (Day of Week)
  - Test chart displays correctly
  - Verify calculations match reality

- **Checkpoint C**: After completing Phase 3 (ProfileScreen)
  - Test user-level aggregations
  - Verify all habits contribute correctly

- **Checkpoint D**: After disabling complex features
  - Ensure disabled sections don't show
  - No UI errors or broken layouts

---

## Risk Mitigation

### Data Availability
✅ **Low Risk**: All required data exists in current schema
- `habitData.completions` has all completion records
- `habitData.createdAt` available for milestones
- `habitData.selectedDays` for day-of-week filtering

### Performance
⚠️ **Medium Risk**: Calculations run on every render
- **Mitigation**: Use `useMemo()` to cache calculated stats
- **Mitigation**: Only recalculate when `habitData.completions` changes

### Edge Cases
⚠️ **Medium Risk**: Habits with no completions, partial data
- **Mitigation**: Add null checks and default values
- **Mitigation**: Show "N/A" or "No data yet" messages

---

## Success Criteria

- [ ] No more `Math.random()` or hardcoded values in user-facing data
- [ ] All stats accurately reflect `habitData.completions`
- [ ] Features that can't be calculated are cleanly disabled
- [ ] App remains performant (no lag when viewing screens)
- [ ] Edge cases handled gracefully (new habits, no data, etc.)

## Mock Data Patterns to Search For
- `Math.random()`
- `mock` or `Mock` in variable names
- Hardcoded arrays of fake data
- Comments like `// Mock`, `// TODO: Replace with real data`
- Static/hardcoded streak values
- Placeholder calculations

## Current Session Progress
- Started: 2025-12-04 21:28
- Current Step: Identifying mock data in HabitDetailScreen stats tiles
