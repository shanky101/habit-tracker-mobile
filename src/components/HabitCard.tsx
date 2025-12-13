import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SwipeableEntityCard, EntityAction, DisplayConfig, CompletionState } from '@app-core/ui';
import { useTheme } from '@app-core/theme';
import { Habit, useHabits } from '@/hooks/useHabits';

interface HabitCardProps {
    habit: Habit;
    selectedDate: string;
    onToggle: (id: string) => void;
    onPress: (habit: Habit) => void;
    onEdit: (habit: Habit) => void;
    onArchive: (habit: Habit) => void;
    onDelete: (habit: Habit) => void;
}

/**
 * HabitCard - Wrapper around SwipeableEntityCard
 * 
 * This component maps habit-specific data and logic to the generic SwipeableEntityCard.
 * It handles:
 * - Habit completion tracking
 * - Multi-completion progress bars
 * - Negative habit limits
 * - Habit-specific actions
 */
export const HabitCard: React.FC<HabitCardProps> = ({
    habit,
    selectedDate,
    onToggle,
    onPress,
    onEdit,
    onArchive,
    onDelete,
}) => {
    const { theme } = useTheme();
    const { getCompletionProgress, isHabitCompletedForDate } = useHabits();

    // Get completion data
    const progress = getCompletionProgress(habit.id, selectedDate);
    const isCompleted = isHabitCompletedForDate(habit.id, selectedDate);
    const isMultiCompletion = habit.targetCompletionsPerDay > 1;

    // Negative habit logic
    const isNegative = habit.type === 'negative';
    const isLimitReached = isNegative && progress.current >= progress.target;

    // Map to display config
    const displayConfig: DisplayConfig = {
        icon: habit.emoji || (isNegative ? '🚫' : '🏃'),
        title: habit.name,
        subtitle: isNegative
            ? (isLimitReached ? 'Limit reached' : `${progress.current}/${progress.target} used`)
            : `${progress.current} / ${progress.target} ${progress.target === 1 ? 'time' : 'times'}`,
        tintColor: habit.color,
    };

    // Map to completion state
    const completionState: CompletionState = {
        isCompleted: isNegative ? isLimitReached : isCompleted,
        type: isMultiCompletion ? 'button' : 'checkbox',
        checkboxColor: isNegative
            ? (isLimitReached ? theme.colors.error : progress.current > 0 ? theme.colors.warning : 'transparent')
            : (isCompleted ? theme.colors.primary : 'transparent'),
        checkboxBorderColor: isNegative
            ? (isLimitReached ? theme.colors.error : theme.colors.border)
            : (isCompleted ? theme.colors.primary : theme.colors.border),
        checkIcon: isNegative && progress.current > 0
            ? progress.current.toString()
            : (isCompleted && !isNegative ? '✓' : isMultiCompletion ? '+' : undefined),
    };

    // Map to actions
    const actions: EntityAction[] = [
        {
            id: 'note',
            label: 'Add Note',
            icon: '📝',
            color: '#4A5568',
            onPress: () => onEdit(habit),
        },
        {
            id: 'edit',
            label: 'Edit',
            icon: '✏️',
            color: '#4A5568',
            onPress: () => onEdit(habit),
        },
        {
            id: 'delete',
            label: 'Delete',
            icon: '🗑️',
            color: '#EF4444',
            onPress: () => onDelete(habit),
        },
    ];

    // Custom progress renderer for multi-completion habits
    const renderProgress = isMultiCompletion ? () => (
        <View style={styles.progressBarsContainer}>
            {Array.from({ length: habit.targetCompletionsPerDay }).map((_, index) => {
                const isFilled = index < progress.current;
                return (
                    <View
                        key={index}
                        style={[
                            styles.progressBar,
                            {
                                backgroundColor: isFilled
                                    ? (isNegative ? theme.colors.error : theme.colors.success)
                                    : theme.colors.border,
                                opacity: isFilled ? 1 : 0.5,
                                shadowColor: isFilled ? (isNegative ? theme.colors.error : theme.colors.success) : 'transparent',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: isFilled ? 0.3 : 0,
                                shadowRadius: 2,
                                elevation: isFilled ? 2 : 0,
                            },
                        ]}
                    />
                );
            })}
        </View>
    ) : undefined;

    // Custom progress renderer for negative single habits (limit bar)
    const renderNegativeLimitBar = isNegative && habit.targetCompletionsPerDay === 1 ? () => (
        <View style={styles.limitBarContainer}>
            <View style={[styles.limitBarTrack, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <View
                    style={[
                        styles.limitBarFill,
                        {
                            width: `${Math.min(100, (progress.current / progress.target) * 100)}%`,
                            backgroundColor: isLimitReached ? theme.colors.error : theme.colors.warning,
                        },
                    ]}
                />
            </View>
            <Text style={[styles.limitText, { color: theme.colors.error }]}>
                Limit: {progress.target}
            </Text>
        </View>
    ) : undefined;

    // Determine card height
    // Increased from 96 to 112 to give more breathing room for multi-completion habits
    const height = isMultiCompletion ? 112 : 72;

    // Determine background color
    const backgroundColor = isNegative ? '#FFF5F5' : theme.colors.surface;

    return (
        <SwipeableEntityCard
            entity={habit}
            displayConfig={displayConfig}
            completionState={completionState}
            onPrimaryAction={() => onToggle(habit.id)}
            onPress={() => onPress(habit)}
            actions={actions}
            height={height}
            backgroundColor={backgroundColor}
            gradientOverlay={isCompleted || isLimitReached}
            gradientColor={isNegative ? theme.colors.error : theme.colors.primary}
            renderProgress={renderProgress || renderNegativeLimitBar}
        />
    );
};

const styles = StyleSheet.create({
    progressBarsContainer: {
        flexDirection: 'row',
        gap: 4,
        // Increased spacing for better touch targets and visual separation
        marginTop: 10,
        marginBottom: 8,
        alignItems: 'center',
    },
    progressBar: {
        width: 4,
        height: 18,
        borderRadius: 2,
    },
    limitBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 2,
        gap: 8,
    },
    limitBarTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        maxWidth: 100,
    },
    limitBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    limitText: {
        fontSize: 10,
        fontWeight: '600',
    },
});
