import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VacationInterval {
    startDate: string; // ISO Date string
    endDate: string | null; // ISO Date string or null if currently active
}

interface UserContextType {
    isVacationMode: boolean;
    vacationHistory: VacationInterval[];
    toggleVacationMode: () => Promise<void>;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const VACATION_MODE_KEY = '@habit_tracker_vacation_mode';
const VACATION_HISTORY_KEY = '@habit_tracker_vacation_history';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isVacationMode, setIsVacationMode] = useState(false);
    const [vacationHistory, setVacationHistory] = useState<VacationInterval[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const mode = await AsyncStorage.getItem(VACATION_MODE_KEY);
            const history = await AsyncStorage.getItem(VACATION_HISTORY_KEY);

            if (mode !== null) setIsVacationMode(JSON.parse(mode));
            if (history !== null) setVacationHistory(JSON.parse(history));
        } catch (error) {
            console.error('Error loading user context data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVacationMode = async () => {
        const newMode = !isVacationMode;
        const today = new Date().toISOString().split('T')[0];
        let newHistory = [...vacationHistory];

        if (newMode) {
            // Turning ON: Start a new interval
            newHistory.push({ startDate: today, endDate: null });
        } else {
            // Turning OFF: End the last interval
            // Find the last open interval (should be the last one)
            const lastIntervalIndex = newHistory.length - 1;
            if (lastIntervalIndex >= 0 && newHistory[lastIntervalIndex].endDate === null) {
                newHistory[lastIntervalIndex] = {
                    ...newHistory[lastIntervalIndex],
                    endDate: today,
                };
            }
        }

        try {
            await AsyncStorage.setItem(VACATION_MODE_KEY, JSON.stringify(newMode));
            await AsyncStorage.setItem(VACATION_HISTORY_KEY, JSON.stringify(newHistory));

            setIsVacationMode(newMode);
            setVacationHistory(newHistory);
        } catch (error) {
            console.error('Error saving vacation mode:', error);
        }
    };

    return (
        <UserContext.Provider
            value={{
                isVacationMode,
                vacationHistory,
                toggleVacationMode,
                isLoading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
