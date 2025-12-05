import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';

export type CompletionFilterType = 'all' | 'single' | 'multiple';

interface CompletionTypeFilterProps {
    selected: CompletionFilterType;
    onSelect: (type: CompletionFilterType) => void;
    visible: boolean;
}

const FILTER_OPTIONS: { value: CompletionFilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'single', label: 'Single Task' },
    { value: 'multiple', label: 'Multiple Tasks' },
];

/**
 * Completion Type Filter Component (Tier 2)
 * 
 * Secondary filter for single vs multiple completion habits.
 * Only visible when a specific time period is selected (not "All").
 */
export const CompletionTypeFilter: React.FC<CompletionTypeFilterProps> = ({
    selected,
    onSelect,
    visible,
}) => {
    const { theme } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-10)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: theme.animation.durationNormal,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: theme.animation.durationNormal,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: theme.animation.durationFast,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -10,
                    duration: theme.animation.durationFast,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleSelect = (type: CompletionFilterType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(type);
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surfaceSecondary,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={styles.innerContainer}>
                {FILTER_OPTIONS.map((option) => {
                    const isSelected = selected === option.value;

                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.pill,
                                {
                                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                                    borderColor: isSelected ? theme.colors.primaryDark : theme.colors.border,
                                    borderRadius: theme.radius.radiusFull,
                                    ...theme.shadows.shadowSM,
                                },
                            ]}
                            onPress={() => handleSelect(option.value)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.label,
                                    {
                                        color: isSelected ? theme.colors.white : theme.colors.text,
                                        fontFamily: theme.typography.fontFamilyBodySemibold,
                                        fontSize: theme.typography.fontSizeSM,
                                    },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    innerContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 8,
    },
    pill: {
        height: 36,
        paddingHorizontal: 12,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    label: {
        lineHeight: 16,
    },
});
