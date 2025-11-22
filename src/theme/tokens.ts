// Design Tokens for all theme variants

export type ThemeVariant = 'default' | 'dark' | 'zen' | 'neon' | 'retro' | 'minimalist';

export interface ColorTokens {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  accent1: string;
  accent2: string;
  accent3: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  successLight: string;
  warning: string;
  error: string;
  errorLight: string;
  border: string;
  borderLight: string;
  white: string;
  black: string;
}

export interface TypographyTokens {
  // Display font (Outfit) - for headings
  fontFamilyDisplay: string;
  fontFamilyDisplayMedium: string;
  fontFamilyDisplaySemibold: string;
  fontFamilyDisplayBold: string;

  // Body font (Plus Jakarta Sans) - for body text
  fontFamilyBody: string;
  fontFamilyBodyMedium: string;
  fontFamilyBodySemibold: string;
  fontFamilyBodyBold: string;

  fontFamilyMono: string;

  // Font sizes
  fontSize3XL: number;
  fontSize2XL: number;
  fontSizeXL: number;
  fontSizeLG: number;
  fontSizeMD: number;
  fontSizeSM: number;
  fontSizeXS: number;

  // Font weights (for reference, actual weight comes from font family)
  fontWeightLight: '300';
  fontWeightRegular: '400';
  fontWeightMedium: '500';
  fontWeightSemibold: '600';
  fontWeightBold: '700';

  // Line heights
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;
}

export interface SpacingTokens {
  space1: number;
  space2: number;
  space3: number;
  space4: number;
  space6: number;
  space8: number;
  space12: number;
  space16: number;
  space20: number;
  space24: number;
}

export interface RadiusTokens {
  radiusXS: number;
  radiusSM: number;
  radiusMD: number;
  radiusLG: number;
  radiusXL: number;
  radius2XL: number;
  radiusFull: number;
}

export interface ShadowTokens {
  shadowSM: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  shadowMD: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  shadowLG: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  shadowXL: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface AnimationTokens {
  durationFast: number;
  durationNormal: number;
  durationSlow: number;
  easingDefault: string;
  easingBounce: string;
  easingSmooth: string;
}

export interface ThemeTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  animation: AnimationTokens;
  name: string;
  isPremium: boolean;
}

// Base spacing system (8px grid)
const baseSpacing: SpacingTokens = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space6: 24,
  space8: 32,
  space12: 48,
  space16: 64,
  space20: 80,
  space24: 96,
};

// Base radius system
const baseRadius: RadiusTokens = {
  radiusXS: 4,
  radiusSM: 8,
  radiusMD: 12,
  radiusLG: 16,
  radiusXL: 24,
  radius2XL: 32,
  radiusFull: 9999,
};

// Base typography following design guidelines
// Display/Headings: Outfit
// Body/Caption: Plus Jakarta Sans
const baseTypography: TypographyTokens = {
  // Display font (Outfit) - for headings
  fontFamilyDisplay: 'Outfit_400Regular',
  fontFamilyDisplayMedium: 'Outfit_500Medium',
  fontFamilyDisplaySemibold: 'Outfit_600SemiBold',
  fontFamilyDisplayBold: 'Outfit_700Bold',

  // Body font (Plus Jakarta Sans) - for body text
  fontFamilyBody: 'PlusJakartaSans_400Regular',
  fontFamilyBodyMedium: 'PlusJakartaSans_500Medium',
  fontFamilyBodySemibold: 'PlusJakartaSans_600SemiBold',
  fontFamilyBodyBold: 'PlusJakartaSans_700Bold',

  fontFamilyMono: 'Courier',

  // Font sizes from design guidelines
  fontSize3XL: 48,  // Display Heading (H1)
  fontSize2XL: 28,  // Section Heading (H2)
  fontSizeXL: 20,   // Card Title (H3)
  fontSizeLG: 18,   // Large body text
  fontSizeMD: 16,   // Body Text
  fontSizeSM: 14,   // Small text
  fontSizeXS: 13,   // Caption / Meta

  fontWeightLight: '300',
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
  fontWeightBold: '700',

  // Line heights from design guidelines
  lineHeightTight: 1.1,    // Display Heading
  lineHeightNormal: 1.4,   // Section Heading, Caption
  lineHeightRelaxed: 1.6,  // Body Text
};

