# 🎨 Brutalist Theme - Implementation Guide

## ✅ What's Been Completed

### 1. **Design System Foundation**
- ✅ Brutalist color palette (punchy orange, bright yellow, cyber cyan, hot pink, electric green)
- ✅ Hard offset shadow system (no blur, solid black shadows)
- ✅ Snappy animation tokens (100-300ms, elastic easing)
- ✅ Minimal border radius config
- ✅ Theme added to tokens.ts

### 2. **Reusable Components Created**
- ✅ **BrutalistCard** - Thick borders, hard shadows, press animations
- ✅ **BrutalistButton** - Chunky buttons with haptic feedback
- ✅ **BrutalistBadge** - Pill-shaped badges for counts/status
- ✅ **BrutalistInput** - Bold text inputs with focus shadows
- ✅ **BrutalistSpeechBubble** - Geometric speech bubble for mascot

### 3. **Updated Components**
- ✅ **SpeechBubble** - Now detects brutalist theme and renders with borders/hard shadows

### 4. **Documentation**
- ✅ Complete design system guide (BRUTALIST_DESIGN_SYSTEM.md)
- ✅ Component usage examples
- ✅ Animation recipes
- ✅ Color palette reference

## 🚀 How to Enable Brutalist Theme

### Option 1: Set as Default (for testing)

Edit `src/theme/tokens.ts`:

```typescript
export const defaultTheme = themes.brutalist; // Changed from themes.default
```

### Option 2: Through Theme Picker

The app already has a theme picker in Settings. The brutalist theme should now appear in the list. Users can select it from:
- Profile → Settings → Theme Picker → Brutalist

### Option 3: Programmatically

```typescript
import { useTheme } from '@/theme';

const { setTheme } = useTheme();
setTheme('brutalist');
```

## 📦 Using Brutalist Components

### Import Components

```typescript
import {
  BrutalistCard,
  BrutalistButton,
  BrutalistBadge,
  BrutalistInput,
} from '@/components/brutalist';
```

### Basic Usage Examples

#### 1. Brutalist Button

```typescript
<BrutalistButton
  variant="primary"
  size="lg"
  onPress={handleSubmit}
>
  Add Habit
</BrutalistButton>

// With icon
<BrutalistButton
  variant="success"
  icon={<CheckIcon size={20} color="#FFF" />}
  onPress={handleComplete}
>
  Complete
</BrutalistButton>
```

**Variants:** `primary` | `secondary` | `ghost` | `success` | `danger`
**Sizes:** `sm` | `md` | `lg`

#### 2. Brutalist Card

```typescript
// Static card
<BrutalistCard variant="default" size="md">
  <Text>Card content here</Text>
</BrutalistCard>

// Pressable card
<BrutalistCard
  variant="primary"
  onPress={() => navigate('Details')}
>
  <Text style={{ color: '#FFF' }}>Tap me!</Text>
</BrutalistCard>

// Colored accent cards
<BrutalistCard variant="success">
  <Text style={{ color: '#FFF' }}>All habits complete! 🎉</Text>
</BrutalistCard>
```

**Variants:** `default` | `primary` | `secondary` | `success` | `warning` | `error`

#### 3. Brutalist Badge

```typescript
// Count badge
<BrutalistBadge variant="pink">5</BrutalistBadge>

// Status badge
<BrutalistBadge variant="success" size="sm">
  DONE
</BrutalistBadge>
```

#### 4. Brutalist Input

```typescript
<BrutalistInput
  label="Habit Name"
  placeholder="Enter habit name..."
  value={habitName}
  onChangeText={setHabitName}
  error={errors.name}
/>
```

## 🎯 Next Steps: Applying Theme App-Wide

### Phase 1: High-Impact Screens

#### A. Home Screen
Replace existing cards with BrutalistCard:

```typescript
// Before
<View style={styles.habitCard}>
  ...
</View>

// After
<BrutalistCard variant="default" onPress={() => handleHabitPress(habit)}>
  ...
</BrutalistCard>
```

Update FAB (Floating Action Button):

```typescript
<BrutalistButton
  variant="primary"
  size="lg"
  onPress={handleAddHabit}
  style={styles.fab}
>
  +
</BrutalistButton>
```

#### B. Habit Cards (DraggableHabitList component)
- Wrap each habit in BrutalistCard
- Use variant="success" for completed habits
- Add colored left accent border

#### C. Customize Habi Screen
- Replace category sections with BrutalistCard
- Use BrutalistButton for save/cancel
- BrutalistInput for name field

### Phase 2: Interactive Elements

#### Replace All Buttons

Find and replace TouchableOpacity/Pressable buttons with BrutalistButton:

```bash
# Search for: <TouchableOpacity style={...button styles...}
# Replace with: <BrutalistButton variant="primary"
```

#### Update All Input Fields

```typescript
// Before
<TextInput style={styles.input} ... />

// After
<BrutalistInput label="Label" ... />
```

### Phase 3: Modals & Dialogs

Update celebration modals, confirmation dialogs:

```typescript
<BrutalistCard variant="warning" size="lg">
  <Text style={styles.title}>Delete Habit?</Text>
  <Text>This action cannot be undone</Text>

  <View style={styles.actions}>
    <BrutalistButton variant="ghost" onPress={onCancel}>
      Cancel
    </BrutalistButton>
    <BrutalistButton variant="danger" onPress={onConfirm}>
      Delete
    </BrutalistButton>
  </View>
</BrutalistCard>
```

### Phase 4: Mascot Integration

