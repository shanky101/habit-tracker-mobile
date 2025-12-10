import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BadgeDefinition } from '../types/badges';
import { BadgeService } from '../services/badges/BadgeService';
import { sqliteStorage } from './userStore'; // Reusing the existing SQLite storage adapter

export interface BadgeState extends BadgeDefinition {
    isUnlocked: boolean;
    unlockedAt?: string;
    isSeen: boolean;
    progress: number;
    progressMeta?: any;
}

interface BadgeStore {
    badges: BadgeState[];
    unseenCount: number;
    isLoading: boolean;

    // Actions
    refreshBadges: () => Promise<void>;
    checkUnlock: (
        eventType: 'habit_complete' | 'habit_create' | 'note_add' | 'mood_log' | 'share' | 'app_open',
        context: any
    ) => Promise<BadgeDefinition[]>;
    markAsSeen: (badgeIds: string[]) => Promise<void>;
    seedMockBadges: () => Promise<void>;
}

export const useBadgeStore = create<BadgeStore>()(
    persist(
        (set, get) => ({
            badges: [],
            unseenCount: 0,
            isLoading: false,

            refreshBadges: async () => {
                set({ isLoading: true });
                try {
                    const badges = await BadgeService.getBadges();
                    const unseenCount = badges.filter(b => b.isUnlocked && !b.isSeen).length;
                    set({ badges, unseenCount, isLoading: false });
                } catch (error) {
                    console.error('Failed to refresh badges:', error);
                    set({ isLoading: false });
                }
            },

            checkUnlock: async (eventType, context) => {
                try {
                    const newBadges = await BadgeService.checkUnlock(eventType, context);

                    if (newBadges.length > 0) {
                        // Refresh state to reflect new unlocks
                        await get().refreshBadges();
                    }

                    return newBadges;
                } catch (error) {
                    console.error('Failed to check badge unlocks:', error);
                    return [];
                }
            },

            markAsSeen: async (badgeIds) => {
                try {
                    await BadgeService.markAsSeen(badgeIds);

                    // Optimistic update
                    const badges = get().badges.map(b =>
                        badgeIds.includes(b.id) ? { ...b, isSeen: true } : b
                    );
                    const unseenCount = badges.filter(b => b.isUnlocked && !b.isSeen).length;

                    set({ badges, unseenCount });
                } catch (error) {
                    console.error('Failed to mark badges as seen:', error);
                }
            },

            seedMockBadges: async () => {
                try {
                    await BadgeService.seedMockBadges();
                    await get().refreshBadges();
                } catch (error) {
                    console.error('Failed to seed mock badges:', error);
                }
            },
        }),
        {
            name: 'badge-storage',
            storage: createJSONStorage(() => sqliteStorage),
            onRehydrateStorage: () => (state) => {
                // Refresh from DB on hydration to ensure sync
                state?.refreshBadges();
            },
        }
    )
);
