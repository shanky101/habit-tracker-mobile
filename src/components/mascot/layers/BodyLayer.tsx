import React from 'react';
import { G, Circle, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';
import { HabiCustomization } from '@/types/mascotCustomization';

interface BodyLayerProps {
  customization: HabiCustomization;
  // Animation transforms for celebration
  leftArmTransform?: string;
  rightArmTransform?: string;
  leftFootTransform?: string;
  rightFootTransform?: string;
}

/**
 * Body Layer - Renders the base mascot body shape
 * Enhanced with gradients for depth and rounder, softer shapes
 * Supports animated limbs for celebration animations
 */
export const BodyLayer: React.FC<BodyLayerProps> = ({
  customization,
  leftArmTransform = '',
  rightArmTransform = '',
  leftFootTransform = '',
  rightFootTransform = '',
}) => {
  // Helper to darken color for gradient effect
  const darkenColor = (color: string, amount: number = 20): string => {
    // Simple darkening - reduce hex values
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, ((num >> 16) & 255) - amount);
    const g = Math.max(0, ((num >> 8) & 255) - amount);
    const b = Math.max(0, (num & 255) - amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const bodyColor = customization.bodyColor;
  const darkerColor = darkenColor(bodyColor, 25);

  return (
    <G>
      {/* Gradient definition for body */}
      <Defs>
        <RadialGradient id="bodyGradient" cx="50%" cy="40%">
          <Stop offset="0%" stopColor={bodyColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={darkerColor} stopOpacity="1" />
        </RadialGradient>
        <RadialGradient id="armGradient" cx="30%" cy="30%">
          <Stop offset="0%" stopColor={bodyColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={darkerColor} stopOpacity="0.9" />
        </RadialGradient>
      </Defs>

      {/* Main body - large circle with gradient (stays static) */}
      <Circle
        cx="100"
        cy="100"
        r="75"
        fill="url(#bodyGradient)"
        stroke="#2D3748"
        strokeWidth="2.5"
      />

      {/* Left arm - animated for celebration */}
      <G transform={leftArmTransform} origin="30, 90">
        <Circle
          cx="30"
          cy="90"
          r="24"
          fill="url(#armGradient)"
          stroke="#2D3748"
          strokeWidth="2.5"
        />
      </G>

      {/* Right arm - animated for celebration */}
      <G transform={rightArmTransform} origin="170, 90">
        <Circle
          cx="170"
          cy="90"
          r="24"
          fill="url(#armGradient)"
          stroke="#2D3748"
          strokeWidth="2.5"
        />
      </G>

      {/* Left foot - animated for celebration */}
      <G transform={leftFootTransform} origin="72, 168">
        <Ellipse
          cx="72"
          cy="168"
          rx="20"
          ry="14"
          fill={bodyColor}
          stroke="#2D3748"
          strokeWidth="2.5"
        />
      </G>

      {/* Right foot - animated for celebration */}
      <G transform={rightFootTransform} origin="128, 168">
        <Ellipse
          cx="128"
          cy="168"
          rx="20"
          ry="14"
          fill={bodyColor}
          stroke="#2D3748"
          strokeWidth="2.5"
        />
      </G>
    </G>
  );
};
