import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Circle, Path, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';
import { HabiCustomization, MascotMood } from '../../types';

interface FaceLayerProps {
  customization: HabiCustomization;
  mood?: MascotMood;
}

/**
 * Face Layer - Renders adorable eyes, eyebrows, mouth, and blush
 * Enhanced with larger eyes, sparkles, and friendlier expressions
 */
export const FaceLayer: React.FC<FaceLayerProps> = ({ customization, mood = 'happy' }) => {
  // Render eyes based on customization - LARGER & CUTER
  const renderEyes = () => {
    switch (customization.eyes) {
      case 'happy':
        return (
          <G>
            {/* Happy eyes - curved upward arcs, LARGER */}
            <Path d="M 65 72 Q 75 82 85 72" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
            <Path d="M 115 72 Q 125 82 135 72" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          </G>
        );
      case 'sleepy':
        return (
          <G>
            {/* Sleepy eyes - horizontal lines */}
            <Path d="M 65 75 L 85 75" stroke="#000" strokeWidth="4" strokeLinecap="round" />
            <Path d="M 115 75 L 135 75" stroke="#000" strokeWidth="4" strokeLinecap="round" />
          </G>
        );
      case 'determined':
        return (
          <G>
            {/* Determined eyes - focused look, LARGER */}
            <Ellipse cx="75" cy="75" rx="10" ry="12" fill="#2D3748" />
            <Ellipse cx="125" cy="75" rx="10" ry="12" fill="#2D3748" />
            {/* Sparkle reflections */}
            <Circle cx="78" cy="72" r="3" fill="white" opacity="0.9" />
            <Circle cx="128" cy="72" r="3" fill="white" opacity="0.9" />
            <Ellipse cx="73" cy="76" rx="2" ry="3" fill="white" opacity="0.5" />
            <Ellipse cx="123" cy="76" rx="2" ry="3" fill="white" opacity="0.5" />
          </G>
        );
      case 'cute':
        return (
          <G>
            {/* Cute eyes - EXTRA LARGE with double sparkle */}
            <Ellipse cx="75" cy="75" rx="12" ry="14" fill="#2D3748" />
            <Ellipse cx="125" cy="75" rx="12" ry="14" fill="#2D3748" />
            {/* Main sparkle */}
            <Circle cx="78" cy="72" r="4" fill="white" opacity="0.95" />
            <Circle cx="128" cy="72" r="4" fill="white" opacity="0.95" />
            {/* Secondary sparkle */}
            <Circle cx="70" cy="78" r="2" fill="white" opacity="0.7" />
            <Circle cx="120" cy="78" r="2" fill="white" opacity="0.7" />
            {/* Anime-style reflection */}
            <Ellipse cx="73" cy="76" rx="2" ry="4" fill="white" opacity="0.4" />
            <Ellipse cx="123" cy="76" rx="2" ry="4" fill="white" opacity="0.4" />
          </G>
        );
      case 'mischievous':
        return (
          <G>
            {/* Mischievous eyes - one open, one winking - LARGER */}
            <Ellipse cx="75" cy="75" rx="10" ry="12" fill="#2D3748" />
            <Circle cx="78" cy="72" r="3" fill="white" opacity="0.9" />
            <Path d="M 115 75 L 135 75" stroke="#000" strokeWidth="4" strokeLinecap="round" />
          </G>
        );
      case 'normal':
      default:
        return (
          <G>
            {/* Normal eyes - LARGER with sparkles */}
            <Ellipse cx="75" cy="75" rx="10" ry="12" fill="#2D3748" />
            <Ellipse cx="125" cy="75" rx="10" ry="12" fill="#2D3748" />
            {/* Sparkle reflections for life */}
            <Circle cx="78" cy="72" r="3" fill="white" opacity="0.9" />
            <Circle cx="128" cy="72" r="3" fill="white" opacity="0.9" />
            <Ellipse cx="73" cy="76" rx="1.5" ry="2.5" fill="white" opacity="0.5" />
            <Ellipse cx="123" cy="76" rx="1.5" ry="2.5" fill="white" opacity="0.5" />
          </G>
        );
    }
  };

  // Render eyebrows - SOFTER
  const renderEyebrows = () => {
    if (customization.eyebrows === 'none') return null;

    switch (customization.eyebrows) {
      case 'raised':
        return (
          <G>
            <Path d="M 60 60 Q 75 55 90 60" stroke="#5A4A42" strokeWidth="3" fill="none" strokeLinecap="round" />
            <Path d="M 110 60 Q 125 55 140 60" stroke="#5A4A42" strokeWidth="3" fill="none" strokeLinecap="round" />
          </G>
        );
      case 'furrowed':
        return (
          <G>
            <Path d="M 60 67 Q 75 62 90 65" stroke="#5A4A42" strokeWidth="3" fill="none" strokeLinecap="round" />
            <Path d="M 110 65 Q 125 62 140 67" stroke="#5A4A42" strokeWidth="3" fill="none" strokeLinecap="round" />
          </G>
        );
      case 'wavy':
        return (
          <G>
            <Path d="M 60 65 Q 70 62 80 65 T 90 65" stroke="#5A4A42" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <Path d="M 110 65 Q 120 62 130 65 T 140 65" stroke="#5A4A42" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </G>
        );
      case 'normal':
      default:
        return (
          <G>
            <Path d="M 60 65 Q 75 63 90 65" stroke="#5A4A42" strokeWidth="3" fill="none" strokeLinecap="round" />
            <Path d="M 110 65 Q 125 63 140 65" stroke="#5A4A42" strokeWidth="3" fill="none" strokeLinecap="round" />
          </G>
        );
    }
  };

  // Render mouth - FRIENDLIER & WIDER
  const renderMouth = () => {
    switch (customization.mouth) {
      case 'grin':
        return (
          <Path
            d="M 65 112 Q 100 140 135 112"
            stroke="#2D3748"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'neutral':
        return (
          <Path
            d="M 70 118 L 130 118"
            stroke="#2D3748"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      case 'determined':
        return (
          <Path
            d="M 75 120 L 125 120"
            stroke="#2D3748"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        );
      case 'sleepy':
        return (
          <Ellipse
            cx="100"
            cy="118"
            rx="10"
            ry="6"
            fill="#2D3748"
          />
        );
      case 'silly':
        return (
          <G>
            <Path
              d="M 65 118 Q 85 123 100 118 Q 115 113 135 118"
              stroke="#2D3748"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="115" cy="120" r="3" fill="#FF69B4" />
          </G>
        );
      case 'smile':
      default:
        return (
          <Path
            d="M 70 112 Q 100 132 130 112"
            stroke="#2D3748"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        );
    }
  };

  // Render blush - ALWAYS ON for maximum cuteness
  const renderBlush = () => {
    // Always show blush if enabled, or show default if customization has it off but we want cute
    const showBlush = customization.blushEnabled !== false; // Default to true
    if (!showBlush) return null;

    const blushColor = customization.blushColor || '#FFB6C1';

    return (
      <G opacity="0.7">
        {/* Larger, more prominent blush */}
        <Circle cx="50" cy="95" r="12" fill={blushColor} />
        <Circle cx="150" cy="95" r="12" fill={blushColor} />
      </G>
    );
  };

  return (
    <G>
      {/* Eyebrows (rendered first, behind eyes) */}
      {renderEyebrows()}

      {/* Eyes */}
      {renderEyes()}

      {/* Blush - always cute! */}
      {renderBlush()}

      {/* Mouth */}
      {renderMouth()}
    </G>
  );
};
