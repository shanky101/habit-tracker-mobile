# Theming System Revamp Specification

## 1. Overview
This document outlines the comprehensive overhaul of the application's theming system. The goal is to transform "theming" from simple color swapping to a complete "skinning" engine that alters the app's personality, visuals, and assets. This system is designed as a reusable "IP" core for future applications.

## 2. Architecture: The `ThemeEngine`

The core principle is **separation of concerns**. The app logic consumes abstract tokens, while the `ThemeEngine` supplies the concrete implementation (colors, assets, typography).

### 2.1 Extended Theme Interface
We will extend the current `ThemeTokens` to include assets and behavioral styles.

```typescript
// src/theme/types.ts

export interface ThemeAssets {
  // Mascot assets for different moods
  mascot: {
    happy: any; // ImageSource | string (emoji)
    ecstatic: any;
    sad: any;
    // ... other moods
  };
  // Background patterns or images
  backgroundPattern?: any; // ImageSource
  // Custom icons for tab bar or specific UI elements
  icons?: {
    home: any;
    profile: any;
    // ...
  };
}

export interface ThemeStyles {
  // UI Element styling overrides
  cardBorderRadius: number;
  buttonBorderRadius: number;
  cardBorderWidth: number;
  fontFamilyDisplay: string; // Theme-specific font
  fontFamilyBody: string;
}

export interface ExtendedTheme extends ThemeTokens {
  id: string;
  name: string;
  type: 'light' | 'dark';
  assets: ThemeAssets;
  styles: ThemeStyles;
}
```

### 2.2 Directory Structure
To ensure modularity and ease of "chopping off" parts:

```
src/
  theme/
    engine/           # Core logic (Context, Hooks)
      ThemeContext.tsx
      useTheme.ts
      types.ts
    variants/         # Individual Theme Definitions
      index.ts        # Exports all themes
      retro-pacman/   # Self-contained theme folder
        index.ts
        assets/       # Theme-specific images
        colors.ts
      gaming/
        index.ts
        assets/
      wooden/
        index.ts
        assets/
      ...
```

## 3. Implementation Phases

### Phase 1: Foundation (The Engine)
**Goal:** Refactor the current `ThemeContext` to support the `ExtendedTheme` interface without breaking the app.
- [ ] Create `src/theme/types.ts` with new interfaces.
- [ ] Refactor `ThemeContext` to load themes dynamically.
- [ ] Update `useTheme` to expose `assets` and `styles`.
- [ ] Create a "Default" theme that matches the current app look but uses the new structure.

### Phase 2: Asset Management & Mascot Renderer
**Goal:** Decouple the mascot from hardcoded emojis.
- [ ] Create `MascotRenderer` component.
    -   Props: `mood`, `size`.
    -   Logic: Checks `theme.assets.mascot[mood]`. If string -> Text/Emoji. If image -> Image component.
- [ ] Update `MascotContext` to pass mood state to `MascotRenderer`.
- [ ] Update `ProfileScreen` and `HomeScreen` to use `MascotRenderer`.

### Phase 3: Theme Creation (The Content)
**Goal:** Implement the specific themes requested.

#### 3.1 Retro Pacman 🕹️
- **Colors:** Yellow (#FFFF00), Black (#000000), Blue (#0000FF), Red (#FF0000).
- **Typography:** Pixel font (e.g., Press Start 2P).
- **Assets:**
    -   Mascot: 8-bit Ghost or Pacman-style circle.
    -   Background: Dot grid pattern.
- **Style:** Sharp corners (`borderRadius: 0`), thick borders.

#### 3.2 Gaming (Cyberpunk) 🎮
- **Colors:** Neon Green, Hot Pink, Dark Purple background.
- **Typography:** Futuristic/Tech font.
- **Assets:**
    -   Mascot: Robot or Cyber-pet.
    -   Background: Circuit board pattern or glow effects.
- **Style:** Glow shadows (`elevation` + shadow color), semi-transparent glass cards.

#### 3.3 Wooden (Natural) 🪵
- **Colors:** Beige, Brown, Forest Green.
- **Typography:** Serif font (e.g., Merriweather).
- **Assets:**
    -   Mascot: Owl or Bear illustration.
    -   Background: Wood grain texture.
- **Style:** Soft rounded corners, skeuomorphic touches (shadows looking like depth).

#### 3.4 Minimal (Zen) ⚪
- **Colors:** White, Light Gray, Black text.
- **Typography:** Clean Sans-serif (Helvetica/Inter).
- **Assets:**
    -   Mascot: Simple line art or abstract shape.
    -   Background: Solid color.
- **Style:** No shadows, thin borders, lots of whitespace.

#### 3.5 Dark (Midnight) 🌑
- **Colors:** Deep Gray (#121212), Slate, White text.
- **Typography:** System default.
- **Assets:**
    -   Mascot: Moon or Star character.
- **Style:** High contrast, subtle gradients.

#### 3.6 Fun Colorful (Pop) 🍭
- **Colors:** Bright pastel palette (Pink, Cyan, Yellow).
- **Typography:** Rounded font (e.g., Varela Round).
- **Assets:**
    -   Mascot: Balloon or Blob character.
- **Style:** Large border radius (`radiusXL`), bouncy animations.

#### 3.7 Retro B&W (Gameboy) 📟
- **Colors:** 4 shades of Green/Gray (Darkest, Dark, Light, Lightest).
- **Typography:** Pixel font.
- **Assets:**
    -   Mascot: Pixelated creature.
- **Style:** Pixelated borders (dashed or solid thick).

#### 3.8 Pixel Art 👾
- **Colors:** Vibrant 8-bit palette.
- **Typography:** Pixel font.
- **Assets:**
    -   Mascot: 16-bit hero character.
- **Style:** Blocky UI elements.

### Phase 4: UI Component Updates
**Goal:** Ensure all UI components respect the new `theme.styles`.
- [ ] Update `Card` components to use `theme.styles.cardBorderRadius`.
- [ ] Update `Button` components to use `theme.styles.buttonBorderRadius`.
- [ ] Update Fonts to load dynamically or use the correct family from tokens.

## 4. Checkpoints

1.  **Engine Ready:** `ThemeContext` refactored, app runs with "Default" theme using new structure.
2.  **Mascot Decoupled:** `MascotRenderer` working, switching themes changes mascot (tested with 2 dummy themes).
3.  **Theme Batch 1:** Retro Pacman, Gaming, Wooden implemented.
4.  **Theme Batch 2:** Minimal, Dark, Fun Colorful implemented.
5.  **Theme Batch 3:** Retro B&W, Pixel Art implemented.
6.  **Final Polish:** Global UI audit for consistency.
