# Habit Tracker Mobile App - Detailed Feature Specification

## Product Manager's Screen-by-Screen Breakdown

### Executive Summary

*   **Total Screens:** 32 core screens + 8 modal overlays = 40 UI states
*   **User Flows:**
    *   First-Time User Flow (Onboarding â†’ Setup â†’ First Habit)
    *   Daily User Flow (Open App â†’ Check-In â†’ View Progress)
    *   Premium Conversion Flow (Hit Limit â†’ Paywall â†’ Purchase)
    *   Power User Flow (Analytics â†’ Insights â†’ Adjustments)
*   **Design Philosophy:**
    *   Minimal friction: Every action should be â‰¤3 taps away
    *   Visual feedback: Immediate response to every interaction
    *   Progressive disclosure: Show advanced features as users need them
    *   Celebration-driven: Positive reinforcement at every milestone

## Screen Inventory & Navigation Structure

*   **App Launch**
    *   **First Launch Path**
        *   Splash Screen
        *   Onboarding (3 screens)
        *   Permission Requests (2 screens)
    *   **Authentication Path (if no local data)**
        *   Welcome Screen
        *   Sign Up Screen
        *   Login Screen
        *   Password Reset Screen
    *   **Main App (Bottom Tab Navigation)**
        *   **HOME TAB (Primary)**
            *   Home Screen (Today View)
            *   Habit Detail Screen
            *   Add Habit Flow (3 screens)
            *   Edit Habit Screen
            *   Calendar View Screen
            *   Check-in Celebration Modal
        *   **ANALYTICS TAB (Premium)**
            *   Analytics Dashboard
            *   Habit Deep Dive Screen
            *   AI Insights Screen (Premium)
            *   Export Data Screen
        *   **DISCOVER TAB (Optional)**
            *   Habit Templates Screen
            *   AI Suggestions Screen (Premium)
        *   **PROFILE TAB**
            *   Profile Screen
            *   Settings Screen
            *   Notifications Settings
            *   Appearance Settings
            *   Account Settings
            *   Premium/Subscription Screen
            *   About/Help Screen
            *   Data & Privacy Screen

## PART 1: ONBOARDING & AUTHENTICATION (7 Screens)

### Screen 1: Splash Screen

*   **Screen Count:** 1
*   **Purpose:** Brand introduction while app initializes
*   **Features:**
    *   **App Logo & Branding**
        *   Large, centered app logo
        *   App name underneath
        *   Tagline: "Build Better Habits, One Day at a Time"
        *   Subtle animation (logo fade-in, gentle pulse)
    *   **Background Loading**
        *   Check for existing user data
        *   Initialize local database
        *   Check authentication status
        *   Load user preferences (theme, etc.)
*   **Navigation Logic**
    *   Has local data + logged in â†’ Home Screen
    *   Has local data + not logged in â†’ Home Screen (local only)
    *   No local data + first launch â†’ Onboarding Screen 1
    *   No local data + returning â†’ Welcome Screen
