import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  completedCount: number;
  totalCount: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 12,
  completedCount,
  totalCount,
}) => {
  const { theme } = useTheme();
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false, // strokeDashoffset doesn't support native driver
    }).start();
  }, [progress]);

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
              styles.percentage,
              {
                color: theme.colors.primary,
                fontFamily: theme.typography.fontFamilyDisplay,
                fontSize: theme.typography.fontSize2XL,
                fontWeight: theme.typography.fontWeightBold,
              },
            ]}
          >
            {Math.round(progress)}%
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
            Complete
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.subtext,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeSM,
          },
        ]}
      >
        {completedCount} of {totalCount} habits
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 32,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
  percentage: {
    lineHeight: 32,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  subtext: {
    marginTop: 4,
  },
});
