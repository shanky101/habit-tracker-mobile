import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StateStorage } from 'zustand/middleware';
import { userRepository, UserProfile, VacationInterval } from '@/data/repositories/userRepository';
import { initializeDatabase } from '@/data/database/initialize';

// Track if database has been initialized
let dbInitialized = false;
let dbInitializing = false;

/**
 * Ensure database is initialized before any operations
 */
const ensureDbInitialized = async (): Promise<void> => {
    if (dbInitialized) return;

    if (dbInitializing) {
        while (dbInitializing) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return;
    }

    dbInitializing = true;
    try {
        console.log('[UserStorage] Initializing database');
        await initializeDatabase();
        dbInitialized = true;
    } catch (error) {
        console.error('[UserStorage] Database initialization failed:', error);
        dbInitializing = false;
        throw error;
    }
    dbInitializing = false;
};

/**
 * SQLite storage adapter for user store
 */
/**
 * SQLite storage adapter for user store
 */
export const sqliteStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            await ensureDbInitialized();
            console.log('[UserStorage] getItem called');

            const profile = await userRepository.getProfile();
            const vacationIntervals = await userRepository.getVacationIntervals();

            // Determine if vacation mode is currently ON
            const openInterval = vacationIntervals.find(interval => !interval.endDate);
            const isVacationMode = !!openInterval;

            const state = {
                state: {
                    profile,
                    vacationHistory: vacationIntervals,
                    isVacationMode,
                    isHydrated: false,
                },
                version: 1,
            };

            return JSON.stringify(state);
        } catch (error) {
            console.error('[UserStorage] getItem error:', error);
            return JSON.stringify({
                state: {
                    profile: {},
                    vacationHistory: [],
                    isVacationMode: false,
                    isHydrated: false,
                },
                version: 1,
            });
        }
    },

    setItem: async (name: string, value: string): Promise<void> => {
        try {
            await ensureDbInitialized();
            console.log('[UserStorage] setItem called');

            const parsed = JSON.parse(value);
            const { state } = parsed;

            if (!state) {
                console.warn('[UserStorage] Invalid state, skipping sync');
                return;
            }

            // Sync profile
            if (state.profile) {
                await userRepository.updateProfile(state.profile);
            }

            // Sync vacation intervals
            if (state.vacationHistory && Array.isArray(state.vacationHistory)) {
                await userRepository.syncVacationIntervals(state.vacationHistory);
            }
        } catch (error) {
            console.error('[UserStorage] setItem error:', error);
        }
    },

    removeItem: async (name: string): Promise<void> => {
        try {
            await ensureDbInitialized();
            console.log('[UserStorage] removeItem called');
            await userRepository.updateProfile({});
            await userRepository.deleteAllVacationIntervals();
        } catch (error) {
            console.error('[UserStorage] removeItem error:', error);
        }
    },
};

interface UserState {
    // State
    profile: UserProfile;
    vacationHistory: VacationInterval[];
    isVacationMode: boolean;
    isHydrated: boolean;

    // Actions
    updateProfile: (profile: UserProfile) => void;
    toggleVacationMode: () => void;
    setHydrated: () => void;
}

/**
 * User store with SQLite persistence
 * Manages user profile and vacation mode
 */
export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // Initial state
            profile: {},
            vacationHistory: [],
            isVacationMode: false,
            isHydrated: false,

            // Actions
            updateProfile: (profile: UserProfile) => {
                set({ profile });
            },

            toggleVacationMode: () => {
                const { isVacationMode, vacationHistory } = get();
                const today = new Date().toISOString().split('T')[0];
                let newHistory = [...vacationHistory];

                if (!isVacationMode) {
                    // Turning ON: Start a new interval
                    newHistory.push({
                        startDate: today,
                        endDate: undefined,
                    });
                } else {
                    // Turning OFF: End the last interval
                    const lastOpenIndex = newHistory.findIndex(interval => !interval.endDate);

                    if (lastOpenIndex >= 0) {
                        const lastInterval = newHistory[lastOpenIndex];

                        if (lastInterval.startDate === today) {
                            // If started today and ended today, just remove it
                            newHistory.splice(lastOpenIndex, 1);
                        } else {
                            // Otherwise, set end date to yesterday
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            const yesterdayStr = yesterday.toISOString().split('T')[0];

                            newHistory[lastOpenIndex] = {
                                ...lastInterval,
                                endDate: yesterdayStr,
                            };
                        }
                    }
                }

                set({
                    isVacationMode: !isVacationMode,
                    vacationHistory: newHistory,
                });
            },

            setHydrated: () => {
                set({ isHydrated: true });
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => sqliteStorage),
            onRehydrateStorage: () => (state) => {
                console.log('[UserStore] Hydration complete');
                if (state) {
                    state.setHydrated();
                }
            },
        }
    )
);
