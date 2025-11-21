import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { useTheme } from '@/theme';

const { width } = Dimensions.get('window');

const MOOD_EMOJIS = [
  { emoji: '😊', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Meh' },
  { emoji: '😤', label: 'Tough' },
];

interface QuickNoteModalProps {
  visible: boolean;
  habitName: string;
  onSave: (note: string, mood?: string) => void;
  onSkip: () => void;
}

const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  visible,
  habitName,
  onSave,
  onSkip,
}) => {
  const { theme } = useTheme();
  const [note, setNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setNote('');
      setSelectedMood(null);
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
    }
  }, [visible, scaleAnim, fadeAnim]);

  const handleSave = () => {
    onSave(note.trim(), selectedMood || undefined);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onSkip}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onSkip}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.background,
                shadowColor: theme.shadows.shadowXL.shadowColor,
                shadowOffset: theme.shadows.shadowXL.shadowOffset,
                shadowOpacity: theme.shadows.shadowXL.shadowOpacity,
                shadowRadius: theme.shadows.shadowXL.shadowRadius,
                elevation: theme.shadows.shadowXL.elevation,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyDisplay,
                      fontSize: theme.typography.fontSizeLG,
                      fontWeight: theme.typography.fontWeightBold,
                    },
                  ]}
                >
                  Nice work!
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  {habitName} completed
                </Text>
              </View>

              {/* Mood Picker */}
              <View style={styles.moodSection}>
                <Text
                  style={[
                    styles.sectionLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                      fontWeight: theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  How are you feeling?
                </Text>
                <View style={styles.moodGrid}>
                  {MOOD_EMOJIS.map((mood) => (
                    <TouchableOpacity
                      key={mood.emoji}
                      style={[
                        styles.moodButton,
                        {
                          backgroundColor:
                            selectedMood === mood.emoji
                              ? `${theme.colors.primary}20`
                              : theme.colors.backgroundSecondary,
                          borderColor:
                            selectedMood === mood.emoji
                              ? theme.colors.primary
                              : theme.colors.border,
                        },
                      ]}
                      onPress={() =>
                        setSelectedMood(selectedMood === mood.emoji ? null : mood.emoji)
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      <Text
                        style={[
                          styles.moodLabel,
                          {
                            color:
                              selectedMood === mood.emoji
                                ? theme.colors.primary
                                : theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamilyBody,
                            fontSize: theme.typography.fontSizeXS,
                          },
                        ]}
                      >
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Note Input */}
              <View style={styles.noteSection}>
                <Text
                  style={[
                    styles.sectionLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                      fontWeight: theme.typography.fontWeightMedium,
                    },
                  ]}
                >
                  Add a quick note (optional)
                </Text>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.noteInput,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeMD,
                    },
                  ]}
                  placeholder="What's on your mind?"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  maxLength={200}
                  textAlignVertical="top"
                />
                <Text
                  style={[
                    styles.characterCount,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {note.length}/200
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      {
                        color: theme.colors.white,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeMD,
                        fontWeight: theme.typography.fontWeightSemibold,
                      },
                    ]}
                  >
                    {note.trim() || selectedMood ? 'Save' : 'Done'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={onSkip}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.skipButtonText,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                        fontWeight: theme.typography.fontWeightMedium,
                      },
                    ]}
                  >
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouch: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 48,
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkIcon: {
    fontSize: 48,
    marginBottom: 12,
    color: '#22C55E',
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    // styles from theme
  },
  moodSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 54,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    // styles from theme
  },
  noteSection: {
    marginBottom: 24,
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    minHeight: 80,
    maxHeight: 120,
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 6,
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {},
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {},
});

export default QuickNoteModal;
