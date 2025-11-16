import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CelebrationModal, { CelebrationType } from '@/components/CelebrationModal';
import { ThemeProvider } from '@/theme/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('CelebrationModal', () => {
  const mockOnDismiss = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="firstCheckin"
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('Nice!')).toBeTruthy();
      expect(getByText('Habit checked in')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { queryByText } = renderWithTheme(
        <CelebrationModal
          visible={false}
          type="firstCheckin"
          onDismiss={mockOnDismiss}
        />
      );

      expect(queryByText('Nice!')).toBeFalsy();
    });
  });

  describe('firstCheckin Type', () => {
    it('should display correct message for firstCheckin', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="firstCheckin"
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('✓')).toBeTruthy();
      expect(getByText('Nice!')).toBeTruthy();
      expect(getByText('Habit checked in')).toBeTruthy();
    });

    it('should not show confetti for firstCheckin', () => {
      const { queryByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="firstCheckin"
          onDismiss={mockOnDismiss}
        />
      );

      // Confetti emojis should not be present
      const confettiElements = [
        queryByText('🎊'),
        queryByText('✨'),
        queryByText('🌟'),
        queryByText('🎉'),
      ].filter((el) => el !== null);

      expect(confettiElements.length).toBe(0);
    });

    it('should not show share button for firstCheckin', () => {
      const { queryByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="firstCheckin"
          onDismiss={mockOnDismiss}
          onShare={mockOnShare}
        />
      );

      expect(queryByText('Share Achievement')).toBeFalsy();
    });
  });

  describe('allComplete Type', () => {
    it('should display correct message for allComplete', () => {
      const { getByText, getAllByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="allComplete"
          onDismiss={mockOnDismiss}
        />
      );

      expect(getAllByText('🎉').length).toBeGreaterThan(0);
      expect(getByText('All Done!')).toBeTruthy();
      expect(getByText('Amazing! You completed all habits today')).toBeTruthy();
    });

    it('should show confetti for allComplete', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="allComplete"
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('🎊')).toBeTruthy();
      expect(getByText('✨')).toBeTruthy();
      expect(getByText('🌟')).toBeTruthy();
    });
  });

  describe('streak Type', () => {
    it('should display 3-day streak message', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          habitName="Morning Run"
          streakDays={3}
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('🔥')).toBeTruthy();
      expect(getByText('Great Start!')).toBeTruthy();
      expect(getByText('3 day streak on Morning Run')).toBeTruthy();
    });

    it('should display 7-day streak message', () => {
      const { getByText, getAllByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={7}
          onDismiss={mockOnDismiss}
        />
      );

      expect(getAllByText('🎉').length).toBeGreaterThan(0);
      expect(getByText('One Week!')).toBeTruthy();
      expect(getByText("7 day streak! You're building momentum")).toBeTruthy();
    });

    it('should display 30-day streak message', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={30}
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('🏆')).toBeTruthy();
      expect(getByText('One Month!')).toBeTruthy();
      expect(getByText('Incredible! 30 days of consistency')).toBeTruthy();
    });

    it('should display 100-day streak message', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={100}
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('💯')).toBeTruthy();
      expect(getByText('Century!')).toBeTruthy();
      expect(getByText("You're unstoppable! 100 days!")).toBeTruthy();
    });

    it('should display 365-day streak message', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={365}
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('👑')).toBeTruthy();
      expect(getByText('One Year!')).toBeTruthy();
      expect(getByText('Legend status! 365 days!')).toBeTruthy();
    });

    it('should display generic streak message for other days', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={15}
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('🔥')).toBeTruthy();
      expect(getByText('15 Day Streak!')).toBeTruthy();
      expect(getByText('Keep the momentum going!')).toBeTruthy();
    });

    it('should show streak stats container', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={10}
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('10')).toBeTruthy();
      expect(getByText('Day Streak')).toBeTruthy();
    });

    it('should show confetti for 7-day streak or more', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={7}
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('🎊')).toBeTruthy();
      expect(getByText('✨')).toBeTruthy();
    });

    it('should not show confetti for streaks less than 7 days', () => {
      const { queryByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={3}
          onDismiss={mockOnDismiss}
        />
      );

      const confettiElements = [
        queryByText('🎊'),
        queryByText('✨'),
        queryByText('🌟'),
      ].filter((el) => el !== null);

      expect(confettiElements.length).toBe(0);
    });

    it('should use default habit name when not provided', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={3}
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('3 day streak on your habit')).toBeTruthy();
    });
  });

  describe('Share Button', () => {
    it('should show share button for 7-day streak when onShare is provided', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={7}
          onDismiss={mockOnDismiss}
          onShare={mockOnShare}
        />
      );

      expect(getByText('Share Achievement')).toBeTruthy();
    });

    it('should not show share button for streaks less than 7 days', () => {
      const { queryByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={5}
          onDismiss={mockOnDismiss}
          onShare={mockOnShare}
        />
      );

      expect(queryByText('Share Achievement')).toBeFalsy();
    });

    it('should not show share button when onShare is not provided', () => {
      const { queryByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={10}
          onDismiss={mockOnDismiss}
        />
      );

      expect(queryByText('Share Achievement')).toBeFalsy();
    });

    it('should call onShare when share button is pressed', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          streakDays={7}
          onDismiss={mockOnDismiss}
          onShare={mockOnShare}
        />
      );

      const shareButton = getByText('Share Achievement');
      fireEvent.press(shareButton);

      expect(mockOnShare).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Interactions', () => {
    it('should call onDismiss when continue button is pressed', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="firstCheckin"
          onDismiss={mockOnDismiss}
        />
      );

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when backdrop is pressed', () => {
      const { getByTestId, getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="firstCheckin"
          onDismiss={mockOnDismiss}
        />
      );

      // Get the modal content's parent (backdrop)
      const continueButton = getByText('Continue');
      const backdrop = continueButton.parent?.parent?.parent;

      if (backdrop) {
        fireEvent.press(backdrop);
        expect(mockOnDismiss).toHaveBeenCalled();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle streakDays default value of 0', () => {
      const { getByText } = renderWithTheme(
        <CelebrationModal
          visible={true}
          type="streak"
          onDismiss={mockOnDismiss}
        />
      );

      expect(getByText('0 Day Streak!')).toBeTruthy();
      expect(getByText('0')).toBeTruthy();
    });

    it('should render all celebration types without crashing', () => {
      const types: CelebrationType[] = ['firstCheckin', 'allComplete', 'streak'];

      types.forEach((type) => {
        const { getByText } = renderWithTheme(
          <CelebrationModal
            visible={true}
            type={type}
            streakDays={10}
            habitName="Test Habit"
            onDismiss={mockOnDismiss}
          />
        );

        expect(getByText('Continue')).toBeTruthy();
      });
    });
  });
});
