import { MascotConfig } from '../types';
import { DEFAULT_MASCOT_NAME, DEFAULT_MESSAGES } from './defaultMessages';

export const DEFAULT_CONFIG: Required<MascotConfig> = {
    name: DEFAULT_MASCOT_NAME,
    messages: DEFAULT_MESSAGES,
    character: {
        primaryColor: '#818CF8',
        secondaryColor: '#F472B6',
        shape: 'round',
    },
    behavior: {
        animationSpeed: 1.0,
        autoHide: false,
        hideDelay: 3000,
        celebrationDuration: 2000,
        position: 'bottom-right',
    },
    features: {
        speechBubbles: true,
        celebrations: true,
        reactions: true,
        backgroundEffects: true,
    },
};
