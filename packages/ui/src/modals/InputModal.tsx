import React, { useState, useEffect, useRef, ReactNode } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@app-core/theme';

// ============================================
// TYPES
// ============================================

export interface InputOption {
    emoji: string;
    label: string;
    value: string;
}

export interface InputModalProps {
    visible: boolean;
    onDismiss: () => void;

    // Content
    title: string;
    subtitle?: string;
    inputPlaceholder: string;
    inputValue?: string;
    maxLength?: number;
    minHeight?: number;

    // Optional button selector
    options?: InputOption[];
    selectedOption?: string;

    // Actions
    saveLabel?: string;
    skipLabel?: string;
    onSave: (input: string, selectedOption?: string) => void;

    // Customization
    gradientColors?: [string, string];
}

// ============================================
// COMPONENT
// ============================================

export const InputModal: React.FC<InputModalProps> = ({
    visible,
    onDismiss,
    title,
    subtitle,
    inputPlaceholder,
    inputValue = '',
    maxLength = 150,
    minHeight = 100,
    options,
    selectedOption: initialSelectedOption,
    saveLabel = 'Save',
    skipLabel = 'Skip',
    onSave,
    gradientColors,
}) => {
    const { theme } = useTheme();
    const [input, setInput] = useState(inputValue);
    const [selectedOption, setSelectedOption] = useState<string | null>(
        initialSelectedOption || null
    );
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            setInput(inputValue);
            setSelectedOption(initialSelectedOption || null);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    damping: 20,
                    stiffness: 90,
                    mass: 1,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 300,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, inputValue, initialSelectedOption, fadeAnim, slideAnim]);

    const handleSave = () => {
        onSave(input.trim(), selectedOption || undefined);
    };

    if (!visible) return null;

    const colors = gradientColors || [theme.colors.surface, theme.colors.backgroundSecondary];

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <Animated.View
                    style={[
                        styles.modalOverlay,
                        {
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.overlayTouchable}
                        activeOpacity={1}
                        onPress={onDismiss}
                    />
                    <Animated.View
                        style={[
                            styles.bottomSheetContent,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={colors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.gradientContainer}
                        >
                            {/* Handle Bar */}
                            <View style={styles.handleBarContainer}>
                                <View style={[styles.handleBar, { backgroundColor: theme.colors.border }]} />
                            </View>

                            {/* Header */}
                            <View style={styles.headerContainer}>
                                <Text
                                    style={[
                                        styles.title,
                                        {
                                            color: theme.colors.text,
                                            fontFamily: theme.typography.fontFamilyDisplayBold,
                                            fontSize: theme.typography.fontSize2XL,
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
                                            },
                                        ]}
                                    >
                                        {subtitle}
                                    </Text>
                                )}
                            </View>

                            {/* Option Selector */}
                            {options && options.length > 0 && (
                                <View style={styles.optionsContainer}>
                                    {options.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.optionButton,
                                                {
                                                    backgroundColor:
                                                        selectedOption === option.value
                                                            ? theme.colors.primary + '15'
                                                            : 'transparent',
                                                    borderColor:
                                                        selectedOption === option.value
                                                            ? theme.colors.primary
                                                            : theme.colors.border,
                                                    borderWidth: selectedOption === option.value ? 1 : 0,
                                                },
                                            ]}
                                            onPress={() =>
                                                setSelectedOption(selectedOption === option.value ? null : option.value)
                                            }
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.optionEmoji}>{option.emoji}</Text>
                                            <Text
                                                style={[
                                                    styles.optionLabel,
                                                    {
                                                        color:
                                                            selectedOption === option.value
                                                                ? theme.colors.primary
                                                                : theme.colors.textSecondary,
                                                        fontFamily: theme.typography.fontFamilyBodyMedium,
                                                    },
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Text Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: theme.colors.background,
                                            color: theme.colors.text,
                                            fontFamily: theme.typography.fontFamilyBody,
                                            minHeight,
                                        },
                                    ]}
                                    placeholder={inputPlaceholder}
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={input}
                                    onChangeText={setInput}
                                    multiline
                                    maxLength={maxLength}
                                />
                            </View>

                            {/* Actions */}
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.saveButton,
                                        {
                                            backgroundColor: theme.colors.text,
                                            shadowColor: theme.colors.text,
                                        },
                                    ]}
                                    onPress={handleSave}
                                    activeOpacity={0.9}
                                >
                                    <Text
                                        style={[
                                            styles.saveButtonText,
                                            {
                                                color: theme.colors.surface,
                                                fontFamily: theme.typography.fontFamilyBodySemibold,
                                            },
                                        ]}
                                    >
                                        {saveLabel}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={onDismiss}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.skipButtonText,
                                            {
                                                color: theme.colors.textSecondary,
                                                fontFamily: theme.typography.fontFamilyBodyMedium,
                                            },
                                        ]}
                                    >
                                        {skipLabel}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        padding: 0,
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        flex: 1,
    },
    bottomSheetContent: {
        width: '100%',
        backgroundColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    gradientContainer: {
        padding: 24,
        paddingBottom: 50,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        width: '100%',
    },
    handleBarContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    handleBar: {
        width: 36,
        height: 4,
        borderRadius: 2,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        width: 60,
        height: 70,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionEmoji: {
        fontSize: 32,
        marginBottom: 4,
    },
    optionLabel: {
        fontSize: 12,
    },
    inputContainer: {
        marginBottom: 32,
    },
    textInput: {
        borderRadius: 12,
        padding: 16,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    actionsContainer: {
        gap: 12,
    },
    saveButton: {
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        fontSize: 16,
        letterSpacing: 0.5,
    },
    skipButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    skipButtonText: {
        fontSize: 16,
    },
});

export default InputModal;
