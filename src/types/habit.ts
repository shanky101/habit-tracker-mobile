// Habit data types

// Time period types for habit scheduling
export type HabitTimePeriod = 'morning' | 'afternoon' | 'evening' | 'night' | 'allday';

export interface TimeRangeSettings {
    morning: { start: string; end: string };      // e.g., "05:00" - "12:00"
    afternoon: { start: string; end: string };    // e.g., "12:00" - "17:00"
    evening: { start: string; end: string };      // e.g., "17:00" - "21:00"
    night: { start: string; end: string };        // e.g., "21:00" - "05:00"
}

export interface HabitEntry {
    id: string;
    date: string;
    mood?: string;
    note?: string;
    timestamp: number;
}

export interface DailyCompletion {
    date: string; // ISO format (YYYY-MM-DD)
    completionCount: number;
    targetCount: number;
    timestamps: number[];
    entries: HabitEntry[];
}

export interface Habit {
    id: string;
    name: string;
    emoji: string;
    streak: number;
    category: string;
    color: string;
    frequency: 'daily' | 'weekly';
    frequencyType: 'single' | 'multiple';
    targetCompletionsPerDay: number;
    selectedDays: number[]; // 0-6 for Sunday-Saturday
    timePeriod: HabitTimePeriod; // NEW: When this habit should be done
    type: 'positive' | 'negative'; // NEW: Positive (build) or Negative (quit) habit
    reminderEnabled: boolean;
    reminderTime?: string; // HH:MM format
    notificationIds?: string[];
    notes?: string;
    completions: Record<string, DailyCompletion>;
    isDefault?: boolean;
    archived?: boolean;
    createdAt?: string;
}
