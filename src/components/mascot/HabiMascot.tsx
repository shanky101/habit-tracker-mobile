import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg from 'react-native-svg';
import { HabiCustomization } from '@/types/mascotCustomization';
import { MascotMood } from '@/context/MascotContext';
import { BodyLayer } from './layers/BodyLayer';
import { PatternLayer } from './layers/PatternLayer';
import { FaceLayer } from './layers/FaceLayer';
import { AccessoriesLayer } from './layers/AccessoriesLayer';
import { EffectsLayer } from './layers/EffectsLayer';

interface HabiMascotProps {
  customization: HabiCustomization;
  mood?: MascotMood;
  size?: number;
  animated?: boolean;
}

/**
 * HabiMascot - Main SVG-based mascot rendering component
 * Renders mascot with layered architecture:
 * 1. Body (base shape)
 * 2. Pattern (spots, stripes, gradient, etc.)
 * 3. Face (eyes, eyebrows, mouth, blush)
 * 4. Accessories (hair, hat, glasses, necklace)
 * 5. Effects (sparkles, stars, hearts, glow)
 * 
 * Features smooth floating animation for idle state
 */
export const HabiMascot: React.FC<HabiMascotProps> = ({
  customization,
  mood = 'happy',
  size = 200,
  animated = false,
}) => {
  const viewBox = '0 0 200 200';

  // Floating animation using RN Animated
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle floating animation (idle, continuous)
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -5,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    floatAnimation.start();

    return () => floatAnimation.stop();
  }, [translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size },
        { transform: [{ translateY }] }
      ]}
    >
      <Svg width={size} height={size} viewBox={viewBox}>
        {/* Layer 1: Body (base shape with arms and feet) */}
        <BodyLayer customization={customization} />

        {/* Layer 2: Pattern (if not solid) */}
        {customization.pattern !== 'solid' && customization.pattern !== 'none' && (
          <PatternLayer customization={customization} />
        )}

        {/* Layer 3: Face (eyes, eyebrows, mouth, blush) */}
        <FaceLayer customization={customization} mood={mood} />

        {/* Layer 4: Accessories (hair, hat, glasses, necklace) */}
        <AccessoriesLayer customization={customization} />

        {/* Layer 5: Special Effects (sparkles, stars, hearts, glow) */}
        {customization.specialEffect !== 'none' && (
          <EffectsLayer customization={customization} animated={animated} />
        )}
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HabiMascot;
