import * as SQLite from 'expo-sqlite';

// Database name
const DATABASE_NAME = 'habits_v2.db';

// Open or create database
export const db = SQLite.openDatabaseSync(DATABASE_NAME);

/**
 * Enable foreign key constraints
 * Called during database initialization, not at module load
 */
export const enableForeignKeys = (): void => {
  try {
    db.execSync('PRAGMA foreign_keys = ON;');
    console.log('[DB] Foreign key constraints enabled');
  } catch (error) {
    console.error('[DB] Failed to enable foreign keys:', error);
    // Don't throw - this shouldn't crash the app
  }
};
