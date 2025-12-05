import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GDrive } from '@robinbobin/react-native-google-drive-api-wrapper';
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
 * GoogleDriveBackup - Backup and restore to Google Drive (Android)
 */
export class GoogleDriveBackup {
  private static gdrive: GDrive | null = null;
  private static backupFolderId: string | null = null;
  private static readonly FOLDER_NAME = 'HabitTrackerBackups';

  /**
   * Configure Google Sign-In
   * Note: You need to set up OAuth credentials in Google Cloud Console
   */
  static configure(webClientId: string) {
    GoogleSignin.configure({
      webClientId,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
      offlineAccess: true,
    });
  }

  /**
   * Check if Google Drive is available and user is signed in
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      return isSignedIn;
    } catch (error) {
      console.error('[GoogleDriveBackup] Check availability failed:', error);
      return false;
    }
  }

  /**
   * Sign in to Google
   */
  static async signIn(): Promise<{ success: boolean; error?: string }> {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();

      // Initialize GDrive
      const tokens = await GoogleSignin.getTokens();
      this.gdrive = new GDrive();
      this.gdrive.accessToken = tokens.accessToken;

      return { success: true };
    } catch (error: any) {
      console.error('[GoogleDriveBackup] Sign in failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in to Google',
      };
    }
  }

  /**
   * Sign out from Google
   */
  static async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      this.gdrive = null;
      this.backupFolderId = null;
    } catch (error) {
      console.error('[GoogleDriveBackup] Sign out failed:', error);
    }
  }

  /**
   * Initialize GDrive client
   */
  private static async initializeGDrive(): Promise<void> {
    if (this.gdrive) return;

    try {
      const tokens = await GoogleSignin.getTokens();
      this.gdrive = new GDrive();
      this.gdrive.accessToken = tokens.accessToken;
    } catch (error) {
      console.error('[GoogleDriveBackup] Failed to initialize GDrive:', error);
      throw new Error('Failed to initialize Google Drive');
    }
  }

  /**
   * Get or create backup folder in Google Drive
   */
  private static async getBackupFolder(): Promise<string> {
    if (this.backupFolderId) {
      return this.backupFolderId;
    }

    await this.initializeGDrive();
    if (!this.gdrive) {
      throw new Error('Google Drive not initialized');
    }

    try {
      // Search for existing folder
      const query = `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const response = await this.gdrive.files
        .list({
          q: query,
          fields: 'files(id, name)',
        })
        .execute();

      if (response.files && response.files.length > 0) {
        this.backupFolderId = response.files[0].id;
        console.log('[GoogleDriveBackup] Found existing folder:', this.backupFolderId);
      } else {
        // Create folder
        const folderMetadata = {
          name: this.FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        };

        const folder = await this.gdrive.files
          .newMultipartUploader()
          .setData(folderMetadata, 'application/json')
          .execute();

        this.backupFolderId = folder.id;
        console.log('[GoogleDriveBackup] Created folder:', this.backupFolderId);
      }

      return this.backupFolderId!;
    } catch (error) {
      console.error('[GoogleDriveBackup] Failed to get/create folder:', error);
      throw new Error('Failed to access backup folder');
    }
  }

  /**
   * Create a new backup
   */
  static async createBackup(onProgress?: ProgressCallback): Promise<BackupResult> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Google Drive is not available. Please sign in first.',
        };
      }

      onProgress?.(0, 'Starting backup...');

      // Export data
      const backupData = await DataExporter.exportData((progress, message) => {
        onProgress?.(progress * 0.6, message); // 0-60%
      });

      onProgress?.(60, 'Uploading to Google Drive...');

      // Get backup folder
      const folderId = await this.getBackupFolder();

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}.json`;

      // Upload file
      const jsonString = JSON.stringify(backupData, null, 2);

      await this.initializeGDrive();
      if (!this.gdrive) {
        throw new Error('Google Drive not initialized');
      }

      const fileMetadata = {
        name: filename,
        parents: [folderId],
      };

      const file = await this.gdrive.files
        .newMultipartUploader()
        .setData(fileMetadata, 'application/json')
        .setContent(jsonString, 'application/json')
        .execute();

      onProgress?.(100, 'Backup complete');

      console.log('[GoogleDriveBackup] Backup created:', file.id);

      return {
        success: true,
        backupId: file.id,
        message: 'Backup saved to Google Drive',
      };
    } catch (error) {
      console.error('[GoogleDriveBackup] Backup failed:', error);
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
        console.log('[GoogleDriveBackup] Google Drive not available');
        return [];
      }

      // Get backup folder
      const folderId = await this.getBackupFolder();

      await this.initializeGDrive();
      if (!this.gdrive) {
        throw new Error('Google Drive not initialized');
      }

      // List files in folder
      const query = `'${folderId}' in parents and trashed=false and mimeType='application/json'`;
      const response = await this.gdrive.files
        .list({
          q: query,
          fields: 'files(id, name, size, modifiedTime)',
          orderBy: 'modifiedTime desc',
        })
        .execute();

      if (!response.files || response.files.length === 0) {
        return [];
      }

      // Parse backup metadata
      const backups: BackupInfo[] = [];

      for (const file of response.files) {
        try {
          // Download file to read metadata
          const content = await this.gdrive.files.getText(file.id);
          const backupData: BackupData = JSON.parse(content);

          // Format size
          const sizeInMB = file.size ? (parseFloat(file.size) / (1024 * 1024)).toFixed(2) : '0';
          const size = `${sizeInMB} MB`;

          backups.push({
            id: file.id,
            name: file.name.replace('.json', '').replace('backup_', ''),
            date: new Date(backupData.timestamp),
            size,
            habitCount: backupData.data.habits.length,
            platform: backupData.device.platform,
          });
        } catch (error) {
          console.error(`[GoogleDriveBackup] Failed to read backup ${file.id}:`, error);
          // Skip invalid files
          continue;
        }
      }

      return backups;
    } catch (error) {
      console.error('[GoogleDriveBackup] Failed to list backups:', error);
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
          error: 'Google Drive is not available. Please sign in first.',
        };
      }

      onProgress?.(0, 'Downloading backup...');

      await this.initializeGDrive();
      if (!this.gdrive) {
        throw new Error('Google Drive not initialized');
      }

      // Download file
      const content = await this.gdrive.files.getText(backupId);
      const backupData: BackupData = JSON.parse(content);

      onProgress?.(20, 'Backup downloaded');

      // Restore data
      const result = await DataImporter.restoreData(backupData, (progress, message) => {
        onProgress?.(20 + progress * 0.8, message); // 20-100%
      });

      return result;
    } catch (error) {
      console.error('[GoogleDriveBackup] Restore failed:', error);
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
          error: 'Google Drive is not available. Please sign in first.',
        };
      }

      await this.initializeGDrive();
      if (!this.gdrive) {
        throw new Error('Google Drive not initialized');
      }

      await this.gdrive.files.delete(backupId);

      console.log('[GoogleDriveBackup] Backup deleted:', backupId);

      return { success: true };
    } catch (error) {
      console.error('[GoogleDriveBackup] Delete failed:', error);
      return {
        success: false,
        error: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get current user info
   */
  static async getUserInfo(): Promise<{ email?: string; name?: string } | null> {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (!isSignedIn) return null;

      const userInfo = await GoogleSignin.getCurrentUser();
      return {
        email: userInfo?.user.email,
        name: userInfo?.user.name,
      };
    } catch (error) {
      console.error('[GoogleDriveBackup] Failed to get user info:', error);
      return null;
    }
  }
}
