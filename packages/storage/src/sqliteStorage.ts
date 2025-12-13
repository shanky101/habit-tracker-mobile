import { StateStorage } from 'zustand/middleware';
import { SQLiteStorageConfig, StorageState } from './types';

/**
 * Creates a SQLite storage adapter for Zustand persist middleware
 * 
 * @param config Configuration object with repository and database initializer
 * @returns StateStorage compatible with Zustand
 */
export function createSQLiteStorage<T>(
    config: SQLiteStorageConfig<T>
): StateStorage {
    const { repository, initializeDatabase, stateName = 'items' } = config;

    // Track if database has been initialized
    let dbInitialized = false;
    let dbInitializing = false;

    /**
     * Ensure database is initialized before any operations
     * Uses a flag to prevent race conditions with multiple calls
     */
    const ensureDbInitialized = async (): Promise<void> => {
        if (dbInitialized) return;

        // Prevent multiple simultaneous initializations
        if (dbInitializing) {
            // Wait for existing initialization to complete
            while (dbInitializing) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            return;
        }

        dbInitializing = true;
        try {
            console.log('[SQLiteStorage] Initializing database on first access');
            await initializeDatabase();
            dbInitialized = true;
        } catch (error) {
            console.error('[SQLiteStorage] Database initialization failed:', error);
            // Reset flag so it can be retried
            dbInitializing = false;
            throw error;
        }
        dbInitializing = false;
    };

    return {
        /**
         * Get item from SQLite database
         * Returns state as JSON string compatible with Zustand
         */
        getItem: async (name: string): Promise<string | null> => {
            try {
                // CRITICAL: Ensure database is initialized before any queries
                await ensureDbInitialized();

                console.log('[SQLiteStorage] getItem called');
                const items = await repository.getAll(true); // Include archived

                const state: StorageState<T> = {
                    state: {
                        [stateName]: items,
                        isHydrated: false, // Will be set to true after hydration
                    },
                    version: 1,
                };

                return JSON.stringify(state);
            } catch (error) {
                console.error('[SQLiteStorage] getItem error:', error);
                // Return empty state instead of crashing
                return JSON.stringify({
                    state: {
                        [stateName]: [],
                        isHydrated: false,
                    },
                    version: 1,
                });
            }
        },

        /**
         * Set item to SQLite database
         * Receives state from Zustand as JSON string
         */
        setItem: async (name: string, value: string): Promise<void> => {
            try {
                // Ensure DB is ready
                await ensureDbInitialized();

                console.log('[SQLiteStorage] setItem called');
                const parsed = JSON.parse(value);
                const { state } = parsed;

                if (!state?.[stateName] || !Array.isArray(state[stateName])) {
                    console.warn('[SQLiteStorage] Invalid state, skipping sync');
                    return;
                }

                // Full sync to database
                await repository.syncAll(state[stateName]);
            } catch (error) {
                console.error('[SQLiteStorage] setItem error:', error);
                // Don't throw - this would crash the app on every state change
            }
        },

        /**
         * Remove item from SQLite database
         * Clears all data
         */
        removeItem: async (name: string): Promise<void> => {
            try {
                await ensureDbInitialized();
                console.log('[SQLiteStorage] removeItem called');
                await repository.deleteAll();
            } catch (error) {
                console.error('[SQLiteStorage] removeItem error:', error);
                // Don't throw
            }
        },
    };
}
