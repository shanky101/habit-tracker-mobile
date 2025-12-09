# Badge System Design Specification

## 1. Overview & Philosophy
The goal is to increase app stickiness and user motivation through a visually stunning, collectible badge system. Badges are not just static icons; they are digital jewels—animated, shiny, and highly shareable.

**Core Pillars:**
*   **Visual Excellence:** "Jewel-like" quality using shaders (Skia), gradients, and 3D-like effects.
*   **Progression:** Clear tiers (Bronze to Cosmic) to reward both beginners and power users.
*   **Delight:** Surprise unlocks, confetti explosions, haptic feedback, and tiered audio.
*   **Shareability:** Beautiful "card" format for sharing achievements on social media.

---

## 2. Visual Design Language

### 2.1. Materials & Tiers
Badges are categorized by rarity/difficulty, represented by materials. Each material has specific shader properties (reflection, gloss, metallic).

| Tier | Material | Color Palette | Visual Effect | Unlock % Target |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | **Bronze** | Rustic Orange, Brown, Copper | Matte finish, slight metallic sheen | 40% of badges |
| **Tier 2** | **Silver** | Grey, White, Blue-ish Tint | High gloss, chrome reflections | 25% of badges |
| **Tier 3** | **Gold** | Yellow, Amber, Deep Gold | Polished metal, warm highlights, sparkles | 20% of badges |
| **Tier 4** | **Platinum** | Cyan, White, Iridescent | Holographic sheen, rainbow subtle reflection | 10% of badges |
| **Tier 5** | **Diamond** | Blue, Crystal, White | Refractive, sharp edges, internal glow | 4% of badges |
| **Tier 6** | **Cosmic** | Purple, Deep Blue, Starfield | Animated nebula texture (Perlin noise), pulsing glow | 1% of badges |

### 2.2. Shape Language
Each badge type uses a specific shape to communicate its category at a glance:

*   **Hexagon:** Standard achievement shape (Volume, Milestones)
*   **Shield:** Resilience/Protection badges (Comebacks, Negative habits)
*   **Star:** Special events, Firsts, and Seasonal badges
*   **Circle:** Consistency/Streak badges
*   **Diamond:** Perfectionists and Ultimate achievements

### 2.3. Animation & Shaders (Skia)
*   **Idle State:** Subtle "breathing" light reflection (gyroscope-controlled if possible).
*   **Unlock Animation:**
    1.  Badge scales up from 0 with a spring effect (0.8s).
    2.  "Flash" of light sweeps across the surface (0.3s).
    3.  Particles (confetti/stars) explode behind it (1s).
    4.  Haptic "success" pattern fires.
    5.  Tiered sound effect plays.
*   **Locked State:** 
    *   **Standard:** Silhouette with a "frosted glass" overlay + progress ring.
    *   **Hidden:** Generic "Secret Badge" card with "???" title and no details.

---

## 3. Audio & Haptics Design

### 3.1. Sound Effects (Tiered)
Each tier has a distinct unlock sound to reinforce rarity:

| Tier | Sound Description | Duration |
| :--- | :--- | :--- |
| **Bronze** | Subtle "ding" with wooden resonance | 0.3s |
| **Silver** | Clear bell chime | 0.5s |
| **Gold** | Rich fanfare with strings | 0.8s |
| **Platinum** | Ethereal shimmer + synth chord | 1.0s |
| **Diamond** | Crystal cascade + epic orchestral hit | 1.2s |
| **Cosmic** | Universe explosion + choir vocals | 1.5s |

### 3.2. Haptic Patterns
*   **Bronze-Silver:** Single "success" haptic.
*   **Gold-Platinum:** Double tap pattern.
*   **Diamond-Cosmic:** Triple tap with increasing intensity.

---

## 4. Shareable Card Design

When users share a badge, a beautiful card is generated as an image.

### 4.1. Card Layout (1080x1920 - Instagram Story)
*   **Top 40%:** Gradient background matching badge tier color.
*   **Center:** Large 3D-rendered badge (512x512).
*   **Bottom 30%:** 
    *   Badge Name (Display Bold, 48pt)
    *   Badge Description (Body, 24pt)
    *   User's Name + App Logo (Small, bottom right) - *Fetched from user_profile*

