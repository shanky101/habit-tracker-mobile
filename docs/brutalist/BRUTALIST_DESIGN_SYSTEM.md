# 🔥 Brutalist Design System - Neo-Brutalist Playful Theme

## Philosophy: Bold, Chunky, Funky & Fun!

The Brutalist theme brings a playful, neo-brutalist aesthetic to the habit tracker. Think **bold colors**, **thick black borders**, **hard offset shadows**, and **snappy animations**. It's like the graphic design equivalent of a Saturday morning cartoon meets Swiss design.

## Core Principles

### 1. **THICK BLACK BORDERS EVERYWHERE**
- All cards, buttons, inputs: 3-4px solid black borders
- No subtle borders - GO BOLD OR GO HOME
- Border color: `#1A1A1A` (almost black)

### 2. **HARD OFFSET SHADOWS**
- No blur, no soft shadows
- Solid black box shadows offset to bottom-right
- Creates 3D "lifted" effect
- Small elements: 2px offset, Big elements: 6-8px offset

### 3. **FUNKY COLOR PALETTE**
Primary colors are PUNCHY and HIGH-CONTRAST:
- **Primary Orange**: `#FF6B35` - Main actions, emphasis
- **Bright Yellow**: `#FFD23F` - Secondary, warnings
- **Cyber Cyan**: `#00D9FF` - Accent, links
- **Hot Pink**: `#FF3BD9` - Special features
- **Electric Green**: `#00FF85` - Success states

### 4. **MINIMAL CURVES**
- Most elements: Sharp corners or tiny radius (4px max)
- Buttons can be slightly rounded (8-12px) for friendliness
- Pills and badges: Full rounded for contrast

### 5. **SNAPPY, BOUNCY ANIMATIONS**
- Fast transitions (100-200ms)
- Elastic easing for playfulness
- Scale transforms on press
- Everything feels RESPONSIVE and ALIVE

## Visual Style Guide

### Typography
```
Display Headings: Outfit Bold, 28-48px
Card Titles: Outfit Semibold, 18-20px
Body Text: Plus Jakarta Sans, 14-16px
Labels: Plus Jakarta Sans Medium, 13-14px
```

**Brutalist Typography Rules:**
- High contrast (black on white/cream)
- Generous letter-spacing for headings
- Bold weights for everything important
- ALL CAPS for small labels (ADD ENERGY!)

### Color Usage

**Backgrounds:**
- Primary Background: `#FFFEF2` (warm off-white)
- Secondary: `#FFF9E3` (light cream)
- Surface (cards): `#FFFFFF` (pure white)

**Text:**
- Primary: `#1A1A1A` (almost black)
- Secondary: `#4A4A4A` (dark gray)
- On colored backgrounds: `#FFFFFF` (white)

**Action Colors:**
- Check habit: Electric Green `#00FF85`
- Delete/Remove: Hot Red `#FF3366`
- Edit: Cyber Cyan `#00D9FF`
- Add new: Primary Orange `#FF6B35`

### Spacing
- Generous padding: 16-24px inside cards
- Good breathing room between elements
- Chunky tap targets (minimum 48x48px)

## Component Patterns

### 🔘 Buttons

**Primary Button:**
```
Background: #FF6B35 (orange)
Text: #FFFFFF (white)
Border: 4px solid #1A1A1A
Border Radius: 12px
Shadow: 4px 4px 0px #000000
Padding: 16px 24px
Font: Outfit Semibold, 16px

Press state: Scale 0.95 + move shadow to 2px 2px
```

**Secondary Button:**
```
Background: #FFFFFF
Text: #1A1A1A
Border: 3px solid #1A1A1A
Shadow: 3px 3px 0px #000000
```

**Ghost Button:**
```
Background: transparent
Text: #1A1A1A
Border: 2px solid #4A4A4A
No shadow (or subtle 1px 1px)
```

### 📇 Cards

**Standard Card:**
```
Background: #FFFFFF
Border: 3px solid #1A1A1A
Border Radius: 12px
Shadow: 6px 6px 0px #000000
Padding: 20px
```

**Hover/Press:**
```
Transform: translateY(2px) translateX(2px)
Shadow: 4px 4px 0px #000000
(Simulates pressing into page)
```

