import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BackgroundEffectsProps {
    size: number;
}

/**
 * BackgroundEffects - Retro-futuristic animated background for Habi
 * 
 * Features:
 * - Animated gradient background (purple/pink)
 * - Pulsing rings expanding from center
 * - Glow halo effect
 */
export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ size }) => {
    // Animation values for 3 pulsing rings
    const ring1Scale = useRef(new Animated.Value(1)).current;
    const ring1Opacity = useRef(new Animated.Value(0.6)).current;

    const ring2Scale = useRef(new Animated.Value(1)).current;
    const ring2Opacity = useRef(new Animated.Value(0.6)).current;

    const ring3Scale = useRef(new Animated.Value(1)).current;
    const ring3Opacity = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        // Create pulsing ring animation
        const createPulse = (scaleValue: Animated.Value, opacityValue: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.parallel([
                        Animated.timing(scaleValue, {
                            toValue: 2,
                            duration: 2000,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityValue, {
                            toValue: 0,
                            duration: 2000,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(scaleValue, {
                            toValue: 1,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityValue, {
                            toValue: 0.6,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            );
        };

        // Start all three rings with staggered delays
        const pulse1 = createPulse(ring1Scale, ring1Opacity, 0);
        const pulse2 = createPulse(ring2Scale, ring2Opacity, 700);
        const pulse3 = createPulse(ring3Scale, ring3Opacity, 1400);

        pulse1.start();
        pulse2.start();
        pulse3.start();

        return () => {
            pulse1.stop();
            pulse2.stop();
            pulse3.stop();
        };
    }, []);

    const ringSize = size * 0.7;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Animated Gradient Background */}
            <LinearGradient
                colors={['rgba(99, 102, 241, 0.15)', 'rgba(236, 72, 153, 0.15)', 'rgba(139, 92, 246, 0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            />

            {/* Glow Halo */}
            <View style={[styles.glow, { width: size * 0.8, height: size * 0.8 }]} />

            {/* Pulsing Rings */}
            <Animated.View
                style={[
                    styles.ring,
                    {
                        width: ringSize,
                        height: ringSize,
                        borderRadius: ringSize / 2,
                        transform: [{ scale: ring1Scale }],
                        opacity: ring1Opacity,
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.ring,
                    {
                        width: ringSize,
                        height: ringSize,
                        borderRadius: ringSize / 2,
                        transform: [{ scale: ring2Scale }],
                        opacity: ring2Opacity,
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.ring,
                    {
                        width: ringSize,
                        height: ringSize,
                        borderRadius: ringSize / 2,
                        transform: [{ scale: ring3Scale }],
                        opacity: ring3Opacity,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    glow: {
        position: 'absolute',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderRadius: 9999,
        opacity: 0.6,
    },
    ring: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'rgba(168, 85, 247, 0.4)',
    },
});