### 4.2. Share Flow
1.  User taps "Share" on badge detail screen.
2.  Card is rendered to Canvas (using `react-native-view-shot`).
3.  Native share sheet opens with image + caption.

---

## 5. Data Structure & Schema

### 5.1. Badge Definition (Static Config)
A static TypeScript/JSON file defining all available badges.

```typescript
interface BadgeDefinition {
  id: string;
  category: 'streak' | 'volume' | 'perfectionist' | 'explorer' | 'resilience' | 'social' | 'specialist' | 'seasonal' | 'hidden';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'cosmic';
  shape: 'hexagon' | 'shield' | 'star' | 'circle' | 'diamond';
  title: string;
  description: string;
  icon: string; // Lucide icon name
  requirement: {
    type: 'streak_days' | 'total_completions' | 'habits_created' | 'time_of_day' | 'perfect_days' | 'category_completions' | ...;
    threshold: number;
    meta?: any; // e.g., { time: 'morning', category: 'health' }
  };
  secret?: boolean; // If true, title/description hidden until unlocked
  progressTracked?: boolean; // If true, show progress ring
}
```

### 5.2. User Badges Table
Tracks unlocked badges.

```sql
CREATE TABLE user_badges (
  badge_id TEXT NOT NULL,
  unlocked_at TEXT NOT NULL, -- ISO Date
  is_seen INTEGER DEFAULT 0, -- For "New Badge" notification
  PRIMARY KEY (badge_id)
);
```

### 5.3. Badge Progress Table (NEW)
Tracks partial progress toward unlockable badges.

```sql
CREATE TABLE badge_progress (
  badge_id TEXT NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0, -- e.g., 5/10 notes
  meta TEXT, -- JSON string for complex state (e.g., "last_streak_loss_date")
  last_updated TEXT NOT NULL, -- ISO Date
  PRIMARY KEY (badge_id)
);
```

---

## 6. Notification Strategy

### 6.1. Immediate Unlock Modal
*   **When:** A badge is unlocked mid-session.
*   **UI:** Full-screen overlay with badge animation, sound, and haptics.
*   **Dismiss:** Auto-dismiss after 3s or user tap.

### 6.2. Batch Summary (Session Start)
*   **When:** User opens app and has unseen badges.
*   **UI:** Bottom sheet listing all new badges (compact cards).
*   **Action:** "View All Badges" button.

### 6.3. Progress Toasts
*   **When:** User is 75%, 90%, or 95% toward a badge.
*   **UI:** Small toast: "🔥 2 more notes to unlock Diarist!"

---

## 7. The 120 Badges List

### 7.1. The Streak Masters (Consistency) — **Circle Shape**
*Focus: Maintaining streaks on a single habit.*

1.  **Baby Steps** (Bronze): 3-day streak.
2.  **Week Warrior** (Bronze): 7-day streak.
3.  **Fortnight Fortitude** (Bronze): 14-day streak.
4.  **Habit Former** (Silver): 21-day streak (Scientific benchmark).
5.  **Monthly Master** (Silver): 30-day streak.
6.  **Roaring Fifty** (Gold): 50-day streak.
7.  **Solid Sixty** (Gold): 60-day streak.
8.  **Ninety Degrees** (Gold): 90-day streak.
9.  **Century Club** (Platinum): 100-day streak.
10. **Half Year Hero** (Platinum): 180-day streak.
11. **Year of Yes** (Diamond): 365-day streak.
12. **The 500** (Diamond): 500-day streak.
13. **Millennial** (Cosmic): 1000-day streak.
14. **Infinity & Beyond** (Cosmic): 2000-day streak.

### 7.2. Volume Warriors (Total Completions) — **Hexagon Shape**
*Focus: Aggregate number of completions across ALL habits.*

