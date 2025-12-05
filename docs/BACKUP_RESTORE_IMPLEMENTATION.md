# 📦 Backup & Restore Implementation - Google Drive & iCloud

## Overview

Premium feature that allows users to backup and restore their habit data to cloud storage (Google Drive for Android, iCloud for iOS).

## Goals

1. **Automatic Backups** - Daily automatic backups for premium users
2. **Manual Backups** - On-demand backup triggered by user
3. **Cross-Platform** - Google Drive (Android) and iCloud (iOS)
4. **Restore Capability** - Restore from any previous backup
5. **Data Integrity** - Verify backup/restore completeness
6. **Progress Feedback** - Show upload/download progress
7. **Premium Gate** - Only available to premium subscribers

## Architecture

### Data to Backup

```typescript
interface BackupData {
  version: number;           // Backup format version
  timestamp: string;         // When backup was created
  device: {
    platform: 'ios' | 'android';
    deviceId: string;
    appVersion: string;
  };
  data: {
    habits: Habit[];
    completions: Completion[];
    entries: Entry[];
    mascotCustomization: HabiCustomization;
    settings: AppSettings;
    metadata: AppMetadata;
  };
  checksum: string;          // Data integrity verification
}
```

### Storage Structure

**Google Drive:**
```
/habitTrackerBackups/
  ├── backup_2025-12-05_14-30-00.json
  ├── backup_2025-12-04_14-30-00.json
  └── backup_2025-12-03_14-30-00.json
```

**iCloud:**
```
Documents/habitTrackerBackups/
  ├── backup_2025-12-05_14-30-00.json
  ├── backup_2025-12-04_14-30-00.json
  └── backup_2025-12-03_14-30-00.json
```

## Implementation Checkpoints

---

## ✅ Checkpoint 0: Dependencies & Setup

**Goal:** Install required packages and configure permissions

### Tasks

1. Install cloud storage libraries
2. Configure iOS permissions (iCloud)
3. Configure Android permissions (Google Drive)
4. Update app config files

### Packages to Install

```bash
# Google Drive (Android)
npx expo install react-native-google-signin/google-signin
npx expo install @react-native-google-drive/api

# iCloud (iOS)
npx expo install react-native-icloudstore

# Or alternative: Expo FileSystem + Cloud APIs
npx expo install expo-file-system
```

### iOS Configuration (`app.json` / `app.config.js`)

```json
{
  "ios": {
    "infoPlist": {
      "NSUbiquitousContainers": {
        "iCloud.com.yourapp.habittracker": {
          "NSUbiquitousContainerName": "HabitTracker",
          "NSUbiquitousContainerIsDocumentScopePublic": true
        }
      }
    },
    "entitlements": {
      "com.apple.developer.icloud-container-identifiers": [
        "iCloud.com.yourapp.habittracker"
      ],
      "com.apple.developer.ubiquity-container-identifiers": [
        "iCloud.com.yourapp.habittracker"
      ],
      "com.apple.developer.icloud-services": ["CloudDocuments"]
    }
  }
}
```

### Android Configuration (`app.json`)

```json
{
  "android": {
    "permissions": [
      "INTERNET",
      "ACCESS_NETWORK_STATE"
    ],
    "googleServicesFile": "./google-services.json"
  }
}
```

### Files to Create

- `src/services/backup/types.ts` - TypeScript interfaces
- `src/services/backup/BackupService.ts` - Abstract service class
- `src/services/backup/GoogleDriveBackup.ts` - Android implementation
- `src/services/backup/iCloudBackup.ts` - iOS implementation

### Verification

- [ ] Packages installed successfully
- [ ] iOS entitlements configured
- [ ] Android permissions added
- [ ] Type definitions created

---

## ✅ Checkpoint 1: Data Export Layer

**Goal:** Create unified data export from SQLite to JSON

### Tasks

1. Create backup data types
2. Implement data collection from all tables
3. Add checksum generation for integrity
4. Test data export

### Files to Create

**`src/services/backup/types.ts`**

```typescript
export interface BackupMetadata {
  version: number;
  timestamp: string;
  device: {
    platform: 'ios' | 'android';
    deviceId: string;
    appVersion: string;
  };
  size: number; // bytes
  checksum: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: {
    habits: any[];
    completions: any[];
    entries: any[];
    mascotCustomization: any;
    settings: Record<string, any>;
    appMetadata: Record<string, any>;
  };
}

export interface BackupInfo {
  id: string;
  filename: string;
  timestamp: string;
  size: number;
  platform: 'ios' | 'android';
  deviceName?: string;
}

export type BackupStatus =
  | 'idle'
  | 'preparing'
  | 'uploading'
  | 'downloading'
  | 'restoring'
  | 'success'
  | 'error';

export interface BackupProgress {
  status: BackupStatus;
  progress: number; // 0-100
  message: string;
  error?: string;
}
```

