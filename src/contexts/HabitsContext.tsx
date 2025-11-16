import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  completed: boolean;
  streak: number;
  category: string;
  color: string;
  frequency: 'daily' | 'weekly';
  selectedDays: number[];
  reminderEnabled: boolean;
  reminderTime: string | null;
  notes?: string; // Optional notes/description for the habit
  isDefault?: boolean; // Track if this is a default habit
  archived?: boolean; // Track if this habit is archived
}

interface HabitsContextType {
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

const DEFAULT_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Morning Meditation',
    emoji: '🧘',
    completed: true,
    streak: 7,
    category: 'mindfulness',
    color: 'purple',
    frequency: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: true,
    reminderTime: '07:00',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Read 30 minutes',
    emoji: '📚',
    completed: false,
    streak: 12,
    category: 'learning',
    color: 'blue',
    frequency: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: false,
    reminderTime: null,
    isDefault: true,
  },
  {
    id: '3',
    name: 'Drink 8 glasses of water',
    emoji: '💧',
    completed: true,
    streak: 5,
    category: 'health',
    color: 'teal',
    frequency: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: true,
    reminderTime: '09:00',
    isDefault: true,
  },
  {
    id: '4',
    name: 'Exercise',
    emoji: '🏃',
    completed: false,
    streak: 3,
    category: 'fitness',
    color: 'green',
    frequency: 'weekly',
    selectedDays: [1, 3, 5],
    reminderEnabled: true,
    reminderTime: '18:00',
    isDefault: true,
  },
];

export const HabitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);

  const addHabit = (habit: Habit) => {
    setHabits((prevHabits) => [habit, ...prevHabits]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      )
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id));
  };

  const archiveHabit = (id: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id ? { ...habit, archived: true } : habit
      )
    );
  };

  const toggleHabit = (id: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        archiveHabit,
        toggleHabit,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
};
