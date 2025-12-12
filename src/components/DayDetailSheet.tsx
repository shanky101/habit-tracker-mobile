import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DetailSheet } from '@app-core/ui';
import { useTheme } from '@app-core/theme';
import { useHabits } from '@/hooks/useHabits';
import { useUserStore } from '@/store/userStore';
import { CheckCircle2, Circle, Plane, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DayDetailSheetProps {
    visible: boolean;
    onClose: () => void;
    date: string; // YYYY-MM-DD
}

/**
 * DayDetailSheet - Wrapper around DetailSheet
 * 
 * Shows habit completion details for a specific date.
 * Includes vacation mode support and completion statistics.
 */
const DayDetailSheet: React.FC<DayDetailSheetProps> = ({ visible, onClose, date }) => {
    const { theme } = useTheme();
    const { habits, getCompletionForDate } = useHabits();
    const { vacationHistory, isVacationMode } = useUserStore();

    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    // Check if this date was a vacation day
    const isVacation = useMemo(() => {
        const check = new Date(date);
        check.setHours(0, 0, 0, 0);

        return vacationHistory.some(interval => {
            const start = new Date(interval.startDate);
            start.setHours(0, 0, 0, 0);

            if (interval.endDate === null) {
                return isVacationMode && check >= start;
            }

            const end = new Date(interval.endDate);
            end.setHours(0, 0, 0, 0);
            return check >= start && check <= end;
        });
    }, [date, vacationHistory, isVacationMode]);

    // Filter habits active on this date
    const dayHabits = useMemo(() => {
        return habits.filter(habit => {
            if (habit.createdAt && new Date(habit.createdAt) > new Date(date)) return false;
            const dayOfWeek = new Date(date).getDay();
            return habit.selectedDays.includes(dayOfWeek);
        });
    }, [habits, date]);

    const habitStatuses = useMemo(() => {
        return dayHabits.map(habit => {
            const completion = getCompletionForDate(habit.id, date);
            const isCompleted = completion && completion.completionCount >= completion.targetCount;
            return {
                ...habit,
                isCompleted,
                progress: completion ? completion.completionCount : 0,
                target: completion ? completion.targetCount : habit.targetCompletionsPerDay,
            };
        });
    }, [dayHabits, date, getCompletionForDate]);

    const completionRate = useMemo(() => {
        if (dayHabits.length === 0) return 0;
        const completed = habitStatuses.filter(h => h.isCompleted).length;
        return Math.round((completed / dayHabits.length) * 100);
    }, [dayHabits.length, habitStatuses]);

    // Build subtitle
    const subtitle = isVacation ? 'Vacation Mode Active' : undefined;

    // Render summary card
    const renderSummary = () => (
        <LinearGradient
            colors={
                isVacation
                    ? [theme.colors.primary + '20', theme.colors.secondary + '20']
                    : completionRate === 100
                        ? ['#F59E0B20', '#D9770620']
                        : [theme.colors.surface, theme.colors.surface]
            }
            style={[styles.summaryCard, { borderColor: theme.colors.border }]}
        >
            <View style={styles.summaryContent}>
                <View>
                    <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                        Daily Success
                    </Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                        {completionRate}%
                    </Text>
                </View>
                <View style={styles.summaryStats}>
                    <Text style={[styles.statText, { color: theme.colors.text }]}>
                        {habitStatuses.filter(h => h.isCompleted).length}/{dayHabits.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Habits
                    </Text>
                </View>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
                <View
                    style={[
                        styles.progressBarFill,
                        {
                            width: `${completionRate}%`,
                            backgroundColor: isVacation
                                ? theme.colors.primary
                                : (completionRate === 100 ? '#F59E0B' : theme.colors.primary)
                        }
                    ]}
                />
            </View>
        </LinearGradient>
    );

    // Render content
    const renderContent = () => (
        <>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                HABITS
            </Text>

            {habitStatuses.length > 0 ? (
                <View style={styles.habitsList}>
                    {habitStatuses.map(habit => (
                        <View
                            key={habit.id}
                            style={[
                                styles.habitRow,
                                {
                                    backgroundColor: theme.colors.background,
                                    borderColor: habit.isCompleted
                                        ? theme.colors.success + '30'
                                        : theme.colors.border
                                }
                            ]}
                        >
                            <View style={styles.habitInfo}>
                                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                                <View>
                                    <Text style={[styles.habitName, { color: theme.colors.text }]}>
                                        {habit.name}
                                    </Text>
                                    <Text style={[styles.habitTarget, { color: theme.colors.textSecondary }]}>
                                        Target: {habit.target} / day
                                    </Text>
                                </View>
                            </View>

                            {isVacation ? (
                                <View style={[styles.statusBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Plane size={16} color={theme.colors.primary} />
                                </View>
                            ) : habit.isCompleted ? (
                                <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '15' }]}>
                                    <CheckCircle2 size={20} color={theme.colors.success} />
                                </View>
                            ) : (
                                <View style={[styles.statusBadge, { backgroundColor: theme.colors.error + '10' }]}>
                                    <Circle size={20} color={theme.colors.textTertiary} />
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Calendar size={48} color={theme.colors.textTertiary} />
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        No habits scheduled for this day
                    </Text>
                </View>
            )}
        </>
    );

    // Render header right (vacation badge if applicable)
    const renderHeaderRight = isVacation ? () => (
        <View style={styles.vacationBadge}>
            <Plane size={12} color={theme.colors.primary} />
        </View>
    ) : undefined;

    return (
        <DetailSheet
            visible={visible}
            onClose={onClose}
            title={formattedDate}
            subtitle={subtitle}
            renderHeaderRight={renderHeaderRight}
            renderSummary={renderSummary}
            renderContent={renderContent}
            height="tall"
        />
    );
};

const styles = StyleSheet.create({
    summaryCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    summaryContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: '700',
    },
    summaryStats: {
        alignItems: 'flex-end',
    },
    statText: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
    },
    habitsList: {
        gap: 12,
    },
    habitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    habitInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    habitEmoji: {
        fontSize: 24,
    },
    habitName: {
        fontSize: 16,
        fontWeight: '600',
    },
    habitTarget: {
        fontSize: 12,
    },
    statusBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vacationBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 16,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});

export default DayDetailSheet;
