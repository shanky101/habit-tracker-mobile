import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

interface UseScreenAnimationOptions {
  duration?: number;
  initialSlideValue?: number;
  enableFAB?: boolean;
  fabDelay?: number;
}

interface UseScreenAnimationReturn {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  fabScale: Animated.Value;
}

/**
 * Custom hook for common screen entry animations
 * Eliminates duplicate animation code across multiple screens
 *
 * @param options - Animation configuration options
 * @returns Object containing animated values for fade, slide, and optionally FAB scale
 */
export const useScreenAnimation = ({
  duration = 600,
  initialSlideValue = 30,
  enableFAB = false,
  fabDelay = 300,
}: UseScreenAnimationOptions = {}): UseScreenAnimationReturn => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(initialSlideValue)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();

    // Animate FAB if enabled
    if (enableFAB) {
      Animated.spring(fabScale, {
        toValue: 1,
        delay: fabDelay,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, []); // Empty dependency array - refs never change

  return { fadeAnim, slideAnim, fabScale };
};
