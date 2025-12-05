/**
 * Badge Progress Ring Component
 *
 * Circular progress indicator for badge milestones
 * Shows progress towards next badge
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme';
import { NextMilestoneInfo } from '@/services/streaks/types';

interface BadgeProgressRingProps {
  nextMilestone: NextMilestoneInfo;
  currentStreak: number;
  size?: number;
  strokeWidth?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const BadgeProgressRing: React.FC<BadgeProgressRingProps> = ({
  nextMilestone,
  currentStreak,
  size = 140,
  strokeWidth = 14,
}) => {
  const { theme } = useTheme();
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: nextMilestone.progress,
      friction: 7,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [nextMilestone.progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.ring}>
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.borderLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>

        {/* Center Content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.streakCount,
              {
                color: theme.colors.primary,
                fontFamily: theme.typography.fontFamilyDisplay,
                fontSize: theme.typography.fontSize3XL,
                fontWeight: theme.typography.fontWeightBold,
              },
            ]}
          >
            {currentStreak}
          </Text>
          <Text
            style={[
              styles.label,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            DAY STREAK
          </Text>
        </View>
      </View>

      {/* Next Milestone Info */}
      <View style={styles.milestoneInfo}>
        <Text
          style={[
            styles.milestoneLabel,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamilyBody,
              fontSize: theme.typography.fontSizeSM,
            },
          ]}
        >
          Next: {nextMilestone.name}
        </Text>
        <Text
          style={[
            styles.daysRemaining,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyMono,
              fontSize: theme.typography.fontSizeSM,
              fontWeight: theme.typography.fontWeightBold,
            },
          ]}
        >
          {nextMilestone.daysRemaining} days to go
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  streakCount: {
    lineHeight: 44,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  milestoneInfo: {
    alignItems: 'center',
  },
  milestoneLabel: {
    marginBottom: 4,
  },
  daysRemaining: {
    letterSpacing: 0.5,
  },
});
