import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '@app-core/theme';
import { TimeOfDayData } from '@/utils/analyticsUtils';

interface TimeOfDayChartProps {
    data: TimeOfDayData[];
}

const TimeOfDayChart: React.FC<TimeOfDayChartProps> = ({ data }) => {
    const { theme } = useTheme();

    if (data.every(d => d.value === 0)) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    No data available
                </Text>
            </View>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value));

    const chartData = data.map(item => ({
        value: item.value,
        label: item.label,
        frontColor: item.color,
        topLabelComponent: () => (
            <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                {item.value}
            </Text>
        ),
    }));

    return (
        <View style={styles.container}>
            <BarChart
                data={chartData}
                barWidth={32}
                spacing={24}
                roundedTop
                roundedBottom
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: theme.colors.textSecondary }}
                noOfSections={3}
                maxValue={maxValue + (maxValue * 0.2)} // Add some headroom
                xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                width={300}
                height={180}
                isAnimated
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 10,
        overflow: 'hidden', // Prevent overflow issues
    },
    emptyContainer: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
    barLabel: {
        fontSize: 10,
        marginBottom: 4,
        textAlign: 'center',
    },
});

export default TimeOfDayChart;
