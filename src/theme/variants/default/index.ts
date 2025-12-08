import { ExtendedTheme } from '../../types';
import { themes } from '../../tokens';
import { MASCOT_EXPRESSIONS } from '@/context/MascotContext';

// Default theme uses the existing 'default' color tokens
const baseTokens = themes.default;

export const defaultTheme: ExtendedTheme = {
    ...baseTokens,
    id: 'default',
    name: 'Default',
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