**`src/services/backup/DataExporter.ts`**

```typescript
import { db } from '@/data/database/client';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export class DataExporter {
  /**
   * Export all app data to backup format
   */
  static async exportData(): Promise<BackupData> {
    console.log('[DataExporter] Starting data export...');

    // 1. Collect all data from SQLite
    const habits = db.getAllSync('SELECT * FROM habits WHERE archived = 0');
    const completions = db.getAllSync('SELECT * FROM completions');
    const entries = db.getAllSync('SELECT * FROM entries');
    const mascot = db.getFirstSync('SELECT * FROM mascot_customization WHERE id = ?', ['default']);
    const appMetadata = db.getAllSync('SELECT * FROM app_metadata');

    // 2. Convert to key-value for settings
    const settings: Record<string, any> = {};
    const metadata: Record<string, any> = {};

    appMetadata.forEach((row: any) => {
      metadata[row.key] = row.value;
    });

    // 3. Create backup data object
    const data = {
      habits,
      completions,
      entries,
      mascotCustomization: mascot,
      settings,
      appMetadata: metadata,
    };

    // 4. Create metadata
    const dataString = JSON.stringify(data);
    const checksum = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      dataString
    );

    const backupData: BackupData = {
      metadata: {
        version: 1,
        timestamp: new Date().toISOString(),
        device: {
          platform: Device.osName === 'iOS' ? 'ios' : 'android',
          deviceId: Constants.sessionId || 'unknown',
          appVersion: Constants.expoConfig?.version || '1.0.0',
        },
        size: dataString.length,
        checksum,
      },
      data,
    };

    console.log('[DataExporter] Export complete:', {
      habits: habits.length,
      completions: completions.length,
      entries: entries.length,
      size: dataString.length,
    });

    return backupData;
  }

  /**
   * Validate backup data integrity
   */
  static async validateBackup(backupData: BackupData): Promise<boolean> {
    const dataString = JSON.stringify(backupData.data);
    const calculatedChecksum = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      dataString
    );

    return calculatedChecksum === backupData.metadata.checksum;
  }
}
```

### Verification

- [ ] Can export all data from SQLite
- [ ] Checksum generation works
- [ ] Backup validation works
- [ ] No sensitive data leaked

---

## ✅ Checkpoint 2: Data Import/Restore Layer

**Goal:** Import backup data and restore to SQLite

### Files to Create

**`src/services/backup/DataImporter.ts`**

