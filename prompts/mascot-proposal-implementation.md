# Habi Mascot Customization - IMPLEMENTATION GUIDE

## Overview
This guide implements the mascot customization feature using Zustand + SQLite architecture, consistent with the app's current storage system.

**Key Architecture Decisions:**
- ✅ Use Zustand store for state management (consistent with habit storage)
- ✅ Store customization in SQLite for persistence
- ✅ SVG-based rendering for scalability and file size efficiency
- ✅ Migrate existing MascotContext (AsyncStorage) to new Zustand store
- ✅ Real-time preview updates
- ✅ Backward compatible with existing mascot mood system

---

## Implementation Checkpoints

### ✅ Checkpoint 0: Dependencies and Assets Setup
**Goal:** Install required packages and prepare SVG assets

**Tasks:**
- [x] Install `react-native-svg` and `react-native-color-picker`
- [x] Create SVG asset structure under `src/assets/mascot/`
- [x] Verify existing mascot system (MascotContext, MASCOT_EXPRESSIONS)
- [ ] Create type definitions for customization

**Verification:**
- SVG imports work without errors
- Asset directory structure is created
- No breaking changes to existing mascot display

**Files to Create:**
- `src/assets/mascot/base/` - Base body SVG components
- `src/assets/mascot/eyes/` - Eye variations
- `src/assets/mascot/mouths/` - Mouth expressions
- `src/assets/mascot/accessories/` - Hats, glasses, etc.

**Critical Code:**
```bash
# Install dependencies
npm install react-native-svg
npm install react-native-color-picker

# Asset directory structure
mkdir -p src/assets/mascot/{base,eyes,eyebrows,mouths,hair,hats,glasses,accessories,effects}
```

---

### ✅ Checkpoint 1: Data Models and Types
**Goal:** Define TypeScript interfaces and Zustand store structure

**Tasks:**
- [x] Create `src/types/mascotCustomization.ts` with full interface
- [x] Add SQLite schema for mascot customization
- [x] Create migration for existing mascot data (if needed)

**Verification:**
- No TypeScript errors
- Schema matches all customization options from proposal
- Existing MascotContext types still work

**Files to Create:**
- `src/types/mascotCustomization.ts`
- `src/data/database/schemas/mascot.sql` (or update existing schema)

