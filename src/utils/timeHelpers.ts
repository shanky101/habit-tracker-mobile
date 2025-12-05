import { HabitTimePeriod, TimeRangeSettings } from '@/types/habit';
import { Ionicons } from '@expo/vector-icons';

/**
 * Get display label for time period
 */
export const getTimePeriodLabel = (period: HabitTimePeriod): string => {
    const labels: Record<HabitTimePeriod, string> = {
        morning: 'Morning',
        afternoon: 'Afternoon',
        evening: 'Evening',
        night: 'Night',
        allday: 'All Day',
    };
    return labels[period];
};

/**
 * Get icon name for time period (Ionicons)
 */
export const getTimePeriodIcon = (period: HabitTimePeriod): string => {
    const icons: Record<HabitTimePeriod, string> = {
        morning: 'sunny-outline',
        afternoon: 'partly-sunny-outline',
        evening: 'moon-outline',
        night: 'moon',
        allday: 'sunny',
    };
    return icons[period];
};

/**
 * Get color for time period
 */
export const getTimePeriodColor = (period: HabitTimePeriod): string => {
    const colors: Record<HabitTimePeriod, string> = {
        morning: '#F59E0B', // Amber
        afternoon: '#FB923C', // Orange
        evening: '#8B5CF6', // Purple
        night: '#6366F1', // Indigo
        allday: '#FBBF24', // Bright Amber/Gold
    };
    return colors[period];
};

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

    return 'allday';
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
    if (period === 'allday') return true;

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
 * Get time range display string
 */
export function getTimePeriodRange(
    period: HabitTimePeriod,
    timeRanges: TimeRangeSettings
): string {
    if (period === 'allday') {
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
export function getTimePeriodColorWithTheme(period: HabitTimePeriod, isDark: boolean = false): string {
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
            case 'allday':
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
        case 'allday':
        default:
            return '#6b7280';
    }
}
