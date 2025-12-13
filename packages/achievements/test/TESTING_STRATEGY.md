# Achievements Package Testing Strategy

## Overview
The `achievements` package handles the logic for tracking user progress and unlocking badges/rewards. This is a pure logic package with heavy reliance on state calculation.

## Recommended Stack
- **Test Runner:** Jest

## Testing Scope

### 1. Business Logic Units
- **Goal:** Verify that achievements are unlocked correctly based on input criteria.
- **Strategy:** Test the "Rules Engine" or evaluation functions.
- **Action:**
  - Input: User stats (e.g., "5 days streak").
  - Output: Expected achievement (e.g., "Streak Master").
  - Edge Cases: Exact thresholds, off-by-one errors.

### 2. State Management
- **Goal:** Ensure the achievements state updates correctly (locked -> unlocked).
- **Strategy:** Test reducers or state stores.

## Directory Structure
```
/packages/achievements
  /src
    /logic
      evaluator.ts
      evaluator.test.ts
```

## Example Test Spec
```typescript
import { checkAchievementUnlock } from './evaluator';

describe('Achievements: Logic', () => {
  it('unlocks "Early Bird" when checking in before 6AM', () => {
    const context = { checkInTime: '05:30' };
    const result = checkAchievementUnlock('early_bird', context);
    expect(result).toBe(true);
  });

  it('does not unlock "Early Bird" at 7AM', () => {
    const context = { checkInTime: '07:00' };
    const result = checkAchievementUnlock('early_bird', context);
    expect(result).toBe(false);
  });
});
```
