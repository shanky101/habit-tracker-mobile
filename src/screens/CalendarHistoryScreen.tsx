import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { useHabits } from '@/hooks/useHabits';
import { useUserStore } from '@/store/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isFuture,
} from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Calendar as CalendarIcon,
    Plane,
    Star,
} from 'lucide-react-native';
import DayDetailSheet from '@/components/DayDetailSheet';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 48) / 7;

const CalendarHistoryScreen: React.FC = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { habits, getCompletionForDate } = useHabits();
    const { vacationHistory, isVacationMode } = useUserStore();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    // Helper to check vacation
    const isVacationDay = (date: Date) => {
        const check = new Date(date);
        check.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return vacationHistory.some(interval => {
            const start = new Date(interval.startDate);
            start.setHours(0, 0, 0, 0);

            // For open intervals (endDate is null)
            if (interval.endDate === null) {
                // Only apply if vacation mode is currently ON
                return isVacationMode && check >= start;
            }

            // For closed intervals
            const end = new Date(interval.endDate);
            end.setHours(0, 0, 0, 0);
            return check >= start && check <= end;
        });
    };

    // Calculate stats for a day
    const getDayStats = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');

        // Filter habits active on this date
        const dayHabits = habits.filter(habit => {
            if (habit.createdAt && new Date(habit.createdAt) > date) return false;
            const dayOfWeek = date.getDay();
            return habit.selectedDays.includes(dayOfWeek);
        });

        if (dayHabits.length === 0) return { rate: 0, count: 0, total: 0 };

        let completedCount = 0;
        dayHabits.forEach(habit => {
            const completion = getCompletionForDate(habit.id, dateStr);
            if (completion && completion.completionCount >= completion.targetCount) {
                completedCount++;
            }
        });

        return {
            rate: completedCount / dayHabits.length,
            count: completedCount,
            total: dayHabits.length,
        };
    };

    const renderDayCell = (date: Date, index: number) => {
        const isCurrentMonth = isSameMonth(date, currentMonth);
        const isToday = isSameDay(date, new Date());
        const isFutureDate = isFuture(date);
        const isVacation = isVacationDay(date);
        const { rate, total } = getDayStats(date);

        // Determine cell style
        let backgroundColor = 'transparent';
        let borderColor = 'transparent';
        let textColor = isCurrentMonth ? theme.colors.text : theme.colors.textTertiary;
        let opacity = 1;

        if (!isCurrentMonth) {
            opacity = 0.3;
        } else if (isFutureDate) {
            opacity = 0.5;
            backgroundColor = theme.colors.surface;
        } else if (isVacation) {
            backgroundColor = theme.colors.primary + '15';
            borderColor = theme.colors.primary + '30';
            textColor = theme.colors.primary;
        } else if (total > 0) {
            if (rate === 1) {
                // Perfect day
                backgroundColor = '#F59E0B20'; // Gold tint
                borderColor = '#F59E0B';
                textColor = '#F59E0B';
            } else if (rate > 0) {
                // Some progress
                backgroundColor = theme.colors.primary + Math.max(10, Math.round(rate * 30)).toString();
                textColor = theme.colors.text;
            } else {
                // Missed
                backgroundColor = theme.colors.surface;
                textColor = theme.colors.textSecondary;
            }
        } else {
            // No habits scheduled
            backgroundColor = theme.colors.background;
            textColor = theme.colors.textTertiary;
        }

        if (isToday) {
            borderColor = theme.colors.text;
        }

        return (
            <TouchableOpacity
                key={date.toString()}
                style={[
                    styles.dayCell,
                    {
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor,
                        borderColor,
                        borderWidth: isToday || (isCurrentMonth && !isFutureDate && (rate === 1 || isVacation)) ? 1 : 0,
                        opacity,
                    }
                ]}
                onPress={() => {
                    if (!isFutureDate) {
                        setSelectedDate(format(date, 'yyyy-MM-dd'));
                    }
                }}
                disabled={isFutureDate}
            >
                <Text style={[styles.dayText, { color: textColor, fontWeight: isToday ? '700' : '400' }]}>
                    {format(date, 'd')}
                </Text>

                {/* Indicators */}
                {isCurrentMonth && !isFutureDate && (
                    <View style={styles.indicators}>
                        {isVacation ? (
                            <Plane size={10} color={theme.colors.primary} />
                        ) : rate === 1 && total > 0 ? (
                            <Star size={10} color="#F59E0B" fill="#F59E0B" />
                        ) : null}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Time Travel</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Month Navigation */}
                <View style={[styles.monthNav, { backgroundColor: theme.colors.surface }]}>
                    <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
                        <ChevronLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.monthTitle, { color: theme.colors.text }]}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </Text>
                    <TouchableOpacity
                        onPress={nextMonth}
                        style={styles.navButton}
                        disabled={isFuture(addMonths(currentMonth, 1)) && !isSameMonth(addMonths(currentMonth, 1), new Date())}
                    >
                        <ChevronRight
                            size={24}
                            color={isFuture(addMonths(currentMonth, 1)) && !isSameMonth(addMonths(currentMonth, 1), new Date()) ? theme.colors.textTertiary : theme.colors.text}
                        />
                    </TouchableOpacity>
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#F59E0B', opacity: 0.2, borderWidth: 1, borderColor: '#F59E0B' }]} />
                        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Perfect</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.primary, opacity: 0.3 }]} />
                        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Good</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.primary, opacity: 0.15, borderWidth: 1, borderColor: theme.colors.primary }]} />
                        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Vacation</Text>
                    </View>
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarContainer}>
                    {/* Weekday Headers */}
                    <View style={styles.weekHeader}>
                        {weekDays.map(day => (
                            <Text key={day} style={[styles.weekDayText, { color: theme.colors.textTertiary }]}>
                                {day}
                            </Text>
                        ))}
                    </View>

                    {/* Days */}
                    <View style={styles.daysGrid}>
                        {calendarDays.map((date, index) => renderDayCell(date, index))}
                    </View>
                </View>

                {/* Stats Summary for Month */}
                <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>
                            {calendarDays.filter(d => isSameMonth(d, currentMonth) && !isFuture(d) && getDayStats(d).rate === 1).length}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Perfect Days</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>
                            {calendarDays.filter(d => isSameMonth(d, currentMonth) && !isFuture(d) && isVacationDay(d)).length}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Vacation Days</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Day Detail Sheet */}
            {selectedDate && (
                <DayDetailSheet
                    visible={!!selectedDate}
                    onClose={() => setSelectedDate(null)}
                    date={selectedDate}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
    },
    navButton: {
        padding: 8,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
    },
    calendarContainer: {
        marginBottom: 32,
    },
    weekHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    weekDayText: {
        width: CELL_SIZE,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        marginVertical: 2,
    },
    dayText: {
        fontSize: 14,
    },
    indicators: {
        position: 'absolute',
        bottom: 4,
    },
    statsCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    statDivider: {
        width: 1,
        height: 40,
    },
});

export default CalendarHistoryScreen;
