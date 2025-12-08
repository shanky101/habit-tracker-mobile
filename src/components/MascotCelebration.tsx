import React, { useEffect, useRef, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Modal,
} from 'react-native';
import { useTheme } from '@/theme';
import { useMascot, MASCOT_NAME } from '@/context/MascotContext';
import MascotRenderer from './MascotRenderer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MascotCelebrationProps {
  visible: boolean;
  type: 'allComplete' | 'streak' | 'milestone' | 'pet';
  title?: string;
  message?: string;
  onDismiss: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

// Simple confetti - just static colored dots that fade in
const SimpleConfetti: React.FC<{ particles: Array<{ id: number; x: number; y: number; color: string }> }> = memo(({ particles }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <>
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.confetti,
            {
              left: p.x,
              top: p.y,
              backgroundColor: p.color,
              opacity: fadeAnim,
            },
          ]}
        />
      ))}
    </>
  );
});

const MascotCelebration: React.FC<MascotCelebrationProps> = ({
  visible,
  type,
  title,
  message,
  onDismiss,
  autoHide = false,
  autoHideDelay = 4000,
}) => {
  const { theme } = useTheme();
  const { mascot } = useMascot();

  // Animation refs
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const mascotEntranceAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  // Store animation references for cleanup
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  // Memoize confetti particles so they don't regenerate on each render
  const confettiParticles = useMemo(() => {
    const colors = ['#6366F1', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#F472B6'];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (i * (SCREEN_WIDTH / 20)) + Math.random() * 20,
      y: Math.random() * SCREEN_HEIGHT * 0.6,
      color: colors[i % colors.length],
    }));
  }, []);

  // Entrance animation
  useEffect(() => {
    if (visible) {
      // Reset animations
      backdropAnim.setValue(0);
      mascotEntranceAnim.setValue(0);
      contentAnim.setValue(0);
      bounceAnim.setValue(0);

      // Main entrance sequence
      const entranceAnim = Animated.sequence([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(mascotEntranceAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(contentAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]);

      // Bounce loop
      const bounceLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -12,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Sparkle loop
      const sparkleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      // Store refs for cleanup
      animationsRef.current = [entranceAnim, bounceLoop, sparkleLoop];

      // Start animations
      entranceAnim.start();
      bounceLoop.start();
      sparkleLoop.start();

      // Auto hide timeout
      let hideTimeout: NodeJS.Timeout | null = null;
      if (autoHide) {
        hideTimeout = setTimeout(() => {
          onDismiss();
        }, autoHideDelay);
      }

      return () => {
        // Stop all animations on cleanup
        animationsRef.current.forEach(anim => anim.stop());
        if (hideTimeout) clearTimeout(hideTimeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleDismiss = () => {
    // Stop looping animations
    animationsRef.current.forEach(anim => anim.stop());

    // Animate out
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(mascotEntranceAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'allComplete':
        return 'All Done! 🎉';
      case 'streak':
        return 'Streak Milestone! 🔥';
      case 'milestone':
        return 'Achievement Unlocked! 🏆';
      case 'pet':
        return `${MASCOT_NAME} loves you! 💕`;
      default:
        return 'Amazing!';
    }
  };

  const getMessage = () => {
    if (message) return message;
    return mascot.message;
  };

  // Pre-compute interpolations
  const mascotScale = mascotEntranceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1.15, 1],
  });

  const mascotTranslateY = mascotEntranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [250, 0],
  });

  const contentScale = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleDismiss}>
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleDismiss}
          />
        </Animated.View>

        {/* Simple Confetti */}
        {type === 'allComplete' && <SimpleConfetti particles={confettiParticles} />}

        {/* Celebration Content */}
        <View style={styles.celebrationContent} pointerEvents="box-none">
          {/* Sparkle decorations */}
          <Animated.View style={[styles.sparkle, styles.sparkleTopLeft, { opacity: sparkleOpacity }]}>
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkleTopRight, { opacity: sparkleOpacity }]}>
            <Text style={styles.sparkleText}>⭐</Text>
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkleBottomLeft, { opacity: sparkleOpacity }]}>
            <Text style={styles.sparkleText}>🌟</Text>
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkleBottomRight, { opacity: sparkleOpacity }]}>
            <Text style={styles.sparkleText}>💫</Text>
          </Animated.View>

          {/* Mascot - separate transforms to avoid Animated.add issue */}
          <Animated.View
            style={[
              styles.mascotContainer,
              {
                transform: [
                  { scale: mascotScale },
                  { translateY: mascotTranslateY },
                ],
              },
            ]}
          >
            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <TouchableOpacity activeOpacity={0.9} onPress={handleDismiss}>
                <MascotRenderer
                  mood={type === 'allComplete' ? 'ecstatic' : mascot.mood}
                  size={140}
                  isAnimating
                />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Text Content */}
          <Animated.View
            style={[
              styles.textContent,
              {
                opacity: contentAnim,
                transform: [{ scale: contentScale }],
              },
            ]}
          >
            <View
              style={[
                styles.textBubble,
                {
                  backgroundColor: theme.colors.surface,
                  shadowColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.celebrationTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: theme.typography.fontSizeXL,
                  },
                ]}
              >
                {getTitle()}
              </Text>
              <Text
                style={[
                  styles.celebrationMessage,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                {getMessage()}
              </Text>

              {/* Name badge */}
              <View
                style={[
                  styles.nameBadge,
                  {
                    backgroundColor: theme.colors.primary + '20',
                    borderColor: theme.colors.primary + '40',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.nameText,
                    {
                      color: theme.colors.primary,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {MASCOT_NAME} is proud of you!
                </Text>
              </View>
            </View>

            {/* Dismiss hint */}
            <Text
              style={[
                styles.dismissHint,
                {
                  color: theme.colors.white + '80',
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Tap anywhere to continue
            </Text>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  celebrationContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  mascotContainer: {
    marginBottom: 20,
  },
  textContent: {
    alignItems: 'center',
    width: '100%',
  },
  textBubble: {
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    maxWidth: SCREEN_WIDTH - 64,
  },
  celebrationTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationMessage: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 14,
  },
  nameBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  nameText: {
    textAlign: 'center',
  },
  dismissHint: {
    marginTop: 20,
    textAlign: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 28,
  },
  sparkleTopLeft: {
    top: -70,
    left: -30,
  },
  sparkleTopRight: {
    top: -50,
    right: -30,
  },
  sparkleBottomLeft: {
    bottom: 70,
    left: -20,
  },
  sparkleBottomRight: {
    bottom: 90,
    right: -20,
  },
});

export default memo(MascotCelebration);
