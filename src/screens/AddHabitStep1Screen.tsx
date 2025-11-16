import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

type AddHabitStep1ScreenNavigationProp = StackNavigationProp<any, 'AddHabitStep1'>;
type AddHabitStep1ScreenRouteProp = RouteProp<any, 'AddHabitStep1'>;

const HABIT_SUGGESTIONS = [
  'Read 20 pages',
  'Drink 8 glasses of water',
  'Exercise 30 minutes',
  'Journal 5 minutes',
  'Meditate 10 minutes',
  'Walk 5,000 steps',
];

const AddHabitStep1Screen: React.FC = () => {
  const navigation = useNavigation<AddHabitStep1ScreenNavigationProp>();
  const route = useRoute<AddHabitStep1ScreenRouteProp>();
  const { theme } = useTheme();

  const [habitName, setHabitName] = useState('');
  const [error, setError] = useState('');
  const textInputRef = useRef<TextInput>(null);

  // Use custom animation hook
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const handleNext = () => {
    // Validation
    if (!habitName.trim()) {
      setError('Please enter a habit name');
      return;
    }

    if (habitName.trim().length < 3) {
      setError('Habit name must be at least 3 characters');
      return;
    }

    if (habitName.length > 100) {
      setError('Habit name must be less than 100 characters');
      return;
    }

    // Navigate to step 2 with habit name
    navigation.navigate('AddHabitStep2', { habitName: habitName.trim() });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSuggestionTap = (suggestion: string) => {
    setHabitName(suggestion);
    setError('');
  };

  const characterCount = habitName.length;
  const characterLimit = 100;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.primary,
                    width: '33%',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.stepText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              Step 1 of 3
            </Text>
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplay,
                fontSize: theme.typography.fontSize2XL,
                fontWeight: theme.typography.fontWeightBold,
              },
            ]}
          >
            What's your habit?
          </Text>

          {/* Input Field */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={textInputRef}
              autoFocus
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: error ? theme.colors.error : theme.colors.border,
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeLG,
                },
              ]}
              placeholder="E.g., Meditate for 10 minutes"
              placeholderTextColor={theme.colors.textSecondary}
              value={habitName}
              onChangeText={(text) => {
                setHabitName(text);
                if (error) setError('');
              }}
              maxLength={characterLimit}
              autoCapitalize="sentences"
              autoCorrect={false}
              multiline
            />
            <View style={styles.inputFooter}>
              <Text
                style={[
                  styles.characterCount,
                  {
                    color: characterCount > 80 ? theme.colors.warning : theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeXS,
                  },
                ]}
              >
                {characterCount}/{characterLimit}
              </Text>
            </View>
            {error ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            ) : null}
          </View>

          {/* Suggestions */}
          <View style={styles.suggestionsSection}>
            <Text
              style={[
                styles.suggestionsLabel,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight: theme.typography.fontWeightMedium,
                },
              ]}
            >
              Common habits:
            </Text>
            <View style={styles.suggestionsGrid}>
              {HABIT_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionChip,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleSuggestionTap(suggestion)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('HabitTemplates')}
              style={styles.browseTemplatesButton}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.browseTemplatesText,
                  {
                    color: theme.colors.primary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                    fontWeight: theme.typography.fontWeightMedium,
                  },
                ]}
              >
                📚 Browse More Templates
              </Text>
            </TouchableOpacity>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: habitName.trim().length >= 3 ? theme.colors.primary : theme.colors.border,
                shadowColor: theme.shadows.shadowMD.shadowColor,
                shadowOffset: theme.shadows.shadowMD.shadowOffset,
                shadowOpacity: habitName.trim().length >= 3 ? theme.shadows.shadowMD.shadowOpacity : 0,
                shadowRadius: theme.shadows.shadowMD.shadowRadius,
                elevation: habitName.trim().length >= 3 ? theme.shadows.shadowMD.elevation : 0,
              },
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
            disabled={habitName.trim().length < 3}
          >
            <Text
              style={[
                styles.nextButtonText,
                {
                  color: habitName.trim().length >= 3 ? theme.colors.white : theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                  fontWeight: theme.typography.fontWeightSemibold,
                },
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 32,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    // styles from theme
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  suggestionsSection: {
    marginBottom: 32,
  },
  suggestionsLabel: {
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  suggestionChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
  },
  suggestionText: {
    // styles from theme
  },
  browseTemplatesButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  browseTemplatesText: {
    // styles from theme
  },
  nextButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  nextButtonText: {
    // styles from theme
  },
});

export default AddHabitStep1Screen;
