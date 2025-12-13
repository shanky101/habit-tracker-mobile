import React from 'react';
import { G, Circle, Rect, Defs, LinearGradient, Stop, Pattern } from 'react-native-svg';
import { HabiCustomization } from '@/types/mascotCustomization';

interface PatternLayerProps {
  customization: HabiCustomization;
}

/**
 * Pattern Layer - Renders patterns on the mascot body
 */
export const PatternLayer: React.FC<PatternLayerProps> = ({ customization }) => {
  const { pattern, patternColor, bodyColor } = customization;

  if (pattern === 'solid' || pattern === 'none' || !patternColor) {
    return null;
  }

  const renderSpots = () => (
    <G opacity="0.5">
      <Circle cx="80" cy="70" r="12" fill={patternColor} />
      <Circle cx="120" cy="65" r="10" fill={patternColor} />
      <Circle cx="90" cy="110" r="15" fill={patternColor} />
      <Circle cx="130" cy="105" r="11" fill={patternColor} />
      <Circle cx="70" cy="120" r="9" fill={patternColor} />
    </G>
  );

  const renderStripes = () => (
    <G opacity="0.4">
      <Rect x="25" y="50" width="150" height="12" fill={patternColor} />
      <Rect x="25" y="75" width="150" height="12" fill={patternColor} />
      <Rect x="25" y="100" width="150" height="12" fill={patternColor} />
      <Rect x="25" y="125" width="150" height="12" fill={patternColor} />
    </G>
  );

  const renderGradient = () => (
    <>
      <Defs>
        <LinearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={bodyColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={patternColor} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Circle
        cx="100"
        cy="100"
        r="75"
        fill="url(#bodyGradient)"
        opacity="0.6"
      />
    </>
  );

  const renderSparkles = () => (
    <G opacity="0.7">
      <Circle cx="70" cy="60" r="3" fill={patternColor} />
      <Circle cx="130" cy="70" r="4" fill={patternColor} />
      <Circle cx="85" cy="90" r="2" fill={patternColor} />
      <Circle cx="115" cy="95" r="3" fill={patternColor} />
      <Circle cx="95" cy="120" r="4" fill={patternColor} />
      <Circle cx="120" cy="115" r="2" fill={patternColor} />
    </G>
  );

  switch (pattern) {
    case 'spots':
      return renderSpots();
    case 'stripes':
      return renderStripes();
    case 'gradient':
      return renderGradient();
    case 'sparkles':
      return renderSparkles();
    default:
      return null;
  }
};
