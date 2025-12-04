import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/theme';

interface CategorySectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/**
 * Collapsible category section for customization options
 */
export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.header, { backgroundColor: theme.colors.backgroundSecondary }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {isExpanded ? (
          <ChevronDown size={20} color={theme.colors.textSecondary} />
        ) : (
          <ChevronRight size={20} color={theme.colors.textSecondary} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
