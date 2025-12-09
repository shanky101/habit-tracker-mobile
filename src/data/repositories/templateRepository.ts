import { db } from '../database/client';
import { HabitTemplate } from '@/types/HabitTemplate';

export interface TemplateRow {
    id: string;
    version: string;
    name: string;
    description: string;
    notes: string | null;
    author: string | null;
    tags: string; // JSON string
    is_default: number;
    created_at: string;
    updated_at: string | null;
    type: string;
    difficulty: string;
    duration: string;
    benefits: string; // JSON string
    outcomes: string; // JSON string
    timeline: string; // JSON string
    emoji: string;
    color: string;
    habits: string; // JSON string
}

/**
 * Convert database row to HabitTemplate
 */
const rowToTemplate = (row: TemplateRow): HabitTemplate => {
    return {
        id: row.id,
        version: row.version as '1.0',
        name: row.name,
        description: row.description,
        notes: row.notes || undefined,
        author: row.author || undefined,
        tags: JSON.parse(row.tags),
        isDefault: row.is_default === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at || undefined,
        type: row.type as 'build' | 'quit' | 'mixed',
        difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
        duration: row.duration,
        benefits: JSON.parse(row.benefits),
        outcomes: JSON.parse(row.outcomes),
        timeline: JSON.parse(row.timeline),
        emoji: row.emoji,
        color: row.color,
        habits: JSON.parse(row.habits),
    };
};

/**
 * Convert HabitTemplate to database values
 */
const templateToValues = (template: HabitTemplate): any[] => {
    const now = new Date().toISOString();
    return [
        template.id,
        template.version,
        template.name,
        template.description,
        template.notes || null,
        template.author || null,
        JSON.stringify(template.tags),
        template.isDefault ? 1 : 0,
        template.createdAt || now,
        template.updatedAt || now,
        template.type,
        template.difficulty,
        template.duration,
        JSON.stringify(template.benefits),
        JSON.stringify(template.outcomes),
        JSON.stringify(template.timeline),
        template.emoji,
        template.color,
        JSON.stringify(template.habits),
    ];
};

/**
 * Repository for template data access
 */
export const templateRepository = {
    /**
     * Get all templates
     */
    getAll: async (): Promise<HabitTemplate[]> => {
        try {
            const rows = db.getAllSync<TemplateRow>(
                'SELECT * FROM habit_templates ORDER BY created_at DESC'
            );
            return rows.map(rowToTemplate);
        } catch (error) {
            console.error('[TemplateRepository] getAll failed:', error);
            return [];
        }
    },

    /**
     * Get template by ID
     */
    getById: async (id: string): Promise<HabitTemplate | null> => {
        try {
            const row = db.getFirstSync<TemplateRow>(
                'SELECT * FROM habit_templates WHERE id = ?',
                [id]
            );
            return row ? rowToTemplate(row) : null;
        } catch (error) {
            console.error('[TemplateRepository] getById failed:', error);
            return null;
        }
    },

    /**
     * Get user-created templates only
     */
    getUserTemplates: async (): Promise<HabitTemplate[]> => {
        try {
            const rows = db.getAllSync<TemplateRow>(
                'SELECT * FROM habit_templates WHERE is_default = 0 ORDER BY created_at DESC'
            );
            return rows.map(rowToTemplate);
        } catch (error) {
            console.error('[TemplateRepository] getUserTemplates failed:', error);
            return [];
        }
    },

    /**
     * Add a new template
     */
    create: async (template: HabitTemplate): Promise<void> => {
        try {
            db.runSync(
                `INSERT INTO habit_templates (
          id, version, name, description, notes, author, tags, is_default,
          created_at, updated_at, type, difficulty, duration, benefits,
          outcomes, timeline, emoji, color, habits
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                templateToValues(template)
            );
            console.log('[TemplateRepository] Template created:', template.id);
        } catch (error) {
            console.error('[TemplateRepository] create failed:', error);
            throw error;
        }
    },

    /**
     * Update an existing template
     */
    update: async (id: string, updates: Partial<HabitTemplate>): Promise<void> => {
        try {
            const existing = await templateRepository.getById(id);
            if (!existing) throw new Error('Template not found');

            const updated = { ...existing, ...updates };
            const now = new Date().toISOString();
            updated.updatedAt = now;

            db.runSync(
                `UPDATE habit_templates SET
          version = ?, name = ?, description = ?, notes = ?, author = ?, tags = ?,
          is_default = ?, created_at = ?, updated_at = ?, type = ?, difficulty = ?,
          duration = ?, benefits = ?, outcomes = ?, timeline = ?, emoji = ?,
          color = ?, habits = ?
        WHERE id = ?`,
                [
                    updated.version,
                    updated.name,
                    updated.description,
                    updated.notes || null,
                    updated.author || null,
                    JSON.stringify(updated.tags),
                    updated.isDefault ? 1 : 0,
                    updated.createdAt,
                    updated.updatedAt,
                    updated.type,
                    updated.difficulty,
                    updated.duration,
                    JSON.stringify(updated.benefits),
                    JSON.stringify(updated.outcomes),
                    JSON.stringify(updated.timeline),
                    updated.emoji,
                    updated.color,
                    JSON.stringify(updated.habits),
                    id,
                ]
            );
            console.log('[TemplateRepository] Template updated:', id);
        } catch (error) {
            console.error('[TemplateRepository] update failed:', error);
            throw error;
        }
    },

    /**
     * Delete a template
     */
    delete: async (id: string): Promise<void> => {
        try {
            db.runSync('DELETE FROM habit_templates WHERE id = ?', [id]);
            console.log('[TemplateRepository] Template deleted:', id);
        } catch (error) {
            console.error('[TemplateRepository] delete failed:', error);
            throw error;
        }
    },

    /**
     * Sync all templates (for Zustand persist)
     */
    syncAll: async (templates: HabitTemplate[]): Promise<void> => {
        try {
            db.withTransactionSync(() => {
                // Only delete user-created templates (preserve defaults)
                db.runSync('DELETE FROM habit_templates WHERE is_default = 0');

                // Insert user-created templates
                const userTemplates = templates.filter(t => !t.isDefault);
                userTemplates.forEach(template => {
                    db.runSync(
                        `INSERT INTO habit_templates (
              id, version, name, description, notes, author, tags, is_default,
              created_at, updated_at, type, difficulty, duration, benefits,
              outcomes, timeline, emoji, color, habits
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        templateToValues(template)
                    );
                });
            });
            console.log(`[TemplateRepository] Synced ${templates.filter(t => !t.isDefault).length} user templates`);
        } catch (error) {
            console.error('[TemplateRepository] syncAll failed:', error);
        }
    },

    /**
     * Delete all templates
     */
    deleteAll: async (): Promise<void> => {
        try {
            db.runSync('DELETE FROM habit_templates WHERE is_default = 0');
            console.log('[TemplateRepository] All user templates deleted');
        } catch (error) {
            console.error('[TemplateRepository] deleteAll failed:', error);
            throw error;
        }
    },
};
