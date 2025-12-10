import { ExtendedTheme } from '../../types';
import { themes } from '../../tokens';

const baseTokens = themes.minimalist;

export const minimalistTheme: ExtendedTheme = {
    ...baseTokens,
    id: 'minimalist',
    name: 'Minimal',
    type: 'light',
    assets: {
        mascot: {
            happy: '●',
            ecstatic: '★',
            proud: '▲',
            encouraging: '◆',
            sleepy: 'zz',
            worried: '!',
            sad: '▼',
            celebrating: '★',
            thinking: '?',
            waving: '👋',
        },
    },
    styles: {
        cardBorderRadius: 0,
        buttonBorderRadius: 0,
        cardBorderWidth: 1,
        fontFamilyDisplay: baseTokens.typography.fontFamilyBody, // Use body font for cleaner look
        fontFamilyBody: baseTokens.typography.fontFamilyBody,
    },
};
