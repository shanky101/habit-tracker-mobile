export type MascotMood =
    | 'happy'
    | 'ecstatic'
    | 'proud'
    | 'encouraging'
    | 'sleepy'
    | 'worried'
    | 'sad'
    | 'celebrating'
    | 'thinking'
    | 'waving';

export type MascotDisplayMode = 'compact' | 'default';

export interface MascotState {
    mood: MascotMood;
    message: string;
    isAnimating: boolean;
    lastInteraction: Date | null;
    totalPets: number;
}

export interface MascotSettings {
    enabled: boolean;
    showCelebrations: boolean;
    displayMode: MascotDisplayMode;
}

export interface MascotCharacterConfig {
    primaryColor?: string;
    secondaryColor?: string;
    shape?: 'round' | 'square' | 'custom';
    customRenderer?: React.ComponentType<any>;
}

export interface MascotBehaviorConfig {
    animationSpeed?: number;
    autoHide?: boolean;
    hideDelay?: number;
    celebrationDuration?: number;
    position?: 'bottom-right' | 'bottom-left' | 'custom';
}

export interface MascotFeatures {
    speechBubbles?: boolean;
    celebrations?: boolean;
    reactions?: boolean;
    backgroundEffects?: boolean;
}

export interface MascotConfig {
    name?: string;
    messages?: {
        [key in MascotMood]?: string[];
    };
    character?: MascotCharacterConfig;
    behavior?: MascotBehaviorConfig;
    features?: MascotFeatures;
}

export interface MascotContextType {
    mascot: MascotState;
    settings: MascotSettings;
    config: Required<MascotConfig>;
    setMood: (mood: MascotMood) => void;
    triggerReaction: (mood: MascotMood, customMessage?: string) => void;
    petMascot: () => void;
    getMascotForProgress: (completed: number, total: number, hasStreakAtRisk: boolean) => MascotMood;
    getRandomMessage: (mood?: MascotMood) => string;
    toggleMascot: (enabled?: boolean) => void;
    toggleCelebrations: (enabled?: boolean) => void;
    toggleDisplayMode: (mode?: MascotDisplayMode) => void;
}