```typescript
import { db } from '@/data/database/client';
import { DataExporter } from './DataExporter';

export class DataImporter {
  /**
   * Import backup data and restore to database
   */
  static async importData(backupData: BackupData): Promise<void> {
    console.log('[DataImporter] Starting data import...');

    // 1. Validate backup integrity
    const isValid = await DataExporter.validateBackup(backupData);
    if (!isValid) {
      throw new Error('Backup data is corrupted (checksum mismatch)');
    }

    // 2. Check version compatibility
    if (backupData.metadata.version > 1) {
      throw new Error(`Unsupported backup version: ${backupData.metadata.version}`);
    }

    // 3. Clear existing data (with transaction)
    await this.clearExistingData();

    // 4. Import data (with transaction)
    await this.restoreData(backupData.data);

    console.log('[DataImporter] Import complete');
  }

  /**
   * Clear all existing data (except schema)
   */
  private static async clearExistingData(): Promise<void> {
    console.log('[DataImporter] Clearing existing data...');

    db.withTransactionSync(() => {
      db.runSync('DELETE FROM entries');
      db.runSync('DELETE FROM completions');
      db.runSync('DELETE FROM habits');
      db.runSync('DELETE FROM mascot_customization');
      // Don't clear app_metadata - keep app state
    });
  }

  /**
   * Restore data to database
   */
  private static async restoreData(data: BackupData['data']): Promise<void> {
    console.log('[DataImporter] Restoring data...');

    db.withTransactionSync(() => {
      // 1. Restore habits
      data.habits.forEach((habit: any) => {
        db.runSync(
          `INSERT INTO habits (
            id, name, emoji, streak, category, color, frequency,
            frequency_type, target_per_day, selected_days, time_period,
            reminder_enabled, reminder_time, notification_ids, notes,
            is_default, archived, sort_order, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            habit.id, habit.name, habit.emoji, habit.streak, habit.category,
            habit.color, habit.frequency, habit.frequency_type, habit.target_per_day,
            habit.selected_days, habit.time_period, habit.reminder_enabled,
            habit.reminder_time, habit.notification_ids, habit.notes,
            habit.is_default, habit.archived, habit.sort_order,
            habit.created_at, habit.updated_at
          ]
        );
      });

      // 2. Restore completions
      data.completions.forEach((completion: any) => {
        db.runSync(
          `INSERT INTO completions (habit_id, date, completion_count, target_count, timestamps)
           VALUES (?, ?, ?, ?, ?)`,
          [
            completion.habit_id, completion.date, completion.completion_count,
            completion.target_count, completion.timestamps
          ]
        );
      });

      // 3. Restore entries
      data.entries.forEach((entry: any) => {
        db.runSync(
          `INSERT INTO entries (id, habit_id, date, mood, note, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [entry.id, entry.habit_id, entry.date, entry.mood, entry.note, entry.timestamp]
        );
      });

      // 4. Restore mascot customization
      if (data.mascotCustomization) {
        const m = data.mascotCustomization;
        db.runSync(
          `INSERT OR REPLACE INTO mascot_customization (
            id, name, eyes, eyebrows, mouth, blush_enabled, blush_color,
            hair_style, hair_color, hat, glasses, body_color, pattern,
            pattern_color, necklace, special_effect, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id, m.name, m.eyes, m.eyebrows, m.mouth, m.blush_enabled,
            m.blush_color, m.hair_style, m.hair_color, m.hat, m.glasses,
            m.body_color, m.pattern, m.pattern_color, m.necklace,
            m.special_effect, m.created_at, m.updated_at
          ]
        );
      }
    });

    console.log('[DataImporter] Data restored successfully');
  }
}
```

### Verification

- [ ] Can import valid backup data
- [ ] Rejects corrupted backups
- [ ] Clears existing data safely
- [ ] Transaction rollback works on error

---

## ✅ Checkpoint 3: iCloud Backup Service (iOS)

**Goal:** Implement iCloud Drive backup for iOS

### Files to Create

**`src/services/backup/iCloudBackup.ts`**

```typescript
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { DataExporter } from './DataExporter';
import { DataImporter } from './DataImporter';
import type { BackupData, BackupInfo, BackupProgress } from './types';

// Note: For production, use react-native-icloudstore or native module
// This is a simplified example using FileSystem

export class iCloudBackupService {
  private static readonly BACKUP_DIR = `${FileSystem.documentDirectory}habitTrackerBackups/`;
  private static progressCallback?: (progress: BackupProgress) => void;

  /**
   * Check if iCloud is available
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    // Check if backup directory exists (simplified check)
    try {
      const info = await FileSystem.getInfoAsync(this.BACKUP_DIR);
      return true; // In production, check actual iCloud availability
    } catch {
      return false;
    }
  }

  /**
   * Set progress callback
   */
  static setProgressCallback(callback: (progress: BackupProgress) => void) {
    this.progressCallback = callback;
  }

