import React from 'react';
import { G, Path, Circle, Rect, Polygon, Ellipse } from 'react-native-svg';
import { HabiCustomization } from '@/types/mascotCustomization';

interface AccessoriesLayerProps {
  customization: HabiCustomization;
}

/**
 * Accessories Layer - Renders hair, hat, glasses, and necklace
 */
export const AccessoriesLayer: React.FC<AccessoriesLayerProps> = ({ customization }) => {
  // Render hair
  const renderHair = () => {
    if (customization.hairStyle === 'none') return null;

    const color = customization.hairColor;

    switch (customization.hairStyle) {
      case 'spiky':
        return (
          <G>
            <Polygon points="80,30 85,10 90,30" fill={color} stroke="#000" strokeWidth="1.5" />
            <Polygon points="95,25 100,5 105,25" fill={color} stroke="#000" strokeWidth="1.5" />
            <Polygon points="110,30 115,10 120,30" fill={color} stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'curly':
        return (
          <G>
            <Circle cx="75" cy="35" r="12" fill={color} stroke="#000" strokeWidth="1.5" />
            <Circle cx="100" cy="28" r="14" fill={color} stroke="#000" strokeWidth="1.5" />
            <Circle cx="125" cy="35" r="12" fill={color} stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'long':
        return (
          <G>
            <Path
              d="M 70 35 Q 65 50 68 70"
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 130 35 Q 135 50 132 70"
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <Ellipse cx="100" cy="30" rx="40" ry="15" fill={color} stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'bob':
        return (
          <G>
            <Path
              d="M 60 35 Q 60 55 70 60 L 65 35 Z"
              fill={color}
              stroke="#000"
              strokeWidth="1.5"
            />
            <Path
              d="M 140 35 Q 140 55 130 60 L 135 35 Z"
              fill={color}
              stroke="#000"
              strokeWidth="1.5"
            />
            <Ellipse cx="100" cy="32" rx="42" ry="18" fill={color} stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'ponytail':
        return (
          <G>
            <Ellipse cx="100" cy="32" rx="38" ry="16" fill={color} stroke="#000" strokeWidth="1.5" />
            <Ellipse cx="145" cy="50" rx="12" ry="20" fill={color} stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'mohawk':
        return (
          <G>
            <Rect x="95" y="10" width="10" height="25" fill={color} stroke="#000" strokeWidth="1.5" rx="2" />
            <Polygon points="90,15 100,5 110,15" fill={color} stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'wizard':
        return (
          <G>
            <Path
              d="M 70 35 Q 65 45 68 60"
              stroke={color}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 130 35 Q 135 45 132 60"
              stroke={color}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="80" cy="38" r="10" fill="#DDD" stroke="#000" strokeWidth="1" />
            <Circle cx="120" cy="38" r="10" fill="#DDD" stroke="#000" strokeWidth="1" />
          </G>
        );
      default:
        return null;
    }
  };

  // Render hat
  const renderHat = () => {
    if (customization.hat === 'none') return null;

    switch (customization.hat) {
      case 'cap':
        return (
          <G>
            <Ellipse cx="100" cy="30" rx="35" ry="12" fill="#FF6B6B" stroke="#000" strokeWidth="2" />
            <Path d="M 65 30 L 55 32 L 60 35 Z" fill="#FF6B6B" stroke="#000" strokeWidth="1.5" />
            <Circle cx="100" cy="25" r="5" fill="#FFD700" stroke="#000" strokeWidth="1" />
          </G>
        );
      case 'beanie':
        return (
          <G>
            <Ellipse cx="100" cy="28" rx="42" ry="20" fill="#9B59B6" stroke="#000" strokeWidth="2" />
            <Circle cx="100" cy="15" r="6" fill="#E74C3C" stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'crown':
        return (
          <G>
            <Polygon
              points="70,30 75,15 85,25 95,10 105,25 115,15 120,30 130,35 100,38 70,35"
              fill="#FFD700"
              stroke="#000"
              strokeWidth="2"
            />
            <Circle cx="80" cy="20" r="3" fill="#FF6B6B" />
            <Circle cx="100" cy="15" r="3" fill="#FF6B6B" />
            <Circle cx="120" cy="20" r="3" fill="#FF6B6B" />
          </G>
        );
      case 'wizard':
        return (
          <G>
            <Path
              d="M 75 30 L 100 -10 L 125 30 Z"
              fill="#4A148C"
              stroke="#000"
              strokeWidth="2"
            />
            <Circle cx="85" cy="15" r="4" fill="#FFD700" />
            <Circle cx="95" cy="8" r="3" fill="#FFD700" />
            <Circle cx="105" cy="12" r="3" fill="#FFD700" />
          </G>
        );
      case 'bow':
        return (
          <G>
            <Path d="M 80 30 Q 70 25 75 18 Q 80 25 85 30" fill="#FF69B4" stroke="#000" strokeWidth="1.5" />
            <Path d="M 120 30 Q 130 25 125 18 Q 120 25 115 30" fill="#FF69B4" stroke="#000" strokeWidth="1.5" />
            <Circle cx="100" cy="25" r="8" fill="#FF69B4" stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'headband':
        return (
          <G>
            <Ellipse cx="100" cy="40" rx="45" ry="8" fill="#3498DB" stroke="#000" strokeWidth="2" />
            <Rect x="95" y="32" width="10" height="6" fill="#E74C3C" stroke="#000" strokeWidth="1" />
          </G>
        );
      case 'tophat':
        return (
          <G>
            <Rect x="80" y="5" width="40" height="30" fill="#2C3E50" stroke="#000" strokeWidth="2" rx="2" />
            <Ellipse cx="100" cy="35" rx="50" ry="10" fill="#2C3E50" stroke="#000" strokeWidth="2" />
            <Rect x="90" y="15" width="20" height="8" fill="#C0392B" stroke="#000" strokeWidth="1" />
          </G>
        );
      case 'santa':
        return (
          <G>
            <Path d="M 70 30 Q 100 10 130 30 L 125 40 L 75 40 Z" fill="#E74C3C" stroke="#000" strokeWidth="2" />
            <Ellipse cx="100" cy="40" rx="28" ry="8" fill="#FFF" stroke="#000" strokeWidth="1.5" />
            <Circle cx="130" cy="20" r="8" fill="#FFF" stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'party':
        return (
          <G>
            <Path d="M 95 30 L 100 5 L 105 30 Z" fill="#9B59B6" stroke="#000" strokeWidth="2" />
            <Path d="M 95 30 L 85 28 L 88 25 Z" fill="#E74C3C" stroke="#000" strokeWidth="1" />
            <Path d="M 105 30 L 115 28 L 112 25 Z" fill="#3498DB" stroke="#000" strokeWidth="1" />
            <Circle cx="100" cy="8" r="4" fill="#FFD700" />
          </G>
        );
      default:
        return null;
    }
  };

  // Render glasses
  const renderGlasses = () => {
    if (customization.glasses === 'none') return null;

    switch (customization.glasses) {
      case 'round':
        return (
          <G>
            <Circle cx="75" cy="77" r="12" fill="none" stroke="#000" strokeWidth="2.5" />
            <Circle cx="125" cy="77" r="12" fill="none" stroke="#000" strokeWidth="2.5" />
            <Path d="M 87 77 L 113 77" stroke="#000" strokeWidth="2" />
          </G>
        );
      case 'square':
        return (
          <G>
            <Rect x="63" y="68" width="24" height="18" rx="2" fill="none" stroke="#000" strokeWidth="2.5" />
            <Rect x="113" y="68" width="24" height="18" rx="2" fill="none" stroke="#000" strokeWidth="2.5" />
            <Path d="M 87 77 L 113 77" stroke="#000" strokeWidth="2" />
          </G>
        );
      case 'sunglasses':
        return (
          <G>
            <Ellipse cx="75" cy="77" rx="13" ry="10" fill="#2C3E50" stroke="#000" strokeWidth="2" />
            <Ellipse cx="125" cy="77" rx="13" ry="10" fill="#2C3E50" stroke="#000" strokeWidth="2" />
            <Path d="M 88 77 L 112 77" stroke="#000" strokeWidth="2.5" />
          </G>
        );
      case 'reading':
        return (
          <G>
            <Path d="M 62 77 Q 75 73 88 77" stroke="#000" strokeWidth="2" fill="none" />
            <Path d="M 112 77 Q 125 73 138 77" stroke="#000" strokeWidth="2" fill="none" />
            <Path d="M 88 77 L 112 77" stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'monocle':
        return (
          <G>
            <Circle cx="125" cy="77" r="12" fill="none" stroke="#000" strokeWidth="2.5" />
            <Path d="M 137 77 L 145 77" stroke="#000" strokeWidth="2" />
          </G>
        );
      case 'scifi':
        return (
          <G>
            <Rect x="60" y="72" width="80" height="12" rx="6" fill="#00D9FF" opacity="0.3" stroke="#00D9FF" strokeWidth="2" />
            <Path d="M 60 78 L 140 78" stroke="#00D9FF" strokeWidth="1" />
          </G>
        );
      case 'heart':
        return (
          <G>
            <Path
              d="M 75 70 Q 65 65 65 75 Q 65 80 75 85 Q 85 80 85 75 Q 85 65 75 70"
              fill="#FF69B4"
              opacity="0.6"
              stroke="#FF1493"
              strokeWidth="2"
            />
            <Path
              d="M 125 70 Q 115 65 115 75 Q 115 80 125 85 Q 135 80 135 75 Q 135 65 125 70"
              fill="#FF69B4"
              opacity="0.6"
              stroke="#FF1493"
              strokeWidth="2"
            />
          </G>
        );
      default:
        return null;
    }
  };

  // Render necklace
  const renderNecklace = () => {
    if (customization.necklace === 'none') return null;

    switch (customization.necklace) {
      case 'bowtie':
        return (
          <G transform="translate(100, 145)">
            <Path d="M -15 0 L -8 -5 L -8 5 Z" fill="#E74C3C" stroke="#000" strokeWidth="1.5" />
            <Path d="M 15 0 L 8 -5 L 8 5 Z" fill="#E74C3C" stroke="#000" strokeWidth="1.5" />
            <Circle cx="0" cy="0" r="3" fill="#2C3E50" stroke="#000" strokeWidth="1" />
          </G>
        );
      case 'bandana':
        return (
          <G>
            <Path
              d="M 60 145 Q 100 155 140 145"
              stroke="#FF6B6B"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <Path d="M 130 145 L 145 140 L 148 150 Z" fill="#FF6B6B" stroke="#000" strokeWidth="1" />
          </G>
        );
      case 'necklace':
        return (
          <G>
            <Path
              d="M 65 145 Q 100 160 135 145"
              stroke="#FFD700"
              strokeWidth="2.5"
              fill="none"
            />
            <Circle cx="100" cy="160" r="6" fill="#FF6B6B" stroke="#FFD700" strokeWidth="2" />
          </G>
        );
      case 'scarf':
        return (
          <G>
            <Path
              d="M 50 145 Q 100 155 150 145 L 148 160 Q 100 165 52 160 Z"
              fill="#9B59B6"
              stroke="#000"
              strokeWidth="2"
            />
            <Path d="M 145 165 L 155 175 L 150 180 L 140 168 Z" fill="#9B59B6" stroke="#000" strokeWidth="1.5" />
          </G>
        );
      case 'medal':
        return (
          <G>
            <Path d="M 95 140 L 100 160 L 105 140" stroke="#E74C3C" strokeWidth="3" fill="none" />
            <Circle cx="100" cy="162" r="8" fill="#FFD700" stroke="#000" strokeWidth="2" />
            <Circle cx="100" cy="162" r="5" fill="#FFF" stroke="#000" strokeWidth="1" />
          </G>
        );
      default:
        return null;
    }
  };

  return (
    <G>
      {/* Hair (behind everything) */}
      {renderHair()}

      {/* Hat (on top of hair) */}
      {renderHat()}

      {/* Glasses (on face) */}
      {renderGlasses()}

      {/* Necklace (on body) */}
      {renderNecklace()}
    </G>
  );
};
