# Application Testing Strategy & Monorepo Guide

## 1. Overview
The `src` directory contains the main application shell, navigation, and integration wiring. This is where individual packages come together. The testing strategy here moves from unit details to holistic user journeys.

## 2. Monorepo Testing Workflow (Turbo Repo)
Since we are using Turbo Repo, we can orchestrate tests across all packages efficiently.

### Running Tests
- **Run All Tests:** `pnpm test` (This should trigger `turbo run test`)
- **Run Specific Package:** `pnpm test --filter=@app/ui` (Adjust package name as per package.json)
- **Run App Tests Only:** `cd src && pnpm test` (or filtered command)

### CI/CD Integration
- Ensure the build pipeline runs `pnpm test` (or `turbo run test`) before merge.
- Turbo's caching will ensure only changed packages (and their dependents) are re-tested, saving time.

## 3. App-Level Testing Layers

### A. Integration Testing
- **Goal:** Verify that screens render and packages interact correctly.
- **Tools:** `jest`, `@testing-library/react-native`.
- **Strategy:**
  - Render whole Screens (not just components).
  - Mock external services (API, specific native modules) but keep internal package logic real where possible (or mock if complex).
  - Test Navigation flows (e.g., tapping a habit navigates to details).

### B. End-to-End (E2E) Testing
- **Goal:** Simulate a real user on a device/simulator.
- **Tools:** Maestro (Recommended for ease of use) or Detox.
- **Strategy:**
  - Black-box testing.
  - scenarios:
    1. **Onboarding:** User opens app -> sees welcome -> sets name -> lands on home.
    2. **Core Loop:** Create habit -> Mark complete -> Check progress.
  - **Note:** E2E tests are slower; run them on PRs or nightly builds, not every commit.

### C. Context/State Testing
- **Goal:** specific global state providers (UserContext, AuthContext) work.
- **Strategy:** Render a consumer component inside the Provider and toggle state.

## 4. Directory Structure for `src`
```
/src
  /screens
    /Home
      HomeScreen.tsx
      HomeScreen.test.tsx  <-- Integration test
  /__tests__
    /flows
      HabitCreationFlow.test.tsx <-- Multi-screen integration
  /test
    TESTING_STRATEGY.md
```

## 5. Setting Up the Test Environment
1. **Install Dependencies (Root):**
   ```bash
   pnpm add -D -w jest @types/jest ts-jest react-test-renderer @testing-library/react-native
   ```
2. **Configure Jest:**
   - Create a base `jest.config.js` in the root.
   - Each package extends this config.

## Example App Integration Test
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { HabitProvider } from '../context/HabitContext';

// Mock navigation
const mockNav = { navigate: jest.fn() };

describe('App: HomeScreen', () => {
  it('navigates to create habit screen on FAB press', () => {
    const { getByTestId } = render(
      <HabitProvider>
        <HomeScreen navigation={mockNav} />
      </HabitProvider>
    );

    fireEvent.press(getByTestId('add-habit-fab'));
    expect(mockNav.navigate).toHaveBeenCalledWith('CreateHabit');
  });
});
```
