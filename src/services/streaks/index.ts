/**
 * Streak Badges Service - Barrel Export
 *
 * Central export point for all streak badge functionality
 */

// Type definitions
export * from './types';

// Badge configuration
export * from './badgeMilestones';

// Core services
export { StreakCalculator, DateUtils } from './StreakCalculator';
export { BadgeManager } from './BadgeManager';
export { StreakTracker } from './StreakTracker';
