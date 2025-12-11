import React, { useEffect, useRef, memo } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
} from 'react-native-svg';
import { MascotMood } from '@/context/MascotContext';

interface MascotCharacterProps {
  mood: MascotMood;
  size?: number;
  isAnimating?: boolean;
}

// Mood-based colors
const MOOD_COLORS: Record<MascotMood, { primary: string; secondary: string; blush: string }> = {
  happy: { primary: '#6366F1', secondary: '#818CF8', blush: '#FCA5A5' },
  ecstatic: { primary: '#F59E0B', secondary: '#FBBF24', blush: '#FCA5A5' },
  proud: { primary: '#8B5CF6', secondary: '#A78BFA', blush: '#FCA5A5' },
  encouraging: { primary: '#EC4899', secondary: '#F472B6', blush: '#FCA5A5' },
  sleepy: { primary: '#64748B', secondary: '#94A3B8', blush: '#E2E8F0' },
  worried: { primary: '#EAB308', secondary: '#FDE047', blush: '#FED7AA' },
  sad: { primary: '#3B82F6', secondary: '#60A5FA', blush: '#BFDBFE' },
  celebrating: { primary: '#10B981', secondary: '#34D399', blush: '#FCA5A5' },
  thinking: { primary: '#14B8A6', secondary: '#2DD4BF', blush: '#99F6E4' },
  waving: { primary: '#6366F1', secondary: '#818CF8', blush: '#FCA5A5' },
};

// Eye expressions based on mood
const getEyeExpression = (mood: MascotMood) => {
  switch (mood) {
    case 'happy':
    case 'proud':
      return { type: 'happy', squint: 0.3 };
    case 'ecstatic':
    case 'celebrating':
      return { type: 'sparkle', squint: 0 };
    case 'sleepy':
      return { type: 'sleepy', squint: 0.7 };
    case 'worried':
      return { type: 'worried', squint: 0 };
    case 'sad':
      return { type: 'sad', squint: 0 };
    case 'thinking':
      return { type: 'thinking', squint: 0.2 };
    case 'waving':
    case 'encouraging':
      return { type: 'open', squint: 0 };
    default:
      return { type: 'open', squint: 0 };
  }
};

// Mouth expressions based on mood
const getMouthPath = (mood: MascotMood, size: number) => {
  const scale = size / 120;
  const cx = 60 * scale;
  const cy = 75 * scale;

  switch (mood) {
    case 'happy':
    case 'proud':
    case 'encouraging':
      // Happy smile
      return `M ${cx - 12 * scale} ${cy} Q ${cx} ${cy + 15 * scale}, ${cx + 12 * scale} ${cy}`;
    case 'ecstatic':
    case 'celebrating':
      // Big open smile
      return `M ${cx - 15 * scale} ${cy - 3 * scale} Q ${cx} ${cy + 20 * scale}, ${cx + 15 * scale} ${cy - 3 * scale} Q ${cx} ${cy + 5 * scale}, ${cx - 15 * scale} ${cy - 3 * scale}`;
    case 'sleepy':
      // Small o mouth (yawning)
      return `M ${cx - 6 * scale} ${cy} Q ${cx - 6 * scale} ${cy + 10 * scale}, ${cx} ${cy + 12 * scale} Q ${cx + 6 * scale} ${cy + 10 * scale}, ${cx + 6 * scale} ${cy} Q ${cx + 6 * scale} ${cy + 10 * scale}, ${cx} ${cy + 12 * scale} Q ${cx - 6 * scale} ${cy + 10 * scale}, ${cx - 6 * scale} ${cy}`;
    case 'worried':
      // Worried wavy line
      return `M ${cx - 10 * scale} ${cy + 5 * scale} Q ${cx - 5 * scale} ${cy}, ${cx} ${cy + 5 * scale} Q ${cx + 5 * scale} ${cy}, ${cx + 10 * scale} ${cy + 5 * scale}`;
    case 'sad':
      // Sad frown
      return `M ${cx - 10 * scale} ${cy + 5 * scale} Q ${cx} ${cy - 5 * scale}, ${cx + 10 * scale} ${cy + 5 * scale}`;
    case 'thinking':
      // Small pursed mouth
      return `M ${cx - 5 * scale} ${cy + 3 * scale} Q ${cx} ${cy + 6 * scale}, ${cx + 5 * scale} ${cy + 3 * scale}`;
    case 'waving':
      // Friendly open smile
      return `M ${cx - 12 * scale} ${cy} Q ${cx} ${cy + 12 * scale}, ${cx + 12 * scale} ${cy}`;
    default:
      return `M ${cx - 10 * scale} ${cy} Q ${cx} ${cy + 10 * scale}, ${cx + 10 * scale} ${cy}`;
  }
};

