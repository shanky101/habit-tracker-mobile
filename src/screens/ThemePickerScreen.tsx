import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme, themes, themeMetadata, ThemeVariant } from '@/theme';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';

type ThemePickerNavigationProp = StackNavigationProp<any, 'ThemePicker'>;

const ThemePickerScreen: React.FC = () => {
  const navigation = useNavigation<ThemePickerNavigationProp>();
  const { theme, themeMode, setTheme, availableThemes, isAutoMode } = useTheme();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const handleThemeSelect = (themeKey: ThemeVariant | 'auto') => {
    setTheme(themeKey);
  };

  const renderThemeCard = (themeKey: ThemeVariant) => {
    const themeData = themes[themeKey];
    const metadata = themeMetadata[themeKey];
    const isSelected = !isAutoMode && themeMode === themeKey;

    return (
      <TouchableOpacity
        key={themeKey}
        style={[
          styles.themeCard,
          {
            backgroundColor: theme.colors.backgroundSecondary,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleThemeSelect(themeKey)}
        activeOpacity={0.7}
      >
        {/* Preview Container */}
        <View
          style={[
            styles.previewContainer,
            { backgroundColor: themeData.colors.background },
          ]}
        >
          {/* Mock UI Preview */}
          <View style={styles.previewHeader}>
            <View
              style={[
                styles.previewHeaderBar,
                { backgroundColor: themeData.colors.primary },
              ]}
            />
          </View>
          <View style={styles.previewContent}>
            <View
              style={[
                styles.previewCard,
                { backgroundColor: themeData.colors.surface },
              ]}
            >
              <View
                style={[
                  styles.previewLine,
                  { backgroundColor: themeData.colors.text, width: '70%' },
                ]}
              />
              <View
                style={[
                  styles.previewLine,
                  { backgroundColor: themeData.colors.textSecondary, width: '50%' },
                ]}
              />
            </View>
            <View style={styles.previewButtons}>
              <View
                style={[
                  styles.previewButton,
                  { backgroundColor: themeData.colors.primary },
                ]}
              />
              <View
                style={[
                  styles.previewButton,
                  { backgroundColor: themeData.colors.secondary },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Theme Info */}
        <View style={styles.themeInfo}>
          <View style={styles.themeNameRow}>
            <Text
              style={[
                styles.themeName,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: theme.typography.fontSizeMD,
                  fontWeight: theme.typography.fontWeightSemibold,
                },
              ]}
            >
              {themeData.name}
            </Text>
            {isSelected && (
              <View
                style={[
                  styles.selectedBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.themeDescription,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontFamilyBody,
                fontSize: theme.typography.fontSizeSM,
              },
            ]}
          >
            {metadata.description}
          </Text>
          <View style={styles.colorPalette}>
            {metadata.previewColors.map((color, index) => (
              <View
                key={index}
                style={[styles.colorDot, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.backgroundSecondary }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamilyDisplay,
              fontSize: theme.typography.fontSizeXL,
              fontWeight: theme.typography.fontWeightBold,
            },
          ]}
        >
          Choose Theme
        </Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Auto Theme Option */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[
              styles.autoOption,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: isAutoMode ? theme.colors.primary : theme.colors.border,
                borderWidth: isAutoMode ? 2 : 1,
              },
            ]}
            onPress={() => handleThemeSelect('auto')}
            activeOpacity={0.7}
          >
            <View style={styles.autoInfo}>
              <Text style={styles.autoIcon}>🌓</Text>
              <View>
                <Text
                  style={[
                    styles.autoTitle,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeMD,
                      fontWeight: theme.typography.fontWeightSemibold,
                    },
                  ]}
                >
                  Auto (System)
                </Text>
                <Text
                  style={[
                    styles.autoDescription,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamilyBody,
                      fontSize: theme.typography.fontSizeSM,
                    },
                  ]}
                >
                  Follows your device settings
                </Text>
              </View>
            </View>
            {isAutoMode && (
              <View
                style={[
                  styles.selectedBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Section Title */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamilyBody,
              fontSize: theme.typography.fontSizeXS,
              fontWeight: theme.typography.fontWeightSemibold,
            },
          ]}
        >
          ALL THEMES
        </Text>

        {/* Theme Grid */}
        <Animated.View style={[styles.themeGrid, { opacity: fadeAnim }]}>
          {availableThemes.map(renderThemeCard)}
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {},
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  autoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  autoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  autoTitle: {},
  autoDescription: {
    marginTop: 2,
  },
  sectionTitle: {
    letterSpacing: 1,
    marginBottom: 16,
  },
  themeGrid: {
    gap: 16,
  },
  themeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewContainer: {
    height: 120,
    padding: 12,
  },
  previewHeader: {
    marginBottom: 8,
  },
  previewHeaderBar: {
    height: 8,
    width: 60,
    borderRadius: 4,
  },
  previewContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewCard: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewLine: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  previewButton: {
    height: 20,
    width: 50,
    borderRadius: 10,
  },
  themeInfo: {
    padding: 16,
  },
  themeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  themeName: {},
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  themeDescription: {
    marginBottom: 12,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

export default ThemePickerScreen;
