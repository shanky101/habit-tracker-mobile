import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { BadgeDefinition } from '../types/badges';
import { BadgeService, BadgeEventType, BadgeEventContext } from '../services/BadgeService';

// ============================================
// TYPES
// ============================================

export interface BadgeState extends BadgeDefinition {
    isUnlocked: boolean;
    unlockedAt?: string;
    isSeen: boolean;
    progress: number;
    progressMeta?: any;
}

interface BadgeStoreState {
    badges: BadgeState[];
    unseenCount: number;
    isLoading: boolean;
}

interface BadgeStoreActions {
    refreshBadges: () => Promise<void>;
    checkUnlock: (eventType: BadgeEventType, context: BadgeEventContext) => Promise<BadgeDefinition[]>;
    markAsSeen: (badgeIds: string[]) => Promise<void>;
    seedMockBadges: () => Promise<void>;
}

export type BadgeStore = BadgeStoreState & BadgeStoreActions;

// ============================================
// STORE FACTORY
// ============================================

/**
 * Create a badge store with your BadgeService instance and optional storage.
 * 
 * @param badgeService - Badge service instance created with createBadgeService()
 * @param storage - Optional Zustand storage adapter (default: localStorage for web, AsyncStorage for RN)
 * 
 * @example
 * // In your app:
 * import { createBadgeService, createBadgeStore } from '@app-core/achievements';
 * 
 * const badgeService = createBadgeService(myDatabaseAdapter);
 * export const useBadgeStore = createBadgeStore(badgeService, mySQLiteStorage);
 */
export function createBadgeStore(
    badgeService: BadgeService,
    storage?: StateStorage
) {
    return create<BadgeStore>()(
        persist(
            (set, get) => ({
                badges: [],
                unseenCount: 0,
                isLoading: false,

                refreshBadges: async () => {
                    set({ isLoading: true });
                    try {
                        const badges = await badgeService.getBadges();
                        const unseenCount = badges.filter(b => b.isUnlocked && !b.isSeen).length;
                        set({ badges, unseenCount, isLoading: false });
                    } catch (error) {
                        console.error('Failed to refresh badges:', error);
                        set({ isLoading: false });
                    }
                },

                checkUnlock: async (eventType, context) => {
                    try {
                        const newBadges = await badgeService.checkUnlock(eventType, context);

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
                        await badgeService.markAsSeen(badgeIds);

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
                        await badgeService.seedMockBadges();
                        await get().refreshBadges();
                    } catch (error) {
                        console.error('Failed to seed mock badges:', error);
                    }
                },
            }),
            {
                name: 'badge-storage',
                storage: storage ? createJSONStorage(() => storage) : undefined,
                onRehydrateStorage: () => (state) => {
                    // Refresh from DB on hydration to ensure sync
                    state?.refreshBadges();
                },
            }
        )
    );
}
