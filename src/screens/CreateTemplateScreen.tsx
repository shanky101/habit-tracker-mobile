import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import { useTemplates } from '@/contexts/TemplateContext';
import { HabitTemplate, HabitTemplateConfig, TemplateUtils } from '@/types/HabitTemplate';
import { ArrowLeft, FileText, X, Minus, Plus } from 'lucide-react-native';

type CreateTemplateRouteProp = RouteProp<any, 'CreateTemplate'>;
type NavigationProp = NativeStackNavigationProp<any>;

const EMOJI_LIST = [
  '🎯', '⭐', '💪', '🏃', '🧘', '📚', '✍️', '💡', '🎨', '🎵',
  '🌟', '✨', '🔥', '💫', '🌈', '🎪', '🎭', '🎬', '🎮', '🎲',
  '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '📝', '📊', '📈', '💼',
  '💰', '💳', '💸', '🔔', '⏰', '⏱️', '📅', '📆', '🗓️', '📌',
  '🍎', '🥗', '🥤', '💧', '🏋️', '🤸', '🏃', '🚴', '🏊', '⚽',
  '🧠', '💭', '🎓', '📖', '🖊️', '✏️', '📐', '📏', '🔬', '🔭',
  '🎸', '🎹', '🎤', '🎧', '🎼', '🎶', '🎵', '🪕', '🥁', '🎺',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💖',
  '🌱', '🌿', '🍃', '🌾', '🌵', '🌳', '🌲', '🌴', '🎋', '🎍',
  '🌺', '🌸', '🌼', '🌻', '🌷', '🌹', '🥀', '🏵️', '💐', '🌾',
];

const HABIT_EMOJI_LIST = [
  '💪', '🏃', '🧘', '📚', '✍️', '💡', '🎨', '🎵', '🍎', '💧',
  '😴', '🚶', '🏊', '🚴', '🏋️', '🧗', '⛹️', '🤸', '🧘', '🧘',
];

const MAX_HABITS = 25;
const MAX_NOTES_LENGTH = 500;

const CreateTemplateScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateTemplateRouteProp>();
  const { mode, templateId } = route.params || { mode: 'create' };

  const { addTemplate, updateTemplate, getTemplateById } = useTemplates();

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateNotes, setTemplateNotes] = useState('');
  const [templateEmoji, setTemplateEmoji] = useState('🎯');
  const [templateTags, setTemplateTags] = useState('');
  const [habits, setHabits] = useState<HabitTemplateConfig[]>([]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabitIndex, setEditingHabitIndex] = useState<number | null>(null);

  useEffect(() => {
    if (mode === 'edit' || mode === 'copy') {
      const template = getTemplateById(templateId);
      if (template) {
        setTemplateName(mode === 'copy' ? `${template.name} (Copy)` : template.name);
        setTemplateDescription(template.description);
        setTemplateNotes(template.notes || '');
        setTemplateEmoji(template.emoji);
        setTemplateTags(template.tags.join(', '));
        setHabits(template.habits);
      }
    }
  }, [mode, templateId]);

  const handleSave = async () => {
    if (!templateName.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    if (!templateDescription.trim()) {
      Alert.alert('Error', 'Please enter a template description');
      return;
    }

    if (habits.length === 0) {
      Alert.alert('Error', 'Please add at least one habit to the template');
      return;
    }

    if (templateNotes.length > MAX_NOTES_LENGTH) {
      Alert.alert('Error', `Notes must be ${MAX_NOTES_LENGTH} characters or less`);
      return;
    }

    const tags = templateTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (mode === 'edit' && templateId) {
      await updateTemplate(templateId, {
        name: templateName,
        description: templateDescription,
        notes: templateNotes,
        emoji: templateEmoji,
        tags,
        habits,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Success! ✨', 'Template updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      const newTemplate: HabitTemplate = {
        id: TemplateUtils.generateId(),
        version: '1.0',
        name: templateName,
        description: templateDescription,
        notes: templateNotes,
        emoji: templateEmoji,
        color: theme.colors.primary,
        tags,
        habits,
        isDefault: false,
        createdAt: new Date().toISOString(),
      };

      await addTemplate(newTemplate);

      Alert.alert(
        'Success! 🎉',
        `Template created with ${habits.length} habit${habits.length > 1 ? 's' : ''}!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleAddHabit = () => {
    if (habits.length >= MAX_HABITS) {
      Alert.alert('Limit Reached', `You can add a maximum of ${MAX_HABITS} habits per template.`);
      return;
    }
    setEditingHabitIndex(null);
    setShowHabitModal(true);
  };

  const handleEditHabit = (index: number) => {
    setEditingHabitIndex(index);
    setShowHabitModal(true);
  };

  const handleDeleteHabit = (index: number) => {
    Alert.alert(
      'Delete Habit?',
      'Are you sure you want to remove this habit from the template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newHabits = habits.filter((_, i) => i !== index);
            setHabits(newHabits);
          },
        },
      ]
    );
  };

  const handleSaveHabit = (habit: HabitTemplateConfig) => {
    if (editingHabitIndex !== null) {
      const newHabits = [...habits];
      newHabits[editingHabitIndex] = habit;
      setHabits(newHabits);
    } else {
      setHabits([...habits, habit]);
    }
    setShowHabitModal(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setTemplateEmoji(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {mode === 'edit' ? 'Edit Template' : mode === 'copy' ? 'Copy Template' : 'Create Template'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Emoji Selector */}
        <View style={styles.emojiSection}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Template Icon</Text>
          <TouchableOpacity
            style={[styles.emojiButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowEmojiPicker(true)}
          >
            <Text style={styles.selectedEmoji}>{templateEmoji}</Text>
            <Text style={[styles.emojiButtonText, { color: theme.colors.textSecondary }]}>
              Tap to change
            </Text>
          </TouchableOpacity>
        </View>

        {/* Template Name */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Template Name *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="e.g., Morning Power Routine"
            placeholderTextColor={theme.colors.textSecondary}
            value={templateName}
            onChangeText={setTemplateName}
          />
        </View>

        {/* Template Description */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description *</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Describe what this template helps with..."
            placeholderTextColor={theme.colors.textSecondary}
            value={templateDescription}
            onChangeText={setTemplateDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Template Notes */}
        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Notes (Optional)</Text>
            <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
              {templateNotes.length}/{MAX_NOTES_LENGTH}
            </Text>
          </View>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Add instructions or tips for using this template..."
            placeholderTextColor={theme.colors.textSecondary}
            value={templateNotes}
            onChangeText={(text) => {
              if (text.length <= MAX_NOTES_LENGTH) {
                setTemplateNotes(text);
              }
            }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={MAX_NOTES_LENGTH}
          />
        </View>

        {/* Tags */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Tags</Text>
          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            Separate tags with commas (e.g., fitness, morning, health)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="fitness, morning, health"
            placeholderTextColor={theme.colors.textSecondary}
            value={templateTags}
            onChangeText={setTemplateTags}
          />
        </View>

        {/* Habits Section */}
        <View style={styles.habitsSection}>
          <View style={styles.habitsSectionHeader}>
            <View>
              <Text style={[styles.habitsTitle, { color: theme.colors.text }]}>
                Habits ({habits.length}/{MAX_HABITS})
              </Text>
              <Text style={[styles.habitsSubtitle, { color: theme.colors.textSecondary }]}>
                Add habits to this template
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addHabitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddHabit}
              disabled={habits.length >= MAX_HABITS}
              activeOpacity={0.8}
            >
              <Text style={styles.addHabitButtonText}>+ Add Habit</Text>
            </TouchableOpacity>
          </View>

          {habits.length === 0 ? (
            <View style={[styles.emptyHabits, { backgroundColor: theme.colors.surface }]}>
              <FileText size={48} color={theme.colors.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.emptyHabitsText, { color: theme.colors.textSecondary }]}>
                No habits yet. Tap "Add Habit" to get started!
              </Text>
            </View>
          ) : (
            habits.map((habit, index) => (
              <View
                key={index}
                style={[styles.habitItem, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.habitItemContent}>
                  <Text style={styles.habitItemEmoji}>{habit.emoji}</Text>
                  <View style={styles.habitItemInfo}>
                    <Text style={[styles.habitItemName, { color: theme.colors.text }]}>
                      {habit.name}
                    </Text>
                    <Text style={[styles.habitItemMeta, { color: theme.colors.textSecondary }]}>
                      {habit.category} · {habit.frequency}
                      {habit.frequencyType === 'multiple' && ` · ${habit.targetCompletionsPerDay}x/day`}
                    </Text>
                  </View>
                </View>
                <View style={styles.habitItemActions}>
                  <TouchableOpacity
                    style={[styles.habitActionButton, { backgroundColor: theme.colors.backgroundSecondary }]}
                    onPress={() => handleEditHabit(index)}
                  >
                    <Text style={styles.habitActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.habitActionButton, { backgroundColor: theme.colors.backgroundSecondary }]}
                    onPress={() => handleDeleteHabit(index)}
                  >
                    <Text style={[styles.habitActionText, { color: '#ff4444' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {mode === 'edit' ? 'Save Changes' : 'Create Template'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.emojiPickerModal, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Choose an Icon</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <X size={24} color={theme.colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={EMOJI_LIST}
              numColumns={5}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.emojiItem,
                    item === templateEmoji && {
                      backgroundColor: theme.colors.primary + '30',
                    },
                  ]}
                  onPress={() => handleEmojiSelect(item)}
                >
                  <Text style={styles.emojiItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.emojiGrid}
            />
          </View>
        </View>
      </Modal>

      {/* Habit Modal */}
      {showHabitModal && (
        <HabitModal
          visible={showHabitModal}
          onClose={() => setShowHabitModal(false)}
          onSave={handleSaveHabit}
          initialHabit={editingHabitIndex !== null ? habits[editingHabitIndex] : undefined}
          theme={theme}
        />
      )}
    </SafeAreaView>
  );
};

// Separate Habit Modal Component
interface HabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (habit: HabitTemplateConfig) => void;
  initialHabit?: HabitTemplateConfig;
  theme: any;
}

const HabitModal: React.FC<HabitModalProps> = ({ visible, onClose, onSave, initialHabit, theme }) => {
  const [habitName, setHabitName] = useState(initialHabit?.name || '');
  const [habitEmoji, setHabitEmoji] = useState(initialHabit?.emoji || '💪');
  const [habitCategory, setHabitCategory] = useState<HabitTemplateConfig['category']>(
    initialHabit?.category || 'health'
  );
  const [habitNotes, setHabitNotes] = useState(initialHabit?.notes || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(initialHabit?.frequency || 'daily');
  const [frequencyType, setFrequencyType] = useState<'single' | 'multiple'>(
    initialHabit?.frequencyType || 'single'
  );
  const [targetCount, setTargetCount] = useState(initialHabit?.targetCompletionsPerDay || 1);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialHabit?.selectedDays || [0, 1, 2, 3, 4, 5, 6]
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const categories: HabitTemplateConfig['category'][] = [
    'health', 'fitness', 'mindfulness', 'productivity', 'learning', 'social', 'finance', 'creativity'
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleSave = () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    const habit: HabitTemplateConfig = {
      name: habitName,
      emoji: habitEmoji,
      category: habitCategory,
      notes: habitNotes,
      frequency,
      frequencyType,
      targetCompletionsPerDay: frequencyType === 'multiple' ? targetCount : 1,
      selectedDays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
      reminderEnabled: false,
      reminderTime: null,
    };

    onSave(habit);
  };

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.habitModalContent, { backgroundColor: theme.colors.background }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {initialHabit ? 'Edit Habit' : 'Add Habit'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={theme.colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Emoji */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Icon</Text>
              <TouchableOpacity
                style={[styles.emojiSelectButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Text style={styles.selectedHabitEmoji}>{habitEmoji}</Text>
              </TouchableOpacity>
              {showEmojiPicker && (
                <View style={styles.habitEmojiGrid}>
                  {HABIT_EMOJI_LIST.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.habitEmojiItem,
                        emoji === habitEmoji && { backgroundColor: theme.colors.primary + '30' }
                      ]}
                      onPress={() => {
                        setHabitEmoji(emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      <Text style={styles.habitEmojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Name */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Habit Name *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                placeholder="e.g., Morning Run"
                placeholderTextColor={theme.colors.textSecondary}
                value={habitName}
                onChangeText={setHabitName}
              />
            </View>

            {/* Category */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: habitCategory === cat ? theme.colors.primary : theme.colors.surface }
                    ]}
                    onPress={() => setHabitCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      { color: habitCategory === cat ? '#fff' : theme.colors.text }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Frequency */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Frequency</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { backgroundColor: frequency === 'daily' ? theme.colors.primary : theme.colors.surface }
                  ]}
                  onPress={() => setFrequency('daily')}
                >
                  <Text style={[styles.optionButtonText, { color: frequency === 'daily' ? '#fff' : theme.colors.text }]}>
                    Daily
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { backgroundColor: frequency === 'weekly' ? theme.colors.primary : theme.colors.surface }
                  ]}
                  onPress={() => setFrequency('weekly')}
                >
                  <Text style={[styles.optionButtonText, { color: frequency === 'weekly' ? '#fff' : theme.colors.text }]}>
                    Specific Days
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Days Selection */}
            {frequency === 'weekly' && (
              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Select Days</Text>
                <View style={styles.daysRow}>
                  {days.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: selectedDays.includes(index)
                            ? theme.colors.primary
                            : theme.colors.surface
                        }
                      ]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        { color: selectedDays.includes(index) ? '#fff' : theme.colors.text }
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Frequency Type */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Times per Day</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { backgroundColor: frequencyType === 'single' ? theme.colors.primary : theme.colors.surface }
                  ]}
                  onPress={() => setFrequencyType('single')}
                >
                  <Text style={[styles.optionButtonText, { color: frequencyType === 'single' ? '#fff' : theme.colors.text }]}>
                    Once
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { backgroundColor: frequencyType === 'multiple' ? theme.colors.primary : theme.colors.surface }
                  ]}
                  onPress={() => setFrequencyType('multiple')}
                >
                  <Text style={[styles.optionButtonText, { color: frequencyType === 'multiple' ? '#fff' : theme.colors.text }]}>
                    Multiple
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Target Count */}
            {frequencyType === 'multiple' && (
              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Target per Day</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: theme.colors.surface }]}
                    onPress={() => setTargetCount(Math.max(2, targetCount - 1))}
                  >
                    <Minus size={20} color={theme.colors.text} strokeWidth={2} />
                  </TouchableOpacity>
                  <Text style={[styles.counterValue, { color: theme.colors.text }]}>{targetCount}x</Text>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: theme.colors.surface }]}
                    onPress={() => setTargetCount(Math.min(20, targetCount + 1))}
                  >
                    <Plus size={20} color={theme.colors.text} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Notes */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Notes (Optional)</Text>
              <TextInput
                style={[styles.modalTextArea, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                placeholder="Add notes about this habit..."
                placeholderTextColor={theme.colors.textSecondary}
                value={habitNotes}
                onChangeText={setHabitNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton, { backgroundColor: theme.colors.surface }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Save Habit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emojiSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  emojiButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 8,
  },
  selectedEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  emojiButtonText: {
    fontSize: 12,
  },
  formGroup: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
  },
  hint: {
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  habitsSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  habitsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  habitsSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addHabitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addHabitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHabits: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyHabitsEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyHabitsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  habitItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  habitItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitItemEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  habitItemInfo: {
    flex: 1,
  },
  habitItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  habitItemMeta: {
    fontSize: 12,
  },
  habitItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  habitActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  habitActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  emojiPickerModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  habitModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalClose: {
    fontSize: 28,
  },
  emojiGrid: {
    paddingHorizontal: 10,
  },
  emojiItem: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    borderRadius: 12,
  },
  emojiItemText: {
    fontSize: 32,
  },
  modalSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  emojiSelectButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedHabitEmoji: {
    fontSize: 32,
  },
  habitEmojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  habitEmojiItem: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitEmojiText: {
    fontSize: 24,
  },
  modalInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalTextArea: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {},
  modalSaveButton: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateTemplateScreen;
