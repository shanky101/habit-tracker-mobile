import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Share,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/theme';
import { useTemplates } from '@/contexts/TemplateContext';
import { useHabits, Habit } from '@/hooks/useHabits';
import { HabitTemplate } from '@/types/HabitTemplate';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { Search, X, Copy, Plus } from 'lucide-react-native';

type TemplatesNavigationProp = StackNavigationProp<any, 'Templates'>;

const TemplatesScreen: React.FC = () => {
  const navigation = useNavigation<TemplatesNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { templates, deleteTemplate, exportTemplate, importTemplate } = useTemplates();
  const { addHabit } = useHabits();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { id: 'all', label: 'All', emoji: '📋' },
    { id: 'default', label: 'Built-in', emoji: '⭐' },
    { id: 'custom', label: 'My Templates', emoji: '🎨' },
    { id: 'fitness', label: 'Fitness', emoji: '💪' },
    { id: 'wellness', label: 'Wellness', emoji: '🧘' },
    { id: 'productivity', label: 'Productivity', emoji: '🚀' },
  ];

  const getFilteredTemplates = () => {
    let filtered = templates;

    // Filter by category
    if (selectedFilter === 'default') {
      filtered = filtered.filter(t => t.isDefault);
    } else if (selectedFilter === 'custom') {
      filtered = filtered.filter(t => !t.isDefault);
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter(t => t.tags.includes(selectedFilter));
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const handleUseTemplate = async (template: HabitTemplate) => {
    Alert.alert(
      `Use "${template.name}"?`,
      `This will create ${template.habits.length} new habit${template.habits.length > 1 ? 's' : ''} from this template.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Habits',
          onPress: async () => {
            try {
              // Create habits from template
              for (const habitConfig of template.habits) {
                const newHabit: Habit = {
                  id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: habitConfig.name,
                  emoji: habitConfig.emoji,
                  category: habitConfig.category,
                  color: template.color,
                  frequency: habitConfig.frequency,
                  frequencyType: habitConfig.frequencyType,
                  targetCompletionsPerDay: habitConfig.targetCompletionsPerDay,
                  selectedDays: habitConfig.selectedDays,
                  reminderEnabled: habitConfig.reminderEnabled,
                  reminderTime: habitConfig.reminderTime,
                  notes: habitConfig.notes,
                  streak: 0,
                  completions: {},
                };

                await addHabit(newHabit);
              }

              Alert.alert(
                'Success! 🎉',
                `Created ${template.habits.length} habits from "${template.name}". Check them out on the Home screen!`,
                [
                  { text: 'Stay Here' },
                  { text: 'Go to Home', onPress: () => navigation.navigate('Home') },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to create habits from template');
            }
          },
        },
      ]
    );
  };

  const handleShareTemplate = async (template: HabitTemplate) => {
    const json = exportTemplate(template.id);
    if (!json) return;

    try {
      await Share.share({
        message: `Check out this habit template: "${template.name}"\n\n${json}`,
        title: `Share ${template.name}`,
      });
    } catch (error) {
      console.error('Error sharing template:', error);
    }
  };

  const handleCopyTemplate = async (template: HabitTemplate) => {
    const json = exportTemplate(template.id);
    if (!json) return;

    await Clipboard.setStringAsync(json);
    Alert.alert('Copied! 📋', 'Template JSON copied to clipboard');
  };

  const handleDeleteTemplate = (template: HabitTemplate) => {
    if (template.isDefault) {
      Alert.alert('Cannot Delete', 'Built-in templates cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Template?',
      `Are you sure you want to delete "${template.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTemplate(template.id);
              Alert.alert('Deleted', 'Template removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete template');
            }
          },
        },
      ]
    );
  };

  const handleImportTemplate = async () => {
    if (!importText.trim()) {
      Alert.alert('Error', 'Please paste a template JSON');
      return;
    }

    const success = await importTemplate(importText.trim());
    if (success) {
      setShowImportModal(false);
      setImportText('');
      Alert.alert('Success! 🎉', 'Template imported successfully');
    } else {
      Alert.alert('Error', 'Invalid template format. Please check the JSON and try again.');
    }
  };

  const handlePasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    setImportText(text);
  };

  const handleViewTemplate = (template: HabitTemplate) => {
    navigation.navigate('TemplateDetail', { templateId: template.id });
  };

  const renderTemplateCard = (template: HabitTemplate) => (
    <TouchableOpacity
      key={template.id}
      style={[
        styles.templateCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => handleViewTemplate(template)}
      activeOpacity={0.95}
    >
      <View style={styles.templateHeader}>
        <View style={styles.templateIcon}>
          <Text style={styles.templateEmoji}>{template.emoji}</Text>
        </View>
        <View style={styles.templateInfo}>
          <View style={styles.templateTitleRow}>
            <Text
              style={[
                styles.templateName,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSizeLG,
                },
              ]}
            >
              {template.name}
            </Text>
            {template.isDefault && (
              <View
                style={[
                  styles.defaultBadge,
                  { backgroundColor: theme.colors.primary + '20' }
                ]}
              >
                <Text
                  style={[
                    styles.defaultBadgeText,
                    { color: theme.colors.primary }
                  ]}
                >
                  ⭐ Built-in
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.templateDescription,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeSM,
              },
            ]}
            numberOfLines={2}
          >
            {template.description}
          </Text>
          <View style={styles.templateMeta}>
            <Text
              style={[
                styles.templateMetaText,
                { color: theme.colors.textSecondary }
              ]}
            >
              {template.habits.length} habit{template.habits.length > 1 ? 's' : ''}
            </Text>
            <View style={styles.templateTags}>
              {template.tags.slice(0, 2).map(tag => (
                <View
                  key={tag}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.colors.backgroundSecondary }
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: theme.colors.textSecondary }
                    ]}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.templateActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.viewButton,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border
            }
          ]}
          onPress={(e) => {
            e.stopPropagation();
            handleViewTemplate(template);
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBodySemibold,
              }
            ]}
          >
            View
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.useButton,
            { backgroundColor: theme.colors.primary }
          ]}
          onPress={(e) => {
            e.stopPropagation();
            handleUseTemplate(template);
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: theme.colors.white,
                fontFamily: theme.typography.fontFamilyBodySemibold,
              }
            ]}
          >
            Use
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const filteredTemplates = getFilteredTemplates();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplayBold,
              fontSize: theme.typography.fontSize2XL,
            },
          ]}
        >
          Templates
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
              }
            ]}
            onPress={() => setShowImportModal(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.headerButtonText, { color: theme.colors.text }]}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => navigation.navigate('CreateTemplate', { mode: 'create' })}
            activeOpacity={0.8}
          >
            <Text style={[styles.headerButtonText, { color: theme.colors.white }]}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }
          ]}
        >
          <Search size={20} color={theme.colors.textSecondary} strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyBody,
              }
            ]}
            placeholder="Search templates..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
        showsHorizontalScrollIndicator={false}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive,
              {
                backgroundColor:
                  selectedFilter === filter.id
                    ? theme.colors.primary
                    : theme.colors.surface,
                borderColor:
                  selectedFilter === filter.id
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
            onPress={() => setSelectedFilter(filter.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterEmoji}>{filter.emoji}</Text>
            <Text
              style={[
                styles.filterLabel,
                {
                  color:
                    selectedFilter === filter.id
                      ? theme.colors.white
                      : theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBodySemibold,
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Templates List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {filteredTemplates.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamilyBody,
                  }
                ]}
              >
                No templates found
              </Text>
            </View>
          ) : (
            filteredTemplates.map(template => renderTemplateCard(template))
          )}
        </Animated.View>
      </ScrollView>

      {/* Import Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamilyDisplayBold,
                  }
                ]}
              >
                Import Template
              </Text>
              <TouchableOpacity
                onPress={() => setShowImportModal(false)}
                activeOpacity={0.7}
                style={styles.modalCloseButton}
              >
                <X size={24} color={theme.colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.modalDescription,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                }
              ]}
            >
              Paste the template JSON below to import it
            </Text>

            <TextInput
              style={[
                styles.importInput,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }
              ]}
              placeholder="Paste template JSON here..."
              placeholderTextColor={theme.colors.textSecondary}
              value={importText}
              onChangeText={setImportText}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonSecondary,
                  { backgroundColor: theme.colors.surface }
                ]}
                onPress={handlePasteFromClipboard}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: theme.colors.text }
                  ]}
                >
                  Paste from Clipboard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  { backgroundColor: theme.colors.primary }
                ]}
                onPress={handleImportTemplate}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: theme.colors.white }
                  ]}
                >
                  Import
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {},
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersScroll: {
    maxHeight: 50,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipActive: {},
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  templateCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  templateEmoji: {
    fontSize: 32,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  templateName: {},
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  templateDescription: {
    marginBottom: 8,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templateMetaText: {
    fontSize: 12,
  },
  templateTags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
  },
  templateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButton: {
    borderWidth: 1,
  },
  useButton: {},
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  importInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 16,
    minHeight: 200,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonSecondary: {},
  modalButtonPrimary: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TemplatesScreen;
