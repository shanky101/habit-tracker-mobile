import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitTemplate, DEFAULT_TEMPLATES, TemplateUtils } from '@/types/HabitTemplate';

const TEMPLATES_STORAGE_KEY = '@habit_tracker_templates';

interface TemplateContextType {
  templates: HabitTemplate[];
  addTemplate: (template: HabitTemplate) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<HabitTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  exportTemplate: (id: string) => string | null;
  importTemplate: (jsonString: string) => Promise<boolean>;
  getTemplateById: (id: string) => HabitTemplate | undefined;
  refreshTemplates: () => Promise<void>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<HabitTemplate[]>(DEFAULT_TEMPLATES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load templates from storage on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Save templates to storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveTemplates();
    }
  }, [templates, isLoaded]);

  const loadTemplates = async () => {
    try {
      const stored = await AsyncStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (stored) {
        const userTemplates = JSON.parse(stored) as HabitTemplate[];
        // Merge default templates with user templates
        const allTemplates = [
          ...DEFAULT_TEMPLATES,
          ...userTemplates.filter(t => !t.isDefault),
        ];
        setTemplates(allTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveTemplates = async () => {
    try {
      // Only save user-created templates (not default ones)
      const userTemplates = templates.filter(t => !t.isDefault);
      await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(userTemplates));
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  };

  const addTemplate = async (template: HabitTemplate) => {
    setTemplates(prev => [...prev, template]);
  };

  const updateTemplate = async (id: string, updates: Partial<HabitTemplate>) => {
    setTemplates(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const deleteTemplate = async (id: string) => {
    // Don't allow deleting default templates
    const template = templates.find(t => t.id === id);
    if (template?.isDefault) {
      throw new Error('Cannot delete default templates');
    }
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const exportTemplate = (id: string): string | null => {
    const template = templates.find(t => t.id === id);
    if (!template) return null;
    return TemplateUtils.exportToJSON(template);
  };

  const importTemplate = async (jsonString: string): Promise<boolean> => {
    const template = TemplateUtils.importFromJSON(jsonString);
    if (!template) return false;

    // Generate new ID to avoid conflicts
    const newTemplate = {
      ...template,
      id: TemplateUtils.generateId(),
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    await addTemplate(newTemplate);
    return true;
  };

  const getTemplateById = (id: string): HabitTemplate | undefined => {
    return templates.find(t => t.id === id);
  };

  const refreshTemplates = async () => {
    await loadTemplates();
  };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        exportTemplate,
        importTemplate,
        getTemplateById,
        refreshTemplates,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplates must be used within TemplateProvider');
  }
  return context;
};
