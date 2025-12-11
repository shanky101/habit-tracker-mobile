import { createSQLiteStorage } from '@app-core/storage';
import { habitRepository } from '../data/repositories';
import { initializeDatabase } from '../data/database/initialize';

/**
 * SQLite storage adapter for habit store using the @app-core/storage package
 */
export const sqliteStorage = createSQLiteStorage({
  repository: habitRepository,
  initializeDatabase,
  stateName: 'habits',
});
