import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MascotConfig, MascotContextType, MascotMood, MascotSettings, MascotState } from './types';
import { DEFAULT_CONFIG } from './defaults/defaultConfig';
// Re-export habit-specific messages for backward compatibility
import { DEFAULT_MESSAGES, DEFAULT_EXPRESSIONS } from './defaults/defaultMessages';
export const MASCOT_MESSAGES = DEFAULT_MESSAGES;
export const MASCOT_EXPRESSIONS = DEFAULT_EXPRESSIONS;
export const MASCOT_NAME = 'Habi';

const MASCOT_STORAGE_KEY = '@habit_tracker_mascot';
const MASCOT_SETTINGS_KEY = '@habit_tracker_mascot_settings';

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export const MascotProvider: React.FC<{
  children: React.ReactNode;
  config?: MascotConfig;
}> = ({ children, config: userConfig }) => {
  // Merge user config with defaults
  const config: Required<MascotConfig> = {
    name: userConfig?.name ?? DEFAULT_CONFIG.name,
    messages: { ...DEFAULT_CONFIG.messages, ...userConfig?.messages },
    character: { ...DEFAULT_CONFIG.character, ...userConfig?.character },
    behavior: { ...DEFAULT_CONFIG.behavior, ...userConfig?.behavior },
    features: { ...DEFAULT_CONFIG.features, ...userConfig?.features },
  };

  const messageLookup = config.messages;
  const [mascot, setMascot] = useState<MascotState>({
    mood: 'happy',
    message: MASCOT_MESSAGES.happy[0],
    isAnimating: false,
    lastInteraction: null,
    totalPets: 0,
  });

  const [settings, setSettings] = useState<MascotSettings>({
    enabled: true,
    showCelebrations: true,
    displayMode: 'compact',
  });

  // Load saved mascot data and settings
  useEffect(() => {
    const loadMascotData = async () => {
      try {
        const [savedData, savedSettings] = await Promise.all([
          AsyncStorage.getItem(MASCOT_STORAGE_KEY),
          AsyncStorage.getItem(MASCOT_SETTINGS_KEY),
        ]);

        if (savedData) {
          const data = JSON.parse(savedData);
          setMascot(prev => ({
            ...prev,
            totalPets: data.totalPets || 0,
            lastInteraction: data.lastInteraction ? new Date(data.lastInteraction) : null,
          }));
        }

        if (savedSettings) {
          const settingsData = JSON.parse(savedSettings);
          setSettings({
            enabled: settingsData.enabled ?? true,
            showCelebrations: settingsData.showCelebrations ?? true,
            displayMode: settingsData.displayMode ?? 'compact',
          });
        }
      } catch (error) {
        console.error('Error loading mascot data:', error);
      }
    };
    loadMascotData();
  }, []);

  // Save mascot data
  const saveMascotData = async (pets: number) => {
    try {
      await AsyncStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify({
        totalPets: pets,
        lastInteraction: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error saving mascot data:', error);
    }
  };

  // Save mascot settings
  const saveMascotSettings = async (newSettings: MascotSettings) => {
    try {
      await AsyncStorage.setItem(MASCOT_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving mascot settings:', error);
    }
  };

  const toggleMascot = useCallback((enabled?: boolean) => {
    setSettings(prev => {
      const newEnabled = enabled !== undefined ? enabled : !prev.enabled;
      const updated = { ...prev, enabled: newEnabled };
      saveMascotSettings(updated);
      return updated;
    });
  }, []);

  const toggleCelebrations = useCallback((enabled?: boolean) => {
    setSettings(prev => {
      const newEnabled = enabled !== undefined ? enabled : !prev.showCelebrations;
      const updated = { ...prev, showCelebrations: newEnabled };
      saveMascotSettings(updated);
      return updated;
    });
  }, []);

  const toggleDisplayMode = useCallback((mode?: 'compact' | 'default') => {
    setSettings(prev => {
      const newMode = mode !== undefined ? mode : (prev.displayMode === 'compact' ? 'default' : 'compact');
      const updated = { ...prev, displayMode: newMode };
      saveMascotSettings(updated);
      return updated;
    });
  }, []);

  const getRandomMessage = useCallback((mood: MascotMood): string => {
    const messages = messageLookup[mood] || DEFAULT_MESSAGES[mood];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [messageLookup]);

  const setMood = useCallback((mood: MascotMood) => {
    setMascot(prev => {
      if (prev.mood === mood) {
        return prev;
      }
      const messages = messageLookup[mood] || DEFAULT_MESSAGES[mood];
      return {
        ...prev,
        mood,
        message: messages[Math.floor(Math.random() * messages.length)],
      };
    });
  }, [messageLookup]);

  const triggerReaction = useCallback((mood: MascotMood, customMessage?: string) => {
    setMascot(prev => ({
      ...prev,
      mood,
      message: customMessage || getRandomMessage(mood),
      isAnimating: true,
      lastInteraction: new Date(),
    }));

    // Reset animation after delay
    setTimeout(() => {
      setMascot(prev => ({
        ...prev,
        isAnimating: false,
      }));
    }, 2000);
  }, [getRandomMessage]);

  const petMascot = useCallback(() => {
    const newPets = mascot.totalPets + 1;

    // Special reactions based on pet count
    let reaction: MascotMood = 'happy';
    let message = '';

    if (newPets === 1) {
      message = "Oh! That's nice! 🥰";
    } else if (newPets === 10) {
      message = "10 pets! We're becoming best friends!";
      reaction = 'ecstatic';
    } else if (newPets === 50) {
      message = "50 pets! You really like me! 💕";
      reaction = 'celebrating';
    } else if (newPets === 100) {
      message = "100 PETS! I love you too! 🎉";
      reaction = 'ecstatic';
    } else if (newPets % 25 === 0) {
      message = `${newPets} pets! You're the best!`;
      reaction = 'celebrating';
    } else {
      const petResponses = [
        "Hehe, that tickles!",
        "Aww, thanks friend!",
        "*happy wiggle*",
        "I love pets! 💕",
        "More please!",
        "You're so sweet!",
      ];
      message = petResponses[Math.floor(Math.random() * petResponses.length)];
    }

    setMascot(prev => ({
      ...prev,
      mood: reaction,
      message,
      isAnimating: true,
      totalPets: newPets,
      lastInteraction: new Date(),
    }));

    saveMascotData(newPets);

    setTimeout(() => {
      setMascot(prev => ({
        ...prev,
        isAnimating: false,
      }));
    }, 1500);
  }, [mascot.totalPets]);

  const getMascotForProgress = useCallback((completed: number, total: number, hasStreakAtRisk: boolean): MascotMood => {
    if (total === 0) return 'encouraging';

    const percentage = (completed / total) * 100;
    const hour = new Date().getHours();

    // Early morning with nothing done
    if (hour < 9 && completed === 0) return 'sleepy';

    // Streak at risk
    if (hasStreakAtRisk && hour > 18) return 'worried';

    // All complete
    if (percentage === 100) return 'ecstatic';

    // Good progress
    if (percentage >= 75) return 'proud';
    if (percentage >= 50) return 'happy';
    if (percentage > 0) return 'encouraging';

    // Nothing done yet
    return 'encouraging';
  }, []);

  return (
    <MascotContext.Provider
      value={{
        mascot,
        settings,
        config,
        setMood,
        triggerReaction,
        petMascot,
        getMascotForProgress,
        getRandomMessage,
        toggleMascot,
        toggleCelebrations,
        toggleDisplayMode,
      }}
    >
      {children}
    </MascotContext.Provider>
  );
};


export const useMascot = () => {
  const context = useContext(MascotContext);
  if (context === undefined) {
    throw new Error('useMascot must be used within a MascotProvider');
  }
  return context;
};

export default MascotContext;
