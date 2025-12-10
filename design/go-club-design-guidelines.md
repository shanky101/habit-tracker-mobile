This document provides a comprehensive design specification for the "GO Club" app based on the provided screenshots. You can feed this directly to your coding agent or development team to replicate the UI/UX.

-----

# **GO Club App Design System & UI/UX Specification**

## **1. Visual Identity & Theme**

  * **Overall Aesthetic:** High-energy, bold, and futuristic sport/fitness aesthetic. It relies heavily on a deep "Electric Blue" background, high-contrast typography, and neon accents (Yellow, Cyan).
  * **Design Language:** rounded geometric shapes, glassmorphism (frosted glass effects), and clean, spacious layouts.

## **2. Color Palette**

Use these approximate hex codes to match the screenshots.

### **Primary Colors**

  * **Electric Ultramarine (Main Background):** `#1E1EFF` to `#0000E0` (Use a vertical linear gradient: lighter blue at the top, slightly darker at the bottom).
  * **Pure White (Text/Active Elements):** `#FFFFFF`
  * **Pitch Black (Text on Light Cards):** `#000000`

### **Accent Colors**

  * **Neon Lemon (Highlights/Yellow Cards):** `#FFFF00` or `#FAFF00`
  * **Soft Blue (Inactive Elements):** `#5C5CFF` (Low opacity version of primary blue).
  * **Glass White (Overlays):** `#FFFFFF` with 10–20% opacity and background blur.

## **3. Typography**

**Font Family:** Use a geometric sans-serif font.

  * *Recommended Google Fonts:* **Inter**, **Poppins**, or **Outfit**.
  * *Apple System Font:* SF Pro Display.

**Hierarchy:**

1.  **Display/Hero Headings:** Extra Bold / Heavy. (e.g., "every step counts", "2,296").
      * *Styling:* Tight kerning (letter spacing), often lowercase for stylistic effect in headers.
2.  **Section Titles:** Semi-Bold or Bold (e.g., "Today’s Goal", "Hydration Summary").
3.  **Body Text:** Regular/Medium. High legibility.
4.  **Data/Stats:** Large, Bold numerical values.

## **4. Core UI Components**

### **A. Buttons**

  * **Shape:** Full "Pill" shape (fully rounded ends).
  * **Primary Action Button:**
      * Background: White `#FFFFFF` (or Yellow `#FFFF00` depending on context).
      * Text: Black `#000000`.
      * Weight: Bold.
      * Height: Large (\~50-56px).
  * **Social Sign-in Buttons:**
      * White pill shape with specific brand icon (Apple logo / Google "G").
      * Text centered, standard system font weights.

### **B. Cards & Containers**

  * **Standard Card:** Rounded corners (Corner Radius: \~24px to 32px).
      * *Yellow Card:* Solid Neon Yellow background, Black text.
      * *Blue/Glass Card:* Translucent white (10-15% opacity) or solid deep blue with a thin lighter border/stroke.
  * **Onboarding Modal (Sign In):**
      * Style: **Glassmorphism**.
      * Background: White with roughly 70% opacity and a heavy background blur (`backdrop-filter: blur(20px)`).
      * Text: Dark Grey/Black.

### **C. Navigation Bar (Floating Bottom Nav)**

  * **Type:** Floating Capsule.
  * **Position:** Fixed at the bottom center, floating above content with margin.
  * **Background:** Glassmorphic white (low opacity) or very light blue tint.
  * **Active State:** The selected tab has a distinct background pill shape (faint grey/white) behind the icon and label.
  * **Icons:**
      * Left: Shoe icon (Steps).
      * Center: Waveform icon (Plan/Audio).
      * Right: Activity/Waitlist icon.

### **D. Charts (Bar Graphs)**

  * **Style:** Vertical Bar Chart.
  * **Bars:** Rounded caps (top and bottom fully rounded).
  * **Active Bar:** Pure White, full opacity.
  * **Inactive Bars:** Faded Blue (approx 30% opacity).
  * **Axis:** Minimalist. No grid lines. Text labels (days of week) in light blue/grey.

