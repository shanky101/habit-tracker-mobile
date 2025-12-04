import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/theme';

interface SpeechBubbleProps {
    message: string;
    visible: boolean;
    onDismiss?: () => void;
}

/**
 * Speech Bubble - Cute animated bubble for Habi's messages
 * Features entrance animation, wobble, and auto-dismiss
 */
export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
    message,
    visible,
    onDismiss,
}) => {
    const { theme } = useTheme();
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.8)).current;
    const wobble = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Entrance animation
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            // Subtle wobble animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(wobble, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(wobble, {
                        toValue: -1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Auto-dismiss after 4 seconds
            const timer = setTimeout(() => {
                handleDismiss();
            }, 4000);

            return () => clearTimeout(timer);
        } else {
            // Exit animation
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onDismiss) {
                onDismiss();
            }
        });
    };

    const wobbleRotation = wobble.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-2deg', '2deg'],
    });

    if (!visible && opacity._value === 0) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [
                        { scale },
                        { rotate: wobbleRotation },
                    ],
                },
            ]}
        >
            {/* Triangle tail pointing up to Habi */}
            <View
                style={[
                    styles.tail,
                    {
                        borderBottomColor: theme.colors.surface,
                        shadowColor: theme.colors.shadow,
                    },
                ]}
            />

            {/* Bubble content */}
            <View
                style={[
                    styles.bubble,
                    {
                        backgroundColor: theme.colors.surface,
                        shadowColor: theme.colors.shadow,
                    },
                ]}
            >
                <Text style={[styles.message, { color: theme.colors.text }]}>
                    {message}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 12,
        maxWidth: 280,
    },
    tail: {
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginBottom: -1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    bubble: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
        minWidth: 120,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
    },
});
