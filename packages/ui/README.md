# @app-core/ui

Shared UI components library for all mobile apps. Provides reusable, theme-aware components.

## Components

### ProgressRing
Circular progress indicator with customizable size and colors.

```typescript
import { ProgressRing } from '@app-core/ui';

<ProgressRing progress={0.75} size={120} />
```

### State Components
Empty, Loading, and Error state components.

```typescript
import { EmptyState, LoadingState, ErrorState } from '@app-core/ui';

<EmptyState message="No habits yet" icon="inbox" />
<LoadingState />
<ErrorState message="Failed to load" onRetry={handleRetry} />
```

## Dependencies

- `@app-core/theme` - Uses theme context for styling
- `expo-linear-gradient` - For gradient backgrounds

## Usage

All components are theme-aware and will automatically adapt to the current theme from `@app-core/theme`.
