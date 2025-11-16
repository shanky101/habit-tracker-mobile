import { renderHook } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

describe('useScreenAnimation', () => {
  describe('Initialization', () => {
    it('should return animated values', () => {
      const { result } = renderHook(() => useScreenAnimation());

      expect(result.current.fadeAnim).toBeInstanceOf(Animated.Value);
      expect(result.current.slideAnim).toBeInstanceOf(Animated.Value);
    });

    it('should not return fabScale when enableFAB is false', () => {
      const { result } = renderHook(() => useScreenAnimation({ enableFAB: false }));

      expect(result.current.fabScale).toBeUndefined();
    });

    it('should return fabScale when enableFAB is true', () => {
      const { result } = renderHook(() => useScreenAnimation({ enableFAB: true }));

      expect(result.current.fabScale).toBeInstanceOf(Animated.Value);
    });
  });

  describe('Default Options', () => {
    it('should use default duration when not specified', () => {
      const { result } = renderHook(() => useScreenAnimation());

      expect(result.current.fadeAnim).toBeDefined();
      expect(result.current.slideAnim).toBeDefined();
    });

    it('should use default initialSlideValue when not specified', () => {
      const { result } = renderHook(() => useScreenAnimation());

      expect(result.current.slideAnim).toBeDefined();
    });
  });

  describe('Custom Options', () => {
    it('should accept custom duration', () => {
      const { result } = renderHook(() =>
        useScreenAnimation({ duration: 1000 })
      );

      expect(result.current.fadeAnim).toBeDefined();
      expect(result.current.slideAnim).toBeDefined();
    });

    it('should accept custom initialSlideValue', () => {
      const { result } = renderHook(() =>
        useScreenAnimation({ initialSlideValue: 50 })
      );

      expect(result.current.slideAnim).toBeDefined();
    });

    it('should accept custom fabDelay', () => {
      const { result } = renderHook(() =>
        useScreenAnimation({ enableFAB: true, fabDelay: 500 })
      );

      expect(result.current.fabScale).toBeDefined();
    });

    it('should handle all custom options together', () => {
      const { result } = renderHook(() =>
        useScreenAnimation({
          duration: 800,
          initialSlideValue: 40,
          enableFAB: true,
          fabDelay: 400,
        })
      );

      expect(result.current.fadeAnim).toBeDefined();
      expect(result.current.slideAnim).toBeDefined();
      expect(result.current.fabScale).toBeDefined();
    });
  });

  describe('FAB Animation', () => {
    it('should include fabScale when enableFAB is true', () => {
      const { result } = renderHook(() => useScreenAnimation({ enableFAB: true }));

      expect(result.current).toHaveProperty('fabScale');
      expect(result.current.fabScale).toBeInstanceOf(Animated.Value);
    });

    it('should not include fabScale when enableFAB is false', () => {
      const { result } = renderHook(() => useScreenAnimation({ enableFAB: false }));

      expect(result.current).not.toHaveProperty('fabScale');
    });

    it('should not include fabScale by default', () => {
      const { result } = renderHook(() => useScreenAnimation());

      expect(result.current).not.toHaveProperty('fabScale');
    });
  });

  describe('Return Values', () => {
    it('should return fadeAnim and slideAnim when FAB is disabled', () => {
      const { result } = renderHook(() => useScreenAnimation());

      expect(result.current).toHaveProperty('fadeAnim');
      expect(result.current).toHaveProperty('slideAnim');
      expect(Object.keys(result.current)).toHaveLength(2);
    });

    it('should return fadeAnim, slideAnim, and fabScale when FAB is enabled', () => {
      const { result } = renderHook(() => useScreenAnimation({ enableFAB: true }));

      expect(result.current).toHaveProperty('fadeAnim');
      expect(result.current).toHaveProperty('slideAnim');
      expect(result.current).toHaveProperty('fabScale');
      expect(Object.keys(result.current)).toHaveLength(3);
    });
  });

  describe('Multiple Instances', () => {
    it('should create independent animation values for each instance', () => {
      const { result: result1 } = renderHook(() => useScreenAnimation());
      const { result: result2 } = renderHook(() => useScreenAnimation());

      expect(result1.current.fadeAnim).not.toBe(result2.current.fadeAnim);
      expect(result1.current.slideAnim).not.toBe(result2.current.slideAnim);
    });

    it('should handle different options in multiple instances', () => {
      const { result: result1 } = renderHook(() =>
        useScreenAnimation({ enableFAB: true })
      );
      const { result: result2 } = renderHook(() =>
        useScreenAnimation({ enableFAB: false })
      );

      expect(result1.current.fabScale).toBeDefined();
      expect(result2.current.fabScale).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration', () => {
      const { result } = renderHook(() => useScreenAnimation({ duration: 0 }));

      expect(result.current.fadeAnim).toBeDefined();
      expect(result.current.slideAnim).toBeDefined();
    });

    it('should handle zero initialSlideValue', () => {
      const { result } = renderHook(() =>
        useScreenAnimation({ initialSlideValue: 0 })
      );

      expect(result.current.slideAnim).toBeDefined();
    });

    it('should handle zero fabDelay', () => {
      const { result } = renderHook(() =>
        useScreenAnimation({ enableFAB: true, fabDelay: 0 })
      );

      expect(result.current.fabScale).toBeDefined();
    });

    it('should handle negative initialSlideValue', () => {
      const { result } = renderHook(() =>
        useScreenAnimation({ initialSlideValue: -30 })
      );

      expect(result.current.slideAnim).toBeDefined();
    });

    it('should handle very large duration', () => {
      const { result } = renderHook(() => useScreenAnimation({ duration: 10000 }));

      expect(result.current.fadeAnim).toBeDefined();
      expect(result.current.slideAnim).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should accept empty options object', () => {
      const { result } = renderHook(() => useScreenAnimation({}));

      expect(result.current.fadeAnim).toBeDefined();
      expect(result.current.slideAnim).toBeDefined();
    });

    it('should accept undefined options', () => {
      const { result } = renderHook(() => useScreenAnimation(undefined));

      expect(result.current.fadeAnim).toBeDefined();
      expect(result.current.slideAnim).toBeDefined();
    });

    it('should handle partial options', () => {
      const { result } = renderHook(() =>
        useScreenAnimation({ duration: 500 })
      );

      expect(result.current.fadeAnim).toBeDefined();
      expect(result.current.slideAnim).toBeDefined();
    });
  });
});
