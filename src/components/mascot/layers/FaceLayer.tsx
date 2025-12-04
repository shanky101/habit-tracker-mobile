import React from 'react';
import { G, Circle, Path, Ellipse } from 'react-native-svg';
import { HabiCustomization } from '@/types/mascotCustomization';
import { MascotMood } from '@/context/MascotContext';

interface FaceLayerProps {
  customization: HabiCustomization;
  mood?: MascotMood;
}

/**
 * Face Layer - Renders eyes, eyebrows, mouth, and blush
 */
export const FaceLayer: React.FC<FaceLayerProps> = ({ customization, mood = 'happy' }) => {
  // Render eyes based on customization
  const renderEyes = () => {
    switch (customization.eyes) {
      case 'happy':
        return (
          <G>
            {/* Happy eyes - curved upward arcs */}
            <Path d="M 70 75 Q 75 80 80 75" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
            <Path d="M 120 75 Q 125 80 130 75" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          </G>
        );
      case 'sleepy':
        return (
          <G>
            {/* Sleepy eyes - horizontal lines */}
            <Path d="M 70 77 L 80 77" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            <Path d="M 120 77 L 130 77" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          </G>
        );
      case 'determined':
        return (
          <G>
            {/* Determined eyes - focused look */}
            <Circle cx="75" cy="77" r="6" fill="#000" />
            <Circle cx="125" cy="77" r="6" fill="#000" />
            <Circle cx="73" cy="75" r="2" fill="#FFF" />
            <Circle cx="123" cy="75" r="2" fill="#FFF" />
          </G>
        );
      case 'cute':
        return (
          <G>
            {/* Cute eyes - large with sparkle */}
            <Circle cx="75" cy="77" r="8" fill="#000" />
            <Circle cx="125" cy="77" r="8" fill="#000" />
            <Circle cx="72" cy="74" r="3" fill="#FFF" />
            <Circle cx="122" cy="74" r="3" fill="#FFF" />
            <Circle cx="78" cy="79" r="1.5" fill="#FFF" />
            <Circle cx="128" cy="79" r="1.5" fill="#FFF" />
          </G>
        );
      case 'mischievous':
        return (
          <G>
            {/* Mischievous eyes - one winking */}
            <Circle cx="75" cy="77" r="5" fill="#000" />
            <Path d="M 120 77 L 130 77" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          </G>
        );
      case 'normal':
      default:
        return (
          <G>
            {/* Normal eyes - simple dots */}
            <Circle cx="75" cy="77" r="5" fill="#000" />
            <Circle cx="125" cy="77" r="5" fill="#000" />
          </G>
        );
    }
  };

  // Render eyebrows
  const renderEyebrows = () => {
    if (customization.eyebrows === 'none') return null;

    switch (customization.eyebrows) {
      case 'raised':
        return (
          <G>
            <Path d="M 65 65 Q 75 60 85 65" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <Path d="M 115 65 Q 125 60 135 65" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </G>
        );
      case 'furrowed':
        return (
          <G>
            <Path d="M 65 70 Q 75 65 85 68" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <Path d="M 115 68 Q 125 65 135 70" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </G>
        );
      case 'wavy':
        return (
          <G>
            <Path d="M 65 68 Q 70 65 75 68 T 85 68" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
            <Path d="M 115 68 Q 120 65 125 68 T 135 68" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          </G>
        );
      case 'normal':
      default:
        return (
          <G>
            <Path d="M 65 68 Q 75 67 85 68" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <Path d="M 115 68 Q 125 67 135 68" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </G>
        );
    }
  };

  // Render mouth based on customization
  const renderMouth = () => {
    switch (customization.mouth) {
      case 'grin':
        return (
          <Path
            d="M 70 115 Q 100 145 130 115"
            stroke="#000"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'neutral':
        return (
          <Path
            d="M 75 120 L 125 120"
            stroke="#000"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      case 'determined':
        return (
          <Path
            d="M 80 122 L 120 122"
            stroke="#000"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        );
      case 'sleepy':
        return (
          <Ellipse
            cx="100"
            cy="120"
            rx="8"
            ry="5"
            fill="#000"
          />
        );
      case 'silly':
        return (
          <G>
            <Path
              d="M 70 120 Q 85 125 100 120 Q 115 115 130 120"
              stroke="#000"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="110" cy="122" r="3" fill="#FF69B4" />
          </G>
        );
      case 'smile':
      default:
        return (
          <Path
            d="M 75 115 Q 100 135 125 115"
            stroke="#000"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        );
    }
  };

  // Render blush
  const renderBlush = () => {
    if (!customization.blushEnabled) return null;

    return (
      <G opacity="0.6">
        <Circle cx="55" cy="95" r="10" fill={customization.blushColor} />
        <Circle cx="145" cy="95" r="10" fill={customization.blushColor} />
      </G>
    );
  };

  return (
    <G>
      {/* Eyebrows (rendered first, behind eyes) */}
      {renderEyebrows()}

      {/* Eyes */}
      {renderEyes()}

      {/* Blush */}
      {renderBlush()}

      {/* Mouth */}
      {renderMouth()}
    </G>
  );
};
