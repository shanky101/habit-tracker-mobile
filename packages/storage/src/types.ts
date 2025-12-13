import { StateStorage } from 'zustand/middleware';

/**
 * Generic repository interface for database operations
 */
export interface Repository<T> {
    getAll: (includeArchived?: boolean) => Promise<T[]>;
    syncAll: (items: T[]) => Promise<void>;
    deleteAll: () => Promise<void>;
}

/**
 * Configuration for creating SQLite storage
 */
export interface SQLiteStorageConfig<T> {
    repository: Repository<T>;
    initializeDatabase: () => Promise<void>;
    stateName?: string; // Key for the state object, defaults to 'items'
}

/**
 * State structure expected by storage
 */
export interface StorageState<T> {
    state: any; // Allow mixed types for flexibility with isHydrated boolean
    version: number;
}
