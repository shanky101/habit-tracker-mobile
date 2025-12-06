import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { BackupService } from './BackupService';
import { db } from '@/data/database/client';

const BACKGROUND_BACKUP_TASK = 'BACKGROUND_BACKUP_TASK';

/**
 * AutomaticBackup - Manages automatic daily backups for premium users
 */
export class AutomaticBackup {
  /**
   * Register background task
   */
  static registerBackgroundTask(): void {
    TaskManager.defineTask(BACKGROUND_BACKUP_TASK, async () => {
      try {
        console.log('[AutomaticBackup] Background task started');

        // Check if automatic backup is enabled
        const enabled = await this.isEnabled();
        if (!enabled) {
          console.log('[AutomaticBackup] Automatic backup disabled, skipping');
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Check if backup service is available
        const available = await BackupService.isAvailable();
        if (!available) {
          console.log('[AutomaticBackup] Backup service not available');
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }

        // Create backup
        const result = await BackupService.createBackup();

        if (result.success) {
          // Update last backup timestamp
          await this.updateLastBackupTime();
          console.log('[AutomaticBackup] Automatic backup successful');
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } else {
          console.error('[AutomaticBackup] Automatic backup failed:', result.error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      } catch (error) {
        console.error('[AutomaticBackup] Background task error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
  }

  /**
   * Enable automatic backups
   */
  static async enable(): Promise<{ success: boolean; error?: string }> {
    try {
      // Register the task first
      this.registerBackgroundTask();

      // Register background fetch
      await BackgroundFetch.registerTaskAsync(BACKGROUND_BACKUP_TASK, {
        minimumInterval: 24 * 60 * 60, // 24 hours (daily)
        stopOnTerminate: false,
        startOnBoot: true,
      });

      // Save enabled state
      db.runSync(
        'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
        ['auto_backup_enabled', 'true']
      );

      console.log('[AutomaticBackup] Enabled automatic backups');

      return { success: true };
    } catch (error) {
      console.error('[AutomaticBackup] Failed to enable:', error);
      return {
        success: false,
        error: `Failed to enable automatic backups: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Disable automatic backups
   */
  static async disable(): Promise<{ success: boolean; error?: string }> {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_BACKUP_TASK);

      // Save disabled state
      db.runSync(
        'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
        ['auto_backup_enabled', 'false']
      );

      console.log('[AutomaticBackup] Disabled automatic backups');

      return { success: true };
    } catch (error) {
      console.error('[AutomaticBackup] Failed to disable:', error);
      return {
        success: false,
        error: `Failed to disable automatic backups: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check if automatic backups are enabled
   */
  static async isEnabled(): Promise<boolean> {
    try {
      const result = db.getFirstSync<{ value: string }>(
        'SELECT value FROM app_metadata WHERE key = ?',
        ['auto_backup_enabled']
      );

      return result?.value === 'true';
    } catch (error) {
      console.error('[AutomaticBackup] Failed to check enabled status:', error);
      return false;
    }
  }

  /**
   * Check if background fetch is registered
   */
  static async isRegistered(): Promise<boolean> {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_BACKUP_TASK);

      return (
        isRegistered &&
        status === BackgroundFetch.BackgroundFetchStatus.Available
      );
    } catch (error) {
      console.error('[AutomaticBackup] Failed to check registration:', error);
      return false;
    }
  }

  /**
   * Get last backup timestamp
   */
  static async getLastBackupTime(): Promise<Date | null> {
    try {
      const result = db.getFirstSync<{ value: string }>(
        'SELECT value FROM app_metadata WHERE key = ?',
        ['last_backup']
      );

      if (!result?.value) return null;

      return new Date(result.value);
    } catch (error) {
      console.error('[AutomaticBackup] Failed to get last backup time:', error);
      return null;
    }
  }

  /**
   * Update last backup timestamp
   */
  private static async updateLastBackupTime(): Promise<void> {
    try {
      const now = new Date().toISOString();
      db.runSync(
        'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
        ['last_backup', now]
      );
    } catch (error) {
      console.error('[AutomaticBackup] Failed to update last backup time:', error);
    }
  }

  /**
   * Manually trigger a backup (for testing)
   */
  static async triggerManualBackup(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[AutomaticBackup] Manually triggering backup...');

      const result = await BackupService.createBackup();

      if (result.success) {
        await this.updateLastBackupTime();
      }

      return result;
    } catch (error) {
      console.error('[AutomaticBackup] Manual backup failed:', error);
      return {
        success: false,
        error: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get backup frequency description
   */
  static getFrequencyDescription(): string {
    return 'Daily (every 24 hours)';
  }
}
