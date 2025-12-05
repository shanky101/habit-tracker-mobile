/**
 * Database row types (normalized SQLite representation)
 */

export interface HabitRow {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  category: string;
  color: string;
  frequency: 'daily' | 'weekly';
  frequency_type: 'single' | 'multiple';
  target_per_day: number;
  selected_days: string; // JSON string
  time_period: string; // 'anytime' | 'morning' | 'afternoon' | 'evening' | 'night'
  reminder_enabled: number; // SQLite boolean (0 or 1)
  reminder_time: string | null;
  notification_ids: string | null; // JSON string or null
  notes: string | null;
  is_default: number; // SQLite boolean
  archived: number; // SQLite boolean
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CompletionRow {
  id: number;
  habit_id: string;
  date: string;
  completion_count: number;
  target_count: number;
  timestamps: string; // JSON string
}

export interface EntryRow {
  id: string;
  habit_id: string;
  date: string;
  mood: string | null;
  note: string | null;
  timestamp: number;
}

export interface MascotRow {
  id: string;
  name: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  blush_enabled: number; // SQLite boolean (0 or 1)
  blush_color: string;
  hair_style: string;
  hair_color: string;
  hat: string;
  glasses: string;
  body_color: string;
  pattern: string;
  pattern_color: string | null;
  necklace: string;
  special_effect: string;
  created_at: string;
  updated_at: string;
}
