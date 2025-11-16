import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2; // 2 columns with padding and gap

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  frequency: 'daily' | 'weekly';
  usageCount: string;
  benefits: string[];
  tips: string[];
}

const POPULAR_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Morning Meditation',
    description: 'Start your day with 10 minutes of calm',
    icon: '🧘',
    category: 'mindfulness',
    frequency: 'daily',
    usageCount: '15.2K',
    benefits: ['Reduces stress', 'Improves focus', 'Better mood'],
    tips: ['Find a quiet space', 'Use a meditation app', 'Start with 5 minutes'],
  },
  {
    id: '2',
    name: 'Drink Water',
    description: 'Drink 8 glasses of water daily',
    icon: '💧',
    category: 'health',
    frequency: 'daily',
    usageCount: '24.5K',
    benefits: ['Stay hydrated', 'Better skin', 'More energy'],
    tips: ['Carry a water bottle', 'Set hourly reminders', 'Track your intake'],
  },
  {
    id: '3',
    name: 'Read Books',
    description: 'Read 20 pages every day',
    icon: '📚',
    category: 'learning',
    frequency: 'daily',
    usageCount: '18.7K',
    benefits: ['Expand knowledge', 'Improve vocabulary', 'Reduce screen time'],
    tips: ['Read before bed', 'Always have a book ready', 'Join a book club'],
  },
  {
    id: '4',
    name: 'Exercise',
    description: 'Work out for 30 minutes',
    icon: '🏃',
    category: 'fitness',
    frequency: 'daily',
    usageCount: '32.1K',
    benefits: ['Better health', 'More energy', 'Improved mood'],
    tips: ['Schedule it', 'Start small', 'Find what you enjoy'],
  },
  {
    id: '5',
    name: 'Journal',
    description: 'Write for 5 minutes daily',
    icon: '📝',
    category: 'mindfulness',
    frequency: 'daily',
    usageCount: '12.3K',
    benefits: ['Process emotions', 'Track progress', 'Self-reflection'],
    tips: ['Write freely', 'No judgment', 'Keep it private'],
  },
  {
    id: '6',
    name: 'Take Vitamins',
    description: 'Take daily supplements',
    icon: '💊',
    category: 'health',
    frequency: 'daily',
    usageCount: '9.8K',
    benefits: ['Fill nutrition gaps', 'Support immunity', 'Better health'],
    tips: ['Take with food', 'Set a reminder', 'Consult your doctor'],
  },
  {
    id: '7',
    name: 'Practice Gratitude',
    description: 'List 3 things you\'re grateful for',
    icon: '🙏',
    category: 'mindfulness',
    frequency: 'daily',
    usageCount: '14.6K',
    benefits: ['Positive mindset', 'Better mood', 'Improved relationships'],
    tips: ['Do it in the morning', 'Be specific', 'Feel the gratitude'],
  },
  {
    id: '8',
    name: 'No Phone Before Bed',
    description: 'No screens 1 hour before sleep',
    icon: '📵',
    category: 'health',
    frequency: 'daily',
    usageCount: '11.2K',
    benefits: ['Better sleep', 'Reduced eye strain', 'More relaxed'],
    tips: ['Read instead', 'Charge phone away from bed', 'Use night mode'],
  },
  {
    id: '9',
    name: 'Learn Something New',
    description: 'Study a new skill for 15 minutes',
    icon: '🎓',
    category: 'learning',
    frequency: 'daily',
    usageCount: '8.9K',
    benefits: ['Personal growth', 'Stay curious', 'Career advancement'],
    tips: ['Use online courses', 'Stay consistent', 'Track your progress'],
  },
  {
    id: '10',
    name: 'Clean for 15 Minutes',
    description: 'Tidy up your space daily',
    icon: '🧹',
    category: 'productivity',
    frequency: 'daily',
    usageCount: '7.5K',
    benefits: ['Organized space', 'Reduced stress', 'Productive environment'],
    tips: ['Set a timer', 'Focus on one area', 'Make it a routine'],
  },
];

const CATEGORIES = [
  'all',
  'popular',
  'health',
  'fitness',
  'productivity',
  'mindfulness',
  'learning',
];

const HabitTemplatesScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const getFilteredTemplates = () => {
    let filtered = POPULAR_TEMPLATES;

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'popular') {
        // Show top 6 most used
        filtered = [...filtered].sort((a, b) => {
          const aCount = parseFloat(a.usageCount);
          const bCount = parseFloat(b.usageCount);
          return bCount - aCount;
        }).slice(0, 6);
      } else {
        filtered = filtered.filter((t) => t.category === selectedCategory);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTemplates = getFilteredTemplates();

  const handleAddTemplate = (template: Template) => {
    // Navigate to AddHabitStep2 with pre-filled data
    navigation.navigate('AddHabitStep2', {
      habitName: template.name,
    });
    setSelectedTemplate(null);
  };

  const renderTemplateDetailModal = () => {
    if (!selectedTemplate) return null;

    return (
      <Modal
        visible={selectedTemplate !== null}
        transparent
        animationType="none"
        onRequestClose={() => setSelectedTemplate(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedTemplate(null)}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
            {/* Modal Handle */}
            <View
              style={[styles.modalHandle, { backgroundColor: theme.colors.border }]}
            />

            {/* Template Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>{selectedTemplate.icon}</Text>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplay,
                    fontSize: theme.typography.fontSizeXL,
                    fontWeight: theme.typography.fontWeightBold,
                  },
                ]}
              >
                {selectedTemplate.name}
              </Text>
              <Text
                style={[
                  styles.modalDescription,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                {selectedTemplate.description}
              </Text>
              <Text
                style={[
                  styles.modalUsage,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeSM,
                  },
                ]}
              >
                {selectedTemplate.usageCount} people use this habit
              </Text>
            </View>

            {/* Benefits */}
            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                    fontWeight: theme.typography.fontWeightSemibold,
                  },
                ]}
              >
                Benefits
              </Text>
              {selectedTemplate.benefits.map((benefit, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listBullet}>•</Text>
                  <Text
                    style={[
                      styles.listText,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>

            {/* Tips */}
            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                    fontWeight: theme.typography.fontWeightSemibold,
                  },
                ]}
              >
                Tips for Success
              </Text>
              {selectedTemplate.tips.map((tip, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listBullet}>✓</Text>
                  <Text
                    style={[
                      styles.listText,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>

            {/* Add Button */}
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => handleAddTemplate(selectedTemplate)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.addButtonText,
                  {
                    color: theme.colors.white,
                    fontFamily: theme.typography.fontFamilyBody,
                    fontSize: theme.typography.fontSizeMD,
                    fontWeight: theme.typography.fontWeightSemibold,
                  },
                ]}
              >
                Add This Habit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplay,
                fontSize: theme.typography.fontSizeXL,
                fontWeight: theme.typography.fontWeightBold,
              },
            ]}
          >
            Habit Templates
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeSM,
              },
            ]}
          >
            Start with proven habits
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              color: theme.colors.text,
              borderColor: theme.colors.border,
              fontFamily: theme.typography.fontFamilyBody,
              fontSize: theme.typography.fontSizeMD,
            },
          ]}
          placeholder="Search templates..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              {
                backgroundColor:
                  selectedCategory === category
                    ? theme.colors.primary
                    : theme.colors.backgroundSecondary,
                borderColor:
                  selectedCategory === category
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    selectedCategory === category
                      ? theme.colors.white
                      : theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeSM,
                  fontWeight:
                    selectedCategory === category
                      ? theme.typography.fontWeightSemibold
                      : theme.typography.fontWeightMedium,
                },
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Templates Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTemplates.length > 0 ? (
          <View style={styles.templatesGrid}>
            {filteredTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  {
                    width: CARD_WIDTH,
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                    shadowColor: theme.shadows.shadowSM.shadowColor,
                    shadowOffset: theme.shadows.shadowSM.shadowOffset,
                    shadowOpacity: theme.shadows.shadowSM.shadowOpacity,
                    shadowRadius: theme.shadows.shadowSM.shadowRadius,
                    elevation: theme.shadows.shadowSM.elevation,
                  },
                ]}
                onPress={() => setSelectedTemplate(template)}
                activeOpacity={0.7}
              >
                <Text style={styles.templateIcon}>{template.icon}</Text>
                <Text
                  style={[
                    styles.templateName,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeMD,
                      fontWeight: theme.typography.fontWeightSemibold,
                    },
                  ]}
                >
                  {template.name}
                </Text>
                <Text
                  style={[
                    styles.templateDescription,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {template.description}
                </Text>
                <View
                  style={[
                    styles.templateBadge,
                    { backgroundColor: `${theme.colors.primary}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.templateBadgeText,
                      {
                        color: theme.colors.primary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeXS,
                      },
                    ]}
                  >
                    {template.category.toUpperCase()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.templateUsage,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  {template.usageCount} users
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplay,
                  fontSize: theme.typography.fontSizeLG,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              No Templates Found
            </Text>
            <Text
              style={[
                styles.emptyMessage,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                },
              ]}
            >
              Try different keywords or create a custom habit
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Template Detail Modal */}
      {renderTemplateDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {},
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    position: 'relative',
  },
  searchInput: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: 36,
    top: 28,
    fontSize: 20,
  },
  categoriesScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {},
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  templateCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 0,
  },
  templateIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  templateName: {
    marginBottom: 6,
  },
  templateDescription: {
    marginBottom: 12,
    lineHeight: 18,
  },
  templateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  templateBadgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  templateUsage: {},
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    maxHeight: '80%',
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    marginBottom: 8,
    textAlign: 'center',
  },
  modalUsage: {
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  listBullet: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  listText: {
    flex: 1,
    lineHeight: 20,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addButtonText: {},
});

export default HabitTemplatesScreen;
