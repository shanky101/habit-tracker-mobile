import { createBadgeService, BadgeDatabase, BadgeEventContext } from './BadgeService';
import { BADGES } from '../types/badges';

// Mock database
const createMockDb = (): BadgeDatabase & {
    userBadges: Map<string, any>;
    badgeProgress: Map<string, any>;
} => {
    const userBadges = new Map();
    const badgeProgress = new Map();

    return {
        userBadges,
        badgeProgress,

        async getAllAsync<T>(query: string, params?: any[]): Promise<T[]> {
            if (query.includes('user_badges')) {
                return Array.from(userBadges.values()) as T[];
            }
            if (query.includes('badge_progress')) {
                return Array.from(badgeProgress.values()) as T[];
            }
            return [];
        },

        async getFirstAsync<T>(query: string, params?: any[]): Promise<T | null> {
            if (query.includes('badge_progress') && params?.[0]) {
                return (badgeProgress.get(params[0]) as T) || null;
            }
            return null;
        },

        async runAsync(query: string, params?: any[]): Promise<void> {
            if (query.includes('INSERT INTO user_badges')) {
                const [badgeId, unlockedAt] = params || [];
                userBadges.set(badgeId, {
                    badge_id: badgeId,
                    unlocked_at: unlockedAt,
                    is_seen: 0,
                });
            } else if (query.includes('badge_progress')) {
                const [badgeId, currentValue] = params || [];
                badgeProgress.set(badgeId, {
                    badge_id: badgeId,
                    current_value: currentValue,
                    meta: null,
                    last_updated: new Date().toISOString(),
                });
            } else if (query.includes('UPDATE user_badges')) {
                params?.forEach(badgeId => {
                    const badge = userBadges.get(badgeId);
                    if (badge) {
                        badge.is_seen = 1;
                    }
                });
            }
        },
    };
};

