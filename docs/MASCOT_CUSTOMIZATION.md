# Habi Mascot Customization

Complete implementation guide for the mascot customization feature.

## Overview

The mascot customization feature allows users to personalize their Habi mascot with 50+ customization options including face features, accessories, body colors, and special effects.

## Architecture

### Data Layer (Zustand + SQLite)

```
User Changes
    ↓
useMascotCustomization Hook
    ↓
useMascotCustomizationStore (Zustand)
    ↓
mascotStorage (SQLite Adapter)
    ↓
mascotRepository
    ↓
SQLite Database (mascot_customization table)
```

### Key Files

**Types & Models:**
- `src/types/mascotCustomization.ts` - HabiCustomization interface, DEFAULT_CUSTOMIZATION

**Data Access:**
- `src/data/repositories/mascotRepository.ts` - Repository for SQLite operations
- `src/store/mascotStorage.ts` - Zustand persistence adapter
- `src/store/mascotStore.ts` - Zustand store with all actions

**Hooks:**
- `src/hooks/useMascotCustomization.ts` - Main hook for accessing customization

**Components:**
- `src/components/mascot/HabiMascot.tsx` - Main SVG mascot renderer
- `src/components/mascot/MascotDisplay.tsx` - Integrated display with mood system
- `src/components/mascot/layers/*.tsx` - Individual SVG layers

**UI:**
- `src/screens/CustomizeHabiScreen.tsx` - Customization screen
- `src/components/customization/*.tsx` - UI components

## Customization Options

### Face & Expression
- **Eyes:** 6 styles (normal, happy, sleepy, determined, cute, mischievous)
- **Eyebrows:** 5 styles (none, normal, raised, furrowed, wavy)
- **Mouth:** 6 expressions (smile, grin, neutral, determined, sleepy, silly)
- **Blush:** Toggle with color picker

### Head Accessories
- **Hair:** 8 styles (none, spiky, curly, long, bob, ponytail, mohawk, wizard)
  - Custom hair color picker
- **Hat:** 10 styles (none, cap, beanie, crown, wizard, bow, headband, tophat, santa, party)
- **Glasses:** 8 styles (none, round, square, sunglasses, reading, monocle, scifi, heart)

### Body & Colors
- **Body Color:** 16 preset colors + custom
- **Pattern:** 6 options (solid, spots, stripes, gradient, sparkles, none)
- **Pattern Color:** Custom color picker (when pattern selected)

### Accessories
- **Necklace:** 6 styles (none, bowtie, bandana, necklace, scarf, medal)
- **Special Effect:** 5 options (none, sparkles, stars, hearts, glow)

## Usage

### Display Customized Mascot

```tsx
import { MascotDisplay } from '@/components/mascot';

// Simple display
<MascotDisplay size={150} />

// With name and message
<MascotDisplay
  size={200}
  showName
  showMessage
/>

// Interactive (tap to pet)
<MascotDisplay
  size={180}
  showMessage
  onPress={() => console.log('Mascot tapped!')}
/>
```

### Access Customization in Code

```tsx
import { useMascotCustomization } from '@/hooks/useMascotCustomization';

function MyComponent() {
  const {
    customization,
    updateName,
    updateEyes,
    updateBody,
    randomizeCustomization,
    resetToDefault,
  } = useMascotCustomization();

  // Read customization
  console.log(customization.name); // "Habi"
  console.log(customization.bodyColor); // "#7FD1AE"

  // Update customization
  updateName('MyHabi');
  updateEyes('happy');
  updateBody('#FFB6C1', 'spots', '#87CEEB');

  // Bulk operations
  randomizeCustomization();
  resetToDefault();
}
```

### Direct SVG Rendering

```tsx
import { HabiMascot } from '@/components/mascot';
import { DEFAULT_CUSTOMIZATION } from '@/types/mascotCustomization';

<HabiMascot
  customization={DEFAULT_CUSTOMIZATION}
  mood="ecstatic"
  size={220}
  animated
/>
```

## Integration with Existing Mascot System

The customization system integrates with the existing MascotContext:

