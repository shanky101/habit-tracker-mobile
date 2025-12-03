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
import { useTemplates } from '@/contexts/TemplateContext';
import { HabitTemplate, HabitTemplateConfig } from '@/types/HabitTemplate';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2; // 2 columns with padding and gap

const CATEGORIES = [
  'all',
  'popular',
  'health',
  'fitness',
  'productivity',
  'mindfulness',
  'learning',
  'social',
  'finance',
  'creativity',
];

const HabitTemplatesScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { theme } = useTheme();
  const { templates } = useTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [selectedHabitIndex, setSelectedHabitIndex] = useState<number | null>(null);

  // Filter to only show default/built-in templates
  const defaultTemplates = templates.filter(t => t.isDefault);

  const getFilteredTemplates = () => {
    let filtered = defaultTemplates;

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'popular') {
        // Show templates with most habits (proxy for popularity)
        filtered = [...filtered].sort((a, b) => b.habits.length - a.habits.length).slice(0, 6);
      } else {
        // Filter by tags
        filtered = filtered.filter((t) => t.tags.includes(selectedCategory));
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

  const handleSelectTemplate = (template: HabitTemplate) => {
    // If template has only one habit, navigate directly
    if (template.habits.length === 1) {
      const habit = template.habits[0];
      navigation.navigate('AddHabitStep2', {
        habitName: habit.name,
      });
    } else {
      // Show template details to select which habit
      setSelectedTemplate(template);
      setSelectedHabitIndex(null);
    }
  };

  const handleAddHabitFromTemplate = (habitConfig: HabitTemplateConfig) => {
    navigation.navigate('AddHabitStep2', {
      habitName: habitConfig.name,
    });
    setSelectedTemplate(null);
    setSelectedHabitIndex(null);
  };

  const renderTemplateDetailModal = () => {
    if (!selectedTemplate) return null;

    return (
      <Modal
        visible={selectedTemplate !== null}
        transparent
        animationType="slide"
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
              <Text style={styles.modalIcon}>{selectedTemplate.emoji}</Text>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSizeXL,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
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
              {selectedTemplate.notes && (
                <Text
                  style={[
                    styles.modalNotes,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  {selectedTemplate.notes}
                </Text>
              )}
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
                {selectedTemplate.habits.length} habit{selectedTemplate.habits.length > 1 ? 's' : ''} in this template
              </Text>
            </View>

            {/* Habits List */}
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text
                  style={[
                    styles.modalSectionTitle,
                    {
                      color: theme.colors.text,
                      fontSize: theme.typography.fontSizeMD,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                    },
                  ]}
                >
                  Choose a habit to add
                </Text>
                {selectedTemplate.habits.map((habit, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.habitItem,
                      {
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderColor: selectedHabitIndex === index ? theme.colors.primary : theme.colors.border,
                        borderWidth: selectedHabitIndex === index ? 2 : 1,
                      },
                    ]}
                    onPress={() => setSelectedHabitIndex(index)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.habitItemHeader}>
                      <Text style={styles.habitItemIcon}>{habit.emoji}</Text>
                      <View style={styles.habitItemInfo}>
                        <Text
                          style={[
                            styles.habitItemName,
                            {
                              color: theme.colors.text,
                              fontFamily: theme.typography.fontFamilyBodySemibold,
                              fontSize: theme.typography.fontSizeMD,
                            },
                          ]}
                        >
                          {habit.name}
                        </Text>
                        <Text
                          style={[
                            styles.habitItemCategory,
                            {
                              color: theme.colors.textSecondary,
                              fontFamily: theme.typography.fontFamilyBody,
                              fontSize: theme.typography.fontSizeXS,
                            },
                          ]}
                        >
                          {habit.category.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    {habit.notes && (
                      <Text
                        style={[
                          styles.habitItemNotes,
                          {
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamilyBody,
                            fontSize: theme.typography.fontSizeSM,
                          },
                        ]}
                      >
                        {habit.notes}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Add Button */}
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: selectedHabitIndex !== null ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => {
                if (selectedHabitIndex !== null) {
                  handleAddHabitFromTemplate(selectedTemplate.habits[selectedHabitIndex]);
                }
              }}
              disabled={selectedHabitIndex === null}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.addButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSizeMD,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                  },
                ]}
              >
                {selectedHabitIndex !== null ? 'Add This Habit' : 'Select a habit first'}
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
                fontSize: theme.typography.fontSizeXL,
                fontFamily: theme.typography.fontFamilyDisplayBold,
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
                  fontSize: theme.typography.fontSizeSM,
                  fontFamily:
                    selectedCategory === category
                      ? theme.typography.fontFamilyBodySemibold
                      : theme.typography.fontFamilyBodyMedium,
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
                onPress={() => handleSelectTemplate(template)}
                activeOpacity={0.7}
              >
                <Text style={styles.templateIcon}>{template.emoji}</Text>
                <Text
                  style={[
                    styles.templateName,
                    {
                      color: theme.colors.text,
                      fontSize: theme.typography.fontSizeMD,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
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
                    {template.habits.length} HABIT{template.habits.length > 1 ? 'S' : ''}
                  </Text>
                </View>
                <View style={styles.templateTags}>
                  {template.tags.slice(0, 2).map((tag, index) => (
                    <View key={index}>
                      <Text
                        style={[
                          styles.templateTag,
                          {
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamilyBody,
                            fontSize: theme.typography.fontSizeXS,
                          },
                        ]}
                      >
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
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
                  fontSize: theme.typography.fontSizeLG,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
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
  templateTags: {
    flexDirection: 'row',
    gap: 6,
  },
  templateTag: {
    fontSize: 10,
  },
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
  modalNotes: {
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalUsage: {
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    marginBottom: 12,
  },
  habitItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  habitItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  habitItemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  habitItemInfo: {
    flex: 1,
  },
  habitItemName: {
    marginBottom: 2,
  },
  habitItemCategory: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  habitItemNotes: {
    marginTop: 8,
    lineHeight: 18,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addButtonText: {},
});

export default HabitTemplatesScreen;
