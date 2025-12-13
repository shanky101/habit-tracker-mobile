import React from 'react';
import { G, Circle, Path, Polygon } from 'react-native-svg';
import { HabiCustomization } from '@/types/mascotCustomization';

interface EffectsLayerProps {
  customization: HabiCustomization;
  animated?: boolean;
}

/**
 * Effects Layer - Renders special effects like sparkles, stars, hearts, glow
 */
export const EffectsLayer: React.FC<EffectsLayerProps> = ({ customization, animated = false }) => {
  if (customization.specialEffect === 'none') return null;

  const renderSparkles = () => (
    <G opacity="0.8">
      {/* Small sparkles around mascot */}
      <G transform="translate(40, 50)">
        <Path d="M 0 -6 L 1 -1 L 6 0 L 1 1 L 0 6 L -1 1 L -6 0 L -1 -1 Z" fill="#FFD700" />
      </G>
      <G transform="translate(160, 60)">
        <Path d="M 0 -5 L 0.8 -0.8 L 5 0 L 0.8 0.8 L 0 5 L -0.8 0.8 L -5 0 L -0.8 -0.8 Z" fill="#FFD700" />
      </G>
      <G transform="translate(50, 120)">
        <Path d="M 0 -4 L 0.6 -0.6 L 4 0 L 0.6 0.6 L 0 4 L -0.6 0.6 L -4 0 L -0.6 -0.6 Z" fill="#FFD700" />
      </G>
      <G transform="translate(150, 130)">
        <Path d="M 0 -5 L 0.8 -0.8 L 5 0 L 0.8 0.8 L 0 5 L -0.8 0.8 L -5 0 L -0.8 -0.8 Z" fill="#FFD700" />
      </G>
      <G transform="translate(100, 35)">
        <Path d="M 0 -4 L 0.6 -0.6 L 4 0 L 0.6 0.6 L 0 4 L -0.6 0.6 L -4 0 L -0.6 -0.6 Z" fill="#FFF" />
      </G>
    </G>
  );

  const renderStars = () => (
    <G opacity="0.8">
      {/* Stars around mascot */}
      <G transform="translate(35, 45)">
        <Polygon
          points="0,-8 2,-3 8,-2 3,1 4,7 0,4 -4,7 -3,1 -8,-2 -2,-3"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="0.5"
        />
      </G>
      <G transform="translate(165, 55)">
        <Polygon
          points="0,-7 1.5,-2.5 7,-1.5 2.5,1 3.5,6.5 0,3.5 -3.5,6.5 -2.5,1 -7,-1.5 -1.5,-2.5"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="0.5"
        />
      </G>
      <G transform="translate(45, 135)">
        <Polygon
          points="0,-6 1.2,-2 6,-1.2 2,0.8 2.8,5.2 0,2.8 -2.8,5.2 -2,0.8 -6,-1.2 -1.2,-2"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="0.5"
        />
      </G>
      <G transform="translate(155, 140)">
        <Polygon
          points="0,-7 1.5,-2.5 7,-1.5 2.5,1 3.5,6.5 0,3.5 -3.5,6.5 -2.5,1 -7,-1.5 -1.5,-2.5"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="0.5"
        />
      </G>
      <G transform="translate(100, 25)">
        <Polygon
          points="0,-6 1.2,-2 6,-1.2 2,0.8 2.8,5.2 0,2.8 -2.8,5.2 -2,0.8 -6,-1.2 -1.2,-2"
          fill="#FFF"
          stroke="#FFD700"
          strokeWidth="0.5"
        />
      </G>
    </G>
  );

  const renderHearts = () => (
    <G opacity="0.7">
      {/* Hearts around mascot */}
      <G transform="translate(40, 50)">
        <Path
          d="M 0 2 Q -3 -1 -5 1 Q -6 3 -3 6 L 0 8 L 3 6 Q 6 3 5 1 Q 3 -1 0 2"
          fill="#FF69B4"
          stroke="#FF1493"
          strokeWidth="0.5"
        />
      </G>
      <G transform="translate(160, 60)">
        <Path
          d="M 0 2 Q -2.5 -1 -4 1 Q -5 3 -2.5 5.5 L 0 7 L 2.5 5.5 Q 5 3 4 1 Q 2.5 -1 0 2"
          fill="#FF69B4"
          stroke="#FF1493"
          strokeWidth="0.5"
        />
      </G>
      <G transform="translate(50, 130)">
        <Path
          d="M 0 1.5 Q -2 -0.8 -3.5 0.8 Q -4.5 2.5 -2 4.8 L 0 6 L 2 4.8 Q 4.5 2.5 3.5 0.8 Q 2 -0.8 0 1.5"
          fill="#FF69B4"
          stroke="#FF1493"
          strokeWidth="0.5"
        />
      </G>
      <G transform="translate(150, 135)">
        <Path
          d="M 0 2 Q -2.5 -1 -4 1 Q -5 3 -2.5 5.5 L 0 7 L 2.5 5.5 Q 5 3 4 1 Q 2.5 -1 0 2"
          fill="#FF69B4"
          stroke="#FF1493"
          strokeWidth="0.5"
        />
      </G>
      <G transform="translate(100, 30)">
        <Path
          d="M 0 1.8 Q -2.2 -0.9 -3.8 0.9 Q -4.8 2.8 -2.2 5.2 L 0 6.5 L 2.2 5.2 Q 4.8 2.8 3.8 0.9 Q 2.2 -0.9 0 1.8"
          fill="#FFB6C1"
          stroke="#FF69B4"
          strokeWidth="0.5"
        />
      </G>
    </G>
  );

  const renderGlow = () => (
    <G>
      {/* Glow effect around mascot body */}
      <Circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke="#FFD700"
        strokeWidth="3"
        opacity="0.3"
      />
      <Circle
        cx="100"
        cy="100"
        r="85"
        fill="none"
        stroke="#FFD700"
        strokeWidth="2"
        opacity="0.5"
      />
      <Circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="#FFEB3B"
        strokeWidth="1.5"
        opacity="0.7"
      />
    </G>
  );

  switch (customization.specialEffect) {
    case 'sparkles':
      return renderSparkles();
    case 'stars':
      return renderStars();
    case 'hearts':
      return renderHearts();
    case 'glow':
      return renderGlow();
    default:
      return null;
  }
};
