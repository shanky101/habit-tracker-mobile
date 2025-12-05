/**
 * Streak Badge Milestones Configuration
 *
 * Defines all 23 badge milestones across 4 tiers
 */

import { BadgeMilestone, BadgeColorPalette } from './types';

/**
 * Badge color palettes by tier
 */
export const BADGE_COLORS: Record<number, BadgeColorPalette> = {
  // Tier 1 (Days): Green - Growth theme
  1: {
    primary: '#4CAF50',
    accent: '#8BC34A',
    glow: '#CDDC39',
  },
  // Tier 2 (Months): Blue - Trust theme
  2: {
    primary: '#2196F3',
    accent: '#03A9F4',
    glow: '#00BCD4',
  },
  // Tier 3 (Quarter-Year): Purple - Royalty theme
  3: {
    primary: '#9C27B0',
    accent: '#BA68C8',
    glow: '#E1BEE7',
  },
  // Tier 4 (Year+): Gold - Legend theme
  4: {
    primary: '#FFD700',
    accent: '#FFA500',
    glow: '#FF6B6B',
  },
};

/**
 * All badge milestones
 * Total: 23 badges across 4 tiers
 */
export const BADGE_MILESTONES: BadgeMilestone[] = [
  // =========================================
  // TIER 1: FOUNDATION (Days 1-30)
  // Theme: Seedlings to Sapling
  // =========================================
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Completed your first day of habit tracking',
    days: 1,
    tier: 1,
    theme: 'Tiny sprout 🌱',
    icon: 'seedling',
  },
  {
    id: 'momentum',
    name: 'Momentum',
    description: 'Built momentum with 3 consecutive days',
    days: 3,
    tier: 1,
    theme: 'Young plant with 3 leaves',
    icon: 'plant-3-leaves',
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Showed dedication for 5 days straight',
    days: 5,
    tier: 1,
    theme: 'Small tree sapling',
    icon: 'sapling',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Conquered an entire week! ⭐',
    days: 7,
    tier: 1,
    theme: 'Sturdy young tree',
    icon: 'young-tree',
  },
  {
    id: 'double_digits',
    name: 'Double Digits',
    description: 'Reached 10 consecutive days',
    days: 10,
    tier: 1,
    theme: 'Tree with roots visible',
    icon: 'tree-roots',
  },
  {
    id: 'fortnight_champion',
    name: 'Fortnight Champion',
    description: 'Two weeks of consistent progress',
    days: 15,
    tier: 1,
    theme: 'Tree with flowers',
    icon: 'flowering-tree',
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Completed a full month! 🎊',
    days: 30,
    tier: 1,
    theme: 'Full tree with fruits',
    icon: 'fruit-tree',
  },

  // =========================================
  // TIER 2: GROWTH (Months 1-6)
  // Theme: Trees to Forest
  // =========================================
  {
    id: '30_day_titan',
    name: '30-Day Titan',
    description: 'A full month of unwavering commitment',
    days: 30,
    tier: 2,
    theme: 'Single majestic oak',
    icon: 'oak-tree',
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: '60 days of building better habits',
    days: 60,
    tier: 2,
    theme: 'Two intertwined trees',
    icon: 'twin-trees',
  },
  {
    id: 'quarter_champion',
    name: 'Quarter Champion',
    description: '3 months of remarkable consistency',
    days: 90,
    tier: 2,
    theme: 'Three trees (small forest)',
    icon: 'small-forest',
  },
  {
    id: 'seasonal_star',
    name: 'Seasonal Star',
    description: '4 months through all seasons',
    days: 120,
    tier: 2,
    theme: 'Four trees (four seasons)',
    icon: 'seasonal-trees',
  },
  {
    id: 'half_year_hero',
    name: 'Half-Year Hero',
    description: '5 months of dedication and growth',
    days: 150,
    tier: 2,
    theme: 'Five trees with pathway',
    icon: 'tree-pathway',
  },
  {
    id: 'semester_conqueror',
    name: 'Semester Conqueror',
    description: 'Half a year of excellence! 🌟',
    days: 180,
    tier: 2,
    theme: 'Six trees (small grove)',
    icon: 'grove',
  },

  // =========================================
  // TIER 3: MASTERY (Months 6-12)
  // Theme: Mountains & Peaks
  // =========================================
  {
    id: 'lucky_seven',
    name: 'Lucky Seven',
    description: '7 months of mastering your habits',
    days: 210,
    tier: 3,
    theme: 'Mountain with 7 peaks',
    icon: 'seven-peaks',
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '8 months of unstoppable progress',
    days: 240,
    tier: 3,
    theme: 'Mountain range',
    icon: 'mountain-range',
  },
  {
    id: 'marathon_master',
    name: 'Marathon Master',
    description: '9 months of marathon-like endurance',
    days: 270,
    tier: 3,
    theme: 'Mountain with flag',
    icon: 'summit-flag',
  },
  {
    id: 'diamond_decade',
    name: 'Diamond Decade',
    description: '10 months of rare, diamond-hard commitment',
    days: 300,
    tier: 3,
    theme: 'Mountain with crystals',
    icon: 'crystal-mountain',
  },
  {
    id: 'almost_legendary',
    name: 'Almost Legendary',
    description: '11 months - legend status approaching',
    days: 330,
    tier: 3,
    theme: 'Mountain touching clouds',
    icon: 'cloud-mountain',
  },
  {
    id: 'year_legend',
    name: 'Year Legend',
    description: 'One full year of excellence! 🏆',
    days: 365,
    tier: 3,
    theme: 'Golden mountain peak',
    icon: 'golden-peak',
  },

  // =========================================
  // TIER 4: LEGACY (Year+)
  // Theme: Cosmic & Celestial
  // =========================================
  {
    id: 'stellar_streak',
    name: 'Stellar Streak',
    description: '1.5 years of stellar achievement',
    days: 547,
    tier: 4,
    theme: 'Earth with ring',
    icon: 'ringed-earth',
  },
  {
    id: 'orbit_master',
    name: 'Orbit Master',
    description: '2 years of orbital consistency',
    days: 730,
    tier: 4,
    theme: 'Earth + Moon',
    icon: 'earth-moon',
  },
  {
    id: 'cosmic_warrior',
    name: 'Cosmic Warrior',
    description: '2.5 years of cosmic dedication',
    days: 912,
    tier: 4,
    theme: 'Solar system (inner planets)',
    icon: 'inner-planets',
  },
  {
    id: 'universe_champion',
    name: 'Universe Champion',
    description: '3 years - You are a true champion! 🌌',
    days: 1095,
    tier: 4,
    theme: 'Full solar system',
    icon: 'solar-system',
  },
];