const MascotCharacter: React.FC<MascotCharacterProps> = ({
  mood,
  size = 120,
  isAnimating = false,
}) => {
  // Animation values - only using those that work with Animated.View wrapper
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const colors = MOOD_COLORS[mood];
  const eyeExpr = getEyeExpression(mood);
  const scale = size / 120;

  // Idle bounce animation
  useEffect(() => {
    const idleBounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -6,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    idleBounce.start();
    return () => idleBounce.stop();
  }, [bounceAnim]);

  // Reaction animation when isAnimating
  useEffect(() => {
    if (isAnimating) {
      // Excited wiggle and scale
      Animated.parallel([
        Animated.sequence([
          Animated.timing(rotateAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 150,
            easing: Easing.back(2),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.elastic(1),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isAnimating, rotateAnim, scaleAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  // Eye components based on expression
  const renderEyes = () => {
    const eyeY = 50 * scale;
    const leftEyeX = 45 * scale;
    const rightEyeX = 75 * scale;
    const eyeRadius = 8 * scale;
    const pupilRadius = 4 * scale;

    if (eyeExpr.type === 'sleepy') {
      // Half-closed eyes
      return (
        <>
          <Path
            d={`M ${leftEyeX - eyeRadius} ${eyeY} Q ${leftEyeX} ${eyeY - 4 * scale}, ${leftEyeX + eyeRadius} ${eyeY}`}
            stroke="#1F2937"
            strokeWidth={2.5 * scale}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M ${rightEyeX - eyeRadius} ${eyeY} Q ${rightEyeX} ${eyeY - 4 * scale}, ${rightEyeX + eyeRadius} ${eyeY}`}
            stroke="#1F2937"
            strokeWidth={2.5 * scale}
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    }

    if (eyeExpr.type === 'happy' || eyeExpr.type === 'sparkle') {
      // Happy curved eyes (^_^)
      return (
        <>
          <Path
            d={`M ${leftEyeX - eyeRadius} ${eyeY + 2 * scale} Q ${leftEyeX} ${eyeY - 6 * scale}, ${leftEyeX + eyeRadius} ${eyeY + 2 * scale}`}
            stroke="#1F2937"
            strokeWidth={2.5 * scale}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M ${rightEyeX - eyeRadius} ${eyeY + 2 * scale} Q ${rightEyeX} ${eyeY - 6 * scale}, ${rightEyeX + eyeRadius} ${eyeY + 2 * scale}`}
            stroke="#1F2937"
            strokeWidth={2.5 * scale}
            strokeLinecap="round"
            fill="none"
          />
          {/* Sparkles for ecstatic mood */}
          {eyeExpr.type === 'sparkle' && (
            <>
              <Circle cx={leftEyeX - 12 * scale} cy={eyeY - 10 * scale} r={2 * scale} fill="#FCD34D" />
              <Circle cx={rightEyeX + 12 * scale} cy={eyeY - 10 * scale} r={2 * scale} fill="#FCD34D" />
              <Circle cx={leftEyeX + 15 * scale} cy={eyeY - 15 * scale} r={1.5 * scale} fill="#FCD34D" />
            </>
          )}
        </>
      );
    }

    if (eyeExpr.type === 'sad') {
      // Sad droopy eyes
      return (
        <>
          <Ellipse cx={leftEyeX} cy={eyeY} rx={eyeRadius} ry={eyeRadius * 0.8} fill="white" />
          <Circle cx={leftEyeX} cy={eyeY + 2 * scale} r={pupilRadius} fill="#1F2937" />
          <Path
            d={`M ${leftEyeX - eyeRadius - 2 * scale} ${eyeY - eyeRadius} L ${leftEyeX + eyeRadius} ${eyeY - eyeRadius + 3 * scale}`}
            stroke="#1F2937"
            strokeWidth={2 * scale}
            strokeLinecap="round"
          />
          <Ellipse cx={rightEyeX} cy={eyeY} rx={eyeRadius} ry={eyeRadius * 0.8} fill="white" />
          <Circle cx={rightEyeX} cy={eyeY + 2 * scale} r={pupilRadius} fill="#1F2937" />
          <Path
            d={`M ${rightEyeX - eyeRadius} ${eyeY - eyeRadius + 3 * scale} L ${rightEyeX + eyeRadius + 2 * scale} ${eyeY - eyeRadius}`}
            stroke="#1F2937"
            strokeWidth={2 * scale}
            strokeLinecap="round"
          />
        </>
      );
    }

    if (eyeExpr.type === 'worried') {
      // Worried eyes with raised inner brows
      return (
        <>
          <Ellipse cx={leftEyeX} cy={eyeY} rx={eyeRadius} ry={eyeRadius} fill="white" />
          <Circle cx={leftEyeX + 2 * scale} cy={eyeY} r={pupilRadius} fill="#1F2937" />
          <Path
            d={`M ${leftEyeX - eyeRadius} ${eyeY - eyeRadius - 2 * scale} L ${leftEyeX + eyeRadius - 2 * scale} ${eyeY - eyeRadius - 5 * scale}`}
            stroke="#1F2937"
            strokeWidth={2 * scale}
            strokeLinecap="round"
          />
          <Ellipse cx={rightEyeX} cy={eyeY} rx={eyeRadius} ry={eyeRadius} fill="white" />
          <Circle cx={rightEyeX - 2 * scale} cy={eyeY} r={pupilRadius} fill="#1F2937" />
          <Path
            d={`M ${rightEyeX - eyeRadius + 2 * scale} ${eyeY - eyeRadius - 5 * scale} L ${rightEyeX + eyeRadius} ${eyeY - eyeRadius - 2 * scale}`}
            stroke="#1F2937"
            strokeWidth={2 * scale}
            strokeLinecap="round"
          />
        </>
      );
    }

    if (eyeExpr.type === 'thinking') {
      // Looking up/to side eyes
      return (
        <>
          <Ellipse cx={leftEyeX} cy={eyeY} rx={eyeRadius} ry={eyeRadius} fill="white" />
          <Circle cx={leftEyeX - 2 * scale} cy={eyeY - 2 * scale} r={pupilRadius} fill="#1F2937" />
          <Ellipse cx={rightEyeX} cy={eyeY} rx={eyeRadius} ry={eyeRadius} fill="white" />
          <Circle cx={rightEyeX - 2 * scale} cy={eyeY - 2 * scale} r={pupilRadius} fill="#1F2937" />
        </>
      );
    }

    // Default open eyes
    return (
      <>
        <Ellipse cx={leftEyeX} cy={eyeY} rx={eyeRadius} ry={eyeRadius} fill="white" />
        <Circle cx={leftEyeX} cy={eyeY} r={pupilRadius} fill="#1F2937" />
        <Circle cx={leftEyeX - 1.5 * scale} cy={eyeY - 1.5 * scale} r={1.5 * scale} fill="white" />
        <Ellipse cx={rightEyeX} cy={eyeY} rx={eyeRadius} ry={eyeRadius} fill="white" />
        <Circle cx={rightEyeX} cy={eyeY} r={pupilRadius} fill="#1F2937" />
        <Circle cx={rightEyeX - 1.5 * scale} cy={eyeY - 1.5 * scale} r={1.5 * scale} fill="white" />
      </>
    );
  };

  return (
    <Animated.View
      style={{
        transform: [
          { translateY: bounceAnim },
          { scale: scaleAnim },
          { rotate: rotateInterpolate },
        ],
      }}
    >
      <Svg width={size} height={size * 1.1} viewBox={`0 0 ${120 * scale} ${132 * scale}`}>
        <Defs>
          {/* Body gradient */}
          <RadialGradient id="bodyGradient" cx="50%" cy="30%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.secondary} />
            <Stop offset="100%" stopColor={colors.primary} />
          </RadialGradient>
          {/* Shine gradient */}
          <LinearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="white" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Shadow */}
        <Ellipse
          cx={60 * scale}
          cy={125 * scale}
          rx={35 * scale}
          ry={6 * scale}
          fill="rgba(0,0,0,0.15)"
        />

        {/* Body */}
        <G>
          {/* Main body blob - cute rounded shape */}
          <Path
            d={`
              M ${60 * scale} ${15 * scale}
              C ${95 * scale} ${15 * scale}, ${110 * scale} ${45 * scale}, ${110 * scale} ${70 * scale}
              C ${110 * scale} ${95 * scale}, ${95 * scale} ${115 * scale}, ${60 * scale} ${115 * scale}
              C ${25 * scale} ${115 * scale}, ${10 * scale} ${95 * scale}, ${10 * scale} ${70 * scale}
              C ${10 * scale} ${45 * scale}, ${25 * scale} ${15 * scale}, ${60 * scale} ${15 * scale}
            `}
            fill="url(#bodyGradient)"
          />

          {/* Body shine/highlight */}
          <Ellipse
            cx={45 * scale}
            cy={40 * scale}
            rx={18 * scale}
            ry={12 * scale}
            fill="url(#shineGradient)"
          />

          {/* Little arms/nubs */}
          {/* Left arm */}
          <Ellipse
            cx={15 * scale}
            cy={70 * scale}
            rx={8 * scale}
            ry={12 * scale}
            fill={colors.primary}
            transform={`rotate(-20 ${15 * scale} ${70 * scale})`}
          />
          {/* Right arm - waves when waving */}
          <Ellipse
            cx={105 * scale}
            cy={65 * scale}
            rx={8 * scale}
            ry={12 * scale}
            fill={colors.primary}
            transform={mood === 'waving' ? `rotate(-45 ${105 * scale} ${65 * scale})` : `rotate(20 ${105 * scale} ${70 * scale})`}
          />

          {/* Little feet */}
          <Ellipse
            cx={42 * scale}
            cy={112 * scale}
            rx={12 * scale}
            ry={6 * scale}
            fill={colors.primary}
          />
          <Ellipse
            cx={78 * scale}
            cy={112 * scale}
            rx={12 * scale}
            ry={6 * scale}
            fill={colors.primary}
          />
        </G>

        {/* Face */}
        <G>
          {/* Blush cheeks */}
          <Ellipse
            cx={30 * scale}
            cy={68 * scale}
            rx={8 * scale}
            ry={5 * scale}
            fill={colors.blush}
            opacity={0.6}
          />
          <Ellipse
            cx={90 * scale}
            cy={68 * scale}
            rx={8 * scale}
            ry={5 * scale}
            fill={colors.blush}
            opacity={0.6}
          />

          {/* Eyes */}
          <G>
            {renderEyes()}
          </G>

          {/* Mouth */}
          <Path
            d={getMouthPath(mood, size)}
            stroke="#1F2937"
            strokeWidth={2.5 * scale}
            strokeLinecap="round"
            fill={mood === 'ecstatic' || mood === 'celebrating' ? '#FCA5A5' : 'none'}
          />
        </G>

        {/* Accessories based on mood */}
        {mood === 'thinking' && (
          // Thought bubble dots
          <>
            <Circle cx={98 * scale} cy={25 * scale} r={3 * scale} fill="#94A3B8" />
            <Circle cx={105 * scale} cy={18 * scale} r={4 * scale} fill="#94A3B8" />
            <Circle cx={115 * scale} cy={10 * scale} r={5 * scale} fill="#94A3B8" />
          </>
        )}

        {(mood === 'ecstatic' || mood === 'celebrating') && (
          // Celebration sparkles
          <>
            <Path
              d={`M ${20 * scale} ${25 * scale} L ${25 * scale} ${20 * scale} L ${30 * scale} ${25 * scale} L ${25 * scale} ${30 * scale} Z`}
              fill="#FCD34D"
            />
            <Path
              d={`M ${95 * scale} ${20 * scale} L ${100 * scale} ${15 * scale} L ${105 * scale} ${20 * scale} L ${100 * scale} ${25 * scale} Z`}
              fill="#FCD34D"
            />
            <Circle cx={15 * scale} cy={45 * scale} r={3 * scale} fill="#F472B6" />
            <Circle cx={108 * scale} cy={40 * scale} r={2.5 * scale} fill="#34D399" />
          </>
        )}

        {mood === 'sleepy' && (
          // Z's for sleeping
          <>
            <Path
              d={`M ${95 * scale} ${30 * scale} L ${105 * scale} ${30 * scale} L ${95 * scale} ${40 * scale} L ${105 * scale} ${40 * scale}`}
              stroke="#94A3B8"
              strokeWidth={2 * scale}
              fill="none"
            />
            <Path
              d={`M ${108 * scale} ${20 * scale} L ${115 * scale} ${20 * scale} L ${108 * scale} ${27 * scale} L ${115 * scale} ${27 * scale}`}
              stroke="#94A3B8"
              strokeWidth={1.5 * scale}
              fill="none"
            />
          </>
        )}

        {mood === 'sad' && (
          // Tear drop
          <Path
            d={`M ${35 * scale} ${58 * scale} Q ${33 * scale} ${65 * scale}, ${35 * scale} ${68 * scale} Q ${37 * scale} ${65 * scale}, ${35 * scale} ${58 * scale}`}
            fill="#60A5FA"
          />
        )}
      </Svg>
    </Animated.View>
  );
};

export default memo(MascotCharacter);
