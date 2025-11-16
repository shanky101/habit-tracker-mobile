import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';

type AddHabitStep2ScreenNavigationProp = StackNavigationProp<any, 'AddHabitStep2'>;
type AddHabitStep2ScreenRouteProp = RouteProp<{ AddHabitStep2: { habitName: string } }, 'AddHabitStep2'>;

export const CATEGORIES = [
  { id: 'health', label: 'Health', icon: '❤️', gradient: ['#FF6B6B', '#EE5A6F'] },
  { id: 'fitness', label: 'Fitness', icon: '💪', gradient: ['#4ECDC4', '#44A08D'] },
  { id: 'productivity', label: 'Productivity', icon: '✅', gradient: ['#A8E6CF', '#3DDC97'] },
  { id: 'mindfulness', label: 'Mindfulness', icon: '🧘', gradient: ['#B4A7D6', '#8E7CC3'] },
  { id: 'learning', label: 'Learning', icon: '📚', gradient: ['#FFD93D', '#F6C23E'] },
  { id: 'social', label: 'Social', icon: '👥', gradient: ['#95E1D3', '#38E4AE'] },
  { id: 'finance', label: 'Finance', icon: '💰', gradient: ['#F38181', '#AA4465'] },
  { id: 'creativity', label: 'Creativity', icon: '🎨', gradient: ['#FDA7DF', '#B565D8'] },
  { id: 'other', label: 'Other', icon: '⭐', gradient: ['#FEC8D8', '#957DAD'] },
];

export const COLORS = [
  { id: 'red', value: '#EF4444', name: 'Red' },
  { id: 'orange', value: '#F97316', name: 'Orange' },
  { id: 'yellow', value: '#EAB308', name: 'Yellow' },
  { id: 'green', value: '#22C55E', name: 'Green' },
  { id: 'teal', value: '#14B8A6', name: 'Teal' },
  { id: 'blue', value: '#3B82F6', name: 'Blue' },
  { id: 'indigo', value: '#6366F1', name: 'Indigo' },
  { id: 'purple', value: '#A855F7', name: 'Purple' },
];

const AddHabitStep2Screen: React.FC = () => {
  const navigation = useNavigation<AddHabitStep2ScreenNavigationProp>();
  const route = useRoute<AddHabitStep2ScreenRouteProp>();
  const { theme } = useTheme();

  const { habitName } = route.params;

  const [selectedCategory, setSelectedCategory] = useState('other');
  const [selectedColor, setSelectedColor] = useState('blue');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);

    // Auto-scroll to color section after a short delay
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 400,
        animated: true,
      });
    }, 300);
  };

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);

    // Auto-scroll to preview section
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 650,
        animated: true,
      });
    }, 300);
  };

  const handleNext = () => {
    navigation.navigate('AddHabitStep3', {
      habitName,
      category: selectedCategory,
      color: selectedColor,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getSelectedColor = () => {
    return COLORS.find((c) => c.id === selectedColor)?.value || '#3B82F6';
  };

  const getSelectedCategoryIcon = () => {
    return CATEGORIES.find((c) => c.id === selectedCategory)?.icon || '⭐';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        ref={scrollViewRef}
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
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                ← Back
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
                    width: '66%',
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
              Step 2 of 3
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
            Personalize
          </Text>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSizeLG,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              Pick a vibe ✨
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: isSelected ? category.gradient[0] + '30' : theme.colors.backgroundSecondary,
                        borderColor: isSelected ? category.gradient[0] : theme.colors.border,
                        borderWidth: isSelected ? 2.5 : 1,
                      },
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryContent}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text
                        style={[
                          styles.categoryLabel,
                          {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamilyBody,
                            fontSize: theme.typography.fontSizeXS,
                            fontWeight: isSelected ? theme.typography.fontWeightBold : theme.typography.fontWeightMedium,
                          },
                        ]}
                      >
                        {category.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: category.gradient[0] }]}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Color Picker */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSizeLG,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              Choose your color 🎨
            </Text>
            <View style={styles.colorPalette}>
              {COLORS.map((color) => {
                const isSelected = selectedColor === color.id;
                return (
                  <TouchableOpacity
                    key={color.id}
                    style={styles.colorOption}
                    onPress={() => handleColorSelect(color.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: color.value,
                          transform: [{ scale: isSelected ? 1.1 : 1 }],
                          borderWidth: isSelected ? 3 : 0,
                          borderColor: theme.colors.background,
                        },
                      ]}
                    >
                      {isSelected && <Text style={styles.colorCheck}>✓</Text>}
                    </View>
                    <Text
                      style={[
                        styles.colorName,
                        {
                          color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeXS,
                          fontWeight: isSelected ? theme.typography.fontWeightBold : theme.typography.fontWeightMedium,
                        },
                      ]}
                    >
                      {color.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.previewSection}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSizeLG,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              How it looks 👀
            </Text>
            <View
              style={[
                styles.previewCard,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                  borderLeftColor: getSelectedColor(),
                },
              ]}
            >
              <View style={styles.previewContent}>
                <Text style={styles.previewIcon}>{getSelectedCategoryIcon()}</Text>
                <View style={styles.previewDetails}>
                  <Text
                    style={[
                      styles.previewName,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeLG,
                        fontWeight: theme.typography.fontWeightSemibold,
                      },
                    ]}
                  >
                    {habitName}
                  </Text>
                  <View style={styles.previewMeta}>
                    <View
                      style={[
                        styles.categoryBadge,
                        {
                          backgroundColor: `${getSelectedColor()}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryBadgeText,
                          {
                            color: getSelectedColor(),
                            fontFamily: theme.typography.fontFamilyBody,
                            fontSize: theme.typography.fontSizeXS,
                            fontWeight: theme.typography.fontWeightSemibold,
                          },
                        ]}
                      >
                        {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.shadows.shadowMD.shadowColor,
                shadowOffset: theme.shadows.shadowMD.shadowOffset,
                shadowOpacity: theme.shadows.shadowMD.shadowOpacity,
                shadowRadius: theme.shadows.shadowMD.shadowRadius,
                elevation: theme.shadows.shadowMD.elevation,
              },
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.nextButtonText,
                {
                  color: theme.colors.white,
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
    </View>
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
    justifyContent: 'flex-start',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryCard: {
    width: '31%',
    margin: 5,
    borderRadius: 16,
    padding: 12,
    minHeight: 90,
    position: 'relative',
  },
  categoryContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  categoryLabel: {
    textAlign: 'center',
    fontSize: 11,
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  colorCheck: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  colorName: {
    textAlign: 'center',
  },
  previewSection: {
    marginBottom: 32,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 5,
    padding: 18,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  previewDetails: {
    flex: 1,
  },
  previewName: {
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  categoryBadgeText: {
    fontWeight: '600',
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

export default AddHabitStep2Screen;
