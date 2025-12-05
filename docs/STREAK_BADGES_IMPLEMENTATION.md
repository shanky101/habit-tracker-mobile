# 🏆 Streak Badges - Implementation Plan

## 📋 Executive Summary

A gamified achievement system that rewards users for maintaining consistent habit completion streaks. Users earn beautifully designed badges at milestone intervals and can share their achievements on social media.

---

## 🎯 Product Goals

### Primary Objectives
1. **Increase Retention** - Give users tangible milestones to work towards
2. **Boost Engagement** - Create psychological incentive for daily app usage
3. **Drive Virality** - Enable social sharing to attract new users
4. **Celebrate Progress** - Provide visual representation of user achievement

### Success Metrics
- 30% increase in 7-day retention rate
- 25% increase in daily active users (DAU)
- 15% of users share at least one badge
- 40% reduction in user churn after 14 days

---

## 🎨 UX Design Philosophy

### Visual Language

**Design Style: Neo-Trophy Aesthetic**
- **Inspiration**: Olympic medals meets modern app badges meets collectible trading cards
- **Vibe**: Premium, collectible, worth-sharing, Instagram-worthy
- **Feel**: Achievement unlocked, video game reward screen, dopamine hit

### Badge Design Principles

1. **Instantly Recognizable** - Each tier has distinct silhouette
2. **Progressive Elevation** - Visual complexity increases with achievement level
3. **Shareable by Design** - Optimized for social media (1:1 ratio, high contrast)
4. **Delightful Details** - Micro-animations, particle effects, shine/glow
5. **Accessible** - Works in light/dark mode, colorblind-friendly

---

## 🏅 Badge Tier System

### Tier 1: Foundation (Days 1-30)
**Theme: Seedlings to Sapling**
- **1 Day** - "First Step" - Tiny sprout 🌱
- **3 Days** - "Momentum" - Young plant with 3 leaves
- **5 Days** - "Dedication" - Small tree sapling
- **7 Days** - "Week Warrior" - Sturdy young tree ⭐
- **10 Days** - "Double Digits" - Tree with roots visible
- **15 Days** - "Fortnight Champion" - Tree with flowers
- **30 Days** - "Month Master" - Full tree with fruits 🎊

### Tier 2: Growth (Months 1-6)
**Theme: Trees to Forest**
- **1 Month** - "30-Day Titan" - Single majestic oak
- **2 Months** - "Consistency King" - Two intertwined trees
- **3 Months** - "Quarter Champion" - Three trees (small forest)
- **4 Months** - "Seasonal Star" - Four trees (four seasons)
- **5 Months** - "Half-Year Hero" - Five trees with pathway
- **6 Months** - "Semester Conqueror" - Six trees (small grove) 🌟

### Tier 3: Mastery (Months 6-12)
**Theme: Mountains & Peaks**
- **7 Months** - "Lucky Seven" - Mountain with 7 peaks
- **8 Months** - "Unstoppable" - Mountain range
- **9 Months** - "Marathon Master" - Mountain with flag
- **10 Months** - "Diamond Decade" - Mountain with crystals
- **11 Months** - "Almost Legendary" - Mountain touching clouds
- **12 Months** - "Year Legend" - Golden mountain peak 🏆

### Tier 4: Legacy (Year+)
**Theme: Cosmic & Celestial**
- **1.5 Years** - "Stellar Streak" - Earth with ring
- **2 Years** - "Orbit Master" - Earth + Moon
- **2.5 Years** - "Cosmic Warrior" - Solar system (inner planets)
- **3 Years** - "Universe Champion" - Full solar system 🌌

---

## 🎨 Badge Visual Design Spec

### Layout Structure (1080x1080px for sharing)

