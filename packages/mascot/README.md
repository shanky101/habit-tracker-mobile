# @features/mascot

Configurable animated companion character system for React Native apps.

## Features

- 🎭 **Multiple moods & expressions** - Happy, excited, sad, encouraging, and more
- 💬 **Contextual messages** - Speech bubbles with customizable message library
- 🎨 **Theme integration** - Works with any theme from `@app-core/theme`
- ⚡ **Smooth animations** - Entrance, celebration, and reaction animations
- 🎮 **Interactive** - Pet and interact with the mascot
- 🔧 **Fully configurable** - Messages, character, behavior, and features

## Usage

```typescript
import { MascotProvider, useMascot, Mascot } from '@features/mascot';

// Wrap your app
<MascotProvider
  config={{
    name: "Buddy",
    messages: {
      welcome: ["Hi there!", "Let's get started!"],
      celebration: ["Awesome!", "You rock!"],
      encouragement: ["Keep going!", "You got this!"],
    },
    character: {
      primaryColor: "#FFD700",
      secondaryColor: "#FF6B6B",
    },
    behavior: {
      animationSpeed: 1.0,
      autoHide: true,
    },
  }}
>
  <App />
</MascotProvider>

// Use in components
function MyScreen() {
  const { showMessage, celebrate, setMood } = useMascot();
  
  return (
    <>
      <Mascot variant="compact" />
      <Button onPress={() => showMessage("Great job!", "happy")} />
    </>
  );
}
```

## API

### MascotProvider Props
- `config` - Configuration object (see below)
- `children` - React children

### Configuration
All configuration is optional with sensible defaults.

### useMascot Hook
Returns mascot state and control functions:
- `showMessage(message, mood)` - Display custom message
- `celebrate()` - Trigger celebration animation
- `setMood(mood)` - Change mascot mood
- `petMascot()` - Pet interaction

### Mascot Component Props
- `variant` - `'default' | 'hero' | 'floating' | 'compact'`
- `size` - `'small' | 'medium' | 'large'`
- `showMessage` - Show speech bubble (default: true)
- `showName` - Show mascot name (default: false)

## Moods
`happy`, `ecstatic`, `proud`, `encouraging`, `sleepy`, `worried`, `sad`, `celebrating`, `thinking`, `waving`

## Dependencies
- `@app-core/theme` - Theme integration
- `@react-native-async-storage/async-storage` - State persistence
- `expo-haptics` - Haptic feedback
