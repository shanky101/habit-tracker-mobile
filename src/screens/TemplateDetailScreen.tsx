import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { useTemplates } from '@/hooks/useTemplates';
import { useHabits, Habit } from '@/hooks/useHabits';
import { TemplatesStackParamList } from '@/navigation/MainTabNavigator';
import { ArrowLeft, Share2, Trash2, Edit3, Check, Calendar, Bell, Repeat, Award, Clock, Target, TrendingUp, Sparkles } from 'lucide-react-native';

type TemplateDetailRouteProp = RouteProp<TemplatesStackParamList, 'TemplateDetail'>;
type NavigationProp = NativeStackNavigationProp<TemplatesStackParamList>;

const { width } = Dimensions.get('window');

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

  const getGradientColors = (): [string, string] => {
    if (template.type === 'quit') {
      const quitGradients: [string, string][] = [
        ['#4C1D95', '#8B5CF6'], // Deep Purple
        ['#BE123C', '#FB7185'], // Rose
        ['#1E293B', '#475569'], // Slate
        ['#7F1D1D', '#EF4444'], // Red
      ];
      return quitGradients[template.name.length % quitGradients.length];
    }

    const buildGradients: [string, string][] = [
      ['#4F46E5', '#7C3AED'], // Indigo -> Violet
      ['#2563EB', '#3B82F6'], // Blue
      ['#059669', '#10B981'], // Emerald
      ['#D97706', '#F59E0B'], // Amber
      ['#DB2777', '#EC4899'], // Pink
    ];
    return buildGradients[template.name.length % buildGradients.length];
  };

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
                  reminderTime: habitConfig.reminderTime || undefined,
                  timePeriod: 'allday',
                  type: template.type === 'quit' ? 'negative' : 'positive',
                  completions: {},
                };
                await addHabit(newHabit);
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Immersive Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <SafeAreaView edges={['top']} style={styles.safeArea}>
              <View style={styles.navBar}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.goBack()}
                >
                  <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.navActions}>
                  <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                    <Share2 size={20} color="#FFF" />
                  </TouchableOpacity>
                  {!template.isDefault && (
                    <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
                      <Trash2 size={20} color="#FFF" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
                    <Edit3 size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.headerContent}>
                {template.isDefault && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>FEATURED COLLECTION</Text>
                  </View>
                )}
                <Text style={styles.title}>{template.name}</Text>
                <Text style={styles.description}>{template.description}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Award size={20} color="rgba(255,255,255,0.8)" style={{ marginBottom: 4 }} />
                    <Text style={styles.statValue}>{template.difficulty || 'Medium'}</Text>
                    <Text style={styles.statLabel}>Difficulty</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Clock size={20} color="rgba(255,255,255,0.8)" style={{ marginBottom: 4 }} />
                    <Text style={styles.statValue}>{template.duration || 'Ongoing'}</Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Target size={20} color="rgba(255,255,255,0.8)" style={{ marginBottom: 4 }} />
                    <Text style={styles.statValue}>{template.habits.length}</Text>
                    <Text style={styles.statLabel}>Habits</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        <View style={styles.contentContainer}>
          {/* Benefits Section */}
          {template.benefits && template.benefits.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Why it works</Text>
              </View>
              <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                {template.benefits.map((benefit, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.checkCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Check size={12} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.listText, { color: theme.colors.text }]}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Timeline Section */}
          {template.timeline && template.timeline.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>The Journey</Text>
              </View>
              <View style={styles.timelineContainer}>
                {template.timeline.map((item, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { borderColor: theme.colors.primary, backgroundColor: theme.colors.background }]} />
                      {index < template.timeline!.length - 1 && (
                        <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />
                      )}
                    </View>
                    <View style={[styles.timelineContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                      <Text style={[styles.timelineWeek, { color: theme.colors.primary }]}>Week {item.week}</Text>
                      <Text style={[styles.timelineTitle, { color: theme.colors.text }]}>{item.title}</Text>
                      <Text style={[styles.timelineDesc, { color: theme.colors.textSecondary }]}>{item.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Outcomes Section */}
          {template.outcomes && template.outcomes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Award size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Expected Outcomes</Text>
              </View>
              <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                {template.outcomes.map((outcome, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.checkCircle, { backgroundColor: theme.colors.secondary + '20' }]}>
                      <Sparkles size={12} color={theme.colors.secondary} />
                    </View>
                    <Text style={[styles.listText, { color: theme.colors.text }]}>{outcome}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Habits List */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 16 }]}>Included Habits</Text>
            {template.habits.map((habit, index) => (
              <View
                key={index}
                style={[
                  styles.habitCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                <View style={styles.habitHeader}>
                  <View style={[styles.habitIcon, { backgroundColor: theme.colors.backgroundSecondary }]}>
                    <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                  </View>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitName, { color: theme.colors.text }]}>{habit.name}</Text>
                    <Text style={[styles.habitCategory, { color: theme.colors.textSecondary }]}>{habit.category}</Text>
                  </View>
                </View>

                <View style={[styles.habitDetails, { borderTopColor: theme.colors.border }]}>
                  <View style={styles.detailItem}>
                    <Repeat size={14} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                      {habit.frequency === 'daily' ? 'Every Day' : 'Specific Days'}
                    </Text>
                  </View>
                  {habit.reminderEnabled && (
                    <View style={styles.detailItem}>
                      <Bell size={14} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
                      <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                        {habit.reminderTime}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={[styles.fabContainer, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleUseTemplate}
          activeOpacity={0.9}
        >
          <Text style={styles.fabText}>Use This Template</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  headerContainer: {
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingBottom: 32,
  },
  safeArea: {
    width: '100%',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: '90%',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  contentContainer: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -2,
    marginBottom: -24,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  timelineWeek: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  habitCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  habitEmoji: {
    fontSize: 24,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitCategory: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  habitDetails: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  fab: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default TemplateDetailScreen;
