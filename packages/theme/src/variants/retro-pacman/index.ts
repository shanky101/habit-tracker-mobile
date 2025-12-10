import { ExtendedTheme } from '../../types';
import { themes } from '../../tokens';
import { retroPacmanColors } from './colors';

const baseTokens = themes.default;

export const retroPacmanTheme: ExtendedTheme = {
    ...baseTokens,
    id: 'retro-pacman',
    name: 'Retro Pacman',
    type: 'dark',
    colors: retroPacmanColors,
    assets: {
        mascot: {
            happy: '👻',
            ecstatic: '🍒',
            proud: '🟡',
            encouraging: '🍓',
            sleepy: '💤',
            worried: '🟦',
            sad: '💀',
            celebrating: '🏆',
            thinking: '🤔',
            waving: '👋',
        },
    },
    styles: {
        cardBorderRadius: 0,
        buttonBorderRadius: 0,
        cardBorderWidth: 4,
        fontFamilyDisplay: baseTokens.typography.fontFamilyMono, // Use mono for retro feel
        fontFamilyBody: baseTokens.typography.fontFamilyMono,
    },
};
