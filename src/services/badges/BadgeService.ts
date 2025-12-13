/**
 * Badge Service Instance
 * 
 * Creates the app's badge service with database adapter.
 */
import { createBadgeService, BadgeDatabase } from '@app-core/achievements';
import { db } from '@/data/database/client';

// Create database adapter that matches BadgeDatabase interface
const badgeDatabaseAdapter: BadgeDatabase = {
    async getAllAsync<T>(query: string, params: any[] = []): Promise<T[]> {
        return db.getAllAsync<T>(query, params);
    },

    async getFirstAsync<T>(query: string, params: any[] = []): Promise<T | null> {
        return db.getFirstAsync<T>(query, params);
    },

    async runAsync(query: string, params: any[] = []): Promise<void> {
        await db.runAsync(query, params);
        // Return void - discard the SQLiteRunResult
    }
};

// Create and export the badge service instance
export const BadgeService = createBadgeService(badgeDatabaseAdapter);
