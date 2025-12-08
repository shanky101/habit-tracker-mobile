import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Habit } from '@/hooks/useHabits';
import PremiumHabitCard from './PremiumHabitCard';
import { useTheme } from '@/theme';

interface DraggableHabitListProps {
  habits: Habit[];
  selectedDate: string;
  onToggle: (id: string) => void;
  onPress: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export const DraggableHabitList: React.FC<DraggableHabitListProps> = ({
  habits,
  selectedDate,
  onToggle,
  onPress,
  onEdit,
  onArchive,
  onDelete,
  onReorder,
}) => {
  const { theme } = useTheme();

  const renderItem = ({ item }: { item: Habit }) => {
    return (
      <View style={styles.itemContainer}>
        <PremiumHabitCard
          habit={item}
          selectedDate={selectedDate}
          onToggle={onToggle}
          onPress={onPress}
          onEdit={onEdit}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, overflow: 'visible' }}>
      <View style={{ paddingBottom: 20, overflow: 'visible' }}>
        {habits.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <PremiumHabitCard
              habit={item}
              selectedDate={selectedDate}
              onToggle={onToggle}
              onPress={onPress}
              onEdit={onEdit}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 4,
  },
});

export default DraggableHabitList;
