import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@app-core/theme';
import { HeatmapPoint } from '@/utils/analyticsUtils';
import { format, parseISO } from 'date-fns';

interface ConsistencyHeatmapProps {
    data: HeatmapPoint[];
}

const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({ data }) => {
    const { theme } = useTheme();

    // Group data by weeks (columns)
    // Assuming data is sorted by date
    const weeks: HeatmapPoint[][] = [];
    let currentWeek: HeatmapPoint[] = [];

    data.forEach((point) => {
        currentWeek.push(point);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    const getLevelColor = (level: number) => {
        switch (level) {
            case 0: return theme.colors.backgroundSecondary; // Empty
            case 1: return `${theme.colors.primary}30`; // 20%
            case 2: return `${theme.colors.primary}60`; // 40%
            case 3: return `${theme.colors.primary}90`; // 70%
            case 4: return theme.colors.primary;        // 100%
            default: return theme.colors.backgroundSecondary;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamilyBodySemibold }]}>
                    Consistency Map
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamilyBody }]}>
                    Last 90 Days
                </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.grid}>
                    {weeks.map((week, weekIndex) => (
                        <View key={weekIndex} style={styles.column}>
                            {week.map((day, dayIndex) => (
                                <View
                                    key={day.date}
                                    style={[
                                        styles.cell,
                                        { backgroundColor: getLevelColor(day.level) }
                                    ]}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.legend}>
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Less</Text>
                <View style={styles.legendGradient}>
                    {[0, 1, 2, 3, 4].map(level => (
                        <View
                            key={level}
                            style={[styles.legendCell, { backgroundColor: getLevelColor(level) }]}
                        />
                    ))}
                </View>
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>More</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 16,
    },
    subtitle: {
        fontSize: 12,
    },
    grid: {
        flexDirection: 'row',
        gap: 4,
    },
    column: {
        gap: 4,
    },
    cell: {
        width: 12,
        height: 12,
        borderRadius: 3,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 12,
        gap: 8,
    },
    legendGradient: {
        flexDirection: 'row',
        gap: 4,
    },
    legendCell: {
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 10,
    },
});

export default ConsistencyHeatmap;
