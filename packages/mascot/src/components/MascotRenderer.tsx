import React from 'react';
import { View, StyleSheet, Animated, Easing, Text, Image, ImageSourcePropType } from 'react-native';
import { Svg, Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '@app-core/theme';
import { MascotMood, HabiCustomization } from '../types';
import { FaceLayer } from './layers/FaceLayer';
import MascotCharacter from './MascotCharacter';

interface MascotRendererProps {
    mood: MascotMood;
    size?: number;
    isAnimating?: boolean;
}

const MascotRenderer: React.FC<MascotRendererProps> = ({ mood, size = 100, isAnimating = false }) => {
    const { theme } = useTheme();

    // Special case for default theme to use the animated SVG character
    if (theme.id === 'default') {
        return (
            <MascotCharacter
                mood={mood}
                size={size}
                isAnimating={isAnimating}
            />
        );
    }

    // Fallback to happy if specific mood asset is missing (though types enforce it)
    const mascotAssets = (theme.assets?.mascot || {}) as Record<string, any>;
    const asset = mascotAssets[mood] || mascotAssets.happy;

    // Check if asset is a string (emoji) or image source
    const isEmoji = typeof asset === 'string';

    if (isEmoji) {
        return (
            <View style={[styles.container, { width: size, height: size }]}>
                <Text style={{ fontSize: size * 0.8 }}>{asset as string}</Text>
            </View>
        );
    }

    return (
        <Image
            source={asset as ImageSourcePropType}
            style={{ width: size, height: size }}
            resizeMode="contain"
        />
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MascotRenderer;
