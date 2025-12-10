import React, { useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
    Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
    Gesture,
    GestureDetector,
    GestureStateChangeEvent,
    GestureUpdateEvent,
    PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { Check, X, Edit2, Trash2, Archive, Flame, Zap } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Habit, useHabits } from '@/hooks/useHabits';
import { CATEGORIES } from '@/data/habitOptions';

const { width } = Dimensions.get('window');
const RIGHT_ACTIONS_WIDTH = 180;
const SWIPE_THRESHOLD = 50;

interface PremiumHabitCardProps {
    habit: Habit;
    selectedDate: string;
    onToggle: (id: string) => void;
    onPress: (habit: Habit) => void;
    onEdit: (habit: Habit) => void;
    onArchive: (habit: Habit) => void;
    onDelete: (habit: Habit) => void;
}

const PremiumHabitCard: React.FC<PremiumHabitCardProps> = ({
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

    const progress = getCompletionProgress(habit.id, selectedDate);
    const isCompleted = isHabitCompletedForDate(habit.id, selectedDate);
    const isNegative = habit.type === 'negative';
    const isLimitReached = isNegative && progress.current >= progress.target;

    // Animations
    const translateX = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const checkScale = useRef(new Animated.Value(1)).current;

    // Refs for gesture handling
    const startX = useRef(0);
    const isOpenRef = useRef(false);

    // Reset position on date change
    useEffect(() => {
        if (isOpenRef.current) {
            closeActions();
        }
    }, [selectedDate]);

    const closeActions = useCallback(() => {
        isOpenRef.current = false;
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
        }).start();
    }, [translateX]);

    const openActions = useCallback(() => {
        isOpenRef.current = true;
        Animated.spring(translateX, {
            toValue: -RIGHT_ACTIONS_WIDTH,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
        }).start();
    }, [translateX]);

    // Gesture Handler
    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-20, 20])
        .onStart(() => {
            translateX.stopAnimation((value) => {
                startX.current = value;
            });
        })
        .onUpdate((event) => {
            const newX = startX.current + event.translationX;
            // Limit right swipe (check-in hint) and left swipe (actions)
            const clampedX = Math.max(-RIGHT_ACTIONS_WIDTH - 50, Math.min(80, newX));
            translateX.setValue(clampedX);
        })
        .onEnd((event) => {
            const { translationX, velocityX } = event;

            // Swipe Right (Quick Check-in)
            if (translationX > SWIPE_THRESHOLD) {
                // Trigger check-in and bounce back
                onToggle(habit.id);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                closeActions();
                return;
            }

            // Swipe Left (Open Actions)
            if (translationX < -SWIPE_THRESHOLD || velocityX < -500) {
                openActions();
            } else {
                closeActions();
            }
        });

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const handleToggle = () => {
        // Animate checkmark
        Animated.sequence([
            Animated.timing(checkScale, { toValue: 0.5, duration: 50, useNativeDriver: true }),
            Animated.spring(checkScale, { toValue: 1.2, friction: 3, useNativeDriver: true }),
            Animated.spring(checkScale, { toValue: 1, friction: 3, useNativeDriver: true }),
        ]).start();

        onToggle(habit.id);
    };

    // Dynamic Styles
    const getCardColors = (): [string, string] => {
        if (isNegative) {
            if (isLimitReached) return ['#FEF2F2', '#FEE2E2']; // Light Red
            return ['#FFFFFF', '#F9FAFB']; // White/Gray
        }
        if (isCompleted) {
            // Solid gradient for completed state - subtle but opaque
            return ['#5B21B6', '#7C3AED']; // Purple gradient
        }
        // Default state - SOLID vibrant gradient like Templates
        return ['#4F46E5', '#6366F1']; // Indigo gradient - NO TRANSPARENCY
    };

    const CategoryIcon = CATEGORIES.find(c => c.id === habit.category)?.icon;

    // Removed opacity animation - actions are always rendered behind the card
    // The card sliding reveals them naturally, eliminating flicker

    const styles = StyleSheet.create({
        container: {
            marginBottom: 12,
            width: '100%', // Fill available space
            height: 84,
            position: 'relative',
        },
        actionsContainer: {
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: RIGHT_ACTIONS_WIDTH,
            flexDirection: 'row',
            borderRadius: 28,
            overflow: 'hidden'
        },
        actionButton: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        cardWrapper: {
            flex: 1,
            borderRadius: 28,
            backgroundColor: theme.colors.surface,
            borderWidth: 0,
            shadowColor: theme.shadows.shadowMD.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
        },
        cardContent: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 18, // More breathing room
            paddingVertical: 12,
            borderRadius: 28,
            overflow: 'hidden',
        },
        iconContainer: {
            width: 44, // Slightly smaller
            height: 44,
            borderRadius: 22, // Fully round
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 14,
        },
        textContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        habitName: {
            fontSize: 17, // Slightly refined
            fontWeight: '600',
            marginBottom: 2,
            fontFamily: theme.styles.fontFamilyDisplay || theme.typography.fontFamilyDisplaySemibold,
            letterSpacing: -0.3,
        },
        streakContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        streakText: {
            fontSize: 12,
            marginLeft: 4,
            fontWeight: '500',
            fontFamily: theme.styles.fontFamilyBody || theme.typography.fontFamilyBodyMedium,
            opacity: 0.8,
        },
        checkboxContainer: {
            marginLeft: 12,
        },
        checkbox: {
            width: 32,
            height: 32,
            borderRadius: 16, // Fully round
            borderWidth: 0, // No border for cleaner look
            justifyContent: 'center',
            alignItems: 'center',
        },
        progressBar: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 3,
            backgroundColor: theme.colors.primary,
        },
    });

    return (
        <View style={styles.container}>
            {/* Background Actions - always rendered, card slides to reveal */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => {
                        closeActions();
                        // Delay navigation to allow swipe animation to complete
                        setTimeout(() => onEdit(habit), 300);
                    }}
                >
                    <Edit2 size={20} color={theme.colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
                    onPress={() => {
                        closeActions();
                        setTimeout(() => onArchive(habit), 300);
                    }}
                >
                    <Archive size={20} color={theme.colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                    onPress={() => {
                        closeActions();
                        setTimeout(() => onDelete(habit), 300);
                    }}
                >
                    <Trash2 size={20} color={theme.colors.white} />
                </TouchableOpacity>
            </View>

            {/* Main Card */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.cardWrapper,
                        {
                            transform: [{ translateX }, { scale }],
                        },
                    ]}
                    shouldRasterizeIOS
                    renderToHardwareTextureAndroid
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => onPress(habit)}
                        style={{ flex: 1 }}
                    >
                        <LinearGradient
                            colors={getCardColors()}
                            style={styles.cardContent}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {/* Icon */}
                            <View style={[styles.iconContainer, { backgroundColor: habit.color + '15' }]}>
                                {CategoryIcon ? (
                                    <CategoryIcon size={22} color={habit.color} />
                                ) : (
                                    <Text style={{ fontSize: 22 }}>{habit.emoji}</Text>
                                )}
                            </View>

                            {/* Text Info */}
                            <View style={styles.textContainer}>
                                <Text
                                    style={[
                                        styles.habitName,
                                        {
                                            color: isCompleted ? theme.colors.textSecondary : theme.colors.text,
                                            textDecorationLine: isCompleted ? 'line-through' : 'none',
                                            opacity: isCompleted ? 0.7 : 1,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {habit.name}
                                </Text>
                                <View style={styles.streakContainer}>
                                    <Flame
                                        size={12}
                                        color={habit.streak > 0 ? theme.colors.primary : theme.colors.textTertiary}
                                        fill={habit.streak > 0 ? theme.colors.primary : 'none'}
                                    />
                                    <Text
                                        style={[
                                            styles.streakText,
                                            { color: theme.colors.textSecondary },
                                        ]}
                                    >
                                        {habit.streak} day streak
                                    </Text>
                                </View>
                            </View>

                            {/* Checkbox */}
                            <TouchableOpacity
                                onPress={handleToggle}
                                style={styles.checkboxContainer}
                            >
                                <Animated.View
                                    style={[
                                        styles.checkbox,
                                        {
                                            // Pastel shade of primary color when checked
                                            backgroundColor: isCompleted ? theme.colors.primary + '30' : theme.colors.backgroundSecondary,
                                            transform: [{ scale: checkScale }],
                                        },
                                    ]}
                                >
                                    {isCompleted ? (
                                        <Check size={16} color={theme.colors.primary} strokeWidth={3} />
                                    ) : (
                                        <View style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: 6,
                                            borderWidth: 2,
                                            borderColor: theme.colors.textTertiary,
                                            opacity: 0.5
                                        }} />
                                    )}
                                </Animated.View>
                            </TouchableOpacity>

                            {/* Progress Bar (if partially complete) */}
                            {!isCompleted && progress.current > 0 && (
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${(progress.current / progress.target) * 100}%`,
                                            backgroundColor: habit.color,
                                        },
                                    ]}
                                />
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};


export default PremiumHabitCard;
