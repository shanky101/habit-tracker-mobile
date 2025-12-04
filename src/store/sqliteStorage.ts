import { StateStorage } from 'zustand/middleware';
import { habitRepository } from '../data/repositories';
import { initializeDatabase } from '../data/database/initialize';

// Track if database has been initialized
let dbInitialized = false;

/**
 * Ensure database is initialized before any operations
 */
const ensureDbInitialized = async (): Promise<void> => {
  if (!dbInitialized) {
    console.log('[SQLiteStorage] Initializing database on first access');
    await initializeDatabase();
    dbInitialized = true;
  }
};

/**
 * SQLite storage adapter for Zustand persist middleware
 * Implements the StateStorage interface required by Zustand
 */
export const sqliteStorage: StateStorage = {
  /**
   * Get item from SQLite database
   * Returns state as JSON string compatible with Zustand
   */
  getItem: async (name: string): Promise<string | null> => {
    try {
      // CRITICAL: Ensure database is initialized before any queries
      await ensureDbInitialized();

      console.log('[SQLiteStorage] getItem called');
      const habits = await habitRepository.getAll(true); // Include archived

      const state = {
        state: {
          habits,
          isHydrated: false, // Will be set to true after hydration
        },
        version: 1,
      };

      return JSON.stringify(state);
    } catch (error) {
      console.error('[SQLiteStorage] getItem error:', error);
      throw error; // Let it crash in dev for visibility
    }
  },

  /**
   * Set item to SQLite database
   * Receives state from Zustand as JSON string
   */
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      console.log('[SQLiteStorage] setItem called');
      const parsed = JSON.parse(value);
      const { state } = parsed;

      // Full sync to database
      await habitRepository.syncAll(state.habits);
    } catch (error) {
      console.error('[SQLiteStorage] setItem error:', error);
      throw error; // Let it crash in dev for visibility
    }
  },

  /**
   * Remove item from SQLite database
   * Clears all habit data
   */
  removeItem: async (name: string): Promise<void> => {
    try {
      console.log('[SQLiteStorage] removeItem called');
      await habitRepository.deleteAll();
    } catch (error) {
      console.error('[SQLiteStorage] removeItem error:', error);
      throw error; // Let it crash in dev for visibility
    }
  },
};
