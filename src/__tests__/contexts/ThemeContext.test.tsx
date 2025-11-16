import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { themes } from '@/theme/tokens';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  describe('Initial State', () => {
    it('should initialize with momentum theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.themeVariant).toBe('momentum');
      expect(result.current.theme).toEqual(themes.momentum);
    });

    it('should initialize with premium locked', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isPremiumUnlocked).toBe(false);
    });

    it('should have all required functions', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.unlockPremium).toBe('function');
    });

    it('should have valid theme structure', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme.name).toBe('Momentum & Joy');
      expect(result.current.theme.isPremium).toBe(false);
      expect(result.current.theme.colors).toBeDefined();
      expect(result.current.theme.typography).toBeDefined();
      expect(result.current.theme.spacing).toBeDefined();
      expect(result.current.theme.radius).toBeDefined();
      expect(result.current.theme.shadows).toBeDefined();
      expect(result.current.theme.animation).toBeDefined();
    });
  });

  describe('setTheme', () => {
    it('should switch to free theme successfully', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('momentum');
      });

      expect(result.current.themeVariant).toBe('momentum');
      expect(result.current.theme).toEqual(themes.momentum);
    });

    it('should not switch to premium theme when premium is locked', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const initialTheme = result.current.themeVariant;

      act(() => {
        result.current.setTheme('retro');
      });

      // Theme should not change
      expect(result.current.themeVariant).toBe(initialTheme);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'This is a premium theme. Please unlock premium to use it.'
      );

      consoleWarnSpy.mockRestore();
    });

    it('should switch to premium theme when premium is unlocked', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.unlockPremium();
      });

      act(() => {
        result.current.setTheme('retro');
      });

      expect(result.current.themeVariant).toBe('retro');
      expect(result.current.theme).toEqual(themes.retro);
    });

    it('should switch between different premium themes when unlocked', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.unlockPremium();
      });

      act(() => {
        result.current.setTheme('earthy');
      });
      expect(result.current.themeVariant).toBe('earthy');

      act(() => {
        result.current.setTheme('minimal');
      });
      expect(result.current.themeVariant).toBe('minimal');

      act(() => {
        result.current.setTheme('professional');
      });
      expect(result.current.themeVariant).toBe('professional');
    });

    it('should update theme object when variant changes', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const initialTheme = result.current.theme;

      act(() => {
        result.current.unlockPremium();
      });

      act(() => {
        result.current.setTheme('retro');
      });

      expect(result.current.theme).not.toEqual(initialTheme);
      expect(result.current.theme.name).toBe('Retro Futurism');
    });
  });

  describe('unlockPremium', () => {
    it('should unlock premium access', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isPremiumUnlocked).toBe(false);

      act(() => {
        result.current.unlockPremium();
      });

      expect(result.current.isPremiumUnlocked).toBe(true);
    });

    it('should remain unlocked after calling multiple times', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.unlockPremium();
        result.current.unlockPremium();
        result.current.unlockPremium();
      });

      expect(result.current.isPremiumUnlocked).toBe(true);
    });

    it('should allow premium theme selection after unlocking', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      act(() => {
        result.current.unlockPremium();
      });

      act(() => {
        result.current.setTheme('earthy');
      });

      expect(result.current.themeVariant).toBe('earthy');
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Theme Variants', () => {
    it('should have all theme variants available', () => {
      expect(themes.momentum).toBeDefined();
      expect(themes.retro).toBeDefined();
      expect(themes.earthy).toBeDefined();
      expect(themes.minimal).toBeDefined();
      expect(themes.professional).toBeDefined();
    });

    it('should have correct premium flags', () => {
      expect(themes.momentum.isPremium).toBe(false);
      expect(themes.retro.isPremium).toBe(true);
      expect(themes.earthy.isPremium).toBe(true);
      expect(themes.minimal.isPremium).toBe(true);
      expect(themes.professional.isPremium).toBe(true);
    });

    it('should have unique names for each theme', () => {
      const themeNames = Object.values(themes).map((theme) => theme.name);
      const uniqueNames = new Set(themeNames);

      expect(uniqueNames.size).toBe(themeNames.length);
    });

    it('should have all required color tokens', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme.colors.primary).toBeDefined();
        expect(theme.colors.secondary).toBeDefined();
        expect(theme.colors.background).toBeDefined();
        expect(theme.colors.text).toBeDefined();
        expect(theme.colors.success).toBeDefined();
        expect(theme.colors.warning).toBeDefined();
        expect(theme.colors.error).toBeDefined();
      });
    });

    it('should have all required typography tokens', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme.typography.fontFamilyDisplay).toBeDefined();
        expect(theme.typography.fontFamilyBody).toBeDefined();
        expect(theme.typography.fontSize3XL).toBeDefined();
        expect(theme.typography.fontSizeMD).toBeDefined();
        expect(theme.typography.fontWeightBold).toBeDefined();
      });
    });

    it('should have all required spacing tokens', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme.spacing.space1).toBeDefined();
        expect(theme.spacing.space2).toBeDefined();
        expect(theme.spacing.space3).toBeDefined();
        expect(theme.spacing.space4).toBeDefined();
      });
    });
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });
  });
});
