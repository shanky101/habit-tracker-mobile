import { defaultTheme } from './default';
import { retroPacmanTheme } from './retro-pacman';
import { minimalistTheme } from './minimalist';
import { darkTheme } from './dark';
import { ExtendedTheme } from '../types';

export const themeVariants = {
    default: defaultTheme,
    'retro-pacman': retroPacmanTheme,
    minimalist: minimalistTheme,
    dark: darkTheme,
    // Future themes will be added here
};

export type ThemeVariantKey = keyof typeof themeVariants;
