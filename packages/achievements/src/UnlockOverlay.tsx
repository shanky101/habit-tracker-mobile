import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import ConfettiCannon from 'react-native-confetti-cannon';
import { BadgeDefinition } from '../../types/badges';
import { BadgeIcon } from './BadgeIcon';
import { Audio } from 'expo-av';

interface UnlockOverlayProps {
    badge: BadgeDefinition | null;
    visible: boolean;
    onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const UnlockOverlay: React.FC<UnlockOverlayProps> = ({ badge, visible, onClose }) => {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible && badge) {
            // Reset values
            scale.setValue(0);
            opacity.setValue(0);

            // Play sound (placeholder for Phase 3)
            // playUnlockSound(badge.tier);

            // Animate in
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.delay(100),
                    Animated.spring(scale, {
                        toValue: 1.2,
                        friction: 5,
                        tension: 100,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scale, {
                        toValue: 1,
                        friction: 6,
                        tension: 40,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [visible, badge]);

    if (!badge) return null;

    const animatedStyle = {
        transform: [{ scale }],
        opacity,
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

                {visible && (
                    <ConfettiCannon
                        count={200}
                        origin={{ x: width / 2, y: height }}
                        autoStart={true}
                        fadeOut={true}
                        fallSpeed={3000}
                        colors={['#FFD700', '#C0C0C0', '#CD7F32', '#FFF', '#4169E1']}
                    />
                )}

                <Animated.View style={[styles.content, animatedStyle]}>
                    <Text style={styles.headerText}>BADGE UNLOCKED!</Text>

                    <View style={styles.badgeContainer}>
                        <BadgeIcon
                            tier={badge.tier}
                            shape={badge.shape}
                            icon={badge.icon}
                            size={200}
                            isLocked={false}
                        />
                    </View>

                    <Text style={styles.title}>{badge.title}</Text>
                    <Text style={styles.description}>{badge.description}</Text>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Awesome!</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        width: width * 0.8,
    },
    headerText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFD700',
        marginBottom: 40,
        letterSpacing: 2,
        textShadowColor: 'rgba(255, 215, 0, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    badgeContainer: {
        marginBottom: 40,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 18,
        color: '#CCC',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#FFF',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
