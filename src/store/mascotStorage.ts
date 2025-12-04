import { StateStorage } from 'zustand/middleware';
import { mascotRepository } from '../data/repositories/mascotRepository';

/**
 * SQLite storage adapter for Mascot Zustand persist middleware
 * Implements the StateStorage interface required by Zustand
 */
export const mascotStorage: StateStorage = {
  /**
   * Get mascot customization from SQLite database
   * Returns state as JSON string compatible with Zustand
   */
  getItem: async (name: string): Promise<string | null> => {
    try {
      console.log('[MascotStorage] getItem called');
      const customization = await mascotRepository.getCustomization();

      const state = {
        state: {
          customization,
          isHydrated: false, // Will be set to true after hydration
        },
        version: 1,
      };

      return JSON.stringify(state);
    } catch (error) {
      console.error('[MascotStorage] getItem error:', error);
      throw error; // Let it crash in dev for visibility
    }
  },

  /**
   * Set mascot customization to SQLite database
   * Receives state from Zustand as JSON string
   */
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      console.log('[MascotStorage] setItem called');
      const parsed = JSON.parse(value);
      const { state } = parsed;

      await mascotRepository.saveCustomization(state.customization);
    } catch (error) {
      console.error('[MascotStorage] setItem error:', error);
      throw error; // Let it crash in dev for visibility
    }
  },

  /**
   * Remove mascot customization from SQLite database
   * Resets to default customization
   */
  removeItem: async (name: string): Promise<void> => {
    try {
      console.log('[MascotStorage] removeItem called');
      await mascotRepository.resetToDefault();
    } catch (error) {
      console.error('[MascotStorage] removeItem error:', error);
      throw error; // Let it crash in dev for visibility
    }
  },
};
