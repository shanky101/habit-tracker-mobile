import { ExtendedTheme } from '../../types';
import { themes } from '../../tokens';

// Default theme uses the existing 'default' color tokens
const baseTokens = themes.default;

export const defaultTheme: ExtendedTheme = {
    ...baseTokens,
    id: 'default',
    name: 'Default',
    type: 'light',
    assets: {},
    styles: {
        cardBorderRadius: 16,
        buttonBorderRadius: 12,
        cardBorderWidth: 1,
    },
};