```
┌─────────────────────────────────────┐
│                                     │
│        [App Logo/Watermark]         │  ← Top right corner
│                                     │
│                                     │
│         ╭─────────────╮             │
│         │             │             │
│         │   BADGE     │             │  ← Central hero element
│         │   VISUAL    │             │     600x600px
│         │             │             │
│         ╰─────────────╯             │
│                                     │
│       "30-Day Titan"                │  ← Badge name (bold, 32pt)
│                                     │
│    ━━━━━━━━━━━━━━━━━━━━━━          │  ← Divider line
│                                     │
│    Achieved on: Jan 15, 2025        │  ← Metadata
│    Longest Streak: 45 days          │
│                                     │
│    @YourUsername                    │  ← User handle (optional)
│                                     │
└─────────────────────────────────────┘
```

### Badge States

#### 1. **Locked State** (Not Yet Earned)
- **Visual**: Silhouette only, dark gray (#333333)
- **Effect**: Subtle pulsing glow (breathing animation)
- **Overlay**: Lock icon + days remaining
- **Border**: Dashed outline
- **Interaction**: Tap to see requirements

#### 2. **Active State** (Currently Earning)
- **Visual**: Partial reveal (0-99% based on progress)
- **Effect**: Progress ring around badge, shimmer effect
- **Overlay**: Progress percentage (e.g., "23/30 days")
- **Border**: Solid outline with gradient
- **Interaction**: Tap to see detailed progress

#### 3. **Unlocked State** (Earned!)
- **Visual**: Full color, high contrast, detailed artwork
- **Effect**: Particle burst, golden shine, sparkle trail
- **Overlay**: "NEW" ribbon for first 7 days
- **Border**: Premium gold/silver frame
- **Interaction**: Tap to enlarge + share options

#### 4. **Legendary State** (Year+ badges)
- **Visual**: Animated (subtle movement), holographic effect
- **Effect**: Continuous glow, aurora effect, stars
- **Overlay**: Special "Legendary" banner
- **Border**: Animated rainbow gradient
- **Interaction**: Tap for celebration modal

### Color Palette Per Tier

**Tier 1 (Days):**
- Primary: `#4CAF50` (Green - Growth)
- Accent: `#8BC34A` (Light Green)
- Glow: `#CDDC39` (Lime)

**Tier 2 (Months):**
- Primary: `#2196F3` (Blue - Trust)
- Accent: `#03A9F4` (Light Blue)
- Glow: `#00BCD4` (Cyan)

**Tier 3 (Quarter-Year):**
- Primary: `#9C27B0` (Purple - Royalty)
- Accent: `#BA68C8` (Light Purple)
- Glow: `#E1BEE7` (Lavender)

**Tier 4 (Year+):**
- Primary: `#FFD700` (Gold - Legend)
- Accent: `#FFA500` (Orange)
- Glow: `#FF6B6B` (Coral)

### Typography

- **Badge Name**: Montserrat ExtraBold, 32pt
- **Subtitle**: Inter Medium, 18pt
- **Metadata**: Inter Regular, 14pt
- **Stats**: Monospace (Roboto Mono), 16pt

---

## 🧮 Streak Calculation Logic

### Global Streak Score

**Definition**: User's longest consecutive streak across ALL habits.

**Calculation Method**:
```typescript
function calculateGlobalStreak(user: User): number {
  const allHabits = user.habits.filter(h => !h.archived);

  // Get all unique dates where ANY habit was completed
  const allCompletionDates = new Set<string>();
  allHabits.forEach(habit => {
    Object.keys(habit.completions).forEach(date => {
      const completion = habit.completions[date];
      if (completion.completionCount >= completion.targetCount) {
        allCompletionDates.add(date);
      }
    });
  });

  // Sort dates chronologically
  const sortedDates = Array.from(allCompletionDates).sort();

  // Find longest consecutive sequence
  let maxStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const daysDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
  }

  return maxStreak;
}
```

**Alternative Method**: Current Active Streak
- Only count consecutive days from today backwards
- Breaks if user misses a day
- More motivating for daily engagement

### Badge Unlock Criteria

```typescript
const BADGE_MILESTONES = [
  // Tier 1: Days (1-30)
  { days: 1, id: 'first_step', tier: 1 },
  { days: 3, id: 'momentum', tier: 1 },
  { days: 5, id: 'dedication', tier: 1 },
  { days: 7, id: 'week_warrior', tier: 1 },
  { days: 10, id: 'double_digits', tier: 1 },
  { days: 15, id: 'fortnight_champion', tier: 1 },
  { days: 30, id: 'month_master', tier: 1 },

  // Tier 2: Months (1-6)
  { days: 30, id: '30_day_titan', tier: 2 },
  { days: 60, id: 'consistency_king', tier: 2 },
  { days: 90, id: 'quarter_champion', tier: 2 },
  { days: 120, id: 'seasonal_star', tier: 2 },
  { days: 150, id: 'half_year_hero', tier: 2 },
  { days: 180, id: 'semester_conqueror', tier: 2 },

  // Tier 3: Quarter-Years (6-12 months)
  { days: 210, id: 'lucky_seven', tier: 3 },
  { days: 240, id: 'unstoppable', tier: 3 },
  { days: 270, id: 'marathon_master', tier: 3 },
  { days: 300, id: 'diamond_decade', tier: 3 },
  { days: 330, id: 'almost_legendary', tier: 3 },
  { days: 365, id: 'year_legend', tier: 3 },

  // Tier 4: Year+ (Legacy)
  { days: 547, id: 'stellar_streak', tier: 4 }, // 1.5 years
  { days: 730, id: 'orbit_master', tier: 4 }, // 2 years
  { days: 912, id: 'cosmic_warrior', tier: 4 }, // 2.5 years
  { days: 1095, id: 'universe_champion', tier: 4 }, // 3 years
];
```

---

## 📱 User Experience Flow

### 1. Badge Discovery Flow

**Entry Points:**
- Stats Screen → "Streak Badges" tab
- Home Screen → Streak counter badge (when close to milestone)
- Profile Screen → Badge showcase widget

**Screen Structure:**
```
┌────────────────────────────────┐
│  ← Back    Streak Badges    ≡  │
├────────────────────────────────┤
│                                │
│  Your Global Streak: 23 days  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                │
│  Next Badge: 30-Day Titan      │
│  Progress: [████░░░░] 23/30    │
│                                │
├────────────────────────────────┤
│                                │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ ✓    │ │ ✓    │ │ 🔒   │   │  ← Badge grid
│  │ 1 DAY│ │ 3 DAY│ │ 5 DAY│   │     (3 columns)
│  └──────┘ └──────┘ └──────┘   │
│                                │
│  [Tier 1 - Days] (7 badges)    │
│  [Tier 2 - Months] (6 badges)  │
│  [Tier 3 - Quarters] (6 badges)│
│  [Tier 4 - Years] (4 badges)   │
│                                │
└────────────────────────────────┘
```

### 2. Badge Unlock Flow

**Moment of Achievement:**
```
User completes habit → Streak reaches milestone → Unlock animation

1. Home screen celebration modal pops up
2. Badge animates in from center (scale + fade)
3. Confetti/particle burst effect
4. Haptic feedback (success pattern)
5. Sound effect (optional, user setting)
6. "Share Your Achievement" CTA button
```

**Unlock Animation Sequence:**
```
Frame 1 (0ms):    Badge at 0.1x scale, 0% opacity
Frame 2 (100ms):  Badge at 0.5x scale, 50% opacity, blur
Frame 3 (200ms):  Badge at 1.2x scale, 100% opacity, particles spawn
Frame 4 (300ms):  Badge at 1.0x scale, shine effect sweeps across
Frame 5 (500ms):  Badge settles, glow pulses, confetti settles
```

### 3. Badge Detail Modal

**What Happens When User Taps Badge:**
```
┌────────────────────────────────┐
│              ✕ Close           │
├────────────────────────────────┤
│                                │
│        [Large Badge Image]     │  ← 400x400px
│                                │
│        "30-Day Titan"          │
│                                │
├────────────────────────────────┤
│  Unlocked: January 15, 2025    │
│  Streak: 30 consecutive days   │
│  Rank: Top 12% of users        │  ← Social proof
│                                │
│  ┌──────────────────────────┐  │
│  │  📤 Share Badge          │  │  ← Primary CTA
│  └──────────────────────────┘  │
│                                │
│  Next Milestone: 60 Days       │
│  Progress: [██░░░░] 30/60      │
│                                │
└────────────────────────────────┘
```

### 4. Social Share Flow

**Share Button Pressed:**
```
1. Generate share image (1080x1080px)
2. Add user data (name, date, streak)
3. Add app watermark (bottom corner)
4. Show native share sheet
5. Track share event (analytics)
```

**Share Options:**
- Instagram Story (auto-sized)
- Twitter (with pre-filled text)
- Facebook
- Copy Image
- Save to Photos
- WhatsApp/Messages

**Pre-filled Share Text:**
```
"I just earned my {BADGE_NAME} badge on Habit Tracker!
{STREAK_COUNT} consecutive days of building better habits. 🔥
Join me: [app link]"
```

---

## 🗂️ Data Model

### Database Schema

#### New Table: `streak_badges`
```sql
CREATE TABLE streak_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  days_required INTEGER NOT NULL,
  unlocked_at TEXT NOT NULL,
  streak_count INTEGER NOT NULL,
  shared_count INTEGER DEFAULT 0,

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_streak_badges_user ON streak_badges(user_id);
CREATE INDEX idx_streak_badges_unlocked ON streak_badges(unlocked_at);
```

#### Update Table: `app_metadata`
```sql
-- Add new metadata keys
INSERT INTO app_metadata (key, value) VALUES
  ('global_streak_current', '0'),
  ('global_streak_longest', '0'),
  ('global_streak_last_updated', ''),
  ('last_badge_unlocked_id', ''),
  ('last_badge_unlocked_at', '');
```

### TypeScript Interfaces

```typescript
interface StreakBadge {
  id: string;
  badgeId: string; // e.g., 'week_warrior'
  name: string; // e.g., 'Week Warrior'
  description: string;
  daysRequired: number;
  tier: 1 | 2 | 3 | 4;
  unlockedAt?: string; // ISO date
  streakCount?: number; // User's streak when unlocked
  sharedCount: number;
  state: 'locked' | 'active' | 'unlocked';
  progress?: number; // 0-100 percentage for active badges
}

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalBadgesUnlocked: number;
  badgesByTier: {
    tier1: number;
    tier2: number;
    tier3: number;
    tier4: number;
  };
  nextMilestone: {
    badgeId: string;
    name: string;
    daysRequired: number;
    daysRemaining: number;
    progress: number;
  };
}

interface BadgeShareImage {
  badgeId: string;
  imageUri: string; // Local file path
  width: 1080;
  height: 1080;
  userName?: string;
  streakCount: number;
  unlockedDate: string;
}
```

---

## 🔧 Implementation Checkpoints

### ✅ Checkpoint 0: Foundation & Planning
**Goal:** Set up data models and streak calculation logic

**Tasks:**
1. Create database migration for `streak_badges` table
2. Add metadata keys for global streak tracking
3. Create TypeScript interfaces (StreakBadge, StreakStats, etc.)
4. Implement global streak calculation algorithm
5. Write unit tests for streak calculation
6. Create badge milestone configuration file

**Deliverables:**
- `src/services/streaks/types.ts` - TypeScript types
- `src/services/streaks/StreakCalculator.ts` - Streak logic
- `src/services/streaks/BadgeManager.ts` - Badge unlock logic
- Database migration script
- Unit tests (>90% coverage)

**Acceptance Criteria:**
- Streak calculation returns correct longest streak
- Badge unlock triggers at exact milestones
- No performance regression (< 50ms calculation time)

---

### ✅ Checkpoint 1: Badge Asset Design
**Goal:** Create visual badge designs for all 23 milestones

**Tasks:**
1. Design badge templates for each tier (4 templates)
2. Create SVG assets for all 23 badges
3. Design locked/active/unlocked states
4. Create particle effects and animations
5. Design share image template
6. Test assets in light/dark mode

**Deliverables:**
- `src/assets/badges/tier1/` - 7 SVG files
- `src/assets/badges/tier2/` - 6 SVG files
- `src/assets/badges/tier3/` - 6 SVG files
- `src/assets/badges/tier4/` - 4 SVG files
- `src/assets/badges/particles/` - Effect assets
- Figma/Sketch design file for future edits

**Design Specifications:**
- SVG format (scalable, < 50KB each)
- 3 color variants per badge (locked/active/unlocked)
- Accessibility: WCAG AA contrast ratio
- Platform support: iOS/Android compatible

**Acceptance Criteria:**
- All badges render correctly on iOS/Android
- Assets load in < 100ms
- Designs approved by design lead

---

### ✅ Checkpoint 2: Badge Display Components
**Goal:** Build reusable React Native components for badges

**Tasks:**
1. Create `BadgeCard` component (grid item)
2. Create `BadgeDetailModal` component (expanded view)
3. Create `BadgeProgressRing` component (circular progress)
4. Create `BadgeUnlockAnimation` component (celebration)
5. Create `BadgeTierSection` component (grouped badges)
6. Implement tap interactions and haptics

**Deliverables:**
- `src/components/badges/BadgeCard.tsx`
- `src/components/badges/BadgeDetailModal.tsx`
- `src/components/badges/BadgeProgressRing.tsx`
- `src/components/badges/BadgeUnlockAnimation.tsx`
- `src/components/badges/BadgeTierSection.tsx`
- `src/components/badges/index.ts` - Barrel export

**Component API Examples:**
```typescript
<BadgeCard
  badge={badgeData}
  state="unlocked"
  size="medium"
  onPress={handlePress}
/>

<BadgeUnlockAnimation
  badge={badgeData}
  visible={showAnimation}
  onComplete={handleComplete}
/>
```

**Acceptance Criteria:**
- Components render at 60fps
- Animations use native driver
- TypeScript types are complete
- Components work in light/dark mode

---

### ✅ Checkpoint 3: Streak Badges Screen
**Goal:** Build main screen to view all badges

**Tasks:**
1. Create `StreakBadgesScreen.tsx` navigation screen
2. Implement badge grid layout (3 columns)
3. Add tier sections with collapse/expand
4. Add progress header showing current streak
5. Add "Next Milestone" widget
6. Implement pull-to-refresh
7. Add empty state (no badges yet)

**Deliverables:**
- `src/screens/StreakBadgesScreen.tsx`
- Navigation integration in Stats tab
- Screen animations and transitions

**Screen Features:**
- Real-time progress updates
- Smooth scrolling performance
- Skeleton loading states
- Error handling (no data, network issues)

**Acceptance Criteria:**
- Screen loads in < 500ms
- Scrolling at 60fps with 100+ badges
- Works offline (cached data)
- Accessible (screen reader support)

---

### ✅ Checkpoint 4: Streak Tracking Service
**Goal:** Automatic streak calculation and badge unlocking

**Tasks:**
1. Create background streak update service
2. Implement badge unlock detection
3. Add notification for new badges (optional)
4. Sync streak data to app_metadata
5. Handle edge cases (timezone changes, date rollover)
6. Add analytics events for unlock tracking

**Deliverables:**
- `src/services/streaks/StreakTracker.ts`
- Background task registration
- Analytics integration

**Service Behavior:**
- Runs after each habit completion
- Checks for new badge unlocks
- Updates global streak counters
- Triggers unlock animations

**Acceptance Criteria:**
- Badge unlocks detected within 1 second
- No duplicate unlocks
- Handles 1000+ habit records efficiently
- Analytics events fire correctly

---

### ✅ Checkpoint 5: Badge Share Feature
**Goal:** Generate shareable images for social media

**Tasks:**
1. Create badge image generator service
2. Implement share sheet integration
3. Add pre-filled share text templates
4. Create share image canvas renderer
5. Add watermark/branding to images
6. Track share events (analytics)

**Deliverables:**
- `src/services/streaks/BadgeImageGenerator.ts`
- `src/services/streaks/BadgeShareService.ts`
- Share templates for each platform

**Image Generation:**
```typescript
async function generateBadgeShareImage(
  badge: StreakBadge,
  user: UserData
): Promise<string> {
  // 1. Create canvas (1080x1080)
  // 2. Render badge SVG at center
  // 3. Add badge name and stats
  // 4. Add user name (if opted in)
  // 5. Add app watermark
  // 6. Export as PNG
  // 7. Return file URI
}
```

**Share Platforms:**
- Instagram Stories (1080x1920)
- Instagram Feed (1080x1080)
- Twitter (1200x675)
- Facebook (1200x630)
- Generic (1080x1080)

**Acceptance Criteria:**
- Image generation < 2 seconds
- Images look sharp on all platforms
- Share sheet opens correctly
- Analytics track share completion

---

### ✅ Checkpoint 6: Unlock Celebration Experience
**Goal:** Delightful moment when earning a badge

**Tasks:**
1. Create unlock modal with animation
2. Add confetti/particle effects
3. Add haptic feedback patterns
4. Add sound effects (optional)
5. Implement share CTA in modal
6. Add "View All Badges" navigation

**Deliverables:**
- `src/components/badges/UnlockCelebrationModal.tsx`
- Particle animation system
- Haptic patterns
- Sound assets (optional)

**Animation Sequence:**
- Modal slides up from bottom (300ms)
- Badge scales in with bounce (500ms)
- Confetti bursts from badge (1000ms)
- Haptic pulse (3 taps)
- Shine effect sweeps badge (800ms)
- CTA buttons fade in (200ms)

**Acceptance Criteria:**
- Animation runs at 60fps
- Haptics feel satisfying (user tested)
- Modal is dismissible (swipe down)
- Works on low-end devices

---

### ✅ Checkpoint 7: Stats Tab Integration
**Goal:** Add badges to Stats screen navigation

**Tasks:**
1. Add "Streak Badges" tab to Stats screen
2. Create badge showcase widget for Stats
3. Add quick stats (X/23 badges unlocked)
4. Add "Next Badge" countdown widget
5. Implement navigation to full badge screen

**Deliverables:**
- Updated `StatsScreen.tsx` with badge tab
- `BadgeStatsWidget.tsx` component
- Navigation integration

**Widget Design:**
```
┌──────────────────────────────┐
│  Streak Badges               │
│                              │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐  +19  │  ← Recent badges
│  │✓ │ │✓ │ │✓ │ │🔒│  more │
│  └──┘ └──┘ └──┘ └──┘        │
│                              │
│  Next: 30-Day Titan (7 days)│
│  [████████░░] 23/30          │
│                              │
│  [View All Badges →]         │
└──────────────────────────────┘
```

**Acceptance Criteria:**
- Widget loads quickly (< 200ms)
- Shows accurate badge count
- Navigation works smoothly

---

### ✅ Checkpoint 8: Testing & Polish
**Goal:** Ensure quality and performance

**Tasks:**
1. Unit test all streak calculation logic
2. Integration test badge unlock flow
3. E2E test share functionality
4. Performance test with 1000+ completions
5. Accessibility audit (screen readers, voice control)
6. Cross-device testing (iOS/Android, various sizes)
7. User acceptance testing (5-10 beta users)

**Test Scenarios:**
- New user (no badges)
- Active user (5+ badges)
- Power user (20+ badges)
- Edge cases (timezone changes, missed days)
- Performance (large datasets)
- Offline mode
- Share flow errors

**Deliverables:**
- Test suite with >90% coverage
- Performance benchmark report
- Accessibility audit report
- User testing feedback summary

**Acceptance Criteria:**
- All tests passing
- No critical bugs
- Performance within targets
- Positive user feedback (>4/5 rating)

---

## 🎯 Feature Rollout Strategy

### Phase 1: Soft Launch (Week 1-2)
- **Audience**: Premium users only (10% of user base)
- **Goal**: Test infrastructure, gather feedback
- **Metrics**: Badge unlock rate, share rate, crashes

### Phase 2: Beta Rollout (Week 3-4)
- **Audience**: All users (100%)
- **Goal**: Scale testing, observe engagement
- **Metrics**: DAU lift, retention improvement, viral coefficient

### Phase 3: Optimization (Week 5-6)
- **Audience**: All users
- **Goal**: Optimize based on data
- **Actions**: A/B test badge designs, share copy, unlock frequency

### Phase 4: Marketing Push (Week 7+)
- **Audience**: All users + acquisition campaigns
- **Goal**: Drive virality and user acquisition
- **Actions**: Social media campaigns, influencer partnerships

---

## 📊 Analytics & Tracking

### Events to Track

**Badge Events:**
- `badge_unlocked` - Badge earned
- `badge_viewed` - Badge detail opened
- `badge_shared` - Badge shared to social
- `share_completed` - Share flow completed

**Screen Events:**
- `streak_badges_viewed` - Main screen opened
- `badge_detail_viewed` - Detail modal opened
- `unlock_modal_viewed` - Celebration shown

**Engagement Events:**
- `next_milestone_clicked` - User checks progress
- `badge_grid_scrolled` - User browses badges
- `tier_expanded` - User expands tier section

### Key Metrics to Monitor

**Engagement:**
- % of users who view badge screen
- Average time spent on badge screen
- % of users who share at least one badge

**Retention:**
- 7-day retention rate (before/after feature)
- 14-day retention rate
- 30-day retention rate

**Virality:**
- Share rate per badge
- Install rate from shared links
- Viral coefficient (K-factor)

**Gamification:**
- Average badges per user
- Time to first badge unlock
- % of users who reach Tier 2/3/4

---

## 🚀 Technical Architecture

### Service Layer
```
src/services/streaks/
├── StreakCalculator.ts       # Core streak logic
├── BadgeManager.ts            # Badge unlock logic
├── BadgeImageGenerator.ts     # Share image creation
├── BadgeShareService.ts       # Social sharing
├── StreakTracker.ts           # Background tracking
└── types.ts                   # TypeScript definitions
```

### Component Layer
```
src/components/badges/
├── BadgeCard.tsx              # Grid item component
├── BadgeDetailModal.tsx       # Full screen detail
├── BadgeProgressRing.tsx      # Circular progress
├── BadgeUnlockAnimation.tsx   # Celebration animation
├── BadgeTierSection.tsx       # Collapsible tier group
├── BadgeShareSheet.tsx        # Share bottom sheet
└── index.ts                   # Barrel export
```

### Screen Layer
```
src/screens/
├── StreakBadgesScreen.tsx     # Main badge screen
└── StatsScreen.tsx            # Updated with badge widget
```

### Asset Layer
```
src/assets/badges/
├── tier1/                     # Day badges (7 files)
├── tier2/                     # Month badges (6 files)
├── tier3/                     # Quarter badges (6 files)
├── tier4/                     # Year badges (4 files)
├── particles/                 # Effect assets
└── share-template.png         # Share image base
```

---

## 💎 Premium Features (Optional)

### Premium Badge Perks

1. **Exclusive Legendary Badges**
   - Tier 5: 4-year, 5-year badges (Premium only)
   - Animated holographic effects
   - Custom badge colors

2. **Badge Customization**
   - Choose badge color themes
   - Add personal motto to share image
   - Custom badge frames

3. **Advanced Stats**
   - Badge earning history graph
   - Comparison with friends
   - Leaderboard ranking

4. **Priority Share Features**
   - Watermark removal option
   - HD export (2160x2160)
   - Video badge animations for sharing

---

## 🎨 Design Inspiration References

### Visual Style References
- **Duolingo Achievements** - Playful, collectible feel
- **Strava Challenges** - Premium badge designs
- **Apple Fitness Awards** - Minimalist elegance
- **PlayStation Trophies** - Tier progression system
- **Behance Project Badges** - Modern, flat design

### Motion Design References
- **Stripe Dashboard Animations** - Smooth, purposeful
- **Linear App Interactions** - Snappy, responsive
- **Figma Prototype Transitions** - Delightful details

---

## 📋 Success Criteria Checklist

### Must-Have (P0)
- [ ] 23 unique badge designs completed
- [ ] Streak calculation accurate (100% test coverage)
- [ ] Badge unlock animation delightful
- [ ] Share to Instagram/Twitter works
- [ ] Performance: Screen loads < 500ms
- [ ] Zero critical bugs in production

### Should-Have (P1)
- [ ] All badges work in dark mode
- [ ] Haptic feedback feels great
- [ ] Pull-to-refresh implemented
- [ ] Analytics tracking complete
- [ ] Accessibility: Screen reader support

### Nice-to-Have (P2)
- [ ] Sound effects for unlock
- [ ] Badge comparison with friends
- [ ] Leaderboard integration
- [ ] Custom badge frames (premium)

---

## 🎊 Launch Checklist

### Pre-Launch
- [ ] All checkpoints complete
- [ ] QA testing passed
- [ ] Performance benchmarks met
- [ ] Analytics integrated
- [ ] Marketing assets ready
- [ ] Support docs written

### Launch Day
- [ ] Feature flag enabled for all users
- [ ] Monitor error rates
- [ ] Watch engagement metrics
- [ ] Respond to user feedback
- [ ] Tweet launch announcement

### Post-Launch (Week 1)
- [ ] Analyze engagement data
- [ ] Identify bottlenecks
- [ ] Plan optimizations
- [ ] Gather user testimonials
- [ ] Iterate on designs

---

## 🎯 Expected Impact

### User Engagement
- **+30%** increase in 7-day retention
- **+25%** increase in daily active users
- **+40%** reduction in user churn after 14 days

### Virality
- **15%** of users share at least one badge
- **+500** organic installs per month from shares
- **0.3** viral coefficient (K-factor)

### Monetization
- **+10%** premium conversion rate
- Badges as premium upsell opportunity
- Increased lifetime value (LTV)

---

## 🔮 Future Enhancements

### V2 Features
1. **Social Leaderboard** - Compare badges with friends
2. **Team Challenges** - Collaborative streak goals
3. **Limited Edition Badges** - Seasonal/holiday badges
4. **Badge Trading** - Swap with friends (gamification)
5. **NFT Badges** - Blockchain-backed achievements (web3)

### V3 Features
1. **AR Badge Display** - View badges in real world (ARKit)
2. **Badge Widgets** - iOS/Android home screen widgets
3. **Voice Achievements** - Siri/Google Assistant integration
4. **Physical Rewards** - Redeem badges for merch

---

## 📞 Open Questions for Product Review

1. **Streak Definition**: Should we use "longest ever" or "current active" streak?
2. **Badge Frequency**: Are 23 badges too many or too few?
3. **Social Sharing**: Require user opt-in for name on share images?
4. **Premium Gate**: Should any badges be premium-only?
5. **Notifications**: Push notification when close to milestone (7/30 days)?
6. **Retroactive Awards**: Grant badges for past achievements or only future?

---

## 🎬 Conclusion

This Streak Badges feature is designed to create a compelling gamification loop that:
1. **Motivates** users with clear, achievable milestones
2. **Celebrates** progress with delightful unlock moments
3. **Shares** achievements to drive viral growth
4. **Retains** users through long-term progression

The 8-checkpoint implementation plan ensures systematic delivery with quality at each stage. Expected to significantly boost retention, engagement, and word-of-mouth growth.

**Ready to build!** 🚀

---

**Document Version:** 1.0
**Last Updated:** December 6, 2025
**Status:** Ready for Implementation
**Estimated Timeline:** 6-8 weeks (full-time engineer)