// Default Theme (Light, colorful)
const defaultColors: ColorTokens = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  secondary: '#8b5cf6',
  secondaryLight: '#a78bfa',
  accent1: '#f97316',
  accent2: '#ec4899',
  accent3: '#22c55e',
  background: '#fafafa',
  backgroundSecondary: '#f5f5f5',
  surface: '#ffffff',
  surfaceSecondary: '#f9fafb',
  text: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  success: '#22c55e',
  successLight: '#dcfce7',
  warning: '#f97316',
  error: '#ef4444',
  errorLight: '#fee2e2',
  border: '#e5e5e5',
  borderLight: '#f0f0f0',
  white: '#ffffff',
  black: '#000000',
};

// Dark Mode
const darkColors: ColorTokens = {
  primary: '#818cf8',
  primaryDark: '#6366f1',
  primaryLight: '#a5b4fc',
  secondary: '#a78bfa',
  secondaryLight: '#c4b5fd',
  accent1: '#fb923c',
  accent2: '#f472b6',
  accent3: '#4ade80',
  background: '#0f0f0f',
  backgroundSecondary: '#1a1a1a',
  surface: '#262626',
  surfaceSecondary: '#2a2a2a',
  text: '#f5f5f5',
  textSecondary: '#a3a3a3',
  textTertiary: '#737373',
  success: '#4ade80',
  successLight: '#166534',
  warning: '#fb923c',
  error: '#f87171',
  errorLight: '#7f1d1d',
  border: '#404040',
  borderLight: '#333333',
  white: '#ffffff',
  black: '#000000',
};

// Zen Theme (Soft, muted earth tones)
const zenColors: ColorTokens = {
  primary: '#7c9a92',
  primaryDark: '#5f7a72',
  primaryLight: '#a3c4b8',
  secondary: '#c9b99a',
  secondaryLight: '#ddd0b8',
  accent1: '#d4a574',
  accent2: '#b5c99a',
  accent3: '#8fbc8f',
  background: '#f5f2ed',
  backgroundSecondary: '#ebe6de',
  surface: '#fdfcfa',
  surfaceSecondary: '#f9f7f4',
  text: '#3d3d3d',
  textSecondary: '#6b6b6b',
  textTertiary: '#9a9a9a',
  success: '#8fbc8f',
  successLight: '#e8f5e9',
  warning: '#d4a574',
  error: '#cd5c5c',
  errorLight: '#fce4e4',
  border: '#ddd5c9',
  borderLight: '#e8e2d8',
  white: '#ffffff',
  black: '#000000',
};

// Neon Theme (Dark with vibrant neon accents)
const neonColors: ColorTokens = {
  primary: '#00ffff',
  primaryDark: '#00cccc',
  primaryLight: '#66ffff',
  secondary: '#ff00ff',
  secondaryLight: '#ff66ff',
  accent1: '#39ff14',
  accent2: '#ff6b6b',
  accent3: '#ffd700',
  background: '#0a0a0f',
  backgroundSecondary: '#12121a',
  surface: '#1a1a25',
  surfaceSecondary: '#22222f',
  text: '#ffffff',
  textSecondary: '#b0b0c0',
  textTertiary: '#707080',
  success: '#39ff14',
  successLight: '#0a3d0a',
  warning: '#ffd700',
  error: '#ff4444',
  errorLight: '#4a0f0f',
  border: '#2a2a3e',
  borderLight: '#1f1f2e',
  white: '#ffffff',
  black: '#000000',
};

