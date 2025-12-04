// Habit data types

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
    reminderEnabled: boolean;
    reminderTime?: string; // HH:MM format
    notificationIds?: string[];
    notes?: string;
    completions: Record<string, DailyCompletion>;
    isDefault?: boolean;
    archived?: boolean;
    createdAt?: string;
}
