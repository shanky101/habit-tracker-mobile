import React from 'react';
import { G, Circle, Ellipse } from 'react-native-svg';
import { HabiCustomization } from '@/types/mascotCustomization';

interface BodyLayerProps {
  customization: HabiCustomization;
}

/**
 * Body Layer - Renders the base mascot body shape
 */
export const BodyLayer: React.FC<BodyLayerProps> = ({ customization }) => {
  return (
    <G>
      {/* Main body - large circle */}
      <Circle
        cx="100"
        cy="100"
        r="75"
        fill={customization.bodyColor}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Left arm */}
      <Circle
        cx="35"
        cy="90"
        r="22"
        fill={customization.bodyColor}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Right arm */}
      <Circle
        cx="165"
        cy="90"
        r="22"
        fill={customization.bodyColor}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Left foot */}
      <Ellipse
        cx="75"
        cy="165"
        rx="18"
        ry="12"
        fill={customization.bodyColor}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Right foot */}
      <Ellipse
        cx="125"
        cy="165"
        rx="18"
        ry="12"
        fill={customization.bodyColor}
        stroke="#000"
        strokeWidth="2"
      />
    </G>
  );
};
