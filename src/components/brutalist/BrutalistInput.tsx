import React, { useState } from 'react';
import { TextInput, StyleSheet, ViewStyle, TextInputProps, View, Text } from 'react-native';
import { useTheme } from '@app-core/theme';

interface BrutalistInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

/**
 * BrutalistInput - Bold text input with thick border and focus shadow
 *
 * Usage:
 * <BrutalistInput
 *   label="Habit Name"
 *   value={value}
 *   onChangeText={setValue}
 *   error={error}
 * />
 */
export const BrutalistInput: React.FC<BrutalistInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSizeSM,
            fontFamily: theme.typography.fontFamilyBodySemibold,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
      )}

      <TextInput
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          {
            backgroundColor: theme.colors.surface,
            borderWidth: 3,
            borderColor: error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border,
            borderRadius: theme.radius.radiusSM,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: theme.typography.fontSizeMD,
            fontFamily: theme.typography.fontFamilyBody,
            color: theme.colors.text,
            // Focus shadow
            shadowColor: error ? theme.colors.error : isFocused ? theme.colors.primary : '#000000',
            shadowOffset: { width: 3, height: 3 },
            shadowOpacity: isFocused ? 0.6 : 0,
            shadowRadius: 0,
            elevation: 0,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textTertiary}
      />

      {error && (
        <Text
          style={{
            color: theme.colors.error,
            fontSize: theme.typography.fontSizeXS,
            fontFamily: theme.typography.fontFamilyBodyMedium,
            marginTop: 6,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
