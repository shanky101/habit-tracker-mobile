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

// Mascot personality messages - Expanded library with humor and motivation!
export const MASCOT_MESSAGES: Record<MascotMood, string[]> = {
  happy: [
    "Let's crush some habits today! 💪",
    "You've got this! I believe in you!",
    "Ready to make today awesome?",
    "Together we're unstoppable!",
    "New day, new opportunities! ✨",
    "I'm so excited to help you today!",
    "Your future self will thank you!",
    "Let's gooooo! 🚀",
    "Vibes are immaculate today!",
    "You're basically a superhero tbh",
    "Main character energy! 💫",
    "Let's make some magic happen!",
    "Today's forecast: 100% awesome",
    "Feeling cute, might build habits later",
    "You look amazing today btw",
    "Plot twist: you succeed at everything today",
  ],
  ecstatic: [
    "AMAZING! You did it all! 🎉",
    "I'm SO proud of you! This is incredible!",
    "You're on FIRE! Keep this energy!",
    "Best. Day. Ever! You're a legend!",
    "LEGENDARY STATUS ACHIEVED! 🏆",
    "YOU'RE A HABIT WIZARD! ⚡",
    "Can I get your autograph?? 📝",
    "YASSS QUEEN/KING! 👑",
    "This is your villain origin story!",
    "You've unlocked BEAST MODE! 🦁",
    "Netflix should make a documentary about you!",
    "Breaking news: You're INCREDIBLE!",
    "Tell me your secrets! (Actually don't, you earned this)",
    "Standing ovation! 👏👏👏",
    "I'm not crying, you're crying! 😭",
  ],
  proud: [
    "Great progress! Keep going!",
    "You're doing wonderfully!",
    "Look at you crushing it!",
    "I knew you could do it!",
    "Slow and steady wins the race! 🐢",
    "You're killing it softly!",
    "Character development! 📈",
    "That's what I'm talking about!",
    "Consistency is your superpower!",
    "You're writing your success story!",
    "Absolute chef's kiss 👨‍🍳💋",
    "10/10, no notes!",
    "Momentum = building...",
  ],
  encouraging: [
    "Every small step counts!",
    "You can do this! Start with one!",
    "Progress, not perfection!",
    "I'm here cheering you on!",
    "Rome wasn't built in a day!",
    "Just one more? Pretty please? 🥺",
    "You're closer than you think!",
    "Small wins lead to big victories!",
    "The hardest part is starting!",
    "Future you is rooting for present you!",
    "One step at a time, friend!",
    "You've got this energy!",
    "Believe in the power of YET!",
    "Even a tiny step is progress!",
    "I see potential! Let's unlock it!",
    "Your comeback story starts now!",
  ],
  sleepy: [
    "*yawns* Good morning! Ready to start?",
    "Rise and shine! New day, new wins!",
    "Let's wake up and get moving!",
    "Morning! What shall we tackle first?",
    "Coffee first, then habits? ☕",
    "*stretches* Time to adulting!",
    "The early bird gets the... habits?",
    "Good morning, sunshine! ☀️",
    "Let's do this... after I wake up fully",
    "Fresh start incoming!",
    "New day, who dis?",
    "Morning motivation loading... 73%",
  ],
  worried: [
    "Your streak is at risk! Let's save it!",
    "Don't forget about your habits today!",
    "Quick! There's still time!",
    "I don't want to see your streak break!",
    "SOS! Your streak needs you! 🆘",
    "Red alert! Habits at risk!",
    "Don't let the streak die on my watch!",
    "We can still save this!",
    "Five-alarm fire! But we got this! 🚨",
    "Plot twist time - you still have time!",
    "Your streak called, it needs you!",
  ],
  sad: [
    "We lost a streak... but we'll rebuild!",
    "It's okay, tomorrow is a new day!",
    "Let's start fresh together!",
    "I still believe in you!",
    "Every champion has setbacks!",
    "Comeback stories are the best stories!",
    "Failure is just data for success!",
    "We learn, we grow, we improve!",
    "This is just a plot point, not the ending!",
    "Phoenix mode: activated! 🔥",
    "It's okay to restart. Champions do it all the time!",
    "One bad day doesn't define you!",
  ],
  celebrating: [
    "🏆 Achievement unlocked!",
    "You earned a new badge! Woohoo!",
    "This calls for a celebration!",
    "Another milestone crushed!",
    "History in the making! 📚",
    "You've leveled UP! 🎮",
    "New high score! 🎯",
    "And the crowd goes wild! 🎊",
    "Confetti cannon activated! 🎉",
    "Someone's on a roll!",
    "Achievement: Absolute Legend!",
  ],
  thinking: [
    "Hmm, let me think...",
    "Analyzing your progress...",
    "Crunching the numbers...",
    "One moment...",
    "Loading brilliance... 🤔",
    "Processing your awesomeness...",
    "Calculating your greatness...",
    "The data is... impressive!",
    "Running the numbers... looking good!",
  ],
  waving: [
    "Hey there! Welcome back!",
    "Hi friend! Great to see you!",
    "Hello! Ready for today?",
    "👋 I missed you!",
    "Look who's back!",
    "The legend returns!",
    "My favorite human!",
    "Welcome back, superstar!",
    "Hey! Was just thinking about you!",
    "There you are! Let's do this!",
    "Ayy! Ready to win today?",
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

export interface MascotSettings {
  enabled: boolean;
  showCelebrations: boolean;
  displayMode: 'compact' | 'default';
}

interface MascotContextType {
  mascot: MascotState;
  settings: MascotSettings;
  setMood: (mood: MascotMood) => void;
  triggerReaction: (mood: MascotMood, customMessage?: string) => void;
  petMascot: () => void;
  getMascotForProgress: (completed: number, total: number, hasStreakAtRisk: boolean) => MascotMood;
  getRandomMessage: (mood?: MascotMood) => string;
  toggleMascot: (enabled?: boolean) => void;
  toggleCelebrations: (enabled?: boolean) => void;
  toggleDisplayMode: (mode?: 'compact' | 'default') => void;
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
