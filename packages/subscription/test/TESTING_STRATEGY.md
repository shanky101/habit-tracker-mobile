# Subscription Package Testing Strategy

## Overview
The `subscription` package handles In-App Purchases (IAP), entitlement checks, and premium feature gating. Accuracy here is critical.

## Recommended Stack
- **Test Runner:** Jest

## Testing Scope

### 1. Entitlement Logic
- **Goal:** Verify strict access control to premium features.
- **Strategy:** Unit test the "gatekeeper" functions.
- **Action:**
  - `hasAccess('premium_stats', userSubscription)` -> boolean.

### 2. Mocking IAP Provider
- **Goal:** Ensure the app handles store responses (success, cancel, error) correctly without hitting real servers.
- **Strategy:** Mock the underlying IAP library (e.g., `react-native-iap` or RevenueCat).
- **Action:**
  - Simulate a successful purchase transaction and verify user state update.
  - Simulate a network error and verify error handling UI/state.

## Example Test Spec
```typescript
import { isFeatureUnlocked } from './entitlements';

describe('Subscription: Entitlements', () => {
  it('allows access to basic features for free users', () => {
    const user = { tier: 'free' };
    expect(isFeatureUnlocked('basic_stats', user)).toBe(true);
  });

  it('blocks access to premium features for free users', () => {
    const user = { tier: 'free' };
    expect(isFeatureUnlocked('ai_insights', user)).toBe(false);
  });
});
```