15. **First Step** (Bronze): 1 total completion.
16. **High Five** (Bronze): 5 total completions.
17. **Ten-tastic** (Bronze): 10 total completions.
18. **Quarter Century** (Bronze): 25 total completions.
19. **Nifty Fifty** (Silver): 50 total completions.
20. **Hundo** (Silver): 100 total completions.
21. **Two-Fifty** (Gold): 250 total completions.
22. **Five Hundred** (Gold): 500 total completions.
23. **Kilo** (Platinum): 1,000 total completions.
24. **2.5K** (Platinum): 2,500 total completions.
25. **5K** (Diamond): 5,000 total completions.
26. **10K** (Diamond): 10,000 total completions.
27. **Legend** (Cosmic): 25,000 total completions.
28. **Mythic** (Cosmic): 50,000 total completions.

### 7.3. Early Birds & Night Owls (Time of Day) — **Hexagon Shape**
*Focus: Consistency at specific times.*

29. **Morning Glory** (Bronze): Complete a habit before 8 AM (5 times).
30. **Early Riser** (Silver): Complete a habit before 7 AM (20 times).
31. **Dawn Patrol** (Gold): Complete a habit before 6 AM (50 times).
32. **Night Watch** (Bronze): Complete a habit after 8 PM (5 times).
33. **Midnight Oil** (Silver): Complete a habit after 10 PM (20 times).
34. **Nocturnal** (Gold): Complete a habit after 11 PM (50 times).
35. **Lunch Break** (Bronze): Complete a habit between 12 PM - 2 PM (5 times).
36. **Afternoon Delight** (Silver): Complete a habit between 12 PM - 2 PM (20 times).

### 7.4. Weekend Warriors — **Circle Shape**
*Focus: Sticking to habits on weekends.*

37. **Saturday Spark** (Bronze): Complete habits on 4 consecutive Saturdays.
38. **Sunday Funday** (Bronze): Complete habits on 4 consecutive Sundays.
39. **Weekend Warrior** (Silver): Complete all habits on a weekend (Sat & Sun).
40. **Weekend Master** (Gold): Perfect weekends for a month.

### 7.5. The Perfectionists — **Diamond Shape**
*Focus: 100% completion rates.*

41. **Perfect Day** (Bronze): Complete ALL active habits in one day.
42. **Hat Trick** (Bronze): 3 Perfect Days in a row.
43. **Perfect Week** (Silver): 7 Perfect Days in a row.
44. **Perfect Month** (Gold): A full calendar month of Perfect Days.
45. **Flawless** (Platinum): 100 Perfect Days total.
46. **Relentless** (Diamond): 365 Perfect Days total.

### 7.6. Category Specialists — **Hexagon Shape**
*Focus: Using specific habit categories.*

47. **Health Nut** (Bronze): Create a Health habit.
48. **Iron Body** (Silver): 100 completions in Health category.
49. **Fitness Fanatic** (Gold): 500 completions in Health category.
50. **Bookworm** (Bronze): Create a Learning habit.
51. **Scholar** (Silver): 100 completions in Learning category.
52. **Professor** (Gold): 500 completions in Learning category.
53. **Zen Master** (Bronze): Create a Mindfulness habit.
54. **Guru** (Silver): 100 completions in Mindfulness category.
55. **Enlightened** (Gold): 500 completions in Mindfulness category.
56. **Hustler** (Bronze): Create a Productivity habit.
57. **CEO** (Silver): 100 completions in Productivity category.
58. **Titan** (Gold): 500 completions in Productivity category.
59. **Socialite** (Bronze): Create a Social habit.
60. **Connector** (Silver): 100 completions in Social category.
61. **Influencer** (Gold): 500 completions in Social category.

### 7.7. The Explorers (App Features) — **Star Shape**
*Focus: Using different parts of the app.*

