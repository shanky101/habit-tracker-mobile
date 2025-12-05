import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';

interface BrutalistButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

/**
 * BrutalistButton - Chunky button with thick border and offset shadow
 *
 * Features:
 * - Haptic feedback on press
 * - Bouncy press animation (shadow moves)
 * - Multiple variants and sizes
 *
 * Usage:
 * <BrutalistButton variant="primary" onPress={handlePress}>
 *   Click Me!
 * </BrutalistButton>
 */
export const BrutalistButton: React.FC<BrutalistButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  // Variant colors
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      textColor: theme.colors.white,
      borderColor: theme.colors.border,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      textColor: theme.colors.white,
      borderColor: theme.colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: theme.colors.text,
      borderColor: theme.colors.borderLight,
    },
    success: {
      backgroundColor: theme.colors.success,
      textColor: theme.colors.white,
      borderColor: theme.colors.border,
    },
    danger: {
      backgroundColor: theme.colors.error,
      textColor: theme.colors.white,
      borderColor: theme.colors.border,
    },
  };

  // Size configurations
  const sizeStyles = {
    sm: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: theme.typography.fontSizeSM,
      shadowOffset: { width: 2, height: 2 },
      borderRadius: theme.radius.radiusSM,
    },
    md: {
      paddingHorizontal: 24,
      paddingVertical: 14,
      fontSize: theme.typography.fontSizeMD,
      shadowOffset: { width: 4, height: 4 },
      borderRadius: theme.radius.radiusMD,
    },
    lg: {
      paddingHorizontal: 32,
      paddingVertical: 18,
      fontSize: theme.typography.fontSizeLG,
      shadowOffset: { width: 5, height: 5 },
      borderRadius: theme.radius.radiusLG,
    },
  };

  const colors = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: colors.backgroundColor,
          borderWidth: variant === 'ghost' ? 2 : 4,
          borderColor: colors.borderColor,
          borderRadius: sizes.borderRadius,
          paddingHorizontal: sizes.paddingHorizontal,
          paddingVertical: sizes.paddingVertical,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          // Hard shadow
          shadowColor: '#000000',
          shadowOffset: sizes.shadowOffset,
          shadowOpacity: variant === 'ghost' ? 0.5 : 1,
          shadowRadius: 0,
          elevation: 0,
          // Opacity for disabled
          opacity: disabled ? 0.5 : 1,
        },
        // Press animation: move down+right, reduce shadow
        pressed && !disabled && {
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
      {icon && icon}
      <Text
        style={[
          {
            color: colors.textColor,
            fontSize: sizes.fontSize,
            fontFamily: theme.typography.fontFamilyBodySemibold,
            textAlign: 'center',
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Inline styles for type safety
});
