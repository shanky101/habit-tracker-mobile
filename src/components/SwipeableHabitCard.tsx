import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { useTheme } from '@/theme';
import { Habit, useHabits } from '@/hooks/useHabits';

// Constants matching the design reference
const RIGHT_ACTIONS_WIDTH = 210; // 70px per action × 3 actions
const SWIPE_THRESHOLD = 40;
const VELOCITY_THRESHOLD = 400;
const CARD_HEIGHT_SINGLE = 60; // Height for single completion habits
const CARD_HEIGHT_MULTIPLE = 80; // Taller height for multi-completion habits (extra space for progress bars)

interface SwipeableHabitCardProps {
  habit: Habit;
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  onToggle: (id: string) => void;
  onPress: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

const SwipeableHabitCard: React.FC<SwipeableHabitCardProps> = ({
  habit,
  selectedDate,
  onToggle,
  onPress,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const { theme } = useTheme();
  const { getCompletionProgress, isHabitCompletedForDate } = useHabits();

  // Get completion progress for the selected date
  const progress = getCompletionProgress(habit.id, selectedDate);
  const isCompleted = isHabitCompletedForDate(habit.id, selectedDate);

  // Determine card height based on habit type
  const isMultiCompletion = habit.targetCompletionsPerDay > 1;
  const cardHeight = isMultiCompletion ? CARD_HEIGHT_MULTIPLE : CARD_HEIGHT_SINGLE;

  // Animated value for card translation
  const translateX = useRef(new Animated.Value(0)).current;

  // Use refs to avoid stale closure issues in gesture callbacks
  const isOpenRef = useRef(false); // True when right actions (Edit/Delete) are open
  const isLeftOpenRef = useRef(false); // True when left action (Done) is open
  const startX = useRef(0);
  const currentX = useRef(0);

  // Close all actions with animation
  const closeActions = useCallback(() => {
    isOpenRef.current = false;
    isLeftOpenRef.current = false;
    Animated.spring(translateX, {
      toValue: 0,
      damping: 20,
      stiffness: 200,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  // Open the right actions (Edit/Delete) with animation
  const openActions = useCallback(() => {
    isOpenRef.current = true;
    isLeftOpenRef.current = false;
    Animated.spring(translateX, {
      toValue: -RIGHT_ACTIONS_WIDTH,
      damping: 20,
      stiffness: 200,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  // Open the left action (Done button) with animation
  const openLeftAction = useCallback(() => {
    isOpenRef.current = false;
    isLeftOpenRef.current = true;
    Animated.spring(translateX, {
      toValue: 80, // Show Done button
      damping: 20,
      stiffness: 200,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  // Quick check-in animation - swipe right triggers this
  const performCheckIn = useCallback(() => {
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: 80,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onToggle(habit.id);
    });
  }, [translateX, habit.id, onToggle]);

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Activate after 10px horizontal movement
    .failOffsetY([-20, 20]) // Fail if vertical movement exceeds 20px (allows scrolling)
    .onStart(() => {
      // Get current animated value
      translateX.stopAnimation((value) => {
        startX.current = value;
        currentX.current = value;
      });
    })
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      const newX = startX.current + event.translationX;
      // Clamp the translation
      let clampedX: number;
      if (newX > 0) {
        // Right side - allow full swipe for check-in
        clampedX = Math.min(100, newX);
      } else {
        // Left side - clamp to actions width with slight overscroll
        clampedX = Math.max(-RIGHT_ACTIONS_WIDTH - 20, newX);
      }
      currentX.current = clampedX;
      translateX.setValue(clampedX);
    })
    .onEnd((event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      const { translationX, velocityX } = event;

      // Swipe right = show Done button (when closed)
      if (!isOpenRef.current && !isLeftOpenRef.current && (translationX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD)) {
        openLeftAction(); // Open to show Done button
        return;
      }

      // Swipe right when right actions are open = close
      if (isOpenRef.current && (translationX > 30 || velocityX > 300)) {
        closeActions();
        return;
      }

      // Swipe left when left action is open = close
      if (isLeftOpenRef.current && (translationX < -30 || velocityX < -300)) {
        closeActions();
        return;
      }

      // Swipe left = open right actions (Edit/Delete)
      if (!isLeftOpenRef.current && (translationX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD)) {
        openActions();
        return;
      }

      // Snap based on position
      if (currentX.current > 40) {
        // Right swipe - open left action
        openLeftAction();
      } else if (currentX.current < -RIGHT_ACTIONS_WIDTH / 2) {
        // Left swipe - open right actions
        openActions();
      } else {
        // Close both
        closeActions();
      }
    });

  // Tap gesture for card press - but not on checkbox area
  const tapGesture = Gesture.Tap()
    .maxDuration(200)
    .onEnd((event) => {
      // Check if tap is in the checkbox area (right side of card)
      // Checkbox is 24px wide with 10px margin left, so last ~50px of card
      const tapX = event.x; // Position relative to the card
      const cardWidth = 350; // Approximate card width (adjust if needed)
      const checkboxZoneStart = cardWidth - 60; // Last 60px is checkbox zone

      if (isOpenRef.current || isLeftOpenRef.current) {
        closeActions();
      } else if (tapX > checkboxZoneStart) {
        // Tapped in checkbox area - do nothing, let checkbox handle it
        return;
      } else {
        // Tapped on card body - navigate to detail
        onPress(habit);
      }
    });

  // Compose gestures - pan takes priority over tap
  const composedGesture = Gesture.Race(panGesture, tapGesture);

  // Interpolations for animations
  const checkInOpacity = translateX.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const actionsScale = translateX.interpolate({
    inputRange: [-RIGHT_ACTIONS_WIDTH, 0],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const actionsOpacity = translateX.interpolate({
    inputRange: [-RIGHT_ACTIONS_WIDTH / 2, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Action button press handlers
  const handleActionPress = (action: () => void) => {
    closeActions();
    setTimeout(action, 50);
  };

  // Handle checkbox/check-in button press
  const handleCheckboxPress = useCallback(() => {
    onToggle(habit.id);
  }, [habit.id, onToggle]);

  return (
    <View style={[styles.swipeableContainer, { height: cardHeight }]}>
      {/* Left action - Done/Undo button */}
      <Animated.View
        style={[
          styles.leftAction,
          {
            backgroundColor: isCompleted ? theme.colors.error : theme.colors.success,
            opacity: checkInOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.leftActionButton}
          onPress={() => {
            performCheckIn();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.checkInIcon}>{isCompleted ? '↶' : '✓'}</Text>
          <Text style={[styles.checkInText, { color: theme.colors.white }]}>
            {isCompleted ? 'Undo' : 'Done'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Right actions - revealed on swipe left */}
      <Animated.View
        style={[
          styles.rightActions,
          { transform: [{ scale: actionsScale }], opacity: actionsOpacity },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4A5568' }]}
          onPress={() => handleActionPress(() => onEdit(habit))}
          activeOpacity={0.8}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>📝</Text>
          </View>
          <Text style={[styles.actionButtonText, { color: theme.colors.white }]}>
            Add Note
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4A5568' }]}
          onPress={() => handleActionPress(() => onEdit(habit))}
          activeOpacity={0.8}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>✏️</Text>
          </View>
          <Text style={[styles.actionButtonText, { color: theme.colors.white }]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
          onPress={() => handleActionPress(() => onDelete(habit))}
          activeOpacity={0.8}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>🗑️</Text>
          </View>
          <Text style={[styles.actionButtonText, { color: theme.colors.white }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main card - wrapped in GestureDetector for seamless swiping */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.habitCard,
            {
              backgroundColor: theme.colors.surfaceSecondary, // Use secondary surface for better contrast
              height: cardHeight,
              transform: [{ translateX }],
              // Modern layered shadow for depth
              shadowColor: isCompleted ? theme.colors.primary : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isCompleted ? 0.15 : 0.08,
              shadowRadius: isCompleted ? 8 : 4,
              elevation: isCompleted ? 4 : 2,
              // Subtle border for themes with low contrast
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
            },
          ]}>
          {/* Subtle gradient overlay for completed cards */}
          {isCompleted && (
            <View
              style={[
                styles.gradientOverlay,
                {
                  backgroundColor: `${theme.colors.primary}08`, // 3% opacity
                },
              ]}>
            </View>
          )}
          <View style={styles.cardContent}>
            {/* Emoji/Icon */}
            <View style={styles.emojiContainer}>
              <Text style={styles.habitEmoji}>{habit.emoji || '🏃'}</Text>
            </View>

            {/* Habit info */}
            <View style={styles.habitInfo}>
              <Text
                style={[
                  styles.habitName,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBodyMedium,
                    fontSize: theme.typography.fontSizeMD,
                    textDecorationLine: isCompleted ? 'line-through' : 'none',
                    opacity: isCompleted ? 0.7 : 1,
                  },
                ]}
                numberOfLines={1}
              >
                {habit.name}
              </Text>

              {/* Progress bars for multi-completion habits */}
              {habit.targetCompletionsPerDay > 1 && (
                <View style={styles.progressBarsContainer}>
                  {Array.from({ length: habit.targetCompletionsPerDay }).map((_, index) => {
                    const isFilled = index < progress.current;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.progressBar,
                          {
                            backgroundColor: isFilled
                              ? theme.colors.success
                              : theme.colors.border,
                            opacity: isFilled ? 1 : 0.5, // Unfilled bars are more subtle
                            shadowColor: isFilled ? theme.colors.success : 'transparent',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: isFilled ? 0.3 : 0,
                            shadowRadius: 2,
                            elevation: isFilled ? 2 : 0,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              )}

              <Text
                style={[
                  styles.habitSubtext,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                {progress.current} / {progress.target} {progress.target === 1 ? 'time' : 'times'}
              </Text>
            </View>

            {/* Conditional rendering: Checkbox for single, Check-in button for multiple */}
            {habit.targetCompletionsPerDay === 1 ? (
              // Single completion - checkbox
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isCompleted ? theme.colors.primary : 'transparent',
                    borderColor: isCompleted ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={handleCheckboxPress}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {isCompleted && (
                  <Text style={[styles.checkmark, { color: theme.colors.white }]}>✓</Text>
                )}
              </TouchableOpacity>
            ) : (
              // Multiple completions - check-in button
              <TouchableOpacity
                style={[
                  styles.checkInButton,
                  {
                    backgroundColor: isCompleted ? theme.colors.success : 'transparent',
                    borderColor: isCompleted ? theme.colors.success : theme.colors.border,
                  },
                ]}
                onPress={handleCheckboxPress}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text
                  style={[
                    styles.checkInButtonIcon,
                    { color: isCompleted ? theme.colors.white : theme.colors.textSecondary }
                  ]}
                >
                  {isCompleted ? '✓' : '+'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 12, // Increased from 8 for better floating card separation
    marginHorizontal: 2, // Add slight horizontal margin for shadow visibility
    position: 'relative',
    // Height is set dynamically via style prop
  },
  leftAction: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 100,
    borderRadius: 14, // Slightly larger radius for smoother feel
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftActionButton: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  checkInText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  rightActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: RIGHT_ACTIONS_WIDTH,
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionButton: {
    width: 70,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionIcon: {
    fontSize: 16,
    color: '#fff',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '500',
  },
  habitCard: {
    borderRadius: 16, // Increased from 12 for more modern feel
    overflow: 'hidden', // For gradient overlay
    // Height is set dynamically via style prop
    // Border removed for cleaner look
    // Shadow properties set inline for dynamic values
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none', // Don't block touch events
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, // Increased from 14 for better spacing
    paddingVertical: 14, // Increased from 12 for more breathing room
    height: '100%',
  },
  emojiContainer: {
    width: 32, // Reduced from 40 to 32
    height: 32, // Reduced from 40 to 32
    borderRadius: 16, // Reduced from 20 to 16
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Reduced from 12 to 10
  },
  habitEmoji: {
    fontSize: 18, // Reduced from 20 to 18
  },
  habitInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 2, // Add small vertical padding to prevent overlap
  },
  habitName: {
    marginBottom: 2, // Space between habit name and progress bars/subtext
  },
  progressBarsContainer: {
    flexDirection: 'row',
    gap: 4, // Spacing between progress bars
    marginTop: 4, // Space above progress bars
    marginBottom: 4, // Space below progress bars
    alignItems: 'center',
  },
  progressBar: {
    width: 3, // Increased from 2 to 3 for better visibility
    height: 16, // Increased from 12 to 16 for more prominence
    borderRadius: 1.5, // Proportional to width
    // Add subtle shadow for filled bars (applied via inline style in component)
  },
  habitSubtext: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24, // Reduced from 28 to 24
    height: 24, // Reduced from 28 to 24
    borderRadius: 12, // Circle - half of width/height
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10, // Reduced from 12 to 10
  },
  checkmark: {
    fontSize: 12, // Reduced from 14 to 12
    fontWeight: 'bold',
  },
  checkInButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkInButtonIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SwipeableHabitCard;
