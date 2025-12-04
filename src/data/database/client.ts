import * as SQLite from 'expo-sqlite';

// Database name
const DATABASE_NAME = 'habits.db';

// Open or create database
export const db = SQLite.openDatabaseSync(DATABASE_NAME);

// Enable foreign key constraints
export const enableForeignKeys = () => {
  try {
    db.execSync('PRAGMA foreign_keys = ON;');
    console.log('[DB] Foreign key constraints enabled');
  } catch (error) {
    console.error('[DB] Failed to enable foreign keys:', error);
    throw error;
  }
};

// Enable foreign keys immediately
enableForeignKeys();
