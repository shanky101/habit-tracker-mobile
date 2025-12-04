import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/theme';

interface ColorPickerButtonProps {
  label: string;
  color: string;
  onColorChange: (color: string) => void;
}

// Preset color palette
const COLOR_PALETTE = [
  '#7FD1AE', // Habi green (default)
  '#FFB6C1', // Light pink
  '#87CEEB', // Sky blue
  '#DDA0DD', // Plum
  '#FFA07A', // Light salmon
  '#98FB98', // Pale green
  '#F0E68C', // Khaki
  '#E6E6FA', // Lavender
  '#FFD700', // Gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Purple
  '#FCBAD3', // Pink
  '#FFFFD2', // Cream
];

/**
 * Color picker button with modal selector
 */
export const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({
  label,
  color,
  onColorChange,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleColorSelect = (selectedColor: string) => {
    onColorChange(selectedColor);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
        <TouchableOpacity
          style={[styles.button, { borderColor: theme.colors.border }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.colorPreview, { backgroundColor: color }]} />
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            {color.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Choose Color
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.colorGrid}>
              {COLOR_PALETTE.map((paletteColor) => (
                <TouchableOpacity
                  key={paletteColor}
                  style={[
                    styles.colorOption,
                    { backgroundColor: paletteColor },
                    color === paletteColor && styles.colorOptionSelected,
                  ]}
                  onPress={() => handleColorSelect(paletteColor)}
                  activeOpacity={0.7}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#000',
    borderWidth: 3,
  },
});
