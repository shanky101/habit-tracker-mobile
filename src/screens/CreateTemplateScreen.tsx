import React, { useState, useEffect, useRef } from 'react';
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
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { useTemplates } from '@/hooks/useTemplates';
import { HabitTemplate, HabitTemplateConfig, TemplateUtils } from '@/types/HabitTemplate';
import {
  ArrowLeft, FileText, X, Minus, Plus, ChevronRight, Check,
  Sparkles, TrendingUp, Calendar, Award, Clock, Target, Zap, Ban, Trash2,
  ChevronUp, ChevronDown, List, AlignLeft, Sun, Moon, Sunset, Watch
} from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

// --- Constants & Types ---

const STEPS = [
  { id: 'basics', title: 'The Basics', icon: FileText },
  { id: 'pitch', title: 'The Pitch', icon: Sparkles },
  { id: 'journey', title: 'The Journey', icon: TrendingUp },
  { id: 'habits', title: 'Habits', icon: Target },
  { id: 'preview', title: 'Preview', icon: Check },
];

const COLORS = [
  '#4F46E5', '#2563EB', '#059669', '#DC2626', '#D97706', '#DB2777',
  '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'
];

const EMOJI_LIST = [
  '🎯', '⭐', '💪', '🏃', '🧘', '📚', '✍️', '💡', '🎨', '🎵',
  '🌟', '✨', '🔥', '💫', '🌈', '🏆', '🥇', '📝', '📊', '💼',
  '💰', '⏰', '📅', '🍎', '💧', '🧠', '🎓', '🚫', '📵', '🚭'
];

const HABIT_EMOJI_LIST = [
  '💪', '🏃', '🧘', '📚', '✍️', '💡', '🎨', '🎵', '🍎', '💧',
  '😴', '🚶', '🏊', '🚴', '🏋️', '🧗', '⛹️', '🤸', '🧠', '🦷',
];

type CreateTemplateRouteProp = RouteProp<any, 'CreateTemplate'>;
type NavigationProp = NativeStackNavigationProp<any>;

// --- Main Component ---

const CreateTemplateScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateTemplateRouteProp>();
  const { mode, templateId } = route.params || { mode: 'create' };
  const { addTemplate, updateTemplate, getTemplateById } = useTemplates();

  // --- State ---
  const [currentStep, setCurrentStep] = useState(0);

  // Form Data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'build' | 'quit' | 'mixed'>('build');
  const [color, setColor] = useState(COLORS[0]);
  const [emoji, setEmoji] = useState('🎯');

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Duration Split
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState<'Days' | 'Weeks' | 'Months'>('Days');

  const [benefits, setBenefits] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([]);

  const [timeline, setTimeline] = useState<{ week: number; title: string; description: string }[]>([]);
  const [habits, setHabits] = useState<HabitTemplateConfig[]>([]);

  // UI State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newBenefit, setNewBenefit] = useState('');
  const [newOutcome, setNewOutcome] = useState('');

  // Timeline Modal
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineWeek, setTimelineWeek] = useState('1');
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');

  // Habit Modal
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabitIndex, setEditingHabitIndex] = useState<number | null>(null);

  // --- Effects ---
  useEffect(() => {
    if ((mode === 'edit' || mode === 'copy') && templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setName(mode === 'copy' ? `${template.name} (Copy)` : template.name);
        setDescription(template.description);
        setType(template.type || 'build');
        setColor(template.color);
        setEmoji(template.emoji);
        setDifficulty(template.difficulty || 'medium');

        // Parse Duration
        if (template.duration) {
          const parts = template.duration.split(' ');
          if (parts.length === 2) {
            setDurationValue(parts[0]);
            setDurationUnit(parts[1] as any);
          } else {
            setDurationValue(template.duration); // Fallback
          }
        }

        setBenefits(template.benefits || []);
        setOutcomes(template.outcomes || []);
        setTimeline(template.timeline || []);
        setHabits(template.habits);
      }
    }
  }, [mode, templateId]);

  // --- Handlers ---

  const handleNext = () => {
    // Validation
    if (currentStep === 0) {
      if (!name.trim()) return Alert.alert('Missing Info', 'Please enter a template name.');
      if (!description.trim()) return Alert.alert('Missing Info', 'Please enter a description.');
    }
    if (currentStep === 3 && habits.length === 0) {
      return Alert.alert('No Habits', 'Please add at least one habit.');
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigation.goBack();
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentStep(prev => Math.max(prev - 1, 0));
    }
  };

  const handleSave = async () => {
    const fullDuration = durationValue ? `${durationValue} ${durationUnit}` : 'Ongoing';

    const templateData: any = {
      name,
      description,
      type,
      color,
      emoji,
      difficulty,
      duration: fullDuration,
      benefits,
      outcomes,
      timeline,
      habits,
      tags: [type, difficulty],
      updatedAt: new Date().toISOString(),
    };

    if (mode === 'edit' && templateId) {
      await updateTemplate(templateId, templateData);
      Alert.alert('Success', 'Template updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } else {
      const newTemplate: HabitTemplate = {
        ...templateData,
        id: TemplateUtils.generateId(),
        version: '1.0',
        isDefault: false,
        createdAt: new Date().toISOString(),
      };
      await addTemplate(newTemplate);
      Alert.alert('Success', 'Template created!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const addOutcome = () => {
    if (newOutcome.trim()) {
      setOutcomes([...outcomes, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const addTimelineItem = () => {
    if (timelineTitle.trim() && timelineDesc.trim()) {
      const newItem = {
        week: parseInt(timelineWeek) || 1,
        title: timelineTitle.trim(),
        description: timelineDesc.trim(),
      };
      setTimeline([...timeline, newItem].sort((a, b) => a.week - b.week));
      setTimelineTitle('');
      setTimelineDesc('');
      setTimelineWeek((parseInt(timelineWeek) + 1).toString());
      setShowTimelineModal(false);
    }
  };

  const moveTimelineItem = (index: number, direction: 'up' | 'down') => {
    const newTimeline = [...timeline];
    if (direction === 'up' && index > 0) {
      [newTimeline[index], newTimeline[index - 1]] = [newTimeline[index - 1], newTimeline[index]];
    } else if (direction === 'down' && index < newTimeline.length - 1) {
      [newTimeline[index], newTimeline[index + 1]] = [newTimeline[index + 1], newTimeline[index]];
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTimeline(newTimeline);
  };

  // --- Render Steps ---

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <View key={step.id} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              (isActive || isCompleted) ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.border },
              isActive && { transform: [{ scale: 1.2 }] }
            ]}>
              {isCompleted ? (
                <Check size={12} color="#FFF" />
              ) : (
                <Text style={[styles.stepNum, (isActive || isCompleted) && { color: '#FFF' }]}>{index + 1}</Text>
              )}
            </View>
            {index < STEPS.length - 1 && (
              <View style={[styles.progressLine, { backgroundColor: isCompleted ? theme.colors.primary : theme.colors.border }]} />
            )}
          </View>
        );
      })}
    </View>
  );

  const renderBasicsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Let's start with the basics</Text>

      {/* Emoji & Name */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.emojiButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowEmojiPicker(true)}
        >
          <Text style={{ fontSize: 32 }}>{emoji}</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.nameInput, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}
          placeholder="Template Name"
          placeholderTextColor={theme.colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Description */}
      <TextInput
        style={[styles.descInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
        placeholder="What is this template for? e.g. 'A 21-day challenge to quit sugar'"
        placeholderTextColor={theme.colors.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Type Selection */}
      <Text style={[styles.label, { color: theme.colors.text }]}>Goal Type</Text>
      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'build' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
          onPress={() => setType('build')}
        >
          <Zap size={20} color={type === 'build' ? '#FFF' : theme.colors.textSecondary} />
          <Text style={[styles.typeText, type === 'build' && { color: '#FFF' }]}>Build Habit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'quit' && { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}
          onPress={() => setType('quit')}
        >
          <Ban size={20} color={type === 'quit' ? '#FFF' : theme.colors.textSecondary} />
          <Text style={[styles.typeText, type === 'quit' && { color: '#FFF' }]}>Quit Habit</Text>
        </TouchableOpacity>
      </View>

      {/* Color Selection */}
      <Text style={[styles.label, { color: theme.colors.text }]}>Theme Color</Text>
      <View style={styles.colorGrid}>
        {COLORS.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.selectedColor]}
            onPress={() => setColor(c)}
          >
            {color === c && <Check size={16} color="#FFF" />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPitchStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Sell the dream</Text>

      {/* Difficulty & Duration */}
      <View style={{ gap: 24 }}>
        <View>
          <Text style={[styles.label, { color: theme.colors.text }]}>Difficulty</Text>
          <View style={[styles.segmentContainer, { backgroundColor: theme.colors.surface }]}>
            {['easy', 'medium', 'hard'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.segmentButton, difficulty === d && { backgroundColor: theme.colors.primary, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
                onPress={() => setDifficulty(d as any)}
              >
                <Text style={[styles.segmentText, difficulty === d && { color: '#FFF', fontWeight: 'bold' }]}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={[styles.label, { color: theme.colors.text }]}>Duration</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, textAlign: 'center', fontSize: 18, fontWeight: '600' }]}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                value={durationValue}
                onChangeText={setDurationValue}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 2, flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: 12, padding: 4 }}>
              {['Days', 'Weeks', 'Months'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitButton, durationUnit === u && { backgroundColor: theme.colors.primary }]}
                  onPress={() => setDurationUnit(u as any)}
                >
                  <Text style={[styles.unitText, durationUnit === u && { color: '#FFF' }]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Benefits */}
      <Text style={[styles.label, { color: theme.colors.text, marginTop: 32 }]}>Key Benefits</Text>
      <View style={styles.listInputContainer}>
        <TextInput
          style={[styles.listInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
          placeholder="Add a benefit..."
          placeholderTextColor={theme.colors.textSecondary}
          value={newBenefit}
          onChangeText={setNewBenefit}
          onSubmitEditing={addBenefit}
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={addBenefit}>
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {benefits.map((b, i) => (
          <View key={i} style={[styles.listItem, { backgroundColor: theme.colors.surface }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Check size={16} color={theme.colors.primary} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.colors.text, fontSize: 16 }}>{b}</Text>
            </View>
            <TouchableOpacity onPress={() => setBenefits(benefits.filter((_, idx) => idx !== i))}>
              <X size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Outcomes */}
      <Text style={[styles.label, { color: theme.colors.text, marginTop: 32 }]}>Expected Outcomes</Text>
      <View style={styles.listInputContainer}>
        <TextInput
          style={[styles.listInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
          placeholder="Add an outcome..."
          placeholderTextColor={theme.colors.textSecondary}
          value={newOutcome}
          onChangeText={setNewOutcome}
          onSubmitEditing={addOutcome}
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={addOutcome}>
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {outcomes.map((o, i) => (
          <View key={i} style={[styles.listItem, { backgroundColor: theme.colors.surface }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Target size={16} color={theme.colors.primary} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.colors.text, fontSize: 16 }}>{o}</Text>
            </View>
            <TouchableOpacity onPress={() => setOutcomes(outcomes.filter((_, idx) => idx !== i))}>
              <X size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderJourneyStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Map the Journey</Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
        Break down the habit building process into weekly milestones.
      </Text>

      <TouchableOpacity
        style={[styles.addTimelineButton, { borderColor: theme.colors.primary }]}
        onPress={() => setShowTimelineModal(true)}
      >
        <Plus size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Add Milestone</Text>
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 16 }}>
        {timeline.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, { borderColor: theme.colors.primary, backgroundColor: theme.colors.background }]} />
              {index < timeline.length - 1 && <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />}
            </View>
            <View style={[styles.timelineContent, { backgroundColor: theme.colors.surface }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.timelineWeek, { color: theme.colors.primary }]}>Week {item.week}</Text>
                  <Text style={[styles.timelineTitle, { color: theme.colors.text }]}>{item.title}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <View style={{ flexDirection: 'column', gap: 2, marginRight: 8 }}>
                    {index > 0 && (
                      <TouchableOpacity onPress={() => moveTimelineItem(index, 'up')} style={styles.moveBtn}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                    {index < timeline.length - 1 && (
                      <TouchableOpacity onPress={() => moveTimelineItem(index, 'down')} style={styles.moveBtn}>
                        <ChevronDown size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => setTimeline(timeline.filter((_, i) => i !== index))}>
                    <X size={18} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.timelineDesc, { color: theme.colors.textSecondary }]}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderHabitsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Define the Habits</Text>

      <View style={{ marginTop: 24 }}>
        <TouchableOpacity
          style={[styles.addHabitButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setEditingHabitIndex(null);
            setShowHabitModal(true);
          }}
        >
          <Plus size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Add Habit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ marginTop: 24 }}>
        {habits.map((habit, index) => (
          <View key={index} style={[styles.habitCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.habitCardHeader}>
              <Text style={{ fontSize: 24, marginRight: 16 }}>{habit.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.habitCardTitle, { color: theme.colors.text }]}>{habit.name}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  {habit.frequency} · {habit.targetCompletionsPerDay}x/day · {habit.timePeriod || 'Anytime'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => {
                  setEditingHabitIndex(index);
                  setShowHabitModal(true);
                }}>
                  <View style={[styles.iconButton, { backgroundColor: theme.colors.background }]}>
                    <FileText size={16} color={theme.colors.text} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setHabits(habits.filter((_, i) => i !== index))}>
                  <View style={[styles.iconButton, { backgroundColor: theme.colors.background }]}>
                    <Trash2 size={16} color="#EF4444" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderPreviewStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Ready to Launch?</Text>

      <View style={[styles.previewCard, { backgroundColor: theme.colors.surface }]}>
        <LinearGradient
          colors={[color, color + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.previewHeader}
        >
          <Text style={styles.previewEmoji}>{emoji}</Text>
          <Text style={styles.previewTitle}>{name}</Text>
          <Text style={styles.previewDesc}>{description}</Text>
        </LinearGradient>

        <View style={styles.previewStats}>
          <View style={styles.previewStat}>
            <Text style={[styles.statVal, { color: theme.colors.text }]}>{habits.length}</Text>
            <Text style={styles.statLabel}>Habits</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={[styles.statVal, { color: theme.colors.text }]}>{durationValue ? `${durationValue} ${durationUnit}` : 'Ongoing'}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={[styles.statVal, { color: theme.colors.text }]}>{difficulty}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.publishButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.publishText}>Publish Template</Text>
        <Sparkles size={20} color="#FFF" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {STEPS[currentStep].title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {renderProgressBar()}

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 0 && renderBasicsStep()}
          {currentStep === 1 && renderPitchStep()}
          {currentStep === 2 && renderJourneyStep()}
          {currentStep === 3 && renderHabitsStep()}
          {currentStep === 4 && renderPreviewStep()}
        </ScrollView>

        {/* Footer Navigation */}
        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.footerBackBtn]}
              onPress={handleBack}
            >
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Back</Text>
            </TouchableOpacity>
          )}

          {currentStep < STEPS.length - 1 ? (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: theme.colors.primary, flex: 1, marginLeft: currentStep > 0 ? 12 : 0 }]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next Step</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}
        </View>
      </KeyboardAvoidingView>

      {/* --- Modals --- */}

      {/* Emoji Picker */}
      <Modal visible={showEmojiPicker} animationType="slide" transparent onRequestClose={() => setShowEmojiPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Choose Icon</Text>
            <FlatList
              data={EMOJI_LIST}
              numColumns={6}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.emojiItem} onPress={() => { setEmoji(item); setShowEmojiPicker(false); }}>
                  <Text style={{ fontSize: 32 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Timeline Modal */}
      <Modal visible={showTimelineModal} animationType="fade" transparent onRequestClose={() => setShowTimelineModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Milestone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, marginBottom: 12 }]}
              placeholder="Week Number (e.g. 1)"
              keyboardType="numeric"
              value={timelineWeek}
              onChangeText={setTimelineWeek}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, marginBottom: 12 }]}
              placeholder="Title (e.g. The Beginning)"
              value={timelineTitle}
              onChangeText={setTimelineTitle}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, height: 80, textAlignVertical: 'top' }]}
              placeholder="Description"
              multiline
              value={timelineDesc}
              onChangeText={setTimelineDesc}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowTimelineModal(false)}><Text style={{ color: theme.colors.textSecondary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={addTimelineItem} style={[styles.modalBtn, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: '#FFF' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Habit Modal (Redesigned) */}
      {showHabitModal && (
        <HabitModal
          visible={showHabitModal}
          onClose={() => setShowHabitModal(false)}
          onSave={(habit) => {
            if (editingHabitIndex !== null) {
              const newHabits = [...habits];
              newHabits[editingHabitIndex] = habit;
              setHabits(newHabits);
            } else {
              setHabits([...habits, habit]);
            }
            setShowHabitModal(false);
          }}
          initialHabit={editingHabitIndex !== null ? habits[editingHabitIndex] : undefined}
          theme={theme}
        />
      )}

    </SafeAreaView>
  );
};

// --- Helper Components ---

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ... (keep existing code)

const HabitModal = ({ visible, onClose, onSave, initialHabit, theme }: any) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialHabit?.name || '');
  const [emoji, setEmoji] = useState(initialHabit?.emoji || '💪');
  const [frequency, setFrequency] = useState(initialHabit?.frequency || 'daily');
  const [target, setTarget] = useState(initialHabit?.targetCompletionsPerDay || 1);
  const [timePeriod, setTimePeriod] = useState(initialHabit?.timePeriod || 'anytime');
  const [notes, setNotes] = useState(initialHabit?.notes || '');
  const [selectedDays, setSelectedDays] = useState<number[]>(initialHabit?.selectedDays || [0, 1, 2, 3, 4, 5, 6]);

  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Missing Name', 'Please enter a name for this habit.');

    // Validation: At least one day must be selected
    if (selectedDays.length === 0) {
      return Alert.alert(
        'No Days Selected',
        'Please select at least one day for this habit to repeat on.'
      );
    }

    onSave({
      name: name.trim(),
      emoji,
      category: 'health', // Default for now
      frequency,
      frequencyType: target > 1 ? 'multiple' : 'single',
      targetCompletionsPerDay: target,
      selectedDays,
      reminderEnabled: false,
      reminderTime: null,
      timePeriod,
      notes: notes.trim()
    });
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} presentationStyle="pageSheet">
      <View style={[styles.fullScreenModal, { backgroundColor: theme.colors.background }]}>

        {/* Modal Header with Manual Safe Area */}
        <View style={[
          styles.modalHeader,
          {
            paddingTop: Platform.OS === 'ios' ? 20 : 16, // Manual adjustment if needed, but pageSheet handles top usually. 
            // However, user complained about "stuck to top". 
            // If pageSheet, iOS handles status bar. 
            // Let's try standard View with no SafeAreaView wrapper but careful padding.
          }
        ]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalHeaderTitle, { color: theme.colors.text }]}>{initialHabit ? 'Edit Habit' : 'New Habit'}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>

            {/* Emoji & Name */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{ marginBottom: 24, height: 80 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 8 }}>
                  {HABIT_EMOJI_LIST.map((e, i) => (
                    <TouchableOpacity
                      key={`${e}-${i}`}
                      onPress={() => setEmoji(e)}
                      style={[
                        styles.bigEmojiBtn,
                        emoji === e && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary, borderWidth: 2 }
                      ]}
                    >
                      <Text style={{ fontSize: 32 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TextInput
                style={[styles.bigInput, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}
                placeholder="Habit Name"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
                textAlign="center"
              />
            </View>

            {/* Settings Card */}
            <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>

              {/* Frequency */}
              <View style={styles.settingRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Calendar size={20} color={theme.colors.primary} style={{ marginRight: 12 }} />
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Frequency</Text>
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: theme.colors.background, borderRadius: 8, padding: 4 }}>
                  {['daily', 'weekly'].map(f => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setFrequency(f)}
                      style={[
                        styles.toggleBtn,
                        frequency === f && { backgroundColor: theme.colors.primary, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2 }
                      ]}
                    >
                      <Text style={{
                        color: frequency === f ? '#FFF' : theme.colors.textSecondary,
                        textTransform: 'capitalize',
                        fontSize: 13,
                        fontWeight: '600'
                      }}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              {/* Day Selection */}
              <View style={{ padding: 16 }}>
                <Text style={[styles.settingLabel, { color: theme.colors.text, marginBottom: 12, fontSize: 14 }]}>Repeat on</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {DAYS.map((day, index) => {
                    const isSelected = selectedDays.includes(index);
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => toggleDay(index)}
                        style={[
                          styles.dayBtn,
                          isSelected ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : { borderColor: theme.colors.border, backgroundColor: theme.colors.background }
                        ]}
                      >
                        <Text style={[
                          styles.dayBtnText,
                          isSelected ? { color: '#FFF' } : { color: theme.colors.text }
                        ]}>{day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {selectedDays.length === 0 && (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                    Please select at least one day
                  </Text>
                )}
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              {/* Target */}
              <View style={styles.settingRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Target size={20} color={theme.colors.primary} style={{ marginRight: 12 }} />
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Target per day</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity onPress={() => setTarget(Math.max(1, target - 1))} style={[styles.roundBtn, { backgroundColor: theme.colors.background }]}>
                    <Minus size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                  <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 'bold', minWidth: 24, textAlign: 'center' }}>{target}</Text>
                  <TouchableOpacity onPress={() => setTarget(Math.min(20, target + 1))} style={[styles.roundBtn, { backgroundColor: theme.colors.background }]}>
                    <Plus size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              {/* Time Period */}
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Clock size={20} color={theme.colors.primary} style={{ marginRight: 12 }} />
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Time of Day</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {['morning', 'afternoon', 'evening', 'anytime'].map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTimePeriod(t)}
                      style={[
                        styles.chipBtn,
                        timePeriod === t ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : { borderColor: theme.colors.border, backgroundColor: theme.colors.background }
                      ]}
                    >
                      <Text style={{ color: timePeriod === t ? '#FFF' : theme.colors.text, textTransform: 'capitalize', fontSize: 14, fontWeight: '500' }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Notes */}
            <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary, marginTop: 32, marginBottom: 12 }]}>NOTES</Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="Add motivation or instructions..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              value={notes}
              onChangeText={setNotes}
            />

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backButton: { padding: 8 },

  progressContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  progressStep: { flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  progressLine: { width: 30, height: 3, marginHorizontal: -2, zIndex: 1 },
  stepNum: { fontSize: 12, fontWeight: 'bold', color: '#666' },

  content: { flex: 1, paddingHorizontal: 24 },
  stepContainer: { flex: 1 },
  stepTitle: { fontSize: 32, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
  stepSubtitle: { fontSize: 16, marginBottom: 24, lineHeight: 24 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8 },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  emojiButton: { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  nameInput: { flex: 1, fontSize: 24, fontWeight: '600', borderBottomWidth: 1, paddingVertical: 8 },
  descInput: { borderRadius: 16, padding: 16, fontSize: 16, height: 120, textAlignVertical: 'top', marginBottom: 32 },

  typeContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', gap: 8 },
  typeText: { fontWeight: '600', color: '#666', fontSize: 16 },

  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 },
  colorCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  selectedColor: { borderWidth: 3, borderColor: '#FFF', shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 },

  input: { borderRadius: 12, padding: 16, fontSize: 16 },

  // Airy Segment
  segmentContainer: { flexDirection: 'row', borderRadius: 16, padding: 6, gap: 8 },
  segmentButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  segmentText: { fontWeight: '600', color: '#666', fontSize: 15 },

  // Duration
  unitButton: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  unitText: { fontWeight: '600', color: '#666' },

  listInputContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  listInput: { flex: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  addButton: { width: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  listContainer: { gap: 12 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12 },

  addTimelineButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed' },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', marginRight: 16, width: 20 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, zIndex: 2 },
  timelineLine: { width: 2, flex: 1, marginTop: -2, marginBottom: -20 },
  timelineContent: { flex: 1, padding: 20, borderRadius: 16 },
  timelineWeek: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  timelineTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  timelineDesc: { fontSize: 15, lineHeight: 22 },
  moveBtn: { padding: 4 },

  addHabitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16 },
  habitCard: { padding: 20, borderRadius: 20, marginBottom: 12 },
  habitCardHeader: { flexDirection: 'row', alignItems: 'center' },
  habitCardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  iconButton: { padding: 10, borderRadius: 10 },

  previewCard: { borderRadius: 32, overflow: 'hidden', marginBottom: 32 },
  previewHeader: { padding: 40, alignItems: 'center' },
  previewEmoji: { fontSize: 72, marginBottom: 20 },
  previewTitle: { fontSize: 32, fontWeight: '800', color: '#FFF', textAlign: 'center', marginBottom: 12 },
  previewDesc: { fontSize: 18, color: 'rgba(255,255,255,0.95)', textAlign: 'center', lineHeight: 26 },
  previewStats: { flexDirection: 'row', padding: 24, justifyContent: 'space-around' },
  previewStat: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#666', textTransform: 'uppercase', marginTop: 4, fontWeight: '600' },
  publishButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  publishText: { color: '#FFF', fontSize: 20, fontWeight: '700' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center' },
  footerBackBtn: { padding: 16, marginRight: 12 },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8 },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 20, marginTop: 32 },
  modalBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  emojiItem: { padding: 10 },

  // New Habit Modal Styles
  fullScreenModal: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700' },
  closeButton: { padding: 8 },
  saveButton: { padding: 8 },
  saveButtonText: { fontSize: 16, fontWeight: '700' },
  bigEmojiBtn: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)' },
  bigInput: { fontSize: 24, fontWeight: '700', borderBottomWidth: 1, paddingVertical: 12, width: '80%' },
  settingsCard: { borderRadius: 20, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  settingLabel: { fontSize: 16, fontWeight: '600' },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  roundBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1, width: '100%' },
  chipBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  sectionHeader: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  notesInput: { borderRadius: 16, padding: 16, fontSize: 16, height: 120, textAlignVertical: 'top' },
  dayBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  dayBtnText: { fontSize: 14, fontWeight: '700' },
});

export default CreateTemplateScreen;
