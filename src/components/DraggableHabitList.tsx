import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Habit } from '@/contexts/HabitsContext';
import SwipeableHabitCard from './SwipeableHabitCard';

interface DraggableHabitListProps {
  habits: Habit[];
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  onToggle: (id: string) => void;
  onPress: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const DraggableHabitList: React.FC<DraggableHabitListProps> = ({
  habits,
  selectedDate,
  onToggle,
  onPress,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const { theme } = useTheme();

  if (habits.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No habits yet. Add your first habit!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {habits.map((habit) => (
        <SwipeableHabitCard
          key={habit.id}
          habit={habit}
          selectedDate={selectedDate}
          onToggle={onToggle}
          onPress={onPress}
          onEdit={onEdit}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default DraggableHabitList;
