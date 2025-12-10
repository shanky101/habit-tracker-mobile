# Modular Strategy Implementation Guide

> **Vision**: Build a portfolio of mobile apps that share a common foundation, enabling rapid development through code reuse. Each app should be assembled from interchangeable modules like LEGO blocks.

---

## Executive Summary

This document outlines how to transform the Habit Tracker codebase into a modular architecture that can power multiple apps (Habit Tracker, Hydration Tracker, Fitness Tracker, etc.). The strategy involves:

1. **Extracting shared packages** into a monorepo structure
2. **Defining clear module boundaries** with dependency injection
3. **Creating app-agnostic abstractions** for common functionality
4. **Establishing conventions** for new module creation

---

## Current State Analysis

### Codebase Structure

```
src/
├── components/     # 41 UI components (mixed app-specific and reusable)
├── context/        # 3 contexts (Mascot, Subscription, User)
├── data/           # Database, repositories, default data
├── hooks/          # Custom React hooks
├── navigation/     # App navigation structure
├── screens/        # 39 screens (mostly app-specific)
├── services/       # Business logic (audio, backup, badges, haptics)
├── store/          # Zustand stores (badge, habit, settings, template, user)
├── theme/          # Theming system (tokens, variants)
├── types/          # TypeScript definitions
└── utils/          # Utility functions
```

### Modularity Assessment

| Area | Current State | Reusability | Priority |
|------|---------------|-------------|----------|
| **Theme System** | ✅ Well abstracted | High | Low effort |
| **Database Layer** | 🟡 SQLite with habit-specific schema | Medium | Medium effort |
| **Streaks Engine** | 🔴 Tightly coupled to habits | High potential | High effort |
| **Badge System** | 🟡 Generic-ish but habit-bound | High potential | Medium effort |
| **Onboarding** | 🔴 App-specific screens | High potential | Medium effort |
| **Auth/User** | 🟡 Basic profile management | High | Medium effort |
| **Subscription** | ✅ Mostly abstracted | High | Low effort |
| **UI Components** | 🟡 Mixed coupling | High | Ongoing |
| **Notifications** | 🟡 Habit-specific triggers | High potential | Medium effort |

---

## Target Architecture

### Monorepo Structure

```
/packages
├── @app-core/
│   ├── theme/              # Theming system, tokens, variants
│   ├── ui/                 # Shared UI components
│   ├── storage/            # SQLite abstraction, Zustand helpers
│   ├── auth/               # Authentication & user management
│   ├── subscription/       # In-app purchases, paywall
│   ├── onboarding/         # Configurable onboarding flows
│   ├── notifications/      # Push notification infrastructure
│   ├── analytics/          # Event tracking abstraction
│   └── utils/              # Common utilities
│
├── @features/
│   ├── streaks/            # Streak calculation engine
│   ├── badges/             # Achievement/badge system
│   ├── backup/             # Cloud backup infrastructure
│   ├── mascot/             # Companion character system
│   └── gamification/       # XP, levels, rewards
│
└── /apps
    ├── habit-tracker/      # Habit Tracker app
    ├── hydration-tracker/  # Hydration Tracker app
    └── [future-apps]/
```

---

## Module Specifications

### 1. Theme System (`@app-core/theme`)

**Status**: ✅ Nearly ready for extraction

**Current Implementation**:
- `theme/tokens.ts` - Design tokens (colors, typography, spacing)
- `theme/variants/` - Theme variants (light, dark, custom)
- `theme/ThemeContext.tsx` - React context provider

**Extraction Steps**:
1. Move to package with zero app-specific references
2. Define `ThemeConfig` interface for app customization
3. Export `createTheme(config)` factory function

**Interface**:
```typescript
interface ThemeConfig {
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
  variants?: ThemeVariant[];
}

// Usage
const habitTrackerTheme = createTheme({
  brand: { primary: '#4ADE80', secondary: '#3B82F6', accent: '#F59E0B' }
});
```

---