**Accent Cards** (for highlights):
- Yellow background `#FFD23F` with black border
- Pink background `#FF3BD9` with white text
- Cyan background `#00D9FF` with black text

### ✅ Habit Cards

**Uncompleted State:**
```
Background: #FFFFFF
Border: 3px solid #1A1A1A
Left Accent: 6px solid #FF6B35 (orange)
Shadow: 4px 4px 0px #000000
```

**Completed State:**
```
Background: #00FF85 (electric green)
Border: 3px solid #1A1A1A
Checkmark: Thick, bold icon
Shadow: 4px 4px 0px #1A1A1A
Slight tilt animation on complete
```

**In Progress (multi-completion):**
```
Background: Linear gradient or striped pattern
Progress bar: CHUNKY (12px height minimum)
Border: 3px solid #1A1A1A
```

### 🎯 Input Fields

**Text Input:**
```
Background: #FFFFFF
Border: 3px solid #1A1A1A
Border Radius: 8px
Padding: 14px 16px
Font: Plus Jakarta Sans, 16px

Focus state:
Border: 3px solid #FF6B35 (orange)
Shadow: 3px 3px 0px #FF6B35
```

**Checkbox:**
```
Size: 24x24px
Border: 3px solid #1A1A1A
Border Radius: 4px
Checked: #00FF85 background, thick checkmark
Animation: Bouncy scale on check
```

**Toggle Switch:**
```
Chunky and oversized (60x32px)
Border: 3px solid #1A1A1A
Track: White/Green
Thumb: Circle with border, shadow moves with thumb
```

### 💬 Speech Bubbles (Mascot)

**Habi's Speech:**
```
Background: #FFFFFF
Border: 4px solid #1A1A1A
Border Radius: 16px
Shadow: 5px 5px 0px #000000
Tail: Bold, geometric triangle with border
Padding: 16px 20px
Font: Plus Jakarta Sans Medium, 15px
```

**Celebration Bubble:**
```
Background: Rotate between bright colors (#FFD23F, #00D9FF, #FF3BD9)
Animated confetti border pattern
Scale pulse animation
```

### 🎨 Progress Rings/Bars

**Progress Ring:**
```
Stroke Width: 8px (THICK!)
Background Stroke: #E5E5E5
Progress Stroke: Gradient (#FF6B35 -> #FFD23F)
Border around entire ring: 3px solid #1A1A1A
```

**Progress Bar:**
```
Height: 12px minimum (chunky!)
Background: #F0F0F0
Border: 2px solid #1A1A1A
Border Radius: 6px
Fill: #00FF85 (electric green)
Fill has inner border for depth
```

### 🏷️ Badges & Pills

**Count Badge:**
```
Background: #FF3BD9 (hot pink)
Text: #FFFFFF
Border: 2px solid #1A1A1A
Border Radius: 999px (pill)
Padding: 4px 10px
Font: Plus Jakarta Sans Bold, 12px
Shadow: 2px 2px 0px #000000
```

**Status Badge:**
```
Uppercase text
Bold border
Color-coded backgrounds:
- Success: #00FF85
- Warning: #FFD23F
- Error: #FF3366
Always with black border + shadow
```

## Animation Recipes

### 1. **Button Press**
```
Tap down:
- Scale: 0.95
- TranslateX: +2px, TranslateY: +2px
- Shadow offset reduces to match

Tap up:
- Bounce back with elastic easing
- Duration: 200ms
```

### 2. **Card Tap**
```
- Light scale pulse (1.0 -> 1.02 -> 1.0)
- Slight rotation wobble (0deg -> 2deg -> -1deg -> 0deg)
- Duration: 300ms
- Easing: Elastic
```

### 3. **Habit Complete**
```
1. Haptic feedback (medium impact)
2. Card background changes to #00FF85
3. Scale bounce (1.0 -> 1.1 -> 0.95 -> 1.0)
4. Confetti particles burst from center
5. Duration: 600ms total
```

### 4. **Page Transitions**
```
Enter: Slide from right + fade (200ms)
Exit: Slide to left + fade (200ms)
Spring animation with overshoot
```

