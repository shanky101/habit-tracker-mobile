import React from 'react';
import { InputModal, InputOption } from '@app-core/ui';

interface QuickNoteModalProps {
  visible: boolean;
  habitName: string;
  onSave: (note: string, mood?: string) => void;
  onSkip: () => void;
}

/**
 * QuickNoteModal - Wrapper around InputModal
 * 
 * Allows users to add notes and select moods after completing a habit.
 * Uses the generic InputModal with predefined mood options.
 */
export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  visible,
  habitName,
  onSave,
  onSkip,
}) => {
  const moods: InputOption[] = [
    { emoji: '🤩', label: 'Great', value: '🤩' },
    { emoji: '🙂', label: 'Good', value: '🙂' },
    { emoji: '😐', label: 'Okay', value: '😐' },
    { emoji: '😓', label: 'Hard', value: '😓' },
    { emoji: '😤', label: 'Proud', value: '😤' },
  ];

  return (
    <InputModal
      visible={visible}
      onDismiss={onSkip}
      title="Great Job!"
      subtitle={`How did ${habitName} go?`}
      inputPlaceholder="Add a note..."
      options={moods}
      saveLabel="Save Note"
      skipLabel="Skip"
      onSave={(note, mood) => onSave(note, mood)}
    />
  );
};

export default QuickNoteModal;
