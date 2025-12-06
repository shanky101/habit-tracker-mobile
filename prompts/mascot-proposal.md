Habi Mascot Customization - DESIGN PROPOSAL
Vision
Create a delightful, sticky feature that allows users to personalize their Habi mascot, increasing emotional connection and app retention.

Core Customization Categories
1. Face & Expression 👀
Eyes: 6 styles (normal, happy, sleepy, determined, cute, mischievous)
Eyebrows: 5 styles (none, normal, raised, furrowed, wavy)
Mouth: 6 expressions (smile, grin, neutral, determined, sleepy, silly)
Blush: Toggle on/off with color picker
2. Head Accessories 🎩
Hair: 8 styles (none, spiky, curly, long, bob, ponytail, mohawk, wizard)
Hair Color: Color picker with 12 preset colors + custom
Hats: 10 options (none, cap, beanie, crown, wizard hat, bow, headband, etc.)
Glasses: 8 styles (none, round, square, sunglasses, reading, monocle, sci-fi, heart)
3. Body & Color 🎨
Body Color: Full color picker with presets (green, blue, purple, pink, orange, yellow, etc.)
Pattern: 6 options (solid, spots, stripes, gradient, sparkles, none)
Pattern Color: Secondary color picker
4. Accessories ✨
Necklace/Collar: 6 styles (none, bow-tie, bandana, necklace, scarf, medal)
Special Effects: 5 options (none, sparkles, stars, hearts, glow)
5. Naming 📝
Custom name input (default: "Habi")
Character limit: 20 characters
Display name prominently in mascot area
UX Design Approach
Location
New Tab: Add "Customize" tab to bottom navigation (between Home and Stats)
OR Profile Section: Add "Customize Habi" card in Profile screen
Interface Layout
┌─────────────────────────────┐
│   🎨 Customize Your Habi    │
├─────────────────────────────┤
│                             │
│     [LIVE PREVIEW]          │
│    Current Habi Display     │
│       (Large, Animated)     │
│                             │
│   Name: [Habi_____Edit✏️]  │
│                             │
├─────────────────────────────┤
│  📂 Customization Options   │
│  (Collapsible Sections)     │
│                             │
│  ▼ Face & Expression        │
│    • Eyes: [●●●●●●]         │
│    • Eyebrows: [••••]       │
│    • Mouth: [◡◡◡◡]          │
│                             │
│  ▶ Head Accessories         │
│  ▶ Body & Colors            │
│  ▶ Accessories              │
│                             │
│  [Reset to Default] [Save]  │
└─────────────────────────────┘
Interaction Pattern
Live Preview: Mascot updates in real-time as user makes changes
Category Accordion: Collapsible sections to avoid overwhelming UI
Horizontal Scrollable Options: Each customization choice shown as icons/previews in horizontal ScrollView
Selected State: Highlight current selection with border/checkmark
Save Button: Persist changes to local storage
Random Button: "Surprise Me!" button for random customization
Technical Implementation
Data Structure
interface HabiCustomization {
  name: string;
  
  // Face
  eyes: 'normal' | 'happy' | 'sleepy' | 'determined' | 'cute' | 'mischievous';
  eyebrows: 'none' | 'normal' | 'raised' | 'furrowed' | 'wavy';
  mouth: 'smile' | 'grin' | 'neutral' | 'determined' | 'sleepy' | 'silly';
  blushEnabled: boolean;
  blushColor: string;
  
  // Head Accessories
  hairStyle: 'none' | 'spiky' | 'curly' | 'long' | 'bob' | 'ponytail' | 'mohawk' | 'wizard';
  hairColor: string;
  hat: 'none' | 'cap' | 'beanie' | 'crown' | 'wizard' | 'bow' | 'headband' | '...';
  glasses: 'none' | 'round' | 'square' | 'sunglasses' | 'reading' | 'monocle' | '...';
  
  // Body
  bodyColor: string;
  pattern: 'solid' | 'spots' | 'stripes' | 'gradient' | 'sparkles' | 'none';
  patternColor?: string;
  
  // Accessories
  necklace: 'none' | 'bowtie' | 'bandana' | 'necklace' | 'scarf' | 'medal';
  specialEffect: 'none' | 'sparkles' | 'stars' | 'hearts' | 'glow';
}
Storage
Store in local SQLite as JSON
Use Zustand store for state management
Create useHabiCustomization hook
Rendering Strategy
Option 1: SVG-based mascot with layered components (scalable, file size efficient)
Option 2: Pre-rendered PNG sprites with layers (simpler, but larger file size)
Recommendation: SVG for flexibility and file size
Component Architecture
CustomizeHabiScreen
├── HabiPreview (live mascot display)
├── HabiNameInput
├── CustomizationAccordion
│   ├── FaceSection
│   ├── HeadAccessoriesSection
│   ├── BodyColorsSection
│   └── AccessoriesSection
└── ActionButtons (Reset, Random, Save)
Gamification Opportunities
Unlockable Items (Future Enhancement)
Unlock special hats/accessories based on streaks
Seasonal items (holiday hats, etc.)
Achievement-based unlocks (100-day streak = crown)
Sharing
"Share Your Habi" feature - generate image to share on social media
Community gallery (future backend feature)
Development Phases
Phase 1: Core Infrastructure (4-6 hours)

Data models and storage
Basic customization screen layout
Simple mascot preview component
Phase 2: Customization Options (6-8 hours)

Build all customization categories
Implement color pickers
Create option selection UI
Phase 3: SVG Mascot Rendering (8-10 hours)

Design/source SVG components for each customization
Build layered rendering system
Implement real-time preview updates
Phase 4: Polish & Animation (4-6 hours)

Add transitions and animations
Haptic feedback
"Random" and "Reset" features
Persist across app
Total Estimated Time: 22-30 hours

Why This Will Work
Emotional Connection: Personalized mascot creates stronger user attachment
Low Barrier: All users can customize immediately (no unlocks in V1)
Shareability: Unique Habi designs encourage social sharing
Retention Hook: Users return to see/interact with their customized mascot
Future Monetization: Premium customizations or seasonal packs (optional)
Open Questions for User
SVG vs PNG: Prefer vector graphics (SVG) or pre-rendered images (PNG)?
Unlocks: Should some items be locked initially (milestone-based), or all available from start?
Navigation: New bottom tab "Customize" or nested in Profile screen?
Animations: Should Habi have idle animations (blinking, bouncing) or static?
Scope: Start with simplified version (fewer options) or full feature set?