import { useMemo } from 'react';
import { useTemplateStore } from '@/store/templateStore';
import { DEFAULT_TEMPLATES } from '@/data/DefaultTemplates';
import { HabitTemplate } from '@/types/HabitTemplate';

/**
 * Hook to manage templates - combines default and user templates
 * Replaces the old useTemplates from TemplateContext
 */
export const useTemplates = () => {
    const { userTemplates, addTemplate, updateTemplate, deleteTemplate, getTemplateById: getById } = useTemplateStore();

    // Merge default and user templates
    const templates = useMemo(() => {
        return [...DEFAULT_TEMPLATES, ...userTemplates];
    }, [userTemplates]);

    // Get template by ID from merged list
    const getTemplateById = (id: string): HabitTemplate | undefined => {
        return templates.find(t => t.id === id);
    };

    // Export template as JSON string
    const exportTemplate = (id: string): string | null => {
        const template = getTemplateById(id);
        if (!template) return null;

        try {
            return JSON.stringify(template, null, 2);
        } catch (error) {
            console.error('[useTemplates] Export failed:', error);
            return null;
        }
    };

    // Import template from JSON string
    const importTemplate = async (jsonString: string): Promise<boolean> => {
        try {
            const template = JSON.parse(jsonString) as HabitTemplate;

            // Validate required fields
            if (!template.id || !template.name) {
                console.error('[useTemplates] Invalid template format');
                return false;
            }

            // Add to user templates
            await addTemplate(template);
            return true;
        } catch (error) {
            console.error('[useTemplates] Import failed:', error);
            return false;
        }
    };

    return {
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplateById,
        exportTemplate,
        importTemplate,
    };
};