### 5. **Mascot Interactions**
```
Pet/Tap:
- Scale: 1.0 -> 1.15 -> 1.0
- Rotate: 0 -> -5deg -> 5deg -> 0
- Speech bubble pops in with scale
- Duration: 400ms
```

## Layout Patterns

### Screen Structure
```
1. Bold header (colored background, large title)
2. Generous padding (24px sides)
3. Cards stacked with 16px gaps
4. Floating elements slightly rotated (-1 to 2 degrees)
5. FAB with CHUNKY shadow (8px offset)
```

### Grid System
- 8px base unit
- Cards: 16px gap
- Sections: 24px gap
- Screen padding: 24px

### Z-Layers (via shadows)
```
Layer 0 (flat): No shadow
Layer 1: 2px shadow
Layer 2: 4px shadow (cards)
Layer 3: 6px shadow (elevated cards)
Layer 4: 8px shadow (FAB, modals)
```

## Micro-Interactions

### Haptic Feedback
- Button tap: Light impact
- Habit complete: Medium impact
- Delete action: Warning impact
- All habits complete: Success notification

### Sound Design (future)
- Click: Short, snappy
- Complete: Satisfying "pop"
- All complete: Celebration sound
- Keep volume user-controllable

## Accessibility in Brutalism

**Don't sacrifice usability for style!**

1. **High Contrast**: Already built-in (black borders, bold colors)
2. **Large Tap Targets**: Minimum 48x48px
3. **Clear Visual Hierarchy**: Size + weight + color
4. **Motion**: Respect reduced motion preferences
5. **Color Independence**: Don't rely solely on color (use icons + text)

## Component Hierarchy

### Must-Have Brutal Styling:
✅ Buttons (all types)
✅ Habit cards
✅ Input fields
✅ Mascot speech bubbles
✅ Progress indicators
✅ FAB (Floating Action Button)
✅ Modals/Dialogs
✅ Navigation tabs

### Can Stay Simple:
- Loading spinners (just add border)
- Dividers (make thicker)
- Small icons (add border on background circles)

## Design Don'ts

❌ **NO GRADIENTS** (except for specific accents)
❌ **NO SOFT SHADOWS** (hard edges only!)
❌ **NO SUBTLE BORDERS** (3px+ or bust)
❌ **NO PASTELS** (bold, saturated colors)
❌ **NO OVERLY ROUNDED** (keep it chunky)
❌ **NO SLOW ANIMATIONS** (snappy or nothin')

## Inspiration References

- **Brutalist websites**: Harsh angles, bold typography
- **Risograph prints**: Bold colors, high contrast, playful
- **80s/90s toys**: Chunky, colorful, fun
- **Swiss punk posters**: Bold type, bright colors, organized chaos
- **Cassette futurism**: Retro-tech aesthetic

## Implementation Priority

### Phase 1: Core Components ✅
- Theme tokens added
- Color system defined
- Shadow system defined
- Animation timings set

### Phase 2: UI Components (Next)
- BrutalistButton component
- BrutalistCard component
- BrutalistInput component
- BrutalistBadge component

### Phase 3: Screen Updates
- Home screen redesign
- Habit cards overhaul
- Customize Habi screen update
- Settings UI update

### Phase 4: Polish
- Mascot speech bubbles
- Celebration animations
- Loading states
- Error states
- Empty states

## Success Metrics

✅ **Visually Distinctive**: Users say "Wow, that's different!"
✅ **Playful & Fun**: Makes habit tracking feel less serious
✅ **Still Usable**: Doesn't sacrifice UX for style
✅ **Performant**: Animations run at 60fps
✅ **Accessible**: Meets WCAG AA standards

## Code Example: Brutalist Card

```typescript
<View style={{
  backgroundColor: theme.colors.surface,
  borderWidth: 3,
  borderColor: theme.colors.border,
  borderRadius: theme.radius.radiusLG,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 6, height: 6 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 0, // Android: use borderWidth as fallback
}}>
  {/* Content */}
</View>
```

## The Brutalist Vibe

**If the Default theme is a modern office,**
**the Brutalist theme is a colorful street market!**

Bold, energetic, unapologetic, and absolutely FUN! 🎨🔥