### 2. Storage Layer (`@app-core/storage`)

**Status**: 🟡 Needs abstraction

**Current Implementation**:
- `store/sqliteStorage.ts` - SQLite persistence adapter
- `data/database/` - Schema initialization
- `data/repositories/` - Data access layer

**Extraction Steps**:
1. Create generic `createSQLiteStorage<T>()` factory
2. Abstract schema creation via migration system
3. Decouple habit-specific tables

**Interface**:
```typescript
interface StorageConfig {
  dbName: string;
  version: number;
  migrations: Migration[];
}

interface Migration {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
  down: (db: SQLiteDatabase) => Promise<void>;
}

// Each app defines its own schema
const habitTrackerStorage = createStorage({
  dbName: 'habit_tracker.db',
  version: 1,
  migrations: [habitMigrations]
});
```

---

### 3. Streaks Engine (`@features/streaks`)

**Status**: 🔴 Needs significant refactoring

**Current State**: Streak logic is embedded in `habitStore.ts` and habit completion handlers.

**Target Design**: Generic streak calculator that works with any "trackable" entity.

**Interface**:
```typescript
interface Trackable {
  id: string;
  completions: Record<string, CompletionRecord>;
  frequency: Frequency;
  targetCount?: number;
}

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  isActiveToday: boolean;
}

// Usage
const streakCalculator = createStreakEngine({ weekStartsOn: 'monday' });
const result = streakCalculator.calculate(trackable);
```

**Extraction Steps**:
1. Extract streak calculation from `habitStore.ts` into pure functions
2. Create `Trackable` interface that habits, hydration logs, etc. can implement
3. Support different frequency types (daily, weekly, custom)

---

### 4. Badge System (`@features/badges`)

**Status**: 🟡 Partially generic

**Current Implementation**:
- `types/badges.ts` - Badge definitions (habit-specific)
- `store/badgeStore.ts` - Badge state management
- `services/badges/BadgeService.ts` - Badge logic
- `components/badges/` - UI components

**Target Design**: App-agnostic achievement system with configurable rules.

**Interface**:
```typescript
interface BadgeDefinition<T> {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'cosmic';
  shape: 'circle' | 'hexagon' | 'diamond' | 'shield' | 'star';
  requirement: BadgeRequirement<T>;
}

interface BadgeRequirement<T> {
  type: string;
  threshold: number;
  evaluate: (context: T) => { progress: number; isUnlocked: boolean };
}

// Usage - Habit Tracker
const streakBadge: BadgeDefinition<HabitContext> = {
  id: 'streak_7',
  title: 'Week Warrior',
  requirement: {
    type: 'streak',
    threshold: 7,
    evaluate: (ctx) => ({
      progress: ctx.currentStreak,
      isUnlocked: ctx.currentStreak >= 7
    })
  }
};

// Usage - Hydration Tracker
const hydrationBadge: BadgeDefinition<HydrationContext> = {
  id: 'hydration_goal_7',
  title: 'Hydration Hero',
  requirement: {
    type: 'consecutive_goals',
    threshold: 7,
    evaluate: (ctx) => ({
      progress: ctx.consecutiveGoalDays,
      isUnlocked: ctx.consecutiveGoalDays >= 7
    })
  }
};
```

**Extraction Steps**:
1. Make `BadgeDefinition` generic over context type
2. Extract `BadgeIcon`, `BadgeCard`, `BadgeDetailModal` as reusable components
3. Create `BadgeProvider` that apps configure with their badge definitions
4. Move habit-specific badge definitions to habit-tracker app

---

### 5. Onboarding System (`@app-core/onboarding`)

**Status**: 🔴 App-specific

**Current Implementation**:
- `screens/OnboardingWelcomeScreen.tsx`
- `screens/OnboardingStreaksScreen.tsx`
- `screens/OnboardingTrackScreen.tsx`
- `screens/PermissionNotificationScreen.tsx`

**Target Design**: Configurable onboarding flow system.

