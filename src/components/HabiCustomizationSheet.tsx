import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native';
import { useTheme } from '@/theme';
import { useMascot, MASCOT_NAME } from '@/context/MascotContext';
import MascotRenderer from './MascotRenderer';
import { X, Check, Sparkles, Maximize2, Minimize2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface HabiCustomizationSheetProps {
    visible: boolean;
    onClose: () => void;
}

const { height } = Dimensions.get('window');

const HabiCustomizationSheet: React.FC<HabiCustomizationSheetProps> = ({ visible, onClose }) => {
    const { theme } = useTheme();
    const { settings, toggleDisplayMode } = useMascot();
    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 90,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleSelectMode = (mode: 'compact' | 'default') => {
        if (settings.displayMode !== mode) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleDisplayMode(mode);
        }
    };

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        sheet: {
            borderTopLeftRadius: theme.styles.cardBorderRadius * 2,
            borderTopRightRadius: theme.styles.cardBorderRadius * 2,
            padding: 24,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            minHeight: 500,
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: theme.colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 24,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            fontFamily: theme.styles.fontFamilyDisplay || theme.typography.fontFamilyDisplayBold,
        },
        closeButton: {
            padding: 4,
        },
        subtitle: {
            fontSize: 16,
            marginBottom: 32,
            lineHeight: 24,
            fontFamily: theme.styles.fontFamilyBody || theme.typography.fontFamilyBody,
        },
        optionsContainer: {
            gap: 16,
            marginBottom: 32,
        },
        optionCard: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: theme.styles.cardBorderRadius,
            gap: 16,
        },
        previewBox: {
            width: 80,
            height: 80,
            borderRadius: theme.styles.buttonBorderRadius,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
        },
        mascotPreviewLarge: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 4,
        },
        bubblePreview: {
            padding: 4,
            borderRadius: 8,
            gap: 2,
        },
        compactRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 8,
        },
        mascotPreviewSmall: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        bubblePreviewSmall: {
            padding: 4,
            borderRadius: 4,
        },
        line: {
            height: 2,
            borderRadius: 1,
        },
        optionContent: {
            flex: 1,
        },
        optionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        optionTitle: {
            fontSize: 18,
            fontWeight: '600',
            fontFamily: theme.styles.fontFamilyDisplay || theme.typography.fontFamilyDisplaySemibold,
        },
        optionDescription: {
            fontSize: 13,
            lineHeight: 18,
            fontFamily: theme.styles.fontFamilyBody || theme.typography.fontFamilyBody,
        },
        checkCircle: {
            width: 24,
            height: 24,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        doneButton: {
            paddingVertical: 16,
            borderRadius: theme.styles.buttonBorderRadius,
            alignItems: 'center',
        },
        doneButtonText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: '600',
            fontFamily: theme.styles.fontFamilyBody || theme.typography.fontFamilyBodySemibold,
        },
    });

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={handleClose}
            animationType="none"
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={handleClose}>
                    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: theme.colors.background,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Customize {MASCOT_NAME}</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Choose how you want your companion to appear on the home screen.
                    </Text>

                    <View style={styles.optionsContainer}>
                        {/* Standard Mode Option */}
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => handleSelectMode('default')}
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: theme.colors.surface,
                                    borderColor: settings.displayMode === 'default' ? theme.colors.primary : theme.colors.border,
                                    borderWidth: settings.displayMode === 'default' ? 2 : 1,
                                },
                            ]}
                        >
                            <View style={[styles.previewBox, { backgroundColor: theme.colors.backgroundSecondary }]}>
                                <View style={[styles.mascotPreviewLarge, { backgroundColor: theme.colors.primary }]}>
                                    <MascotRenderer mood="happy" size={48} />
                                </View>
                                <View style={[styles.bubblePreview, { backgroundColor: theme.colors.surface }]}>
                                    <View style={[styles.line, { width: 40, backgroundColor: theme.colors.textTertiary }]} />
                                    <View style={[styles.line, { width: 30, backgroundColor: theme.colors.textTertiary }]} />
                                </View>
                            </View>

                            <View style={styles.optionContent}>
                                <View style={styles.optionHeader}>
                                    <Maximize2 size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
                                    <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Standard</Text>
                                </View>
                                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                                    Full personality with larger animations and messages.
                                </Text>
                            </View>

                            {settings.displayMode === 'default' && (
                                <View style={[styles.checkCircle, { backgroundColor: theme.colors.primary }]}>
                                    <Check size={16} color="#FFF" strokeWidth={3} />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Compact Mode Option */}
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => handleSelectMode('compact')}
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: theme.colors.surface,
                                    borderColor: settings.displayMode === 'compact' ? theme.colors.primary : theme.colors.border,
                                    borderWidth: settings.displayMode === 'compact' ? 2 : 1,
                                },
                            ]}
                        >
                            <View style={[styles.previewBox, { backgroundColor: theme.colors.backgroundSecondary }]}>
                                <View style={styles.compactRow}>
                                    <View style={[styles.mascotPreviewSmall, { backgroundColor: theme.colors.primary }]}>
                                        <MascotRenderer mood="happy" size={32} />
                                    </View>
                                    <View style={[styles.bubblePreviewSmall, { backgroundColor: theme.colors.surface }]}>
                                        <View style={[styles.line, { width: 60, backgroundColor: theme.colors.textTertiary }]} />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.optionContent}>
                                <View style={styles.optionHeader}>
                                    <Minimize2 size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
                                    <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Compact</Text>
                                </View>
                                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                                    Minimal footprint to keep focus on your habits.
                                </Text>
                            </View>

                            {settings.displayMode === 'compact' && (
                                <View style={[styles.checkCircle, { backgroundColor: theme.colors.primary }]}>
                                    <Check size={16} color="#FFF" strokeWidth={3} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.doneButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleClose}
                    >
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};



export default HabiCustomizationSheet;
