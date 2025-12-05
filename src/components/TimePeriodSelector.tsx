import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HabitTimePeriod, TimeRangeSettings } from '@/types/habit';
import { useTheme } from '@/theme';
import {
    getTimePeriodIcon,
    getTimePeriodLabel,
    getTimePeriodRange,
    getTimePeriodColor,
} from '@/utils/timeHelpers';

interface TimePeriodSelectorProps {
    selected: HabitTimePeriod;
    onSelect: (period: HabitTimePeriod) => void;
    timeRanges: TimeRangeSettings;
}

const TIME_PERIODS: HabitTimePeriod[] = ['morning', 'afternoon', 'evening', 'night', 'anytime'];

/**
 * Time Period Selector Component
 * 
 * Displays a list of tappable cards for selecting when a habit should be done.
 * Used in CreateHabitScreen and EditHabitScreen.
 */
export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
    selected,
    onSelect,
    timeRanges,
}) => {
    const { theme } = useTheme();

    const handleSelect = (period: HabitTimePeriod) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(period);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplaySemibold,
            }]}>
                When will you do this habit?
            </Text>

            <View style={styles.optionsContainer}>
                {TIME_PERIODS.map((period) => {
                    const isSelected = selected === period;
                    const iconName = getTimePeriodIcon(period);
                    const label = getTimePeriodLabel(period);
                    const range = getTimePeriodRange(period, timeRanges);
                    const iconColor = getTimePeriodColor(period, theme.name === 'Dark Mode');

                    return (
                        <TouchableOpacity
                            key={period}
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                                    borderColor: isSelected ? theme.colors.primaryDark : theme.colors.border,
                                    borderRadius: theme.radius.radiusMD,
                                    ...theme.shadows[isSelected ? 'shadowMD' : 'shadowSM'],
                                },
                            ]}
                            onPress={() => handleSelect(period)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionContent}>
                                <Ionicons
                                    name={iconName}
                                    size={24}
                                    color={isSelected ? theme.colors.white : iconColor}
                                    style={styles.icon}
                                />
                                <View style={styles.textContainer}>
                                    <Text
                                        style={[
                                            styles.label,
                                            {
                                                color: isSelected ? theme.colors.white : theme.colors.text,
                                                fontFamily: theme.typography.fontFamilyBodySemibold,
                                                fontSize: theme.typography.fontSizeMD,
                                            },
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.range,
                                            {
                                                color: isSelected ? theme.colors.white : theme.colors.textSecondary,
                                                fontFamily: theme.typography.fontFamilyBody,
                                                fontSize: theme.typography.fontSizeXS,
                                            },
                                        ]}
                                    >
                                        {range}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        marginBottom: 16,
    },
    optionsContainer: {
        gap: 8,
    },
    optionCard: {
        height: 72,
        padding: 16,
        borderWidth: 2,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        marginBottom: 2,
    },
    range: {
        lineHeight: 16,
    },
});
