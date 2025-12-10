import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useTheme } from '@app-core/theme';
import { useHabits } from '@/hooks/useHabits';
import { useUserStore } from '@/store/userStore';
import { X, CheckCircle2, Circle, Plane, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DayDetailSheetProps {
    visible: boolean;
    onClose: () => void;
    date: string; // YYYY-MM-DD
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    }, [date, vacationHistory, isVacationMode]);

    // Filter habits active on this date
    const dayHabits = useMemo(() => {
        return habits.filter(habit => {
            // Check creation date
            if (habit.createdAt && new Date(habit.createdAt) > new Date(date)) return false;

            // Check if archived BEFORE this date (if we tracked archive date, but we don't fully yet. 
            // For now, show all non-archived, or archived ones if they were active then? 
            // Simpler: Show all habits that existed then.

            // Check scheduled days
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

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.dateText, { color: theme.colors.text }]}>
                                {formattedDate}
                            </Text>
                            {isVacation && (
                                <View style={styles.vacationBadge}>
                                    <Plane size={12} color={theme.colors.primary} />
                                    <Text style={[styles.vacationText, { color: theme.colors.primary }]}>
                                        Vacation Mode Active
                                    </Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Summary Card */}
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
                                        backgroundColor: isVacation ? theme.colors.primary : (completionRate === 100 ? '#F59E0B' : theme.colors.primary)
                                    }
                                ]}
                            />
                        </View>
                    </LinearGradient>

                    {/* Habits List */}
                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                        HABITS
                    </Text>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {habitStatuses.length > 0 ? (
                            habitStatuses.map(habit => (
                                <View
                                    key={habit.id}
                                    style={[
                                        styles.habitRow,
                                        {
                                            backgroundColor: theme.colors.background,
                                            borderColor: habit.isCompleted ? theme.colors.success + '30' : theme.colors.border
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
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Calendar size={48} color={theme.colors.textTertiary} />
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    No habits scheduled for this day
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
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
        height: SCREEN_HEIGHT * 0.7,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    dateText: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    vacationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    vacationText: {
        fontSize: 12,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    summaryCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        gap: 12,
        paddingBottom: 20,
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
