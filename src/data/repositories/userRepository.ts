import { db } from '../database/client';

export interface UserProfile {
    name?: string;
    email?: string;
}

export interface VacationInterval {
    id?: number;
    startDate: string;
    endDate?: string | null;
    createdAt?: string;
}

interface UserProfileRow {
    id: string;
    name: string | null;
    email: string | null;
    created_at: string;
    updated_at: string;
}

interface VacationIntervalRow {
    id: number;
    start_date: string;
    end_date: string | null;
    created_at: string;
}

/**
 * Repository for user data access
 */
export const userRepository = {
    /**
     * Get user profile
     */
    getProfile: async (): Promise<UserProfile> => {
        try {
            const row = db.getFirstSync<UserProfileRow>(
                "SELECT * FROM user_profile WHERE id = 'default'"
            );

            return {
                name: row?.name || undefined,
                email: row?.email || undefined,
            };
        } catch (error) {
            console.error('[UserRepository] getProfile failed:', error);
            return {};
        }
    },

    /**
     * Update user profile
     */
    updateProfile: async (profile: UserProfile): Promise<void> => {
        try {
            const now = new Date().toISOString();

            // Check if profile exists
            const existing = db.getFirstSync<UserProfileRow>(
                "SELECT * FROM user_profile WHERE id = 'default'"
            );

            if (existing) {
                db.runSync(
                    `UPDATE user_profile SET name = ?, email = ?, updated_at = ? WHERE id = 'default'`,
                    [profile.name || null, profile.email || null, now]
                );
            } else {
                db.runSync(
                    `INSERT INTO user_profile (id, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
                    ['default', profile.name || null, profile.email || null, now, now]
                );
            }
            console.log('[UserRepository] Profile updated');
        } catch (error) {
            console.error('[UserRepository] updateProfile failed:', error);
            throw error;
        }
    },

    /**
     * Get all vacation intervals
     */
    getVacationIntervals: async (): Promise<VacationInterval[]> => {
        try {
            const rows = db.getAllSync<VacationIntervalRow>(
                'SELECT * FROM vacation_intervals ORDER BY start_date DESC'
            );

            return rows.map(row => ({
                id: row.id,
                startDate: row.start_date,
                endDate: row.end_date || undefined,
                createdAt: row.created_at,
            }));
        } catch (error) {
            console.error('[UserRepository] getVacationIntervals failed:', error);
            return [];
        }
    },

    /**
     * Add a vacation interval
     */
    addVacationInterval: async (interval: Omit<VacationInterval, 'id' | 'createdAt'>): Promise<void> => {
        try {
            const now = new Date().toISOString();
            db.runSync(
                'INSERT INTO vacation_intervals (start_date, end_date, created_at) VALUES (?, ?, ?)',
                [interval.startDate, interval.endDate || null, now]
            );
            console.log('[UserRepository] Vacation interval added');
        } catch (error) {
            console.error('[UserRepository] addVacationInterval failed:', error);
            throw error;
        }
    },

    /**
     * Update a vacation interval (typically to set end_date)
     */
    updateVacationInterval: async (id: number, endDate: string): Promise<void> => {
        try {
            db.runSync(
                'UPDATE vacation_intervals SET end_date = ? WHERE id = ?',
                [endDate, id]
            );
            console.log('[UserRepository] Vacation interval updated:', id);
        } catch (error) {
            console.error('[UserRepository] updateVacationInterval failed:', error);
            throw error;
        }
    },

    /**
     * Delete a vacation interval
     */
    deleteVacationInterval: async (id: number): Promise<void> => {
        try {
            db.runSync('DELETE FROM vacation_intervals WHERE id = ?', [id]);
            console.log('[UserRepository] Vacation interval deleted:', id);
        } catch (error) {
            console.error('[UserRepository] deleteVacationInterval failed:', error);
            throw error;
        }
    },

    /**
     * Sync vacation intervals (for Zustand persist)
     */
    syncVacationIntervals: async (intervals: VacationInterval[]): Promise<void> => {
        try {
            db.withTransactionSync(() => {
                db.runSync('DELETE FROM vacation_intervals');

                const now = new Date().toISOString();
                intervals.forEach(interval => {
                    db.runSync(
                        'INSERT INTO vacation_intervals (start_date, end_date, created_at) VALUES (?, ?, ?)',
                        [interval.startDate, interval.endDate || null, interval.createdAt || now]
                    );
                });
            });
            console.log(`[UserRepository] Synced ${intervals.length} vacation intervals`);
        } catch (error) {
            console.error('[UserRepository] syncVacationIntervals failed:', error);
        }
    },

    /**
     * Delete all vacation intervals
     */
    deleteAllVacationIntervals: async (): Promise<void> => {
        try {
            db.runSync('DELETE FROM vacation_intervals');
            console.log('[UserRepository] All vacation intervals deleted');
        } catch (error) {
            console.error('[UserRepository] deleteAllVacationIntervals failed:', error);
            throw error;
        }
    },
};