/**
 * Get all badges for a specific tier
 */
export const getBadgesByTier = (tier: 1 | 2 | 3 | 4): BadgeMilestone[] => {
  return BADGE_MILESTONES.filter((badge) => badge.tier === tier);
};

/**
 * Get badge by ID
 */
export const getBadgeById = (id: string): BadgeMilestone | undefined => {
  return BADGE_MILESTONES.find((badge) => badge.id === id);
};

/**
 * Get next badge milestone based on current streak
 */
export const getNextBadge = (currentStreak: number): BadgeMilestone | null => {
  // Find the first badge with days > currentStreak
  const nextBadge = BADGE_MILESTONES.find((badge) => badge.days > currentStreak);
  return nextBadge || null;
};

/**
 * Get all unlocked badge milestones for a given streak
 */
export const getUnlockedBadges = (streak: number): BadgeMilestone[] => {
  return BADGE_MILESTONES.filter((badge) => badge.days <= streak);
};

/**
 * Get badge statistics summary
 */
export const getBadgeStats = () => {
  return {
    totalBadges: BADGE_MILESTONES.length,
    tier1Count: getBadgesByTier(1).length,
    tier2Count: getBadgesByTier(2).length,
    tier3Count: getBadgesByTier(3).length,
    tier4Count: getBadgesByTier(4).length,
  };
};