**Interface**:
```typescript
interface OnboardingConfig {
  screens: OnboardingScreen[];
  skipKey: string; // AsyncStorage key for skip state
  onComplete: () => void;
}

interface OnboardingScreen {
  id: string;
  component: React.ComponentType<OnboardingScreenProps>;
  // OR use declarative config:
  title?: string;
  description?: string;
  image?: ImageSource;
  lottie?: LottieSource;
  action?: 'next' | 'permission' | 'complete';
}

// Usage
const habitTrackerOnboarding: OnboardingConfig = {
  screens: [
    { id: 'welcome', title: 'Welcome to Habit Tracker', ... },
    { id: 'streaks', title: 'Build Streaks', ... },
    { id: 'notifications', component: NotificationPermissionScreen },
  ],
  skipKey: '@habit_tracker_onboarding_complete',
  onComplete: () => navigation.navigate('Home')
};
```

**Extraction Steps**:
1. Create reusable onboarding shell with navigation logic
2. Define declarative screen config OR allow custom components
3. Handle permission requests generically
4. Support progress indicators, skip functionality

---

### 6. User & Auth (`@app-core/auth`)

**Status**: 🟡 Basic implementation

**Current Implementation**:
- `store/userStore.ts` - User profile state
- `context/UserContext.tsx` - User context
- `screens/LoginScreen.tsx`, `SignUpScreen.tsx`

**Target Design**: Centralized auth module supporting multiple providers.

**Interface**:
```typescript
interface AuthConfig {
  providers: AuthProvider[];
  onAuthStateChange: (user: User | null) => void;
  profileFields?: ProfileFieldConfig[];
}

type AuthProvider = 'email' | 'google' | 'apple' | 'anonymous';

interface ProfileFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'date';
  required: boolean;
}

// Usage
const authModule = createAuthModule({
  providers: ['email', 'google', 'apple'],
  profileFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
  ],
  onAuthStateChange: (user) => userStore.setUser(user)
});
```

---

### 7. Subscription (`@app-core/subscription`)

**Status**: ✅ Mostly abstracted

**Current Implementation**:
- `context/SubscriptionContext.tsx` - Subscription state
- `screens/PaywallScreen.tsx` - Paywall UI
- `screens/SubscriptionScreen.tsx` - Subscription management

**Extraction Steps**:
1. Make product IDs configurable per app
2. Extract paywall UI components (can be themed)
3. Create `SubscriptionProvider` with config

**Interface**:
```typescript
interface SubscriptionConfig {
  products: ProductConfig[];
  features: FeatureGate[];
  paywallStyle?: PaywallStyleConfig;
}

interface ProductConfig {
  id: string;
  type: 'monthly' | 'yearly' | 'lifetime';
  displayName: string;
}

interface FeatureGate {
  key: string;
  requiredTier: 'free' | 'premium';
}
```

---

### 8. UI Components (`@app-core/ui`)

**Components to Extract**:

| Component | Description | Priority |
|-----------|-------------|----------|
| `ProgressRing` | Circular progress indicator | High |
| `CelebrationModal` | Success celebration overlay | High |
| `TimePeriodSelector` | Date range picker | Medium |
| `StateComponents` | Empty, loading, error states | High |
| `QuickNoteModal` | Note input modal | Medium |
| `SwipeableCard` | Swipe actions card (abstract from habits) | Medium |
| `StatCard` | Statistics display card | High |

**Extraction Pattern**:
```typescript
// Components should be themeable and configurable
interface ProgressRingProps {
  progress: number;       // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;         // Falls back to theme.colors.primary
  backgroundColor?: string;
  children?: React.ReactNode;
}
```

---

### 9. Notifications (`@app-core/notifications`)

**Current State**: Tightly coupled to habits.

**Target Design**: Generic notification scheduler.

