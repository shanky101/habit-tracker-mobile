import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme';
import { CategoryData } from '@/utils/analyticsUtils';

interface CategoryDistributionChartProps {
    data: CategoryData[];
}

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ data }) => {
    const { theme } = useTheme();

    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    No data available
                </Text>
            </View>
        );
    }

    const chartData = data.map(item => ({
        value: item.value,
        color: item.color,
        text: `${item.value}`,
        shiftTextX: -10,
        shiftTextY: -10,
    }));

    const renderLegend = () => {
        return (
            <View style={styles.legendContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                            {item.name}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.chartWrapper}>
                <PieChart
                    data={chartData}
                    donut
                    radius={80}
                    innerRadius={60}
                    innerCircleColor={theme.colors.surface}
                    centerLabelComponent={() => {
                        return (
                            <View style={styles.centerLabel}>
                                <Text style={[styles.centerValue, { color: theme.colors.text }]}>
                                    {data.reduce((acc, curr) => acc + curr.value, 0)}
                                </Text>
                                <Text style={[styles.centerText, { color: theme.colors.textSecondary }]}>
                                    Total
                                </Text>
                            </View>
                        );
                    }}
                />
            </View>
            {renderLegend()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    chartWrapper: {
        marginBottom: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
    centerLabel: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    centerText: {
        fontSize: 12,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
    },
});

export default CategoryDistributionChart;
