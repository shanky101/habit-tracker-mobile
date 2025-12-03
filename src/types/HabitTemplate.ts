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
 * Default Built-in Templates
 */
export const DEFAULT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'morning-routine',
    version: '1.0',
    name: 'Morning Routine',
    description: 'Start your day with energy and focus',
    emoji: '🌅',
    color: 'orange',
    tags: ['wellness', 'productivity', 'morning'],
    isDefault: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    habits: [
      {
        name: 'Wake up early',
        emoji: '⏰',
        category: 'health',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: true,
        reminderTime: '06:00',
        notes: 'Aim for 6-7 AM to establish a consistent routine',
      },
      {
        name: 'Morning meditation',
        emoji: '🧘',
        category: 'mindfulness',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: false,
        reminderTime: null,
        notes: '10-15 minutes of mindfulness to start the day',
      },
      {
        name: 'Healthy breakfast',
        emoji: '🥗',
        category: 'health',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: false,
        reminderTime: null,
      },
    ],
  },
  {
    id: 'fitness-fundamentals',
    version: '1.0',
    name: 'Fitness Fundamentals',
    description: 'Build a strong foundation for physical health',
    emoji: '💪',
    color: 'red',
    tags: ['fitness', 'health', 'exercise'],
    isDefault: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    habits: [
      {
        name: 'Morning workout',
        emoji: '🏋️',
        category: 'fitness',
        frequency: 'weekly',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [1, 3, 5], // Mon, Wed, Fri
        reminderEnabled: true,
        reminderTime: '07:00',
        notes: '30-45 minutes of strength training',
      },
      {
        name: 'Drink water',
        emoji: '💧',
        category: 'health',
        frequency: 'daily',
        frequencyType: 'multiple',
        targetCompletionsPerDay: 8,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: false,
        reminderTime: null,
        notes: 'Aim for 8 glasses per day',
      },
      {
        name: 'Evening walk',
        emoji: '🚶',
        category: 'fitness',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: true,
        reminderTime: '18:00',
        notes: '20-30 minutes of light cardio',
      },
    ],
  },
  {
    id: 'productivity-power',
    version: '1.0',
    name: 'Productivity Power',
    description: 'Maximize your daily output and focus',
    emoji: '🚀',
    color: 'blue',
    tags: ['productivity', 'work', 'focus'],
    isDefault: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    habits: [
      {
        name: 'Review daily goals',
        emoji: '📋',
        category: 'productivity',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [1, 2, 3, 4, 5], // Weekdays
        reminderEnabled: true,
        reminderTime: '09:00',
        notes: 'Set 3 key priorities for the day',
      },
      {
        name: 'Deep work session',
        emoji: '🎯',
        category: 'productivity',
        frequency: 'daily',
        frequencyType: 'multiple',
        targetCompletionsPerDay: 2,
        selectedDays: [1, 2, 3, 4, 5],
        reminderEnabled: false,
        reminderTime: null,
        notes: '90-minute focused work blocks',
      },
      {
        name: 'Inbox zero',
        emoji: '📧',
        category: 'productivity',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [1, 2, 3, 4, 5],
        reminderEnabled: true,
        reminderTime: '16:00',
        notes: 'Clear email and messages',
      },
    ],
  },
  {
    id: 'learning-journey',
    version: '1.0',
    name: 'Learning Journey',
    description: 'Continuous growth and skill development',
    emoji: '📚',
    color: 'purple',
    tags: ['learning', 'education', 'growth'],
    isDefault: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    habits: [
      {
        name: 'Read for 30 minutes',
        emoji: '📖',
        category: 'learning',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: true,
        reminderTime: '21:00',
        notes: 'Books, articles, or research papers',
      },
      {
        name: 'Practice new skill',
        emoji: '🎨',
        category: 'learning',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: false,
        reminderTime: null,
        notes: 'Coding, language, instrument, etc.',
      },
      {
        name: 'Watch educational content',
        emoji: '🎓',
        category: 'learning',
        frequency: 'weekly',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [0, 6], // Weekends
        reminderEnabled: false,
        reminderTime: null,
        notes: 'Documentaries, courses, tutorials',
      },
    ],
  },
  {
    id: 'mindfulness-peace',
    version: '1.0',
    name: 'Mindfulness & Peace',
    description: 'Cultivate inner calm and mental clarity',
    emoji: '🧠',
    color: 'teal',
    tags: ['mindfulness', 'mental-health', 'wellness'],
    isDefault: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    habits: [
      {
        name: 'Morning meditation',
        emoji: '🧘',
        category: 'mindfulness',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: true,
        reminderTime: '07:00',
        notes: '10-15 minutes of guided or silent meditation',
      },
      {
        name: 'Gratitude journaling',
        emoji: '📝',
        category: 'mindfulness',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: true,
        reminderTime: '22:00',
        notes: 'Write 3 things you\'re grateful for',
      },
      {
        name: 'Digital detox hour',
        emoji: '📵',
        category: 'mindfulness',
        frequency: 'daily',
        frequencyType: 'single',
        targetCompletionsPerDay: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6],
        reminderEnabled: false,
        reminderTime: null,
        notes: 'One hour without screens before bed',
      },
    ],
  },
];

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