62. **Hello World** (Bronze): Create your first habit.
63. **Architect** (Silver): Create 5 habits.
64. **Planner** (Gold): Create 10 habits.
65. **Mastermind** (Platinum): Create 25 habits.
66. **Visionary** (Diamond): Create 50 habits.
67. **Journalist** (Bronze): Add a note to a completion.
68. **Diarist** (Silver): Add 10 notes.
69. **Biographer** (Gold): Add 50 notes.
70. **Moody** (Bronze): Log your mood once.
71. **Emotional Intelligence** (Silver): Log mood 10 times.
72. **Empath** (Gold): Log mood 50 times.
73. **Chameleon** (Bronze): Change the app theme.
74. **Stylist** (Silver): Try 3 different themes.
75. **Vacationer** (Bronze): Turn on Vacation Mode.
76. **Globe Trotter** (Silver): Use Vacation Mode 3 times.
77. **Template User** (Bronze): Create a habit from a template.
78. **Customizer** (Bronze): Create a custom habit (not from template).
79. **Time Traveler** (Silver): Complete a habit for a past date.
80. **Historian** (Gold): Complete habits for 10 past dates.

### 7.8. Resilience (Comebacks) — **Shield Shape**
*Focus: Returning after a break.*

81. **Second Chance** (Bronze): Restart a streak after losing it.
82. **Phoenix** (Silver): Return to the app after 7 days of inactivity.
83. **Comeback Kid** (Gold): Rebuild a 7-day streak after breaking a 20+ day streak.
84. **Unstoppable** (Platinum): Recover from a broken streak 5 times.
85. **Resilient Soul** (Diamond): Recover from a broken streak 10 times.

### 7.9. Social Butterflies (Sharing) — **Star Shape**
*Focus: Sharing achievements.*

86. **Sharer** (Bronze): Share a badge or stat once.
87. **Broadcaster** (Silver): Share 10 times.
88. **Viral** (Gold): Share 50 times.

### 7.10. Diversity Champions — **Hexagon Shape**
*Focus: Variety in habit tracking.*

89. **Variety Seeker** (Bronze): Use all 4 time periods at least once.
90. **All-Rounder** (Silver): Create habits in 5 different categories.
91. **Renaissance** (Gold): Have active habits in all categories simultaneously.
92. **Multi-Frequency** (Bronze): Create habits with 3 different frequency types.

### 7.11. Longevity Legends — **Circle Shape**
*Focus: Long-term app usage.*

93. **First Month** (Bronze): Use the app for 30 consecutive days.
94. **Quarter Year** (Silver): Use the app for 90 consecutive days.
95. **Half Year Veteran** (Gold): Use the app for 180 consecutive days.
96. **Annual Legend** (Platinum): Use the app for 365 consecutive days.
97. **Two Years Strong** (Diamond): Use the app for 730 consecutive days.

### 7.12. Fun & Easter Eggs (Hidden) — **Star Shape**
*Focus: Specific numbers or patterns.*

