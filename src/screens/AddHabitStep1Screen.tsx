import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowRight, Sparkles, TrendingUp, TrendingDown } from 'lucide-react-native';

type AddHabitStep1ScreenNavigationProp = StackNavigationProp<any, 'AddHabitStep1'>;

const HABIT_SUGGESTIONS = [
  'Drink Water 💧',
  'Read Books 📚',
  'Meditate 🧘',
  'Exercise 💪',
  'Journal ✍️',
  'Walk 🚶',
];

const { width } = Dimensions.get('window');

const AddHabitStep1Screen: React.FC = () => {
  const navigation = useNavigation<AddHabitStep1ScreenNavigationProp>();
  const { theme } = useTheme();

  const [habitName, setHabitName] = useState('');
  const [habitType, setHabitType] = useState<'positive' | 'negative'>('positive');
  const [error, setError] = useState('');

  // Animations
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const typeScale = useRef(new Animated.Value(1)).current;
  const inputScale = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (!habitName.trim()) {
      setError('Please name your habit');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (habitName.trim().length < 3) {
      setError('Name is too short');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('AddHabitStep2', { habitName: habitName.trim(), habitType });
  };

  const handleTypeSelect = (type: 'positive' | 'negative') => {
    if (type !== habitType) {
      Haptics.selectionAsync();
      setHabitType(type);

      // Bounce animation
      Animated.sequence([
        Animated.timing(typeScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.spring(typeScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleSuggestionTap = (suggestion: string) => {
    Haptics.selectionAsync();
    setHabitName(suggestion);
    setError('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
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
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>Close</Text>
              </TouchableOpacity>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.stepDot, { backgroundColor: theme.colors.border }]} />
                <View style={[styles.stepDot, { backgroundColor: theme.colors.border }]} />
              </View>
            </View>

            {/* Main Title */}
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                The Spark ✨
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                What habit do you want to {habitType === 'positive' ? 'build' : 'break'}?
              </Text>
            </View>

            {/* Type Selector Cards */}
            <Animated.View style={[styles.typeContainer, { transform: [{ scale: typeScale }] }]}>
              <TouchableOpacity
                style={[
                  styles.typeCard,
                  habitType === 'positive' && styles.selectedTypeCard,
                  { borderColor: habitType === 'positive' ? theme.colors.primary : theme.colors.border }
                ]}
                onPress={() => handleTypeSelect('positive')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={habitType === 'positive' ? [theme.colors.primary + '20', theme.colors.primary + '05'] : ['transparent', 'transparent']}
                  style={styles.typeGradient}
                >
                  <View style={[styles.typeIcon, { backgroundColor: habitType === 'positive' ? theme.colors.primary : theme.colors.backgroundSecondary }]}>
                    <TrendingUp color={habitType === 'positive' ? '#FFF' : theme.colors.textSecondary} size={24} />
                  </View>
                  <Text style={[styles.typeTitle, { color: theme.colors.text }]}>Build</Text>
                  <Text style={[styles.typeDesc, { color: theme.colors.textSecondary }]}>Start something new</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeCard,
                  habitType === 'negative' && styles.selectedTypeCard,
                  { borderColor: habitType === 'negative' ? theme.colors.error : theme.colors.border }
                ]}
                onPress={() => handleTypeSelect('negative')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={habitType === 'negative' ? [theme.colors.error + '20', theme.colors.error + '05'] : ['transparent', 'transparent']}
                  style={styles.typeGradient}
                >
                  <View style={[styles.typeIcon, { backgroundColor: habitType === 'negative' ? theme.colors.error : theme.colors.backgroundSecondary }]}>
                    <TrendingDown color={habitType === 'negative' ? '#FFF' : theme.colors.textSecondary} size={24} />
                  </View>
                  <Text style={[styles.typeTitle, { color: theme.colors.text }]}>Quit</Text>
                  <Text style={[styles.typeDesc, { color: theme.colors.textSecondary }]}>Stop a bad habit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Massive Input */}
            <Animated.View style={[styles.inputContainer, { transform: [{ scale: inputScale }] }]}>
              <TextInput
                style={[
                  styles.massiveInput,
                  { color: theme.colors.text }
                ]}
                placeholder={habitType === 'positive' ? "e.g. Morning Run" : "e.g. Sugar"}
                placeholderTextColor={theme.colors.textSecondary + '80'}
                value={habitName}
                onChangeText={(text) => {
                  setHabitName(text);
                  if (error) setError('');
                }}
                autoFocus
                maxLength={40}
              />
              {error ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
              ) : null}
            </Animated.View>

            {/* Floating Suggestions */}
            <View style={styles.suggestionsContainer}>
              <Text style={[styles.suggestionsLabel, { color: theme.colors.textSecondary }]}>
                Need inspiration?
              </Text>
              <View style={styles.bubblesGrid}>
                {HABIT_SUGGESTIONS.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.bubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                    onPress={() => handleSuggestionTap(suggestion)}
                  >
                    <Text style={[styles.bubbleText, { color: theme.colors.text }]}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Browse Templates Link - Prominent Card */}
            <TouchableOpacity
              style={styles.templateCard}
              onPress={() => navigation.navigate('HabitTemplates')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary + '15', theme.colors.primary + '05']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.templateGradient}
              >
                <View style={[styles.templateIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Sparkles size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.templateInfo}>
                  <Text style={[styles.templateTitle, { color: theme.colors.text }]}>
                    Browse Curated Templates
                  </Text>
                  <Text style={[styles.templateSubtitle, { color: theme.colors.textSecondary }]}>
                    Discover popular habits to build or break
                  </Text>
                </View>
                <ArrowRight size={16} color={theme.colors.primary} />
              </LinearGradient>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>

        {/* Floating Next Button */}
        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: habitName.trim().length >= 3 ? theme.colors.primary : theme.colors.border,
                opacity: habitName.trim().length >= 3 ? 1 : 0.5,
              }
            ]}
            onPress={handleNext}
            disabled={habitName.trim().length < 3}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <ArrowRight color="#FFF" size={18} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  typeCard: {
    flex: 1,
    height: 140,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  selectedTypeCard: {
    borderWidth: 2,
  },
  typeGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 40,
  },
  massiveInput: {
    fontSize: 32,
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 16,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  suggestionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bubblesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  bubble: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  templateCard: {
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  templateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  templateSubtitle: {
    fontSize: 12,
  },
  templateLink: {
    display: 'none', // Deprecated
  },
  templateLinkText: {
    display: 'none', // Deprecated
  },
  footer: {
    padding: 16, // Reduced from 24
    paddingBottom: Platform.OS === 'ios' ? 16 : 24, // Adjust for safe area
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // Reduced from 18
    borderRadius: 16, // Reduced radius slightly
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Reduced shadow
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16, // Reduced from 18
    fontWeight: '700',
  },
});

export default AddHabitStep1Screen;