// Retro Theme (Vintage palette)
const retroColors: ColorTokens = {
  primary: '#e07b39',
  primaryDark: '#c46a2f',
  primaryLight: '#f0a060',
  secondary: '#2d4a3e',
  secondaryLight: '#4a7264',
  accent1: '#f4d03f',
  accent2: '#c0392b',
  accent3: '#16a085',
  background: '#fdf6e3',
  backgroundSecondary: '#f5edd6',
  surface: '#fffef5',
  surfaceSecondary: '#fcfaf0',
  text: '#2c1810',
  textSecondary: '#5c4030',
  textTertiary: '#8c7060',
  success: '#27ae60',
  successLight: '#d5f5e3',
  warning: '#f39c12',
  error: '#c0392b',
  errorLight: '#fadbd8',
  border: '#e8d5b7',
  borderLight: '#f0e5d0',
  white: '#ffffff',
  black: '#000000',
};

// Minimalist Theme (High contrast black & white)
const minimalistColors: ColorTokens = {
  primary: '#000000',
  primaryDark: '#000000',
  primaryLight: '#333333',
  secondary: '#666666',
  secondaryLight: '#999999',
  accent1: '#000000',
  accent2: '#333333',
  accent3: '#666666',
  background: '#ffffff',
  backgroundSecondary: '#fafafa',
  surface: '#ffffff',
  surfaceSecondary: '#f5f5f5',
  text: '#000000',
  textSecondary: '#4a4a4a',
  textTertiary: '#8a8a8a',
  success: '#000000',
  successLight: '#f0f0f0',
  warning: '#4a4a4a',
  error: '#333333',
  errorLight: '#f5f5f5',
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
  white: '#ffffff',
  black: '#000000',
};

// Shadow definitions
const baseShadows: ShadowTokens = {
  shadowSM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shadowMD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowLG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowXL: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation tokens
const baseAnimation: AnimationTokens = {
  durationFast: 150,
  durationNormal: 250,
  durationSlow: 400,
  easingDefault: 'ease-in-out',
  easingBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  easingSmooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// Theme exports
export const themes: Record<ThemeVariant, ThemeTokens> = {
  default: {
    name: 'Default',
    isPremium: false,
    colors: defaultColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
  dark: {
    name: 'Dark Mode',
    isPremium: false,
    colors: darkColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
  zen: {
    name: 'Zen',
    isPremium: false,
    colors: zenColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
  neon: {
    name: 'Neon',
    isPremium: false,
    colors: neonColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
  retro: {
    name: 'Retro',
    isPremium: false,
    colors: retroColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
  minimalist: {
    name: 'Minimalist',
    isPremium: false,
    colors: minimalistColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
};

// Theme metadata for UI display
export const themeMetadata: Record<ThemeVariant, { description: string; previewColors: string[] }> = {
  default: {
    description: 'Bright and modern with purple accents',
    previewColors: ['#6366f1', '#8b5cf6', '#fafafa', '#22c55e'],
  },
  dark: {
    description: 'Easy on the eyes, perfect for night',
    previewColors: ['#818cf8', '#0f0f0f', '#262626', '#4ade80'],
  },
  zen: {
    description: 'Soft, calming earth tones',
    previewColors: ['#7c9a92', '#f5f2ed', '#c9b99a', '#8fbc8f'],
  },
  neon: {
    description: 'Vibrant cyberpunk aesthetic',
    previewColors: ['#00ffff', '#ff00ff', '#0a0a0f', '#39ff14'],
  },
  retro: {
    description: 'Warm vintage palette',
    previewColors: ['#e07b39', '#fdf6e3', '#2d4a3e', '#f4d03f'],
  },
  minimalist: {
    description: 'Clean black and white simplicity',
    previewColors: ['#000000', '#ffffff', '#666666', '#e0e0e0'],
  },
};

export const defaultTheme = themes.default;
