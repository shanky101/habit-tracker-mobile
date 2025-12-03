import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import { useTemplates } from '@/contexts/TemplateContext';
import { useHabits, Habit } from '@/contexts/HabitsContext';
import { TemplatesStackParamList } from '@/navigation/MainTabNavigator';
import { ArrowLeft, Share2, Trash2, Edit3 } from 'lucide-react-native';

type TemplateDetailRouteProp = RouteProp<TemplatesStackParamList, 'TemplateDetail'>;
type NavigationProp = NativeStackNavigationProp<TemplatesStackParamList>;

const TemplateDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TemplateDetailRouteProp>();
  const { templateId } = route.params;

  const { getTemplateById, deleteTemplate, exportTemplate } = useTemplates();
  const { addHabit } = useHabits();

  const template = getTemplateById(templateId);

  if (!template) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Template not found
        </Text>
      </View>
    );
  }

  const handleUseTemplate = async () => {
    Alert.alert(
      `Use "${template.name}"?`,
      `This will create ${template.habits.length} new habit${template.habits.length > 1 ? 's' : ''} from this template.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Habits',
          onPress: async () => {
            try {
              for (const habitConfig of template.habits) {
                const newHabit: Habit = {
                  id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: habitConfig.name,
                  emoji: habitConfig.emoji,
                  category: habitConfig.category,
                  notes: habitConfig.notes || '',
                  streak: 0,
                  color: template.color || '#007AFF',
                  frequency: habitConfig.frequency,
                  frequencyType: habitConfig.frequencyType,
                  targetCompletionsPerDay: habitConfig.targetCompletionsPerDay,
                  selectedDays: habitConfig.selectedDays,
                  reminderEnabled: habitConfig.reminderEnabled,
                  reminderTime: habitConfig.reminderTime,
                  completions: {},
                };
                await addHabit(newHabit);
                // Small delay to ensure unique IDs
                await new Promise(resolve => setTimeout(resolve, 10));
              }

              Alert.alert(
                'Success! 🎉',
                `Created ${template.habits.length} habit${template.habits.length > 1 ? 's' : ''} from "${template.name}"`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('TemplatesMain'),
                  },
                ]
              );
            } catch (error) {
              console.error('Error creating habits from template:', error);
              Alert.alert('Error', 'Failed to create habits from template');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (template.isDefault) {
      // For default templates, create a copy
      Alert.alert(
        'Make it Your Own?',
        'This is a built-in template. You can create your own version to customize it.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Create Copy',
            onPress: () => {
              navigation.navigate('CreateTemplate', {
                mode: 'copy',
                templateId: template.id
              });
            },
          },
        ]
      );
    } else {
      navigation.navigate('CreateTemplate', {
        mode: 'edit',
        templateId: template.id
      });
    }
  };

  const handleDelete = () => {
    if (template.isDefault) {
      Alert.alert('Cannot Delete', 'Built-in templates cannot be deleted.');
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
              Alert.alert('Deleted', 'Template deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete template');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
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

  const getDayAbbreviation = (dayIndex: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color={theme.colors.text} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
              onPress={handleShare}
            >
              <Share2 size={18} color={theme.colors.primary} strokeWidth={2} />
            </TouchableOpacity>
            {!template.isDefault && (
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
                onPress={handleDelete}
              >
                <Trash2 size={18} color="#ff4444" strokeWidth={2} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
              onPress={handleEdit}
            >
              <Edit3 size={18} color={theme.colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Template Info */}
        <View style={styles.templateInfo}>
          <Text style={styles.templateEmoji}>{template.emoji}</Text>
          <Text style={[styles.templateName, { color: theme.colors.text }]}>
            {template.name}
          </Text>
          {template.description && (
            <Text style={[styles.templateDescription, { color: theme.colors.textSecondary }]}>
              {template.description}
            </Text>
          )}

          <View style={styles.metaRow}>
            {template.isDefault && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                  Built-in
                </Text>
              </View>
            )}
            <Text style={[styles.habitCount, { color: theme.colors.textSecondary }]}>
              {template.habits.length} habit{template.habits.length > 1 ? 's' : ''}
            </Text>
          </View>

          {template.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {template.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: theme.colors.surface }]}
                >
                  <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Habits List */}
        <View style={styles.habitsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Habits in this template
          </Text>

          {template.habits.map((habit, index) => (
            <View
              key={index}
              style={[styles.habitCard, { backgroundColor: theme.colors.surface }]}
            >
              <View style={styles.habitHeader}>
                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: theme.colors.text }]}>
                    {habit.name}
                  </Text>
                  <Text style={[styles.habitCategory, { color: theme.colors.textSecondary }]}>
                    {habit.category}
                  </Text>
                </View>
              </View>

              {habit.notes && (
                <Text style={[styles.habitNotes, { color: theme.colors.textSecondary }]}>
                  {habit.notes}
                </Text>
              )}

              <View style={styles.habitDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Frequency:
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {habit.frequency === 'daily' ? 'Every day' : 'Specific days'}
                  </Text>
                </View>

                {habit.frequency === 'weekly' && (
                  <View style={styles.daysRow}>
                    {habit.selectedDays.map((dayIndex) => (
                      <View
                        key={dayIndex}
                        style={[styles.dayBadge, { backgroundColor: theme.colors.primary + '30' }]}
                      >
                        <Text style={[styles.dayBadgeText, { color: theme.colors.primary }]}>
                          {getDayAbbreviation(dayIndex)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {habit.frequencyType === 'multiple' && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                      Target per day:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {habit.targetCompletionsPerDay}x
                    </Text>
                  </View>
                )}

                {habit.reminderEnabled && habit.reminderTime && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                      Reminder:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {habit.reminderTime}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[styles.bottomActions, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
          onPress={handleEdit}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
            {template.isDefault ? 'Make it Mine' : 'Edit Template'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.useButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleUseTemplate}
        >
          <Text style={styles.useButtonText}>Use Template</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
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
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  templateEmoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  templateName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  templateDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  habitCount: {
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
  },
  habitsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  habitCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  habitCategory: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  habitNotes: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  habitDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    borderWidth: 2,
  },
  useButton: {},
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default TemplateDetailScreen;