-----

## **5. Screen-by-Screen Implementation Guide**

### **Screen 1: Splash / Onboarding (The "Every Step Counts" Screen)**

  * **Layout:** Full-screen vertical layout.
  * **Header:** Massive typography taking up top 40% of screen.
      * "every" (White)
      * "step" (Neon Yellow)
      * "counts" (White)
  * **Visual:** 3D illustration of a runner (seen from behind) running into the distance.
  * **Bottom Sheet (Login Prompt):**
      * A glassmorphic overlay pops up over the illustration.
      * Contains Title: "Go Steps" Wants to Use "https://www.google.com/search?q=google.com" to Sign In.
      * Actions: Cancel (Text only), Continue (Text only).
  * **Footer Actions:** Stacked buttons for "Sign in with Apple" and "Sign in with Google".

### **Screen 2: Home Dashboard ("Good Afternoon")**

  * **Header:**
      * Greeting: "Good afternoon," (White, Regular).
      * Subtext: "👟 Let's step it up\!" (White, Bold).
      * Top Right: Small circular button with bar-chart icon (Stats).
  * **Main Banner (Premium Upsell):**
      * Translucent blue card.
      * Left: "GO" Logo in white circle.
      * Right: Text describing "$19.99 a year".
  * **"Today's Goal" Section:**
      * Row layout: Label on left, "View Plan" link on right.
      * Metrics Row: 0mi, 60min, 7,500 (Shoes icon).
      * **Audio Visualizer:** A horizontal waveform graphic representing audio/music.
  * **"Golden Hour" Card:**
      * Background: Bright Yellow `#FFFF00`.
      * Text: Black. Large Title "Walk during the Golden hour".
      * Visual: A semi-circular sun dial/gauge at the bottom right with a gradient orange/red arc.
      * Button: Black pill button "Continue".

### **Screen 3: Step Detail View (2,296 Steps)**

  * **Background:** Solid Deep Blue.
  * **Top:**
      * Total Steps: "2,296" (White, Small, Top Left).
      * Top Right: Water cup icon button.
  * **Center Chart:**
      * Large vertical bar chart.
      * The "Mon" (Monday) bar is extremely tall and white. Others are small and faded.
  * **Bottom Sheet (Draggable/Scrollable):**
      * White Card with top rounded corners.
      * **Big Stat:** "2,296" (Huge Black Font).
      * **Grid:** 3 columns showing Distance (1.01mi), Calories (5kcal), Floors (2).
      * **Tab Switcher (Internal):** A pill-shaped segmented control (Steps | Waveform | Activity).

### **Screen 4: Goal Selection ("What's your primary goal?")**

  * **Visual:** Large 3D target/arrow icon in center (Gradient Blue/Purple).
  * **Title:** "What’s your primary goal?" (White, Bold, Centered).
  * **Selection Inputs:** Two side-by-side buttons.
      * Option 1: "Lose weight" (Translucent Blue fill).
      * Option 2: "Daily activity" (Translucent Blue fill).
  * **Footer:** "Next" button (Disabled state is low opacity blue; Active state is White).

### **Screen 5: Hydration Summary**

  * **Layout:** List View.
  * **Items:** Rows representing water intake.
      * Left: "18 oz" (Large White Bold) + Time "06:07 PM" (Small Grey).
      * Right: Trash can icon (Delete).
  * **Separators:** Dotted lines between list items.

-----

## **6. Assets Needed (Instructions for Designer/AI)**

1.  **Logo:** "GO" emblem (Interlocking G and O).
2.  **Icons:** 3D Target, 3D Runner Illustration, Sun/Golden Hour Dial, Shoe, Waveform, Trash Can, Water Cup.
3.  **UI Elements:** Glassmorphic background blur effect script/CSS.

## **7. CSS/Styling Snippets (For the Agent)**

**Glassmorphism Effect:**

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

**Main Background Gradient:**

```css
.app-background {
  background: linear-gradient(180deg, #1E1EFF 0%, #0505AA 100%);
}
```