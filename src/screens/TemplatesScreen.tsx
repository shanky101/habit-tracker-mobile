
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  Modal,
  Dimensions,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { useTemplates } from '@/hooks/useTemplates';
import { useHabits } from '@/hooks/useHabits';
import { HabitTemplate } from '@/types/HabitTemplate';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { Search, X, Plus, ChevronRight, Sparkles, TrendingUp, Zap, Ban } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const FEATURED_HEIGHT = 200;

// Animated Gradient Component
const AnimatedGradientCard = ({
  children,
  colors,
  style,
  onPress
}: {
  children: React.ReactNode;
  colors: [string, string];
  style?: any;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // Removed shimmer animation as per user request
  // const shimmerAnim = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   Animated.loop(...).start();
  // }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // const translateX = shimmerAnim.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: [-CARD_WIDTH, CARD_WIDTH * 2],
  // });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: style.borderRadius, padding: style.padding, overflow: 'hidden' }}
        >
          {children}

          {/* Shimmer Effect */}
          {/* <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: 100,
              transform: [{ translateX }, { skewX: '-20deg' }],
              backgroundColor: 'rgba(255,255,255,0.1)',
            }}
          /> */}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const TemplatesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { templates, importTemplate } = useTemplates();

  const [activeTab, setActiveTab] = useState<'build' | 'quit'>('build');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  // Group templates by category/tag
  const sections = useMemo(() => {
    let filtered = templates.filter(t => {
      // Filter by type (build/quit)
      // If template doesn't have a type (legacy), assume 'build'
      const type = t.type || 'build';
      return type === activeTab || type === 'mixed';
    });

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const featured = filtered.filter(t => t.isDefault).slice(0, 5);

    const categories: { [key: string]: HabitTemplate[] } = {};

    filtered.forEach(t => {
      const category = t.tags[0] || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(t);
    });

    return {
      featured,
      categories: Object.entries(categories).map(([title, data]) => ({ title, data })),
    };
  }, [templates, activeTab, searchQuery]);

  const handleImportTemplate = async () => {
    if (!importText.trim()) return;
    const success = await importTemplate(importText.trim());
    if (success) {
      setShowImportModal(false);
      setImportText('');
    }
  };

  const getGradientColors = (index: number, type: 'build' | 'quit'): [string, string] => {
    if (type === 'quit') {
      const quitGradients: [string, string][] = [
        ['#4C1D95', '#8B5CF6'], // Deep Purple
        ['#BE123C', '#FB7185'], // Rose
        ['#1E293B', '#475569'], // Slate
        ['#7F1D1D', '#EF4444'], // Red
      ];
      return quitGradients[index % quitGradients.length];
    }

    const buildGradients: [string, string][] = [
      ['#4F46E5', '#7C3AED'], // Indigo -> Violet
      ['#2563EB', '#3B82F6'], // Blue
      ['#059669', '#10B981'], // Emerald
      ['#D97706', '#F59E0B'], // Amber
      ['#DB2777', '#EC4899'], // Pink
    ];
    return buildGradients[index % buildGradients.length];
  };

  const renderFeaturedCard = (template: HabitTemplate, index: number) => (
    <AnimatedGradientCard
      key={template.id}
      onPress={() => navigation.navigate('TemplateDetail', { templateId: template.id })}
      colors={getGradientColors(index, activeTab)}
      style={styles.featuredCardContainer}
    >
      <View style={styles.featuredContent}>
        <View style={styles.featuredBadge}>
          <Sparkles size={12} color="#FFF" style={{ marginRight: 4 }} />
          <Text style={styles.featuredBadgeText}>FEATURED</Text>
        </View>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {template.name}
        </Text>
        <Text style={styles.featuredSubtitle} numberOfLines={2}>
          {template.description}
        </Text>
        <View style={styles.featuredFooter}>
          <View style={styles.statsContainer}>
            <Text style={styles.featuredStats}>
              {template.habits.length} Habits
            </Text>
            {template.duration && (
              <>
                <View style={styles.dotSeparator} />
                <Text style={styles.featuredStats}>{template.duration}</Text>
              </>
            )}
          </View>
          <View style={styles.featuredButton}>
            <Text style={styles.featuredButtonText}>View</Text>
            <ChevronRight size={16} color="#000" />
          </View>
        </View>
      </View>
      {/* Decorative Circle */}
      <View style={[styles.decorativeCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
    </AnimatedGradientCard>
  );

  const renderStandardCard = (template: HabitTemplate, index: number) => (
    <AnimatedGradientCard
      key={template.id}
      onPress={() => navigation.navigate('TemplateDetail', { templateId: template.id })}
      colors={getGradientColors(index + 2, activeTab)}
      style={styles.standardCardContainer}
    >
      <View style={styles.standardContent}>
        <Text style={styles.standardTitle} numberOfLines={2}>
          {template.name}
        </Text>
        <Text style={styles.standardStats}>
          {template.habits.length} Habits
        </Text>
      </View>
      <View style={styles.standardIcon}>
        <ChevronRight size={20} color="#FFF" />
      </View>
    </AnimatedGradientCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Explore</Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                Discover new habits
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate('CreateTemplate', { mode: 'create' })}
            >
              <Plus size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'build' && { backgroundColor: theme.colors.primary },
                activeTab !== 'build' && { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }
              ]}
              onPress={() => setActiveTab('build')}
            >
              <Zap size={16} color={activeTab === 'build' ? '#FFF' : theme.colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={[styles.tabText, { color: activeTab === 'build' ? '#FFF' : theme.colors.textSecondary }]}>
                Grow Habits
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'quit' && { backgroundColor: '#EF4444' }, // Red for quit
                activeTab !== 'quit' && { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }
              ]}
              onPress={() => setActiveTab('quit')}
            >
              <Ban size={16} color={activeTab === 'quit' ? '#FFF' : theme.colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={[styles.tabText, { color: activeTab === 'quit' ? '#FFF' : theme.colors.textSecondary }]}>
                Quit Habits
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Search size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder={`Search ${activeTab === 'build' ? 'growth' : 'quitting'} templates...`}
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {sections.featured.length === 0 && sections.categories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🤔</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>No templates found.</Text>
            </View>
          ) : (
            <>
              {/* Featured Section */}
              {sections.featured.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <TrendingUp size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured Collections</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH + 16}
                  >
                    {sections.featured.map((template, index) => renderFeaturedCard(template, index))}
                  </ScrollView>
                </View>
              )}

              {/* Categories */}
              {sections.categories.map((category, catIndex) => (
                <View key={category.title} style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text, marginLeft: 24, marginBottom: 12 }]}>
                    {category.title.charAt(0).toUpperCase() + category.title.slice(1)}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                  >
                    {category.data.map((template, index) => renderStandardCard(template, index + catIndex))}
                  </ScrollView>
                </View>
              ))}
            </>
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
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Import Template</Text>
            <TextInput
              style={[styles.importInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Paste JSON..."
              placeholderTextColor={theme.colors.textSecondary}
              value={importText}
              onChangeText={setImportText}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowImportModal(false)} style={styles.modalButton}>
                <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleImportTemplate} style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: '#FFF' }}>Import</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  horizontalScroll: {
    paddingHorizontal: 24,
    gap: 16,
  },
  featuredCardContainer: {
    width: CARD_WIDTH,
    height: FEATURED_HEIGHT,
    borderRadius: 24,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 2,
    padding: 24,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  featuredSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 8,
  },
  featuredStats: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  featuredButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    zIndex: 1,
  },
  standardCardContainer: {
    width: 160,
    height: 160,
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  standardContent: {
    flex: 1,
    padding: 16,
  },
  standardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  standardStats: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  standardIcon: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },
  searchResults: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  importInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    height: 120,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
});

export default TemplatesScreen;

