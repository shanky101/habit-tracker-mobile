import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { useHabits } from '@/contexts/HabitsContext';
import { ExportManager, ExportFormat as EMExportFormat } from '@/utils/exportManager';

type ExportDataNavigationProp = StackNavigationProp<any, 'ExportData'>;

type ExportScope = 'all' | 'selected' | 'dateRange';
type ExportFormat = 'csv' | 'json' | 'pdf';

interface HabitOption {
  id: string;
  name: string;
  emoji: string;
  selected: boolean;
}

const ExportDataScreen: React.FC = () => {
  const navigation = useNavigation<ExportDataNavigationProp>();
  const { theme } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { habits: contextHabits } = useHabits();

  const [exportScope, setExportScope] = useState<ExportScope>('all');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [removePersonalInfo, setRemovePersonalInfo] = useState(false);

  // Convert context habits to selectable options
  const [habitSelections, setHabitSelections] = useState<HabitOption[]>(
    contextHabits
      .filter(h => !h.archived)
      .map(h => ({
        id: h.id,
        name: h.name,
        emoji: h.emoji,
        selected: true,
      }))
  );

  const toggleHabitSelection = (id: string) => {
    setHabitSelections(habitSelections.map(h =>
      h.id === id ? { ...h, selected: !h.selected } : h
    ));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Determine which habits to export
      let habitsToExport = contextHabits;

      if (exportScope === 'selected') {
        const selectedIds = habitSelections.filter(h => h.selected).map(h => h.id);
        habitsToExport = contextHabits.filter(h => selectedIds.includes(h.id));
      } else if (exportScope === 'all') {
        habitsToExport = contextHabits.filter(h => !h.archived);
      }

      if (habitsToExport.length === 0) {
        Alert.alert('No Habits Selected', 'Please select at least one habit to export.');
        setIsExporting(false);
        return;
      }

      // Export data using ExportManager
      const result = await ExportManager.exportData({
        format: exportFormat as EMExportFormat,
        habits: habitsToExport,
        includeArchived: exportScope === 'all',
      });

      if (result.success) {
        Alert.alert('Export Successful', result.message);
        // Navigate back after successful export
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        Alert.alert('Export Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export habit data');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDescriptions = {
    csv: 'Spreadsheet-compatible format. Works with Excel, Google Sheets.',
    json: 'Developer-friendly format. Machine-readable data.',
    pdf: 'Human-readable HTML report with statistics and summary.',
  };

  const dataIncluded = [
    { label: 'Habit details (name, category, color)', included: true },
    { label: 'All check-ins with dates', included: true },
    { label: 'Streak history', included: true },
    { label: 'Notes (if any)', included: true },
    { label: 'Creation dates', included: true },
    { label: 'Premium analytics', included: false },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
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
        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamilyDisplayBold,
                fontSize: theme.typography.fontSizeXL,
              },
            ]}
          >
            Export Data
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            Download your habit history
          </Text>
        </View>
        <View style={styles.placeholder} />
      </Animated.View>

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
          {/* Export Scope Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSizeLG,
                },
              ]}
            >
              What to Export
            </Text>

            <View
              style={[
                styles.optionsCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* All Data */}
              <TouchableOpacity
                style={[
                  styles.optionRow,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={() => setExportScope('all')}
                activeOpacity={0.7}
              >
                <View style={styles.optionInfo}>
                  <View
                    style={[
                      styles.radioOuter,
                      {
                        borderColor: exportScope === 'all'
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                  >
                    {exportScope === 'all' && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      />
                    )}
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBodyMedium,
                          fontSize: theme.typography.fontSizeMD,
                        },
                      ]}
                    >
                      All Data
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        {
                          color: theme.colors.textSecondary,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeXS,
                        },
                      ]}
                    >
                      Export all habits and completions (~2.5 MB)
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Selected Habits */}
              <TouchableOpacity
                style={[
                  styles.optionRow,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={() => setExportScope('selected')}
                activeOpacity={0.7}
              >
                <View style={styles.optionInfo}>
                  <View
                    style={[
                      styles.radioOuter,
                      {
                        borderColor: exportScope === 'selected'
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                  >
                    {exportScope === 'selected' && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      />
                    )}
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBodyMedium,
                          fontSize: theme.typography.fontSizeMD,
                        },
                      ]}
                    >
                      Selected Habits
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        {
                          color: theme.colors.textSecondary,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeXS,
                        },
                      ]}
                    >
                      Choose which habits to include
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Date Range */}
              <TouchableOpacity
                style={[styles.optionRow, { borderBottomWidth: 0 }]}
                onPress={() => setExportScope('dateRange')}
                activeOpacity={0.7}
              >
                <View style={styles.optionInfo}>
                  <View
                    style={[
                      styles.radioOuter,
                      {
                        borderColor: exportScope === 'dateRange'
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                  >
                    {exportScope === 'dateRange' && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      />
                    )}
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamilyBodyMedium,
                          fontSize: theme.typography.fontSizeMD,
                        },
                      ]}
                    >
                      Date Range
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        {
                          color: theme.colors.textSecondary,
                          fontFamily: theme.typography.fontFamilyBody,
                          fontSize: theme.typography.fontSizeXS,
                        },
                      ]}
                    >
                      Export data from a specific period
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Habit Selection (if selected scope) */}
            {exportScope === 'selected' && (
              <View
                style={[
                  styles.habitsCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.habitsTitle,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  SELECT HABITS
                </Text>
                {habitSelections.map((habit, index) => (
                  <TouchableOpacity
                    key={habit.id}
                    style={[
                      styles.habitRow,
                      {
                        borderBottomColor: theme.colors.border,
                        borderBottomWidth: index === habitSelections.length - 1 ? 0 : 1,
                      },
                    ]}
                    onPress={() => toggleHabitSelection(habit.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.habitInfo}>
                      <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                      <Text
                        style={[
                          styles.habitName,
                          {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamilyBodyMedium,
                            fontSize: theme.typography.fontSizeSM,
                          },
                        ]}
                      >
                        {habit.name}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: habit.selected
                            ? theme.colors.primary
                            : 'transparent',
                          borderColor: habit.selected
                            ? theme.colors.primary
                            : theme.colors.border,
                        },
                      ]}
                    >
                      {habit.selected && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Format Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSizeLG,
                },
              ]}
            >
              Format
            </Text>

            <View style={styles.formatGrid}>
              {(['csv', 'json', 'pdf'] as ExportFormat[]).map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.formatCard,
                    {
                      backgroundColor: exportFormat === format
                        ? theme.colors.primaryLight + '20'
                        : theme.colors.surface,
                      borderColor: exportFormat === format
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => setExportFormat(format)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.formatIcon}>
                    {format === 'csv' ? '📊' : format === 'json' ? '{ }' : '📄'}
                  </Text>
                  <Text
                    style={[
                      styles.formatLabel,
                      {
                        color: exportFormat === format
                          ? theme.colors.primary
                          : theme.colors.text,
                        fontFamily: theme.typography.fontFamilyBodySemibold,
                        fontSize: theme.typography.fontSizeMD,
                      },
                    ]}
                  >
                    {format.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.formatDescription,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeXS,
                },
              ]}
            >
              {formatDescriptions[exportFormat]}
            </Text>
          </View>

          {/* What's Included Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyDisplayBold,
                  fontSize: theme.typography.fontSizeLG,
                },
              ]}
            >
              What's Included
            </Text>

            <View
              style={[
                styles.includedCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {dataIncluded.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.includedRow,
                    {
                      borderBottomColor: theme.colors.border,
                      borderBottomWidth: index === dataIncluded.length - 1 ? 0 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.includedIcon,
                      { color: item.included ? theme.colors.success : theme.colors.error },
                    ]}
                  >
                    {item.included ? '✓' : '✕'}
                  </Text>
                  <Text
                    style={[
                      styles.includedLabel,
                      {
                        color: item.included
                          ? theme.colors.text
                          : theme.colors.textTertiary,
                        fontFamily: theme.typography.fontFamilyBody,
                        fontSize: theme.typography.fontSizeSM,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Privacy Option */}
          <View
            style={[
              styles.privacyCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyIcon}>🔒</Text>
              <View style={styles.privacyText}>
                <Text
                  style={[
                    styles.privacyLabel,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBodyMedium,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Remove personal info
                </Text>
                <Text
                  style={[
                    styles.privacyDescription,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeXS,
                    },
                  ]}
                >
                  Removes user ID and email for sharing
                </Text>
              </View>
            </View>
            <Switch
              value={removePersonalInfo}
              onValueChange={setRemovePersonalInfo}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primaryLight,
              }}
              thumbColor={
                removePersonalInfo
                  ? theme.colors.primary
                  : theme.colors.surface
              }
            />
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={[
              styles.exportButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: isExporting ? 0.7 : 1,
              },
            ]}
            onPress={handleExport}
            activeOpacity={0.8}
            disabled={isExporting}
          >
            {isExporting ? (
              <View style={styles.exportingContent}>
                <ActivityIndicator size="small" color={theme.colors.white} />
                <Text
                  style={[
                    styles.exportButtonText,
                    {
                      color: theme.colors.white,
                      fontFamily: theme.typography.fontFamilyBodySemibold,
                      fontSize: theme.typography.fontSizeMD,
                      marginLeft: 10,
                    },
                  ]}
                >
                  Exporting...
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.exportButtonText,
                  {
                    color: theme.colors.white,
                    fontFamily: theme.typography.fontFamilyBodySemibold,
                    fontSize: theme.typography.fontSizeMD,
                  },
                ]}
              >
                Export Data
              </Text>
            )}
          </TouchableOpacity>

          <Text
            style={[
              styles.exportNote,
              {
                color: theme.colors.textTertiary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeXS,
              },
            ]}
          >
            Your data will be generated and you'll be prompted to save or share it.
          </Text>
        </Animated.View>
      </ScrollView>
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
  },
  backIcon: {
    fontSize: 24,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {},
  headerSubtitle: {
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  optionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionLabel: {},
  optionDescription: {
    marginTop: 2,
  },
  habitsCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    overflow: 'hidden',
  },
  habitsTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 1,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  habitName: {},
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  formatGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formatCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  formatIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  formatLabel: {},
  premiumTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  formatDescription: {
    textAlign: 'center',
  },
  includedCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  includedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  includedIcon: {
    fontSize: 16,
    marginRight: 12,
    fontWeight: 'bold',
  },
  includedLabel: {},
  privacyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
  },
  privacyLabel: {},
  privacyDescription: {
    marginTop: 2,
  },
  exportButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  exportingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportButtonText: {},
  exportNote: {
    textAlign: 'center',
  },
});

export default ExportDataScreen;
