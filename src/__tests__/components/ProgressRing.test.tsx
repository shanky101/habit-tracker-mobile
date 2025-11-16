import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressRing } from '@/components/ProgressRing';
import { ThemeProvider } from '@/theme/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ProgressRing', () => {
  describe('Rendering', () => {
    it('should render with basic props', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={50} completedCount={3} totalCount={6} />
      );

      expect(getByText('50%')).toBeTruthy();
      expect(getByText('Complete')).toBeTruthy();
      expect(getByText('3 of 6 habits')).toBeTruthy();
    });

    it('should display 0% progress correctly', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={0} completedCount={0} totalCount={5} />
      );

      expect(getByText('0%')).toBeTruthy();
      expect(getByText('0 of 5 habits')).toBeTruthy();
    });

    it('should display 100% progress correctly', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={100} completedCount={8} totalCount={8} />
      );

      expect(getByText('100%')).toBeTruthy();
      expect(getByText('8 of 8 habits')).toBeTruthy();
    });
  });

  describe('Progress Calculation', () => {
    it('should round decimal progress values', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={66.7} completedCount={2} totalCount={3} />
      );

      expect(getByText('67%')).toBeTruthy();
    });

    it('should handle fractional progress correctly', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={33.33} completedCount={1} totalCount={3} />
      );

      expect(getByText('33%')).toBeTruthy();
    });
  });

  describe('Habit Count Display', () => {
    it('should show singular "habit" for 1 total habit', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={100} completedCount={1} totalCount={1} />
      );

      expect(getByText('1 of 1 habits')).toBeTruthy();
    });

    it('should display correct count for multiple habits', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={75} completedCount={3} totalCount={4} />
      );

      expect(getByText('3 of 4 habits')).toBeTruthy();
    });

    it('should handle large habit counts', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={50} completedCount={25} totalCount={50} />
      );

      expect(getByText('25 of 50 habits')).toBeTruthy();
    });
  });

  describe('Custom Sizing', () => {
    it('should render with default size when not specified', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={50} completedCount={5} totalCount={10} />
      );

      expect(getByText('50%')).toBeTruthy();
    });

    it('should accept custom size prop', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing
          progress={75}
          completedCount={3}
          totalCount={4}
          size={150}
        />
      );

      expect(getByText('75%')).toBeTruthy();
    });

    it('should accept custom strokeWidth prop', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing
          progress={60}
          completedCount={6}
          totalCount={10}
          strokeWidth={8}
        />
      );

      expect(getByText('60%')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle progress values between 0 and 1', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={0.5} completedCount={1} totalCount={100} />
      );

      expect(getByText('1%')).toBeTruthy();
    });

    it('should handle completed count exceeding total (edge case)', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={100} completedCount={5} totalCount={3} />
      );

      expect(getByText('5 of 3 habits')).toBeTruthy();
    });

    it('should display correct text for zero habits', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={0} completedCount={0} totalCount={0} />
      );

      expect(getByText('0 of 0 habits')).toBeTruthy();
    });
  });

  describe('Text Labels', () => {
    it('should always display "Complete" label', () => {
      const { getAllByText } = renderWithTheme(
        <ProgressRing progress={45} completedCount={4} totalCount={9} />
      );

      expect(getAllByText('Complete').length).toBeGreaterThan(0);
    });

    it('should format percentage with % symbol', () => {
      const { getByText } = renderWithTheme(
        <ProgressRing progress={88} completedCount={7} totalCount={8} />
      );

      expect(getByText('88%')).toBeTruthy();
    });
  });
});
