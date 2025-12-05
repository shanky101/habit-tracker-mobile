import * as Crypto from 'expo-crypto';
import { db } from '@/data/database/client';
import {
  BackupData,
  RestoreResult,
  ProgressCallback,
  CompletionRecord,
  EntryRecord,
  MascotCustomization,
} from './types';
import { Habit } from '@/hooks/useHabits';

/**
 * DataImporter - Imports and restores app data from backup
 */
export class DataImporter {
  /**
   * Validate backup data structure and checksum
   */
  static async validateBackup(backupData: BackupData): Promise<{ valid: boolean; error?: string }> {
    try {
      // Check version
      if (!backupData.version || backupData.version < 1) {
        return { valid: false, error: 'Invalid backup version' };
      }

      // Check required fields
      if (!backupData.timestamp || !backupData.device || !backupData.data) {
        return { valid: false, error: 'Missing required backup fields' };
      }

      // Validate checksum
      const { checksum, ...dataWithoutChecksum } = backupData;
      const dataString = JSON.stringify(dataWithoutChecksum);
      const calculatedChecksum = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        dataString
      );

      if (calculatedChecksum !== checksum) {
        return { valid: false, error: 'Checksum mismatch - backup may be corrupted' };
      }

      return { valid: true };
    } catch (error) {
      console.error('[DataImporter] Validation failed:', error);
      return {
        valid: false,
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Import backup data and restore to database
   */
  static async restoreData(
    backupData: BackupData,
    onProgress?: ProgressCallback
  ): Promise<RestoreResult> {
    try {
      onProgress?.(0, 'Validating backup...');

      // Validate backup
      const validation = await this.validateBackup(backupData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      onProgress?.(10, 'Backup validated');

      // Perform restore in a transaction
      const result = await this.performRestore(backupData, onProgress);

      onProgress?.(100, 'Restore complete');

      return result;
    } catch (error) {
      console.error('[DataImporter] Restore failed:', error);
      return {
        success: false,
        error: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Perform the actual restore operation
   */
  private static async performRestore(
    backupData: BackupData,
    onProgress?: ProgressCallback
  ): Promise<RestoreResult> {
    let restoredHabits = 0;
    let restoredCompletions = 0;
    let restoredEntries = 0;

    try {
      // Use transaction for atomicity
      await db.withTransactionAsync(async () => {
        // Clear existing data
        onProgress?.(20, 'Clearing existing data...');
        await this.clearExistingData();

        // Restore habits
        onProgress?.(30, 'Restoring habits...');
        restoredHabits = await this.restoreHabits(backupData.data.habits);

        // Restore completions
        onProgress?.(50, 'Restoring completions...');
        restoredCompletions = await this.restoreCompletions(backupData.data.completions);

        // Restore entries
        onProgress?.(60, 'Restoring entries...');
        restoredEntries = await this.restoreEntries(backupData.data.entries);

        // Restore mascot customization
        onProgress?.(70, 'Restoring mascot...');
        await this.restoreMascotCustomization(backupData.data.mascotCustomization);

        // Restore settings
        onProgress?.(80, 'Restoring settings...');
        await this.restoreSettings(backupData.data.settings);

        // Restore metadata
        onProgress?.(90, 'Restoring metadata...');
        await this.restoreMetadata(backupData.data.metadata);
      });

      return {
        success: true,
        restoredHabits,
        restoredCompletions,
        restoredEntries,
        message: `Successfully restored ${restoredHabits} habits, ${restoredCompletions} completions, and ${restoredEntries} entries`,
      };
    } catch (error) {
      console.error('[DataImporter] Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Clear existing data (except metadata we want to keep)
   */
  private static async clearExistingData(): Promise<void> {
    try {
      // Delete in order due to foreign key constraints
      db.runSync('DELETE FROM entries');
      db.runSync('DELETE FROM completions');
      db.runSync('DELETE FROM habits');
      db.runSync('DELETE FROM mascot_customization');

      // Clear settings but keep initial_seed_done
      db.runSync("DELETE FROM app_metadata WHERE key LIKE 'setting_%'");

      console.log('[DataImporter] Existing data cleared');
    } catch (error) {
      console.error('[DataImporter] Failed to clear existing data:', error);
      throw error;
    }
  }

  /**
   * Restore habits
   */
  private static async restoreHabits(habits: Habit[]): Promise<number> {
    try {
      let count = 0;
      const now = new Date().toISOString();

      for (const habit of habits) {
        db.runSync(
          `INSERT INTO habits (
            id, name, emoji, streak, category, color,
            frequency, frequency_type, target_per_day, selected_days, time_period,
            reminder_enabled, reminder_time, notification_ids, notes,
            is_default, archived, sort_order, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            habit.id,
            habit.name,
            habit.emoji,
            habit.streak,
            habit.category,
            habit.color,
            habit.frequency,
            habit.frequencyType || 'single',
            habit.targetCompletionsPerDay,
            JSON.stringify(habit.selectedDays),
            habit.timePeriod || 'allday',
            habit.reminderEnabled ? 1 : 0,
            habit.reminderTime || null,
            habit.notificationIds ? JSON.stringify(habit.notificationIds) : null,
            habit.notes || null,
            habit.isDefault ? 1 : 0,
            habit.archived ? 1 : 0,
            count, // sort_order
            now,
            now,
          ]
        );
        count++;
      }

      console.log(`[DataImporter] Restored ${count} habits`);
      return count;
    } catch (error) {
      console.error('[DataImporter] Failed to restore habits:', error);
      throw error;
    }
  }

  /**
   * Restore completions
   */
  private static async restoreCompletions(completions: CompletionRecord[]): Promise<number> {
    try {
      let count = 0;

      for (const completion of completions) {
        db.runSync(
          `INSERT INTO completions (
            habit_id, date, completion_count, target_count, timestamps
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            completion.habit_id,
            completion.date,
            completion.completion_count,
            completion.target_count,
            completion.timestamps,
          ]
        );
        count++;
      }

      console.log(`[DataImporter] Restored ${count} completions`);
      return count;
    } catch (error) {
      console.error('[DataImporter] Failed to restore completions:', error);
      throw error;
    }
  }

  /**
   * Restore entries
   */
  private static async restoreEntries(entries: EntryRecord[]): Promise<number> {
    try {
      let count = 0;

      for (const entry of entries) {
        db.runSync(
          `INSERT INTO entries (
            id, habit_id, date, mood, note, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            entry.id,
            entry.habit_id,
            entry.date,
            entry.mood || null,
            entry.note || null,
            entry.timestamp,
          ]
        );
        count++;
      }

      console.log(`[DataImporter] Restored ${count} entries`);
      return count;
    } catch (error) {
      console.error('[DataImporter] Failed to restore entries:', error);
      throw error;
    }
  }

  /**
   * Restore mascot customization
   */
  private static async restoreMascotCustomization(
    mascot: MascotCustomization | null
  ): Promise<void> {
    if (!mascot) {
      console.log('[DataImporter] No mascot customization to restore');
      return;
    }

    try {
      const now = new Date().toISOString();

      db.runSync(
        `INSERT OR REPLACE INTO mascot_customization (
          id, name, eyes, eyebrows, mouth, blush_enabled, blush_color,
          hair_style, hair_color, hat, glasses,
          body_color, pattern, pattern_color,
          necklace, special_effect,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mascot.id || 'default',
          mascot.name,
          mascot.eyes,
          mascot.eyebrows,
          mascot.mouth,
          mascot.blush_enabled,
          mascot.blush_color,
          mascot.hair_style,
          mascot.hair_color,
          mascot.hat,
          mascot.glasses,
          mascot.body_color,
          mascot.pattern,
          mascot.pattern_color || null,
          mascot.necklace,
          mascot.special_effect,
          now,
          now,
        ]
      );

      console.log('[DataImporter] Restored mascot customization');
    } catch (error) {
      console.error('[DataImporter] Failed to restore mascot customization:', error);
      throw error;
    }
  }

  /**
   * Restore settings
   */
  private static async restoreSettings(settings: Record<string, any>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(settings)) {
        const settingKey = `setting_${key}`;
        const settingValue = typeof value === 'string' ? value : JSON.stringify(value);

        db.runSync(
          'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
          [settingKey, settingValue]
        );
      }

      console.log('[DataImporter] Restored settings');
    } catch (error) {
      console.error('[DataImporter] Failed to restore settings:', error);
      throw error;
    }
  }

  /**
   * Restore metadata
   */
  private static async restoreMetadata(metadata: Record<string, any>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(metadata)) {
        // Skip setting_ keys (handled by restoreSettings)
        if (key.startsWith('setting_')) continue;

        db.runSync(
          'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
          [key, value]
        );
      }

      // Update last restore timestamp
      db.runSync(
        'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
        ['last_restore', new Date().toISOString()]
      );

      console.log('[DataImporter] Restored metadata');
    } catch (error) {
      console.error('[DataImporter] Failed to restore metadata:', error);
      throw error;
    }
  }

  /**
   * Parse backup JSON string
   */
  static parseBackupJSON(jsonString: string): BackupData {
    try {
      const data = JSON.parse(jsonString);
      return data as BackupData;
    } catch (error) {
      console.error('[DataImporter] Failed to parse backup JSON:', error);
      throw new Error('Invalid backup file format');
    }
  }
}
