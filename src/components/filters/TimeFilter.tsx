import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HabitTimePeriod, TimeRangeSettings } from '@/types/habit';
import { useTheme } from '@/theme';
import {
    getTimePeriodIcon,
    getTimePeriodLabel,
    getTimePeriodColor,
} from '@/utils/timeHelpers';

interface TimeFilterProps {
    selected: 'all' | HabitTimePeriod;
    onSelect: (period: 'all' | HabitTimePeriod) => void;
    counts: Record<HabitTimePeriod | 'all', number>;
    timeRanges: TimeRangeSettings;
}

const TIME_PERIODS: ('all' | HabitTimePeriod)[] = ['all', 'morning', 'afternoon', 'evening', 'night', 'anytime'];

/**
 * Time Filter Component (Tier 1)
 * 
 * Horizontal scrollable filter for selecting time periods.
 * Primary filter that's always visible.
 */
export const TimeFilter: React.FC<TimeFilterProps> = ({
    selected,
    onSelect,
    counts,
    timeRanges,
}) => {
    const { theme } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSelect = (period: 'all' | HabitTimePeriod) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(period);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {TIME_PERIODS.map((period) => {
                    const isSelected = selected === period;
                    const count = counts[period] || 0;
                    const label = period === 'all' ? 'All' : getTimePeriodLabel(period);
                    const iconName = period === 'all' ? 'apps' : getTimePeriodIcon(period);
                    const iconColor = period === 'all'
                        ? (isSelected ? theme.colors.white : theme.colors.textSecondary)
                        : (isSelected ? theme.colors.white : getTimePeriodColor(period, theme.name === 'Dark Mode'));

                    return (
                        <TouchableOpacity
                            key={period}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                                    borderColor: isSelected ? theme.colors.primaryDark : theme.colors.border,
                                    borderRadius: theme.radius.radiusLG,
                                    ...theme.shadows[isSelected ? 'shadowMD' : 'shadowSM'],
                                },
                            ]}
                            onPress={() => handleSelect(period)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={iconName as any}
                                size={20}
                                color={iconColor}
                                style={styles.icon}
                            />
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
                                {label}
                            </Text>
                            {count > 0 && (
                                <View
                                    style={[
                                        styles.badge,
                                        {
                                            backgroundColor: isSelected
                                                ? `${theme.colors.white}30`
                                                : `${theme.colors.primary}20`,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.badgeText,
                                            {
                                                color: isSelected ? theme.colors.white : theme.colors.primary,
                                                fontFamily: theme.typography.fontFamilyBodyBold,
                                                fontSize: theme.typography.fontSizeXS,
                                            },
                                        ]}
                                    >
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    scrollContent: {
        gap: 8,
        paddingRight: 16,
    },
    chip: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 2,
        minWidth: 80,
    },
    icon: {
        marginRight: 4,
    },
    label: {
        marginRight: 6,
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        lineHeight: 16,
    },
});
