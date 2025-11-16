import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StreakBrokenModal from '@/components/StreakBrokenModal';
import { ThemeProvider } from '@/theme/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('StreakBrokenModal', () => {
  const mockOnDismiss = jest.fn();
  const mockOnCheckInNow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Morning Meditation"
          brokenStreak={7}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText("Don't worry, it happens!")).toBeTruthy();
      expect(getByText('You missed your "Morning Meditation" habit')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { queryByText } = renderWithTheme(
        <StreakBrokenModal
          visible={false}
          habitName="Reading"
          brokenStreak={5}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(queryByText("Don't worry, it happens!")).toBeFalsy();
    });
  });

  describe('Habit Information', () => {
    it('should display the correct habit name', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Exercise"
          brokenStreak={10}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText('You missed your "Exercise" habit')).toBeTruthy();
    });

    it('should display the broken streak count', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Reading"
          brokenStreak={15}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText('15-day streak')).toBeTruthy();
    });

    it('should handle single day streak', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Meditation"
          brokenStreak={1}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText('1-day streak')).toBeTruthy();
    });

    it('should handle large streak numbers', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Daily Writing"
          brokenStreak={100}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText('100-day streak')).toBeTruthy();
    });
  });

  describe('Motivational Content', () => {
    it('should display encouragement emoji', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Test Habit"
          brokenStreak={5}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText('😔')).toBeTruthy();
      expect(getByText('💔')).toBeTruthy();
    });

    it('should display motivational message', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Test Habit"
          brokenStreak={7}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText('Start again today! 💪')).toBeTruthy();
      expect(
        getByText(
          "Building habits is a journey, not a destination. Missing one day doesn't erase your progress. What matters is getting back on track."
        )
      ).toBeTruthy();
    });
  });

  describe('Recovery Tips', () => {
    it('should display recovery tips section', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Test Habit"
          brokenStreak={3}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText('Quick Recovery Tips:')).toBeTruthy();
    });

    it('should display all recovery tips', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Test Habit"
          brokenStreak={5}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText('Check in right now to start fresh')).toBeTruthy();
      expect(getByText('Set a reminder to avoid missing again')).toBeTruthy();
      expect(getByText('Focus on consistency, not perfection')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onCheckInNow when Check In Now button is pressed', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Test Habit"
          brokenStreak={5}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      const checkInButton = getByText('Check In Now');
      fireEvent.press(checkInButton);

      expect(mockOnCheckInNow).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when Dismiss button is pressed', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Test Habit"
          brokenStreak={5}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      const dismissButton = getByText('Dismiss');
      fireEvent.press(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not trigger callbacks when buttons not pressed', () => {
      renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Test Habit"
          brokenStreak={5}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(mockOnDismiss).not.toHaveBeenCalled();
      expect(mockOnCheckInNow).not.toHaveBeenCalled();
    });
  });

  describe('Button Layout', () => {
    it('should display both action buttons', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="Test Habit"
          brokenStreak={5}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText('Check In Now')).toBeTruthy();
      expect(getByText('Dismiss')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero streak gracefully', () => {
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName="New Habit"
          brokenStreak={0}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText('0-day streak')).toBeTruthy();
    });

    it('should handle very long habit names', () => {
      const longHabitName = 'This is a very long habit name that should still render correctly';
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName={longHabitName}
          brokenStreak={7}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText(`You missed your "${longHabitName}" habit`)).toBeTruthy();
    });

    it('should handle habit names with special characters', () => {
      const specialHabitName = "Morning Coffee & Reading 📚";
      const { getByText } = renderWithTheme(
        <StreakBrokenModal
          visible={true}
          habitName={specialHabitName}
          brokenStreak={5}
          onDismiss={mockOnDismiss}
          onCheckInNow={mockOnCheckInNow}
        />
      );

      expect(getByText(`You missed your "${specialHabitName}" habit`)).toBeTruthy();
    });
  });
});
