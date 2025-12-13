# @app-core/theme

Core theming system for all mobile apps. Provides design tokens, theme variants, and theming infrastructure.

## Exports

- `tokens` - Color, typography, spacing, radius, shadow, and animation tokens
- `ThemeContext` - React context for theme management
- `useTheme` - React hook to access current theme
- `ThemeProvider` - Provider component for app-level theme configuration
- `ThemeVariant` - TypeScript type for theme variants

## Usage

```typescript
import { ThemeProvider, useTheme } from '@app-core/theme';

// In your app root
function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

// In your components
function MyComponent() {
  const { theme } = useTheme();
  return <View style={{ backgroundColor: theme.colors.primary }} />;
}
```

## Available Themes

- `default` - Electric Blue (Go Club)
- `royalBlue` - Royal Blue
- `dark` - Dark Mode
- `zen` - Zen
- `neon` - Neon
- `retro` - Retro
- `minimalist` - Minimalist
- `brutalist` - Brutalist
- `retro-pacman` - Retro Pacman
