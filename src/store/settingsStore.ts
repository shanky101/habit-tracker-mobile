import { create } from 'zustand';
import { TimeRangeSettings } from '@/types/habit';

// Default time ranges
export const DEFAULT_TIME_RANGES: TimeRangeSettings = {
    morning: { start: '05:00', end: '12:00' },
    afternoon: { start: '12:00', end: '17:00' },
    evening: { start: '17:00', end: '21:00' },
    night: { start: '21:00', end: '05:00' },
};

interface SettingsState {
    timeRanges: TimeRangeSettings;
    updateTimeRange: (
        period: keyof TimeRangeSettings,
        start: string,
        end: string
    ) => void;
    resetTimeRanges: () => void;
    isLoading: boolean;
    error: string | null;
}

/**
 * Settings Store - Manages app-wide settings including time ranges
 * 
 * Time ranges define when each time period (morning/afternoon/evening/night) occurs.
 * Users can customize these in Settings > Time Ranges.
 */
export const useSettingsStore = create<SettingsState>((set) => ({
    timeRanges: DEFAULT_TIME_RANGES,
    isLoading: false,
    error: null,

    updateTimeRange: (period, start, end) => {
        set((state) => ({
            timeRanges: {
                ...state.timeRanges,
                [period]: { start, end },
            },
        }));
    },

    resetTimeRanges: () => {
        set({ timeRanges: DEFAULT_TIME_RANGES });
    },
}));
