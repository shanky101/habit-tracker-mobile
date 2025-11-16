import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeVariant, ThemeTokens, themes, defaultTheme } from './tokens';

interface ThemeContextType {
  theme: ThemeTokens;
  themeVariant: ThemeVariant;
  setTheme: (variant: ThemeVariant) => void;
  isPremiumUnlocked: boolean;
  unlockPremium: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('momentum');
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);

  const setTheme = (variant: ThemeVariant) => {
    const selectedTheme = themes[variant];

    // Check if theme is premium and user has access
    if (selectedTheme.isPremium && !isPremiumUnlocked) {
      // Premium theme access denied - silently fail for security
      return;
    }

    setThemeVariant(variant);
  };

  const unlockPremium = () => {
    setIsPremiumUnlocked(true);
  };

  const value: ThemeContextType = {
    theme: themes[themeVariant],
    themeVariant,
    setTheme,
    isPremiumUnlocked,
    unlockPremium,
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
