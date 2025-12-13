/**
 * Badge Store Instance
 * 
 * Creates the app's badge store with badge service and storage adapter.
 */
import { createBadgeStore } from '@app-core/achievements';
import { BadgeService } from '../services/badges/BadgeService';
import { StateStorage } from 'zustand/middleware';

// SQLite storage adapter for Zustand
// Reusing the pattern from userStore
import { db } from '@/data/database/client';

export const sqliteStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            const result = await db.getFirstAsync<{ value: string }>(
                'SELECT value FROM zustand_storage WHERE key = ?',
                [name]
            );
            return result?.value || null;
        } catch {
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await db.runAsync(
            `INSERT INTO zustand_storage (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = ?`,
            [name, value, value]
        );
    },
    removeItem: async (name: string): Promise<void> => {
        await db.runAsync('DELETE FROM zustand_storage WHERE key = ?', [name]);
    },
};

// Create and export the badge store
export const useBadgeStore = createBadgeStore(BadgeService, sqliteStorage);
