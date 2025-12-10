import { ExtendedTheme } from '../../types';
import { themes } from '../../tokens';
import { MASCOT_EXPRESSIONS } from '@/context/MascotContext';

// Royal Blue theme uses the 'royalBlue' color tokens
const baseTokens = themes.royalBlue;

export const royalBlueTheme: ExtendedTheme = {
    ...baseTokens,
    id: 'royalBlue',
    name: 'Royal Blue',
    type: 'dark',
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
        cardBorderRadius: 24,
        buttonBorderRadius: 16,
        cardBorderWidth: 0, // No borders for glass look
    },
};
