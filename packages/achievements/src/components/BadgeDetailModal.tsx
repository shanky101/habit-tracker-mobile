import React, { useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Share, Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { BadgeDefinition } from '../types/badges';
import { BadgeIcon } from './BadgeIcon';
import { CheckCircle, Share2, X } from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

interface BadgeDetailModalProps {
    badge: BadgeDefinition | null;
    visible: boolean;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, visible, onClose }) => {
    const viewShotRef = useRef<ViewShot>(null);

    // Animation State
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const lastRotate = useRef(0);
    const velocity = useRef(0);

    // Gesture for rotation
    const startRotate = useRef(0);

    const pan = Gesture.Pan()
        .onStart(() => {
            rotateAnim.stopAnimation((value) => {
                startRotate.current = value;
            });
        })
        .onUpdate((e) => {
            // Map translationX to degrees (sensitivity factor)
            // 1 pixel = 0.8 degree
            const newRotate = startRotate.current + e.translationX * 0.8;
            rotateAnim.setValue(newRotate);
        })
        .onEnd((e) => {
            // Add inertia/decay
            // GH velocity is pixels/sec. Animated.decay expects units/ms.
            // We map pixels to degrees (0.8 factor).
            // So velocity in degrees/ms = (velocityX * 0.8) / 1000
            const velocityMs = (e.velocityX * 0.8) / 1000;

            Animated.decay(rotateAnim, {
                velocity: velocityMs,
                deceleration: 0.995,
                useNativeDriver: true,
            }).start();
        })
        .runOnJS(true);

    // Reset rotation when modal opens
    React.useEffect(() => {
        if (visible) {
            rotateAnim.setValue(0);
            lastRotate.current = 0;

            // Initial spin entry animation
            Animated.spring(rotateAnim, {
                toValue: 360,
                friction: 20,
                tension: 2,
                useNativeDriver: true,
            }).start(() => {
                lastRotate.current = 360;
            });
        }
    }, [visible]);

    if (!badge) return null;

    const handleShare = async () => {
        try {
            if (viewShotRef.current && (viewShotRef.current as any).capture) {
                const uri = await (viewShotRef.current as any).capture();
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/png',
                    dialogTitle: `Share your ${badge.title} badge!`,
                });
            }
        } catch (error) {
            console.error('Sharing failed', error);
        }
    };

    const isLocked = !(badge as any).isUnlocked;
    const progress = (badge as any).progress || 0;
    const target = badge.requirement.threshold;
    const progressPercent = Math.min(100, Math.round((progress / target) * 100));

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [-360, 0, 360],
        outputRange: ['-360deg', '0deg', '360deg'],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <View style={styles.content}>
                    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.card}>
                        <GestureDetector gesture={pan}>
                            <View style={styles.badgeContainer}>
                                <Animated.View style={{
                                    transform: [{ perspective: 1000 }, { rotateY: rotateInterpolate }]
                                }}>
                                    <BadgeIcon
                                        tier={badge.tier}
                                        shape={badge.shape}
                                        icon={badge.icon}
                                        size={160}
                                        isLocked={isLocked}
                                    />
                                </Animated.View>
                            </View>
                        </GestureDetector>

                        <Text style={styles.title}>
                            {badge.secret && isLocked ? 'Secret Badge' : badge.title}
                        </Text>

                        <Text style={styles.description}>
                            {badge.secret && isLocked
                                ? 'Keep using the app to discover this badge.'
                                : badge.description}
                        </Text>

                        {isLocked && badge.progressTracked && !badge.secret && (
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                                </View>
                                <Text style={styles.progressText}>{progress} / {target}</Text>
                            </View>
                        )}

                        {!isLocked && (
                            <View style={styles.unlockedDate}>
                                <CheckCircle size={16} color="#4ADE80" />
                                <Text style={styles.unlockedText}>
                                    Unlocked on {new Date((badge as any).unlockedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </ViewShot>

                    <View style={styles.actions}>
                        {!isLocked && (
                            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                                <Share2 size={20} color="#000" />
                                <Text style={styles.shareText}>Share</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        width: width * 0.85,
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    badgeContainer: {
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#AAA',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    progressContainer: {
        width: '100%',
        marginTop: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFF',
    },
    progressText: {
        color: '#888',
        fontSize: 12,
        textAlign: 'right',
    },
    unlockedDate: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    unlockedText: {
        color: '#4ADE80',
        fontSize: 12,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
        width: '100%',
    },
    shareButton: {
        flex: 1,
        backgroundColor: '#FFF',
        height: 50,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    shareText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
