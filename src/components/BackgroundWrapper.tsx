import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

interface BackgroundWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children, style }) => {
    const { theme, themeVariant } = useTheme();

    // Check if we are using the Go Club (default) theme
    const isGoClubTheme = themeVariant === 'default';

    if (isGoClubTheme) {
        return (
            <LinearGradient
                // Electric Ultramarine Gradient: #1E1EFF -> #0000E0
                colors={['#1E1EFF', '#0000E0']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[styles.container, style]}
            >
                {children}
            </LinearGradient>
        );
    }

    // Fallback for other themes (solid background)
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
