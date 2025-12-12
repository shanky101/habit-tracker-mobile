# Cloud Backup & Restore - Complete Implementation Specification

> **Premium Feature**: This is the hallmark feature that drives subscription conversions.  
> **Goal**: Bullet-proof, production-grade cloud backup that users can trust with years of habit data.

---

## Executive Summary

This document provides a comprehensive specification for implementing secure, reliable cloud backup and restore functionality for the Habit Tracker app using **iCloud (iOS)** and **Google Drive (Android)**. The implementation follows industry best practices and is designed to be the primary reason users upgrade to premium.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Architecture Overview](#2-architecture-overview)  
3. [Data Model & Schema](#3-data-model--schema)
4. [Platform-Specific Implementation](#4-platform-specific-implementation)
5. [Security & Encryption](#5-security--encryption)
6. [Conflict Resolution](#6-conflict-resolution)
7. [Automatic Backup Scheduling](#7-automatic-backup-scheduling)
8. [Offline Support & Sync Queue](#8-offline-support--sync-queue)
9. [UI/UX Design](#9-uiux-design)
10. [Error Handling & Recovery](#10-error-handling--recovery)
11. [Testing Strategy](#11-testing-strategy)
12. [Implementation Phases](#12-implementation-phases)

---

## 1. Current State Analysis

### Existing Implementation (Gaps Identified)

| Component | Status | Issues |
|-----------|--------|--------|
| `DataExporter.ts` | ✅ Exists | Solid foundation, exports all tables |
| `DataImporter.ts` | ✅ Exists | Handles restore logic |
| `GoogleDriveBackup.ts` | ⚠️ Partial | No token refresh, crashes in Expo Go, no offline queue |
| `iCloudBackup.ts` | ⚠️ Partial | Uses file system hack, not native CloudKit |
| `BackupService.ts` | ✅ Exists | Good abstraction layer |
| `AutomaticBackup.ts` | ⚠️ Partial | Basic scheduling only |

### Critical Missing Features

1. **No proper CloudKit integration** - iOS uses unreliable file system path
2. **No token refresh mechanism** - Google tokens expire, users get logged out
3. **No conflict resolution** - No strategy for multi-device sync conflicts
4. **No encryption** - Backup data is stored in plain JSON
5. **No offline queue** - Backups fail silently when offline
6. **No integrity verification** - Checksum exists but isn't validated
7. **No incremental backups** - Always full backup (wasteful)
8. **No backup scheduling** - User must manually trigger

---

## 2. Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │BackupScreen │  │SettingsCard │  │ AutoBackupBadge  │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬──────────┘   │
└─────────┼────────────────┼───────────────────┼──────────────┘
          │                │                   │
┌─────────▼────────────────▼───────────────────▼──────────────┐
│                      Service Layer                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 BackupOrchestrator                   │    │
│  │  - Coordinates all backup operations                 │    │
│  │  - Manages state machine                             │    │
│  │  - Handles retries & error recovery                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│  ┌──────────────┐  ┌────────▼────────┐  ┌───────────────┐   │
│  │ DataExporter │  │ BackupScheduler │  │ ConflictMgr   │   │
│  └──────────────┘  └─────────────────┘  └───────────────┘   │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────┐   │
│  │ DataImporter │  │  OfflineQueue   │  │ Encryption    │   │
│  └──────────────┘  └─────────────────┘  └───────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     Provider Layer                           │
│  ┌────────────────────┐      ┌────────────────────────────┐ │
│  │   iCloudProvider   │      │   GoogleDriveProvider      │ │
│  │  (Native CloudKit) │      │  (REST API + OAuth 2.0)    │ │
│  └────────────────────┘      └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Provider Abstraction** - Platform-specific code isolated in providers
2. **Offline-First** - Queue operations when offline, sync when online
3. **Encryption by Default** - All backups encrypted at rest
4. **Atomic Operations** - Full transaction or full rollback
5. **Versioned Schema** - Forward-compatible backup format
6. **Observable Progress** - Real-time progress updates via callbacks

---

## 3. Data Model & Schema

### Backup File Format (v2)

```typescript
interface BackupFile {
  // Header (unencrypted for metadata access)
  header: {
    formatVersion: 2;
    createdAt: string;          // ISO 8601
    appVersion: string;         // e.g., "1.2.3"
    platform: 'ios' | 'android';
    deviceId: string;           // Anonymized device fingerprint
    backupType: 'full' | 'incremental';
    previousBackupId?: string;  // For incremental chain
    encryptionMethod: 'aes-256-gcm' | 'none';
    compressionMethod: 'gzip' | 'none';
    checksum: string;           // SHA-256 of encrypted payload
  };
  
  // Payload (encrypted + compressed)
  payload: string;  // Base64-encoded encrypted data
}

interface BackupPayload {
  // Schema versioning for migrations
  schemaVersion: number;
  
  // Core data
  habits: HabitRecord[];
  completions: CompletionRecord[];
  entries: EntryRecord[];
  
  // User data
  profile: UserProfile | null;
  mascotCustomization: MascotCustomization | null;
  
  // Templates
  templates: TemplateRecord[];
  
  // Settings
  settings: AppSettings;
  
  // Metadata
  metadata: {
    totalHabits: number;
    totalCompletions: number;
    dateRange: { start: string; end: string };
    exportedAt: string;
  };
}
```

### Schema Migration Strategy

```typescript
const SCHEMA_MIGRATIONS: Record<number, (data: any) => any> = {
  1: (data) => data, // v1 -> v1 (no-op)
  2: (data) => {
    // v1 -> v2: Add habit type field
    return {
      ...data,
      habits: data.habits.map(h => ({
        ...h,
        type: h.type || 'positive'
      }))
    };
  },
  // Future migrations...
};

function migrateToLatest(data: any, fromVersion: number): BackupPayload {
  let current = data;
  for (let v = fromVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    if (SCHEMA_MIGRATIONS[v]) {
      current = SCHEMA_MIGRATIONS[v](current);
    }
  }
  return current;
}
```

---

## 4. Platform-Specific Implementation

### 4.1 iOS - CloudKit Implementation

> **Why CloudKit over iCloud Documents?**  
> - Native API with automatic conflict resolution  
> - Push notifications for changes  
> - Works when app is suspended  
> - Proper authentication via iCloud account

#### Architecture

```
┌───────────────────────────────────────────────────────┐
│                Native Module (Swift)                   │
│  ┌─────────────────────────────────────────────────┐  │
│  │            CloudKitBackupModule                  │  │
│  │  - CKContainer (private database)               │  │
│  │  - CKRecordZone (custom zone: "BackupZone")     │  │
│  │  - CKRecord (type: "Backup")                    │  │
│  │  - CKAsset (for large backup files)             │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
                         │
                   React Native Bridge
                         │
┌───────────────────────────────────────────────────────┐
│              JavaScript Interface                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │           iCloudProvider.ts                      │  │
│  │  - checkAvailability()                           │  │
│  │  - uploadBackup(data, onProgress)                │  │
│  │  - downloadBackup(id, onProgress)                │  │
│  │  - listBackups()                                 │  │
│  │  - deleteBackup(id)                              │  │
│  │  - subscribeToChanges(callback)                  │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

#### Xcode Configuration Required

```xml
<!-- ios/HabitTracker/HabitTracker.entitlements -->
<key>com.apple.developer.icloud-services</key>
<array>
  <string>CloudKit</string>
</array>
<key>com.apple.developer.icloud-container-identifiers</key>
<array>
  <string>iCloud.com.habittracker.mobile</string>
</array>
```

#### Native Module Interface (Swift)

```swift
@objc(CloudKitBackupModule)
class CloudKitBackupModule: NSObject {
  
  private let container = CKContainer(identifier: "iCloud.com.habittracker.mobile")
  private var privateDB: CKDatabase { container.privateCloudDatabase }
  private let zoneID = CKRecordZone.ID(zoneName: "BackupZone", ownerName: CKCurrentUserDefaultName)
  
  @objc
  func checkAvailability(_ resolve: @escaping RCTPromiseResolveBlock,
                         reject: @escaping RCTPromiseRejectBlock) {
    container.accountStatus { status, error in
      if let error = error {
        reject("ICLOUD_ERROR", error.localizedDescription, error)
        return
      }
      resolve(status == .available)
    }
  }
  
  @objc
  func uploadBackup(_ jsonData: String,
                    metadata: NSDictionary,
                    resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
    // 1. Create temp file for CKAsset
    // 2. Create CKRecord with metadata
    // 3. Upload with progress tracking
    // 4. Return record ID
  }
  
  @objc
  func downloadBackup(_ recordId: String,
                      resolve: @escaping RCTPromiseResolveBlock,
                      reject: @escaping RCTPromiseRejectBlock) {
    // 1. Fetch CKRecord
    // 2. Download CKAsset
    // 3. Return decrypted data
  }
  
  @objc 
  func subscribeToChanges(_ resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    // Set up CKSubscription for push notifications
  }
}
```

---

### 4.2 Android - Google Drive Implementation

#### Architecture

```
┌───────────────────────────────────────────────────────┐
│                Google Drive Provider                   │
│  ┌─────────────────────────────────────────────────┐  │
│  │            GoogleDriveProvider.ts                │  │
│  │                                                  │  │
│  │  ┌──────────────┐    ┌─────────────────────┐    │  │
│  │  │ AuthManager  │    │    DriveClient      │    │  │
│  │  │ - signIn()   │    │ - uploadFile()      │    │  │
│  │  │ - signOut()  │    │ - downloadFile()    │    │  │
│  │  │ - refresh()  │    │ - listFiles()       │    │  │
│  │  └──────────────┘    │ - deleteFile()      │    │  │
│  │                      └─────────────────────┘    │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

#### Token Management

```typescript
class GoogleAuthManager {
  private static readonly TOKEN_KEY = 'google_drive_tokens';
  
  async getValidAccessToken(): Promise<string> {
    const tokens = await SecureStore.getItemAsync(this.TOKEN_KEY);
    if (!tokens) throw new AuthRequiredError();
    
    const { accessToken, refreshToken, expiresAt } = JSON.parse(tokens);
    
    // Check if token is expired (with 5min buffer)
    if (Date.now() > expiresAt - 5 * 60 * 1000) {
      return await this.refreshAccessToken(refreshToken);
    }
    
    return accessToken;
  }
  
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Use Google's token refresh endpoint
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_WEB_CLIENT_ID,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      
      if (!response.ok) {
        throw new TokenRefreshError();
      }
      
      const data = await response.json();
      await this.storeTokens(data);
      return data.access_token;
      
    } catch (error) {
      // Token refresh failed - user needs to re-authenticate
      await this.clearTokens();
      throw new AuthRequiredError('Session expired. Please sign in again.');
    }
  }
}
```

#### Drive API Wrapper

```typescript
class GoogleDriveClient {
  private authManager: GoogleAuthManager;
  private readonly APP_FOLDER = 'appDataFolder'; // Hidden app-specific folder
  
  async uploadBackup(
    data: string, 
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const accessToken = await this.authManager.getValidAccessToken();
    
    // 1. Check for existing file with same name
    const existingFile = await this.findFile(filename);
    
    // 2. Create multipart upload
    const boundary = '-------HabitTrackerBoundary';
    const metadata = {
      name: filename,
      parents: [this.APP_FOLDER],
      mimeType: 'application/json',
    };
    
    const body = this.createMultipartBody(boundary, metadata, data);
    
    // 3. Upload with progress tracking
    const url = existingFile 
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    
    const response = await this.uploadWithProgress(url, body, accessToken, onProgress);
    
    return response.id;
  }
  
  private async uploadWithProgress(
    url: string, 
    body: string, 
    token: string,
    onProgress?: (progress: number) => void
  ): Promise<DriveFile> {
    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new DriveUploadError(xhr.status, xhr.responseText));
        }
      };
      
      xhr.onerror = () => reject(new NetworkError());
      
      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', 'multipart/related; boundary=...');
      xhr.send(body);
    });
  }
}
```

---

## 5. Security & Encryption

### Encryption Strategy

```typescript
class BackupEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_DERIVATION = 'PBKDF2';
  private static readonly ITERATIONS = 100000;
  
  /**
   * Encrypt backup data using user's passphrase or device-backed key
   */
  static async encrypt(
    data: string, 
    options: { usePassphrase?: string; useDeviceKey?: boolean }
  ): Promise<{ encrypted: string; iv: string; salt: string; authTag: string }> {
    // Generate or derive key
    const salt = await Crypto.getRandomBytesAsync(16);
    const iv = await Crypto.getRandomBytesAsync(12);
    
    let key: ArrayBuffer;
    if (options.usePassphrase) {
      // Derive key from passphrase
      key = await this.deriveKey(options.usePassphrase, salt);
    } else {
      // Use device-backed key (stored in Keychain/Keystore)
      key = await this.getOrCreateDeviceKey();
    }
    
    // Encrypt using AES-256-GCM
    const encrypted = await Crypto.encryptAsync(
      this.ALGORITHM,
      key,
      data,
      { iv, additionalData: 'habit-tracker-backup' }
    );
    
    return {
      encrypted: this.toBase64(encrypted.ciphertext),
      iv: this.toBase64(iv),
      salt: this.toBase64(salt),
      authTag: this.toBase64(encrypted.authTag),
    };
  }
  
  /**
   * Decrypt backup data
   */
  static async decrypt(
    encryptedData: { encrypted: string; iv: string; salt: string; authTag: string },
    options: { usePassphrase?: string; useDeviceKey?: boolean }
  ): Promise<string> {
    const { encrypted, iv, salt, authTag } = encryptedData;
    
    let key: ArrayBuffer;
    if (options.usePassphrase) {
      key = await this.deriveKey(options.usePassphrase, this.fromBase64(salt));
    } else {
      key = await this.getOrCreateDeviceKey();
    }
    
    const decrypted = await Crypto.decryptAsync(
      this.ALGORITHM,
      key,
      this.fromBase64(encrypted),
      { 
        iv: this.fromBase64(iv), 
        authTag: this.fromBase64(authTag),
        additionalData: 'habit-tracker-backup' 
      }
    );
    
    return decrypted;
  }
}
```

### Key Management

| Key Type | Storage Location | Use Case |
|----------|------------------|----------|
| Device Key | iOS Keychain / Android Keystore | Default encryption, no user input |
| Passphrase-derived | Not stored (derived on-demand) | Optional extra security |
| Recovery Key | Displayed once for user to save | Account recovery |

---

## 6. Conflict Resolution

### Strategy: Last-Writer-Wins with Merge

```typescript
interface ConflictResolutionStrategy {
  // Metadata comparison
  compareBackups(local: BackupMetadata, remote: BackupMetadata): 'local' | 'remote' | 'conflict';
  
  // Full resolution
  resolveConflict(local: BackupPayload, remote: BackupPayload): ResolvedBackup;
}

class SmartMergeStrategy implements ConflictResolutionStrategy {
  compareBackups(local: BackupMetadata, remote: BackupMetadata): 'local' | 'remote' | 'conflict' {
    // If timestamps differ by less than 1 minute, it's likely the same operation
    const timeDiff = Math.abs(
      new Date(local.createdAt).getTime() - new Date(remote.createdAt).getTime()
    );
    
    if (timeDiff < 60000) return 'local'; // Same backup, keep local
    
    // If from same device, use timestamp
    if (local.deviceId === remote.deviceId) {
      return new Date(local.createdAt) > new Date(remote.createdAt) ? 'local' : 'remote';
    }
    
    // Different devices - need merge or user decision
    return 'conflict';
  }
  
  resolveConflict(local: BackupPayload, remote: BackupPayload): ResolvedBackup {
    const merged: BackupPayload = {
      habits: this.mergeHabits(local.habits, remote.habits),
      completions: this.mergeCompletions(local.completions, remote.completions),
      entries: this.mergeEntries(local.entries, remote.entries),
      // For single-value data, use most recent
      profile: this.pickLatest(local.profile, remote.profile),
      mascotCustomization: this.pickLatest(local.mascotCustomization, remote.mascotCustomization),
      templates: this.mergeTemplates(local.templates, remote.templates),
      settings: this.mergeSettings(local.settings, remote.settings),
    };
    
    return { payload: merged, conflicts: [] };
  }
  
  private mergeHabits(localHabits: HabitRecord[], remoteHabits: HabitRecord[]): HabitRecord[] {
    const habitMap = new Map<string, HabitRecord>();
    
    // Add all local habits
    for (const habit of localHabits) {
      habitMap.set(habit.id, habit);
    }
    
    // Merge remote habits
    for (const remoteHabit of remoteHabits) {
      const localHabit = habitMap.get(remoteHabit.id);
      
      if (!localHabit) {
        // New habit from remote
        habitMap.set(remoteHabit.id, remoteHabit);
      } else {
        // Conflict - use most recently updated
        const localUpdated = new Date(localHabit.updated_at || localHabit.created_at);
        const remoteUpdated = new Date(remoteHabit.updated_at || remoteHabit.created_at);
        
        if (remoteUpdated > localUpdated) {
          habitMap.set(remoteHabit.id, remoteHabit);
        }
        // else keep local
      }
    }
    
    return Array.from(habitMap.values());
  }
  
  private mergeCompletions(local: CompletionRecord[], remote: CompletionRecord[]): CompletionRecord[] {
    // Completions are additive - union of both sets
    const completionMap = new Map<string, CompletionRecord>();
    
    for (const c of [...local, ...remote]) {
      const key = `${c.habit_id}:${c.date}`;
      const existing = completionMap.get(key);
      
      if (!existing || c.completion_count > existing.completion_count) {
        completionMap.set(key, c);
      }
    }
    
    return Array.from(completionMap.values());
  }
}
```

### User-Facing Conflict UI

When automatic merge isn't possible:

```
┌─────────────────────────────────────────────────────────────┐
│                    ⚠️ Sync Conflict                          │
├─────────────────────────────────────────────────────────────┤
│ Changes were made on multiple devices. Choose how to        │
│ resolve:                                                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📱 This Device                                       │    │
│  │ Last updated: Today at 2:34 PM                       │    │
│  │ 12 habits, 156 completions                           │    │
│  │                                    [Use This]        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ☁️ Cloud Backup                                      │    │
│  │ Last updated: Yesterday at 8:12 PM                   │    │
│  │ 11 habits, 148 completions                           │    │
│  │                                    [Use This]        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│                    [🔀 Smart Merge]                          │
│                                                              │
│  Smart merge combines data from both sources, keeping        │
│  all habits and the highest completion counts.               │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Automatic Backup Scheduling

### Scheduling Strategy

```typescript
interface BackupScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'on_change';
  preferredTime?: string;        // e.g., "02:00" (2 AM)
  wifiOnly: boolean;
  minimumChangeThreshold: number; // Min completions before backup
}

class BackupScheduler {
  private config: BackupScheduleConfig;
  private lastBackupTime: Date | null = null;
  private pendingChanges = 0;
  
  /**
   * Check if backup should run now
   */
  shouldBackupNow(): boolean {
    if (!this.config.enabled) return false;
    
    // Check network conditions
    if (this.config.wifiOnly && !this.isOnWifi()) return false;
    
    switch (this.config.frequency) {
      case 'daily':
        return this.isDailyBackupDue();
      case 'weekly':
        return this.isWeeklyBackupDue();
      case 'on_change':
        return this.pendingChanges >= this.config.minimumChangeThreshold;
    }
  }
  
  /**
   * Track changes for on_change mode
   */
  recordChange(type: 'habit' | 'completion' | 'setting') {
    this.pendingChanges++;
    
    // Trigger immediate backup if threshold hit
    if (this.config.frequency === 'on_change' && this.shouldBackupNow()) {
      this.triggerBackup();
    }
  }
  
  /**
   * Schedule background task (iOS Background Fetch / Android WorkManager)
   */
  async scheduleBackgroundBackup(): Promise<void> {
    if (Platform.OS === 'ios') {
      await BackgroundFetch.registerTaskAsync('BACKUP_TASK', {
        minimumInterval: 24 * 60 * 60, // 1 day
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } else {
      // Android: Use expo-background-fetch or WorkManager
      await BackgroundFetch.registerTaskAsync('BACKUP_TASK', {
        minimumInterval: 24 * 60 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  }
}
```

---

## 8. Offline Support & Sync Queue

### Operation Queue

```typescript
interface QueuedOperation {
  id: string;
  type: 'backup' | 'delete';
  createdAt: Date;
  retryCount: number;
  maxRetries: number;
  payload: any;
  status: 'pending' | 'in_progress' | 'failed' | 'completed';
}

class OfflineSyncQueue {
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  
  /**
   * Add operation to queue (persisted to AsyncStorage)
   */
  async enqueue(operation: Omit<QueuedOperation, 'id' | 'status' | 'retryCount'>): Promise<string> {
    const op: QueuedOperation = {
      ...operation,
      id: uuid(),
      status: 'pending',
      retryCount: 0,
    };
    
    this.queue.push(op);
    await this.persistQueue();
    
    // Try to process immediately
    this.processQueue();
    
    return op.id;
  }
  
  /**
   * Process queue when online
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    if (!await this.isOnline()) return;
    
    this.isProcessing = true;
    
    for (const op of this.queue.filter(o => o.status === 'pending')) {
      try {
        op.status = 'in_progress';
        await this.executeOperation(op);
        op.status = 'completed';
      } catch (error) {
        op.retryCount++;
        if (op.retryCount >= op.maxRetries) {
          op.status = 'failed';
          this.notifyFailure(op, error);
        } else {
          op.status = 'pending';
        }
      }
      
      await this.persistQueue();
    }
    
    // Remove completed operations
    this.queue = this.queue.filter(o => o.status !== 'completed');
    await this.persistQueue();
    
    this.isProcessing = false;
  }
  
  /**
   * Listen for network changes
   */
  startNetworkListener(): void {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  }
}
```

---

## 9. UI/UX Design

### Backup Settings Screen

```
┌─────────────────────────────────────────────────────────────┐
│  ← Backup & Restore                                    ⚙️   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ☁️                                                  │    │
│  │ Cloud Backup                                         │    │
│  │ Safely store your habits in iCloud                   │    │
│  │                                                      │    │
│  │ Status: ✅ Last backup 2 hours ago                   │    │
│  │                                                      │    │
│  │         [☁️ Backup Now]    [📥 Restore]             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  🔄 Automatic Backup                          [  ON  ]      │
│                                                              │
│  📅 Frequency                                               │
│      ○ Daily                                                │
│      ● When changes are made                                │
│      ○ Weekly                                               │
│                                                              │
│  📶 Wi-Fi Only                                [  ON  ]      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  📋 Backup History                                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Today, 2:34 PM                              1.2 MB  │    │
│  │ 12 habits • iPhone 13                        [···]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Yesterday, 11:45 PM                         1.1 MB  │    │
│  │ 11 habits • iPhone 13                        [···]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  🔐 Security                                                │
│                                                              │
│  Encryption                                [Device Key]     │
│  Recovery Key                              [View/Copy]       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Progress Modal

```
┌─────────────────────────────────────────────────────────────┐
│                    Backing Up...                             │
│                                                              │
│     ╭────────────────────────────────────────────────╮      │
│     │ ████████████████████████░░░░░░░░░░░░░░░░░░░░ │      │
│     ╰────────────────────────────────────────────────╯      │
│                        65%                                   │
│                                                              │
│                 Uploading to iCloud...                       │
│                                                              │
│     📊 12 habits                                            │
│     ✅ 156 completions                                      │
│     📝 23 notes                                             │
│                                                              │
│                    [Cancel]                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Error Handling & Recovery

### Error Taxonomy

```typescript
enum BackupErrorCode {
  // Authentication
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  AUTH_REVOKED = 'AUTH_REVOKED',
  
  // Network
  NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  
  // Storage
  STORAGE_FULL = 'STORAGE_FULL',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Data
  INVALID_BACKUP = 'INVALID_BACKUP',
  CHECKSUM_MISMATCH = 'CHECKSUM_MISMATCH',
  SCHEMA_INCOMPATIBLE = 'SCHEMA_INCOMPATIBLE',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  
  // Platform
  ICLOUD_UNAVAILABLE = 'ICLOUD_UNAVAILABLE',
  DRIVE_UNAVAILABLE = 'DRIVE_UNAVAILABLE',
  
  // Unknown
  UNKNOWN = 'UNKNOWN',
}

interface BackupError {
  code: BackupErrorCode;
  message: string;
  userMessage: string;         // Friendly message for UI
  recoveryAction?: RecoveryAction;
  retryable: boolean;
  context?: Record<string, any>;
}

type RecoveryAction = 
  | { type: 'retry'; delayMs: number }
  | { type: 'reauthenticate' }
  | { type: 'freeUpSpace'; requiredBytes: number }
  | { type: 'contactSupport'; errorId: string };
```

### Recovery Strategies

```typescript
class ErrorRecoveryHandler {
  async handleError(error: BackupError): Promise<RecoveryResult> {
    switch (error.code) {
      case BackupErrorCode.AUTH_EXPIRED:
        // Try silent token refresh
        const refreshed = await this.attemptTokenRefresh();
        if (refreshed) {
          return { action: 'retry', success: true };
        }
        return { action: 'reauthenticate', success: false };
        
      case BackupErrorCode.NETWORK_UNAVAILABLE:
        // Queue for later
        await this.offlineQueue.enqueue(error.context?.operation);
        return { action: 'queued', success: true };
        
      case BackupErrorCode.CHECKSUM_MISMATCH:
        // Backup file corrupted - try previous backup
        return this.attemptPreviousBackup(error.context?.backupId);
        
      case BackupErrorCode.STORAGE_FULL:
        // Offer to delete old backups
        const oldBackups = await this.findDeletableBackups();
        return { 
          action: 'user_decision', 
          options: { deletableBackups: oldBackups },
          success: false 
        };
        
      default:
        return { action: 'show_error', success: false };
    }
  }
}
```

---

## 11. Testing Strategy

### Test Categories

| Category | Coverage Target | Tools |
|----------|----------------|-------|
| Unit Tests | 90% | Jest |
| Integration Tests | 80% | Jest + Mock Servers |
| E2E Tests | Critical Paths | Detox |
| Manual QA | Edge Cases | Physical Devices |

### Critical Test Scenarios

```typescript
describe('Backup & Restore', () => {
  describe('Happy Path', () => {
    test('creates backup with all data');
    test('restores backup completely');
    test('lists backups sorted by date');
    test('deletes backup successfully');
  });
  
  describe('Authentication', () => {
    test('handles expired token with silent refresh');
    test('prompts re-auth when refresh fails');
    test('handles revoked permissions gracefully');
  });
  
  describe('Offline Behavior', () => {
    test('queues backup when offline');
    test('processes queue when back online');
    test('shows pending status in UI');
  });
  
  describe('Conflict Resolution', () => {
    test('auto-merges compatible changes');
    test('prompts user for incompatible changes');
    test('preserves all completions in merge');
  });
  
  describe('Error Recovery', () => {
    test('retries on transient network error');
    test('handles storage full gracefully');
    test('validates checksum on restore');
    test('migrates old schema versions');
  });
  
  describe('Encryption', () => {
    test('encrypts backup data');
    test('decrypts with correct key');
    test('fails with wrong passphrase');
  });
});
```

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Solid base architecture and data layer

- [ ] **P1.1** Create `packages/backup` with modular architecture
- [ ] **P1.2** Implement `BackupOrchestrator` state machine
- [ ] **P1.3** Refactor `DataExporter` with compression + versioning
- [ ] **P1.4** Implement `BackupEncryption` service
- [ ] **P1.5** Create comprehensive type definitions
- [ ] **P1.6** Write unit tests for data layer (90% coverage)

**Checkpoint**: Local backup file creation/reading with encryption works

---

### Phase 2: iOS CloudKit Integration (Week 3-4)
**Goal**: Native CloudKit implementation for iOS

- [ ] **P2.1** Create Swift native module `CloudKitBackupModule`
- [ ] **P2.2** Configure Xcode entitlements for CloudKit
- [ ] **P2.3** Implement `iCloudProvider.ts` JavaScript bridge
- [ ] **P2.4** Add push notification subscription for changes
- [ ] **P2.5** Implement progress tracking with native callbacks
- [ ] **P2.6** Write integration tests with CloudKit sandbox

**Checkpoint**: Full backup/restore cycle works on iOS device with iCloud

---

### Phase 3: Android Google Drive (Week 5-6)
**Goal**: Robust Google Drive implementation with token management

- [ ] **P3.1** Implement `GoogleAuthManager` with token refresh
- [ ] **P3.2** Store tokens securely in Android Keystore
- [ ] **P3.3** Implement `GoogleDriveClient` with progress tracking
- [ ] **P3.4** Handle all OAuth error cases gracefully
- [ ] **P3.5** Create sign-in/sign-out UI flow
- [ ] **P3.6** Write integration tests with Drive API sandbox

**Checkpoint**: Full backup/restore cycle works on Android device

---

### Phase 4: Conflict Resolution & Sync (Week 7-8)
**Goal**: Multi-device sync with intelligent conflict handling

- [ ] **P4.1** Implement `SmartMergeStrategy`
- [ ] **P4.2** Create conflict detection system
- [ ] **P4.3** Build conflict resolution UI
- [ ] **P4.4** Implement `OfflineSyncQueue`
- [ ] **P4.5** Add network state listener
- [ ] **P4.6** Write conflict resolution tests

**Checkpoint**: Two devices can sync and resolve conflicts

---

### Phase 5: Automatic Backup & Scheduling (Week 9)
**Goal**: Background backup with intelligent scheduling

- [ ] **P5.1** Implement `BackupScheduler`
- [ ] **P5.2** Configure iOS Background Fetch
- [ ] **P5.3** Configure Android WorkManager
- [ ] **P5.4** Add change tracking for on_change mode
- [ ] **P5.5** Create scheduling settings UI
- [ ] **P5.6** Test background execution on both platforms

**Checkpoint**: App backs up automatically in background

---

### Phase 6: UI/UX Polish (Week 10)
**Goal**: Premium-feeling user experience

- [ ] **P6.1** Design and implement `BackupSettingsScreen`
- [ ] **P6.2** Create animated progress modals
- [ ] **P6.3** Build backup history list with swipe actions
- [ ] **P6.4** Add error recovery UI flows
- [ ] **P6.5** Implement haptic feedback
- [ ] **P6.6** Add analytics tracking

**Checkpoint**: Complete, polished backup UI

---

### Phase 7: Security Hardening (Week 11)
**Goal**: Production-ready security

- [ ] **P7.1** Security audit of encryption implementation
- [ ] **P7.2** Implement recovery key generation/display
- [ ] **P7.3** Add passphrase option for extra security
- [ ] **P7.4** Implement secure data deletion
- [ ] **P7.5** Add audit logging
- [ ] **P7.6** Penetration testing

**Checkpoint**: Security review passed

---

### Phase 8: Testing & Launch (Week 12)
**Goal**: Production deployment

- [ ] **P8.1** E2E test suite with Detox
- [ ] **P8.2** Manual QA on multiple devices
- [ ] **P8.3** Performance profiling
- [ ] **P8.4** Beta testing with select users
- [ ] **P8.5** Documentation completion
- [ ] **P8.6** Feature flag for gradual rollout

**Checkpoint**: Feature ready for production

---

## Appendix A: Dependencies

### Required Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-native-google-signin/google-signin` | ^12.x | Google OAuth |
| `expo-secure-store` | ^13.x | Secure token storage |
| `expo-crypto` | ^13.x | Encryption |
| `expo-file-system` | ^17.x | File operations |
| `expo-background-fetch` | ^12.x | Background tasks |
| `@react-native-community/netinfo` | ^11.x | Network state |
| `pako` | ^2.x | Compression |

### Native Module Requirements

- **iOS**: Swift native module for CloudKit
- **Android**: No additional native code needed

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **CKRecord** | CloudKit record type for storing data |
| **CKAsset** | CloudKit asset for large binary data |
| **OAuth 2.0** | Authorization framework for Google |
| **PKCE** | Proof Key for Code Exchange (OAuth security extension) |
| **AES-256-GCM** | Encryption algorithm with authenticated encryption |
---

## Appendix C: Apple Developer Account & CloudKit Setup

> **Required for iOS backup functionality**

### Step 1: Create Apple Developer Account

1. Go to [developer.apple.com](https://developer.apple.com/)
2. Click **Account** → **Start Your Enrollment**
3. Sign in with your Apple ID (or create one)
4. Choose **Individual** or **Organization** enrollment
5. Pay the $99/year fee
6. Wait for approval (usually 24-48 hours)

### Step 2: Create App ID with CloudKit

1. Sign in to [developer.apple.com/account](https://developer.apple.com/account)
2. Go to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add)
4. Select **App IDs** → Continue
5. Enter:
   - **Description**: `Habit Tracker`
   - **Bundle ID**: `com.habittracker.mobile` (Explicit)
6. Scroll to **Capabilities** and enable:
   - ✅ **iCloud** (check CloudKit)
   - ✅ **Push Notifications** (for sync notifications)
7. Click **Continue** → **Register**

### Step 3: Create iCloud Container

1. Go to **Identifiers** → **+** (Add)
2. Select **iCloud Containers** → Continue
3. Enter:
   - **Description**: `Habit Tracker Backups`
   - **Identifier**: `iCloud.com.habittracker.mobile`
4. Click **Continue** → **Register**

### Step 4: Associate Container with App ID

1. Go back to **Identifiers** → Select your App ID
2. Click **Edit** next to iCloud
3. Check your container: `iCloud.com.habittracker.mobile`
4. Click **Continue** → **Save**

### Step 5: Configure Xcode Project

```bash
# Open Xcode project
open ios/HabitTracker.xcworkspace
```

1. Select your target → **Signing & Capabilities**
2. Click **+ Capability** → Add **iCloud**
3. Check **CloudKit**
4. Select your container: `iCloud.com.habittracker.mobile`
5. Click **+ Capability** → Add **Background Modes**
6. Check **Remote notifications**

### Step 6: Verify in CloudKit Dashboard

1. Go to [icloud.developer.apple.com](https://icloud.developer.apple.com/)
2. Sign in with your developer account
3. Select your container
4. You should see the development and production environments
5. This is where you can monitor records and debug issues

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "No iCloud account" | Ensure device is signed into iCloud |
| Container not found | Check bundle ID matches exactly |
| Permission denied | Regenerate provisioning profiles |

---

## Appendix D: Google Cloud Console Setup

> **Required for Android backup functionality**

### Step 1: Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Click **Select Project** → **New Project**
3. Enter:
   - **Project name**: `habit-tracker-mobile`
   - **Organization**: (your org or leave blank)
4. Click **Create**

### Step 2: Enable Google Drive API

1. In your project, go to **APIs & Services** → **Library**
2. Search for **Google Drive API**
3. Click on it → **Enable**
4. Wait for activation (few seconds)

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public apps) → **Create**
3. Fill in:
   - **App name**: `Habit Tracker`
   - **User support email**: your email
   - **Developer contact**: your email
4. Click **Save and Continue**
5. **Scopes**: Click **Add or Remove Scopes**
   - Add: `https://www.googleapis.com/auth/drive.appdata`
   - Add: `https://www.googleapis.com/auth/drive.file`
6. Click **Save and Continue**
7. **Test users**: Add your test email addresses
8. Click **Save and Continue** → **Back to Dashboard**

### Step 4: Create OAuth Client IDs

#### For Android:

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Android**
4. Enter:
   - **Name**: `Habit Tracker Android`
   - **Package name**: `com.habittracker.mobile`
   - **SHA-1 certificate fingerprint**: (see below)
5. Click **Create**

**Getting SHA-1 fingerprint:**
```bash
# Debug keystore (for development)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Look for SHA1: XX:XX:XX:XX:...
```

#### For Web (required for refresh tokens):

1. Click **+ Create Credentials** → **OAuth client ID**
2. Select **Web application**
3. Enter:
   - **Name**: `Habit Tracker Web Client`
   - **Authorized JavaScript origins**: (leave blank for now)
   - **Authorized redirect URIs**: (leave blank for now)
4. Click **Create**
5. **IMPORTANT**: Copy the **Client ID** - you'll need this as `GOOGLE_WEB_CLIENT_ID`

### Step 5: Configure App

Create environment file with your credentials:

```bash
# .env.local (do not commit to git!)
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

### Step 6: Publish OAuth App (for production)

1. Go to **OAuth consent screen**
2. Click **Publish App**
3. Click **Confirm**
4. Wait for Google review (can take 2-4 weeks for sensitive scopes)

> **Note**: While in "Testing" mode, only test users you added can sign in. For production, you need to complete the verification process.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access blocked" | Add yourself as test user |
| "Invalid client" | Check Web Client ID is used |
| Sign-in fails | Regenerate SHA-1 and update |
| Token refresh fails | Ensure offline access enabled |

### Cost Considerations

- **Google Drive API**: Free for personal use
- **Quota**: 1 billion API calls/day (more than enough)
- **Storage**: Uses user's own Drive storage (not yours)

---

## Appendix E: Implementation Decisions

Based on project requirements, the following decisions have been made:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Start fresh vs iterate** | Start fresh | Existing implementation has fundamental gaps |
| **Encryption method** | Device-backed key | Seamless UX, no passphrase needed |
| **iCloud method** | Native CloudKit | More reliable than file system approach |
| **Backup format** | Encrypted JSON | Simple, portable, secure |
| **Conflict resolution** | Smart merge + LWW | Automatic for most cases |

---

*Document Version: 1.1*  
*Last Updated: December 2024*  
*Author: AI Assistant*
