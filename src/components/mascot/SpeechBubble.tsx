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

    // Check if using brutalist theme
    const isBrutalist = theme.name === 'Brutalist';

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

    // Check if animation is complete before hiding
    if (!visible) {
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
            {/* Triangle tail - Brutalist version has border */}
            {isBrutalist ? (
                <View style={styles.brutalistTailContainer}>
                    {/* Shadow tail */}
                    <View style={[styles.brutalistTailShadow, { borderTopColor: '#000000' }]} />
                    {/* Border tail */}
                    <View style={[styles.brutalistTailBorder, { borderTopColor: theme.colors.border }]} />
                    {/* Inner tail */}
                    <View style={[styles.brutalistTailInner, { borderTopColor: theme.colors.surface }]} />
                </View>
            ) : (
                <View
                    style={[
                        styles.tail,
                        {
                            borderBottomColor: theme.colors.surface,
                            shadowColor: '#000000',
                        },
                    ]}
                />
            )}

            {/* Bubble content */}
            <View
                style={[
                    styles.bubble,
                    {
                        backgroundColor: theme.colors.surface,
                        shadowColor: '#000000',
                        // Brutalist styling
                        ...(isBrutalist && {
                            borderWidth: 4,
                            borderColor: theme.colors.border,
                            shadowOffset: { width: 5, height: 5 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                        }),
                    },
                ]}
            >
                <Text style={[
                    styles.message,
                    {
                        color: theme.colors.text,
                        fontFamily: isBrutalist
                            ? theme.typography.fontFamilyBodyMedium
                            : undefined,
                    },
                ]}>
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
    // Brutalist tail styles
    brutalistTailContainer: {
        position: 'relative',
        width: 0,
        height: 0,
        marginTop: -16,
        marginBottom: -2,
    },
    brutalistTailShadow: {
        position: 'absolute',
        top: 5,
        left: -15 + 5,
        width: 0,
        height: 0,
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    brutalistTailBorder: {
        position: 'absolute',
        top: 0,
        left: -15,
        width: 0,
        height: 0,
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    brutalistTailInner: {
        position: 'absolute',
        top: -2,
        left: -12,
        width: 0,
        height: 0,
        borderLeftWidth: 12,
        borderRightWidth: 12,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
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
