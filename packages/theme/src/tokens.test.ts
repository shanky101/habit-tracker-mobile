import { themes, ThemeTokens, ThemeVariant, ColorTokens } from './tokens';

describe('Theme Package: Token Validation', () => {
    const themeVariants: ThemeVariant[] = [
        'default',
        'dark',
        'zen',
        'neon',
        'retro',
        'minimalist',
        'brutalist',
        'retro-pacman',
    ];

    describe('Theme Structure', () => {
        test.each(themeVariants)('%s theme has all required properties', (variant) => {
            const theme = themes[variant];

            expect(theme).toHaveProperty('name');
            expect(theme).toHaveProperty('isPremium');
            expect(theme).toHaveProperty('colors');
            expect(theme).toHaveProperty('typography');
            expect(theme).toHaveProperty('spacing');
            expect(theme).toHaveProperty('radius');
            expect(theme).toHaveProperty('shadows');
            expect(theme).toHaveProperty('animation');
        });

        test('all themes have consistent keys', () => {
            const baseTheme = themes.default;
            const baseKeys = Object.keys(baseTheme).sort();

            themeVariants.forEach((variant) => {
                const themeKeys = Object.keys(themes[variant]).sort();
                expect(themeKeys).toEqual(baseKeys);
            });
        });
    });

    describe('Color Tokens', () => {
        const requiredColorKeys = [
            'primary',
            'primaryDark',
            'primaryLight',
            'secondary',
            'secondaryLight',
            'accent1',
            'accent2',
            'accent3',
            'background',
            'backgroundSecondary',
            'surface',
            'surfaceSecondary',
            'text',
            'textSecondary',
            'textTertiary',
            'success',
            'successLight',
            'warning',
            'error',
            'errorLight',
            'border',
            'borderLight',
            'white',
            'black',
        ];

        test.each(themeVariants)('%s theme has all required color tokens', (variant) => {
            const colors = themes[variant].colors;
            requiredColorKeys.forEach((key) => {
                expect(colors).toHaveProperty(key);
            });
        });

        test.each(themeVariants)('%s theme colors are valid hex codes', (variant) => {
            const colors = themes[variant].colors;
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

            Object.entries(colors).forEach(([key, value]) => {
                expect(value).toMatch(hexRegex);
            });
        });

        test('white is #ffffff and black is #000000 across all themes', () => {
            Object.values(themes).forEach((theme) => {
                expect(theme.colors.white.toLowerCase()).toBe('#ffffff');
                expect(theme.colors.black).toBe('#000000');
            });
        });
    });

    describe('Typography Tokens', () => {
        const requiredTypographyKeys = [
            'fontFamilyDisplay',
            'fontFamilyDisplayMedium',
            'fontFamilyDisplaySemibold',
            'fontFamilyDisplayBold',
            'fontFamilyBody',
            'fontFamilyBodyMedium',
            'fontFamilyBodySemibold',
            'fontFamilyBodyBold',
            'fontFamilyMono',
            'fontSize3XL',
            'fontSize2XL',
            'fontSizeXL',
            'fontSizeLG',
            'fontSizeMD',
            'fontSizeSM',
            'fontSizeXS',
            'fontWeightLight',
            'fontWeightRegular',
            'fontWeightMedium',
            'fontWeightSemibold',
            'fontWeightBold',
            'lineHeightTight',
            'lineHeightNormal',
            'lineHeightRelaxed',
        ];

        test.each(themeVariants)('%s theme has all required typography tokens', (variant) => {
            const typography = themes[variant].typography;
            requiredTypographyKeys.forEach((key) => {
                expect(typography).toHaveProperty(key);
            });
        });

        test('font sizes are in descending order', () => {
            themeVariants.forEach((variant) => {
                const typography = themes[variant].typography;
                expect(typography.fontSize3XL).toBeGreaterThan(typography.fontSize2XL);
                expect(typography.fontSize2XL).toBeGreaterThan(typography.fontSizeXL);
                expect(typography.fontSizeXL).toBeGreaterThan(typography.fontSizeLG);
                expect(typography.fontSizeLG).toBeGreaterThan(typography.fontSizeMD);
                expect(typography.fontSizeMD).toBeGreaterThan(typography.fontSizeSM);
                expect(typography.fontSizeSM).toBeGreaterThan(typography.fontSizeXS);
            });
        });

        test('line heights are positive numbers', () => {
            themeVariants.forEach((variant) => {
                const typography = themes[variant].typography;
                expect(typography.lineHeightTight).toBeGreaterThan(0);
                expect(typography.lineHeightNormal).toBeGreaterThan(0);
                expect(typography.lineHeightRelaxed).toBeGreaterThan(0);
            });
        });

        test('line heights are in ascending order', () => {
            themeVariants.forEach((variant) => {
                const typography = themes[variant].typography;
                expect(typography.lineHeightRelaxed).toBeGreaterThan(typography.lineHeightNormal);
                expect(typography.lineHeightNormal).toBeGreaterThan(typography.lineHeightTight);
            });
        });
    });

    describe('Spacing Tokens', () => {
        const requiredSpacingKeys = [
            'space1',
            'space2',
            'space3',
            'space4',
            'space6',
            'space8',
            'space12',
            'space16',
            'space20',
            'space24',
        ];

        test.each(themeVariants)('%s theme has all required spacing tokens', (variant) => {
            const spacing = themes[variant].spacing;
            requiredSpacingKeys.forEach((key) => {
                expect(spacing).toHaveProperty(key);
            });
        });

        test('spacing values follow 4px grid', () => {
            themeVariants.forEach((variant) => {
                const spacing = themes[variant].spacing;
                Object.values(spacing).forEach((value) => {
                    expect(value % 4).toBe(0);
                });
            });
        });
    });

    describe('Radius Tokens', () => {
        const requiredRadiusKeys = [
            'radiusXS',
            'radiusSM',
            'radiusMD',
            'radiusLG',
            'radiusXL',
            'radius2XL',
            'radiusFull',
        ];

        test.each(themeVariants)('%s theme has all required radius tokens', (variant) => {
            const radius = themes[variant].radius;
            requiredRadiusKeys.forEach((key) => {
                expect(radius).toHaveProperty(key);
            });
        });

        test('radius values are non-negative', () => {
            themeVariants.forEach((variant) => {
                const radius = themes[variant].radius;
                Object.values(radius).forEach((value) => {
                    expect(value).toBeGreaterThanOrEqual(0);
                });
            });
        });

        test('radiusFull is large number (9999)', () => {
            themeVariants.forEach((variant) => {
                const radius = themes[variant].radius;
                expect(radius.radiusFull).toBe(9999);
            });
        });
    });

    describe('Shadow Tokens', () => {
        const requiredShadowKeys = ['shadowSM', 'shadowMD', 'shadowLG', 'shadowXL'];

        test.each(themeVariants)('%s theme has all required shadow tokens', (variant) => {
            const shadows = themes[variant].shadows;
            requiredShadowKeys.forEach((key) => {
                expect(shadows).toHaveProperty(key);
            });
        });

        test('shadows have correct structure', () => {
            themeVariants.forEach((variant) => {
                const shadows = themes[variant].shadows;
                requiredShadowKeys.forEach((key) => {
                    const shadow = shadows[key as keyof typeof shadows];
                    expect(shadow).toHaveProperty('shadowColor');
                    expect(shadow).toHaveProperty('shadowOffset');
                    expect(shadow).toHaveProperty('shadowOpacity');
                    expect(shadow).toHaveProperty('shadowRadius');
                    expect(shadow).toHaveProperty('elevation');
                    expect(shadow.shadowOffset).toHaveProperty('width');
                    expect(shadow.shadowOffset).toHaveProperty('height');
                });
            });
        });
    });

    describe('Animation Tokens', () => {
        const requiredAnimationKeys = [
            'durationFast',
            'durationNormal',
            'durationSlow',
            'easingDefault',
            'easingBounce',
            'easingSmooth',
        ];

        test.each(themeVariants)('%s theme has all required animation tokens', (variant) => {
            const animation = themes[variant].animation;
            requiredAnimationKeys.forEach((key) => {
                expect(animation).toHaveProperty(key);
            });
        });

        test('durations are in ascending order', () => {
            themeVariants.forEach((variant) => {
                const animation = themes[variant].animation;
                expect(animation.durationSlow).toBeGreaterThan(animation.durationNormal);
                expect(animation.durationNormal).toBeGreaterThan(animation.durationFast);
            });
        });
    });

    describe('Premium Themes', () => {
        test('retro-pacman is marked as premium', () => {
            expect(themes['retro-pacman'].isPremium).toBe(true);
        });

        test('free themes are not marked as premium', () => {
            const freeThemes: ThemeVariant[] = [
                'default',
                'dark',
                'zen',
                'neon',
                'retro',
                'minimalist',
                'brutalist',
            ];

            freeThemes.forEach((variant) => {
                expect(themes[variant].isPremium).toBe(false);
            });
        });
    });
});

describe('Theme Package: Snapshot Tests', () => {
    test('default theme snapshot', () => {
        expect(themes.default).toMatchSnapshot();
    });

    test('dark theme snapshot', () => {
        expect(themes.dark).toMatchSnapshot();
    });

    test('brutalist theme snapshot', () => {
        expect(themes.brutalist).toMatchSnapshot();
    });

    test('retro-pacman theme snapshot', () => {
        expect(themes['retro-pacman']).toMatchSnapshot();
    });
});
