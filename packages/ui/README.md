# @app-core/ui

Shared UI components library for all mobile apps. Provides reusable, theme-aware components.
Comprehensive UI component library for React Native apps with theme integration.

## Components

### Display Components
- **ProgressRing** - Circular progress indicator with customizable colors
- **EmptyState** - Consistent empty state messaging
- **LoadingState** - Loading indicator with theme
- **ErrorState** - Error display with retry functionality

### Selection Components
- **TimePeriodSelector** - Time of day selector (morning, afternoon, etc.)

### Data Visualization
- **StatCard** - Display statistics with icon and value
- **CategoryDistributionChart** - Pie chart for category distribution
- **ConsistencyHeatmap** - Calendar heatmap for tracking consistency
- **TimeOfDayChart** - Bar chart showing time distribution

## Usage

```typescript
import {
  ProgressRing,
  EmptyState,
  LoadingState,
  ErrorState,
  TimePeriodSelector,
  StatCard,
  CategoryDistributionChart,
  ConsistencyHeatmap,
  TimeOfDayChart,
} from '@app-core/ui';

// Use in your components
<ProgressRing progress={0.75} size={100} />
<EmptyState message="No items found" />
<StatCard title="Total" value={42} icon="star" />
```

## Dependencies

- `react` - React library
- `react-native` - React Native
- `expo-linear-gradient` - Gradient support
- `@app-core/theme` - Theme integration

All components are fully themed and work with any theme from `@app-core/theme`.
