import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { DataExporter } from './DataExporter';
import { DataImporter } from './DataImporter';
import {
  BackupData,
  BackupInfo,
  BackupResult,
  RestoreResult,
  ProgressCallback,
} from './types';

/**
 * iCloudBackup - Backup and restore to iCloud Drive (iOS only)
 */
export class iCloudBackup {
  // iCloud Documents directory
  private static readonly ICLOUD_DIR = `${FileSystem.documentDirectory}../Library/Mobile Documents/iCloud~com~habittracker~mobile/Documents`;
  private static readonly BACKUP_FOLDER = 'habitTrackerBackups';

  /**
   * Check if iCloud is available
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      // Check if iCloud directory exists
      const dirInfo = await FileSystem.getInfoAsync(this.ICLOUD_DIR);
      return dirInfo.exists;
    } catch (error) {
      console.error('[iCloudBackup] iCloud not available:', error);
      return false;
    }
  }

  /**
   * Ensure backup folder exists
   */
  private static async ensureBackupFolder(): Promise<string> {
    const backupPath = `${this.ICLOUD_DIR}/${this.BACKUP_FOLDER}`;

    try {
      const dirInfo = await FileSystem.getInfoAsync(backupPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(backupPath, { intermediates: true });
        console.log('[iCloudBackup] Created backup folder:', backupPath);
      }
      return backupPath;
    } catch (error) {
      console.error('[iCloudBackup] Failed to create backup folder:', error);
      throw new Error('Failed to access iCloud storage');
    }
  }

  /**
   * Create a new backup
   */
  static async createBackup(onProgress?: ProgressCallback): Promise<BackupResult> {
    try {
      // Check availability
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'iCloud is not available on this device',
        };
      }

      onProgress?.(0, 'Starting backup...');

      // Export data
      const backupData = await DataExporter.exportData((progress, message) => {
        onProgress?.(progress * 0.7, message); // 0-70%
      });

      onProgress?.(70, 'Saving to iCloud...');

      // Ensure backup folder exists
      const backupFolder = await this.ensureBackupFolder();

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}.json`;
      const filePath = `${backupFolder}/${filename}`;

      // Write backup file
      const jsonString = JSON.stringify(backupData, null, 2);
      await FileSystem.writeAsStringAsync(filePath, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      onProgress?.(100, 'Backup complete');

      console.log('[iCloudBackup] Backup created:', filePath);

      return {
        success: true,
        backupId: filename,
        message: 'Backup saved to iCloud',
      };
    } catch (error) {
      console.error('[iCloudBackup] Backup failed:', error);
      return {
        success: false,
        error: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * List all backups
   */
  static async listBackups(): Promise<BackupInfo[]> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        console.log('[iCloudBackup] iCloud not available');
        return [];
      }

      const backupFolder = await this.ensureBackupFolder();
      const files = await FileSystem.readDirectoryAsync(backupFolder);

      // Filter and parse backup files
      const backups: BackupInfo[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const filePath = `${backupFolder}/${file}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath, { size: true });

          if (!fileInfo.exists) continue;

          // Read backup metadata
          const content = await FileSystem.readAsStringAsync(filePath);
          const backupData: BackupData = JSON.parse(content);

          // Format size
          const sizeInMB = fileInfo.size ? (fileInfo.size / (1024 * 1024)).toFixed(2) : '0';
          const size = `${sizeInMB} MB`;

          backups.push({
            id: file,
            name: file.replace('.json', '').replace('backup_', ''),
            date: new Date(backupData.timestamp),
            size,
            habitCount: backupData.data.habits.length,
            platform: backupData.device.platform,
          });
        } catch (error) {
          console.error(`[iCloudBackup] Failed to read backup ${file}:`, error);
          // Skip invalid files
          continue;
        }
      }

      // Sort by date (newest first)
      backups.sort((a, b) => b.date.getTime() - a.date.getTime());

      return backups;
    } catch (error) {
      console.error('[iCloudBackup] Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Restore from a backup
   */
  static async restoreBackup(
    backupId: string,
    onProgress?: ProgressCallback
  ): Promise<RestoreResult> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'iCloud is not available on this device',
        };
      }

      onProgress?.(0, 'Loading backup...');

      // Read backup file
      const backupFolder = await this.ensureBackupFolder();
      const filePath = `${backupFolder}/${backupId}`;

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        return {
          success: false,
          error: 'Backup file not found',
        };
      }

      const content = await FileSystem.readAsStringAsync(filePath);
      const backupData: BackupData = JSON.parse(content);

      onProgress?.(20, 'Backup loaded');

      // Restore data
      const result = await DataImporter.restoreData(backupData, (progress, message) => {
        onProgress?.(20 + progress * 0.8, message); // 20-100%
      });

      return result;
    } catch (error) {
      console.error('[iCloudBackup] Restore failed:', error);
      return {
        success: false,
        error: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Delete a backup
   */
  static async deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'iCloud is not available on this device',
        };
      }

      const backupFolder = await this.ensureBackupFolder();
      const filePath = `${backupFolder}/${backupId}`;

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        return {
          success: false,
          error: 'Backup file not found',
        };
      }

      await FileSystem.deleteAsync(filePath);

      console.log('[iCloudBackup] Backup deleted:', backupId);

      return { success: true };
    } catch (error) {
      console.error('[iCloudBackup] Delete failed:', error);
      return {
        success: false,
        error: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get total backup storage size
   */
  static async getStorageUsed(): Promise<{ size: string; count: number }> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return { size: '0 MB', count: 0 };
      }

      const backupFolder = await this.ensureBackupFolder();
      const files = await FileSystem.readDirectoryAsync(backupFolder);

      let totalSize = 0;
      let count = 0;

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = `${backupFolder}/${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath, { size: true });

        if (fileInfo.exists && fileInfo.size) {
          totalSize += fileInfo.size;
          count++;
        }
      }

      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      return { size: `${sizeInMB} MB`, count };
    } catch (error) {
      console.error('[iCloudBackup] Failed to calculate storage:', error);
      return { size: '0 MB', count: 0 };
    }
  }
}
