import React, { useEffect, useRef, ReactNode } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { useTheme } from '@app-core/theme';

const { width } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

export interface SuccessAction {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
}

export interface SuccessStat {
    label: string;
    value: string | number;
}

export interface SuccessModalProps {
    visible: boolean;
    onDismiss: () => void;

    // Visual
    emoji: string;
    title: string;
    subtitle?: string;

    // Optional content
    quote?: string;
    stats?: SuccessStat[];
    showConfetti?: boolean;

    // Actions
    primaryAction: SuccessAction;
    secondaryAction?: SuccessAction;

    // Customization
    backgroundColor?: string;
    confettiEmojis?: string[];
}

// ============================================
// COMPONENT
// ============================================

export const SuccessModal: React.FC<SuccessModalProps> = ({
    visible,
    onDismiss,
    emoji,
    title,
    subtitle,
    quote,
    stats,
    showConfetti = false,
    primaryAction,
    secondaryAction,
    backgroundColor,
    confettiEmojis = ['🎊', '✨', '🌟', '🎉'],
}) => {
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const confettiAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset animations
            scaleAnim.setValue(0);
            fadeAnim.setValue(0);
            confettiAnim.setValue(0);

            // Run animations
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(confettiAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, scaleAnim, fadeAnim, confettiAnim]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onDismiss}
        >
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={onDismiss}
            >
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: backgroundColor || theme.colors.backgroundSecondary,
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Confetti effect */}
                    {showConfetti && (
                        <View style={styles.confettiContainer}>
                            {confettiEmojis.map((confettiEmoji, index) => (
                                <Text key={index} style={styles.confetti}>
                                    {confettiEmoji}
                                </Text>
                            ))}
                        </View>
                    )}

                    {/* Main Content */}
                    <Text style={styles.emoji}>{emoji}</Text>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamilyDisplay,
                                fontSize: theme.typography.fontSize2XL,
                                fontWeight: theme.typography.fontWeightBold,
                            },
                        ]}
                    >
                        {title}
                    </Text>

                    {subtitle && (
                        <Text
                            style={[
                                styles.subtitle,
                                {
                                    color: theme.colors.textSecondary,
                                    fontFamily: theme.typography.fontFamilyBody,
                                    fontSize: theme.typography.fontSizeMD,
                                    lineHeight: theme.typography.lineHeightRelaxed,
                                },
                            ]}
                        >
                            {subtitle}
                        </Text>
                    )}

                    {/* Quote */}
                    {quote && (
                        <View style={[styles.quoteContainer, { backgroundColor: theme.colors.background }]}>
                            <Text
                                style={[
                                    styles.quote,
                                    {
                                        color: theme.colors.text,
                                        fontFamily: theme.typography.fontFamilyBody,
                                        fontSize: theme.typography.fontSizeSM,
                                        fontStyle: 'italic',
                                        lineHeight: theme.typography.lineHeightRelaxed,
                                    },
                                ]}
                            >
                                "{quote}"
                            </Text>
                        </View>
                    )}

                    {/* Stats */}
                    {stats && stats.length > 0 && (
                        <View
                            style={[styles.statsContainer, { backgroundColor: theme.colors.background }]}
                        >
                            {stats.map((stat, index) => (
                                <View key={index} style={styles.statItem}>
                                    <Text
                                        style={[
                                            styles.statValue,
                                            {
                                                color: theme.colors.primary,
                                                fontFamily: theme.typography.fontFamilyDisplay,
                                                fontSize: theme.typography.fontSizeXL,
                                                fontWeight: theme.typography.fontWeightBold,
                                            },
                                        ]}
                                    >
                                        {stat.value}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.statLabel,
                                            {
                                                color: theme.colors.textSecondary,
                                                fontFamily: theme.typography.fontFamilyBody,
                                                fontSize: theme.typography.fontSizeXS,
                                            },
                                        ]}
                                    >
                                        {stat.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                {
                                    backgroundColor: theme.colors.primary,
                                    shadowColor: theme.shadows.shadowMD.shadowColor,
                                    shadowOffset: theme.shadows.shadowMD.shadowOffset,
                                    shadowOpacity: theme.shadows.shadowMD.shadowOpacity,
                                    shadowRadius: theme.shadows.shadowMD.shadowRadius,
                                    elevation: theme.shadows.shadowMD.elevation,
                                },
                            ]}
                            onPress={primaryAction.onPress}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.primaryButtonText,
                                    {
                                        color: theme.colors.white,
                                        fontFamily: theme.typography.fontFamilyBody,
                                        fontSize: theme.typography.fontSizeMD,
                                        fontWeight: theme.typography.fontWeightSemibold,
                                    },
                                ]}
                            >
                                {primaryAction.label}
                            </Text>
                        </TouchableOpacity>

                        {secondaryAction && (
                            <TouchableOpacity
                                style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
                                onPress={secondaryAction.onPress}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.secondaryButtonText,
                                        {
                                            color: theme.colors.primary,
                                            fontFamily: theme.typography.fontFamilyBody,
                                            fontSize: theme.typography.fontSizeSM,
                                            fontWeight: theme.typography.fontWeightMedium,
                                        },
                                    ]}
                                >
                                    {secondaryAction.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.85,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
    },
    confettiContainer: {
        position: 'absolute',
        top: -20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    confetti: {
        fontSize: 32,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 24,
    },
    quoteContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        width: '100%',
    },
    quote: {
        textAlign: 'center',
    },
    statsContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        marginBottom: 4,
    },
    statLabel: {
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    buttonContainer: {
        width: '100%',
    },
    primaryButton: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        // styles from theme
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        // styles from theme
    },
});

export default SuccessModal;
