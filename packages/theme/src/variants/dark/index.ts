import { ExtendedTheme } from '../../types';
import { themes } from '../../tokens';

const baseTokens = themes.dark;

export const darkTheme: ExtendedTheme = {
    ...baseTokens,
    id: 'dark',
    name: 'Dark Mode',
    type: 'dark',
    assets: {
        mascot: {
            happy: '🌙',
            ecstatic: '🌟',
            proud: '🦁',
            encouraging: '🦉',
            sleepy: '😴',
            worried: '🌑',
            sad: '🌧️',
            celebrating: '🎆',
            thinking: '🤔',
            waving: '👋',
        },
    },
    styles: {
        cardBorderRadius: 16,
        buttonBorderRadius: 12,
        cardBorderWidth: 0,
        fontFamilyDisplay: baseTokens.typography.fontFamilyDisplay,
        fontFamilyBody: baseTokens.typography.fontFamilyBody,
    },
};
