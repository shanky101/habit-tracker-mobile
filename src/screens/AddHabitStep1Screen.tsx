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
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Heart,
  Activity,
  Zap,
  Brain,
  Users,
  DollarSign,
  Palette,
  Star,
  Check
} from 'lucide-react-native';

type AddHabitStep1ScreenNavigationProp = StackNavigationProp<any, 'AddHabitStep1'>;

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'health', name: 'Health', icon: Heart, color: '#EF4444' },
  { id: 'fitness', name: 'Fitness', icon: Activity, color: '#22C55E' },
  { id: 'productivity', name: 'Productivity', icon: Zap, color: '#3B82F6' },
  { id: 'mindfulness', name: 'Mindfulness', icon: Brain, color: '#A855F7' },
  { id: 'social', name: 'Social', icon: Users, color: '#EC4899' },
  { id: 'finance', name: 'Finance', icon: DollarSign, color: '#10B981' },
  { id: 'creativity', name: 'Creativity', icon: Palette, color: '#F97316' },
  { id: 'other', name: 'Other', icon: Star, color: '#64748B' },
];

const AddHabitStep1Screen: React.FC = () => {
  const navigation = useNavigation<AddHabitStep1ScreenNavigationProp>();
  const { theme } = useTheme();

  const [habitName, setHabitName] = useState('');
  const [habitType, setHabitType] = useState<'positive' | 'negative'>('positive');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Animations
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const categoryScale = useRef(new Animated.Value(1)).current;

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
    if (!selectedCategory) {
      setError('Please select a category');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('AddHabitStep2', {
      habitName: habitName.trim(),
      habitType,
      category: selectedCategory
    });
  };

  const handleCategorySelect = (id: string) => {
    Haptics.selectionAsync();
    setSelectedCategory(id);
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
                What's your focus?
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Choose a category to start your journey.
              </Text>
            </View>

            {/* Category Grid */}
            <View style={styles.gridContainer}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.gridCard,
                      {
                        backgroundColor: isSelected ? cat.color + '20' : theme.colors.surface,
                        borderColor: isSelected ? cat.color : 'transparent',
                        borderWidth: 2,
                      }
                    ]}
                    onPress={() => handleCategorySelect(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.iconCircle,
                      { backgroundColor: isSelected ? cat.color : theme.colors.backgroundSecondary }
                    ]}>
                      <Icon size={24} color={isSelected ? '#FFF' : theme.colors.textSecondary} />
                    </View>
                    <Text style={[
                      styles.cardLabel,
                      { color: isSelected ? theme.colors.text : theme.colors.textSecondary, fontWeight: isSelected ? '700' : '500' }
                    ]}>
                      {cat.name}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: cat.color }]}>
                        <Check size={12} color="#FFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Habit Name Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>NAME YOUR HABIT</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surface,
                    borderColor: error && !habitName ? theme.colors.error : 'transparent'
                  }
                ]}
                placeholder="e.g. Morning Run"
                placeholderTextColor={theme.colors.textSecondary + '80'}
                value={habitName}
                onChangeText={(text) => {
                  setHabitName(text);
                  if (error) setError('');
                }}
                maxLength={40}
              />
            </View>

            {/* Type Toggle (Small) */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  habitType === 'positive' && { backgroundColor: theme.colors.primary + '20' }
                ]}
                onPress={() => setHabitType('positive')}
              >
                <TrendingUp size={16} color={habitType === 'positive' ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[
                  styles.toggleText,
                  { color: habitType === 'positive' ? theme.colors.primary : theme.colors.textSecondary }
                ]}>Build</Text>
              </TouchableOpacity>

              <View style={{ width: 1, height: 20, backgroundColor: theme.colors.border }} />

              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  habitType === 'negative' && { backgroundColor: theme.colors.error + '20' }
                ]}
                onPress={() => setHabitType('negative')}
              >
                <TrendingDown size={16} color={habitType === 'negative' ? theme.colors.error : theme.colors.textSecondary} />
                <Text style={[
                  styles.toggleText,
                  { color: habitType === 'negative' ? theme.colors.error : theme.colors.textSecondary }
                ]}>Quit</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
            ) : null}

          </Animated.View>
        </ScrollView>

        {/* Floating Next Button */}
        <View style={[styles.footer, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: (habitName.trim().length >= 3 && selectedCategory) ? 1 : 0.5,
                shadowColor: theme.colors.primary,
              }
            ]}
            onPress={handleNext}
            disabled={habitName.trim().length < 3 || !selectedCategory}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <ArrowRight color="#FFF" size={20} />
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
    marginBottom: 32,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Outfit_500Medium',
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
    fontFamily: 'Outfit_700Bold',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    lineHeight: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  gridCard: {
    width: (width - 48 - 12) / 2, // 2 columns
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    position: 'relative',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  input: {
    fontSize: 18,
    fontFamily: 'Outfit_500Medium',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'center',
    marginBottom: 24,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 32,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
  },
});

export default AddHabitStep1Screen;
