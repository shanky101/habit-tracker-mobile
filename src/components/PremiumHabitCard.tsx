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
    const getCardColors = () => {
        if (isNegative) {
            if (isLimitReached) return ['#FEF2F2', '#FEE2E2']; // Light Red
            return ['#FFFFFF', '#F9FAFB']; // White/Gray
        }
        if (isCompleted) {
            return [theme.colors.primary + '15', theme.colors.primary + '05']; // Subtle Primary
        }
        return [theme.colors.surface, theme.colors.surface]; // Default Surface
    };

    const getBorderColor = () => {
        if (isNegative && isLimitReached) return theme.colors.error;
        if (isCompleted) return theme.colors.primary;
        return 'transparent';
    };

    return (
        <View style={styles.container}>
            {/* Background Actions */}
            <View style={styles.actionsContainer}>
                {/* Left Action (Check-in Hint) */}
                <View style={[styles.actionLeft, { backgroundColor: theme.colors.success }]}>
                    <Check color="#FFF" size={24} />
                </View>

                {/* Right Actions */}
                <View style={styles.actionsRight}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.colors.textSecondary }]}
                        onPress={() => { closeActions(); onEdit(habit); }}
                    >
                        <Edit2 color="#FFF" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.colors.warning }]}
                        onPress={() => { closeActions(); onArchive(habit); }}
                    >
                        <Archive color="#FFF" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.colors.error }]}
                        onPress={() => { closeActions(); onDelete(habit); }}
                    >
                        <Trash2 color="#FFF" size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Card */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.cardWrapper,
                        {
                            transform: [{ translateX }, { scale }],
                            backgroundColor: theme.colors.surface, // Fix transparency issue
                        }
                    ]}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => onPress(habit)}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                    >
                        <LinearGradient
                            colors={getCardColors() as [string, string, ...string[]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.card,
                                {
                                    borderColor: getBorderColor(),
                                    borderWidth: isCompleted || isLimitReached ? 1.5 : 0,
                                }
                            ]}
                        >
                            {/* Content */}
                            <View style={styles.content}>
                                {/* Icon/Emoji */}
                                <View style={[styles.iconContainer, { backgroundColor: habit.color ? habit.color + '20' : theme.colors.primary + '20' }]}>
                                    {(() => {
                                        const categoryData = CATEGORIES.find(c => c.id === habit.category);
                                        const IconComponent = categoryData?.icon;
                                        if (IconComponent) {
                                            return <IconComponent size={24} color={habit.color || theme.colors.primary} />;
                                        }
                                        return <Text style={styles.emoji}>{habit.emoji || '📝'}</Text>;
                                    })()}
                                </View>

                                {/* Text Info */}
                                <View style={styles.textContainer}>
                                    <Text style={[styles.title, { color: theme.colors.text, textDecorationLine: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.7 : 1 }]}>
                                        {habit.name}
                                    </Text>
                                    <View style={styles.statsRow}>
                                        <View style={styles.statBadge}>
                                            <Flame size={12} color={theme.colors.warning} />
                                            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{habit.streak}</Text>
                                        </View>
                                        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                                            {progress.current}/{progress.target}
                                        </Text>
                                    </View>
                                </View>

                                {/* Check Button */}
                                <TouchableOpacity
                                    onPress={handleToggle}
                                    style={[
                                        styles.checkButton,
                                        {
                                            backgroundColor: isCompleted ? theme.colors.primary : theme.colors.background,
                                            borderColor: isCompleted ? theme.colors.primary : theme.colors.border,
                                        }
                                    ]}
                                >
                                    <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                                        {isCompleted ? (
                                            <Check size={20} color="#FFF" strokeWidth={3} />
                                        ) : (
                                            <View style={[styles.checkRing, { borderColor: theme.colors.border }]} />
                                        )}
                                    </Animated.View>
                                </TouchableOpacity>
                            </View>

                            {/* Progress Bar (Bottom) */}
                            {habit.targetCompletionsPerDay > 1 && (
                                <View style={styles.progressBarContainer}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${(progress.current / progress.target) * 100}%`,
                                                backgroundColor: isNegative ? theme.colors.error : theme.colors.primary
                                            }
                                        ]}
                                    />
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        position: 'relative',
    },
    actionsContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
    },
    actionLeft: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 20,
    },
    actionsRight: {
        flexDirection: 'row',
        height: '100%',
        width: RIGHT_ACTIONS_WIDTH,
        justifyContent: 'flex-end',
    },
    actionBtn: {
        width: 60,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardWrapper: {
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        backgroundColor: 'transparent',
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        padding: 16,
        minHeight: 80,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    emoji: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.04)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressText: {
        fontSize: 12,
        fontWeight: '500',
    },
    checkButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginLeft: 12,
    },
    checkRing: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        opacity: 0.3,
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 2,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
});

export default PremiumHabitCard;
