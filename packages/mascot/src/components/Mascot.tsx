import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useTheme } from '@app-core/theme';
import { useMascot } from '../MascotProvider';
import { DEFAULT_MASCOT_NAME as MASCOT_NAME } from '../defaults/defaultMessages';
import { MascotMood } from '../types';
import MascotRenderer from './MascotRenderer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MascotProps {
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
  showName?: boolean;
  onPress?: () => void;
  compact?: boolean;
  variant?: 'default' | 'hero' | 'floating';
}

const SIZES = {
  small: { container: 60, character: 50, bubble: 140 },
  medium: { container: 100, character: 80, bubble: 200 },
  large: { container: 140, character: 120, bubble: 240 },
};

const Mascot: React.FC<MascotProps> = ({
  size = 'medium',
  showMessage = true,
  showName = false,
  onPress,
  compact = false,
  variant = 'default',
}) => {
  const { theme } = useTheme();
  const { mascot, petMascot } = useMascot();

  // Animation refs
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const dimensions = SIZES[size];

  // Grand entrance animation
  useEffect(() => {
    Animated.sequence([
      // Slide in from side with bounce
      Animated.spring(entranceAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      // Then show bubble
      Animated.spring(bubbleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entranceAnim, bubbleAnim]);

  // Glow pulse animation for hero variant and compact variant
  useEffect(() => {
    if (variant === 'hero' || compact) {
      const glowPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      glowPulse.start();
      return () => glowPulse.stop();
    }
  }, [variant, compact, glowAnim]);

  // Float animation for floating variant
  useEffect(() => {
    if (variant === 'floating') {
      const float = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      float.start();
      return () => float.stop();
    }
  }, [variant, floatAnim]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      petMascot();
    }
  };

  const getGlowColor = (mood: MascotMood): string => {
    switch (mood) {
      case 'ecstatic':
      case 'celebrating':
        return '#FCD34D';
      case 'happy':
      case 'proud':
        return '#818CF8';
      case 'encouraging':
        return '#F472B6';
      case 'worried':
        return '#FBBF24';
      case 'sad':
        return '#60A5FA';
      default:
        return '#818CF8';
    }
  };

  const entranceTranslate = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH * 0.3, 0],
  });

  const entranceScale = entranceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1.1, 1],
  });

  const bubbleScale = bubbleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const bubbleOpacity = bubbleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  // Compact variant - inline display
  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.compactContainer}
      >
        {/* Animated glowing background */}
        <Animated.View
          style={[
            styles.compactGlow,
            {
              backgroundColor: getGlowColor(mascot.mood),
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.4],
              }),
              transform: [{
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                })
              }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.compactCharacter,
            {
              transform: [
                { translateX: entranceTranslate },
                { scale: entranceScale },
              ],
            },
          ]}
        >
          <MascotRenderer
            mood={mascot.mood}
            size={44}
            isAnimating={mascot.isAnimating}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.compactMessage,
            {
              opacity: bubbleOpacity,
              transform: [{ scale: bubbleScale }],
            },
          ]}
        >
          <Text
            style={[
              styles.compactText,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeSM,
              },
            ]}
            numberOfLines={2}
          >
            {mascot.message}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Hero variant - large prominent display
  if (variant === 'hero') {
    return (
      <View style={styles.heroContainer}>
        {/* Animated glow background */}
        <Animated.View
          style={[
            styles.heroGlow,
            {
              backgroundColor: getGlowColor(mascot.mood),
              opacity: glowOpacity,
              transform: [{
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.3],
                })
              }],
            },
          ]}
        />

        {/* Character with entrance animation */}
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
          style={styles.heroTouchable}
        >
          <Animated.View
            style={{
              transform: [
                { translateX: entranceTranslate },
                { scale: entranceScale },
              ],
            }}
          >
            <MascotRenderer
              mood={mascot.mood}
              size={dimensions.character}
              isAnimating={mascot.isAnimating}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Speech bubble */}
        {showMessage && (
          <Animated.View
            style={[
              styles.heroBubble,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                maxWidth: dimensions.bubble,
                opacity: bubbleOpacity,
                transform: [
                  { scale: bubbleScale },
                  {
                    translateY: bubbleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  },
                ],
              },
            ]}
          >
            <Text
              style={[
                styles.heroMessage,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              {mascot.message}
            </Text>
            {/* Bubble pointer */}
            <View
              style={[
                styles.bubblePointer,
                { borderBottomColor: theme.colors.surface },
              ]}
            />
          </Animated.View>
        )}

        {/* Name badge */}
        {showName && (
          <Animated.View
            style={[
              styles.nameBadge,
              {
                backgroundColor: getGlowColor(mascot.mood) + '30',
                borderColor: getGlowColor(mascot.mood),
                opacity: bubbleOpacity,
              },
            ]}
          >
            <Text
              style={[
                styles.nameText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              {MASCOT_NAME}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  }

  // Floating variant - for corner placement
  if (variant === 'floating') {
    return (
      <Animated.View
        style={[
          styles.floatingContainer,
          {
            transform: [
              { translateY: floatAnim },
              { translateX: entranceTranslate },
              { scale: entranceScale },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
          <View style={styles.floatingInner}>
            {/* Subtle glow */}
            <View
              style={[
                styles.floatingGlow,
                { backgroundColor: getGlowColor(mascot.mood) + '40' },
              ]}
            />
            <MascotRenderer
              mood={mascot.mood}
              size={dimensions.character}
              isAnimating={mascot.isAnimating}
            />
          </View>
        </TouchableOpacity>

        {/* Floating speech bubble */}
        {showMessage && (
          <Animated.View
            style={[
              styles.floatingBubble,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: bubbleOpacity,
                transform: [{ scale: bubbleScale }],
              },
            ]}
          >
            <Text
              style={[
                styles.floatingText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
              numberOfLines={2}
            >
              {mascot.message}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  }

  // Default variant
  return (
    <View style={styles.container}>
      {/* Speech Bubble */}
      {showMessage && (
        <Animated.View
          style={[
            styles.speechBubble,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              width: dimensions.bubble,
              opacity: bubbleOpacity,
              transform: [
                { scale: bubbleScale },
                {
                  translateY: bubbleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  })
                },
              ],
            },
          ]}
        >
          <Text
            style={[
              styles.speechText,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: size === 'small' ? 11 : 13,
              },
            ]}
          >
            {mascot.message}
          </Text>
          {/* Bubble tail */}
          <View
            style={[
              styles.bubbleTail,
              {
                borderTopColor: theme.colors.surface,
              },
            ]}
          />
        </Animated.View>
      )}

      {/* Mascot Character */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.mascotTouchable}
      >
        <Animated.View
          style={{
            transform: [
              { translateX: entranceTranslate },
              { scale: entranceScale },
            ],
          }}
        >
          <MascotRenderer
            mood={mascot.mood}
            size={dimensions.character}
            isAnimating={mascot.isAnimating}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Name */}
      {showName && (
        <Animated.Text
          style={[
            styles.mascotName,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplayBold,
              fontSize: theme.typography.fontSizeSM,
              opacity: bubbleOpacity,
            },
          ]}
        >
          {MASCOT_NAME}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 16,
  },
  speechBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  speechText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  mascotTouchable: {
    alignItems: 'center',
  },
  mascotName: {
    marginTop: 8,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    position: 'relative',
  },
  compactGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    left: 6,
  },
  compactCharacter: {
    width: 50,
    height: 55,
    zIndex: 1,
  },
  compactMessage: {
    flex: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  compactText: {
    lineHeight: 20,
  },
  // Hero styles
  heroContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: 10,
  },
  heroTouchable: {
    zIndex: 1,
  },
  heroBubble: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  heroMessage: {
    textAlign: 'center',
    lineHeight: 22,
  },
  bubblePointer: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  nameBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  nameText: {
    letterSpacing: 0.5,
  },
  // Floating styles
  floatingContainer: {
    alignItems: 'center',
  },
  floatingInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  floatingBubble: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingText: {
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default memo(Mascot);
