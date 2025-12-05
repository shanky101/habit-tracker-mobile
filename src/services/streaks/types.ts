/**
 * Streak Badges - TypeScript Type Definitions
 *
 * Defines all types and interfaces for the streak badge gamification system
 */

/**
 * Badge tier levels
 */
export type BadgeTier = 1 | 2 | 3 | 4;

/**
 * Badge state
 */
export type BadgeState = 'locked' | 'active' | 'unlocked';

/**
 * Badge milestone configuration
 */
export interface BadgeMilestone {
  /** Unique identifier for the badge */
  id: string;
  /** Display name of the badge */
  name: string;
  /** Description of the achievement */
  description: string;
  /** Number of consecutive days required */
  days: number;
  /** Badge tier (1-4) */
  tier: BadgeTier;
  /** Theme for this badge tier */
  theme?: string;
  /** Icon identifier (for future icon integration) */
  icon?: string;
}

/**
 * User's unlocked badge record
 */
export interface StreakBadge {
  /** Database record ID */
  id: string;
  /** User ID who owns this badge */
  userId: string;
  /** Badge ID reference from BadgeMilestone */
  badgeId: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Days required to unlock */
  daysRequired: number;
  /** Badge tier */
  tier: BadgeTier;
  /** When the badge was unlocked (ISO date string) */
  unlockedAt: string;
  /** User's streak count when unlocked */
  streakCount: number;
  /** Number of times this badge was shared */
  sharedCount: number;
  /** Current state of the badge */
  state: BadgeState;
  /** Progress percentage for active badges (0-100) */
  progress?: number;
}

/**
 * Global streak statistics
 */
export interface StreakStats {
  /** Current active streak (consecutive days from today backwards) */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Total number of badges unlocked */
  totalBadgesUnlocked: number;
  /** Breakdown of badges by tier */
  badgesByTier: {
    tier1: number;
    tier2: number;
    tier3: number;
    tier4: number;
  };
  /** Information about the next milestone to achieve */
  nextMilestone: NextMilestoneInfo | null;
}

/**
 * Next milestone information
 */
export interface NextMilestoneInfo {
  /** Badge ID of the next milestone */
  badgeId: string;
  /** Display name of the next badge */
  name: string;
  /** Days required for this badge */
  daysRequired: number;
  /** Days remaining until unlock */
  daysRemaining: number;
  /** Progress percentage (0-100) */
  progress: number;
}

/**
 * Badge share image configuration
 */
export interface BadgeShareImage {
  /** Badge ID being shared */
  badgeId: string;
  /** Local file path to the generated image */
  imageUri: string;
  /** Image width (always 1080) */
  width: 1080;
  /** Image height (always 1080) */
  height: 1080;
  /** Optional user name to display */
  userName?: string;
  /** Streak count at time of unlock */
  streakCount: number;
  /** Date when badge was unlocked */
  unlockedDate: string;
}

/**
 * Habit completion record (for streak calculation)
 */
export interface HabitCompletion {
  /** Date of completion (YYYY-MM-DD format) */
  date: string;
  /** Number of completions for that day */
  completionCount: number;
  /** Target completions required */
  targetCount: number;
  /** Whether the target was met */
  isComplete: boolean;
}

/**
 * Streak calculation result
 */
export interface StreakCalculationResult {
  /** Current active streak (from today backwards) */
  currentStreak: number;
  /** Longest streak in the dataset */
  longestStreak: number;
  /** All unique completion dates */
  completionDates: string[];
  /** Last date any habit was completed */
  lastCompletionDate: string | null;
}

/**
 * Badge unlock event
 */
export interface BadgeUnlockEvent {
  /** The badge that was unlocked */
  badge: StreakBadge;
  /** When it was unlocked */
  unlockedAt: string;
  /** Streak count at unlock time */
  streakCount: number;
  /** Whether this is a new unlock (for animation) */
  isNew: boolean;
}

/**
 * Badge color palette by tier
 */
export interface BadgeColorPalette {
  primary: string;
  accent: string;
  glow: string;
}

/**
 * Database row for streak_badges table
 */
export interface StreakBadgeRow {
  id: string;
  user_id: string;
  badge_id: string;
  days_required: number;
  unlocked_at: string;
  streak_count: number;
  shared_count: number;
}

/**
 * App metadata keys for streak tracking
 */
export const STREAK_METADATA_KEYS = {
  CURRENT_STREAK: 'global_streak_current',
  LONGEST_STREAK: 'global_streak_longest',
  LAST_UPDATED: 'global_streak_last_updated',
  LAST_BADGE_ID: 'last_badge_unlocked_id',
  LAST_BADGE_DATE: 'last_badge_unlocked_at',
} as const;
