import React, { useRef, useCallback, ReactNode } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ViewStyle,
} from 'react-native';
import {
    Gesture,
    GestureDetector,
    GestureStateChangeEvent,
    GestureUpdateEvent,
    PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { useTheme } from '@app-core/theme';

// Constants
const DEFAULT_RIGHT_ACTIONS_WIDTH = 210; // 70px per action × 3 actions
const DEFAULT_SWIPE_THRESHOLD = 40;
const DEFAULT_VELOCITY_THRESHOLD = 400;
const DEFAULT_CARD_HEIGHT = 72;

// ============================================
// TYPES
// ============================================

export interface EntityAction {
    id: string;
    label: string;
    icon: string | ReactNode;
    color: string;
    onPress: () => void;
}

export interface DisplayConfig {
    icon: string | ReactNode;
    title: string;
    subtitle?: string;
    tintColor?: string;
}

export interface CompletionState {
    isCompleted: boolean;
    type: 'checkbox' | 'button';
    checkboxColor?: string;
    checkboxBorderColor?: string;
    checkIcon?: string | ReactNode;
}

export interface SwipeConfig {
    enableLeftSwipe?: boolean;
    enableRightSwipe?: boolean;
    leftSwipeThreshold?: number;
    rightSwipeThreshold?: number;
    leftSwipeLabel?: string;
    leftSwipeIcon?: string;
    leftSwipeColor?: string;
}

export interface SwipeableEntityCardProps<T = any> {
    // Entity data
    entity: T;

    // Display configuration
    displayConfig: DisplayConfig;

    // Completion state
    completionState: CompletionState;

    // Actions
    onPrimaryAction: () => void; // Quick complete action (right swipe or checkbox)
    onPress?: () => void; // Card tap
    actions: EntityAction[]; // Left swipe actions

    // Customization
    height?: number;
    backgroundColor?: string;
    gradientOverlay?: boolean;
    gradientColor?: string;

    // Swipe configuration
    swipeConfig?: SwipeConfig;

    // Rendering slots (optional custom renderers)
    renderProgress?: () => ReactNode;
    renderBadge?: () => ReactNode;
    renderIconContainer?: (icon: string | ReactNode) => ReactNode;
}

// ============================================
// COMPONENT
// ============================================

export const SwipeableEntityCard = <T,>({
    entity,
    displayConfig,
    completionState,
    onPrimaryAction,
    onPress,
    actions = [],
    height = DEFAULT_CARD_HEIGHT,
    backgroundColor,
    gradientOverlay = false,
    gradientColor,
    swipeConfig = {},
    renderProgress,
    renderBadge,
    renderIconContainer,
}: SwipeableEntityCardProps<T>) => {
    const { theme } = useTheme();

    // Swipe configuration with defaults
    const {
        enableLeftSwipe = true,
        enableRightSwipe = true,
        leftSwipeThreshold = DEFAULT_SWIPE_THRESHOLD,
        rightSwipeThreshold = DEFAULT_SWIPE_THRESHOLD,
        leftSwipeLabel = completionState.isCompleted ? 'Undo' : 'Done',
        leftSwipeIcon = completionState.isCompleted ? '↶' : '✓',
        leftSwipeColor = completionState.isCompleted ? theme.colors.error : theme.colors.success,
    } = swipeConfig;

    // Calculate actions width dynamically
    const rightActionsWidth = actions.length * 70;

    // Animated value for card translation
    const translateX = useRef(new Animated.Value(0)).current;

    // Use refs to avoid stale closure issues in gesture callbacks
    const isOpenRef = useRef(false); // True when right actions are open
    const isLeftOpenRef = useRef(false); // True when left action is open
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

    // Open the right actions with animation
    const openActions = useCallback(() => {
        if (actions.length === 0) return;
        isOpenRef.current = true;
        isLeftOpenRef.current = false;
        Animated.spring(translateX, {
            toValue: -rightActionsWidth,
            damping: 20,
            stiffness: 200,
            mass: 0.5,
            useNativeDriver: true,
        }).start();
    }, [translateX, rightActionsWidth, actions.length]);

    // Open the left action with animation
    const openLeftAction = useCallback(() => {
        isOpenRef.current = false;
        isLeftOpenRef.current = true;
        Animated.spring(translateX, {
            toValue: 80,
            damping: 20,
            stiffness: 200,
            mass: 0.5,
            useNativeDriver: true,
        }).start();
    }, [translateX]);

    // Quick action animation
    const performPrimaryAction = useCallback(() => {
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
            onPrimaryAction();
        });
    }, [translateX, onPrimaryAction]);

    // Pan gesture handler
    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-20, 20])
        .onStart(() => {
            translateX.stopAnimation((value) => {
                startX.current = value;
                currentX.current = value;
            });
        })
        .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
            const newX = startX.current + event.translationX;
            let clampedX: number;
            if (newX > 0) {
                // Right swipe
                clampedX = enableRightSwipe ? Math.min(100, newX) : 0;
            } else {
                // Left swipe
                clampedX = enableLeftSwipe ? Math.max(-rightActionsWidth - 20, newX) : 0;
            }
            currentX.current = clampedX;
            translateX.setValue(clampedX);
        })
        .onEnd((event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
            const { translationX, velocityX } = event;

            // Right swipe = show primary action button
            if (enableRightSwipe && !isOpenRef.current && !isLeftOpenRef.current &&
                (translationX > rightSwipeThreshold || velocityX > DEFAULT_VELOCITY_THRESHOLD)) {
                openLeftAction();
                return;
            }

            // Right swipe when right actions are open = close
            if (isOpenRef.current && (translationX > 30 || velocityX > 300)) {
                closeActions();
                return;
            }

            // Left swipe when left action is open = close
            if (isLeftOpenRef.current && (translationX < -30 || velocityX < -300)) {
                closeActions();
                return;
            }

            // Left swipe = open right actions
            if (enableLeftSwipe && !isLeftOpenRef.current &&
                (translationX < -leftSwipeThreshold || velocityX < -DEFAULT_VELOCITY_THRESHOLD)) {
                openActions();
                return;
            }

            // Snap based on position
            if (currentX.current > 40) {
                openLeftAction();
            } else if (currentX.current < -rightActionsWidth / 2) {
                openActions();
            } else {
                closeActions();
            }
        });

    // Tap gesture for card press
    const tapGesture = Gesture.Tap()
        .maxDuration(200)
        .onEnd((event) => {
            const tapX = event.x;
            const cardWidth = 350;
            const checkboxZoneStart = cardWidth - 60;

            if (isOpenRef.current || isLeftOpenRef.current) {
                closeActions();
            } else if (tapX > checkboxZoneStart) {
                // Tapped in checkbox area
                return;
            } else if (onPress) {
                onPress();
            }
        });

    // Compose gestures
    const composedGesture = Gesture.Race(panGesture, tapGesture);

    // Interpolations for animations
    const leftActionOpacity = translateX.interpolate({
        inputRange: [0, 80],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const actionsScale = translateX.interpolate({
        inputRange: [-rightActionsWidth, 0],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

    const actionsOpacity = translateX.interpolate({
        inputRange: [-rightActionsWidth / 2, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // Action button press handler
    const handleActionPress = (action: () => void) => {
        closeActions();
        setTimeout(action, 50);
    };

    // Default icon container renderer
    const defaultIconContainer = (icon: string | ReactNode) => (
        <View
            style={[
                styles.emojiContainer,
                {
                    backgroundColor: displayConfig.tintColor
                        ? `${displayConfig.tintColor}15`
                        : 'rgba(59, 130, 246, 0.1)',
                },
            ]}
        >
            {typeof icon === 'string' ? (
                <Text style={styles.habitEmoji}>{icon}</Text>
            ) : (
                icon
            )}
        </View>
    );

    return (
        <View style={[styles.swipeableContainer, { height }]}>
            {/* Left action - Primary action button */}
            {enableRightSwipe && (
                <Animated.View
                    style={[
                        styles.leftAction,
                        {
                            backgroundColor: leftSwipeColor,
                            opacity: leftActionOpacity,
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.leftActionButton}
                        onPress={performPrimaryAction}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.checkInIcon}>{leftSwipeIcon}</Text>
                        <Text style={[styles.checkInText, { color: theme.colors.white }]}>
                            {leftSwipeLabel}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Right actions - revealed on swipe left */}
            {enableLeftSwipe && actions.length > 0 && (
                <Animated.View
                    style={[
                        styles.rightActions,
                        { transform: [{ scale: actionsScale }], opacity: actionsOpacity, width: rightActionsWidth },
                    ]}
                >
                    {actions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={[styles.actionButton, { backgroundColor: action.color }]}
                            onPress={() => handleActionPress(action.onPress)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.actionIconContainer}>
                                {typeof action.icon === 'string' ? (
                                    <Text style={styles.actionIcon}>{action.icon}</Text>
                                ) : (
                                    action.icon
                                )}
                            </View>
                            <Text style={[styles.actionButtonText, { color: theme.colors.white }]}>
                                {action.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            )}

            {/* Main card */}
            <GestureDetector gesture={composedGesture}>
                <Animated.View
                    style={[
                        styles.habitCard,
                        {
                            backgroundColor: backgroundColor || theme.colors.surface,
                            height,
                            transform: [{ translateX }],
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.06,
                            shadowRadius: 16,
                            elevation: 4,
                            borderWidth: 1,
                            borderColor: 'rgba(0,0,0,0.03)',
                        },
                    ]}
                >
                    {/* Gradient overlay */}
                    {gradientOverlay && (
                        <View
                            style={[
                                styles.gradientOverlay,
                                {
                                    backgroundColor: gradientColor
                                        ? `${gradientColor}08`
                                        : `${theme.colors.primary}08`,
                                },
                            ]}
                        />
                    )}

                    <View style={styles.cardContent}>
                        {/* Icon */}
                        {renderIconContainer
                            ? renderIconContainer(displayConfig.icon)
                            : defaultIconContainer(displayConfig.icon)
                        }

                        {/* Entity info */}
                        <View style={styles.habitInfo}>
                            <Text
                                style={[
                                    styles.habitName,
                                    {
                                        color: theme.colors.text,
                                        fontFamily: theme.typography.fontFamilyDisplayBold,
                                        fontSize: theme.typography.fontSizeMD,
                                        textDecorationLine: completionState.isCompleted ? 'line-through' : 'none',
                                        opacity: completionState.isCompleted ? 0.7 : 1,
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {displayConfig.title}
                            </Text>

                            {/* Progress bars (custom renderer) */}
                            {renderProgress && renderProgress()}

                            {/* Subtitle */}
                            {displayConfig.subtitle && (
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
                                    {displayConfig.subtitle}
                                </Text>
                            )}
                        </View>

                        {/* Badge (custom renderer) */}
                        {renderBadge && renderBadge()}

                        {/* Completion indicator */}
                        <TouchableOpacity
                            style={[
                                completionState.type === 'checkbox' ? styles.checkbox : styles.checkInButton,
                                {
                                    backgroundColor: completionState.checkboxColor || 'transparent',
                                    borderColor: completionState.checkboxBorderColor || theme.colors.border,
                                },
                            ]}
                            onPress={onPrimaryAction}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            {completionState.isCompleted && completionState.checkIcon && (
                                typeof completionState.checkIcon === 'string' ? (
                                    <Text style={[styles.checkmark, { color: theme.colors.white }]}>
                                        {completionState.checkIcon}
                                    </Text>
                                ) : (
                                    completionState.checkIcon
                                )
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    swipeableContainer: {
        marginBottom: 16,
        marginHorizontal: 0,
        position: 'relative',
    },
    leftAction: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 100,
        borderRadius: 24,
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
        flexDirection: 'row',
        borderRadius: 24,
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
        borderRadius: 24,
        overflow: 'hidden',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        height: '100%',
    },
    emojiContainer: {
        width: 52,
        height: 52,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    habitEmoji: {
        fontSize: 26,
    },
    habitInfo: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 2,
    },
    habitName: {
        marginBottom: 4,
    },
    habitSubtext: {
        opacity: 0.6,
        marginTop: 2,
    },
    checkbox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    checkmark: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkInButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
});

export default SwipeableEntityCard;
