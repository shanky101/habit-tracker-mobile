import React from 'react';
import { SuccessModal, SuccessAction, SuccessStat } from '@app-core/ui';

export type CelebrationType = 'firstCheckin' | 'allComplete' | 'streak';

export interface CelebrationModalProps {
  visible: boolean;
  type: CelebrationType;
  habitName?: string;
  streakDays?: number;
  completedCount?: number;
  totalCount?: number;
  activeStreaks?: number;
  onDismiss: () => void;
  onShare?: () => void;
}

/**
 * CelebrationModal - Wrapper around SuccessModal
 * 
 * Maps habit celebration data to the generic SuccessModal component.
 * Handles milestone messages, motivational quotes, and celebration types.
 */
const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  type,
  habitName,
  streakDays = 0,
  completedCount = 0,
  totalCount = 0,
  activeStreaks = 0,
  onDismiss,
  onShare,
}) => {
  const getMotivationalQuote = () => {
    const quotes = [
      "Success is the sum of small efforts repeated day in and day out.",
      "The secret of getting ahead is getting started.",
      "You don't have to be great to start, but you have to start to be great.",
      "Small daily improvements are the key to staggering long-term results.",
      "The only way to do great work is to love what you do.",
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return quotes[dayOfYear % quotes.length];
  };

  const getMessage = () => {
    switch (type) {
      case 'allComplete':
        return {
          emoji: '🎉',
          title: 'All Habits Complete!',
          subtitle: `${completedCount}/${totalCount} habits • ${activeStreaks} active streaks`,
          quote: getMotivationalQuote(),
          showConfetti: true,
          stats: undefined,
        };
      case 'streak':
        if (streakDays === 3) {
          return {
            emoji: '🔥',
            title: 'Great Start!',
            subtitle: `${streakDays} day streak on ${habitName || 'your habit'}`,
            quote: undefined,
            showConfetti: false,
            stats: [{ label: 'Day Streak', value: streakDays }],
          };
        } else if (streakDays === 7) {
          return {
            emoji: '🎉',
            title: 'One Week!',
            subtitle: `${streakDays} day streak! You're building momentum`,
            quote: undefined,
            showConfetti: true,
            stats: [{ label: 'Day Streak', value: streakDays }],
          };
        } else if (streakDays === 30) {
          return {
            emoji: '🏆',
            title: 'One Month!',
            subtitle: 'Incredible! 30 days of consistency',
            quote: undefined,
            showConfetti: true,
            stats: [{ label: 'Day Streak', value: streakDays }],
          };
        } else if (streakDays === 100) {
          return {
            emoji: '💯',
            title: 'Century!',
            subtitle: "You're unstoppable! 100 days!",
            quote: undefined,
            showConfetti: true,
            stats: [{ label: 'Day Streak', value: streakDays }],
          };
        } else if (streakDays === 365) {
          return {
            emoji: '👑',
            title: 'One Year!',
            subtitle: 'Legend status! 365 days!',
            quote: undefined,
            showConfetti: true,
            stats: [{ label: 'Day Streak', value: streakDays }],
          };
        }
        return {
          emoji: '🔥',
          title: `${streakDays} Day Streak!`,
          subtitle: "Keep the momentum going!",
          quote: undefined,
          showConfetti: false,
          stats: [{ label: 'Day Streak', value: streakDays }],
        };
      case 'firstCheckin':
      default:
        return {
          emoji: '✓',
          title: 'Nice!',
          subtitle: 'Habit checked in',
          quote: undefined,
          showConfetti: false,
          stats: undefined,
        };
    }
  };

  const message = getMessage();
  const showShareButton = type === 'streak' && streakDays >= 7;

  // Build actions
  const primaryAction: SuccessAction = {
    label: 'Continue',
    onPress: onDismiss,
  };

  const secondaryAction: SuccessAction | undefined = showShareButton && onShare
    ? {
      label: 'Share Achievement',
      onPress: onShare,
    }
    : undefined;

  return (
    <SuccessModal
      visible={visible}
      onDismiss={onDismiss}
      emoji={message.emoji}
      title={message.title}
      subtitle={message.subtitle}
      quote={message.quote}
      stats={message.stats}
      showConfetti={message.showConfetti}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
    />
  );
};

export default CelebrationModal;
