import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { BadgeIcon } from './BadgeIcon';
import { BadgeDefinition } from '../types/badges';
import { useTheme } from '@app-core/theme';

interface BadgeToastProps {
    badge: BadgeDefinition;
    progress: number;
    target: number;
    visible: boolean;
    onPress?: () => void;
}

export const BadgeToast: React.FC<BadgeToastProps> = ({ badge, progress, target, visible, onPress }) => {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(visible);
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-50)).current;

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -50,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => setIsVisible(false));
        }
    }, [visible]);

    if (!isVisible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    shadowColor: '#000', // Fallback since shadow token might be missing
                    opacity,
                    transform: [{ translateY }],
                }
            ]}
        >
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <BlurView intensity={80} tint="dark" style={styles.content}>
                    <View style={styles.iconContainer}>
                        <BadgeIcon
                            tier={badge.tier}
                            shape={badge.shape}
                            icon={badge.icon}
                            size={40}
                            isLocked={true} // Always show as locked/progressing in toast
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{badge.title}</Text>
                        <Text style={styles.progress}>
                            {progress} / {target} to unlock
                        </Text>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${Math.min(100, (progress / target) * 100)}%` }
                                ]}
                            />
                        </View>
                    </View>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Below status bar
        left: 16,
        right: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    progress: {
        color: '#CCC',
        fontSize: 12,
        marginBottom: 6,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFD700', // Gold color
        borderRadius: 2,
    },
});