The mascot's speech bubble already adapts! When brutalist theme is active:
- Thick border automatically applied
- Hard shadow appears
- Geometric tail renders

No changes needed in HomeScreen - just enable the theme!

## 🎨 Design Patterns to Follow

### 1. **Layer with Shadows**

Create depth using hard offset shadows:

```typescript
// Layer 1 (bottom)
<BrutalistCard size="lg" style={{ marginBottom: 16 }}>
  ...
</BrutalistCard>

// Layer 2 (middle) - slightly smaller shadow
<BrutalistCard size="md" style={{ marginBottom: 12 }}>
  ...
</BrutalistCard>

// Layer 3 (top) - largest shadow for emphasis
<BrutalistCard size="md" variant="primary">
  ...
</BrutalistCard>
```

### 2. **Color Hierarchy**

Use color intentionally:
- **White cards** - Default, neutral content
- **Orange (primary)** - Main actions, CTAs
- **Yellow (secondary)** - Warnings, attention items
- **Green (success)** - Completed states
- **Pink (accent2)** - Special features, highlights
- **Cyan (accent1)** - Links, info

### 3. **Generous Spacing**

Brutalism needs breathing room:

```typescript
<View style={{ padding: 24, gap: 16 }}>
  <BrutalistCard>...</BrutalistCard>
  <BrutalistCard>...</BrutalistCard>
</View>
```

### 4. **Bold Typography**

Use semibold/bold weights:

```typescript
<Text style={{
  fontFamily: theme.typography.fontFamilyDisplayBold,
  fontSize: theme.typography.fontSize2XL,
  color: theme.colors.text,
}}>
  TODAY'S HABITS
</Text>
```

## 🐛 Troubleshooting

### Shadows Not Appearing on Android

Android elevation doesn't support hard shadows. Use this workaround:

```typescript
<View style={{
  borderWidth: 3,
  borderColor: '#000',
  borderBottomWidth: 6,  // Fake shadow
  borderRightWidth: 6,   // Fake shadow
}}>
  ...
</View>
```

### Colors Look Washed Out

Ensure you're using the brutalist theme colors, not default:

```typescript
// ✅ Correct
backgroundColor: theme.colors.primary  // Will be #FF6B35 in brutalist

// ❌ Wrong
backgroundColor: '#6366f1'  // Hardcoded default purple
```

### Animations Feel Slow

Brutalist theme uses faster timings. Check you're using theme animation tokens:

```typescript
duration: theme.animation.durationFast  // 100ms in brutalist
```

## 📊 Performance Considerations

### Shadow Performance

Hard shadows are more performant than blurred shadows! They:
- Don't require blur calculations
- Render faster on both iOS and Android
- Look crisp at any scale

### Component Reuse

Brutalist components are optimized:
- Memoized where appropriate
- Use React Native's Pressable (optimized)
- Leverage useNativeDriver for animations

## 🎭 Theme-Aware Components

Some components automatically adapt to brutalist theme:
- ✅ SpeechBubble (mascot)
- ✅ BackgroundEffects (if updated)

To make any component theme-aware:

```typescript
const { theme } = useTheme();
const isBrutalist = theme.name === 'Brutalist';

// Conditional styling
<View style={{
  borderWidth: isBrutalist ? 3 : 1,
  shadowRadius: isBrutalist ? 0 : 8,
  shadowOffset: isBrutalist ? { width: 4, height: 4 } : { width: 0, height: 2 },
}}>
```

## 🚢 Deployment Checklist

Before releasing brutalist theme:

- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Verify all buttons have haptic feedback
- [ ] Check speech bubbles render correctly
- [ ] Test theme switching (default ↔ brutalist)
- [ ] Verify accessibility (contrast ratios)
- [ ] Test with reduced motion settings
- [ ] Performance test (60fps animations)
- [ ] Screenshot for app store

## 💡 Tips for Best Results

1. **Embrace the Bold** - Don't shy away from thick borders and big shadows
2. **Use Color Intentionally** - Each color has meaning
3. **Keep It Snappy** - Fast animations make it feel alive
4. **Chunk Everything** - Big tap targets, generous padding
5. **Have Fun!** - This theme is playful - lean into it!

## 📱 Example: Converting a Screen

### Before (Default Theme)

```typescript
<View style={styles.container}>
  <View style={styles.header}>
    <Text style={styles.title}>My Habits</Text>
  </View>

  <View style={styles.card}>
    <Text>Drink Water</Text>
    <TouchableOpacity style={styles.button} onPress={complete}>
      <Text>✓</Text>
    </TouchableOpacity>
  </View>
</View>
```

### After (Brutalist Theme)

```typescript
<View style={styles.container}>
  {/* Bold header */}
  <View style={styles.header}>
    <Text style={{
      fontFamily: theme.typography.fontFamilyDisplayBold,
      fontSize: 32,
      color: theme.colors.text,
    }}>
      MY HABITS
    </Text>
  </View>

  {/* Chunky card with shadow */}
  <BrutalistCard variant="default" style={{ marginBottom: 16 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{
        fontFamily: theme.typography.fontFamilyBodySemibold,
        fontSize: 18,
        color: theme.colors.text,
      }}>
        Drink Water
      </Text>

      {/* Snappy button with haptics */}
      <BrutalistButton
        variant="success"
        size="sm"
        onPress={complete}
      >
        ✓
      </BrutalistButton>
    </View>
  </BrutalistCard>
</View>
```

## 🎉 You're Ready!

The brutalist theme is now fully set up and ready to use. Start by enabling it in your app and gradually converting screens using the patterns above.

Remember: **Bold, chunky, playful & funky!** 🔥
