import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg from 'react-native-svg';
import { HabiCustomization } from '@/types/mascotCustomization';
import { MascotMood } from '@/context/MascotContext';
import { BodyLayer } from './layers/BodyLayer';
import { PatternLayer } from './layers/PatternLayer';
import { FaceLayer } from './layers/FaceLayer';
import { AccessoriesLayer } from './layers/AccessoriesLayer';
import { EffectsLayer } from './layers/EffectsLayer';
import { BackgroundEffects } from './BackgroundEffects';

interface HabiMascotProps {
  customization: HabiCustomization;
  mood?: MascotMood;
  size?: number;
  animated?: boolean;
  onTap?: () => void;
}

export interface HabiMascotRef {
  bounce: () => void;
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
 * Features smooth floating and breathing animations for alive feeling
 * Plus celebration animations for habit completion!
 */
export const HabiMascot = forwardRef<HabiMascotRef, HabiMascotProps>(
  function HabiMascot({
    customization,
    mood = 'happy',
    size = 200,
    animated = false,
    onTap, // Changed from onCelebrate to onTap
  }, ref) {
    const viewBox = '0 0 200 200';

    // Floating animation using RN Animated
    const translateY = useRef(new Animated.Value(0)).current;

    // Breathing animation (scale pulse)
    const breatheScale = useRef(new Animated.Value(1)).current;

    // Bounce animation (for tap reactions)
    const bounceScale = useRef(new Animated.Value(1)).current;

    // Bounce animation (triggered by tap)
    const bounce = () => {
      Animated.sequence([
        Animated.spring(bounceScale, {
          toValue: 1.2,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(bounceScale, {
          toValue: 1.0,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Trigger callback
      if (onTap) {
        onTap();
      }
    };

    // Expose bounce method via ref
    useImperativeHandle(ref, () => ({
      bounce,
    }));

    useEffect(() => {
      // Gentle floating animation (idle, continuous)
      const floatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -12,  // Enhanced from -5 to -12 (more visible!)
            duration: 1500,  // Faster (was 2000)
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1500,  // Faster (was 2000)
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Breathing animation (calm, zen-like)
      const breatheAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheScale, {
            toValue: 1.08,  // Enhanced from 1.03 to 1.08 (clearly breathing!)
            duration: 2500,  // Slightly faster (was 3000)
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breatheScale, {
            toValue: 1,
            duration: 2500,  // Slightly faster (was 3000)
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      floatAnimation.start();
      breatheAnimation.start();

      return () => {
        floatAnimation.stop();
        breatheAnimation.stop();
      };
    }, [translateY, breatheScale]);

    return (
      <Animated.View
        style={[
          styles.container,
          { width: size, height: size },
          {
            transform: [
              { translateY },
              { scale: Animated.multiply(breatheScale, bounceScale) }
            ]
          }
        ]}
      >
        {/* Background Effects - Retro-futuristic aesthetic */}
        <BackgroundEffects size={size} />

        {/* Mascot SVG */}
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
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HabiMascot;