  /**
   * Create backup and upload to iCloud
   */
  static async createBackup(): Promise<string> {
    try {
      this.updateProgress({ status: 'preparing', progress: 0, message: 'Preparing backup...' });

      // 1. Export data
      const backupData = await DataExporter.exportData();
      this.updateProgress({ status: 'preparing', progress: 30, message: 'Data exported' });

      // 2. Ensure backup directory exists
      await FileSystem.makeDirectoryAsync(this.BACKUP_DIR, { intermediates: true });

      // 3. Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}.json`;
      const filepath = `${this.BACKUP_DIR}${filename}`;

      // 4. Write to file
      this.updateProgress({ status: 'uploading', progress: 50, message: 'Uploading to iCloud...' });
      await FileSystem.writeAsStringAsync(filepath, JSON.stringify(backupData));

      this.updateProgress({ status: 'success', progress: 100, message: 'Backup complete!' });

      console.log('[iCloud] Backup created:', filename);
      return filename;
    } catch (error) {
      console.error('[iCloud] Backup failed:', error);
      this.updateProgress({
        status: 'error',
        progress: 0,
        message: 'Backup failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * List all backups
   */
  static async listBackups(): Promise<BackupInfo[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.BACKUP_DIR);
      const backups: BackupInfo[] = [];

      for (const filename of files) {
        if (!filename.endsWith('.json')) continue;

        const filepath = `${this.BACKUP_DIR}${filename}`;
        const info = await FileSystem.getInfoAsync(filepath);

        if (info.exists && !info.isDirectory) {
          backups.push({
            id: filename,
            filename,
            timestamp: filename.replace('backup_', '').replace('.json', ''),
            size: info.size || 0,
            platform: 'ios',
          });
        }
      }

      // Sort by timestamp (newest first)
      backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      return backups;
    } catch (error) {
      console.error('[iCloud] List backups failed:', error);
      return [];
    }
  }

  /**
   * Restore from backup
   */
  static async restoreBackup(filename: string): Promise<void> {
    try {
      this.updateProgress({ status: 'downloading', progress: 0, message: 'Downloading backup...' });

      // 1. Read backup file
      const filepath = `${this.BACKUP_DIR}${filename}`;
      const content = await FileSystem.readAsStringAsync(filepath);
      this.updateProgress({ status: 'downloading', progress: 50, message: 'Backup downloaded' });

      // 2. Parse backup data
      const backupData: BackupData = JSON.parse(content);

      // 3. Restore data
      this.updateProgress({ status: 'restoring', progress: 60, message: 'Restoring data...' });
      await DataImporter.importData(backupData);

      this.updateProgress({ status: 'success', progress: 100, message: 'Restore complete!' });

      console.log('[iCloud] Restore complete');
    } catch (error) {
      console.error('[iCloud] Restore failed:', error);
      this.updateProgress({
        status: 'error',
        progress: 0,
        message: 'Restore failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete backup
   */
  static async deleteBackup(filename: string): Promise<void> {
    const filepath = `${this.BACKUP_DIR}${filename}`;
    await FileSystem.deleteAsync(filepath, { idempotent: true });
    console.log('[iCloud] Backup deleted:', filename);
  }

  private static updateProgress(progress: BackupProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
}
```

### Verification

- [ ] Can create backup on iOS
- [ ] Can list backups
- [ ] Can restore from backup
- [ ] Can delete backup
- [ ] Progress callback works

---

## ✅ Checkpoint 4: Google Drive Backup Service (Android)

**Goal:** Implement Google Drive backup for Android

### Files to Create

**`src/services/backup/GoogleDriveBackup.ts`**

```typescript
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GDrive } from '@react-native-google-drive/api';
import { DataExporter } from './DataExporter';
import { DataImporter } from './DataImporter';
import type { BackupData, BackupInfo, BackupProgress } from './types';

export class GoogleDriveBackupService {
  private static readonly FOLDER_NAME = 'habitTrackerBackups';
  private static progressCallback?: (progress: BackupProgress) => void;
  private static folderId?: string;

  /**
   * Initialize Google Sign-In
   */
  static async initialize() {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.appdata'],
      webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
    });
  }

  /**
   * Check if Google Drive is available
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      return isSignedIn;
    } catch {
      return false;
    }
  }

  /**
   * Sign in to Google
   */
  static async signIn(): Promise<void> {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signIn();
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    await GoogleSignin.signOut();
  }

  /**
   * Set progress callback
   */
  static setProgressCallback(callback: (progress: BackupProgress) => void) {
    this.progressCallback = callback;
  }

  /**
   * Get or create backup folder
   */
  private static async getBackupFolder(): Promise<string> {
    if (this.folderId) return this.folderId;

    // Search for existing folder
    const query = `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const response = await GDrive.files.list({ q: query });

    if (response.files && response.files.length > 0) {
      this.folderId = response.files[0].id;
      return this.folderId;
    }

    // Create new folder
    const folder = await GDrive.files.create({
      name: this.FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    });

    this.folderId = folder.id;
    return this.folderId;
  }

  /**
   * Create backup and upload to Google Drive
   */
  static async createBackup(): Promise<string> {
    try {
      this.updateProgress({ status: 'preparing', progress: 0, message: 'Preparing backup...' });

      // 1. Export data
      const backupData = await DataExporter.exportData();
      this.updateProgress({ status: 'preparing', progress: 30, message: 'Data exported' });

      // 2. Get backup folder
      const folderId = await this.getBackupFolder();

      // 3. Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}.json`;

      // 4. Upload to Google Drive
      this.updateProgress({ status: 'uploading', progress: 50, message: 'Uploading to Google Drive...' });

      const file = await GDrive.files.create({
        name: filename,
        parents: [folderId],
        mimeType: 'application/json',
        data: JSON.stringify(backupData),
      });

      this.updateProgress({ status: 'success', progress: 100, message: 'Backup complete!' });

      console.log('[GoogleDrive] Backup created:', filename);
      return filename;
    } catch (error) {
      console.error('[GoogleDrive] Backup failed:', error);
      this.updateProgress({
        status: 'error',
        progress: 0,
        message: 'Backup failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * List all backups
   */
  static async listBackups(): Promise<BackupInfo[]> {
    try {
      const folderId = await this.getBackupFolder();
      const query = `'${folderId}' in parents and mimeType='application/json' and trashed=false`;

      const response = await GDrive.files.list({
        q: query,
        fields: 'files(id, name, size, createdTime)',
        orderBy: 'createdTime desc',
      });

      return (response.files || []).map(file => ({
        id: file.id,
        filename: file.name,
        timestamp: file.name.replace('backup_', '').replace('.json', ''),
        size: parseInt(file.size || '0'),
        platform: 'android',
      }));
    } catch (error) {
      console.error('[GoogleDrive] List backups failed:', error);
      return [];
    }
  }

  /**
   * Restore from backup
   */
  static async restoreBackup(fileId: string): Promise<void> {
    try {
      this.updateProgress({ status: 'downloading', progress: 0, message: 'Downloading backup...' });

      // 1. Download backup file
      const content = await GDrive.files.download(fileId);
      this.updateProgress({ status: 'downloading', progress: 50, message: 'Backup downloaded' });

      // 2. Parse backup data
      const backupData: BackupData = JSON.parse(content);

      // 3. Restore data
      this.updateProgress({ status: 'restoring', progress: 60, message: 'Restoring data...' });
      await DataImporter.importData(backupData);

      this.updateProgress({ status: 'success', progress: 100, message: 'Restore complete!' });

      console.log('[GoogleDrive] Restore complete');
    } catch (error) {
      console.error('[GoogleDrive] Restore failed:', error);
      this.updateProgress({
        status: 'error',
        progress: 0,
        message: 'Restore failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete backup
   */
  static async deleteBackup(fileId: string): Promise<void> {
    await GDrive.files.delete(fileId);
    console.log('[GoogleDrive] Backup deleted:', fileId);
  }

  private static updateProgress(progress: BackupProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
}
```

### Verification

- [ ] Google Sign-In works
- [ ] Can create backup on Android
- [ ] Can list backups from Drive
- [ ] Can restore from backup
- [ ] Can delete backup
- [ ] Progress callback works

---

## ✅ Checkpoint 5: Unified Backup Service

**Goal:** Create platform-agnostic backup service

### Files to Create

**`src/services/backup/BackupService.ts`**

```typescript
import { Platform } from 'react-native';
import { iCloudBackupService } from './iCloudBackup';
import { GoogleDriveBackupService } from './GoogleDriveBackup';
import type { BackupInfo, BackupProgress } from './types';

/**
 * Unified backup service that delegates to platform-specific implementations
 */
export class BackupService {
  /**
   * Check if backup is available on current platform
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return await iCloudBackupService.isAvailable();
    } else {
      return await GoogleDriveBackupService.isAvailable();
    }
  }

  /**
   * Initialize backup service (Android only - Google Sign-In)
   */
  static async initialize(): Promise<void> {
    if (Platform.OS === 'android') {
      await GoogleDriveBackupService.initialize();
    }
  }

  /**
   * Sign in (Android only - Google Sign-In)
   */
  static async signIn(): Promise<void> {
    if (Platform.OS === 'android') {
      await GoogleDriveBackupService.signIn();
    }
  }

  /**
   * Sign out (Android only)
   */
  static async signOut(): Promise<void> {
    if (Platform.OS === 'android') {
      await GoogleDriveBackupService.signOut();
    }
  }

  /**
   * Set progress callback
   */
  static setProgressCallback(callback: (progress: BackupProgress) => void): void {
    if (Platform.OS === 'ios') {
      iCloudBackupService.setProgressCallback(callback);
    } else {
      GoogleDriveBackupService.setProgressCallback(callback);
    }
  }

  /**
   * Create backup
   */
  static async createBackup(): Promise<string> {
    if (Platform.OS === 'ios') {
      return await iCloudBackupService.createBackup();
    } else {
      return await GoogleDriveBackupService.createBackup();
    }
  }

  /**
   * List all backups
   */
  static async listBackups(): Promise<BackupInfo[]> {
    if (Platform.OS === 'ios') {
      return await iCloudBackupService.listBackups();
    } else {
      return await GoogleDriveBackupService.listBackups();
    }
  }

  /**
   * Restore from backup
   */
  static async restoreBackup(backupId: string): Promise<void> {
    if (Platform.OS === 'ios') {
      return await iCloudBackupService.restoreBackup(backupId);
    } else {
      return await GoogleDriveBackupService.restoreBackup(backupId);
    }
  }

  /**
   * Delete backup
   */
  static async deleteBackup(backupId: string): Promise<void> {
    if (Platform.OS === 'ios') {
      return await iCloudBackupService.deleteBackup(backupId);
    } else {
      return await GoogleDriveBackupService.deleteBackup(backupId);
    }
  }

  /**
   * Get platform name for display
   */
  static getPlatformName(): string {
    return Platform.OS === 'ios' ? 'iCloud' : 'Google Drive';
  }
}
```

**`src/services/backup/index.ts`**

```typescript
export { BackupService } from './BackupService';
export * from './types';
```

### Verification

- [ ] Can call unified API on both platforms
- [ ] Correctly delegates to platform services
- [ ] Platform name shows correctly

---

## ✅ Checkpoint 6: Automatic Backup Scheduler

**Goal:** Schedule daily automatic backups for premium users

### Files to Create

**`src/services/backup/AutomaticBackup.ts`**

```typescript
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackupService } from './BackupService';

const BACKUP_TASK_NAME = 'AUTOMATIC_BACKUP';
const LAST_BACKUP_KEY = '@last_automatic_backup';
const AUTO_BACKUP_ENABLED_KEY = '@auto_backup_enabled';

// Define background task
TaskManager.defineTask(BACKUP_TASK_NAME, async () => {
  try {
    console.log('[AutoBackup] Running automatic backup...');

    // Check if auto backup is enabled
    const enabled = await AsyncStorage.getItem(AUTO_BACKUP_ENABLED_KEY);
    if (enabled !== 'true') {
      console.log('[AutoBackup] Auto backup disabled, skipping');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Check if backup service is available
    const isAvailable = await BackupService.isAvailable();
    if (!isAvailable) {
      console.log('[AutoBackup] Backup service not available');
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    // Create backup
    const filename = await BackupService.createBackup();

    // Update last backup timestamp
    await AsyncStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());

    console.log('[AutoBackup] Automatic backup complete:', filename);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[AutoBackup] Automatic backup failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class AutomaticBackup {
  /**
   * Register automatic backup task
   */
  static async register(): Promise<void> {
    try {
      await BackgroundFetch.registerTaskAsync(BACKUP_TASK_NAME, {
        minimumInterval: 60 * 60 * 24, // 24 hours
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('[AutoBackup] Task registered');
    } catch (error) {
      console.error('[AutoBackup] Failed to register task:', error);
    }
  }

  /**
   * Unregister automatic backup task
   */
  static async unregister(): Promise<void> {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKUP_TASK_NAME);
      console.log('[AutoBackup] Task unregistered');
    } catch (error) {
      console.error('[AutoBackup] Failed to unregister task:', error);
    }
  }

  /**
   * Enable automatic backups
   */
  static async enable(): Promise<void> {
    await AsyncStorage.setItem(AUTO_BACKUP_ENABLED_KEY, 'true');
    await this.register();
    console.log('[AutoBackup] Enabled');
  }

  /**
   * Disable automatic backups
   */
  static async disable(): Promise<void> {
    await AsyncStorage.setItem(AUTO_BACKUP_ENABLED_KEY, 'false');
    await this.unregister();
    console.log('[AutoBackup] Disabled');
  }

  /**
   * Check if automatic backups are enabled
   */
  static async isEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(AUTO_BACKUP_ENABLED_KEY);
    return enabled === 'true';
  }

  /**
   * Get last automatic backup timestamp
   */
  static async getLastBackupTime(): Promise<Date | null> {
    const timestamp = await AsyncStorage.getItem(LAST_BACKUP_KEY);
    return timestamp ? new Date(timestamp) : null;
  }
}
```

### Install Required Packages

```bash
npx expo install expo-background-fetch expo-task-manager
```

### Verification

- [ ] Background task registers successfully
- [ ] Automatic backup runs (test with shorter interval)
- [ ] Can enable/disable auto backup
- [ ] Last backup time tracked correctly

---

## ✅ Checkpoint 7: UI - Backup & Restore Screen

**Goal:** Create user interface for backup/restore

### Files to Create

**`src/screens/BackupRestoreScreen.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cloud, CloudDownload, CloudUpload, Trash2, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useSubscription } from '@/context/SubscriptionContext';
import { BackupService } from '@/services/backup';
import { AutomaticBackup } from '@/services/backup/AutomaticBackup';
import type { BackupInfo, BackupProgress } from '@/services/backup/types';

export default function BackupRestoreScreen() {
  const { theme } = useTheme();
  const { subscription } = useSubscription();

  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(null);

  useEffect(() => {
    loadBackups();
    loadSettings();
    BackupService.setProgressCallback(setProgress);
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const backupList = await BackupService.listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Failed to load backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    const enabled = await AutomaticBackup.isEnabled();
    const lastTime = await AutomaticBackup.getLastBackupTime();
    setAutoBackupEnabled(enabled);
    setLastBackupTime(lastTime);
  };

  const handleCreateBackup = async () => {
    if (!subscription.isPremium) {
      Alert.alert('Premium Feature', 'Backup & Restore is a premium feature. Upgrade to access.');
      return;
    }

    setLoading(true);
    try {
      await BackupService.createBackup();
      Alert.alert('Success', 'Backup created successfully!');
      loadBackups();
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup. Please try again.');
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const handleRestore = async (backup: BackupInfo) => {
    Alert.alert(
      'Restore Backup',
      'This will replace all current data with the backup. This cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await BackupService.restoreBackup(backup.id);
              Alert.alert('Success', 'Backup restored! Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to restore backup.');
            } finally {
              setLoading(false);
              setProgress(null);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (backup: BackupInfo) => {
    Alert.alert('Delete Backup', 'Are you sure you want to delete this backup?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await BackupService.deleteBackup(backup.id);
            loadBackups();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete backup.');
          }
        },
      },
    ]);
  };

  const toggleAutoBackup = async () => {
    if (autoBackupEnabled) {
      await AutomaticBackup.disable();
      setAutoBackupEnabled(false);
    } else {
      await AutomaticBackup.enable();
      setAutoBackupEnabled(true);
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp.replace(/-/g, ':').replace('T', ' '));
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatSize = (bytes: number) => {
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Premium gate
  if (!subscription.isPremium) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.premiumGate}>
          <Cloud size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.premiumTitle, { color: theme.colors.text }]}>
            Premium Feature
          </Text>
          <Text style={[styles.premiumText, { color: theme.colors.textSecondary }]}>
            Backup & Restore to {BackupService.getPlatformName()} is available for premium users.
          </Text>
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {/* Navigate to subscription */}}
          >
            <Text style={[styles.upgradeButtonText, { color: theme.colors.white }]}>
              Upgrade to Premium
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Cloud size={32} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {BackupService.getPlatformName()} Backup
          </Text>
        </View>

        {/* Automatic Backup Toggle */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Automatic Daily Backup
            </Text>
            <TouchableOpacity onPress={toggleAutoBackup}>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: autoBackupEnabled
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.toggleText, { color: theme.colors.white }]}>
                  {autoBackupEnabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {lastBackupTime && (
            <Text style={[styles.lastBackup, { color: theme.colors.textSecondary }]}>
              Last backup: {lastBackupTime.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Manual Backup Button */}
        <TouchableOpacity
          style={[styles.backupButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleCreateBackup}
          disabled={loading}
        >
          {loading && progress?.status === 'uploading' ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <CloudUpload size={20} color={theme.colors.white} />
          )}
          <Text style={[styles.backupButtonText, { color: theme.colors.white }]}>
            Create Backup Now
          </Text>
        </TouchableOpacity>

        {/* Progress Indicator */}
        {progress && (
          <View style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.progressText, { color: theme.colors.text }]}>
              {progress.message}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.primary,
                    width: `${progress.progress}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Backup List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Your Backups
            </Text>
            <TouchableOpacity onPress={loadBackups}>
              <RefreshCw size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {loading && backups.length === 0 ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : backups.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No backups yet. Create your first backup!
            </Text>
          ) : (
            backups.map((backup) => (
              <View
                key={backup.id}
                style={[styles.backupItem, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.backupInfo}>
                  <Text style={[styles.backupDate, { color: theme.colors.text }]}>
                    {formatDate(backup.timestamp)}
                  </Text>
                  <Text style={[styles.backupSize, { color: theme.colors.textSecondary }]}>
                    {formatSize(backup.size)}
                  </Text>
                </View>
                <View style={styles.backupActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRestore(backup)}
                  >
                    <CloudDownload size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(backup)}
                  >
                    <Trash2 size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lastBackup: {
    fontSize: 12,
    marginTop: 8,
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  backupButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 24,
  },
  backupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  backupSize: {
    fontSize: 12,
  },
  backupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  premiumGate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  premiumText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  upgradeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Add to Navigation

Update navigation to include BackupRestoreScreen.

### Verification

- [ ] Screen renders correctly
- [ ] Premium gate works
- [ ] Can create manual backup
- [ ] Can toggle automatic backup
- [ ] Can view backup list
- [ ] Can restore from backup
- [ ] Can delete backup
- [ ] Progress indicator shows during operations

---

## ✅ Checkpoint 8: Testing & Error Handling

**Goal:** Comprehensive testing and error handling

### Testing Checklist

**Data Export/Import:**
- [ ] Export creates valid JSON
- [ ] Checksum validation works
- [ ] Import restores all data correctly
- [ ] Handles corrupted backups gracefully
- [ ] Version compatibility checks work

**iOS (iCloud):**
- [ ] Can create backup on iOS
- [ ] Backup appears in Files app (iCloud Drive)
- [ ] Can restore from iCloud backup
- [ ] Handles iCloud not available
- [ ] Progress updates correctly

**Android (Google Drive):**
- [ ] Google Sign-In works
- [ ] Can create backup on Android
- [ ] Backup appears in Google Drive app
- [ ] Can restore from Drive backup
- [ ] Handles sign-out gracefully
- [ ] Progress updates correctly

**Automatic Backups:**
- [ ] Background task runs daily
- [ ] Only runs for premium users
- [ ] Last backup time updates
- [ ] Can enable/disable

**UI:**
- [ ] Premium gate works
- [ ] Backup list loads
- [ ] Create backup button works
- [ ] Restore confirmation shows
- [ ] Delete confirmation shows
- [ ] Progress indicator shows
- [ ] Error messages display

**Error Scenarios:**
- [ ] No internet connection
- [ ] Storage quota exceeded
- [ ] Invalid backup file
- [ ] Interrupted backup/restore
- [ ] App killed during operation

### Performance Testing

- [ ] Backup completes in <30 seconds
- [ ] Restore completes in <30 seconds
- [ ] Large databases (1000+ habits) handled
- [ ] Memory usage acceptable
- [ ] No UI freezing during operations

---

## 🚀 Implementation Summary

### Files Created

```
src/services/backup/
├── types.ts                    # TypeScript interfaces
├── DataExporter.ts             # Export SQLite to JSON
├── DataImporter.ts             # Import JSON to SQLite
├── iCloudBackup.ts             # iOS iCloud implementation
├── GoogleDriveBackup.ts        # Android Drive implementation
├── BackupService.ts            # Unified API
├── AutomaticBackup.ts          # Background task
└── index.ts                    # Barrel exports

src/screens/
└── BackupRestoreScreen.tsx     # UI screen
```

### Dependencies

```json
{
  "dependencies": {
    "expo-file-system": "*",
    "expo-crypto": "*",
    "expo-device": "*",
    "expo-constants": "*",
    "expo-background-fetch": "*",
    "expo-task-manager": "*",
    "@react-native-google-signin/google-signin": "*",
    "@react-native-google-drive/api": "*",
    "react-native-icloudstore": "*"
  }
}
```

### Configuration Requirements

**iOS:**
- iCloud entitlements in app.json
- Container identifier configured

**Android:**
- Google Cloud Console project
- OAuth 2.0 credentials
- google-services.json file

### Premium Feature Integration

Add backup to subscription benefits:

```typescript
const PREMIUM_FEATURES = [
  'Unlimited habits',
  'Advanced analytics',
  'Custom themes',
  'Cloud backup & restore', // NEW
  'Priority support',
];
```

---

## 📝 User Documentation

### How to Use (iOS)

1. **Setup:** Ensure iCloud Drive is enabled in Settings
2. **Manual Backup:** Tap "Create Backup Now"
3. **Automatic Backup:** Toggle "Automatic Daily Backup" ON
4. **Restore:** Tap download icon next to any backup
5. **Delete:** Tap trash icon to remove old backups

### How to Use (Android)

1. **Setup:** Sign in with Google account
2. **Manual Backup:** Tap "Create Backup Now"
3. **Automatic Backup:** Toggle "Automatic Daily Backup" ON
4. **Restore:** Tap download icon next to any backup
5. **Delete:** Tap trash icon to remove old backups

---

## 🎉 Success Criteria

- ✅ Premium users can backup data to cloud
- ✅ Backups run automatically daily
- ✅ Users can restore from any backup
- ✅ Works on both iOS (iCloud) and Android (Google Drive)
- ✅ Data integrity verified with checksums
- ✅ Clear error messages for failures
- ✅ Progress indicators during operations
- ✅ Premium-only feature enforced

---

## Future Enhancements

1. **Backup Encryption** - Encrypt backup files
2. **Selective Restore** - Restore only specific habits
3. **Backup on Change** - Auto-backup after major changes
4. **Cross-Platform Restore** - Restore Android backup on iOS
5. **Backup Scheduling** - Custom backup frequency
6. **Compression** - Reduce backup file size
7. **Backup History Limit** - Auto-delete old backups
8. **Export to Email** - Email backup file