- **MascotContext** handles mood, messages, and interactions (petMascot, etc.)
- **Customization Store** handles visual appearance
- **MascotDisplay** component combines both systems

This separation allows:
- Mood system to work independently
- Visual customization to persist via SQLite
- Both systems to be used together or separately

## Navigation

Users access customization via:
```
Profile Tab → Profile Screen → "Customize Habi" button → CustomizeHabiScreen
```

## Database Schema

```sql
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
```

## SVG Rendering Architecture

The mascot is rendered using layered SVG components in the correct z-order:

1. **BodyLayer** - Base body shape (circle with arms and feet)
2. **PatternLayer** - Body patterns (spots, stripes, gradient, sparkles)
3. **FaceLayer** - Eyes, eyebrows, mouth, blush
4. **AccessoriesLayer** - Hair, hat, glasses, necklace (combined for simplicity)
5. **EffectsLayer** - Special effects (sparkles, stars, hearts, glow)

Each layer is independently rendered and can be enhanced/replaced without affecting others.

## Customization Screen Features

- **Live Preview:** Real-time updates as user changes options
- **Collapsible Sections:** Accordion UI prevents overwhelming users
- **Color Pickers:** Modal with 16 preset colors
- **Quick Actions:**
  - **Random:** Instant fun makeover
  - **Reset:** Return to default Habi
- **Persistence:** Auto-saves to SQLite via Zustand middleware

## Testing

### Manual Testing Checklist

- [ ] Navigate to Profile → Customize Habi
- [ ] Change mascot name and verify it updates
- [ ] Try all eye styles and verify rendering
- [ ] Try all mouth expressions
- [ ] Toggle blush on/off and change color
- [ ] Try all hair styles with different colors
- [ ] Try all hat styles
- [ ] Try all glasses styles
- [ ] Change body color and verify update
- [ ] Try all pattern options with pattern colors
- [ ] Try all necklace styles
- [ ] Try all special effects
- [ ] Tap Random button - verify random customization
- [ ] Tap Reset button - verify return to default
- [ ] Save and exit - verify changes persist
- [ ] Close and reopen app - verify persistence
- [ ] Test on both iOS and Android

### Edge Cases

- Name with 20 characters (max length)
- Empty name (should default to "Habi")
- Rapid customization changes
- Pattern without pattern color
- Multiple color picker opens/closes

## Performance Considerations

- SVG rendering is performant (< 1ms per frame)
- Zustand updates are batched automatically
- SQLite writes are debounced by Zustand persist middleware
- Color picker modal uses React.memo for grid optimization

## Future Enhancements

### Unlockable Items (Checkpoint 8+)
- Streak milestone unlocks (e.g., crown at 100-day streak)
- Achievement-based accessories
- Seasonal items (holiday hats)

### Social Features
- Share your Habi as image
- Community gallery
- Friend comparisons

### Premium Customizations
- Exclusive color palettes
- Animated accessories
- Premium effects

### Advanced Interactions
- Tap animations (already supported via MascotContext)
- Gesture-based interactions
- Mini-games with mascot

## Troubleshooting

### Customization not persisting
- Check SQLite table exists: `SELECT * FROM mascot_customization;`
- Verify Zustand hydration: Check console for "[MascotStore] Hydration complete"
- Check repository logs: "[MascotRepository] Customization saved"

### SVG not rendering
- Ensure react-native-svg is installed: `npm ls react-native-svg`
- Check for TypeScript errors in layer components
- Verify customization prop is valid HabiCustomization type

### Navigation not working
- Verify ProfileStackParamList includes CustomizeHabi
- Check screens/index.ts exports CustomizeHabiScreen
- Verify ProfileStack.Screen is added to ProfileStackNavigator

## Migration Notes

If migrating from previous mascot implementation:
1. Old MascotContext for mood/interactions remains unchanged
2. New customization system adds visual personalization
3. Both systems work together via MascotDisplay component
4. No data migration needed - customization starts from default

## Credits

- Implementation based on `prompts/mascot-proposal.md`
- Follows Zustand + SQLite patterns from habit storage
- SVG placeholders ready for designer-created assets
