import { Habit } from '@/hooks/useHabits';

/**
 * Backup data structure
 */
export interface BackupData {
  version: number;
  timestamp: string;
  device: DeviceInfo;
  data: AppData;
  checksum: string;
}

/**
 * Device information
 */
export interface DeviceInfo {
  platform: 'ios' | 'android';
  deviceId: string;
  appVersion: string;
  osVersion?: string;
}

/**
 * All app data to backup
 */
export interface AppData {
  habits: Habit[];
  completions: CompletionRecord[];
  entries: EntryRecord[];
  mascotCustomization: MascotCustomization | null;
  settings: AppSettings;
  metadata: AppMetadata;
}

/**
 * Completion record from database
 */
export interface CompletionRecord {
  id: number;
  habit_id: string;
  date: string;
  completion_count: number;
  target_count: number;
  timestamps: string; // JSON string array
}

/**
 * Entry record from database
 */
export interface EntryRecord {
  id: string;
  habit_id: string;
  date: string;
  mood?: string;
  note?: string;
  timestamp: number;
}

/**
 * Mascot customization from database
 */
export interface MascotCustomization {
  id: string;
  name: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  blush_enabled: number;
  blush_color: string;
  hair_style: string;
  hair_color: string;
  hat: string;
  glasses: string;
  body_color: string;
  pattern: string;
  pattern_color?: string;
  necklace: string;
  special_effect: string;
  created_at: string;
  updated_at: string;
}

/**
 * App settings
 */
export interface AppSettings {
  theme?: string;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  hapticEnabled?: boolean;
  language?: string;
  [key: string]: any;
}

/**
 * App metadata
 */
export interface AppMetadata {
  initial_seed_done?: string;
  last_backup?: string;
  backup_count?: number;
  [key: string]: any;
}

/**
 * Backup metadata (stored separately from backup data)
 */
export interface BackupMetadata {
  id: string;
  name: string;
  timestamp: string;
  size: number; // in bytes
  habitCount: number;
  platform: 'ios' | 'android';
  deviceId: string;
}

/**
 * Backup info (for listing backups)
 */
export interface BackupInfo {
  id: string;
  name: string;
  date: Date;
  size: string; // formatted size (e.g., "2.5 MB")
  habitCount: number;
  platform: 'ios' | 'android';
}

/**
 * Backup operation result
 */
export interface BackupResult {
  success: boolean;
  backupId?: string;
  error?: string;
  message?: string;
}

/**
 * Restore operation result
 */
export interface RestoreResult {
  success: boolean;
  restoredHabits?: number;
  restoredCompletions?: number;
  restoredEntries?: number;
  error?: string;
  message?: string;
}

/**
 * Progress callback
 */
export type ProgressCallback = (progress: number, message?: string) => void;
