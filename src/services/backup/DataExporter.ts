import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { db } from '@/data/database/client';
import {
  BackupData,
  AppData,
  DeviceInfo,
  CompletionRecord,
  EntryRecord,
  MascotCustomization,
  AppSettings,
  AppMetadata,
  ProgressCallback,
} from './types';
import { Habit } from '@/hooks/useHabits';

/**
 * DataExporter - Exports all app data to JSON for backup
 */
export class DataExporter {
  private static readonly BACKUP_VERSION = 1;

  /**
   * Export all app data to BackupData structure
   */
  static async exportData(onProgress?: ProgressCallback): Promise<BackupData> {
    try {
      onProgress?.(0, 'Starting export...');

      // Gather device info
      const deviceInfo = await this.getDeviceInfo();
      onProgress?.(10, 'Collected device info');

      // Export all data
      const appData = await this.exportAppData(onProgress);
      onProgress?.(90, 'Data exported');

      // Create backup structure
      const backupData: Omit<BackupData, 'checksum'> = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        device: deviceInfo,
        data: appData,
      };

      // Calculate checksum
      const dataString = JSON.stringify(backupData);
      const checksum = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        dataString
      );

      onProgress?.(100, 'Export complete');

      return {
        ...backupData,
        checksum,
      };
    } catch (error) {
      console.error('[DataExporter] Export failed:', error);
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get device information
   */
  private static async getDeviceInfo(): Promise<DeviceInfo> {
    return {
      platform: Platform.OS as 'ios' | 'android',
      deviceId: Device.modelName || 'unknown',
      appVersion: Constants.expoConfig?.version || '1.0.0',
      osVersion: Device.osVersion || undefined,
    };
  }

  /**
   * Export all app data
   */
  private static async exportAppData(onProgress?: ProgressCallback): Promise<AppData> {
    // Export habits
    onProgress?.(20, 'Exporting habits...');
    const habits = this.exportHabits();

    // Export completions
    onProgress?.(40, 'Exporting completions...');
    const completions = this.exportCompletions();

    // Export entries
    onProgress?.(60, 'Exporting entries...');
    const entries = this.exportEntries();

    // Export mascot customization
    onProgress?.(70, 'Exporting mascot...');
    const mascotCustomization = this.exportMascotCustomization();

    // Export settings
    onProgress?.(80, 'Exporting settings...');
    const settings = this.exportSettings();

    // Export metadata
    onProgress?.(85, 'Exporting metadata...');
    const metadata = this.exportMetadata();

    return {
      habits,
      completions,
      entries,
      mascotCustomization,
      settings,
      metadata,
    };
  }

  /**
   * Export habits from database
   */
  private static exportHabits(): Habit[] {
    try {
      const rows = db.getAllSync<any>(
        'SELECT * FROM habits WHERE archived = 0 ORDER BY sort_order ASC'
      );

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        emoji: row.emoji,
        streak: row.streak,
        category: row.category,
        color: row.color,
        frequency: row.frequency,
        frequencyType: row.frequency_type,
        targetCompletionsPerDay: row.target_per_day,
        selectedDays: JSON.parse(row.selected_days),
        timePeriod: row.time_period,
        reminderEnabled: row.reminder_enabled === 1,
        reminderTime: row.reminder_time || undefined,
        notificationIds: row.notification_ids ? JSON.parse(row.notification_ids) : undefined,
        notes: row.notes || undefined,
        isDefault: row.is_default === 1,
        archived: row.archived === 1,
        completions: {}, // Will be reconstructed from completions table
      }));
    } catch (error) {
      console.error('[DataExporter] Failed to export habits:', error);
      throw error;
    }
  }

  /**
   * Export completions from database
   */
  private static exportCompletions(): CompletionRecord[] {
    try {
      const rows = db.getAllSync<CompletionRecord>(
        'SELECT * FROM completions ORDER BY date DESC'
      );
      return rows;
    } catch (error) {
      console.error('[DataExporter] Failed to export completions:', error);
      throw error;
    }
  }

  /**
   * Export entries from database
   */
  private static exportEntries(): EntryRecord[] {
    try {
      const rows = db.getAllSync<EntryRecord>(
        'SELECT * FROM entries ORDER BY timestamp DESC'
      );
      return rows;
    } catch (error) {
      console.error('[DataExporter] Failed to export entries:', error);
      throw error;
    }
  }

  /**
   * Export mascot customization from database
   */
  private static exportMascotCustomization(): MascotCustomization | null {
    try {
      const row = db.getFirstSync<MascotCustomization>(
        "SELECT * FROM mascot_customization WHERE id = 'default'"
      );
      return row || null;
    } catch (error) {
      console.error('[DataExporter] Failed to export mascot customization:', error);
      return null;
    }
  }

  /**
   * Export settings (from app_metadata)
   */
  private static exportSettings(): AppSettings {
    try {
      const rows = db.getAllSync<{ key: string; value: string }>(
        "SELECT key, value FROM app_metadata WHERE key LIKE 'setting_%'"
      );

      const settings: AppSettings = {};
      rows.forEach((row) => {
        const key = row.key.replace('setting_', '');
        try {
          settings[key] = JSON.parse(row.value);
        } catch {
          settings[key] = row.value;
        }
      });

      return settings;
    } catch (error) {
      console.error('[DataExporter] Failed to export settings:', error);
      return {};
    }
  }

  /**
   * Export metadata (from app_metadata)
   */
  private static exportMetadata(): AppMetadata {
    try {
      const rows = db.getAllSync<{ key: string; value: string }>(
        'SELECT key, value FROM app_metadata'
      );

      const metadata: AppMetadata = {};
      rows.forEach((row) => {
        metadata[row.key] = row.value;
      });

      return metadata;
    } catch (error) {
      console.error('[DataExporter] Failed to export metadata:', error);
      return {};
    }
  }

  /**
   * Export data to JSON string
   */
  static async exportToJSON(onProgress?: ProgressCallback): Promise<string> {
    const backupData = await this.exportData(onProgress);
    return JSON.stringify(backupData, null, 2);
  }

  /**
   * Get backup metadata (without full data)
   */
  static getBackupMetadata(): {
    habitCount: number;
    completionCount: number;
    entryCount: number;
  } {
    try {
      const habitCount = db.getFirstSync<{ count: number }>(
        'SELECT COUNT(*) as count FROM habits WHERE archived = 0'
      )?.count || 0;

      const completionCount = db.getFirstSync<{ count: number }>(
        'SELECT COUNT(*) as count FROM completions'
      )?.count || 0;

      const entryCount = db.getFirstSync<{ count: number }>(
        'SELECT COUNT(*) as count FROM entries'
      )?.count || 0;

      return { habitCount, completionCount, entryCount };
    } catch (error) {
      console.error('[DataExporter] Failed to get backup metadata:', error);
      return { habitCount: 0, completionCount: 0, entryCount: 0 };
    }
  }
}
