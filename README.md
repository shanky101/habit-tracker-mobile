# Habit Tracker Mobile App

A beautiful and functional habit tracking mobile application built with React Native and Expo.

## Features Implemented (First 5 Screens)

### Completed Screens
1. **Splash Screen** - Brand introduction with animated logo
2. **Onboarding Welcome** - Introduction to app's value proposition
3. **Onboarding Track** - Demo of how easy check-ins work
4. **Onboarding Streaks** - Streak visualization and motivation
5. **Permission Request** - Notification permission request

### Design System
- **5 Premium Themes** available:
  - **Momentum & Joy** (Default) - Vibrant purple & pink gradients
  - **Retro Futurism** (Premium) - 80s cyberpunk aesthetic
  - **Earthy Zen** (Premium) - Natural, grounding tones
  - **Minimal Refinement** (Premium) - Black, white, cream luxury
  - **Professional Polish** (Premium) - Deel-inspired systematic design

### Technical Stack
- **Expo** - React Native framework
- **React Navigation** - Navigation library
- **TypeScript** - Type safety
- **Custom Design Token System** - Reusable theme tokens
- **No 3rd Party UI Libraries** - All components built from scratch

## Project Structure

```
src/
├── theme/
│   ├── tokens.ts           # All 5 theme variants with design tokens
│   ├── ThemeContext.tsx    # Theme provider and context
│   └── index.ts
├── screens/
│   ├── SplashScreen.tsx
│   ├── OnboardingWelcomeScreen.tsx
│   ├── OnboardingTrackScreen.tsx
│   ├── OnboardingStreaksScreen.tsx
│   ├── PermissionNotificationScreen.tsx
│   └── index.ts
├── navigation/
│   └── OnboardingNavigator.tsx
└── components/             # (To be added)
```

## Design Tokens

All themes include:
- **Colors**: Primary, secondary, accents, backgrounds, text colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: 8px grid system (4px to 96px)
- **Radius**: Border radius tokens (4px to 9999px)
- **Shadows**: 4 elevation levels with consistent styling
- **Animation**: Duration and easing tokens

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Theme System Usage

The default theme is "Momentum & Joy". Premium themes can be unlocked in settings.

```typescript
import { useTheme } from '@/theme';

const MyComponent = () => {
  const { theme, setTheme, isPremiumUnlocked } = useTheme();

  // Access theme tokens
  const primaryColor = theme.colors.primary;
  const spacing = theme.spacing.space4;

  // Change theme (if premium unlocked)
  setTheme('retro');

  return <View style={{ backgroundColor: primaryColor }} />;
};
```

## Next Steps

The following screens are planned for the next phase:
- Welcome Screen (Authentication)
- Sign Up Screen
- Login Screen
- Password Reset Screen
- Home Screen (Today View)

## Development Notes

- All animations use native driver for 60fps performance
- Screens follow the implementation spec precisely
- TypeScript strict mode enabled
- Path aliases configured (@/ points to src/)
- Safe area context integrated for notch handling

## Design Philosophy

- **Minimal friction**: Every action ≤3 taps away
- **Visual feedback**: Immediate response to interactions
- **Progressive disclosure**: Advanced features shown as needed
- **Celebration-driven**: Positive reinforcement at milestones

## Asset Requirements

Add the following assets to the `assets/` directory:
- icon.png (1024x1024)
- splash.png (2048x2048)
- adaptive-icon.png (Android, 1024x1024)
- favicon.png (Web, 48x48)

---

Built with ❤️ using React Native & Expo
