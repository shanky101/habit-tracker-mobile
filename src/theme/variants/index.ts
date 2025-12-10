import { defaultTheme } from './default';
import { retroPacmanTheme } from './retro-pacman';
import { minimalistTheme } from './minimalist';
import { darkTheme } from './dark';
import { royalTheme } from './royal';
import { royalBlueTheme } from './royalBlue';
import { ExtendedTheme } from '../types';

export const themeVariants = {
    default: defaultTheme,
    'retro-pacman': retroPacmanTheme,
    minimalist: minimalistTheme,
    dark: darkTheme,
    royal: royalTheme,
    royalBlue: royalBlueTheme,
    // Future themes will be added here
};

export type ThemeVariantKey = keyof typeof themeVariants;