98. **The Answer** (Silver): Reach a streak of 42 (Hitchhiker's Guide). *(Hidden)*
99. **Lucky 7** (Bronze): Complete 7 habits in a day, or reach 7-day streak, or 77 completions.
100. **Devil's Luck** (Bronze): 666 total completions. *(Hidden)*
101. **Palindrome** (Silver): 101, 121, or 151 day streak. *(Hidden)*
102. **Binary** (Silver): 1010 total completions. *(Hidden)*
103. **Pi** (Bronze): 314 total completions.
104. **Year 2K** (Silver): 2000 total completions.
105. **Leap Year** (Silver): 366 day streak.
106. **Workaholic** (Bronze): Complete a habit at 4 AM. *(Hidden)*
107. **Night Owl Supreme** (Bronze): Complete a habit at 3 AM. *(Hidden)*
108. **Golden Ratio** (Gold): 1618 total completions. *(Hidden)*

### 7.13. The Quitters (Negative Habits) — **Shield Shape**
*Focus: Avoiding bad habits.*

109. **Clean Slate** (Bronze): 1 day without doing a bad habit.
110. **Detox** (Silver): 7 days without doing a bad habit.
111. **Purified** (Gold): 30 days without doing a bad habit.
112. **Liberated** (Platinum): 100 days without doing a bad habit.
113. **Saint** (Diamond): 365 days without doing a bad habit.

### 7.14. The Multi-Taskers — **Hexagon Shape**
*Focus: Doing multiple things at once.*

114. **Double Trouble** (Bronze): Complete 2 habits within 1 minute.
115. **Triple Threat** (Silver): Complete 3 habits within 5 minutes.
116. **Power Hour** (Gold): Complete 5 habits within 1 hour.

### 7.15. Seasonal — **Star Shape**
*Focus: Specific dates.*

117. **New Year, New Me** (Silver): Complete a habit on Jan 1st.
118. **Valentine** (Bronze): Complete a habit on Feb 14th.
119. **Spooky** (Bronze): Complete a habit on Oct 31st.
120. **Festive** (Bronze): Complete a habit on Dec 25th.

### 7.16. The Ultimate — **Diamond Shape**
121. **Jack of All Trades** (Platinum): Unlock 1 badge from every category.
122. **Badge Collector** (Diamond): Unlock 50 badges.
123. **Completionist** (Cosmic): Unlock 100 badges.

---

## 8. Implementation Plan

### Phase 1: Foundation (Database & Logic)
1.  Create `badges.ts` definition file with all 123 badges.
2.  Add `user_badges` and `badge_progress` tables to SQLite schema.
3.  Implement `BadgeService`:
    *   `checkUnlock(event)`: Evaluates rules based on triggers.
    *   `updateProgress(badgeId, value)`: Updates progress table.
    *   `getBadges()`: Returns all badges with locked/unlocked status + progress.
    *   `getUnseenCount()`: Returns count of unlocked but unseen badges.

### Phase 2: UI Components
1.  **BadgeIcon Component:**
    *   Uses `@shopify/react-native-skia` for shaders/materials.
    *   Takes `tier`, `icon`, and `shape` as props.
    *   Implements idle "breathing" animation.
2.  **BadgeGrid:**
    *   New `BadgesScreen` accessible from Profile.
    *   Filter tabs: All, Earned, Locked, Hidden.
    *   Category sections with progress rings on locked badges.
3.  **BadgeDetailModal:**
    *   Large 3D-like badge view.
    *   Shows unlock date (if unlocked) or progress (if locked).
    *   "Share" button (generates card via `react-native-view-shot`).
4.  **UnlockOverlay:**
    *   Full-screen modal with badge animation.
    *   Confetti using `react-native-confetti-cannon`.
    *   Integrates sound + haptics.

### Phase 3: The "Juice" (Animation & Audio)
1.  **Sound Effects:**
    *   Use `expo-av` or `react-native-sound`.
    *   Create/source 6 tiered sound files.
2.  **Haptics:**
    *   Use `expo-haptics`.
    *   Implement tiered patterns.
3.  **Shaders:**
    *   Implement "Holographic" shader for Platinum/Diamond.
    *   Implement "Cosmic" shader with animated nebula (Perlin noise).

### Phase 4: Badge Logic & Testing
1.  Populate `badges.ts` with all definitions.
2.  **Trigger Map (Event-Driven):**
    *   `onHabitComplete`: Check Streak, Volume, Time, Category, Weekend, Perfectionist, Multi-Tasker.
    *   `onHabitCreate`: Check Explorer, Diversity.
    *   `onNoteAdd` / `onMoodLog`: Check Journalist, Moody.
    *   `onShare`: Check Social.
    *   `onAppOpen`: Check Longevity, Seasonal, Resilience (Phoenix).
3.  Add unit tests for badge unlock conditions.
4.  Add UI tests for unlock animation flow.

### Phase 5: Notifications & Polish
1.  Implement unlock modal.
2.  Implement batch summary on session start.
3.  Implement progress toasts (75%, 90%, 95%).
4.  Add "Badges" tab to Profile screen.
5.  Ensure dark mode compatibility for all badge visuals.

---

## 9. Technical Considerations
*   **Performance:** Badge evaluation should be event-driven (e.g., after `completeHabit`), not polled. Use debouncing for rapid-fire completions.
*   **Offline:** All logic must work offline (SQLite). Sync badge unlocks when online.
*   **Assets:** Use vector icons (Lucide) combined with procedural shaders to keep app size low. No heavy PNGs.
*   **Accessibility:** Badge colors should meet WCAG AA contrast ratios. Provide text descriptions for screen readers.
*   **Battery:** Animate shaders only when badges are visible. Pause animations when app backgrounds.
