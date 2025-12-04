import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Shuffle, RotateCcw, Check, X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { HabiMascot } from '@/components/mascot/HabiMascot';
import { useMascotCustomization } from '@/hooks/useMascotCustomization';
import { CategorySection } from '@/components/customization/CategorySection';
import { OptionSelector } from '@/components/customization/OptionSelector';
import { ColorPickerButton } from '@/components/customization/ColorPickerButton';
import type { HabiCustomization } from '@/types/mascotCustomization';

const CustomizeHabiScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const {
    customization,
    updateName,
    updateEyes,
    updateEyebrows,
    updateMouth,
    updateBlush,
    updateHair,
    updateHat,
    updateGlasses,
    updateBody,
    updateNecklace,
    updateSpecialEffect,
    resetToDefault,
    randomizeCustomization,
  } = useMascotCustomization();

  const [expandedSection, setExpandedSection] = useState<string | null>('face');
  const [tempName, setTempName] = useState(customization.name);

  const handleSave = () => {
    if (tempName.trim() !== customization.name) {
      updateName(tempName.trim() || 'Habi');
    }
    Alert.alert('Saved!', 'Your Habi customization has been saved.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleRandom = () => {
    randomizeCustomization();
    Alert.alert('Randomized!', 'Your Habi got a fun new look!');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Default?',
      'This will reset all customization to the original Habi appearance. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToDefault();
            setTempName('Habi');
            Alert.alert('Reset!', 'Habi is back to the original look!');
          },
        },
      ]
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Customize Habi</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Check size={24} color={theme.colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Live Preview */}
        <View style={styles.previewSection}>
          <HabiMascot customization={customization} size={220} animated />

          {/* Name Input */}
          <View style={styles.nameContainer}>
            <TextInput
              style={[
                styles.nameInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.backgroundSecondary,
                },
              ]}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter name..."
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={20}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.backgroundSecondary }]}
            onPress={handleRandom}
          >
            <Shuffle size={18} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>Random</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.backgroundSecondary }]}
            onPress={handleReset}
          >
            <RotateCcw size={18} color={theme.colors.error} />
            <Text style={[styles.actionText, { color: theme.colors.error }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Customization Categories */}
        <View style={styles.categoriesContainer}>
          {/* Face & Expression */}
          <CategorySection
            title="Face & Expression"
            isExpanded={expandedSection === 'face'}
            onToggle={() => toggleSection('face')}
          >
            <OptionSelector
              label="Eyes"
              options={['normal', 'happy', 'sleepy', 'determined', 'cute', 'mischievous'] as const}
              selectedOption={customization.eyes}
              onSelect={updateEyes}
            />

            <OptionSelector
              label="Eyebrows"
              options={['none', 'normal', 'raised', 'furrowed', 'wavy'] as const}
              selectedOption={customization.eyebrows}
              onSelect={updateEyebrows}
            />

            <OptionSelector
              label="Mouth"
              options={['smile', 'grin', 'neutral', 'determined', 'sleepy', 'silly'] as const}
              selectedOption={customization.mouth}
              onSelect={updateMouth}
            />

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.textSecondary }]}>
                Blush
              </Text>
              <Switch
                value={customization.blushEnabled}
                onValueChange={(enabled) => updateBlush(enabled)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            </View>

            {customization.blushEnabled && (
              <ColorPickerButton
                label="Blush Color"
                color={customization.blushColor}
                onColorChange={(color) => updateBlush(true, color)}
              />
            )}
          </CategorySection>

          {/* Head Accessories */}
          <CategorySection
            title="Head Accessories"
            isExpanded={expandedSection === 'head'}
            onToggle={() => toggleSection('head')}
          >
            <OptionSelector
              label="Hair Style"
              options={['none', 'spiky', 'curly', 'long', 'bob', 'ponytail', 'mohawk', 'wizard'] as const}
              selectedOption={customization.hairStyle}
              onSelect={(style) => updateHair(style, customization.hairColor)}
            />

            {customization.hairStyle !== 'none' && (
              <ColorPickerButton
                label="Hair Color"
                color={customization.hairColor}
                onColorChange={(color) => updateHair(customization.hairStyle, color)}
              />
            )}

            <OptionSelector
              label="Hat"
              options={['none', 'cap', 'beanie', 'crown', 'wizard', 'bow', 'headband', 'tophat', 'santa', 'party'] as const}
              selectedOption={customization.hat}
              onSelect={updateHat}
            />

            <OptionSelector
              label="Glasses"
              options={['none', 'round', 'square', 'sunglasses', 'reading', 'monocle', 'scifi', 'heart'] as const}
              selectedOption={customization.glasses}
              onSelect={updateGlasses}
            />
          </CategorySection>

          {/* Body & Colors */}
          <CategorySection
            title="Body & Colors"
            isExpanded={expandedSection === 'body'}
            onToggle={() => toggleSection('body')}
          >
            <ColorPickerButton
              label="Body Color"
              color={customization.bodyColor}
              onColorChange={(color) => updateBody(color, customization.pattern, customization.patternColor)}
            />

            <OptionSelector
              label="Pattern"
              options={['solid', 'spots', 'stripes', 'gradient', 'sparkles', 'none'] as const}
              selectedOption={customization.pattern}
              onSelect={(pattern) => updateBody(customization.bodyColor, pattern, customization.patternColor)}
            />

            {customization.pattern !== 'solid' && customization.pattern !== 'none' && (
              <ColorPickerButton
                label="Pattern Color"
                color={customization.patternColor || '#FFB6C1'}
                onColorChange={(color) => updateBody(customization.bodyColor, customization.pattern, color)}
              />
            )}
          </CategorySection>

          {/* Accessories */}
          <CategorySection
            title="Accessories"
            isExpanded={expandedSection === 'accessories'}
            onToggle={() => toggleSection('accessories')}
          >
            <OptionSelector
              label="Necklace"
              options={['none', 'bowtie', 'bandana', 'necklace', 'scarf', 'medal'] as const}
              selectedOption={customization.necklace}
              onSelect={updateNecklace}
            />

            <OptionSelector
              label="Special Effect"
              options={['none', 'sparkles', 'stars', 'hearts', 'glow'] as const}
              selectedOption={customization.specialEffect}
              onSelect={updateSpecialEffect}
            />
          </CategorySection>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  nameContainer: {
    marginTop: 16,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderRadius: 12,
    minWidth: 200,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CustomizeHabiScreen;
