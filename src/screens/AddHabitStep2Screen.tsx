import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowRight, Check, Heart, Dumbbell, Briefcase, Brain, BookOpen, Users, Wallet, Palette, Star, Music, Coffee, Sun, Moon, Zap } from 'lucide-react-native';

type AddHabitStep2ScreenNavigationProp = StackNavigationProp<any, 'AddHabitStep2'>;
type AddHabitStep2ScreenRouteProp = RouteProp<{ AddHabitStep2: { habitName: string; habitType: 'positive' | 'negative' } }, 'AddHabitStep2'>;

import { CATEGORIES, COLORS } from '@/data/habitOptions';

const { width } = Dimensions.get('window');

const AddHabitStep2Screen: React.FC = () => {
  const navigation = useNavigation<AddHabitStep2ScreenNavigationProp>();
  const route = useRoute<AddHabitStep2ScreenRouteProp>();
  const { theme } = useTheme();

  const { habitName, habitType } = route.params;

  const [selectedCategory, setSelectedCategory] = useState('health');
  const [selectedColor, setSelectedColor] = useState('blue');

  // Animations
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate background color change
    Animated.timing(bgAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false, // Color interpolation doesn't support native driver
    }).start(() => {
      bgAnim.setValue(0);
    });
  }, [selectedColor]);

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory !== categoryId) {
      Haptics.selectionAsync();
      setSelectedCategory(categoryId);
    }
  };

  const handleColorSelect = (colorId: string) => {
    if (selectedColor !== colorId) {
      Haptics.selectionAsync();
      setSelectedColor(colorId);
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('AddHabitStep3', {
      habitName,
      habitType,
      category: selectedCategory,
      color: selectedColor,
    });
  };

  const getSelectedColorValue = () => {
    return COLORS.find((c) => c.id === selectedColor)?.value || '#EF4444';
  };

  const getBackgroundColor = () => {
    // Create a subtle version of the selected color for the background
    return getSelectedColorValue() + '10'; // 10% opacity
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: getBackgroundColor(), opacity: 1 }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>Back</Text>
            </TouchableOpacity>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.stepDot, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.stepDot, { backgroundColor: theme.colors.border }]} />
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              The Vibe 🎨
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Make "{habitName}" look good.
            </Text>
          </View>

          {/* Category Grid */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.selectedCategoryCard,
                      {
                        backgroundColor: isSelected ? theme.colors.surface : 'rgba(255,255,255,0.5)',
                        borderColor: isSelected ? getSelectedColorValue() : 'transparent'
                      }
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                    activeOpacity={0.8}
                  >
                    <category.icon size={32} color={isSelected ? getSelectedColorValue() : theme.colors.textSecondary} strokeWidth={1.5} style={{ marginBottom: 8 }} />
                    <Text style={[
                      styles.categoryLabel,
                      {
                        color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500'
                      }
                    ]}>
                      {category.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: getSelectedColorValue() }]}>
                        <Check size={10} color="#FFF" strokeWidth={4} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Color Picker */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>COLOR THEME</Text>
            <View style={styles.colorGrid}>
              {COLORS.map((color) => {
                const isSelected = selectedColor === color.id;
                return (
                  <TouchableOpacity
                    key={color.id}
                    style={[
                      styles.colorOption,
                      isSelected && { transform: [{ scale: 1.1 }] }
                    ]}
                    onPress={() => handleColorSelect(color.id)}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: color.value }]}>
                      {isSelected && <Check size={16} color="#FFF" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Preview Card */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>PREVIEW</Text>
            <View style={[styles.previewCard, { shadowColor: getSelectedColorValue() }]}>
              <LinearGradient
                colors={[getSelectedColorValue() + '15', getSelectedColorValue() + '05']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.previewGradient, { borderColor: getSelectedColorValue() }]}
              >
                <View style={[styles.previewIconContainer, { backgroundColor: getSelectedColorValue() + '20' }]}>
                  <Text style={styles.previewIcon}>
                    {(() => {
                      const CatIcon = CATEGORIES.find(c => c.id === selectedCategory)?.icon || Star;
                      return <CatIcon size={24} color={theme.colors.text} />;
                    })()}
                  </Text>
                </View>
                <View style={styles.previewTextContainer}>
                  <Text style={[styles.previewTitle, { color: theme.colors.text }]}>{habitName}</Text>
                  <Text style={[styles.previewSubtitle, { color: theme.colors.textSecondary }]}>
                    0 streak • 0/1 today
                  </Text>
                </View>
                <View style={[styles.previewCheck, { borderColor: theme.colors.border }]} />
              </LinearGradient>
            </View>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: getSelectedColorValue(),
              shadowColor: getSelectedColorValue(),
            }
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <ArrowRight color="#FFF" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Reduced from 100
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
  backButton: {
    padding: 8,
  },
  backText: {
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
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
    opacity: 0.7,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 48 - 24) / 3, // 3 columns
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 8,
  },
  selectedCategoryCard: {
    backgroundColor: '#FFF',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 6, // Reduced from 8
    textAlign: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  colorOption: {
    padding: 4,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewCard: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 24,
    backgroundColor: '#FFF',
  },
  previewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  previewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  previewIcon: {
    fontSize: 24,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  previewCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    opacity: 0.3,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default AddHabitStep2Screen;