**Interface**:
```typescript
interface NotificationConfig {
  id: string;
  title: string;
  body: string;
  trigger: NotificationTrigger;
  data?: Record<string, unknown>;
}

type NotificationTrigger = 
  | { type: 'time'; hour: number; minute: number; repeats: boolean }
  | { type: 'interval'; seconds: number }
  | { type: 'date'; date: Date };

// Usage
notificationService.schedule({
  id: 'hydration_reminder',
  title: 'Time to Hydrate! 💧',
  body: 'You havent logged water in 2 hours',
  trigger: { type: 'interval', seconds: 7200 }
});
```

---

### 10. Gamification (`@features/gamification`)

**Current State**: Basic XP/level in ProfileScreen.

**Target Design**: Comprehensive gamification engine.

**Interface**:
```typescript
interface GamificationConfig {
  xpRules: XPRule[];
  levelCurve: (level: number) => number; // XP needed for level
  rewards?: Reward[];
}

interface XPRule {
  event: string;
  points: number;
  multiplier?: (context: any) => number;
}

// Usage
const gamification = createGamificationEngine({
  xpRules: [
    { event: 'habit_complete', points: 10 },
    { event: 'streak_milestone', points: 50, multiplier: (ctx) => ctx.milestone / 7 },
  ],
  levelCurve: (level) => level * 100,
});
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
1. Set up monorepo structure (Turborepo or Nx)
2. Extract `@app-core/theme` (low risk, immediate benefit)
3. Extract `@app-core/ui` - basic components
4. Create package publish/consume workflow

### Phase 2: Data Layer (Weeks 3-4)
1. Abstract `@app-core/storage` with migration system
2. Refactor stores to use generic storage
3. Create `@features/streaks` engine
4. Test with habit tracker

### Phase 3: Features (Weeks 5-6)
1. Extract `@features/badges` with generic evaluators
2. Create `@app-core/onboarding` framework
3. Abstract `@app-core/notifications`

### Phase 4: Validation (Week 7-8)
1. Build Hydration Tracker using extracted modules
2. Identify gaps and missing abstractions
3. Refine interfaces based on real usage

---

## Module Development Guidelines

### Creating a New Module

1. **Define Interface First**
   - What does this module expose?
   - What configuration does it accept?
   - What are its dependencies?

2. **No App-Specific References**
   - Module must not import from app code
   - Use dependency injection for app-specific logic

3. **Configuration Over Hardcoding**
   ```typescript
   // ❌ Bad
   const STREAK_THRESHOLD = 7;
   
   // ✅ Good
   interface StreakConfig {
     milestones: number[];
   }
   ```

4. **Export Types**
   - Every config interface must be exported
   - Apps need types for proper integration

5. **Testing**
   - Unit tests for pure logic
   - Integration tests within a test app

### Dependency Rules

```
@app-core/utils      <- No dependencies
@app-core/theme      <- @app-core/utils
@app-core/storage    <- @app-core/utils
@app-core/ui         <- @app-core/theme
@features/streaks    <- @app-core/utils
@features/badges     <- @app-core/ui, @app-core/storage
apps/*               <- Any @app-core/*, @features/*
```

---

## Hydration Tracker Example

Using the modular architecture, here's how the Hydration Tracker app would be structured:

```typescript
// apps/hydration-tracker/src/App.tsx
import { ThemeProvider, createTheme } from '@app-core/theme';
import { StorageProvider, createStorage } from '@app-core/storage';
import { BadgeProvider } from '@features/badges';
import { SubscriptionProvider } from '@app-core/subscription';
import { hydrationTheme } from './theme';
import { hydrationBadges } from './badges';
import { hydrationMigrations } from './data/migrations';

const theme = createTheme(hydrationTheme);
const storage = createStorage({
  dbName: 'hydration.db',
  migrations: hydrationMigrations,
});

export default function App() {
  return (
    <StorageProvider storage={storage}>
      <ThemeProvider theme={theme}>
        <SubscriptionProvider config={subscriptionConfig}>
          <BadgeProvider definitions={hydrationBadges}>
            <Navigator />
          </BadgeProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </StorageProvider>
  );
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| New app bootstrap time | < 1 week |
| Shared code percentage | > 60% |
| Module test coverage | > 80% |
| Breaking changes per quarter | < 2 |
| Time to add new theme variant | < 1 hour |

---

## Appendix: File-Level Extraction Map

### Immediate Extraction (No Changes Needed)
- `theme/tokens.ts` -> `@app-core/theme/tokens.ts`
- `theme/ThemeContext.tsx` -> `@app-core/theme/ThemeContext.tsx`
- `components/ProgressRing.tsx` -> `@app-core/ui/ProgressRing.tsx`

### Moderate Refactoring
- `store/sqliteStorage.ts` -> `@app-core/storage/sqliteAdapter.ts`
- `components/badges/BadgeIcon.tsx` -> `@features/badges/components/BadgeIcon.tsx`
- `context/SubscriptionContext.tsx` -> `@app-core/subscription/SubscriptionContext.tsx`

### Significant Refactoring
- `store/habitStore.ts` streak logic -> `@features/streaks/calculator.ts`
- `types/badges.ts` definitions -> `apps/habit-tracker/src/badges/definitions.ts`
- Onboarding screens -> `@app-core/onboarding/` + app-specific content

---

## Monorepo Deep Dive: Tools, Concepts & Recommendations

This section explains monorepos from the ground up, compares available tools, and provides a specific recommendation for your use case.

---

### What is a Monorepo?

A **monorepo** (short for "monolithic repository") is a single Git repository that contains multiple distinct projects. Instead of having separate repositories for each app or library, everything lives together.

#### Traditional Multi-Repo Structure (What You Have Now)
```
github.com/you/habit-tracker-mobile/     ← Repository 1
github.com/you/hydration-tracker-mobile/ ← Repository 2 (future)
github.com/you/shared-ui-components/     ← Repository 3 (for shared code)
```

**Problems with this approach:**
- 🔴 Sharing code requires publishing to npm or copy-pasting
- 🔴 Version mismatches between apps and shared libraries
- 🔴 Testing changes across projects is painful
- 🔴 Difficult to refactor code used by multiple apps

#### Monorepo Structure (What We Want)
```
github.com/you/mobile-apps/
├── apps/
│   ├── habit-tracker/      ← App 1
│   └── hydration-tracker/  ← App 2
├── packages/
│   ├── ui-components/      ← Shared UI
│   ├── theme/              ← Shared theming
│   └── storage/            ← Shared database layer
└── package.json            ← Root configuration
```

**Benefits:**
- ✅ **Atomic changes**: Update shared code AND all apps in one commit
- ✅ **No version conflicts**: Everyone uses the same version of shared code
- ✅ **Easy refactoring**: IDE can find all usages across all projects
- ✅ **Unified tooling**: One ESLint config, one TypeScript config
- ✅ **Faster onboarding**: Clone once, access everything

---

### Key Monorepo Concepts (Glossary)

Before comparing tools, you need to understand these terms:

#### 1. Workspace
A **workspace** is a folder within the monorepo that contains its own `package.json`. Each app and each shared package is a workspace.

```
/apps/habit-tracker/package.json    ← This is a workspace
/packages/ui/package.json           ← This is also a workspace
```

**Package managers** (npm, yarn, pnpm) have built-in workspace support. They understand that `@app-core/ui` refers to `/packages/ui` without needing to publish to npm.

#### 2. Task
A **task** is a command you run, like `build`, `test`, `lint`, or `dev`. In a monorepo, you might have 10 packages, each with their own `build` command.

```bash
# Without a monorepo tool, you'd have to:
cd packages/ui && npm run build
cd packages/theme && npm run build
cd apps/habit-tracker && npm run build
# ...repeat for every package
```

#### 3. Task Orchestration
**Task orchestration** means running tasks across multiple packages intelligently:
- In the **correct order** (build dependencies before dependents)
- In **parallel** where possible (independent packages can build simultaneously)
- **Skipping unchanged** packages (if `ui` hasn't changed, don't rebuild it)

This is the main job of monorepo tools like Turborepo and Nx.

#### 4. Dependency Graph
The **dependency graph** shows which packages depend on which. Monorepo tools use this to determine build order.

```
@app-core/utils      ← No dependencies (build first)
       ↑
@app-core/theme      ← Depends on utils
       ↑
@app-core/ui         ← Depends on theme
       ↑
apps/habit-tracker   ← Depends on ui (build last)
```

#### 5. Caching
**Caching** means saving the output of a task so it doesn't run again if nothing changed. If you ran `build` on `@app-core/ui` yesterday and no files changed, a good monorepo tool will skip the build and use the cached output.

Types of caching:
- **Local cache**: Stored on your machine (~/.turbo or similar)
- **Remote cache**: Stored in the cloud, shared with your team

#### 6. Affected/Changed Detection
When you modify one file, monorepo tools can determine which packages are **affected** and only run tasks on those packages. This makes CI/CD much faster.

```
You changed: packages/theme/colors.ts
Affected:    packages/theme (directly changed)
             packages/ui (imports theme)
             apps/habit-tracker (imports ui)
Not affected: packages/storage (doesn't use theme)
```

---

### Monorepo Tool Comparison

Let's compare the major options:

#### 1. Turborepo

**What is it?**
Turborepo is a high-performance build system for JavaScript/TypeScript monorepos. It was created by Jared Palmer (creator of Formik) and acquired by Vercel in 2021.

**How it works:**
- You define tasks in `turbo.json`
- Turborepo analyzes your dependency graph
- It runs tasks in parallel with intelligent caching
- It's a "task runner" - it doesn't generate code or modify your project structure

**Configuration Example:**
```json
// turbo.json (at root of monorepo)
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": ["dist/**"]    // Cache these folders
    },
    "test": {
      "dependsOn": ["build"]    // Run build before test
    },
    "dev": {
      "cache": false,           // Don't cache dev servers
      "persistent": true        // Keep running
    }
  }
}
```

**Pros:**
| Benefit | Explanation |
|---------|-------------|
| ⚡ **Blazing fast** | Written in Rust, one of the fastest tools available |
| 🎯 **Simple to learn** | One config file, minimal concepts |
| 🔌 **Non-invasive** | Doesn't change your code or folder structure |
| ☁️ **Remote caching** | Free tier with Vercel, speeds up CI dramatically |
| 📦 **Works with any package manager** | npm, yarn, pnpm all supported |
| 🔧 **Zero lock-in** | Easy to remove if you change your mind |
| 📱 **React Native friendly** | No conflicts with Metro bundler |

**Cons:**
| Drawback | Explanation |
|----------|-------------|
| 🚫 **No code generation** | Doesn't scaffold new packages for you |
| 🚫 **No plugins** | What you see is what you get |
| 🚫 **Limited analysis** | Doesn't understand your code deeply |
| 🚫 **Manual package creation** | You create folders/files yourself |

**Best for:** Teams that want speed and simplicity without changing how they work.

---

#### 2. Nx

**What is it?**
Nx is a comprehensive build system and development platform. It was created by ex-Google engineers (Nrwl) who worked on Angular's build tools. It's more "batteries included" than Turborepo.

**How it works:**
- Nx deeply understands your code structure
- It generates packages and components via CLI
- It has a rich plugin ecosystem
- It can work with or without `node_modules`

**Configuration Example:**
```json
// nx.json (at root of monorepo)
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true
    }
  },
  "plugins": [
    "@nx/react-native",
    "@nx/jest"
  ]
}
```

**Project-level config:**
```json
// packages/ui/project.json
{
  "name": "@app-core/ui",
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "options": {
        "outputPath": "dist/packages/ui"
      }
    }
  }
}
```

**Pros:**
| Benefit | Explanation |
|---------|-------------|
| 🛠️ **Code generators** | `nx generate @nx/react:library ui` creates packages instantly |
| 📊 **Dependency graph visualization** | `nx graph` shows visual dependency map |
| 🔌 **Plugin ecosystem** | Plugins for React, React Native, Jest, Cypress, etc. |
| 🎯 **Affected commands** | `nx affected:test` only tests changed packages |
| 🏢 **Enterprise features** | Distributed task execution, cloud dashboard |
| 📚 **Extensive documentation** | Very well documented with tutorials |

**Cons:**
| Drawback | Explanation |
|----------|-------------|
| 📈 **Steeper learning curve** | Many concepts: executors, generators, plugins |
| ⚙️ **More configuration** | `nx.json`, `project.json` for each package, `workspace.json` |
| 🔒 **More lock-in** | Harder to remove once deeply integrated |
| 🐢 **Slower than Turborepo** | Still fast, but Turbo's Rust core is faster |
| 📱 **React Native complexity** | Works, but plugin can be finnicky with Expo |
| 💾 **Larger dependency footprint** | Adds more to node_modules |

**Best for:** Large teams that want comprehensive tooling and don't mind the complexity.

---

#### 3. Lerna (Legacy Option)

**What is it?**
Lerna was the original monorepo tool for JavaScript, created in 2016. It's now maintained by Nx team but is considered legacy.

**Current Status:**
- Lerna v6+ is now powered by Nx under the hood
- If you're starting fresh, use Turborepo or Nx directly
- Only relevant if you're working with an existing Lerna project

**Pros:**
| Benefit | Explanation |
|---------|-------------|
| 📜 **Mature ecosystem** | Been around since 2016 |
| 📦 **Publishing tools** | Good at publishing packages to npm |

**Cons:**
| Drawback | Explanation |
|----------|-------------|
| 🐢 **Slower** | Not optimized like modern tools |
| 🔧 **Maintenance mode** | Not actively developed, mostly maintained |
| 📈 **No caching without Nx** | Need Nx for modern features |

**Verdict:** Skip for new projects.

---

#### 4. pnpm Workspaces (DIY Option)

**What is it?**
pnpm is a package manager (like npm or yarn) with excellent built-in workspace support. You can use it without any additional monorepo tool.

**How it works:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Pros:**
| Benefit | Explanation |
|---------|-------------|
| 💾 **Disk space efficient** | Uses hard links, saves gigabytes |
| ⚡ **Fast installs** | Faster than npm/yarn |
| 🎯 **Built-in filtering** | `pnpm --filter @app-core/ui build` |
| 🔧 **No extra tool** | Works out of the box |

**Cons:**
| Drawback | Explanation |
|----------|-------------|
| 🚫 **No caching** | Reruns everything every time |
| 🚫 **No parallelization intelligence** | Basic compared to Turbo/Nx |
| 🚫 **No affected detection** | Can't determine what changed |

**Best for:** Very small monorepos or as a base for Turborepo.

---

#### 5. Yarn Workspaces (DIY Option)

Similar to pnpm workspaces. Yarn 1 (classic) and Yarn Berry have workspace support.

**Verdict:** Use if you're already on Yarn, but consider adding Turborepo on top.

---

### Comparison Matrix

| Feature | Turborepo | Nx | Lerna | pnpm alone |
|---------|-----------|-----|-------|------------|
| **Learning curve** | 🟢 Easy | 🟡 Medium | 🟢 Easy | 🟢 Easy |
| **Setup time** | 🟢 30 min | 🟡 2-4 hours | 🟢 1 hour | 🟢 15 min |
| **Performance** | 🟢 Fastest | 🟢 Fast | 🔴 Slow | 🟡 Medium |
| **Local caching** | ✅ | ✅ | ❌ (needs Nx) | ❌ |
| **Remote caching** | ✅ Free tier | ✅ Paid | ❌ | ❌ |
| **Code generation** | ❌ | ✅ | ❌ | ❌ |
| **Plugin ecosystem** | ❌ | ✅ Rich | ❌ | ❌ |
| **React Native** | 🟢 Great | 🟡 Works | 🟡 Works | 🟢 Great |
| **Expo compatible** | ✅ | ✅ | ✅ | ✅ |
| **Lock-in risk** | 🟢 Low | 🟡 Medium | 🟢 Low | 🟢 None |
| **Documentation** | 🟢 Good | 🟢 Excellent | 🟡 Dated | 🟢 Good |
| **Community size** | 🟢 Growing | 🟢 Large | 🟡 Declining | 🟢 Large |

---

### Recommendation for Your Use Case

Based on your specific situation:

#### Your Requirements:
1. ✅ Building multiple React Native/Expo apps
2. ✅ Sharing UI components, themes, storage logic
3. ✅ Solo developer (or small team)
4. ✅ Want speed and simplicity
5. ✅ New to monorepos

#### My Recommendation: **Turborepo + pnpm**

**Why this combination:**

| Factor | Why Turborepo + pnpm wins |
|--------|---------------------------|
| **Simplicity** | One `turbo.json` file, minimal concepts to learn |
| **Speed** | Rust-based, fastest available |
| **Expo/RN friendly** | No conflicts with Metro bundler |
| **Low risk** | Can be removed easily if needed |
| **Free remote caching** | Vercel offers free tier |
| **Gradual adoption** | Start simple, add complexity only if needed |

**Why NOT Nx:**
- You're a solo developer - Nx's enterprise features are overkill
- React Native + Nx has occasional friction
- More configs to maintain
- Steeper learning curve for equivalent benefit

**Why NOT pure pnpm:**
- No caching means slower rebuilds as you add packages
- No parallel task orchestration

---

### Setting Up Turborepo + pnpm

Here's a step-by-step guide:

#### Step 1: Install pnpm
```bash
# On Mac
brew install pnpm

# Or via npm
npm install -g pnpm
```

#### Step 2: Create Monorepo Structure
```bash
mkdir mobile-apps
cd mobile-apps

# Initialize root package.json
pnpm init

# Create workspace config
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Create folder structure
mkdir -p apps packages
```

#### Step 3: Add Turborepo
```bash
pnpm add turbo -D -w  # -w means "workspace root"

# Create turbo config
cat > turbo.json << EOF
{
  "\$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".expo/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"]
    }
  }
}
EOF
```

#### Step 4: Configure Root package.json
```json
{
  "name": "mobile-apps",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

#### Step 5: Move Habit Tracker
```bash
# Move your existing app
mv /path/to/habit-tracker-mobile apps/habit-tracker

# Update its package.json name
# Change "name": "habit-tracker-mobile" to "name": "habit-tracker"
```

#### Step 6: Create First Shared Package
```bash
mkdir -p packages/theme
cd packages/theme
pnpm init
```

```json
// packages/theme/package.json
{
  "name": "@app-core/theme",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

#### Step 7: Use Shared Package in App
```json
// apps/habit-tracker/package.json
{
  "dependencies": {
    "@app-core/theme": "workspace:*"
  }
}
```

```bash
# Install workspace dependencies
pnpm install
```

#### Step 8: Run Commands
```bash
# Build all packages
pnpm build

# Run dev server for habit-tracker only
pnpm --filter habit-tracker dev

# Run affected tests
turbo run test --filter=...[origin/main]
```

---

### Final Directory Structure

After migration, your monorepo will look like:

```
mobile-apps/
├── apps/
│   ├── habit-tracker/
│   │   ├── src/
│   │   ├── app.json
│   │   └── package.json
│   └── hydration-tracker/  (future)
│       └── package.json
├── packages/
│   ├── theme/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── tokens.ts
│   │   │   └── ThemeContext.tsx
│   │   └── package.json
│   ├── ui/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── ProgressRing.tsx
│   │   │   └── Button.tsx
│   │   └── package.json
│   └── storage/
│       ├── src/
│       └── package.json
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .gitignore
```

---

> **Next Steps**: Begin with Phase 1 by setting up the monorepo structure using Turborepo + pnpm as described above. Start by extracting the theme system, which provides immediate value with minimal risk.
