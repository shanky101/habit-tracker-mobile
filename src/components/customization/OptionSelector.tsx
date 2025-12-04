import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/theme';

interface OptionSelectorProps<T extends string> {
  label: string;
  options: readonly T[];
  selectedOption: T;
  onSelect: (option: T) => void;
  renderIcon?: (option: T) => React.ReactNode;
}

/**
 * Horizontal scrollable option selector
 */
export function OptionSelector<T extends string>({
  label,
  options,
  selectedOption,
  onSelect,
  renderIcon,
}: OptionSelectorProps<T>) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => {
          const isSelected = option === selectedOption;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.backgroundSecondary,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => onSelect(option)}
              activeOpacity={0.7}
            >
              {renderIcon && renderIcon(option)}
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? '#FFF' : theme.colors.text,
                  },
                ]}
              >
                {option}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Check size={14} color="#FFF" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  scrollContent: {
    paddingRight: 20,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1.5,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
