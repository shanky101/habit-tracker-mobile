import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '@/theme';

interface BrutalistCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  noPadding?: boolean;
}

/**
 * BrutalistCard - Bold card with thick borders and hard offset shadow
 *
 * Usage:
 * <BrutalistCard variant="primary">
 *   <Text>Bold content here</Text>
 * </BrutalistCard>
 */
export const BrutalistCard: React.FC<BrutalistCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  onPress,
  style,
  noPadding = false,
}) => {
  const { theme } = useTheme();

  // Variant-specific colors
  const variantColors = {
    default: {
      background: theme.colors.surface,
      border: theme.colors.border,
    },
    primary: {
      background: theme.colors.primary,
      border: theme.colors.border,
    },
    secondary: {
      background: theme.colors.secondary,
      border: theme.colors.border,
    },
    success: {
      background: theme.colors.success,
      border: theme.colors.border,
    },
    warning: {
      background: theme.colors.warning,
      border: theme.colors.border,
    },
    error: {
      background: theme.colors.error,
      border: theme.colors.border,
    },
  };

  // Size-specific padding and shadows
  const sizeStyles = {
    sm: {
      padding: noPadding ? 0 : 12,
      shadowOffset: { width: 3, height: 3 },
      borderRadius: theme.radius.radiusSM,
    },
    md: {
      padding: noPadding ? 0 : 16,
      shadowOffset: { width: 4, height: 4 },
      borderRadius: theme.radius.radiusMD,
    },
    lg: {
      padding: noPadding ? 0 : 20,
      shadowOffset: { width: 6, height: 6 },
      borderRadius: theme.radius.radiusLG,
    },
  };

  const colors = variantColors[variant];
  const sizes = sizeStyles[size];

  const cardStyle: ViewStyle = {
    backgroundColor: colors.background,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: sizes.borderRadius,
    padding: sizes.padding,
    // Hard shadow (no blur!)
    shadowColor: '#000000',
    shadowOffset: sizes.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0, // Android fallback
  };

  // Pressable version with animation
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && {
            transform: [
              { translateX: 2 },
              { translateY: 2 },
            ],
            shadowOffset: {
              width: sizes.shadowOffset.width - 2,
              height: sizes.shadowOffset.height - 2,
            },
          },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  // Static version
  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles defined inline for type safety
});
