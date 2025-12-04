import React, { forwardRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HabiMascot, HabiMascotRef } from './HabiMascot';
import { SpeechBubble } from './SpeechBubble';
import { useMascotCustomization } from '@/hooks/useMascotCustomization';
import { useMascot } from '@/context/MascotContext';
import { useTheme } from '@/theme';

interface MascotDisplayProps {
  size?: number;
  showMessage?: boolean;
  showName?: boolean;
  onPress?: () => void;
}

/**
 * MascotDisplay - Integrates customized mascot with mood system
 *
 * This component combines:
 * - Visual customization from useMascotCustomization (Zustand + SQLite)
 * - Mood/behavior system from useMascot (MascotContext)
 *
 * Use this component anywhere you want to display Habi with both
 * customization and mood support.
 *
 * Example usage:
 * ```tsx
 * // Simple display
 * <MascotDisplay size={150} />
 *
 * // With message
 * <MascotDisplay size={200} showMessage />
 *
 * // Interactive (e.g., tap to pet)
 * <MascotDisplay size={180} showMessage onPress={petMascot} />
 *
 * // With ref for celebration
 * const mascotRef = useRef<HabiMascotRef>(null);
 * <MascotDisplay ref={mascotRef} size={180} />
 * mascotRef.current?.bounce();
 * ```
 */
export const MascotDisplay = forwardRef<HabiMascotRef, MascotDisplayProps>(({
  size = 150,
  showMessage = false,
  showName = false,
  onPress,
}, ref) => {
  const { theme } = useTheme();
  const { customization } = useMascotCustomization();
  const { mascot, petMascot, getRandomMessage } = useMascot();
  const [showBubble, setShowBubble] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  // Show bubble when message changes
  useEffect(() => {
    if (mascot.message) {
      setCurrentMessage(mascot.message);
      setShowBubble(true);
    }
  }, [mascot.message]);

  const handlePress = () => {
    // Haptic feedback for interaction
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Trigger bounce animation
    if (ref && 'current' in ref && ref.current) {
      ref.current.bounce();
    }

    // Get a new random message from "waving" mood (don't trigger petMascot to avoid loop)
    const newMessage = getRandomMessage('waving');
    setCurrentMessage(newMessage);
    setShowBubble(true);

    // Only call onPress if explicitly provided (don't default to petMascot)
    if (onPress) {
      onPress();
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <View style={styles.container}>
      {/* Show mascot name if requested */}
      {showName && (
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {customization.name}
        </Text>
      )}

      {/* Mascot with customization and mood */}
      <Container onPress={onPress ? handlePress : handlePress} activeOpacity={0.8}>
        <HabiMascot
          ref={ref}
          customization={customization}
          mood={mascot.mood}
          size={size}
          animated
        />
      </Container>

      {/* Show mascot message if requested */}
      {showMessage && (
        <SpeechBubble
          message={currentMessage}
          visible={showBubble}
          onDismiss={() => setShowBubble(false)}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageContainer: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    maxWidth: 280,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
});
