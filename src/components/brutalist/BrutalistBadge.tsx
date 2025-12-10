import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@app-core/theme';

interface BrutalistBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'pink' | 'cyan';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

/**
 * BrutalistBadge - Small pill/badge with bold border and shadow
 *
 * Perfect for counts, status indicators, tags
 *
 * Usage:
 * <BrutalistBadge variant="pink">5</BrutalistBadge>
 */
export const BrutalistBadge: React.FC<BrutalistBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const { theme } = useTheme();

  const variantColors = {
    primary: {
      background: theme.colors.primary,
      text: theme.colors.white,
    },
    secondary: {
      background: theme.colors.secondary,
      text: theme.colors.white,
    },
    success: {
      background: theme.colors.success,
      text: theme.colors.white,
    },
    warning: {
      background: theme.colors.warning,
      text: theme.colors.text,
    },
    error: {
      background: theme.colors.error,
      text: theme.colors.white,
    },
    pink: {
      background: theme.colors.accent2,
      text: theme.colors.white,
    },
    cyan: {
      background: theme.colors.accent1,
      text: theme.colors.text,
    },
  };

  const sizeStyles = {
    sm: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: theme.typography.fontSizeXS,
      shadowOffset: { width: 1, height: 1 },
    },
    md: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: theme.typography.fontSizeSM,
      shadowOffset: { width: 2, height: 2 },
    },
  };

  const colors = variantColors[variant];
  const sizes = sizeStyles[size];

  return (
    <View
      style={[
        {
          backgroundColor: colors.background,
          borderWidth: 2,
          borderColor: theme.colors.border,
          borderRadius: 999, // Pill shape
          paddingHorizontal: sizes.paddingHorizontal,
          paddingVertical: sizes.paddingVertical,
          alignSelf: 'flex-start',
          // Hard shadow
          shadowColor: '#000000',
          shadowOffset: sizes.shadowOffset,
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 0,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: sizes.fontSize,
          fontFamily: theme.typography.fontFamilyBodyBold,
          textAlign: 'center',
        }}
      >
        {children}
      </Text>
    </View>
  );
};
