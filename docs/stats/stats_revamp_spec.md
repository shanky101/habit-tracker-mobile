# Stats & Analytics Revamp Specification

## Objective
Transform the current `AnalyticsDashboardScreen` into an industry-leading, feature-packed, and aesthetically stunning statistics hub. The goal is to provide users with deep insights into their habits while keeping the experience engaging ("funky") and beautiful.

## Design Philosophy
- **"Data as Art":** Charts and stats shouldn't just be informative; they should look beautiful.
- **Bento Grid Layout:** Use a modular, bento-box style layout for different stat sections to keep it organized yet dynamic.
- **Interactive:** Charts should be touchable (tooltips, active states).
- **Gamified:** Highlight streaks, "perfect days", and "levels" to motivate users.

## New Features & Metrics

### 1. The "Consistency Heatmap" (GitHub Style)
- **Visual:** A grid of squares representing the last 3-6 months.
- **Data:** Color intensity based on % of habits completed that day.
- **Interaction:** Tap a day to see exact stats for that date.
- **Why:** Immediate visual feedback on long-term consistency.

### 2. "Life Balance" Wheel (Category Distribution)
- **Visual:** A donut chart or radar chart.
- **Data:** Breakdown of completed habits by category (Health, Productivity, Mindfulness, etc.).
- **Why:** Helps users see if they are neglecting certain areas of their life.

### 3. Time of Day Analysis ("Chronotype")
- **Visual:** A curve or bar chart showing completion times (Morning vs Afternoon vs Evening vs Night).
- **Data:** Aggregated timestamps from `HabitEntry`.
- **Why:** Reveals the user's peak productivity hours.

### 4. Mood vs. Performance (Correlation)
- **Visual:** A dual-axis chart or scatter plot.
- **Data:** Plot daily mood (if logged) against completion rate.
- **Why:** "Do I perform better when I'm happy?" or "Does completing habits make me happier?"

### 5. "The Perfect Day" Counter
- **Visual:** A prominent counter or badge.
- **Data:** Number of days where 100% of scheduled habits were completed.
- **Why:** A high-value target for perfectionists.

### 6. Current "Level" & XP
- **Visual:** A progress bar or circular level indicator.
- **Data:** Derived from total completions (e.g., 1 completion = 10 XP).
- **Why:** Gamification to increase retention.

## UI/UX Improvements ("Funky Sections")

- **Gradient Cards:** Use the theme's gradients for stat cards.
- **Glassmorphism:** Subtle blur effects for overlays.
- **Animated Numbers:** Numbers should "count up" when the screen loads.
- **Micro-interactions:** Haptic feedback when interacting with charts.

## Technical Implementation

### Dependencies
- **Recommendation:** Add `react-native-gifted-charts` for high-quality, animated charts without heavy webview overhead. It supports gradients, animations, and custom pointers.

### Data Structure Updates
- No major schema changes needed. Most metrics can be derived from existing `Habit` and `HabitEntry` data on the fly (or memoized).

## Proposed Layout (Bento Grid)

```
[  Consistency Score (Big Circular Progress)  ]  [ Current Streak (Flame) ]
[           Consistency Heatmap (Scrollable)           ]
[  Category Split (Donut) ]  [  Time of Day (Bar)      ]
[           Mood Correlation (Line Chart)              ]
[  "Perfect Days" Badge   ]  [  Total Completions      ]
[           AI Insights (Carousel/Cards)               ]
```

## Checkpoints

- [ ] **Phase 1: Setup & Dependencies**
    - Install `react-native-gifted-charts`.
    - Create utility functions to derive new metrics (Heatmap data, Category data, Time of Day).

- [ ] **Phase 2: Core Components**
    - Create `ConsistencyHeatmap` component.
    - Create `CategoryDistributionChart` component.
    - Create `TimeOfDayChart` component.
    - Create `StatCard` generic component with gradients.

- [ ] **Phase 3: Screen Assembly**
    - Rebuild `AnalyticsDashboardScreen` using the Bento Grid layout.
    - Implement "Level/XP" logic.
    - Add animations (Entry animations, counting numbers).

- [ ] **Phase 4: Polish**
    - Add haptics.
    - Ensure theme compatibility (Dark/Light/Cyberpunk).
    - Verify performance (memoize heavy calculations).