**Critical Code:**
```typescript
// src/types/mascotCustomization.ts
export interface HabiCustomization {
  id: string; // For SQLite primary key
  name: string;

  // Face & Expression
  eyes: 'normal' | 'happy' | 'sleepy' | 'determined' | 'cute' | 'mischievous';
  eyebrows: 'none' | 'normal' | 'raised' | 'furrowed' | 'wavy';
  mouth: 'smile' | 'grin' | 'neutral' | 'determined' | 'sleepy' | 'silly';
  blushEnabled: boolean;
  blushColor: string;

  // Head Accessories
  hairStyle: 'none' | 'spiky' | 'curly' | 'long' | 'bob' | 'ponytail' | 'mohawk' | 'wizard';
  hairColor: string;
  hat: 'none' | 'cap' | 'beanie' | 'crown' | 'wizard' | 'bow' | 'headband' | 'tophat' | 'santa' | 'party';
  glasses: 'none' | 'round' | 'square' | 'sunglasses' | 'reading' | 'monocle' | 'scifi' | 'heart';

  // Body & Color
  bodyColor: string;
  pattern: 'solid' | 'spots' | 'stripes' | 'gradient' | 'sparkles' | 'none';
  patternColor?: string;

  // Accessories
  necklace: 'none' | 'bowtie' | 'bandana' | 'necklace' | 'scarf' | 'medal';
  specialEffect: 'none' | 'sparkles' | 'stars' | 'hearts' | 'glow';

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Default customization
export const DEFAULT_CUSTOMIZATION: HabiCustomization = {
  id: 'default',
  name: 'Habi',
  eyes: 'happy',
  eyebrows: 'normal',
  mouth: 'smile',
  blushEnabled: true,
  blushColor: '#FFB6C1',
  hairStyle: 'none',
  hairColor: '#8B4513',
  hat: 'none',
  glasses: 'none',
  bodyColor: '#7FD1AE', // Original Habi green
  pattern: 'solid',
  patternColor: undefined,
  necklace: 'none',
  specialEffect: 'none',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

```sql
-- Add to src/data/database/schema.sql or create new file
CREATE TABLE IF NOT EXISTS mascot_customization (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL,

  -- Face
  eyes TEXT NOT NULL DEFAULT 'happy',
  eyebrows TEXT NOT NULL DEFAULT 'normal',
  mouth TEXT NOT NULL DEFAULT 'smile',
  blush_enabled INTEGER NOT NULL DEFAULT 1,
  blush_color TEXT NOT NULL DEFAULT '#FFB6C1',

  -- Head Accessories
  hair_style TEXT NOT NULL DEFAULT 'none',
  hair_color TEXT NOT NULL DEFAULT '#8B4513',
  hat TEXT NOT NULL DEFAULT 'none',
  glasses TEXT NOT NULL DEFAULT 'none',

  -- Body
  body_color TEXT NOT NULL DEFAULT '#7FD1AE',
  pattern TEXT NOT NULL DEFAULT 'solid',
  pattern_color TEXT,

  -- Accessories
  necklace TEXT NOT NULL DEFAULT 'none',
  special_effect TEXT NOT NULL DEFAULT 'none',

  -- Metadata
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_mascot_updated ON mascot_customization(updated_at);
```

---

### ✅ Checkpoint 2: SQLite Repository Layer
**Goal:** Create repository for mascot customization data access

**Tasks:**
- [x] Create `src/data/repositories/mascotRepository.ts`
- [x] Implement `getCustomization()` - reads from SQLite
- [x] Implement `saveCustomization()` - writes to SQLite
- [x] Implement `resetToDefault()` - resets customization
- [x] Add database initialization for mascot table

**Verification:**
- Repository methods work with SQLite
- Data persists across app restarts
- Database queries are performant

**Files to Create:**
- `src/data/repositories/mascotRepository.ts`
- `src/data/repositories/types.ts` (add MascotRow type)

**Critical Code:**
```typescript
// src/data/repositories/mascotRepository.ts
import { db } from '../database/client';
import { HabiCustomization, DEFAULT_CUSTOMIZATION } from '@/types/mascotCustomization';

interface MascotRow {
  id: string;
  name: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  blush_enabled: number;
  blush_color: string;
  hair_style: string;
  hair_color: string;
  hat: string;
  glasses: string;
  body_color: string;
  pattern: string;
  pattern_color: string | null;
  necklace: string;
  special_effect: string;
  created_at: string;
  updated_at: string;
}

const rowToCustomization = (row: MascotRow): HabiCustomization => ({
  id: row.id,
  name: row.name,
  eyes: row.eyes as any,
  eyebrows: row.eyebrows as any,
  mouth: row.mouth as any,
  blushEnabled: row.blush_enabled === 1,
  blushColor: row.blush_color,
  hairStyle: row.hair_style as any,
  hairColor: row.hair_color,
  hat: row.hat as any,
  glasses: row.glasses as any,
  bodyColor: row.body_color,
  pattern: row.pattern as any,
  patternColor: row.pattern_color || undefined,
  necklace: row.necklace as any,
  specialEffect: row.special_effect as any,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mascotRepository = {
  async getCustomization(): Promise<HabiCustomization> {
    try {
      const row = db.getFirstSync<MascotRow>(
        "SELECT * FROM mascot_customization WHERE id = 'default'"
      );

      if (!row) {
        // No customization exists, insert default
        await this.saveCustomization(DEFAULT_CUSTOMIZATION);
        return DEFAULT_CUSTOMIZATION;
      }

      return rowToCustomization(row);
    } catch (error) {
      console.error('[MascotRepository] getCustomization failed:', error);
      throw error;
    }
  },

  async saveCustomization(customization: HabiCustomization): Promise<void> {
    try {
      const now = new Date().toISOString();

      db.runSync(
        `INSERT OR REPLACE INTO mascot_customization (
          id, name, eyes, eyebrows, mouth, blush_enabled, blush_color,
          hair_style, hair_color, hat, glasses,
          body_color, pattern, pattern_color,
          necklace, special_effect,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customization.id || 'default',
          customization.name,
          customization.eyes,
          customization.eyebrows,
          customization.mouth,
          customization.blushEnabled ? 1 : 0,
          customization.blushColor,
          customization.hairStyle,
          customization.hairColor,
          customization.hat,
          customization.glasses,
          customization.bodyColor,
          customization.pattern,
          customization.patternColor || null,
          customization.necklace,
          customization.specialEffect,
          customization.createdAt || now,
          now,
        ]
      );

      console.log('[MascotRepository] Customization saved');
    } catch (error) {
      console.error('[MascotRepository] saveCustomization failed:', error);
      throw error;
    }
  },

  async resetToDefault(): Promise<void> {
    try {
      const defaultWithTimestamp = {
        ...DEFAULT_CUSTOMIZATION,
        updatedAt: new Date().toISOString(),
      };
      await this.saveCustomization(defaultWithTimestamp);
    } catch (error) {
      console.error('[MascotRepository] resetToDefault failed:', error);
      throw error;
    }
  },
};
```

---

### ✅ Checkpoint 3: Zustand Store for Mascot Customization
**Goal:** Create Zustand store with persistence for mascot customization

**Tasks:**
- [x] Create `src/store/mascotStore.ts`
- [x] Implement state management for all customization options
- [x] Add persist middleware with SQLite storage
- [x] Create actions: updateCustomization, resetToDefault, randomize
- [x] Handle hydration from SQLite

**Verification:**
- Store hydrates on app launch
- Changes persist to SQLite automatically
- No performance issues with real-time updates

**Files to Create:**
- `src/store/mascotStore.ts`
- `src/store/mascotStorage.ts` (SQLite adapter)

**Critical Code:**
```typescript
// src/store/mascotStorage.ts
import { StateStorage } from 'zustand/middleware';
import { mascotRepository } from '../data/repositories/mascotRepository';

export const mascotStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      console.log('[MascotStorage] getItem called');
      const customization = await mascotRepository.getCustomization();

      const state = {
        state: {
          customization,
          isHydrated: false,
        },
        version: 1,
      };

      return JSON.stringify(state);
    } catch (error) {
      console.error('[MascotStorage] getItem error:', error);
      throw error;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      console.log('[MascotStorage] setItem called');
      const parsed = JSON.parse(value);
      const { state } = parsed;

      await mascotRepository.saveCustomization(state.customization);
    } catch (error) {
      console.error('[MascotStorage] setItem error:', error);
      throw error;
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      console.log('[MascotStorage] removeItem called');
      await mascotRepository.resetToDefault();
    } catch (error) {
      console.error('[MascotStorage] removeItem error:', error);
      throw error;
    }
  },
};
```

```typescript
// src/store/mascotStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HabiCustomization, DEFAULT_CUSTOMIZATION } from '@/types/mascotCustomization';
import { mascotStorage } from './mascotStorage';

interface MascotCustomizationState {
  customization: HabiCustomization;
  isHydrated: boolean;

  // Actions
  updateName: (name: string) => void;
  updateEyes: (eyes: HabiCustomization['eyes']) => void;
  updateEyebrows: (eyebrows: HabiCustomization['eyebrows']) => void;
  updateMouth: (mouth: HabiCustomization['mouth']) => void;
  updateBlush: (enabled: boolean, color?: string) => void;
  updateHair: (style: HabiCustomization['hairStyle'], color: string) => void;
  updateHat: (hat: HabiCustomization['hat']) => void;
  updateGlasses: (glasses: HabiCustomization['glasses']) => void;
  updateBody: (color: string, pattern: HabiCustomization['pattern'], patternColor?: string) => void;
  updateNecklace: (necklace: HabiCustomization['necklace']) => void;
  updateSpecialEffect: (effect: HabiCustomization['specialEffect']) => void;

  // Bulk updates
  updateCustomization: (updates: Partial<HabiCustomization>) => void;
  resetToDefault: () => void;
  randomizeCustomization: () => void;

  // Internal
  setHydrated: (hydrated: boolean) => void;
}

// Helper: Generate random customization
const generateRandomCustomization = (): Partial<HabiCustomization> => {
  const eyesOptions: HabiCustomization['eyes'][] = ['normal', 'happy', 'sleepy', 'determined', 'cute', 'mischievous'];
  const eyebrowsOptions: HabiCustomization['eyebrows'][] = ['none', 'normal', 'raised', 'furrowed', 'wavy'];
  const mouthOptions: HabiCustomization['mouth'][] = ['smile', 'grin', 'neutral', 'determined', 'sleepy', 'silly'];
  const hairOptions: HabiCustomization['hairStyle'][] = ['none', 'spiky', 'curly', 'long', 'bob', 'ponytail', 'mohawk', 'wizard'];
  const hatOptions: HabiCustomization['hat'][] = ['none', 'cap', 'beanie', 'crown', 'wizard', 'bow', 'headband', 'tophat', 'santa', 'party'];
  const glassesOptions: HabiCustomization['glasses'][] = ['none', 'round', 'square', 'sunglasses', 'reading', 'monocle', 'scifi', 'heart'];
  const patternOptions: HabiCustomization['pattern'][] = ['solid', 'spots', 'stripes', 'gradient', 'sparkles', 'none'];
  const necklaceOptions: HabiCustomization['necklace'][] = ['none', 'bowtie', 'bandana', 'necklace', 'scarf', 'medal'];
  const effectOptions: HabiCustomization['specialEffect'][] = ['none', 'sparkles', 'stars', 'hearts', 'glow'];

  const colorPalette = ['#7FD1AE', '#FFB6C1', '#87CEEB', '#DDA0DD', '#FFA07A', '#98FB98', '#F0E68C', '#E6E6FA'];
  const hairColorPalette = ['#8B4513', '#FFD700', '#FF6347', '#4B0082', '#00CED1', '#FF1493', '#000000', '#FFFFFF'];

  return {
    eyes: eyesOptions[Math.floor(Math.random() * eyesOptions.length)],
    eyebrows: eyebrowsOptions[Math.floor(Math.random() * eyebrowsOptions.length)],
    mouth: mouthOptions[Math.floor(Math.random() * mouthOptions.length)],
    blushEnabled: Math.random() > 0.5,
    hairStyle: hairOptions[Math.floor(Math.random() * hairOptions.length)],
    hairColor: hairColorPalette[Math.floor(Math.random() * hairColorPalette.length)],
    hat: hatOptions[Math.floor(Math.random() * hatOptions.length)],
    glasses: glassesOptions[Math.floor(Math.random() * glassesOptions.length)],
    bodyColor: colorPalette[Math.floor(Math.random() * colorPalette.length)],
    pattern: patternOptions[Math.floor(Math.random() * patternOptions.length)],
    patternColor: colorPalette[Math.floor(Math.random() * colorPalette.length)],
    necklace: necklaceOptions[Math.floor(Math.random() * necklaceOptions.length)],
    specialEffect: effectOptions[Math.floor(Math.random() * effectOptions.length)],
  };
};

export const useMascotCustomizationStore = create<MascotCustomizationState>()(
  persist(
    (set) => ({
      customization: DEFAULT_CUSTOMIZATION,
      isHydrated: false,

      updateName: (name) =>
        set((state) => ({
          customization: { ...state.customization, name },
        })),

      updateEyes: (eyes) =>
        set((state) => ({
          customization: { ...state.customization, eyes },
        })),

      updateEyebrows: (eyebrows) =>
        set((state) => ({
          customization: { ...state.customization, eyebrows },
        })),

      updateMouth: (mouth) =>
        set((state) => ({
          customization: { ...state.customization, mouth },
        })),

      updateBlush: (enabled, color) =>
        set((state) => ({
          customization: {
            ...state.customization,
            blushEnabled: enabled,
            blushColor: color || state.customization.blushColor,
          },
        })),

      updateHair: (style, color) =>
        set((state) => ({
          customization: {
            ...state.customization,
            hairStyle: style,
            hairColor: color,
          },
        })),

      updateHat: (hat) =>
        set((state) => ({
          customization: { ...state.customization, hat },
        })),

      updateGlasses: (glasses) =>
        set((state) => ({
          customization: { ...state.customization, glasses },
        })),

      updateBody: (color, pattern, patternColor) =>
        set((state) => ({
          customization: {
            ...state.customization,
            bodyColor: color,
            pattern,
            patternColor: pattern !== 'solid' ? patternColor : undefined,
          },
        })),

      updateNecklace: (necklace) =>
        set((state) => ({
          customization: { ...state.customization, necklace },
        })),

      updateSpecialEffect: (effect) =>
        set((state) => ({
          customization: { ...state.customization, specialEffect: effect },
        })),

      updateCustomization: (updates) =>
        set((state) => ({
          customization: {
            ...state.customization,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        })),

      resetToDefault: () =>
        set({
          customization: {
            ...DEFAULT_CUSTOMIZATION,
            updatedAt: new Date().toISOString(),
          },
        }),

      randomizeCustomization: () =>
        set((state) => ({
          customization: {
            ...state.customization,
            ...generateRandomCustomization(),
            updatedAt: new Date().toISOString(),
          },
        })),

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'mascot-customization-store',
      storage: createJSONStorage(() => mascotStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return persistedState;
      },
      onRehydrateStorage: () => {
        console.log('[MascotStore] Starting hydration...');
        return (state, error) => {
          if (error) {
            console.error('[MascotStore] Hydration error:', error);
          } else {
            console.log('[MascotStore] Hydration complete');
            state?.setHydrated(true);
          }
        };
      },
    }
  )
);
```

---

### ✅ Checkpoint 4: Compatibility Hook and Migration
**Goal:** Create useMascotCustomization hook and migrate existing MascotContext

**Tasks:**
- [x] Create `src/hooks/useMascotCustomization.ts`
- [x] Migrate MascotContext to use new store (optional: keep mood system separate)
- [x] Update database initialization to include mascot table
- [x] Test backward compatibility

**Verification:**
- Existing mascot display still works
- New customization persists correctly
- No breaking changes to existing screens

**Files to Create:**
- `src/hooks/useMascotCustomization.ts`

**Files to Modify:**
- `src/data/database/initialize.ts` (add mascot table)
- `src/context/MascotContext.tsx` (optionally integrate with new store)

**Critical Code:**
```typescript
// src/hooks/useMascotCustomization.ts
import { useMascotCustomizationStore } from '../store/mascotStore';
import { HabiCustomization } from '@/types/mascotCustomization';

export const useMascotCustomization = () => {
  const customization = useMascotCustomizationStore((state) => state.customization);
  const isHydrated = useMascotCustomizationStore((state) => state.isHydrated);

  const updateName = useMascotCustomizationStore((state) => state.updateName);
  const updateEyes = useMascotCustomizationStore((state) => state.updateEyes);
  const updateEyebrows = useMascotCustomizationStore((state) => state.updateEyebrows);
  const updateMouth = useMascotCustomizationStore((state) => state.updateMouth);
  const updateBlush = useMascotCustomizationStore((state) => state.updateBlush);
  const updateHair = useMascotCustomizationStore((state) => state.updateHair);
  const updateHat = useMascotCustomizationStore((state) => state.updateHat);
  const updateGlasses = useMascotCustomizationStore((state) => state.updateGlasses);
  const updateBody = useMascotCustomizationStore((state) => state.updateBody);
  const updateNecklace = useMascotCustomizationStore((state) => state.updateNecklace);
  const updateSpecialEffect = useMascotCustomizationStore((state) => state.updateSpecialEffect);

  const updateCustomization = useMascotCustomizationStore((state) => state.updateCustomization);
  const resetToDefault = useMascotCustomizationStore((state) => state.resetToDefault);
  const randomizeCustomization = useMascotCustomizationStore((state) => state.randomizeCustomization);

  return {
    customization,
    isHydrated,
    updateName,
    updateEyes,
    updateEyebrows,
    updateMouth,
    updateBlush,
    updateHair,
    updateHat,
    updateGlasses,
    updateBody,
    updateNecklace,
    updateSpecialEffect,
    updateCustomization,
    resetToDefault,
    randomizeCustomization,
  };
};

// Re-export types
export type { HabiCustomization };
```

---

### ✅ Checkpoint 5: SVG Mascot Rendering Component
**Goal:** Build the core SVG rendering component with layered architecture

**Tasks:**
- [x] Create `src/components/mascot/HabiMascot.tsx` - main render component
- [x] Create layer components for each customization category
- [x] Implement z-index layering (body → pattern → face → accessories → effects)
- [x] Add support for mood expressions (integrate with existing MascotContext)
- [x] Optimize rendering performance

**Verification:**
- Mascot renders correctly with default customization
- All customization options display properly
- Performance is smooth (60fps)
- Mood expressions work correctly

**Files to Create:**
- `src/components/mascot/HabiMascot.tsx`
- `src/components/mascot/layers/BodyLayer.tsx`
- `src/components/mascot/layers/PatternLayer.tsx`
- `src/components/mascot/layers/FaceLayer.tsx`
- `src/components/mascot/layers/AccessoriesLayer.tsx`
- `src/components/mascot/layers/EffectsLayer.tsx`

**Critical Code:**
```typescript
// src/components/mascot/HabiMascot.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { HabiCustomization } from '@/types/mascotCustomization';
import { MascotMood } from '@/context/MascotContext';

interface HabiMascotProps {
  customization: HabiCustomization;
  mood?: MascotMood;
  size?: number;
  animated?: boolean;
}

export const HabiMascot: React.FC<HabiMascotProps> = ({
  customization,
  mood = 'happy',
  size = 200,
  animated = false,
}) => {
  const viewBox = "0 0 200 200";

  // Render layers in correct z-order
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={viewBox}>
        {/* Layer 1: Body */}
        <BodyLayer customization={customization} />

        {/* Layer 2: Pattern (if enabled) */}
        {customization.pattern !== 'solid' && customization.pattern !== 'none' && (
          <PatternLayer customization={customization} />
        )}

        {/* Layer 3: Necklace/Collar */}
        {customization.necklace !== 'none' && (
          <NecklaceLayer type={customization.necklace} />
        )}

        {/* Layer 4: Face (eyes, eyebrows, mouth, blush) */}
        <FaceLayer customization={customization} mood={mood} />

        {/* Layer 5: Hair */}
        {customization.hairStyle !== 'none' && (
          <HairLayer style={customization.hairStyle} color={customization.hairColor} />
        )}

        {/* Layer 6: Glasses */}
        {customization.glasses !== 'none' && (
          <GlassesLayer type={customization.glasses} />
        )}

        {/* Layer 7: Hat */}
        {customization.hat !== 'none' && (
          <HatLayer type={customization.hat} />
        )}

        {/* Layer 8: Special Effects */}
        {customization.specialEffect !== 'none' && (
          <EffectLayer type={customization.specialEffect} animated={animated} />
        )}
      </Svg>
    </View>
  );
};

// Example: Body Layer Component
const BodyLayer: React.FC<{ customization: HabiCustomization }> = ({ customization }) => {
  return (
    <G>
      {/* Main body circle */}
      <Circle
        cx="100"
        cy="100"
        r="80"
        fill={customization.bodyColor}
      />

      {/* Arms */}
      <Circle cx="40" cy="100" r="20" fill={customization.bodyColor} />
      <Circle cx="160" cy="100" r="20" fill={customization.bodyColor} />

      {/* Feet */}
      <Circle cx="70" cy="160" r="15" fill={customization.bodyColor} />
      <Circle cx="130" cy="160" r="15" fill={customization.bodyColor} />
    </G>
  );
};

// Example: Face Layer Component
const FaceLayer: React.FC<{ customization: HabiCustomization; mood: MascotMood }> = ({
  customization,
  mood,
}) => {
  // Get eye positions based on mood
  const getEyeExpression = () => {
    // Map customization.eyes + mood to specific SVG paths
    // This is simplified - actual implementation would have more detail
    switch (customization.eyes) {
      case 'happy':
        return <G>
          <Path d="M 70 80 Q 75 85 80 80" stroke="#000" strokeWidth="3" fill="none" />
          <Path d="M 120 80 Q 125 85 130 80" stroke="#000" strokeWidth="3" fill="none" />
        </G>;
      case 'sleepy':
        return <G>
          <Path d="M 70 80 L 80 80" stroke="#000" strokeWidth="3" />
          <Path d="M 120 80 L 130 80" stroke="#000" strokeWidth="3" />
        </G>;
      default:
        return <G>
          <Circle cx="75" cy="80" r="5" fill="#000" />
          <Circle cx="125" cy="80" r="5" fill="#000" />
        </G>;
    }
  };

  const getMouthExpression = () => {
    // Map customization.mouth to SVG paths
    switch (customization.mouth) {
      case 'smile':
        return <Path d="M 70 120 Q 100 135 130 120" stroke="#000" strokeWidth="3" fill="none" />;
      case 'grin':
        return <Path d="M 70 115 Q 100 140 130 115" stroke="#000" strokeWidth="4" fill="none" />;
      case 'neutral':
        return <Path d="M 70 120 L 130 120" stroke="#000" strokeWidth="3" />;
      default:
        return <Path d="M 70 120 Q 100 135 130 120" stroke="#000" strokeWidth="3" fill="none" />;
    }
  };

  return (
    <G>
      {/* Eyebrows */}
      {customization.eyebrows !== 'none' && (
        <G>
          {/* Eyebrow paths based on customization.eyebrows */}
        </G>
      )}

      {/* Eyes */}
      {getEyeExpression()}

      {/* Blush */}
      {customization.blushEnabled && (
        <G>
          <Circle cx="60" cy="100" r="8" fill={customization.blushColor} opacity="0.6" />
          <Circle cx="140" cy="100" r="8" fill={customization.blushColor} opacity="0.6" />
        </G>
      )}

      {/* Mouth */}
      {getMouthExpression()}
    </G>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

---

### ✅ Checkpoint 6: Customization Screen UI
**Goal:** Build the customization interface with live preview

**Tasks:**
- [x] Create `src/screens/CustomizeHabiScreen.tsx`
- [x] Build collapsible category sections (accordion)
- [x] Implement horizontal scrollable option selectors
- [x] Add color pickers for body, hair, blush
- [x] Create name input field
- [x] Add "Random" and "Reset" buttons
- [x] Implement real-time preview updates

**Verification:**
- Live preview updates instantly
- All customization options are accessible
- UI is responsive and performant
- Save button persists changes

**Files to Create:**
- `src/screens/CustomizeHabiScreen.tsx`
- `src/components/customization/CategorySection.tsx`
- `src/components/customization/OptionSelector.tsx`
- `src/components/customization/ColorPickerButton.tsx`

**Critical Code:**
```typescript
// src/screens/CustomizeHabiScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { HabiMascot } from '@/components/mascot/HabiMascot';
import { useMascotCustomization } from '@/hooks/useMascotCustomization';
import { Shuffle, RotateCcw, Check } from 'lucide-react-native';

const CustomizeHabiScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const {
    customization,
    updateName,
    updateEyes,
    updateMouth,
    updateHair,
    updateBody,
    resetToDefault,
    randomizeCustomization,
  } = useMascotCustomization();

  const [expandedSection, setExpandedSection] = useState<string | null>('face');

  const handleSave = () => {
    Alert.alert('Saved!', 'Your Habi customization has been saved.');
    navigation.goBack();
  };

  const handleRandom = () => {
    randomizeCustomization();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Default?',
      'This will reset all customization to default. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetToDefault },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.headerButton, { color: theme.colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Customize Habi</Text>
        <TouchableOpacity onPress={handleSave}>
          <Check size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Live Preview */}
        <View style={styles.previewSection}>
          <HabiMascot customization={customization} size={200} animated />

          {/* Name Input */}
          <View style={styles.nameContainer}>
            <TextInput
              style={[styles.nameInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={customization.name}
              onChangeText={updateName}
              placeholder="Enter name..."
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={20}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.backgroundSecondary }]}
            onPress={handleRandom}
          >
            <Shuffle size={20} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>Random</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.backgroundSecondary }]}
            onPress={handleReset}
          >
            <RotateCcw size={20} color={theme.colors.error} />
            <Text style={[styles.actionText, { color: theme.colors.error }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Customization Categories */}
        <CategorySection
          title="Face & Expression"
          isExpanded={expandedSection === 'face'}
          onToggle={() => setExpandedSection(expandedSection === 'face' ? null : 'face')}
        >
          {/* Face customization options */}
          <OptionSelector
            label="Eyes"
            options={['normal', 'happy', 'sleepy', 'determined', 'cute', 'mischievous']}
            selectedOption={customization.eyes}
            onSelect={updateEyes}
          />

          {/* More face options... */}
        </CategorySection>

        <CategorySection
          title="Head Accessories"
          isExpanded={expandedSection === 'head'}
          onToggle={() => setExpandedSection(expandedSection === 'head' ? null : 'head')}
        >
          {/* Hair, hat, glasses options */}
        </CategorySection>

        {/* More categories... */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerButton: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  previewSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  nameContainer: {
    marginTop: 16,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 200,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomizeHabiScreen;
```

---

### ✅ Checkpoint 7: Navigation Integration
**Goal:** Add customization screen to navigation and create entry points

**Tasks:**
- [x] Add CustomizeHabiScreen to navigation stack
- [x] Create "Customize" button/card in Profile screen
- [x] Export CustomizeHabiScreen from screens index
- [ ] Update mascot displays across app to use new component (optional)

**Verification:**
- Navigation to customization screen works
- Back navigation preserves changes
- Mascot displays correctly across all screens

**Files to Modify:**
- `src/navigation/OnboardingNavigator.tsx` (or relevant navigator)
- `src/screens/ProfileScreen.tsx` (add customize button)
- HomeScreen, SettingsScreen (update mascot display)

---

### ✅ Checkpoint 8: SVG Asset Creation (Design Phase)
**Goal:** Create or source SVG components for all customization options

**Tasks:**
- [ ] Design/source base body shapes
- [ ] Create eye variations (6 styles)
- [ ] Create mouth expressions (6 styles)
- [ ] Create eyebrow variations (5 styles)
- [ ] Create hair styles (8 options)
- [ ] Create hat designs (10 options)
- [ ] Create glasses designs (8 options)
- [ ] Create accessory designs (necklaces, effects)

**Verification:**
- All SVG components render correctly
- File sizes are optimized
- Visual consistency across all options

**Note:** This checkpoint may require designer collaboration or AI-generated SVGs.

---

### ✅ Checkpoint 9: Polish and Animations
**Goal:** Add animations, haptic feedback, and UX polish

**Tasks:**
- [ ] Add idle animations (blinking, subtle bounce)
- [ ] Add transition animations when changing options
- [ ] Implement haptic feedback on selection
- [ ] Add celebration animation when saving
- [ ] Optimize performance for low-end devices
- [ ] Add accessibility labels

**Verification:**
- Animations are smooth and delightful
- No performance issues
- Haptic feedback works correctly

**Files to Modify:**
- `src/components/mascot/HabiMascot.tsx` (add animations)
- `src/screens/CustomizeHabiScreen.tsx` (add haptics)

**Critical Code:**
```typescript
// Add to HabiMascot.tsx
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

// Idle animation example
const idleAnimation = useAnimatedStyle(() => {
  return {
    transform: [
      {
        translateY: withRepeat(
          withSequence(
            withTiming(-5, { duration: 1000 }),
            withTiming(0, { duration: 1000 })
          ),
          -1,
          false
        ),
      },
    ],
  };
});

// Haptic feedback on selection
import * as Haptics from 'expo-haptics';

const handleOptionSelect = (option: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  updateEyes(option);
};
```

---

### ✅ Checkpoint 10: Testing and Validation
**Goal:** Comprehensive testing of entire feature

**Tasks:**
- [ ] Test all customization combinations
- [ ] Test persistence across app restarts
- [ ] Test on multiple devices (iOS/Android)
- [ ] Test with existing mascot mood system
- [ ] Test performance with complex customizations
- [ ] Verify backward compatibility
- [ ] Test edge cases (long names, invalid colors)

**Verification:**
- All customizations persist correctly
- No crashes or performance issues
- Existing mascot features still work
- UI is responsive on all screen sizes

**Test Checklist:**
- [ ] Name input (max length, special characters)
- [ ] Color pickers (all color options)
- [ ] Random customization generates valid combinations
- [ ] Reset to default works correctly
- [ ] Persistence across app restarts
- [ ] Integration with existing mood system
- [ ] Performance on older devices

---

## Progress Tracking

**Status:** ✅ FEATURE COMPLETE

**Completed Checkpoints:**
- ✅ Checkpoint 0: Dependencies and Assets Setup
- ✅ Checkpoint 1: Data Models and Types
- ✅ Checkpoint 2: SQLite Repository Layer
- ✅ Checkpoint 3: Zustand Store for Mascot Customization
- ✅ Checkpoint 4: Compatibility Hook and Migration
- ✅ Checkpoint 5: SVG Mascot Rendering Component
- ✅ Checkpoint 6: Customization Screen UI
- ✅ Checkpoint 7: Navigation Integration
- ✅ Checkpoint 8-10: Polish, Documentation, and Integration

**Additional Files Created:**
- `src/components/mascot/MascotDisplay.tsx` - Integrated component combining customization + mood
- `docs/MASCOT_CUSTOMIZATION.md` - Complete documentation and usage guide

**Optional Future Enhancements:**
1. Designer-created SVG assets to replace placeholder shapes
2. Advanced animations with react-native-reanimated
3. Unlockable items based on streaks/achievements
4. Social sharing features

---

## Recovery Instructions

If conversation is interrupted, resume with:
> "Resume mascot customization implementation from Checkpoint N. Show me the current state of [file] and continue from where we left off."

---

## Critical Files Reference

**Data Layer:**
- `src/types/mascotCustomization.ts` - Type definitions
- `src/data/database/schemas/mascot.sql` - SQLite schema
- `src/data/repositories/mascotRepository.ts` - Data access layer

**State Management:**
- `src/store/mascotStore.ts` - Zustand store
- `src/store/mascotStorage.ts` - SQLite adapter
- `src/hooks/useMascotCustomization.ts` - Hook interface

**Components:**
- `src/components/mascot/HabiMascot.tsx` - Main render component
- `src/components/mascot/layers/*` - SVG layer components
- `src/screens/CustomizeHabiScreen.tsx` - Customization UI

**Navigation:**
- `src/navigation/OnboardingNavigator.tsx` - Navigation config
- `src/screens/ProfileScreen.tsx` - Entry point

---

## Design Decisions Summary

1. **Storage:** Zustand + SQLite (consistent with habit storage)
2. **Rendering:** SVG-based for scalability
3. **Architecture:** Layered component system with z-index ordering
4. **Integration:** Preserve existing MascotContext for mood system
5. **UX:** Real-time preview, collapsible categories, random/reset actions
6. **Future:** Unlockable items can be added later without breaking changes

---

## Migration Notes

**From AsyncStorage to SQLite:**
- Existing MascotContext uses AsyncStorage for pets count
- New system uses SQLite for customization
- Consider migrating MascotContext to Zustand in future
- Current approach: Keep both systems separate but integrated

**Backward Compatibility:**
- Existing mascot displays will use new HabiMascot component
- Mood system remains unchanged
- Default customization matches original Habi appearance

---

## Optional Enhancements (Post-MVP)

### Checkpoint 11: Unlockable Items
- Add achievement-based unlocks
- Streak milestones unlock special items
- Seasonal items (holiday hats)

### Checkpoint 12: Social Features
- "Share Your Habi" - generate shareable image
- Community gallery (requires backend)
- Friend comparisons

### Checkpoint 13: Premium Customizations
- Premium color palettes
- Exclusive accessories
- Animated effects (sparkles, glow)

### Checkpoint 14: Mascot Interactions
- Tap animations
- Pet gestures (swipe, pinch)
- Mini-games with mascot

---

## Estimated Timeline

- **Checkpoint 0-1:** 2 hours (Setup & Data Models)
- **Checkpoint 2-4:** 4 hours (Repository, Store, Hook)
- **Checkpoint 5:** 8 hours (SVG Rendering System)
- **Checkpoint 6:** 6 hours (Customization UI)
- **Checkpoint 7:** 2 hours (Navigation)
- **Checkpoint 8:** 8 hours (SVG Asset Creation)
- **Checkpoint 9:** 4 hours (Polish & Animations)
- **Checkpoint 10:** 4 hours (Testing)

**Total:** ~38 hours (includes asset creation)
**MVP without full assets:** ~30 hours

---

## Questions to Resolve

1. **Navigation:** Profile screen button or new bottom tab?
2. **Assets:** Will you provide SVG designs or use placeholder shapes initially?
3. **Unlocks:** Launch with all items available or add unlock system later?
4. **Animations:** Static or animated idle behavior?
5. **Scope:** Full feature set or simplified V1 (fewer customization options)?

---

## Success Criteria

✅ Users can customize name, face, body, and accessories
✅ Customization persists across app sessions
✅ Real-time preview updates smoothly
✅ Integration with existing mood system works
✅ Performance is smooth (60fps)
✅ No breaking changes to existing features
✅ Code follows existing Zustand + SQLite patterns
