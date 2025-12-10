import { BADGES, BadgeDefinition, BadgeRequirement } from '../../types/badges';
import { db } from '../../data/database/client';
import { useUserStore } from '../../store/userStore';

interface UserBadge {
    badge_id: string;
    unlocked_at: string;
    is_seen: number;
}

interface BadgeProgress {
    badge_id: string;
    current_value: number;
    meta: string | null;
    last_updated: string;
}

export const BadgeService = {
    /**
     * Check if any badges should be unlocked based on an event.
     * @param eventType The type of event triggering the check
     * @param context Additional data for the check (e.g., current streak, total completions)
     */
    async checkUnlock(
        eventType: 'habit_complete' | 'habit_create' | 'note_add' | 'mood_log' | 'share' | 'app_open',
        context: any
    ): Promise<BadgeDefinition[]> {
        const unlockedBadges: BadgeDefinition[] = [];

        // 1. Get already unlocked badges to skip them
        const existingBadges = await db.getAllAsync<UserBadge>('SELECT badge_id FROM user_badges');
        const unlockedIds = new Set(existingBadges.map(b => b.badge_id));

        // 2. Filter potential badges based on event type
        const potentialBadges = BADGES.filter(b => !unlockedIds.has(b.id) && this.isRelevantEvent(b, eventType));

        for (const badge of potentialBadges) {
            const isUnlocked = await this.evaluateRequirement(badge, context);

            if (isUnlocked) {
                await this.unlockBadge(badge.id);
                unlockedBadges.push(badge);
            }
        }

        return unlockedBadges;
    },

    /**
     * Determine if a badge is relevant for a given event type.
     */
    isRelevantEvent(badge: BadgeDefinition, eventType: string): boolean {
        const type = badge.requirement.type;
        switch (eventType) {
            case 'habit_complete':
                return [
                    'streak_days', 'total_completions', 'time_of_day',
                    'perfect_days', 'category_completions', 'active_days',
                    'specific_date', 'multi_task', 'special_number'
                ].includes(type);
            case 'habit_create':
                return ['habits_created', 'diversity_category', 'diversity_type'].includes(type);
            case 'note_add':
                return type === 'notes_added';
            case 'mood_log':
                return type === 'mood_logs';
            case 'share':
                return type === 'shares';
            case 'app_open':
                return ['active_days', 'streak_recovery', 'vacation_mode'].includes(type);
            default:
                return false;
        }
    },

    /**
     * Evaluate if a badge requirement is met.
     * Also updates progress for tracked badges.
     */
    async evaluateRequirement(badge: BadgeDefinition, context: any): Promise<boolean> {
        const { type, threshold, meta } = badge.requirement;
        let currentValue = 0;
        let isMet = false;

        switch (type) {
            case 'streak_days':
                currentValue = context.streak || 0;
                isMet = currentValue >= threshold;
                break;
            case 'total_completions':
                currentValue = context.totalCompletions || 0;
                isMet = currentValue >= threshold;
                break;
            case 'habits_created':
                currentValue = context.habitsCount || 0;
                isMet = currentValue >= threshold;
                break;
            case 'time_of_day':
                // This requires tracking counts in badge_progress
                // We'll increment progress if the current completion matches the time
                if (this.checkTimeCondition(context.timestamp, meta)) {
                    currentValue = await this.incrementProgress(badge.id);
                    isMet = currentValue >= threshold;
                }
                break;
            case 'category_completions':
                if (context.category === meta.category) {
                    currentValue = await this.incrementProgress(badge.id);
                    isMet = currentValue >= threshold;
                }
                break;
            // ... Implement other types as needed
            default:
                // For simple threshold checks passed in context
                if (context[type] !== undefined) {
                    currentValue = context[type];
                    isMet = currentValue >= threshold;
                }
                break;
        }

        // Update progress for UI if tracked (and not already handled by incrementProgress)
        if (badge.progressTracked && type !== 'time_of_day' && type !== 'category_completions') {
            await this.updateProgress(badge.id, currentValue);
        }

        return isMet;
    },

    /**
     * Helper to check time of day conditions.
     */
    checkTimeCondition(timestamp: number, meta: any): boolean {
        const date = new Date(timestamp);
        const hour = date.getHours();

        if (meta.beforeHour !== undefined && hour < meta.beforeHour) return true;
        if (meta.afterHour !== undefined && hour >= meta.afterHour) return true;
        if (meta.startHour !== undefined && meta.endHour !== undefined) {
            return hour >= meta.startHour && hour < meta.endHour;
        }
        return false;
    },

    /**
     * Increment progress for a badge by 1.
     */
    async incrementProgress(badgeId: string): Promise<number> {
        const now = new Date().toISOString();

        // Get current value
        const row = await db.getFirstAsync<{ current_value: number }>(
            'SELECT current_value FROM badge_progress WHERE badge_id = ?',
            [badgeId]
        );

        const newValue = (row?.current_value || 0) + 1;

        await db.runAsync(
            `INSERT INTO badge_progress (badge_id, current_value, last_updated)
       VALUES (?, ?, ?)
       ON CONFLICT(badge_id) DO UPDATE SET
       current_value = ?, last_updated = ?`,
            [badgeId, newValue, now, newValue, now]
        );

        return newValue;
    },

    /**
     * Update absolute progress value.
     */
    async updateProgress(badgeId: string, value: number, meta?: any): Promise<void> {
        const now = new Date().toISOString();
        const metaStr = meta ? JSON.stringify(meta) : null;

        await db.runAsync(
            `INSERT INTO badge_progress (badge_id, current_value, meta, last_updated)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(badge_id) DO UPDATE SET
       current_value = ?, meta = COALESCE(?, meta), last_updated = ?`,
            [badgeId, value, metaStr, now, value, metaStr, now]
        );
    },

    /**
     * Mark a badge as unlocked in the database.
     */
    async unlockBadge(badgeId: string): Promise<void> {
        const now = new Date().toISOString();

        await db.runAsync(
            'INSERT INTO user_badges (badge_id, unlocked_at, is_seen) VALUES (?, ?, 0)',
            [badgeId, now]
        );
    },

    /**
     * Get all badges with their status (locked/unlocked) and progress.
     */
    async getBadges() {
        const userBadges = await db.getAllAsync<UserBadge>('SELECT * FROM user_badges');
        const progress = await db.getAllAsync<BadgeProgress>('SELECT * FROM badge_progress');

        const unlockedMap = new Map(userBadges.map(b => [b.badge_id, b]));
        const progressMap = new Map(progress.map(p => [p.badge_id, p]));

        return BADGES.map(badge => {
            const userBadge = unlockedMap.get(badge.id);
            const prog = progressMap.get(badge.id);

            return {
                ...badge,
                isUnlocked: !!userBadge,
                unlockedAt: userBadge?.unlocked_at,
                isSeen: !!userBadge?.is_seen,
                progress: prog?.current_value || 0,
                progressMeta: prog?.meta ? JSON.parse(prog.meta) : null,
            };
        });
    },

    /**
     * Mark badges as seen.
     */
    async markAsSeen(badgeIds: string[]): Promise<void> {
        if (badgeIds.length === 0) return;
        const placeholders = badgeIds.map(() => '?').join(',');
        await db.runAsync(
            `UPDATE user_badges SET is_seen = 1 WHERE badge_id IN (${placeholders})`,
            badgeIds
        );
    },

    /**
     * DEBUG ONLY: Seed mock unlocked badges
     */
    async seedMockBadges(): Promise<void> {
        const now = new Date().toISOString();
        const badgesToUnlock = BADGES.slice(0, 50);

        for (const badge of badgesToUnlock) {
            await db.runAsync(
                `INSERT OR IGNORE INTO user_badges (badge_id, unlocked_at, is_seen) 
                 VALUES (?, ?, 0)`,
                [badge.id, now]
            );
        }
    }
};
