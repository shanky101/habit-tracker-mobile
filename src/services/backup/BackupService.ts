import { Platform } from 'react-native';
import { iCloudBackup } from './iCloudBackup';
import { GoogleDriveBackup } from './GoogleDriveBackup';
import {
  BackupInfo,
  BackupResult,
  RestoreResult,
  ProgressCallback,
} from './types';

/**
 * BackupService - Unified API for backup/restore across platforms
 * Automatically delegates to iCloud (iOS) or Google Drive (Android)
 */
export class BackupService {
  /**
   * Initialize backup service
   * For Android, provide Google OAuth webClientId
   */
  static initialize(config?: { googleWebClientId?: string }): void {
    if (Platform.OS === 'android' && config?.googleWebClientId) {
      GoogleDriveBackup.configure(config.googleWebClientId);
    }
  }

  /**
   * Check if backup service is available
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return await iCloudBackup.isAvailable();
    } else if (Platform.OS === 'android') {
      return await GoogleDriveBackup.isAvailable();
    }
    return false;
  }

  /**
   * Sign in (Android only - Google Sign-In)
   */
  static async signIn(): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS === 'android') {
      return await GoogleDriveBackup.signIn();
    }
    // iOS uses iCloud automatically, no sign-in needed
    return { success: true };
  }

  /**
   * Sign out (Android only)
   */
  static async signOut(): Promise<void> {
    if (Platform.OS === 'android') {
      await GoogleDriveBackup.signOut();
    }
  }

  /**
   * Create a new backup
   */
  static async createBackup(onProgress?: ProgressCallback): Promise<BackupResult> {
    if (Platform.OS === 'ios') {
      return await iCloudBackup.createBackup(onProgress);
    } else if (Platform.OS === 'android') {
      return await GoogleDriveBackup.createBackup(onProgress);
    }
    return {
      success: false,
      error: 'Backup not supported on this platform',
    };
  }

  /**
   * List all available backups
   */
  static async listBackups(): Promise<BackupInfo[]> {
    if (Platform.OS === 'ios') {
      return await iCloudBackup.listBackups();
    } else if (Platform.OS === 'android') {
      return await GoogleDriveBackup.listBackups();
    }
    return [];
  }

  /**
   * Restore from a backup
   */
  static async restoreBackup(
    backupId: string,
    onProgress?: ProgressCallback
  ): Promise<RestoreResult> {
    if (Platform.OS === 'ios') {
      return await iCloudBackup.restoreBackup(backupId, onProgress);
    } else if (Platform.OS === 'android') {
      return await GoogleDriveBackup.restoreBackup(backupId, onProgress);
    }
    return {
      success: false,
      error: 'Restore not supported on this platform',
    };
  }

  /**
   * Delete a backup
   */
  static async deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS === 'ios') {
      return await iCloudBackup.deleteBackup(backupId);
    } else if (Platform.OS === 'android') {
      return await GoogleDriveBackup.deleteBackup(backupId);
    }
    return {
      success: false,
      error: 'Delete not supported on this platform',
    };
  }

  /**
   * Get storage information
   */
  static async getStorageInfo(): Promise<{ size: string; count: number }> {
    if (Platform.OS === 'ios') {
      return await iCloudBackup.getStorageUsed();
    } else if (Platform.OS === 'android') {
      // Google Drive doesn't have this method yet, return backups count
      const backups = await GoogleDriveBackup.listBackups();
      return { size: '0 MB', count: backups.length };
    }
    return { size: '0 MB', count: 0 };
  }

  /**
   * Get current user info (Android only)
   */
  static async getUserInfo(): Promise<{ email?: string; name?: string } | null> {
    if (Platform.OS === 'android') {
      return await GoogleDriveBackup.getUserInfo();
    }
    // iOS doesn't expose iCloud user info easily
    return null;
  }

  /**
   * Get platform-specific backup provider name
   */
  static getProviderName(): string {
    if (Platform.OS === 'ios') {
      return 'iCloud';
    } else if (Platform.OS === 'android') {
      return 'Google Drive';
    }
    return 'Unknown';
  }
}
