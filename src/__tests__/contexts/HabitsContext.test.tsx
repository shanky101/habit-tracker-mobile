import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { HabitsProvider, useHabits, Habit } from '@/contexts/HabitsContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HabitsProvider>{children}</HabitsProvider>
);

describe('HabitsContext', () => {
  describe('Initial State', () => {
    it('should initialize with default habits', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      expect(result.current.habits).toHaveLength(4);
      expect(result.current.habits[0]).toMatchObject({
        id: '1',
        name: 'Morning Meditation',
        emoji: '🧘',
        category: 'mindfulness',
        isDefault: true,
      });
    });

    it('should have all required functions', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      expect(typeof result.current.addHabit).toBe('function');
      expect(typeof result.current.updateHabit).toBe('function');
      expect(typeof result.current.deleteHabit).toBe('function');
      expect(typeof result.current.archiveHabit).toBe('function');
      expect(typeof result.current.toggleHabit).toBe('function');
    });
  });

  describe('addHabit', () => {
    it('should add a new habit to the beginning of the list', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const newHabit: Habit = {
        id: '5',
        name: 'Learn Spanish',
        emoji: '🇪🇸',
        completed: false,
        streak: 0,
        category: 'learning',
        color: 'orange',
        frequency: 'daily',
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: false,
        reminderTime: null,
      };

      act(() => {
        result.current.addHabit(newHabit);
      });

      expect(result.current.habits).toHaveLength(5);
      expect(result.current.habits[0]).toEqual(newHabit);
    });

    it('should maintain existing habits when adding a new one', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const initialCount = result.current.habits.length;

      const newHabit: Habit = {
        id: '6',
        name: 'Practice Guitar',
        emoji: '🎸',
        completed: false,
        streak: 0,
        category: 'hobby',
        color: 'red',
        frequency: 'weekly',
        selectedDays: [1, 3, 5],
        reminderEnabled: true,
        reminderTime: '19:00',
      };

      act(() => {
        result.current.addHabit(newHabit);
      });

      expect(result.current.habits).toHaveLength(initialCount + 1);
      expect(result.current.habits.slice(1)).toHaveLength(initialCount);
    });
  });

  describe('updateHabit', () => {
    it('should update habit properties by id', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      act(() => {
        result.current.updateHabit('1', {
          name: 'Evening Meditation',
          emoji: '🧘‍♀️',
        });
      });

      const updatedHabit = result.current.habits.find((h) => h.id === '1');
      expect(updatedHabit?.name).toBe('Evening Meditation');
      expect(updatedHabit?.emoji).toBe('🧘‍♀️');
    });

    it('should only update specified properties', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const originalHabit = result.current.habits.find((h) => h.id === '2');

      act(() => {
        result.current.updateHabit('2', { streak: 20 });
      });

      const updatedHabit = result.current.habits.find((h) => h.id === '2');
      expect(updatedHabit?.streak).toBe(20);
      expect(updatedHabit?.name).toBe(originalHabit?.name);
      expect(updatedHabit?.emoji).toBe(originalHabit?.emoji);
      expect(updatedHabit?.category).toBe(originalHabit?.category);
    });

    it('should not affect other habits when updating one', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const otherHabits = result.current.habits.filter((h) => h.id !== '3');

      act(() => {
        result.current.updateHabit('3', { color: 'blue' });
      });

      const unchangedHabits = result.current.habits.filter((h) => h.id !== '3');
      expect(unchangedHabits).toEqual(otherHabits);
    });

    it('should handle non-existent habit id gracefully', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const habitsBefore = [...result.current.habits];

      act(() => {
        result.current.updateHabit('non-existent-id', { name: 'Test' });
      });

      expect(result.current.habits).toEqual(habitsBefore);
    });

    it('should update habit notes', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const testNotes = 'Remember to meditate for at least 10 minutes';

      act(() => {
        result.current.updateHabit('1', { notes: testNotes });
      });

      const updatedHabit = result.current.habits.find((h) => h.id === '1');
      expect(updatedHabit?.notes).toBe(testNotes);
    });

    it('should add notes to habit without notes', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const newHabit: Habit = {
        id: '100',
        name: 'Test Habit',
        emoji: '🎯',
        completed: false,
        streak: 0,
        category: 'test',
        color: 'blue',
        frequency: 'daily',
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: false,
        reminderTime: null,
      };

      act(() => {
        result.current.addHabit(newHabit);
      });

      const addedHabit = result.current.habits.find((h) => h.id === '100');
      expect(addedHabit?.notes).toBeUndefined();

      act(() => {
        result.current.updateHabit('100', { notes: 'New notes added' });
      });

      const updatedHabit = result.current.habits.find((h) => h.id === '100');
      expect(updatedHabit?.notes).toBe('New notes added');
    });
  });

  describe('deleteHabit', () => {
    it('should remove habit by id', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const initialCount = result.current.habits.length;

      act(() => {
        result.current.deleteHabit('1');
      });

      expect(result.current.habits).toHaveLength(initialCount - 1);
      expect(result.current.habits.find((h) => h.id === '1')).toBeUndefined();
    });

    it('should not affect other habits when deleting one', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const habitToKeep = result.current.habits.find((h) => h.id === '2');

      act(() => {
        result.current.deleteHabit('1');
      });

      const keptHabit = result.current.habits.find((h) => h.id === '2');
      expect(keptHabit).toEqual(habitToKeep);
    });

    it('should handle deleting non-existent habit gracefully', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const habitsBefore = [...result.current.habits];

      act(() => {
        result.current.deleteHabit('non-existent-id');
      });

      expect(result.current.habits).toEqual(habitsBefore);
    });
  });

  describe('archiveHabit', () => {
    it('should mark habit as archived', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      act(() => {
        result.current.archiveHabit('1');
      });

      const archivedHabit = result.current.habits.find((h) => h.id === '1');
      expect(archivedHabit?.archived).toBe(true);
    });

    it('should keep habit in the list when archived', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const initialCount = result.current.habits.length;

      act(() => {
        result.current.archiveHabit('2');
      });

      expect(result.current.habits).toHaveLength(initialCount);
      expect(result.current.habits.find((h) => h.id === '2')).toBeDefined();
    });

    it('should not affect other properties when archiving', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const originalHabit = result.current.habits.find((h) => h.id === '3');

      act(() => {
        result.current.archiveHabit('3');
      });

      const archivedHabit = result.current.habits.find((h) => h.id === '3');
      expect(archivedHabit?.name).toBe(originalHabit?.name);
      expect(archivedHabit?.streak).toBe(originalHabit?.streak);
      expect(archivedHabit?.completed).toBe(originalHabit?.completed);
    });

    it('should handle archiving non-existent habit gracefully', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const habitsBefore = [...result.current.habits];

      act(() => {
        result.current.archiveHabit('non-existent-id');
      });

      expect(result.current.habits).toEqual(habitsBefore);
    });
  });

  describe('toggleHabit', () => {
    it('should toggle completed status from false to true', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const habitBefore = result.current.habits.find((h) => h.id === '2');
      expect(habitBefore?.completed).toBe(false);

      act(() => {
        result.current.toggleHabit('2');
      });

      const habitAfter = result.current.habits.find((h) => h.id === '2');
      expect(habitAfter?.completed).toBe(true);
    });

    it('should toggle completed status from true to false', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const habitBefore = result.current.habits.find((h) => h.id === '1');
      expect(habitBefore?.completed).toBe(true);

      act(() => {
        result.current.toggleHabit('1');
      });

      const habitAfter = result.current.habits.find((h) => h.id === '1');
      expect(habitAfter?.completed).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const initialStatus = result.current.habits.find((h) => h.id === '4')?.completed;

      act(() => {
        result.current.toggleHabit('4');
        result.current.toggleHabit('4');
        result.current.toggleHabit('4');
      });

      const finalStatus = result.current.habits.find((h) => h.id === '4')?.completed;
      expect(finalStatus).toBe(!initialStatus);
    });

    it('should not affect other properties when toggling', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const habitBefore = result.current.habits.find((h) => h.id === '1');

      act(() => {
        result.current.toggleHabit('1');
      });

      const habitAfter = result.current.habits.find((h) => h.id === '1');
      expect(habitAfter?.name).toBe(habitBefore?.name);
      expect(habitAfter?.streak).toBe(habitBefore?.streak);
      expect(habitAfter?.emoji).toBe(habitBefore?.emoji);
    });

    it('should handle toggling non-existent habit gracefully', () => {
      const { result } = renderHook(() => useHabits(), { wrapper });

      const habitsBefore = [...result.current.habits];

      act(() => {
        result.current.toggleHabit('non-existent-id');
      });

      expect(result.current.habits).toEqual(habitsBefore);
    });
  });

  describe('useHabits hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useHabits());
      }).toThrow('useHabits must be used within a HabitsProvider');

      consoleSpy.mockRestore();
    });
  });
});
