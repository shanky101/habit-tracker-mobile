import { ExtendedTheme } from '../../types';
import { themes } from '../../tokens';
import { MASCOT_EXPRESSIONS } from '@/context/MascotContext';

// Royal theme uses the 'royal' color tokens (formerly default)
const baseTokens = themes.royal;

export const royalTheme: ExtendedTheme = {
    ...baseTokens,
    id: 'royal',
    name: 'Royal Purple',
    type: 'light',
    assets: {
        mascot: {
            happy: MASCOT_EXPRESSIONS.happy,
            ecstatic: MASCOT_EXPRESSIONS.ecstatic,
            proud: MASCOT_EXPRESSIONS.proud,
            encouraging: MASCOT_EXPRESSIONS.encouraging,
            sleepy: MASCOT_EXPRESSIONS.sleepy,
            worried: MASCOT_EXPRESSIONS.worried,
            sad: MASCOT_EXPRESSIONS.sad,
            celebrating: MASCOT_EXPRESSIONS.celebrating,
            thinking: MASCOT_EXPRESSIONS.thinking,
            waving: MASCOT_EXPRESSIONS.waving,
        },
    },
    styles: {
        cardBorderRadius: 16,
        buttonBorderRadius: 12,
        cardBorderWidth: 1,
    },
};
