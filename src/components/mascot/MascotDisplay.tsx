import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HabiMascot } from './HabiMascot';
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
 * ```
 */
export const MascotDisplay: React.FC<MascotDisplayProps> = ({
  size = 150,
  showMessage = false,
  showName = false,
  onPress,
}) => {
  const { theme } = useTheme();
  const { customization } = useMascotCustomization();
  const { mascot, petMascot } = useMascot();

  const handlePress = () => {
    // Haptic feedback for interaction
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (onPress) {
      onPress();
    } else {
      // Default behavior: pet the mascot
      petMascot();
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress ? handlePress : undefined}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Show mascot name if requested */}
      {showName && (
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {customization.name}
        </Text>
      )}

      {/* Mascot with customization and mood */}
      <HabiMascot
        customization={customization}
        mood={mascot.mood}
        size={size}
        animated={mascot.isAnimating}
      />

      {/* Show mascot message if requested */}
      {showMessage && mascot.message && (
        <View style={[styles.messageContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
          <Text style={[styles.message, { color: theme.colors.text }]}>
            {mascot.message}
          </Text>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  messageContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: 250,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
