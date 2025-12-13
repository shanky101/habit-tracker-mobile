import { MascotMood } from '../types';

export const DEFAULT_MASCOT_NAME = 'Mascot';

export const DEFAULT_MESSAGES: Record<MascotMood, string[]> = {
    happy: [
        "Let's do this! 💪",
        "You've got this!",
        "Ready to make today awesome?",
        "Together we're unstoppable!",
        "New day, new opportunities! ✨",
    ],
    ecstatic: [
        "AMAZING! You did it all! 🎉",
        "I'm SO proud of you!",
        "You're on FIRE!",
        "Best. Day. Ever!",
        "LEGENDARY! 🏆",
    ],
    proud: [
        "Great progress!",
        "You're doing wonderfully!",
        "Look at you crushing it!",
        "I knew you could do it!",
    ],
    encouraging: [
        "Every small step counts!",
        "You can do this!",
        "Progress, not perfection!",
        "I'm here cheering you on!",
    ],
    sleepy: [
        "*yawns* Good morning!",
        "Rise and shine!",
        "Let's wake up and get Moving!",
        "Coffee first? ☕",
    ],
    worried: [
        "Don't forget about this!",
        "Quick! There's still time!",
        "Let's save the day!",
        "We can still do this!",
    ],
    sad: [
        "It's okay, tomorrow is new!",
        "Let's start fresh together!",
        "I still believe in you!",
        "Every champion has setbacks!",
    ],
    celebrating: [
        "🏆 Achievement unlocked!",
        "This calls for celebration!",
        "Another milestone!",
        "You've leveled UP! 🎮",
    ],
    thinking: [
        "Hmm, let me think...",
        "One moment...",
        "Processing... 🤔",
        "Analyzing...",
    ],
    waving: [
        "Hey there! Welcome!",
        "Hi friend!",
        "Hello! Ready?",
        "👋 Great to see you!",
    ],
};

export const DEFAULT_EXPRESSIONS: Record<MascotMood, string> = {
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
