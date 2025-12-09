import AsyncStorage from '@react-native-async-storage/async-storage';
import { templateRepository } from '@/data/repositories/templateRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { HabitTemplate } from '@/types/HabitTemplate';
import { db } from '@/data/database/client';

// AsyncStorage keys to migrate
const ASYNC_STORAGE_KEYS = {
    TEMPLATES: '@habit_tracker_templates',
    VACATION_MODE: '@habit_tracker_vacation_mode',
    VACATION_HISTORY: '@habit_tracker_vacation_history',
    USER_NAME: '@habit_tracker_user_name',
    USER_EMAIL: '@habit_tracker_user_email',
    MIGRATION_COMPLETE: '@habit_tracker_migration_v1_complete',
};

/**
 * Check if migration has already been completed
 */
export const isMigrationComplete = async (): Promise<boolean> => {
    try {
        const completed = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.MIGRATION_COMPLETE);
        return completed === 'true';
    } catch (error) {
        console.error('[Migration] Error checking migration status:', error);
        return false;
    }
};

/**
 * Migrate templates from AsyncStorage to SQLite
 */
const migrateTemplates = async (): Promise<number> => {
    try {
        const stored = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.TEMPLATES);
        if (!stored) {
            console.log('[Migration] No templates to migrate');
            return 0;
        }

        const templates: HabitTemplate[] = JSON.parse(stored);
        const userTemplates = templates.filter(t => !t.isDefault);

        if (userTemplates.length === 0) {
            console.log('[Migration] No user templates to migrate');
            return 0;
        }


        // Insert each template into SQLite with defaults for missing fields
        for (const template of userTemplates) {
            // Ensure all required fields exist with defaults
            // Cast to any to access potential old fields
            const oldTemplate = template as any;

            const normalizedTemplate: HabitTemplate = {
                ...template,
                version: template.version || '1.0',
                description: template.description || '',
                notes: template.notes || undefined,
                author: template.author || undefined,
                // Map old category to tags if tags missing
                tags: template.tags || (oldTemplate.category ? [oldTemplate.category] : ['custom']),
                type: template.type || 'build',
                difficulty: template.difficulty || 'medium',
                duration: template.duration || 'Ongoing',
                benefits: template.benefits || [],
                outcomes: template.outcomes || [],
                timeline: template.timeline || [],
                emoji: template.emoji || '📝',
                color: template.color || '#6366F1',
                habits: template.habits || [],
                createdAt: template.createdAt || new Date().toISOString(),
            };
            await templateRepository.create(normalizedTemplate);
        }


        console.log(`[Migration] Migrated ${userTemplates.length} templates`);
        return userTemplates.length;
    } catch (error) {
        console.error('[Migration] Template migration failed:', error);
        throw error;
    }
};

/**
 * Migrate vacation data from AsyncStorage to SQLite
 */
const migrateVacationData = async (): Promise<number> => {
    try {
        const historyStored = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.VACATION_HISTORY);

        if (!historyStored) {
            console.log('[Migration] No vacation history to migrate');
            return 0;
        }

        interface OldVacationInterval {
            startDate: string;
            endDate: string | null;
        }

        const history: OldVacationInterval[] = JSON.parse(historyStored);

        if (history.length === 0) {
            console.log('[Migration] No vacation intervals to migrate');
            return 0;
        }

        // Insert each interval into SQLite
        for (const interval of history) {
            await userRepository.addVacationInterval({
                startDate: interval.startDate,
                endDate: interval.endDate || undefined,
            });
        }

        console.log(`[Migration] Migrated ${history.length} vacation intervals`);
        return history.length;
    } catch (error) {
        console.error('[Migration] Vacation data migration failed:', error);
        throw error;
    }
};

/**
 * Migrate user profile from AsyncStorage to SQLite
 */
const migrateUserProfile = async (): Promise<boolean> => {
    try {
        const name = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.USER_NAME);
        const email = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.USER_EMAIL);

        if (!name && !email) {
            console.log('[Migration] No user profile to migrate');
            return false;
        }

        await userRepository.updateProfile({
            name: name || undefined,
            email: email || undefined,
        });

        console.log('[Migration] Migrated user profile');
        return true;
    } catch (error) {
        console.error('[Migration] User profile migration failed:', error);
        throw error;
    }
};

/**
 * Clean up old AsyncStorage keys after successful migration
 */
const cleanupAsyncStorage = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            ASYNC_STORAGE_KEYS.TEMPLATES,
            ASYNC_STORAGE_KEYS.VACATION_MODE,
            ASYNC_STORAGE_KEYS.VACATION_HISTORY,
            ASYNC_STORAGE_KEYS.USER_NAME,
            ASYNC_STORAGE_KEYS.USER_EMAIL,
        ]);
        console.log('[Migration] AsyncStorage cleanup complete');
    } catch (error) {
        console.error('[Migration] AsyncStorage cleanup failed:', error);
        // Don't throw - cleanup failure is not critical
    }
};

/**
 * Mark migration as complete
 */
const markMigrationComplete = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.MIGRATION_COMPLETE, 'true');

        // Also mark in SQLite for redundancy
        db.runSync(
            'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
            ['migration_v1_complete', 'true']
        );

        console.log('[Migration] Marked migration as complete');
    } catch (error) {
        console.error('[Migration] Failed to mark migration complete:', error);
        throw error;
    }
};

/**
 * Run the full migration process
 * This should be called once on app startup before any stores are hydrated
 */
export const runAsyncStorageMigration = async (): Promise<{
    success: boolean;
    templatesCount: number;
    vacationCount: number;
    profileMigrated: boolean;
    error?: string;
}> => {
    try {
        console.log('[Migration] Starting AsyncStorage to SQLite migration...');

        // Check if already migrated
        const alreadyMigrated = await isMigrationComplete();
        if (alreadyMigrated) {
            console.log('[Migration] Already completed, skipping');
            return {
                success: true,
                templatesCount: 0,
                vacationCount: 0,
                profileMigrated: false,
            };
        }

        // Run migrations
        let templatesCount = 0;
        let vacationCount = 0;
        let profileMigrated = false;

        try {
            templatesCount = await migrateTemplates();
        } catch (error) {
            console.error('[Migration] Template migration failed, continuing...', error);
        }

        try {
            vacationCount = await migrateVacationData();
        } catch (error) {
            console.error('[Migration] Vacation migration failed, continuing...', error);
        }

        try {
            profileMigrated = await migrateUserProfile();
        } catch (error) {
            console.error('[Migration] Profile migration failed, continuing...', error);
        }

        // Mark as complete even if some migrations failed
        await markMigrationComplete();

        // Clean up old keys
        await cleanupAsyncStorage();

        console.log('[Migration] Migration complete!', {
            templatesCount,
            vacationCount,
            profileMigrated,
        });

        return {
            success: true,
            templatesCount,
            vacationCount,
            profileMigrated,
        };
    } catch (error) {
        console.error('[Migration] Migration failed:', error);
        return {
            success: false,
            templatesCount: 0,
            vacationCount: 0,
            profileMigrated: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

/**
 * Force reset migration (for testing only)
 */
export const resetMigration = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.MIGRATION_COMPLETE);
        db.runSync('DELETE FROM app_metadata WHERE key = ?', ['migration_v1_complete']);
        console.log('[Migration] Migration reset complete');
    } catch (error) {
        console.error('[Migration] Reset failed:', error);
        throw error;
    }
};
