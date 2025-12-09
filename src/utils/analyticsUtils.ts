import { Habit, HabitEntry, DailyCompletion } from '../types/habit';
import { differenceInDays, format, subDays, startOfDay, getDay, parseISO, isSameDay } from 'date-fns';

// --- Types ---

export interface HeatmapPoint {
    date: string; // YYYY-MM-DD
    count: number;
    level: 0 | 1 | 2 | 3 | 4; // 0=Empty, 4=High
}

export interface CategoryData {
    name: string;
    value: number;
    color: string;
    count: number;
    total: number;
}

export interface TimeOfDayData {
    label: string;
    value: number;
    color: string;
}

export interface MoodData {
    mood: string;
    completionRate: number;
    count: number;
}

// --- Helpers ---

const getHabitColor = (category: string, themeColors: any): string => {
    // Map categories to colors (can be enhanced with actual theme logic)
    const colors: Record<string, string> = {
        'Health': '#22C55E', // Green
        'Fitness': '#F97316', // Orange
        'Productivity': '#3B82F6', // Blue
        'Mindfulness': '#8B5CF6', // Purple
        'Learning': '#EAB308', // Yellow
        'Finance': '#10B981', // Emerald
        'Social': '#EC4899', // Pink
        'Other': '#64748B', // Slate
    };
    return colors[category] || themeColors.primary;
};

// --- Core Functions ---

/**
 * Generates data for the Consistency Heatmap (GitHub style)
 */
export const getConsistencyHeatmapData = (habits: Habit[], days: number = 90): HeatmapPoint[] => {
    const today = new Date();
    const startDate = subDays(today, days);
    const data: Record<string, number> = {};

    // Initialize all days with 0
    for (let i = 0; i <= days; i++) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        data[dateStr] = 0;
    }

    // Calculate completion percentage for each day
    habits.forEach(habit => {
        if (habit.archived) return;

        const completions = habit.completions || {};
        Object.keys(completions).forEach(dateStr => {
            if (data[dateStr] !== undefined) {
                const completion = completions[dateStr];
                if (completion.completionCount >= completion.targetCount) {
                    data[dateStr] += 1;
                }
            }
        });
    });

    // Normalize to levels 0-4
    // Level is based on % of active habits completed that day
    // Note: This is an approximation as we don't track historical "active habits count" perfectly
    // We'll use the current active habits count as the denominator for simplicity
    const activeHabitCount = habits.filter(h => !h.archived).length || 1;

    return Object.entries(data).map(([date, count]) => {
        const percentage = count / activeHabitCount;
        let level: 0 | 1 | 2 | 3 | 4 = 0;

        if (percentage === 0) level = 0;
        else if (percentage <= 0.25) level = 1;
        else if (percentage <= 0.50) level = 2;
        else if (percentage <= 0.75) level = 3;
        else level = 4;

        return { date, count, level };
    }).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Generates data for Category Distribution (Donut Chart)
 */
export const getCategoryDistribution = (habits: Habit[], themeColors: any): CategoryData[] => {
    const distribution: Record<string, { count: number; total: number }> = {};

    habits.forEach(habit => {
        if (habit.archived) return;

        const category = habit.category || 'Other';
        if (!distribution[category]) {
            distribution[category] = { count: 0, total: 0 };
        }

        // Count total completions for this habit
        const totalCompletions = Object.values(habit.completions || {}).reduce(
            (sum, c) => sum + c.completionCount,
            0
        );

        distribution[category].count += totalCompletions;
        distribution[category].total += 1; // Count of habits in this category
    });

    return Object.entries(distribution)
        .map(([name, data]) => ({
            name,
            value: data.count,
            count: data.count,
            total: data.total,
            color: getHabitColor(name, themeColors),
        }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);
};

/**
 * Generates data for Time of Day Analysis (Bar Chart)
 */
export const getTimeOfDayDistribution = (habits: Habit[], themeColors: any): TimeOfDayData[] => {
    const buckets = {
        'Morning': 0,   // 5am - 12pm
        'Afternoon': 0, // 12pm - 5pm
        'Evening': 0,   // 5pm - 9pm
        'Night': 0,     // 9pm - 5am
    };

    habits.forEach(habit => {
        const completions = habit.completions || {};
        Object.values(completions).forEach(completion => {
            completion.timestamps.forEach(ts => {
                const date = new Date(ts);
                const hour = date.getHours();

                if (hour >= 5 && hour < 12) buckets['Morning']++;
                else if (hour >= 12 && hour < 17) buckets['Afternoon']++;
                else if (hour >= 17 && hour < 21) buckets['Evening']++;
                else buckets['Night']++;
            });
        });
    });

    const colors = {
        'Morning': '#FDBA74', // Orange-300
        'Afternoon': '#F59E0B', // Amber-500
        'Evening': '#8B5CF6', // Violet-500
        'Night': '#312E81',   // Indigo-900
    };

    return Object.entries(buckets).map(([label, value]) => ({
        label,
        value,
        color: (colors as any)[label] || themeColors.primary,
    }));
};

/**
 * Calculates the "Perfect Days" count
 */
export const getPerfectDaysCount = (habits: Habit[]): number => {
    const activeHabits = habits.filter(h => !h.archived);
    if (activeHabits.length === 0) return 0;

    const completionMap: Record<string, number> = {};

    activeHabits.forEach(habit => {
        Object.keys(habit.completions || {}).forEach(date => {
            const completion = habit.completions[date];
            if (completion.completionCount >= completion.targetCount) {
                completionMap[date] = (completionMap[date] || 0) + 1;
            }
        });
    });

    // A perfect day is when completion count matches active habit count
    // Note: This is an approximation for historical data
    return Object.values(completionMap).filter(count => count >= activeHabits.length).length;
};

/**
 * Calculates User Level and XP
 * 1 Completion = 10 XP
 * Level = sqrt(XP / 100)
 */
export const getUserLevel = (habits: Habit[]) => {
    let totalCompletions = 0;
    habits.forEach(habit => {
        totalCompletions += Object.values(habit.completions || {}).reduce(
            (sum, c) => sum + c.completionCount,
            0
        );
    });

    const xp = totalCompletions * 10;
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const nextLevelXp = Math.pow(level, 2) * 100;
    const currentLevelBaseXp = Math.pow(level - 1, 2) * 100;

    const progress = (xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp);

    return {
        level,
        xp,
        nextLevelXp,
        progress: Math.min(Math.max(progress, 0), 1), // Clamp 0-1
        totalCompletions
    };
};