describe('Achievements Package: BadgeService', () => {
    describe('Badge Unlocking Logic', () => {
        test('unlocks First Step badge (1 completion)', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            const context: BadgeEventContext = {
                totalCompletions: 1,
            };

            const unlocked = await service.checkUnlock('habit_complete', context);

            expect(unlocked.length).toBeGreaterThan(0);
            const firstStep = unlocked.find(b => b.id === 'vol_1');
            expect(firstStep).toBeDefined();
            expect(firstStep?.title).toBe('First Step');
        });

        test('unlocks streak-based badge (7-day streak)', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            const context: BadgeEventContext = {
                streak: 7,
            };

            const unlocked = await service.checkUnlock('habit_complete', context);

            const weekWarrior = unlocked.find(b => b.id === 'streak_7');
            expect(weekWarrior).toBeDefined();
            expect(weekWarrior?.requirement.type).toBe('streak_days');
            expect(weekWarrior?.requirement.threshold).toBe(7);
        });

        test('does not unlock badge if threshold not met', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            const context: BadgeEventContext = {
                streak: 5, // Need 7 for Week Warrior
            };

            const unlocked = await service.checkUnlock('habit_complete', context);

            const weekWarrior = unlocked.find(b => b.id === 'streak_7');
            expect(weekWarrior).toBeUndefined();
        });

        test('does not unlock already unlocked badge', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            // First unlock
            await service.checkUnlock('habit_complete', { totalCompletions: 1 });

            // Try again with same context
            const unlocked = await service.checkUnlock('habit_complete', { totalCompletions: 1 });

            const firstStep = unlocked.find(b => b.id === 'vol_1');
            expect(firstStep).toBeUndefined(); // Already unlocked
        });

        test('unlocks multiple badges in one check', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            const context: BadgeEventContext = {
                totalCompletions: 100,
                streak: 30,
            };

            const unlocked = await service.checkUnlock('habit_complete', context);

            expect(unlocked.length).toBeGreaterThan(1);
            // Should unlock multiple streak and completion badges
        });
    });

    describe('Time-Based Badges', () => {
        test('unlocks Morning Glory badge (completion before 8 AM)', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            // 5:30 AM timestamp
            const earlyMorning = new Date();
            earlyMorning.setHours(5, 30, 0, 0);

            const context: BadgeEventContext = {
                timestamp: earlyMorning.getTime(),
            };

            // Need 5 early completions for Morning Glory (vol_morning_5)
            for (let i = 0; i < 5; i++) {
                await service.checkUnlock('habit_complete', context);
            }

            const badges = await service.getBadges();
            const morningGlory = badges.find(b => b.id === 'time_morning_5');

            expect(morningGlory?.progress).toBe(5);
        });

        test('does not count completion outside time window', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            // 9 AM timestamp (not early)
            const midMorning = new Date();
            midMorning.setHours(9, 0, 0, 0);

            const context: BadgeEventContext = {
                timestamp: midMorning.getTime(),
            };

            await service.checkUnlock('habit_complete', context);

            const badges = await service.getBadges();
            const morningGlory = badges.find(b => b.id === 'time_morning_5');

            expect(morningGlory?.progress).toBe(0);
        });
    });

    describe('Progress Tracking', () => {
        test('tracks progress for progressive badges', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            await service.updateProgress('streak_7', 5);

            const badges = await service.getBadges();
            const weekWarrior = badges.find(b => b.id === 'streak_7');

            expect(weekWarrior?.progress).toBe(5);
            expect(weekWarrior?.isUnlocked).toBe(false);
        });

        test('increments progress correctly', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            const value1 = await service.incrementProgress('test_badge');
            const value2 = await service.incrementProgress('test_badge');
            const value3 = await service.incrementProgress('test_badge');

            expect(value1).toBe(1);
            expect(value2).toBe(2);
            expect(value3).toBe(3);
        });
    });

    describe('Badge Visibility', () => {
        test('marks badges as seen', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            // Unlock a badge
            await service.unlockBadge('vol_1');

            // Initially not seen
            let badges = await service.getBadges();
            let firstStep = badges.find(b => b.id === 'vol_1');
            expect(firstStep?.isSeen).toBe(false);

            // Mark as seen
            await service.markAsSeen(['vol_1']);

            // Now seen
            badges = await service.getBadges();
            firstStep = badges.find(b => b.id === 'vol_1');
            expect(firstStep?.isSeen).toBe(true);
        });

        test('handles multiple badges marked as seen', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            await service.unlockBadge('vol_1');
            await service.unlockBadge('streak_7');

            await service.markAsSeen(['vol_1', 'streak_7']);

            const badges = await service.getBadges();
            const firstStep = badges.find(b => b.id === 'vol_1');
            const weekWarrior = badges.find(b => b.id === 'streak_7');

            expect(firstStep?.isSeen).toBe(true);
            expect(weekWarrior?.isSeen).toBe(true);
        });
    });

    describe('Event Type Filtering', () => {
        test('identifies relevant badges for habit_complete event', () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            const streakBadge = BADGES.find(b => b.requirement.type === 'streak_days');
            const habitCreatedBadge = BADGES.find(b => b.requirement.type === 'habits_created');

            expect(service.isRelevantEvent(streakBadge!, 'habit_complete')).toBe(true);
            expect(service.isRelevantEvent(habitCreatedBadge!, 'habit_complete')).toBe(false);
        });

        test('identifies relevant badges for habit_create event', () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            const habitCreatedBadge = BADGES.find(b => b.requirement.type === 'habits_created');
            const streakBadge = BADGES.find(b => b.requirement.type === 'streak_days');

            expect(service.isRelevantEvent(habitCreatedBadge!, 'habit_create')).toBe(true);
            expect(service.isRelevantEvent(streakBadge!, 'habit_create')).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        test('handles empty context gracefully', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            const unlocked = await service.checkUnlock('habit_complete', {});

            expect(unlocked).toEqual([]);
        });

        test('handles threshold boundary (off-by-one)', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            // Exactly at threshold (should unlock)
            const contextExact: BadgeEventContext = { streak: 7 };
            const unlockedExact = await service.checkUnlock('habit_complete', contextExact);
            expect(unlockedExact.some(b => b.id === 'streak_7')).toBe(true);

            // Reset
            const mockDb2 = createMockDb();
            const service2 = createBadgeService(mockDb2);

            // One below threshold (should NOT unlock)
            const contextBelow: BadgeEventContext = { streak: 6 };
            const unlockedBelow = await service2.checkUnlock('habit_complete', contextBelow);
            expect(unlockedBelow.some(b => b.id === 'streak_7')).toBe(false);
        });

        test('handles getBadges when no badges unlocked', async () => {
            const mockDb = createMockDb();
            const service = createBadgeService(mockDb);

            const badges = await service.getBadges();

            expect(badges.length).toBe(BADGES.length);
            expect(badges.every(b => !b.isUnlocked)).toBe(true);
        });
    });
});
