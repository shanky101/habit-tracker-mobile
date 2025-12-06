import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '@/theme';

interface BrutalistSpeechBubbleProps {
  message: string;
  visible?: boolean;
  variant?: 'default' | 'celebration' | 'warning';
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

/**
 * BrutalistSpeechBubble - Bold, chunky speech bubble for mascot
 *
 * Features:
 * - Thick black border
 * - Hard offset shadow
 * - Geometric tail
 * - Pop-in animation
 * - Auto-dismiss option
 *
 * Usage:
 * <BrutalistSpeechBubble
 *   message="Great job! 🎉"
 *   visible={showBubble}
 *   variant="celebration"
 *   autoDismiss
 * />
 */
export const BrutalistSpeechBubble: React.FC<BrutalistSpeechBubbleProps> = ({
  message,
  visible = true,
  variant = 'default',
  onDismiss,
  autoDismiss = true,
  dismissDelay = 3000,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Variant colors
  const variantColors = {
    default: {
      background: theme.colors.surface,
      border: theme.colors.border,
      shadow: '#000000',
    },
    celebration: {
      background: theme.colors.secondary, // Bright yellow
      border: theme.colors.border,
      shadow: '#000000',
    },
    warning: {
      background: theme.colors.warning,
      border: theme.colors.border,
      shadow: '#000000',
    },
  };

  const colors = variantColors[variant];

  useEffect(() => {
    if (visible) {
      // Pop in with bouncy animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 100,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 100,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Auto dismiss
      if (autoDismiss && onDismiss) {
        const timeout = setTimeout(() => {
          Animated.spring(scaleAnim, {
            toValue: 0,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }).start(() => {
            onDismiss();
          });
        }, dismissDelay);

        return () => clearTimeout(timeout);
      }
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '3deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { rotate },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Text
          style={[
            styles.message,
            {
              color: variant === 'default' ? theme.colors.text : theme.colors.white,
              fontFamily: theme.typography.fontFamilyBodyMedium,
              fontSize: theme.typography.fontSizeMD,
            },
          ]}
        >
          {message}
        </Text>
      </View>

      {/* Geometric tail (triangle with border) */}
      <View style={styles.tailContainer}>
        {/* Shadow tail */}
        <View
          style={[
            styles.tailShadow,
            {
              borderTopColor: '#000000',
            },
          ]}
        />
        {/* Border tail */}
        <View
          style={[
            styles.tailBorder,
            {
              borderTopColor: colors.border,
            },
          ]}
        />
        {/* Inner tail */}
        <View
          style={[
            styles.tailInner,
            {
              borderTopColor: colors.background,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 12,
    maxWidth: 300,
  },
  bubble: {
    borderWidth: 4,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    // Hard shadow
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  tailContainer: {
    position: 'relative',
    width: 0,
    height: 0,
    marginTop: -2, // Overlap slightly
  },
  tailShadow: {
    position: 'absolute',
    top: 5,
    left: -15 + 5, // Offset for shadow
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tailBorder: {
    position: 'absolute',
    top: 0,
    left: -15,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tailInner: {
    position: 'absolute',
    top: -2,
    left: -12,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
