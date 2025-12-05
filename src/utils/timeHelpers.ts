import { HabitTimePeriod, TimeRangeSettings } from '@/types/habit';
import { Ionicons } from '@expo/vector-icons';

/**
 * Get the current time period based on current time and settings
 */
export function getCurrentTimePeriod(
    timeRanges: TimeRangeSettings,
    currentTime?: Date
): HabitTimePeriod {
    const now = currentTime || new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Check each period
    for (const [period, range] of Object.entries(timeRanges) as [keyof TimeRangeSettings, { start: string; end: string }][]) {
        if (isTimeInPeriod(currentTimeString, period, timeRanges)) {
            return period;
        }
    }

    return 'anytime';
}

/**
 * Check if a time falls within a period
 * Handles overnight periods (e.g., night: 21:00 - 05:00)
 */
export function isTimeInPeriod(
    time: string,
    period: HabitTimePeriod,
    timeRanges: TimeRangeSettings
): boolean {
    if (period === 'anytime') return true;

    const range = timeRanges[period as keyof TimeRangeSettings];
    if (!range) return false;

    const timeMinutes = timeStringToMinutes(time);
    const startMinutes = timeStringToMinutes(range.start);
    const endMinutes = timeStringToMinutes(range.end);

    // Handle overnight period (e.g., 21:00 - 05:00)
    if (startMinutes > endMinutes) {
        return timeMinutes >= startMinutes || timeMinutes < endMinutes;
    }

    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeStringToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Get icon name for time period (Ionicons)
 */
export function getTimePeriodIcon(period: HabitTimePeriod): keyof typeof Ionicons.glyphMap {
    switch (period) {
        case 'morning':
            return 'sunny-outline';
        case 'afternoon':
            return 'sunny';
        case 'evening':
            return 'moon-outline';
        case 'night':
            return 'moon';
        case 'anytime':
        default:
            return 'time-outline';
    }
}

/**
 * Get display label for time period
 */
export function getTimePeriodLabel(period: HabitTimePeriod): string {
    switch (period) {
        case 'morning':
            return 'Morning';
        case 'afternoon':
            return 'Afternoon';
        case 'evening':
            return 'Evening';
        case 'night':
            return 'Night';
        case 'anytime':
        default:
            return 'Anytime';
    }
}

/**
 * Get time range display string
 */
export function getTimePeriodRange(
    period: HabitTimePeriod,
    timeRanges: TimeRangeSettings
): string {
    if (period === 'anytime') {
        return 'No specific time';
    }

    const range = timeRanges[period as keyof TimeRangeSettings];
    if (!range) return '';

    return `${formatTime(range.start)} - ${formatTime(range.end)}`;
}

/**
 * Format time string from 24h (HH:MM) to 12h (h:MM AM/PM)
 */
function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get color for time period icon (light theme)
 */
export function getTimePeriodColor(period: HabitTimePeriod, isDark: boolean = false): string {
    if (isDark) {
        switch (period) {
            case 'morning':
                return '#fb923c';
            case 'afternoon':
                return '#fbbf24';
            case 'evening':
                return '#a78bfa';
            case 'night':
                return '#6366f1';
            case 'anytime':
            default:
                return '#9ca3af';
        }
    }

    // Light theme colors
    switch (period) {
        case 'morning':
            return '#f97316';
        case 'afternoon':
            return '#f59e0b';
        case 'evening':
            return '#8b5cf6';
        case 'night':
            return '#4f46e5';
        case 'anytime':
        default:
            return '#6b7280';
    }
}
