/**
 * Habit Template System
 *
 * Templates are reusable, shareable JSON objects that define habit configurations.
 * They can be exported, shared with other users, and imported.
 *
 * Design inspired by VS Code snippets, GitHub Gists, and Notion templates.
 */

export interface HabitTemplate {
  // Metadata
  id: string;
  version: '1.0'; // Template format version for future compatibility

  // Template Info
  name: string; // Template name (e.g., "Morning Routine", "Fitness Pack")
  description: string; // What this template is for
  notes?: string; // Optional notes/instructions (max 500 characters)
  author?: string; // Creator name (optional)
  tags: string[]; // Categories: fitness, wellness, productivity, etc.
  isDefault?: boolean; // Whether this is a built-in template
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp

  // Rich Metadata (New)
  type: 'build' | 'quit' | 'mixed'; // Build new habits or quit bad ones
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string; // e.g., "21 Days", "Lifetime"
  benefits: string[]; // List of key benefits (3-5 items)
  outcomes: string[]; // Expected results (2-3 items)
  timeline: { week: number; title: string; description: string }[]; // Journey milestones

  // Visual
  emoji: string; // Template icon
  color: string; // Theme color

  // Habit Configuration
  habits: HabitTemplateConfig[];
}

export interface HabitTemplateConfig {
  // Basic Info
  name: string;
  emoji: string;
  category: 'health' | 'fitness' | 'mindfulness' | 'productivity' | 'learning' | 'social' | 'finance' | 'creativity';
  notes?: string;
  timePeriod?: 'morning' | 'afternoon' | 'evening' | 'anytime';

  // Schedule
  frequency: 'daily' | 'weekly';
  frequencyType: 'single' | 'multiple'; // once per day vs multiple times per day
  targetCompletionsPerDay: number; // 1-20
  selectedDays: number[]; // 0=Sunday, 6=Saturday

  // Reminder (optional - user can configure after import)
  reminderEnabled: boolean;
  reminderTime: string | null; // HH:MM format
}

/**
 * Template Pack - Collection of related templates
 */
export interface TemplatePack {
  id: string;
  name: string;
  description: string;
  emoji: string;
  templates: HabitTemplate[];
  author?: string;
  tags: string[];
}

/**
 * Utility functions for templates
 */
export const TemplateUtils = {
  /**
   * Export template to JSON string (for sharing)
   */
  exportToJSON: (template: HabitTemplate): string => {
    return JSON.stringify(template, null, 2);
  },

  /**
   * Import template from JSON string
   */
  importFromJSON: (jsonString: string): HabitTemplate | null => {
    try {
      const template = JSON.parse(jsonString) as HabitTemplate;

      // Validate required fields
      if (!template.id || !template.version || !template.name || !template.habits) {
        throw new Error('Invalid template format');
      }

      // Validate version compatibility
      if (template.version !== '1.0') {
        throw new Error('Unsupported template version');
      }

      return template;
    } catch (error) {
      console.error('Failed to import template:', error);
      return null;
    }
  },

  /**
   * Generate unique ID for new template
   */
  generateId: (): string => {
    return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Validate template structure
   */
  validate: (template: Partial<HabitTemplate>): boolean => {
    return !!(
      template.name &&
      template.habits &&
      Array.isArray(template.habits) &&
      template.habits.length > 0
    );
  },
};
