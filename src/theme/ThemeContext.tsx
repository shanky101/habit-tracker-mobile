import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeVariant, ThemeTokens, themes } from './tokens';

const THEME_STORAGE_KEY = '@habit_tracker_theme';
const AUTO_THEME_KEY = '@habit_tracker_auto_theme';

type ThemeMode = ThemeVariant | 'auto';

interface ThemeContextType {
  theme: ThemeTokens;
  themeVariant: ThemeVariant;
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  availableThemes: ThemeVariant[];
  isAutoMode: boolean;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const [savedTheme, isAuto] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(AUTO_THEME_KEY),
      ]);

      if (isAuto === 'true') {
        setThemeMode('auto');
      } else if (savedTheme && isValidTheme(savedTheme)) {
        setThemeMode(savedTheme as ThemeVariant);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidTheme = (theme: string): boolean => {
    return Object.keys(themes).includes(theme);
  };

  const setTheme = async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);

      if (mode === 'auto') {
        await AsyncStorage.setItem(AUTO_THEME_KEY, 'true');
        await AsyncStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(AUTO_THEME_KEY, 'false');
        await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Determine the actual theme variant based on mode and system preference
  const getActiveThemeVariant = (): ThemeVariant => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'default';
    }
    return themeMode;
  };

  const activeVariant = getActiveThemeVariant();

  const value: ThemeContextType = {
    theme: themes[activeVariant],
    themeVariant: activeVariant,
    themeMode,
    setTheme,
    availableThemes: Object.keys(themes) as ThemeVariant[],
    isAutoMode: themeMode === 'auto',
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
