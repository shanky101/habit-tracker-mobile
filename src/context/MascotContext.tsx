import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mascot mood types based on user progress
export type MascotMood =
  | 'happy'        // Default positive state
  | 'ecstatic'     // All habits complete / streak milestone
  | 'proud'        // Good progress (>50% complete)
  | 'encouraging'  // Some progress (<50%)
  | 'sleepy'       // Morning, no habits done yet
  | 'worried'      // Streak at risk
  | 'sad'          // Streak broken
  | 'celebrating'  // Achievement unlocked
  | 'thinking'     // Analyzing/loading
  | 'waving';      // Greeting

// Mascot personality messages
export const MASCOT_MESSAGES: Record<MascotMood, string[]> = {
  happy: [
    "Let's crush some habits today! 💪",
    "You've got this! I believe in you!",
    "Ready to make today awesome?",
    "Together we're unstoppable!",
  ],
  ecstatic: [
    "AMAZING! You did it all! 🎉",
    "I'm SO proud of you! This is incredible!",
    "You're on FIRE! Keep this energy!",
    "Best. Day. Ever! You're a legend!",
  ],
  proud: [
    "Great progress! Keep going!",
    "You're doing wonderfully!",
    "Look at you crushing it!",
    "I knew you could do it!",
  ],
  encouraging: [
    "Every small step counts!",
    "You can do this! Start with one!",
    "Progress, not perfection!",
    "I'm here cheering you on!",
  ],
  sleepy: [
    "*yawns* Good morning! Ready to start?",
    "Rise and shine! New day, new wins!",
    "Let's wake up and get moving!",
    "Morning! What shall we tackle first?",
  ],
  worried: [
    "Your streak is at risk! Let's save it!",
    "Don't forget about your habits today!",
    "Quick! There's still time!",
    "I don't want to see your streak break!",
  ],
  sad: [
    "We lost a streak... but we'll rebuild!",
    "It's okay, tomorrow is a new day!",
    "Let's start fresh together!",
    "I still believe in you!",
  ],
  celebrating: [
    "🏆 Achievement unlocked!",
    "You earned a new badge! Woohoo!",
    "This calls for a celebration!",
    "Another milestone crushed!",
  ],
  thinking: [
    "Hmm, let me think...",
    "Analyzing your progress...",
    "Crunching the numbers...",
    "One moment...",
  ],
  waving: [
    "Hey there! Welcome back!",
    "Hi friend! Great to see you!",
    "Hello! Ready for today?",
    "👋 I missed you!",
  ],
};

// Mascot expressions (emoji-based for simplicity, can be replaced with images)
export const MASCOT_EXPRESSIONS: Record<MascotMood, string> = {
  happy: '😊',
  ecstatic: '🤩',
  proud: '😌',
  encouraging: '🥰',
  sleepy: '😴',
  worried: '😟',
  sad: '😢',
  celebrating: '🥳',
  thinking: '🤔',
  waving: '👋',
};

// Mascot name
export const MASCOT_NAME = 'Habi';

interface MascotState {
  mood: MascotMood;
  message: string;
  isAnimating: boolean;
  lastInteraction: Date | null;
  totalPets: number; // Fun interaction counter
}

interface MascotSettings {
  enabled: boolean;
  showCelebrations: boolean;
}

interface MascotContextType {
  mascot: MascotState;
  settings: MascotSettings;
  setMood: (mood: MascotMood) => void;
  triggerReaction: (mood: MascotMood, customMessage?: string) => void;
  petMascot: () => void;
  getMascotForProgress: (completed: number, total: number, hasStreakAtRisk: boolean) => MascotMood;
  getRandomMessage: (mood: MascotMood) => string;
  toggleMascot: (enabled: boolean) => void;
  toggleCelebrations: (enabled: boolean) => void;
}

const MASCOT_STORAGE_KEY = '@habit_tracker_mascot';
const MASCOT_SETTINGS_KEY = '@habit_tracker_mascot_settings';

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export const MascotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const toggleMascot = useCallback((enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    saveMascotSettings(newSettings);
  }, [settings]);

  const toggleCelebrations = useCallback((enabled: boolean) => {
    const newSettings = { ...settings, showCelebrations: enabled };
    setSettings(newSettings);
    saveMascotSettings(newSettings);
  }, [settings]);

  const getRandomMessage = useCallback((mood: MascotMood): string => {
    const messages = MASCOT_MESSAGES[mood];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const setMood = useCallback((mood: MascotMood) => {
    setMascot(prev => {
      // Only update if mood actually changed to prevent infinite loops
      if (prev.mood === mood) {
        return prev;
      }
      return {
        ...prev,
        mood,
        message: MASCOT_MESSAGES[mood][Math.floor(Math.random() * MASCOT_MESSAGES[mood].length)],
      };
    });
  }, []);

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
        setMood,
        triggerReaction,
        petMascot,
        getMascotForProgress,
        getRandomMessage,
        toggleMascot,
        toggleCelebrations,
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
