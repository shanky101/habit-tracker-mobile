import React from 'react';
import { View, StyleSheet } from 'react-native';
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
 */
export const HabiMascot: React.FC<HabiMascotProps> = ({
  customization,
  mood = 'happy',
  size = 200,
  animated = false,
}) => {
  const viewBox = '0 0 200 200';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HabiMascot;
