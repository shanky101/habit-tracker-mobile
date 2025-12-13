# Mascot Package Testing Strategy

## Overview
The `mascot` package likely contains logic for the mascot's state (mood, evolution, accessories) and potentially assets/components for rendering.

## Recommended Stack
- **Test Runner:** Jest
- **Component Tests:** RNTL (if UI components exist here)

## Testing Scope

### 1. State Logic
- **Goal:** Verify mascot mood/state changes based on user interactions or habit completion.
- **Strategy:** Unit test the state transitions.
- **Action:**
  - `calcMascotMood(previousMood, missedHabits) -> newMood`

### 2. Asset Resolution
- **Goal:** Ensure the correct asset is returned for a given state.
- **Strategy:** Unit test the asset mapping function.
- **Action:**
  - `getMascotImage('happy', 'level1')` should return expected resource ID.

## Example Test Spec
```typescript
import { calculateMood } from './moodSystem';

describe('Mascot: Mood System', () => {
  it('degrades mood after 2 missed days', () => {
    const mood = calculateMood('happy', { missedDays: 2 });
    expect(mood).toBe('neutral');
  });
});
```
