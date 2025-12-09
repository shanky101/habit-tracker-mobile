import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HabitTemplate } from '@/types/HabitTemplate';
import { StateStorage } from 'zustand/middleware';
import { templateRepository } from '@/data/repositories/templateRepository';
import { initializeDatabase } from '@/data/database/initialize';

// Track if database has been initialized
let dbInitialized = false;
let dbInitializing = false;

/**
 * Ensure database is initialized before any operations
 */
const ensureDbInitialized = async (): Promise<void> => {
    if (dbInitialized) return;

    if (dbInitializing) {
        while (dbInitializing) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return;
    }

    dbInitializing = true;
    try {
        console.log('[TemplateStorage] Initializing database');
        await initializeDatabase();
        dbInitialized = true;
    } catch (error) {
        console.error('[TemplateStorage] Database initialization failed:', error);
        dbInitializing = false;
        throw error;
    }
    dbInitializing = false;
};

/**
 * SQLite storage adapter for template store
 */
const templateStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            await ensureDbInitialized();
            console.log('[TemplateStorage] getItem called');

            const templates = await templateRepository.getUserTemplates();

            const state = {
                state: {
                    userTemplates: templates,
                    isHydrated: false,
                },
                version: 1,
            };

            return JSON.stringify(state);
        } catch (error) {
            console.error('[TemplateStorage] getItem error:', error);
            return JSON.stringify({
                state: {
                    userTemplates: [],
                    isHydrated: false,
                },
                version: 1,
            });
        }
    },

    setItem: async (name: string, value: string): Promise<void> => {
        try {
            await ensureDbInitialized();
            console.log('[TemplateStorage] setItem called');

            const parsed = JSON.parse(value);
            const { state } = parsed;

            if (!state?.userTemplates || !Array.isArray(state.userTemplates)) {
                console.warn('[TemplateStorage] Invalid state, skipping sync');
                return;
            }

            await templateRepository.syncAll(state.userTemplates);
        } catch (error) {
            console.error('[TemplateStorage] setItem error:', error);
        }
    },

    removeItem: async (name: string): Promise<void> => {
        try {
            await ensureDbInitialized();
            console.log('[TemplateStorage] removeItem called');
            await templateRepository.deleteAll();
        } catch (error) {
            console.error('[TemplateStorage] removeItem error:', error);
        }
    },
};

interface TemplateState {
    // State
    userTemplates: HabitTemplate[];
    isHydrated: boolean;

    // Actions
    addTemplate: (template: HabitTemplate) => Promise<void>;
    updateTemplate: (id: string, updates: Partial<HabitTemplate>) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    getTemplateById: (id: string) => HabitTemplate | undefined;
    setHydrated: () => void;
}

/**
 * Template store with SQLite persistence
 */
export const useTemplateStore = create<TemplateState>()(
    persist(
        (set, get) => ({
            // Initial state
            userTemplates: [],
            isHydrated: false,

            // Actions
            addTemplate: async (template: HabitTemplate) => {
                set(state => ({
                    userTemplates: [...state.userTemplates, template],
                }));
            },

            updateTemplate: async (id: string, updates: Partial<HabitTemplate>) => {
                set(state => ({
                    userTemplates: state.userTemplates.map(t =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                }));
            },

            deleteTemplate: async (id: string) => {
                set(state => ({
                    userTemplates: state.userTemplates.filter(t => t.id !== id),
                }));
            },

            getTemplateById: (id: string) => {
                return get().userTemplates.find(t => t.id === id);
            },

            setHydrated: () => {
                set({ isHydrated: true });
            },
        }),
        {
            name: 'template-storage',
            storage: createJSONStorage(() => templateStorage),
            onRehydrateStorage: () => (state) => {
                console.log('[TemplateStore] Hydration complete');
                if (state) {
                    state.setHydrated();
                }
            },
        }
    )
);