*   **Duration:** 1-2 seconds max
*   **Design Notes:**
    *   Clean, minimal design
    *   Match system theme (light/dark) immediately
    *   No "loading" indicators (users shouldn't notice)

### Screen 2: Onboarding Screen 1 - "Welcome"

*   **Screen Count:** 1
*   **Purpose:** Introduce the app's value proposition
*   **Features:**
    *   **Hero Illustration**
        *   Large, friendly illustration showing someone checking off habits
        *   Generated via Gemini AI (warm, approachable style)
        *   Animated entrance (slide up + fade)
    *   **Value Proposition**
        *   Headline: "Build Habits That Stick"
        *   Subheading: "Track your daily habits, build streaks, and transform your life one day at a time"
        *   Keep text minimal (â‰¤20 words)
    *   **Navigation**
        *   "Get Started" primary button (large, prominent)
        *   "Skip" text button (top-right, subtle)
        *   Pagination dots (3 dots, current = 1)
*   **Gesture Support**
    *   Swipe left to advance
    *   Tap "Get Started" to advance
*   **User Flow:**
    *   First-time users see this
    *   Returning users (who uninstalled) see this again
    *   Users can skip entire onboarding
*   **Design Notes:**
    *   Use brand colors prominently
    *   Ensure contrast for accessibility
    *   Animation should feel smooth (60fps)

### Screen 3: Onboarding Screen 2 - "Track Effortlessly"

*   **Screen Count:** 1
*   **Purpose:** Show how easy daily check-ins are
*   **Features:**
    *   **Interactive Demo**
        *   Animated mockup of habit list
        *   Show a checkmark animation when "tapped"
        *   Demonstrate the core interaction
        *   Loop animation every 3 seconds
    *   **Feature Highlight**
        *   Headline: "One Tap to Check In"
        *   Subheading: "Mark your habits complete in seconds. No complex logging required."
        *   Bullet points:
            *   âœ“ Quick daily check-ins
            *   âœ“ Visual progress tracking
            *   âœ“ Smart reminders
    *   **Navigation**
        *   "Next" primary button
        *   "Back" button (top-left)
        *   "Skip" text button (top-right)
        *   Pagination dots (3 dots, current = 2)
*   **Educational Value**
    *   Users understand the core mechanic
    *   Sets expectation for daily usage
    *   Shows it's not time-consuming
*   **Design Notes:**
    *   Interactive elements should respond to touch
    *   Animation draws the eye to the check-in action
    *   Keep it simple and clear

### Screen 4: Onboarding Screen 3 - "Build Streaks"

*   **Screen Count:** 1
*   **Purpose:** Introduce streak concept and gamification
*   **Features:**
    *   **Streak Visualization**
        *   Animated streak counter (0 â†’ 30 days)
        *   Fire emoji ðŸ”¥ or custom flame icon
        *   Calendar grid showing completed days
        *   Celebration confetti when streak hits milestone
    *   **Motivation Message**
        *   Headline: "Watch Your Streaks Grow"
        *   Subheading: "Stay consistent and build momentum. Every day counts!"
        *   Benefit highlights:
            *   ðŸ“ˆ Track your progress
            *   ðŸŽ¯ Hit milestones
            *   ðŸ† Celebrate achievements
    *   **Social Proof (Optional)**
        *   "Join 10,000+ people building better habits"
        *   Or testimonial quote from user
    *   **Navigation**
        *   "Let's Start" primary button (final onboarding CTA)
        *   "Back" button (top-left)
        *   Pagination dots (3 dots, current = 3)
*   **User Flow:**
    *   Final onboarding screen
    *   "Let's Start" â†’ Permission Request screens
    *   This is the hook - make streaks exciting!
*   **Design Notes:**
    *   Animation should be delightful
    *   Use color psychology (green = growth, gold = achievement)
    *   Make users excited to start

### Screen 5: Permission Request - Notifications

*   **Screen Count:** 1
*   **Purpose:** Request notification permission with clear value
*   **Features:**
    *   **Permission Explanation**
        *   Large bell icon (animated)
        *   Headline: "Stay on Track with Reminders"
        *   Explanation: "We'll send you a gentle reminder each day so you never miss your habits. You choose the time."
        *   Benefit-focused (not technical)
    *   **Preview**
        *   Show example notification
        *   "Time to check in! You have 3 habits waiting ðŸŽ¯"
        *   Make it look friendly and non-intrusive
    *   **Permission Control**
        *   "Enable Notifications" primary button
            *   Triggers native iOS/Android permission dialog
        *   "Maybe Later" secondary button
            *   Skips for now, can enable in settings
        *   "I'll set it up later" text link (subtle)
    *   **Trust Indicators**
        *   "You can change this anytime in Settings"
        *   "We respect your time - no spam"
*   **User Flow:**
    *   After onboarding completion
    *   If user denies â†’ Can enable later in settings
    *   If user accepts â†’ Proceed to Welcome Screen or Home
*   **Design Notes:**
    *   Don't guilt-trip users
    *   Be honest about notification frequency
    *   Make it easy to skip (but encourage enabling)
*   **Platform Differences:**
    *   iOS: Two-step (notification permission + sound/badge)
    *   Android: Can specify notification channels

### Screen 6: Welcome Screen (Authentication Gateway)

*   **Screen Count:** 1
*   **Purpose:** Entry point for authentication (sign up or log in)
*   **Features:**
    *   **Hero Section**
        *   App logo (medium size, top-center)
        *   Welcome message: "Welcome to [App Name]"
        *   Subheading: "Start building better habits today"
    *   **Quick Start Option**
        *   "Start Free" large button
            *   Creates anonymous account
            *   Starts with local storage only
            *   Can sign up later to enable cloud sync
        *   Explanation: "Try it risk-free. Sign up later to sync across devices."
    *   **Authentication Options**
        *   "Sign Up with Email" button
        *   "Log In" button (secondary style)
        *   Divider: "OR"
        *   Social auth buttons (if implemented):
            *   "Continue with Apple" (iOS requirement)
            *   "Continue with Google"
    *   **Legal Links**
        *   Bottom footer with links:
            *   Terms of Service
            *   Privacy Policy
        *   Small, subtle text
*   **User Flow:**
    *   After permission requests OR when returning user (not logged in)
    *   "Start Free" â†’ Home Screen (anonymous user)
    *   "Sign Up with Email" â†’ Sign Up Screen
    *   "Log In" â†’ Login Screen
*   **Design Notes:**
    *   Minimize friction to entry
    *   Make "Start Free" most prominent (conversion optimization)
    *   Authentication is optional but encouraged for premium
*   **Why Anonymous Start?**
    *   Reduces friction for trial
    *   Users can evaluate app before committing
    *   Data stored locally, prompted to sign up when hitting limits

### Screen 7: Sign Up Screen

*   **Screen Count:** 1
*   **Purpose:** Create account for cloud sync and premium features
*   **Features:**
    *   **Form Fields**
        *   Email input
            *   Validation: Must be valid email format
            *   Hint text: "you@example.com"
        *   Password input
            *   Show/hide toggle (eye icon)
            *   Validation: Min 8 characters
            *   Strength indicator (weak/medium/strong)
        *   "Sign Up" button
            *   Disabled until valid input
            *   Loading state when submitting
    *   **Password Requirements**
        *   Below password field
        *   "At least 8 characters" (checkmark when met)
        *   "Include a number" (optional but recommended)
    *   **Social Sign-Up (Alternative)**
        *   Divider: "OR SIGN UP WITH"
        *   Apple Sign In button
        *   Google Sign In button
    *   **Legal Agreement**
        *   Checkbox: "I agree to the Terms of Service and Privacy Policy"
        *   Links are clickable (open in-app browser)
        *   Required before sign-up
    *   **Navigation**
        *   "Already have an account? Log In" link
        *   Back button (top-left, returns to Welcome)
*   **Error Handling**
    *   Inline validation errors (red text below fields)
    *   Toast notifications for server errors
    *   "Email already exists" â†’ Suggest login
*   **User Flow:**
    *   From Welcome Screen
    *   Success â†’ Home Screen (logged in, cloud sync enabled)
    *   Error â†’ Show error, allow retry
*   **Design Notes:**
    *   Keep form minimal (email + password only)
    *   Clear error messages
    *   Instant feedback on validation
*   **Post-Sign-Up:**
    *   Email verification (optional for MVP)
    *   Create default user settings in database
    *   Migrate local data to cloud (if anonymous user)

### Screen 8: Login Screen

*   **Screen Count:** 1
*   **Purpose:** Authenticate returning users
*   **Features:**
    *   **Form Fields**
        *   Email input
            *   Auto-fill supported
        *   Password input
            *   Show/hide toggle
        *   "Log In" button
    *   **Remember Me**
        *   Optional checkbox: "Stay logged in"
        *   Keeps session for 30 days
    *   **Password Recovery**
        *   "Forgot Password?" link
            *   Opens Password Reset Screen
        *   Prominent placement (below password field)
    *   **Social Login**
        *   Divider: "OR LOG IN WITH"
        *   Apple Sign In button
        *   Google Sign In button
    *   **Navigation**
        *   "Don't have an account? Sign Up" link
        *   Back button (returns to Welcome)
*   **Error Handling**
    *   "Invalid email or password" message
    *   "Account not found" â†’ Suggest sign up
    *   Rate limiting message if too many attempts
*   **User Flow:**
    *   From Welcome Screen
    *   Success â†’ Home Screen (loads user data from cloud)
    *   Error â†’ Show error, allow retry or reset password
*   **Design Notes:**
    *   Similar layout to Sign Up for consistency
    *   Prioritize Apple Sign In on iOS (App Store guideline)
*   **Security:**
    *   Secure password entry (no plain text)
    *   Rate limiting (prevent brute force)
    *   Session token stored securely

### Screen 9: Password Reset Screen

*   **Screen Count:** 1
*   **Purpose:** Allow users to reset forgotten passwords
*   **Features:**
    *   **Instructions**
        *   Headline: "Reset Your Password"
        *   Subheading: "Enter your email and we'll send you a reset link"
    *   **Form**
        *   Email input
        *   "Send Reset Link" button
            *   Loading state while processing
            *   Success state with checkmark
    *   **Success State**
        *   After successful submission:
            *   Checkmark icon
            *   "Check your email!"
            *   "We've sent a password reset link to [email]"
            *   "Didn't receive it? Resend" link
    *   **Navigation**
        *   Back button (returns to Login)
        *   "Back to Login" link
*   **User Flow:**
    *   From Login Screen
    *   User enters email â†’ Reset link sent
    *   User opens email â†’ Clicks link â†’ Web browser opens
    *   Web flow completes reset â†’ User returns to app â†’ Login Screen
*   **Design Notes:**
    *   Clear, reassuring messaging
    *   Prevent enumeration attacks (always show success, even if email doesn't exist)

## PART 2: MAIN APP - HOME TAB (12 Screens)

### Screen 10: Home Screen (Today View)

*   **Screen Count:** 1
*   **Purpose:** Primary interface for daily habit tracking
*   **Features:**
    *   **Header Section**
        *   **Date Display**
            *   Current date: "Monday, October 30"
            *   Small calendar icon
            *   Tappable â†’ Opens Calendar View
        *   **Streak Summary**
            *   "3 active streaks ðŸ”¥"
            *   Tappable â†’ Opens Streak Overview Modal
        *   **Profile Button**
            *   Top-right corner
            *   User avatar or initials
            *   Badge indicator if premium
    *   **Today's Progress Card**
        *   **Visual Progress Ring**
            *   Circular progress indicator
            *   Shows completion: "3/5 completed today"
            *   Fills clockwise as habits are checked
            *   Color changes: gray â†’ blue â†’ green (all done)
        *   **Motivational Message**
            *   "Keep going! 2 more to go"
            *   "Amazing! All done for today ðŸŽ‰"
            *   "Start your day strong"
            *   Dynamic based on progress
        *   **Quick Stats**
            *   Current streak: "7 days ðŸ”¥"
            *   This week: "18/21 completed"
    *   **Habit List (Main Content)**
        *   **List Organization**
            *   Sorted by: Not completed â†’ Completed
            *   Secondary sort: Creation time or custom order
            *   Drag-to-reorder (long press + drag)
        *   **Habit Card Design (per habit):**
            *   **Left Side:**
                *   Circle checkbox (large, tappable)
                *   Empty = not done
                *   Checked = done (animated checkmark)
                *   Color matches habit color
            *   **Middle:**
                *   Habit name (bold, 16pt)
                *   Current streak: "5 days ðŸ”¥" (if active)
                *   Category icon (small, subtle)
            *   **Right Side:**
                *   Chevron icon (tap for detail)
                *   Optional reminder time badge
        *   **Visual States:**
            *   Not completed: Full color, prominent
            *   Completed: Slightly dimmed, checkmark visible
            *   Archived: Hidden from this view
        *   **Interactions:**
            *   Tap checkbox â†’ Check in (optimistic UI)
            *   Tap card â†’ Habit Detail Screen
            *   Swipe right â†’ Quick check-in
            *   Swipe left â†’ Options (Edit, Delete)
            *   Long press â†’ Drag to reorder
    *   **Empty State (if no habits)**
        *   Friendly illustration
        *   "No habits yet!"
        *   "Add your first habit to get started"
        *   Large "Add Habit" button
    *   **Floating Action Button (FAB)**
        *   Large "+" button (bottom-right)
        *   Primary color
        *   Always visible
        *   Tap â†’ Add Habit Flow
    *   **Free Tier Limitation Indicator**
        *   If user has 5 habits (free limit):
            *   Small banner at bottom
            *   "You're using 5/5 free habits"
            *   "Upgrade for unlimited" link
    *   **Pull-to-Refresh**
        *   Pull down â†’ Sync from cloud (premium)
        *   Shows sync status
        *   Refreshes UI with latest data
    *   **Scroll Behavior**
        *   Smooth scrolling
        *   Header slightly collapses on scroll
        *   FAB hides on scroll down, shows on scroll up
*   **User Flows:**
    *   **Primary Flow (Check-In):**
        *   User opens app â†’ Sees today's habits
        *   Taps checkbox on habit â†’ Immediate animation
        *   Progress ring updates
        *   If streak milestone â†’ Celebration modal
        *   If all done â†’ Celebration message
    *   **Secondary Flows:**
        *   View habit detail â†’ Tap card â†’ Habit Detail Screen
        *   Add new habit â†’ Tap FAB â†’ Add Habit Flow
        *   Reorder habits â†’ Long press + drag
        *   View calendar â†’ Tap date â†’ Calendar View
        *   View analytics â†’ Tap Analytics tab
*   **Premium Indicators:**
    *   Cloud sync icon (syncing spinner)
    *   "Sync with cloud" in pull-to-refresh
*   **Design Notes:**
    *   This screen should load instantly (<100ms)
    *   Animations must be smooth (60fps)
    *   Haptic feedback on check-in
    *   Optimistic UI (don't wait for server)
*   **Performance Optimizations:**
    *   Use FlatList for habit list (virtualization)
    *   Memoize habit cards
    *   Lazy load analytics

### Screen 11: Check-In Celebration Modal

*   **Screen Count:** 1 (Modal Overlay)
*   **Purpose:** Reward users for completing habits and hitting milestones
*   **Features:**
    *   **Trigger Conditions**
        *   Daily First Check-In: Simple animation
        *   All Habits Complete: Confetti + message
        *   Streak Milestone: Special celebration
            *   3 days: "Great start!"
            *   7 days: "One week! ðŸŽ‰"
            *   30 days: "One month! Incredible! ðŸ†"
            *   100 days: "Century! You're unstoppable! ðŸ’¯"
            *   365 days: "One year! Legend status! ðŸ‘‘"
    *   **Modal Content**
        *   **Animation Layer**
            *   Confetti particles falling
            *   Checkmark animation (scale + bounce)
            *   Fire emoji for streaks
            *   Trophy for milestones
        *   **Message Display**
            *   Large headline: "7 Day Streak!"
            *   Subheading: "You're building momentum ðŸ”¥"
            *   Habit name (if single habit)
        *   **Stats Showcase**
            *   "Current streak: 7 days"
            *   "Total completions: 42"
            *   "Consistency: 86%"
    *   **Social Sharing (Optional)**
        *   "Share Your Achievement" button
        *   Generates shareable image:
            *   "I just hit a 30-day streak on [Habit]!"
            *   App branding
            *   No sensitive data
        *   Opens native share sheet
        *   Tracks shares (for viral growth)
    *   **Dismiss Options**
        *   "Continue" primary button (large)
        *   Tap outside modal (semi-transparent backdrop)
        *   Swipe down to dismiss
    *   **Premium Upsell (Strategic)**
        *   If free user hits 7-day streak:
            *   "Unlock AI insights with Premium"
            *   "See why you're succeeding"
            *   Subtle, not pushy
*   **User Flow:**
    *   Triggered immediately after check-in (if milestone)
    *   User enjoys moment â†’ Dismisses
    *   Optional share â†’ Returns to home
*   **Design Notes:**
    *   Keep it brief (3-5 seconds if auto-dismiss)
    *   Animation should be delightful, not annoying
    *   Frequency: Don't show for every check-in (fatigue)
    *   Sound effect (optional, respects silent mode)
*   **Variants:**
    *   Simple Check-In: Just checkmark animation, no modal
    *   Streak Milestone: Full modal with celebration
    *   All Complete: Confetti + special message

### Screen 12: Add Habit Flow - Step 1 (Habit Name)

*   **Screen Count:** 1
*   **Purpose:** Capture the habit name (primary information)
*   **Features:**
    *   **Progress Indicator**
        *   Step 1 of 3
        *   Progress bar at top (33% filled)
        *   "Step 1: What's your habit?" title
    *   **Input Field**
        *   **Large Text Input**
            *   Placeholder: "E.g., Meditate for 10 minutes"
            *   Auto-focus on open
            *   Character limit: 100 characters
            *   Character counter (bottom-right)
        *   **Smart Suggestions (Below input)**
            *   "Common habits:" label
            *   Chips/pills with suggestions:
                *   "Read 20 pages"
                *   "Drink 8 glasses of water"
                *   "Exercise 30 minutes"
                *   "Journal 5 minutes"
            *   Tap chip â†’ Auto-fills input
            *   Powered by: Static list + AI (premium)
    *   **AI-Powered Suggestions (Premium)**
        *   "Get personalized suggestions" button
        *   Tap â†’ Calls Claude API
        *   Input: User's goal/interest
        *   Output: 5-10 specific habit suggestions
        *   Example:
            *   User types: "want to be healthier"
            *   AI suggests: "Walk 5,000 steps daily"
    *   **Navigation**
        *   "Next" button (bottom)
            *   Disabled if input empty
            *   Enabled when valid input
        *   "Cancel" button (top-left)
            *   Confirmation dialog: "Discard habit?"
*   **Validation**
    *   Must have at least 3 characters
    *   No special characters (except basics)
    *   Shows error if invalid
*   **User Flow:**
    *   From Home Screen (tap FAB)
    *   User types habit name â†’ Tap Next
    *   If free user has 5 habits:
        *   Show paywall immediately
        *   Block adding more
*   **Design Notes:**
    *   Keep it simple (one input only)
    *   Auto-suggestions reduce friction
    *   Progressive disclosure (details come later)

### Screen 13: Add Habit Flow - Step 2 (Category & Color)

*   **Screen Count:** 1
*   **Purpose:** Categorize and personalize the habit
*   **Features:**
    *   **Progress Indicator**
        *   Step 2 of 3
        *   Progress bar (66% filled)
        *   "Step 2: Personalize" title
    *   **Category Selection**
        *   **Grid of Categories**
            *   8 pre-defined categories:
                *   Health (heart icon)
                *   Fitness (dumbbell icon)
                *   Productivity (checkmark icon)
                *   Mindfulness (lotus icon)
                *   Learning (book icon)
                *   Social (people icon)
                *   Finance (dollar icon)
                *   Creativity (paintbrush icon)
                *   Other (star icon)
            *   **Visual style:**
                *   Icon + label
                *   Card-based layout
                *   2-3 columns
                *   Selected = highlighted border
            *   Default: "Other" pre-selected
    *   **Color Picker**
        *   **Palette of 12 Colors**
            *   Curated color swatches
            *   Arranged in 2 rows
            *   Each color is a circle
            *   Selected = checkmark inside
            *   Colors:
                *   Red (#EF4444)
                *   Orange (#F97316)
                *   Yellow (#EAB308)
                *   Green (#22C55E)
                *   Teal (#14B8A6)
                *   Blue (#3B82F6)
                *   Indigo (#6366F1)
                *   Purple (#A855F7)
                *   Pink (#EC4899)
                *   Gray (#6B7280)
                *   Brown (#92400E)
                *   Black (#000000)
            *   Default: Blue pre-selected
            *   Preview: Shows habit card with selected color
    *   **Icon Selection (Optional)**
        *   "Choose an icon" section
        *   Grid of relevant icons from Lucide
        *   Searchable (if many icons)
        *   Default: Category-based icon
    *   **Preview Section**
        *   "Preview" label
        *   Small habit card showing:
            *   Habit name (from Step 1)
            *   Selected icon + color
            *   Category badge
        *   Live updates as user selects
    *   **Navigation**
        *   "Next" button (bottom)
        *   "Back" button (top-left, returns to Step 1)
*   **User Flow:**
    *   From Step 1
    *   User selects category + color â†’ Tap Next
    *   Can skip (uses defaults)
*   **Design Notes:**
    *   Visual, not text-heavy
    *   Make it fun (personalization is engaging)
    *   Preview helps user visualize

### Screen 14: Add Habit Flow - Step 3 (Frequency & Reminder)

*   **Screen Count:** 1
*   **Purpose:** Set habit frequency and reminder settings
*   **Features:**
    *   **Progress Indicator**
        *   Step 3 of 3
        *   Progress bar (100% filled)
        *   "Step 3: Set Schedule" title
    *   **Frequency Section**
        *   Label: "How often?"
        *   **Frequency Options (Radio buttons)**
            *   **Daily (default)**
                *   "Every day"
            *   **Weekly**
                *   "Select specific days"
                *   If selected â†’ Shows day picker
            *   **Custom**
                *   "X times per week" (slider)
                *   Premium feature (for MVP, show as coming soon)
    *   **Day Picker (if Weekly selected)**
        *   7 day buttons: S M T W T F S
        *   Multi-select (tap to toggle)
        *   Visual: Selected = filled, Unselected = outline
        *   Must select at least 1 day
    *   **Reminder Section**
        *   Toggle: "Set a reminder"
            *   Off by default
            *   iOS-style toggle switch
        *   **Time Picker (if reminder enabled)**
            *   Native time picker (respects system format)
            *   Default: 9:00 AM
            *   Label: "Remind me at"
        *   **Notification Preview**
            *   Shows example notification
            *   "Time to check in! Complete your habits ðŸŽ¯"
    *   **Advanced Settings (Collapsible)**
        *   "Advanced" accordion (collapsed by default)
        *   If expanded:
            *   Start date (default: today)
            *   End date (optional, for time-bound habits)
            *   Notes field (optional description)
    *   **Summary Section**
        *   Shows all selections:
            *   "Meditate for 10 minutes"
            *   "Daily at 9:00 AM"
            *   "Health category"
        *   Gives user confidence before saving
    *   **Navigation**
        *   "Create Habit" button (bottom, primary)
            *   Loading state while saving
            *   Success â†’ Returns to Home with new habit
        *   "Back" button (top-left, returns to Step 2)
*   **User Flow:**
    *   From Step 2
    *   User sets frequency + reminder â†’ Tap Create
    *   Saves to local storage (and cloud if premium)
    *   Returns to Home Screen with success toast
*   **Design Notes:**
    *   Don't overwhelm with options
    *   Defaults should work for 80% of users
    *   Advanced options are hidden (progressive disclosure)
*   **Validation:**
    *   If Weekly: Must select at least 1 day
    *   If Custom: Must be 1-7 times per week

### Screen 15: Edit Habit Screen

*   **Screen Count:** 1
*   **Purpose:** Modify existing habit details
*   **Features:**
    *   **Header**
        *   Title: "Edit Habit"
        *   "Save" button (top-right)
        *   "Cancel" button (top-left)
    *   **Form Fields (Same as Add Habit, but pre-filled)**
        *   Habit name input
        *   Category selector
        *   Color picker
        *   Icon selector
        *   Frequency settings
        *   Reminder toggle + time picker
        *   Advanced settings (collapsible)
    *   **Additional Options**
        *   **Archive Habit**
            *   "Archive this habit" button
            *   Explanation: "Archived habits won't show in daily list but keep their history"
            *   Confirmation dialog
        *   **Delete Habit**
            *   "Delete Habit" button (red, destructive)
            *   Confirmation dialog:
                *   "Delete [Habit Name]?"
                *   "This will delete all history. This can't be undone."
                *   "Cancel" | "Delete" (red)
    *   **History Preview**
        *   "View Full History" link
        *   Opens Habit Detail Screen
*   **User Flow:**
    *   From Home Screen (tap habit card)
    *   Or from Habit Detail Screen (tap edit button)
    *   User makes changes â†’ Tap Save
    *   Updates local storage + cloud (if premium)
    *   Returns to previous screen
*   **Design Notes:**
    *   Similar layout to Add Habit (consistency)
    *   Destructive actions are clearly marked (red)
    *   Always confirm deletions

### Screen 16: Habit Detail Screen

*   **Screen Count:** 1
*   **Purpose:** Deep dive into single habit's progress and history
*   **Features:**
    *   **Header**
        *   Habit name (large, bold)
        *   Category badge (small pill)
        *   Habit color accent (left border or background)
        *   "Edit" button (top-right)
        *   Back button (top-left)
    *   **Quick Stats Cards (Horizontal scroll)**
        *   **Card 1: Current Streak**
            *   Large number: "24 days"
            *   Fire emoji ðŸ”¥
            *   Subtext: "Current streak"
        *   **Card 2: Longest Streak**
            *   Large number: "58 days"
            *   Trophy emoji ðŸ†
            *   Subtext: "Longest streak"
        *   **Card 3: Total Completions**
            *   Large number: "142"
            *   Checkmark emoji âœ“
            *   Subtext: "All time"
        *   **Card 4: Completion Rate**
            *   Large percentage: "86%"
            *   Chart emoji ðŸ“ˆ
            *   Subtext: "Last 30 days"
    *   **Calendar Heatmap (Primary Visual)**
        *   **Year View (GitHub-style)**
            *   12 months Ã— 7 days grid
            *   Each cell = one day
            *   Color intensity = completion
                *   Empty = gray (not completed)
                *   Light green = completed
                *   Dark green = completed with note
            *   Scrollable horizontally
            *   Today is highlighted (border)
        *   **Month Selector**
            *   Arrows to navigate months
            *   Current month centered
        *   **Legend**
            *   Shows color meanings
            *   "Less" â†’ "More" gradient
    *   **Recent Activity Timeline**
        *   **List of Recent Check-Ins (Last 10)**
            *   Date (relative): "Today", "Yesterday", "2 days ago"
            *   Checkmark icon (green)
            *   Note (if added): "Felt great today!"
            *   Time of check-in: "9:15 AM"
        *   **Missed Days (also shown)**
            *   Date
            *   X icon (gray)
            *   "Missed" label
        *   "View All" button â†’ Opens full history modal
    *   **Insights Section (Premium)**
        *   **AI-Generated Insights**
            *   "You complete this habit most on Mondays"
            *   "Your longest streaks happen in the morning"
            *   "You're 23% more consistent than last month"
            *   "Refresh Insights" button (calls Claude API)
        *   **Free User:**
            *   Locked state (blur or lock icon)
            *   "Unlock AI insights with Premium"
            *   Tap â†’ Paywall
    *   **Charts & Patterns (Premium)**
        *   **Completion by Day of Week**
            *   Bar chart
            *   Shows which days you're most consistent
        *   **Completion by Time of Day**
            *   Line chart or bar chart
            *   Shows when you usually complete
        *   **Monthly Trends**
            *   Line chart
            *   Shows completion rate over months
    *   **Actions Section**
        *   "Export Habit Data" button
            *   Generates CSV or JSON
            *   Includes all check-ins and notes
        *   "Share Streak" button
            *   Generates shareable image
            *   Opens native share sheet
*   **User Flow:**
    *   From Home Screen (tap habit card)
    *   User explores stats, views history
    *   Can edit habit (tap Edit button)
    *   Can check in for today (if not done)
*   **Design Notes:**
    *   Data-rich but not overwhelming
    *   Visualizations over numbers
    *   Progressive disclosure (collapse advanced charts)
*   **Free vs Premium:**
    *   Free: Basic stats + calendar
    *   Premium: AI insights + advanced charts

### Screen 17: Calendar View Screen

*   **Screen Count:** 1
*   **Purpose:** Month view of all habits' completions
*   **Features:**
    *   **Header**
        *   Month + Year: "October 2024"
        *   Navigation arrows (< >)
        *   "Today" button (quick jump)
        *   Back button (top-left)
    *   **Calendar Grid**
        *   **Standard Month View**
            *   7 columns (days of week)
            *   4-6 rows (weeks)
            *   Each cell = one day
        *   **Day Cell Content**
            *   Date number (top-left)
            *   Completion indicator (bottom)
                *   Empty circle = no habits completed
                *   Partial circle = some completed
                *   Full circle = all completed
                *   Progress ring showing ratio (3/5)
            *   Color intensity based on completion
            *   Today highlighted (border)
            *   Selected day highlighted (fill)
    *   **Day Detail Panel (Bottom sheet)**
        *   **Triggered:** Tap on a day
        *   **Content:**
            *   Date: "Monday, October 30"
            *   Completion summary: "3 of 5 habits completed"
            *   List of habits:
                *   Habit name
                *   Checkmark (if completed)
                *   X mark (if missed)
                *   Time of completion
            *   Notes (if any added)
        *   **Historical Check-In (Premium)**
            *   If past date and not completed:
                *   "Mark as completed" button
                *   Allows retroactive check-ins
            *   Free users: "Upgrade to edit past check-ins"
    *   **Filters (Top bar)**
        *   "All Habits" dropdown
        *   Select specific habit:
            *   Shows only that habit's completions
            *   Calendar colors match habit color
        *   "Reset" to show all
    *   **Legend**
        *   Color coding explanation
        *   "All complete", "Partial", "None"
    *   **Navigation**
        *   Swipe left/right to change months
        *   Pinch to zoom out (year view)
*   **User Flow:**
    *   From Home Screen (tap date in header)
    *   User navigates months, taps days
    *   Views completion details
    *   Can mark past days (premium)
*   **Design Notes:**
    *   Fast performance (render visible month only)
    *   Visual patterns should be obvious (streaks visible)
    *   Color-blind accessible (not just color, also shapes)

### Screen 18: Habit Templates Screen

*   **Screen Count:** 1
*   **Purpose:** Pre-built habit suggestions for quick setup
*   **Features:**
    *   **Header**
        *   Title: "Habit Templates"
        *   Subtitle: "Start with proven habits"
        *   Search bar (filter templates)
    *   **Category Tabs**
        *   Horizontal scrolling tabs:
            *   All
            *   Popular
            *   Health
            *   Fitness
            *   Productivity
            *   Mindfulness
            *   Custom (Premium)
        *   Tap to filter templates
    *   **Template Cards**
        *   **Grid Layout (2 columns)**
        *   **Each Card Contains:**
            *   Template name: "Morning Meditation"
            *   Description: "Start your day with 10 minutes of calm"
            *   Icon + color (pre-set)
            *   Category badge
            *   "Recommended frequency: Daily"
            *   Usage count: "12.5K people use this"
            *   "Add" button
        *   **Tap Card:**
            *   Expands to show full details
            *   Benefits list
            *   Tips for success
            *   "Add This Habit" button (pre-fills Add Habit flow)
    *   **Popular Templates (Examples)**
        *   Drink 8 glasses of water
        *   Read 20 pages
        *   Exercise 30 minutes
        *   Meditate 10 minutes
        *   Journal 5 minutes
        *   No phone before bed
        *   Take vitamins
        *   Learn something new
        *   Call a friend
        *   Clean for 15 minutes
    *   **AI-Powered Custom Templates (Premium)**
        *   "Get personalized templates" button
        *   Input: User's goal
        *   Output: Custom habit suggestions
        *   Example:
            *   Goal: "I want to improve my sleep"
            *   AI suggests:
                *   "No screens 1 hour before bed"
                *   "Read for 20 minutes before sleep"
                *   "Set consistent bedtime"
    *   **Empty State**
        *   If search returns no results:
            *   "No templates found"
            *   "Try different keywords or create custom habit"
*   **User Flow:**
    *   From Home Screen (optional Discover tab)
    *   User browses templates
    *   Taps "Add" on template
    *   Opens Add Habit flow with pre-filled data
    *   User can customize before saving
*   **Design Notes:**
    *   Reduce friction for new users
    *   Templates are educational (show good habits)
    *   Pre-filling saves time

### Screen 19-21: Additional Modals & Overlays

*   **Screen Count:** 3
*   These are overlay states, not full screens:
    *   **Modal 1: Streak Broken Notification**
        *   Triggered when user misses a habit
        *   Sympathetic messaging: "Don't worry, it happens!"
        *   Show streak that was broken: "You had a 15-day streak"
        *   Encouragement: "Start again today"
        *   AI recovery advice (Premium): "Here's how to get back on track..."
        *   "Check in now" button
        *   "Dismiss" button
    *   **Modal 2: All Habits Complete Celebration**
        *   Triggered when last habit checked for the day
        *   Confetti animation
        *   Message: "All habits complete! ðŸŽ‰"
        *   Today's stats: "5/5 habits Â· 3 active streaks"
        *   Motivational quote (rotates daily)
        *   "Share Achievement" button
        *   "Done" button
    *   **Modal 3: Quick Note Entry**
        *   Triggered when user checks in habit
        *   Optional: "Add a note?"
        *   Text input (quick entry)
        *   Emoji picker (express mood)
        *   "Save" or "Skip" buttons
        *   Shows on first check-in to educate feature

## PART 3: ANALYTICS TAB (4 Screens)

### Screen 22: Analytics Dashboard

*   **Screen Count:** 1
*   **Purpose:** Overview of all habit analytics (Premium feature)
*   **Features:**
    *   **Premium Gate (Free Users)**
        *   **Lock Screen Overlay**
            *   Blurred preview of charts underneath
            *   Lock icon (center)
            *   "Unlock Analytics with Premium"
            *   Feature list:
                *   Advanced statistics
                *   AI-powered insights
                *   Habit correlations
                *   Export reports
            *   "Upgrade Now" button
            *   "Back" button
    *   **Header (Premium Users)**
        *   Title: "Analytics"
        *   Date range selector:
            *   "Last 7 days" (default)
            *   "Last 30 days"
            *   "Last 90 days"
            *   "All time"
            *   Custom range picker
        *   Export button (top-right)
    *   **Summary Cards (Top section)**
        *   **Card 1: Total Completions**
            *   Large number: "142"
            *   Trend indicator: "+12% vs last period"
            *   Small sparkline chart
        *   **Card 2: Average Streak**
            *   Number: "18.5 days"
            *   Across all habits
        *   **Card 3: Consistency Score**
            *   Percentage: "87%"
            *   Algorithm: (Completions / Expected) Ã— 100
            *   Color-coded: Green (>80%), Yellow (60-80%), Red (<60%)
        *   **Card 4: Active Habits**
            *   Number: "8 habits"
            *   "2 archived"
    *   **Completion Rate Chart**
        *   **Line Chart**
            *   X-axis: Date
            *   Y-axis: Completion percentage (0-100%)
            *   Shows daily completion rate over time
            *   Smooth curve
            *   Interactive: Tap point to see exact date + value
        *   **Multiple Habits Toggle**
            *   Show all habits combined (default)
            *   Or: Show individual habit lines (multi-color)
            *   Legend below chart
    *   **Habits Performance Table**
        *   **Sortable List**
            *   **Columns:**
                *   Habit name
                *   Current streak
                *   Completion rate (last 30 days)
                *   Total completions
            *   Tap column header to sort
            *   Default: Sorted by completion rate (desc)
        *   **Row Actions**
            *   Tap row â†’ Opens Habit Deep Dive Screen
            *   Visual: Spark bar showing last 7 days
    *   **Day of Week Analysis**
        *   **Bar Chart**
            *   X-axis: Days (Mon-Sun)
            *   Y-axis: Average completions
            *   Shows which days user is most consistent
            *   Insight: "You're most productive on Tuesdays!"
    *   **AI Insights Panel**
        *   **Automated Insights**
            *   Generated by Claude API
            *   Examples:
                *   "Your morning habits have 92% completion rate"
                *   "You're 3x more likely to meditate after exercising"
                *   "Your consistency dropped 15% this week"
                *   "Best streak: 58 days on 'Read 20 pages'"
            *   "Refresh Insights" button
            *   Powered by AI badge
    *   **Habit Correlations (Advanced)**
        *   **Correlation Matrix or List**
            *   Shows which habits are completed together
            *   Example: "When you exercise, you're 80% likely to also meditate"
            *   Uses machine learning on completion patterns
            *   Useful for habit stacking
    *   **Quick Actions Bar (Bottom)**
        *   "Export Data" button
        *   "Share Report" button
        *   "View Detailed Reports" button
*   **User Flow:**
    *   From Bottom Tab Navigation (Analytics tab)
    *   Free user: Sees lock screen â†’ Tap upgrade â†’ Paywall
    *   Premium user: Explores charts, views insights
    *   Tap habit â†’ Deep dive screen
    *   Export data â†’ CSV/JSON download
*   **Design Notes:**
    *   Data visualization is key (charts > tables)
    *   Make insights actionable (not just stats)
    *   Performance: Lazy load charts (render on scroll)

### Screen 23: Habit Deep Dive Screen

*   **Screen Count:** 1
*   **Purpose:** Detailed analytics for a single habit
*   **Features:**
    *   **Header**
        *   Habit name
        *   Habit icon + color
        *   Date range selector
        *   Back button
    *   **Hero Stats**
        *   Current streak (large display)
        *   Longest streak
        *   Total completions
        *   Completion rate
    *   **Detailed Charts**
        *   **Time Series Chart**
            *   Daily completions over time
            *   Mark missed days clearly
            *   Show patterns visually
        *   **Completion by Hour**
            *   Bar chart
            *   Shows what time of day user completes
            *   Insight: "You usually complete this at 9 AM"
        *   **Day of Week Breakdown**
            *   Heatmap or bar chart
            *   Shows best/worst days
        *   **Monthly Comparison**
            *   Compare current month to previous
            *   Show improvement or decline
    *   **Pattern Recognition (AI)**
        *   **Automated Patterns**
            *   "You complete this habit more when you also complete [other habit]"
            *   "Your success rate is higher on weekdays"
            *   "You tend to skip this habit on Sundays"
        *   **Predictions**
            *   "Based on your pattern, you'll likely complete this today"
            *   "You're at risk of breaking your streak this weekend"
    *   **Milestones Timeline**
        *   **Visual Timeline**
            *   Shows important dates:
                *   Habit created date
                *   First 7-day streak
                *   First 30-day streak
                *   Longest streak date
                *   100th completion
            *   Scrollable timeline with icons
    *   **Notes & Journal**
        *   **List of Notes (if user added notes)**
            *   Date + note text
            *   Searchable
            *   Filter by date range
        *   **Sentiment Analysis (Advanced AI)**
            *   Analyzes note text
            *   Shows mood trend over time
            *   Example: "Your notes are more positive when streak is active"
    *   **Export Options**
        *   Export this habit's data only
        *   CSV, JSON, or PDF report
        *   Include charts (PDF only)
*   **User Flow:**
    *   From Analytics Dashboard (tap habit row)
    *   Or from Habit Detail Screen (tap "View Analytics")
    *   User explores specific habit's data
    *   Can make adjustments based on insights
*   **Design Notes:**
    *   More detailed than main analytics
    *   Focus on actionable insights
    *   Show trends, not just numbers

### Screen 24: AI Insights Screen

*   **Screen Count:** 1
*   **Purpose:** AI-generated habit coaching and recommendations (Premium)
*   **Features:**
    *   **Header**
        *   Title: "AI Insights"
        *   Subtitle: "Personalized habit coaching"
        *   "Refresh" button (calls Claude API)
    *   **Insight Cards (Vertical scroll)**
        *   **Card 1: Weekly Summary**
            *   Generated every Monday
            *   Content: "This week you completed 18 of 21 habits (86%). That's 5% better than last week! Keep it up!"
            *   Chart: Small bar chart
            *   "View Details" link
        *   **Card 2: Habit Recommendations**
            *   Based on completion patterns
            *   "Based on your morning routine success, consider adding 'Stretch for 5 minutes' before breakfast"
            *   "Add Habit" button (quick action)
        *   **Card 3: Streak Risk Alert**
            *   "You haven't checked in 'Meditate' yet today. Don't break your 24-day streak!"
            *   Urgency indicator (yellow/orange)
            *   "Check in now" button
        *   **Card 4: Pattern Discovery**
            *   "You're 3x more likely to exercise when you complete your morning routine first"
            *   Suggestion: "Try habit stacking - add exercise right after your routine"
            *   Educational content
        *   **Card 5: Motivation & Tips**
            *   "Struggling with consistency? Try the '2-minute rule' - start with just 2 minutes"
            *   Links to articles or tips (in-app content)
        *   **Card 6: Milestone Prediction**
            *   "At your current pace, you'll hit 100 days on 'Read 20 pages' in 12 days!"
            *   Countdown
            *   Motivational
    *   **Ask AI (Interactive)**
        *   **Chat Interface**
            *   Text input: "Ask about your habits..."
            *   Examples:
                *   "Why do I skip meditation on weekends?"
                *   "How can I improve my consistency?"
                *   "What time should I exercise?"
            *   Submit â†’ Claude API call
            *   Response displayed in chat bubble
        *   **Rate Limit Indicator**
            *   "5 questions remaining today"
            *   Prevents abuse
    *   **Insight History**
        *   "Past Insights" section
        *   Archive of previous AI insights
        *   Searchable
        *   Date-stamped
    *   **Settings**
        *   "Insight Frequency"
            *   Daily, Weekly, or Manual
        *   "Notification for Insights"
            *   Toggle on/off
*   **User Flow:**
    *   From Analytics Tab or Home Screen
    *   Premium users browse insights
    *   Can ask questions to AI
    *   Insights refresh automatically (weekly) or manually
*   **Design Notes:**
    *   Conversational tone (friendly, encouraging)
    *   Insights should be specific, not generic
    *   Actionable recommendations (not just observations)
*   **API Integration:**
    *   Claude API calls on:
        *   Manual refresh
        *   Weekly schedule
        *   Ask AI feature
    *   Cache responses (avoid redundant calls)
    *   Cost optimization (rate limiting)

### Screen 25: Export Data Screen

*   **Screen Count:** 1
*   **Purpose:** Export habit data for personal use or migration
*   **Features:**
    *   **Header**
        *   Title: "Export Data"
        *   Subtitle: "Download your habit history"
    *   **Export Options**
        *   **Option 1: All Data**
            *   Radio button
            *   "Export all habits and completions"
            *   File size estimate: "~2.5 MB"
        *   **Option 2: Selected Habits**
            *   Radio button
            *   Checkbox list of habits
            *   Select which habits to include
        *   **Option 3: Date Range**
            *   Date range picker
            *   "Export data from [start] to [end]"
    *   **Format Selection**
        *   **CSV**
            *   Spreadsheet-compatible
            *   Good for Excel/Google Sheets
        *   **JSON**
            *   Developer-friendly
            *   Machine-readable
        *   **PDF Report (Premium only)**
            *   Human-readable report
            *   Includes charts and summary
            *   Professionally formatted
    *   **What's Included**
        *   Checklist showing what data is exported:
            *   âœ“ Habit details (name, category, color)
            *   âœ“ All check-ins with dates
            *   âœ“ Streak history
            *   âœ“ Notes (if any)
            *   âœ“ Creation dates
            *   âœ— Premium analytics (not exportable)
    *   **Privacy Options**
        *   "Remove personal info" checkbox
            *   Removes user ID, email
            *   For sharing publicly
    *   **Export Action**
        *   "Export" button (primary)
            *   Loading state while generating
            *   Progress indicator
        *   Generated file:
            *   "HabitTrackerData_2024-10-30.csv"
            *   Opens native share sheet
            *   Options: Save to Files, Share via email, etc.
*   **User Flow:**
    *   From Analytics or Settings
    *   User selects options
    *   Tap Export â†’ File generated
    *   Native share sheet opens
    *   User saves or shares file
*   **Design Notes:**
    *   Clear labeling of what's included
    *   File preview (optional)
    *   Fast generation (<5 seconds)

## PART 4: PROFILE & SETTINGS TAB (8 Screens)

### Screen 26: Profile Screen

*   **Screen Count:** 1
*   **Purpose:** User profile and subscription management
*   **Features:**
    *   **Profile Header**
        *   **Avatar Section**
            *   Large circular avatar
            *   If logged in: User initials or photo
            *   If anonymous: Generic icon
            *   Tap to change (photo picker)
        *   **User Info**
            *   Display name or "Guest User"
            *   Email (if logged in)
            *   Member since date
            *   Premium badge (if subscribed)
    *   **Stats Summary**
        *   **Quick Stats Cards**
            *   Total habits: "12 habits"
            *   Total completions: "1,247"
            *   Longest streak: "58 days"
            *   Active streaks: "3 ðŸ”¥"
            *   Member for: "6 months"
    *   **Subscription Status**
        *   **Free User:**
            *   "Free Plan" label
            *   "5/5 habits used"
            *   "Upgrade to Premium" button (prominent)
            *   Feature list:
                *   âœ— Cloud sync
                *   âœ— Unlimited habits
                *   âœ— AI insights
                *   âœ— Advanced analytics
        *   **Premium User:**
            *   "Premium" badge (gold/blue color)
            *   Subscription details:
                *   Plan: "Premium Monthly"
                *   Price: "$4.99/month"
                *   Next billing: "November 30, 2024"
                *   "Manage Subscription" button
            *   Perks:
                *   âœ“ Unlimited habits
                *   âœ“ Cloud sync
                *   âœ“ AI insights
                *   âœ“ Advanced analytics
    *   **Account Actions**
        *   **Menu List:**
            *   Settings (chevron right)
            *   Notifications (chevron right)
            *   Data & Privacy (chevron right)
            *   Help & Support (chevron right)
            *   About (chevron right)
    *   **Sync Status (Premium)**
        *   Last synced: "2 minutes ago"
        *   "Sync Now" button
        *   Sync indicator (spinner if syncing)
    *   **Account Management**
        *   **If logged in:**
            *   "Log Out" button
        *   **If anonymous:**
            *   "Sign Up to Sync" button (prominent)
            *   Benefits: "Sign up to sync across devices and backup your data"
    *   **Danger Zone (Collapsed)**
        *   "Delete Account" link
        *   Confirmation flow (multiple steps)
*   **User Flow:**
    *   From Bottom Tab Navigation (Profile tab)
    *   User views stats, manages subscription
    *   Can access all settings screens
    *   Sign up prompt if anonymous
*   **Design Notes:**
    *   Clear distinction between free and premium
    *   Easy access to upgrade
    *   Stats provide motivation

### Screen 27: Settings Screen

*   **Screen Count:** 1
*   **Purpose:** App preferences and configurations
*   **Features:**
    *   **Header**
        *   Title: "Settings"
        *   Back button
    *   **Appearance Section**
        *   **Theme Selector**
            *   "Appearance" label
            *   Options:
                *   Light
                *   Dark
                *   Auto (system)
            *   Segmented control or radio buttons
            *   Preview shows immediately
        *   **App Icon (Premium, optional)**
            *   Alternate app icons
            *   Grid of icon options
            *   Tap to change
    *   **Habits Section**
        *   **First Day of Week**
            *   Dropdown: Sunday or Monday
            *   Affects calendar and stats
        *   **Default Habit Settings**
            *   Default category
            *   Default frequency
            *   Default reminder time
        *   **Completion Sound**
            *   Toggle: Play sound on check-in
            *   Sound picker (if enabled)
    *   **Notifications Section**
        *   "Notification Settings" row
            *   Chevron right
            *   Opens Notification Settings screen
    *   **Data Section**
        *   "Data & Privacy" row
            *   Opens Data & Privacy screen
        *   "Export Data" row
            *   Opens Export screen
        *   "Clear Cache" button
            *   Clears local cached data
            *   Keeps habits and completions
    *   **Account Section**
        *   "Account Settings" row
            *   Opens Account Settings screen
        *   "Subscription" row (if premium)
            *   Opens subscription management
    *   **About Section**
        *   "Help & Support" row
        *   "Rate the App" row
            *   Opens App Store review prompt
        *   "Share App" row
            *   Native share sheet
        *   "About" row
            *   Opens About screen
        *   Version number (bottom)
            *   "Version 1.0.0"
*   **User Flow:**
    *   From Profile Screen
    *   User adjusts preferences
    *   Changes save automatically
    *   Some changes require app restart (rare)
*   **Design Notes:**
    *   Standard settings layout
    *   Grouped by category
    *   Immediate feedback on changes

### Screen 28: Notifications Settings

*   **Screen Count:** 1
*   **Purpose:** Manage all notification preferences
*   **Features:**
    *   **Header**
        *   Title: "Notifications"
        *   Back button
    *   **Master Toggle**
        *   "Enable Notifications"
            *   iOS-style toggle
            *   If off: Disables all below
            *   If on: Shows detailed settings
    *   **Daily Reminders**
        *   Toggle: "Daily Reminder"
            *   Sends one reminder per day
        *   **Time Picker (if enabled)**
            *   "Reminder Time: 9:00 AM"
            *   Tap to change
            *   Native time picker
        *   **Preview**
            *   Shows example notification
            *   "Time to check in! You have 3 habits waiting ðŸŽ¯"
    *   **Per-Habit Reminders**
        *   List of Habits (if any have reminders)
            *   Habit name
            *   Reminder time
            *   Toggle on/off
            *   Edit button (opens habit edit)
    *   **Streak Alerts**
        *   Toggle: "Streak Risk Alerts"
            *   Notifies if about to break streak
            *   Example: "Don't forget! Check in to keep your 24-day streak"
            *   Time: 1 hour before end of day
        *   Toggle: "Streak Milestones"
            *   Celebrates milestone achievements
            *   Example: "ðŸŽ‰ You hit 30 days!"
    *   **Weekly Summary**
        *   Toggle: "Weekly Summary"
            *   Sends recap every Monday
            *   Example: "Last week: 18/21 habits completed"
    *   **AI Insights (Premium)**
        *   Toggle: "AI Insights Notifications"
            *   Sends AI-generated insights
            *   Frequency selector:
                *   Daily
                *   Weekly
                *   Monthly
    *   **Notification Style**
        *   "Notification Sound"
            *   Dropdown with sound options
            *   "Default", "Gentle", "Motivating", etc.
        *   "Badge App Icon"
            *   Toggle: Show number of incomplete habits
            *   iOS-specific
    *   **System Settings Link**
        *   "Open System Settings" button
            *   Links to iOS/Android notification settings
            *   For advanced controls
*   **User Flow:**
    *   From Settings Screen
    *   User enables/disables notifications
    *   Sets preferences per type
    *   Changes save immediately
*   **Design Notes:**
    *   Don't overwhelm with options
    *   Group by notification type
    *   Clear explanations of each type

### Screen 29: Account Settings

*   **Screen Count:** 1
*   **Purpose:** Manage account details and security
*   **Features:**
    *   **Header**
        *   Title: "Account"
        *   Back button
    *   **Account Info (If logged in)**
        *   **Email Display**
            *   Shows current email
            *   "Change Email" button
                *   Opens change email flow
                *   Requires password verification
        *   **Password**
            *   "Change Password" button
                *   Opens change password screen
                *   Old password + new password
        *   **Profile Picture**
            *   Current avatar
            *   "Change Picture" button
                *   Photo picker
                *   Or remove picture
    *   **Anonymous User Prompt**
        *   If not logged in:
            *   "You're using a local account"
            *   Benefits of signing up:
                *   Cloud backup
                *   Sync across devices
                *   Premium features
            *   "Create Account" button (primary)
            *   "I'll do this later" link
    *   **Cloud Sync (Premium, if logged in)**
        *   **Sync Status**
            *   "Last synced: 2 minutes ago"
            *   "Sync Now" button
            *   Auto-sync toggle
        *   **Conflict Resolution**
            *   "Conflict Resolution: Last Write Wins"
            *   Explanation of sync strategy
    *   **Connected Accounts (If implemented)**
        *   **Social Logins**
            *   Apple ID
            *   Google
            *   Status: Connected or Not Connected
            *   Link/Unlink buttons
    *   **Data Management**
        *   "Download Your Data" button
            *   Links to Export screen
        *   "Delete All Data" button (red)
            *   Confirmation dialog
            *   "This will delete all habits and history"
            *   Cannot be undone
    *   **Account Deletion**
        *   "Delete Account" button (red, bottom)
        *   Multi-step confirmation:
            *   Step 1: Warning about data loss
            *   Step 2: Enter password
            *   Step 3: Final confirmation
            *   Cannot be undone
            *   Premium subscription cancellation note
*   **User Flow:**
    *   From Settings or Profile Screen
    *   User manages account details
    *   Change email/password requires verification
    *   Account deletion is heavily gated
*   **Design Notes:**
    *   Destructive actions are clearly marked (red)
    *   Multiple confirmations for deletion
    *   Explain consequences clearly

### Screen 30: Subscription Management Screen

*   **Screen Count:** 1
*   **Purpose:** Manage premium subscription (iOS/Android differences)
*   **Features:**
    *   **Header**
        *   Title: "Subscription"
        *   Back button
    *   **Current Plan (Premium Users)**
        *   **Plan Details Card**
            *   Plan name: "Premium Monthly"
            *   Price: "$4.99/month"
            *   Next billing: "November 30, 2024"
            *   Status: "Active"
        *   **Manage via Platform**
            *   iOS: "Manage via App Store" button
                *   Opens iOS Settings â†’ Subscriptions
            *   Android: "Manage via Google Play" button
                *   Opens Play Store subscription management
    *   **Subscription Actions**
        *   "Change Plan" (if yearly available)
        *   "Cancel Subscription"
            *   Confirmation dialog
            *   "Access until [end date]"
            *   Retention offer (optional)
    *   **Free Users**
        *   **Upgrade Prompt**
            *   "You're on the Free Plan"
            *   Benefits of Premium:
                *   Unlimited habits (vs 5)
                *   Cloud sync
                *   AI insights
                *   Advanced analytics
                *   Priority support
            *   "Upgrade to Premium" button
    *   **Pricing Display**
        *   **Monthly Plan**
            *   $4.99/month
            *   "Cancel anytime"
            *   "Billed monthly"
        *   **Yearly Plan (Recommended)**
            *   $29.99/year
            *   Badge: "Save 50%"
            *   "Best value"
            *   "Billed annually"
        *   **Lifetime (Optional)**
            *   $49.99 one-time
            *   "Pay once, use forever"
            *   Limited availability badge
    *   **Purchase Flow**
        *   Tap plan â†’ Native IAP sheet (RevenueCat)
        *   Touch ID / Face ID verification
        *   Processing â†’ Success
        *   Premium unlocks immediately
    *   **Restore Purchases**
        *   "Restore Purchases" button
            *   For users who reinstalled
            *   Checks receipt with App Store/Play Store
            *   Restores premium status
    *   **Billing History (Premium)**
        *   List of past charges
        *   Date, amount, status
        *   Receipt download (if available)
    *   **FAQs**
        *   Collapsible FAQ section:
            *   "Can I cancel anytime?" â†’ Yes
            *   "What happens when I cancel?" â†’ Access until end date
            *   "Can I get a refund?" â†’ Link to policy
            *   "How do I change payment method?" â†’ Link to platform
*   **User Flow:**
    *   From Profile Screen
    *   Free user: See pricing â†’ Choose plan â†’ Purchase
    *   Premium user: View status â†’ Manage â†’ Cancel/Change
    *   Platform-specific flows (iOS vs Android)
*   **Design Notes:**
    *   Clear, upfront pricing
    *   No hidden fees
    *   Easy to understand what's included
    *   Platform handles actual payment (RevenueCat/App Store/Play Store)
*   **Important:**
    *   iOS requires Apple Sign In if offering social login
    *   Follow App Store guidelines on subscription disclosure
    *   RevenueCat handles cross-platform purchase restoration

### Screen 31: Paywall Screen

*   **Screen Count:** 1
*   **Purpose:** Convert free users to premium (triggered contextually)
*   **Features:**
    *   **Trigger Points**
        *   User tries to add 6th habit
        *   User taps locked premium feature
        *   After 7 days of usage (soft prompt)
        *   After breaking a long streak
    *   **Hero Section**
        *   Headline: Context-specific
            *   "Unlock Unlimited Habits"
            *   "Get AI-Powered Insights"
            *   "Sync Across All Devices"
        *   Hero Image
            *   Relevant illustration
            *   Shows locked feature in action
    *   **Feature Comparison**
| Feature | Free | Premium |
| :--- | :--- | :--- |
| Habits | 5 | Unlimited âœ“ |
| Cloud Sync | âœ— | âœ“ |
| AI Insights | âœ— | âœ“ |
| Analytics | Basic | Advanced âœ“ |
| Data Export | âœ— | âœ“ |
| Priority Support | âœ— | âœ“ |
    *   **Social Proof**
        *   "Join 5,000+ Premium Users"
        *   User testimonials (2-3):
            *   Photo + name
            *   Quote: "Best habit tracker I've used!"
            *   5-star rating
        *   App Store rating: "4.8 â­ (2.5K reviews)"
    *   **Pricing Options**
        *   **Monthly Plan Card**
            *   $4.99/month
            *   "Try for 7 days free" (if offering trial)
            *   "Cancel anytime"
        *   **Yearly Plan Card (Highlighted)**
            *   $29.99/year
            *   Badge: "BEST VALUE Â· Save 50%"
            *   "Only $2.50/month"
            *   "Cancel anytime"
        *   Selected plan is highlighted
    *   **Call to Action**
        *   Large "Start Free Trial" button
            *   Or "Upgrade Now" if no trial
            *   Primary color, prominent
        *   Fine print:
            *   "Cancel anytime. Terms apply."
            *   Links to Terms & Privacy
    *   **Dismiss Options**
        *   "Maybe Later" button (secondary, subtle)
            *   Or "Continue with Free" if blocking action
        *   X button (top-right)
            *   Only if soft prompt (not blocking action)
    *   **Trust Indicators**
        *   "Money-back guarantee" (if offered)
        *   "No commitments"
        *   "Instant access"
*   **Variants:**
    *   **Blocking Paywall (e.g., 6th habit):**
        *   Cannot dismiss without action
        *   Must upgrade or cancel
        *   "Go Back" button returns to previous screen
    *   **Soft Paywall (e.g., after 7 days):**
        *   Can dismiss easily
        *   Reminder purpose
        *   "Remind Me Later" option
*   **User Flow:**
    *   Triggered by various events
    *   User views features and pricing
    *   Chooses plan â†’ IAP flow â†’ Premium unlocked
    *   Or dismisses â†’ Returns to app (if soft)
*   **Design Notes:**
    *   Focus on value, not features
    *   Use emotion (FOMO, aspiration)
    *   Make upgrade feel like progression, not paywall
    *   A/B test messaging and pricing display
*   **Conversion Optimization:**
    *   Show relevant feature based on trigger
    *   Personalize if possible (AI-generated message)
    *   Time-limited offers (optional, ethical)

### Screen 32: About Screen

*   **Screen Count:** 1
*   **Purpose:** App information, credits, and legal
*   **Features:**
    *   **Header**
        *   App logo (large)
        *   App name
        *   Version: "Version 1.0.0 (Build 42)"
    *   **About Section**
        *   **Mission Statement**
            *   "We believe small actions lead to big changes"
            *   Brief paragraph about app philosophy
        *   **Developer Info**
            *   "Made with â¤ï¸ by [Your Name/Company]"
            *   Location (optional)
    *   **Links Section**
        *   **Website**
            *   App website URL
            *   Opens in-app browser
        *   **Social Media**
            *   Twitter/X
            *   Instagram
            *   TikTok (if applicable)
            *   Icons with links
        *   **Contact**
            *   "Support Email: support@habitapp.com"
            *   Tap to open email client
    *   **Legal Links**
        *   "Terms of Service"
            *   Opens in-app browser
        *   "Privacy Policy"
            *   Opens in-app browser
        *   "Licenses"
            *   Open source acknowledgments
            *   List of libraries used
    *   **Community**
        *   "Join Our Community" (optional)
            *   Discord server
            *   Reddit community
            *   Link to forum
    *   **App Store Links**
        *   "Rate on App Store"
            *   Opens review prompt
        *   "Share App"
            *   Native share sheet
            *   Pre-filled message
    *   **Credits**
        *   "Icons by Lucide"
        *   "Illustrations by [AI/Designer]"
        *   "Built with React Native & Expo"
    *   **Easter Egg (Optional)**
        *   Tap app logo 7 times â†’ Confetti animation
        *   Or secret settings unlock
        *   Fun, not critical
*   **User Flow:**
    *   From Settings or Profile
    *   User reads about app
    *   Can contact support, view legal docs
    *   Rate app or share
*   **Design Notes:**
    *   Keep it simple and transparent
    *   Make contact easy
    *   Build trust with transparency

## PART 5: ADDITIONAL SCREENS & STATES

### Screen 33-40: Additional States & Overlays

*   These are not full screens but important UI states:
    1.  **Loading States**
        *   App launch splash
        *   Screen loading spinners
        *   Skeleton screens (for data loading)
        *   Pull-to-refresh indicators
    2.  **Error States**
        *   Network error modal
        *   Sync error toast
        *   Form validation errors
        *   Generic error screens
    3.  **Empty States**
        *   No habits yet
        *   No completions today
        *   No analytics data
        *   No search results
    4.  **Success States**
        *   Habit added successfully (toast)
        *   Check-in recorded (animation)
        *   Purchase successful (modal)
        *   Sync complete (toast)
    5.  **Confirmation Dialogs**
        *   Delete habit confirmation
        *   Delete account confirmation
        *   Discard changes confirmation
        *   Cancel subscription confirmation
    6.  **Tooltips & Onboarding**
        *   First-time tooltips (coach marks)
        *   Feature discovery hints
        *   Gesture tutorials
        *   What's new announcements
    7.  **System Permissions**
        *   Notification permission dialog
        *   Photo library access (for avatar)
        *   Camera access (if adding photos to notes)
    8.  **Search & Filter**
        *   Habit search (if many habits)
        *   Filter by category
        *   Sort options

## FEATURE SUMMARY BY USER TYPE

### Free User Journey

*   **Screens Accessible:**
    *   âœ… Onboarding (3 screens)
    *   âœ… Home Screen (with 5 habit limit)
    *   âœ… Add/Edit Habit (limited to 5)
    *   âœ… Habit Detail (basic view)
    *   âœ… Calendar View (current month)
    *   âœ… Profile & Settings
    *   âŒ Analytics (locked with preview)
    *   âŒ AI Insights (locked)
    *   âœ… Paywall (to upgrade)
*   **Free User Experience:**
    *   Can use app fully with up to 5 habits
    *   Local storage only (no cloud sync)
    *   Basic stats and streaks
    *   Limited calendar (current month)
    *   Sees premium prompts but not blocked
    *   Can export data (basic CSV)
*   **Conversion Triggers:**
    *   Hit 5-habit limit (hard block)
    *   Tap analytics tab (soft block with preview)
    *   After 7 days (soft prompt)
    *   Break a long streak (sympathetic upsell)

### Premium User Journey

*   **All Screens Accessible:**
    *   âœ… Everything free users have
    *   âœ… Unlimited habits
    *   âœ… Full Analytics Dashboard
    *   âœ… AI Insights Screen
    *   âœ… Advanced Calendar (all-time)
    *   âœ… Cloud sync everywhere
    *   âœ… Export advanced reports (PDF)
    *   âœ… Priority support
    *   âœ… Habit templates (AI-generated)
*   **Premium User Experience:**
    *   Seamless experience across all devices
    *   Data syncs automatically
    *   AI coaching and insights
    *   Advanced analytics and patterns
    *   No limits or locked features
    *   Enhanced data export options
    *   Priority support (faster response)

## NAVIGATION PATTERNS

### Primary Navigation (Bottom Tabs)

*   **Tab 1: Home ðŸ **
    *   Main feed of today's habits
    *   Check-in interface
    *   Most used screen (80% of time)
*   **Tab 2: Analytics ðŸ“Š**
    *   Dashboard of all analytics
    *   Free: Locked with preview
    *   Premium: Full access
    *   Secondary screen (data review)
*   **Tab 3: Discover ðŸ” (Optional)**
    *   Habit templates
    *   AI suggestions
    *   Community habits (future)
    *   Exploration screen
*   **Tab 4: Profile ðŸ‘¤**
    *   User profile
    *   Settings
    *   Subscription management
    *   Utility screen

### Secondary Navigation

*   **Stack Navigation:**
    *   Forward/backward within each tab
    *   Modal presentations for focused tasks
    *   Swipe gestures to go back
*   **Modal Navigation:**
    *   Add Habit flow (modal stack)
    *   Paywall (modal)
    *   Celebrations (overlay)
    *   Confirmations (alert)

## INTERACTION PATTERNS

### Gestures

*   **Swipe Right:** Quick check-in (on habit card)
*   **Swipe Left:** Options menu (edit, delete)
*   **Long Press:** Drag to reorder
*   **Pull Down:** Refresh (sync from cloud)
*   **Pinch:** Zoom (on calendar)
*   **Double Tap:** Quick action (context-dependent)

### Haptic Feedback

*   **Light:** Button press, selection
*   **Medium:** Check-in action, toggle
*   **Heavy:** Error, deletion
*   **Success:** Pattern for streak milestone

### Animations

*   **60fps Priority:**
    *   Check-in animation
    *   Navigation transitions
    *   Progress ring updates
    *   Scroll interactions
*   **Delightful Moments:**
    *   Confetti (milestones)
    *   Checkmark animation
    *   Streak flame animation
    *   Card expansions

## ACCESSIBILITY FEATURES

### Screen Reader Support:

*   All elements properly labeled
*   Hint text for complex interactions
*   Logical reading order

### Visual Accessibility:

*   Minimum contrast ratio 4.5:1
*   Support for Dynamic Type (iOS)
*   Support for large text (Android)
*   No color-only indicators (use shapes too)

### Motor Accessibility:

*   Large touch targets (44x44pt minimum)
*   No precision gestures required
*   Alternative to gestures (buttons)
*   Adjustable timing (no rushed interactions)

### Cognitive Accessibility:

*   Simple, clear language
*   One primary action per screen
*   Progress indicators
*   Confirmation dialogs for destructive actions

## SCREEN COUNT FINAL TALLY

*   **Core Screens:** 32
    *   Splash
    *   2-4. Onboarding (3)
    *   Permission Request
    *   Welcome
    *   Sign Up
    *   Login
    *   Password Reset
    *   Home
    *   Celebration Modal
    *   12-14. Add Habit (3 steps)
    *   Edit Habit
    *   Habit Detail
    *   Calendar View
    *   Habit Templates
    *   19-21. Additional Modals (3)
    *   Analytics Dashboard
    *   Habit Deep Dive
    *   AI Insights
    *   Export Data
    *   Profile
    *   Settings
    *   Notifications Settings
    *   Account Settings
    *   Subscription Management
    *   Paywall
    *   About
*   **Overlay States:** 8
    *   Loading States
    *   Error States
    *   Empty States
    *   Success States
    *   Confirmation Dialogs
    *   Tooltips
    *   System Permissions
    *   Search & Filter
*   **Total:** 40 UI States

## IMPLEMENTATION PRIORITY

### Phase 1 (MVP - Weeks 2-4):

*   Splash + Onboarding
*   Home Screen
*   Add/Edit Habit
*   Basic check-in
*   Local storage

### Phase 2 (Core Features - Weeks 4-6):

*   Authentication
*   Calendar view
*   Habit detail
*   Settings
*   Notifications

### Phase 3 (Premium - Weeks 6-8):

*   Backend integration
*   Analytics dashboard
*   Paywall
*   IAP implementation
*   Cloud sync

### Phase 4 (AI & Polish - Weeks 8-10):

*   AI insights
*   Advanced analytics
*   Habit templates
*   Celebrations
*   Performance optimization

This detailed specification covers every screen, interaction, and user flow in the mobile app. Use this as your reference when implementing with Claude Code!