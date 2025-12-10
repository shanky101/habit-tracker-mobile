import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { useTheme } from '@/theme';

// ============================================
// STREAK BROKEN MODAL
// ============================================
interface StreakBrokenModalProps {
  visible: boolean;
  habitName: string;
  brokenStreak: number;
  onCheckIn: () => void;
  onDismiss: () => void;
}

export const StreakBrokenModal: React.FC<StreakBrokenModalProps> = ({
  visible,
  habitName,
  brokenStreak,
  onCheckIn,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible, fadeAnim, scaleAnim]);

  const recoveryTips = [
    "Start fresh today - every streak begins with day 1!",
    "Missing one day doesn't erase your progress.",
    "Focus on getting back on track, not on what you missed.",
    "Your consistency muscle is still strong. Use it!",
  ];

  const randomTip = recoveryTips[Math.floor(Math.random() * recoveryTips.length)];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          { backgroundColor: 'rgba(0,0,0,0.85)', opacity: fadeAnim },
        ]}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.modalEmoji}>💪</Text>
          <Text
            style={[
              styles.modalTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplayBold,
                fontSize: theme.typography.fontSizeXL,
              },
            ]}
          >
            Don't Worry, It Happens!
          </Text>
          <Text
            style={[
              styles.modalSubtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeMD,
                lineHeight: theme.typography.fontSizeMD * theme.typography.lineHeightRelaxed,
              },
            ]}
          >
            You had a {brokenStreak}-day streak on "{habitName}"
          </Text>
          <View
            style={[
              styles.tipCard,
              {
                backgroundColor: theme.colors.primary + '15',
                borderColor: theme.colors.primary + '30',
              },
            ]}
          >
            <Text style={styles.tipEmoji}>💡</Text>
            <Text
              style={[
                styles.tipText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
                },
              ]}
            >
              {randomTip}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={onCheckIn}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.primaryButtonText,
                {
                  color: theme.colors.white,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              Check In Now
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              Dismiss
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ============================================
// ALL HABITS COMPLETE MODAL
// ============================================
interface AllHabitsCompleteModalProps {
  visible: boolean;
  completedCount: number;
  activeStreaks: number;
  onShare: () => void;
  onDismiss: () => void;
}

export const AllHabitsCompleteModal: React.FC<AllHabitsCompleteModalProps> = ({
  visible,
  completedCount,
  activeStreaks,
  onShare,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(confettiAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(confettiAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      confettiAnim.setValue(0);
    }
  }, [visible, fadeAnim, scaleAnim, confettiAnim]);

  const quotes = [
    "Success is the sum of small efforts repeated day in and day out.",
    "You don't have to be great to start, but you have to start to be great.",
    "The secret of getting ahead is getting started.",
    "Small progress is still progress.",
    "Consistency is what transforms average into excellence.",
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I completed all ${completedCount} habits today! 🎉 Building consistency with ${activeStreaks} active streaks. #HabitTracker #Consistency`,
        title: 'All Habits Complete!',
      });
      onShare();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          { backgroundColor: 'rgba(0,0,0,0.85)', opacity: fadeAnim },
        ]}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Confetti Effect */}
          <View style={styles.confettiContainer}>
            {['🎉', '✨', '🌟', '🎊', '💫'].map((emoji, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.confettiEmoji,
                  {
                    left: `${20 + index * 15}%`,
                    opacity: confettiAnim,
                    transform: [
                      {
                        translateY: confettiAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -20],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {emoji}
              </Animated.Text>
            ))}
          </View>

          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text
            style={[
              styles.modalTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplayBold,
                fontSize: theme.typography.fontSizeXL,
              },
            ]}
          >
            All Habits Complete!
          </Text>
          <Text
            style={[
              styles.modalSubtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {completedCount}/{completedCount} habits · {activeStreaks} active streaks 🔥
          </Text>

          <View
            style={[
              styles.quoteCard,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderLeftColor: theme.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.quoteText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontStyle: 'italic',
                  lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
                },
              ]}
            >
              "{randomQuote}"
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.shareIcon}>📤</Text>
            <Text
              style={[
                styles.primaryButtonText,
                {
                  color: theme.colors.white,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              Share Achievement
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBodyMedium,
                  fontSize: theme.typography.fontSizeSM,
                },
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ============================================
// QUICK NOTE MODAL
// ============================================
interface QuickNoteModalProps {
  visible: boolean;
  habitName: string;
  onSave: (note: string, mood?: string) => void;
  onSkip: () => void;
}

// ============================================
// QUICK NOTE MODAL
// ============================================
interface QuickNoteModalProps {
  visible: boolean;
  habitName: string;
  onSave: (note: string, mood?: string) => void;
  onSkip: () => void;
}

// ============================================
// QUICK NOTE MODAL
// ============================================
import { LinearGradient } from 'expo-linear-gradient';

// ... (existing interfaces)

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  visible,
  habitName,
  onSave,
  onSkip,
}) => {
  const { theme } = useTheme();
  const [note, setNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  const moods = [
    { emoji: '🤩', label: 'Great' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '😓', label: 'Hard' },
    { emoji: '😤', label: 'Proud' },
  ];

  useEffect(() => {
    if (visible) {
      setNote('');
      setSelectedMood(null);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 90,
          mass: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleSave = () => {
    onSave(note.trim(), selectedMood || undefined);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onSkip}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: 'rgba(0,0,0,0.85)',
              opacity: fadeAnim,
              padding: 0, // Remove padding to allow full width
              justifyContent: 'flex-end', // Align to bottom
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onSkip}
          />
          <Animated.View
            style={[
              styles.bottomSheetContent,
              {
                width: '100%', // Full width
                backgroundColor: 'transparent', // Transparent for gradient
                transform: [{ translateY: slideAnim }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 10,
                padding: 0, // Remove padding from container
                paddingBottom: 0,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            ]}
          >
            <LinearGradient
              colors={[theme.colors.surface, theme.colors.backgroundSecondary]} // Subtle gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                padding: 24,
                paddingBottom: 50,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                width: '100%',
              }}
            >
              {/* Minimal Handle Bar */}
              <View style={styles.handleBarContainer}>
                <View style={[styles.handleBar, { backgroundColor: theme.colors.border, width: 36, height: 4 }]} />
              </View>

              {/* Header - Centered & Clean */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                    fontSize: 24,
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  Great Job!
                </Text>
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                >
                  How did <Text style={{ fontWeight: '600', color: theme.colors.text }}>{habitName}</Text> go?
                </Text>
              </View>

              {/* Mood Selector - Clean Row */}
              <View style={styles.moodContainer}>
                {moods.map((mood) => (
                  <TouchableOpacity
                    key={mood.emoji}
                    style={[
                      styles.moodButton,
                      {
                        backgroundColor:
                          selectedMood === mood.emoji
                            ? theme.colors.primary + '15'
                            : 'transparent',
                        borderColor:
                          selectedMood === mood.emoji
                            ? theme.colors.primary
                            : theme.colors.border,
                        borderWidth: selectedMood === mood.emoji ? 1 : 0,
                        width: 60,
                        height: 70,
                        justifyContent: 'center',
                      },
                    ]}
                    onPress={() =>
                      setSelectedMood(selectedMood === mood.emoji ? null : mood.emoji)
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 32, marginBottom: 4 }}>{mood.emoji}</Text>
                    <Text
                      style={{
                        color:
                          selectedMood === mood.emoji
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBodyMedium,
                        fontSize: 12,
                      }}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Note Input - Minimalist */}
              <View style={{ marginBottom: 32 }}>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.background, // Slightly different from gradient
                    borderRadius: 12,
                    padding: 16,
                    minHeight: 100,
                    textAlignVertical: 'top',
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: 16,
                  }}
                  placeholder="Add a note..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  maxLength={150}
                />
              </View>

              {/* Actions - Stacked Buttons */}
              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.text,
                    paddingVertical: 18,
                    borderRadius: 30,
                    alignItems: 'center',
                    shadowColor: theme.colors.text,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  onPress={handleSave}
                  activeOpacity={0.9}
                >
                  <Text
                    style={{
                      color: theme.colors.surface,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                      fontSize: 16,
                      letterSpacing: 0.5,
                    }}
                  >
                    Save Note
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                  onPress={onSkip}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: 16,
                    }}
                  >
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================
// CONFIRMATION DIALOG
// ============================================
interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, fadeAnim, scaleAnim]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View
        style={[
          styles.dialogOverlay,
          { backgroundColor: 'rgba(0,0,0,0.85)', opacity: fadeAnim },
        ]}
      >
        <Animated.View
          style={[
            styles.dialogContent,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text
            style={[
              styles.dialogTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplayBold,
                fontSize: theme.typography.fontSizeLG,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.dialogMessage,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeSM,
                lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
              },
            ]}
          >
            {message}
          </Text>
          <View style={styles.dialogActions}>
            <TouchableOpacity
              style={[styles.dialogButton, { borderColor: theme.colors.border }]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dialogButtonText,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBodyMedium,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dialogButton,
                {
                  backgroundColor: destructive ? theme.colors.error : theme.colors.primary,
                  borderWidth: 0,
                },
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dialogButtonText,
                  {
                    color: theme.colors.white,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
  },
  quoteCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 24,
    width: '100%',
  },
  quoteText: {
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  shareIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 10,
  },
  secondaryButtonText: {
    textAlign: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
  },
  confettiEmoji: {
    position: 'absolute',
    fontSize: 24,
  },
  keyboardView: {
    flex: 1,
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handleBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    marginBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    marginBottom: 4,
  },
  sheetSubtitle: {
    marginBottom: 20,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 58,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {},
  noteInput: {
    padding: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 20,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {},
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {},
  dialogOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogContent: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 24,
  },
  dialogTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogMessage: {
    textAlign: 'center',
    marginBottom: 24,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  dialogButtonText: {},
});
