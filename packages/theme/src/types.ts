import { ThemeTokens } from './tokens';
import { ImageSourcePropType } from 'react-native';

export interface ThemeAssets {
    // Mascot assets for different moods
    mascot?: {
        happy: ImageSourcePropType | string;
        ecstatic: ImageSourcePropType | string;
        proud: ImageSourcePropType | string;
        encouraging: ImageSourcePropType | string;
        sleepy: ImageSourcePropType | string;
        worried: ImageSourcePropType | string;
        sad: ImageSourcePropType | string;
        celebrating: ImageSourcePropType | string;
        thinking: ImageSourcePropType | string;
        waving: ImageSourcePropType | string;
    };
    // Background patterns or images
    backgroundPattern?: ImageSourcePropType;
    // Custom icons for tab bar or specific UI elements
    icons?: {
        home?: ImageSourcePropType;
        profile?: ImageSourcePropType;
        settings?: ImageSourcePropType;
    };
}

export interface ThemeStyles {
    // UI Element styling overrides
    cardBorderRadius: number;
    buttonBorderRadius: number;
    cardBorderWidth: number;

    // Typography overrides (optional, falls back to tokens if undefined)
    fontFamilyDisplay?: string;
    fontFamilyBody?: string;
}

export interface ExtendedTheme extends ThemeTokens {
    id: string;
    name: string;
    type: 'light' | 'dark';
    assets: ThemeAssets;
    styles: ThemeStyles;
}
