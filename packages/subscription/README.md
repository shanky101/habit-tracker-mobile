# @app-core/subscription

Subscription and premium feature management for React Native apps.

## Features

- **Mock Subscription System**: Ready-to-use subscription context
- **Feature Gating**: Control premium feature access
- **TypeScript**: Full type safety
- **React Native**: Works with Expo and bare React Native

## Usage

```typescript
import { SubscriptionProvider, useSubscription } from '@app-core/subscription';

// Wrap your app
function App() {
  return (
    <SubscriptionProvider>
      <YourApp />
    </SubscriptionProvider>
  );
}

// Use in components
function PremiumFeature() {
  const { isPremium, subscribe, cancelSubscription } = useSubscription();
  
  if (!isPremium) {
    return <PaywallScreen onSubscribe={subscribe} />;
  }
  
  return <PremiumContent />;
}
```

## API

### `useSubscription()`

Returns subscription state and actions:
- `isPremium: boolean` - Whether user has active subscription
- `subscribe: () => Promise<void>` - Activate subscription
- `cancelSubscription: () => Promise<void>` - Cancel subscription
- `isLoading: boolean` - Loading state

### `SubscriptionProvider`

Provider component to wrap your app. Handles subscription state management.

## Note

This package currently uses a mock implementation. For production, integrate with actual payment providers (Stripe, RevenueCat, etc.).
