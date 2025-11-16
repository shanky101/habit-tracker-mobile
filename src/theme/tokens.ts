// Design Tokens for all theme variants

export type ThemeVariant = 'momentum' | 'retro' | 'earthy' | 'minimal' | 'professional';

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
  warning: string;
  error: string;
  border: string;
  borderLight: string;
  white: string;
  black: string;
}

export interface TypographyTokens {
  fontFamilyDisplay: string;
  fontFamilyBody: string;
  fontFamilyMono: string;

  // Font sizes
  fontSize3XL: number;
  fontSize2XL: number;
  fontSizeXL: number;
  fontSizeLG: number;
  fontSizeMD: number;
  fontSizeSM: number;
  fontSizeXS: number;

  // Font weights
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

// Base typography
const baseTypography: TypographyTokens = {
  fontFamilyDisplay: 'System',
  fontFamilyBody: 'System',
  fontFamilyMono: 'Courier',

  fontSize3XL: 40,
  fontSize2XL: 32,
  fontSizeXL: 24,
  fontSizeLG: 20,
  fontSizeMD: 16,
  fontSizeSM: 14,
  fontSizeXS: 12,

  fontWeightLight: '300',
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
  fontWeightBold: '700',

  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
};

// Variant 1: Momentum & Joy (Default)
const momentumColors: ColorTokens = {
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
  warning: '#f97316',
  error: '#ef4444',
  border: '#e5e5e5',
  borderLight: '#f0f0f0',
  white: '#ffffff',
  black: '#000000',
};

// Variant 2: Retro Futurism
const retroColors: ColorTokens = {
  primary: '#FF6183',
  primaryDark: '#E91E63',
  primaryLight: '#FFB4C5',
  secondary: '#00E5FF',
  secondaryLight: '#80F2FF',
  accent1: '#C6FF00',
  accent2: '#9C27B0',
  accent3: '#00E5FF',
  background: '#0A0A0F',
  backgroundSecondary: '#1A1A2E',
  surface: '#16161F',
  surfaceSecondary: '#1F1F2E',
  text: '#FFFFFF',
  textSecondary: '#B0B0C0',
  textTertiary: '#707080',
  success: '#C6FF00',
  warning: '#FF6183',
  error: '#FF1744',
  border: '#2A2A3E',
  borderLight: '#1F1F2E',
  white: '#FFFFFF',
  black: '#000000',
};

// Variant 3: Earthy Zen
const earthyColors: ColorTokens = {
  primary: '#B85C38',
  primaryDark: '#A0522D',
  primaryLight: '#D4A574',
  secondary: '#2C5F2D',
  secondaryLight: '#4A7C59',
  accent1: '#D4A574',
  accent2: '#B5C99A',
  accent3: '#2C5F2D',
  background: '#FAF8F5',
  backgroundSecondary: '#F5F1E8',
  surface: '#FFFFFF',
  surfaceSecondary: '#FDFCFA',
  text: '#2B2621',
  textSecondary: '#5A5550',
  textTertiary: '#8A8580',
  success: '#4A7C59',
  warning: '#D4A574',
  error: '#C44536',
  border: '#E8E4DC',
  borderLight: '#F0EDE5',
  white: '#FFFFFF',
  black: '#000000',
};

// Variant 4: Minimal Refinement
const minimalColors: ColorTokens = {
  primary: '#1A1714',
  primaryDark: '#0A0908',
  primaryLight: '#4D4539',
  secondary: '#C4BAAB',
  secondaryLight: '#D4CCC0',
  accent1: '#8A8074',
  accent2: '#C4BAAB',
  accent3: '#1A1714',
  background: '#FDFCFA',
  backgroundSecondary: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#FDFCFA',
  text: '#1A1714',
  textSecondary: '#5A5550',
  textTertiary: '#8A8580',
  success: '#4D4539',
  warning: '#8A8074',
  error: '#5A5550',
  border: '#E8E4DC',
  borderLight: '#F0EDE5',
  white: '#FFFFFF',
  black: '#1A1714',
};

// Variant 5: Professional Polish
const professionalColors: ColorTokens = {
  primary: '#1B1B1B',
  primaryDark: '#0A0A0A',
  primaryLight: '#3A3A3A',
  secondary: '#B1D8FC',
  secondaryLight: '#D6EBFF',
  accent1: '#FFCF25',
  accent2: '#D6C9FD',
  accent3: '#B1D8FC',
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#FAFBFC',
  text: '#1B1B1B',
  textSecondary: '#6B6B6B',
  textTertiary: '#9B9B9B',
  success: '#10B981',
  warning: '#FFCF25',
  error: '#EF4444',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  white: '#FFFFFF',
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
  momentum: {
    name: 'Momentum & Joy',
    isPremium: false,
    colors: momentumColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
  retro: {
    name: 'Retro Futurism',
    isPremium: true,
    colors: retroColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
  earthy: {
    name: 'Earthy Zen',
    isPremium: true,
    colors: earthyColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
  minimal: {
    name: 'Minimal Refinement',
    isPremium: true,
    colors: minimalColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
  professional: {
    name: 'Professional Polish',
    isPremium: true,
    colors: professionalColors,
    typography: baseTypography,
    spacing: baseSpacing,
    radius: baseRadius,
    shadows: baseShadows,
    animation: baseAnimation,
  },
};

export const defaultTheme = themes.momentum;
