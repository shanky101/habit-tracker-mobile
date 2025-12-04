import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HabiCustomization, DEFAULT_CUSTOMIZATION } from '@/types/mascotCustomization';
import { mascotStorage } from './mascotStorage';

interface MascotCustomizationState {
  // State
  customization: HabiCustomization;
  isHydrated: boolean;

  // Individual field updates
  updateName: (name: string) => void;
  updateEyes: (eyes: HabiCustomization['eyes']) => void;
  updateEyebrows: (eyebrows: HabiCustomization['eyebrows']) => void;
  updateMouth: (mouth: HabiCustomization['mouth']) => void;
  updateBlush: (enabled: boolean, color?: string) => void;
  updateHair: (style: HabiCustomization['hairStyle'], color: string) => void;
  updateHat: (hat: HabiCustomization['hat']) => void;
  updateGlasses: (glasses: HabiCustomization['glasses']) => void;
  updateBody: (color: string, pattern: HabiCustomization['pattern'], patternColor?: string) => void;
  updateNecklace: (necklace: HabiCustomization['necklace']) => void;
  updateSpecialEffect: (effect: HabiCustomization['specialEffect']) => void;

  // Bulk updates
  updateCustomization: (updates: Partial<HabiCustomization>) => void;
  resetToDefault: () => void;
  randomizeCustomization: () => void;

  // Internal
  setHydrated: (hydrated: boolean) => void;
}

/**
 * Helper: Generate random customization
 */
const generateRandomCustomization = (): Partial<HabiCustomization> => {
  const eyesOptions: HabiCustomization['eyes'][] = ['normal', 'happy', 'sleepy', 'determined', 'cute', 'mischievous'];
  const eyebrowsOptions: HabiCustomization['eyebrows'][] = ['none', 'normal', 'raised', 'furrowed', 'wavy'];
  const mouthOptions: HabiCustomization['mouth'][] = ['smile', 'grin', 'neutral', 'determined', 'sleepy', 'silly'];
  const hairOptions: HabiCustomization['hairStyle'][] = ['none', 'spiky', 'curly', 'long', 'bob', 'ponytail', 'mohawk', 'wizard'];
  const hatOptions: HabiCustomization['hat'][] = ['none', 'cap', 'beanie', 'crown', 'wizard', 'bow', 'headband', 'tophat', 'santa', 'party'];
  const glassesOptions: HabiCustomization['glasses'][] = ['none', 'round', 'square', 'sunglasses', 'reading', 'monocle', 'scifi', 'heart'];
  const patternOptions: HabiCustomization['pattern'][] = ['solid', 'spots', 'stripes', 'gradient', 'sparkles', 'none'];
  const necklaceOptions: HabiCustomization['necklace'][] = ['none', 'bowtie', 'bandana', 'necklace', 'scarf', 'medal'];
  const effectOptions: HabiCustomization['specialEffect'][] = ['none', 'sparkles', 'stars', 'hearts', 'glow'];

  const colorPalette = ['#7FD1AE', '#FFB6C1', '#87CEEB', '#DDA0DD', '#FFA07A', '#98FB98', '#F0E68C', '#E6E6FA'];
  const hairColorPalette = ['#8B4513', '#FFD700', '#FF6347', '#4B0082', '#00CED1', '#FF1493', '#000000', '#FFFFFF'];

  return {
    eyes: eyesOptions[Math.floor(Math.random() * eyesOptions.length)],
    eyebrows: eyebrowsOptions[Math.floor(Math.random() * eyebrowsOptions.length)],
    mouth: mouthOptions[Math.floor(Math.random() * mouthOptions.length)],
    blushEnabled: Math.random() > 0.5,
    hairStyle: hairOptions[Math.floor(Math.random() * hairOptions.length)],
    hairColor: hairColorPalette[Math.floor(Math.random() * hairColorPalette.length)],
    hat: hatOptions[Math.floor(Math.random() * hatOptions.length)],
    glasses: glassesOptions[Math.floor(Math.random() * glassesOptions.length)],
    bodyColor: colorPalette[Math.floor(Math.random() * colorPalette.length)],
    pattern: patternOptions[Math.floor(Math.random() * patternOptions.length)],
    patternColor: colorPalette[Math.floor(Math.random() * colorPalette.length)],
    necklace: necklaceOptions[Math.floor(Math.random() * necklaceOptions.length)],
    specialEffect: effectOptions[Math.floor(Math.random() * effectOptions.length)],
  };
};

export const useMascotCustomizationStore = create<MascotCustomizationState>()(
  persist(
    (set) => ({
      // Initial state
      customization: DEFAULT_CUSTOMIZATION,
      isHydrated: false,

      // Individual field updates
      updateName: (name) =>
        set((state) => ({
          customization: {
            ...state.customization,
            name,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateEyes: (eyes) =>
        set((state) => ({
          customization: {
            ...state.customization,
            eyes,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateEyebrows: (eyebrows) =>
        set((state) => ({
          customization: {
            ...state.customization,
            eyebrows,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateMouth: (mouth) =>
        set((state) => ({
          customization: {
            ...state.customization,
            mouth,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateBlush: (enabled, color) =>
        set((state) => ({
          customization: {
            ...state.customization,
            blushEnabled: enabled,
            blushColor: color || state.customization.blushColor,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateHair: (style, color) =>
        set((state) => ({
          customization: {
            ...state.customization,
            hairStyle: style,
            hairColor: color,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateHat: (hat) =>
        set((state) => ({
          customization: {
            ...state.customization,
            hat,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateGlasses: (glasses) =>
        set((state) => ({
          customization: {
            ...state.customization,
            glasses,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateBody: (color, pattern, patternColor) =>
        set((state) => ({
          customization: {
            ...state.customization,
            bodyColor: color,
            pattern,
            patternColor: pattern !== 'solid' ? patternColor : undefined,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateNecklace: (necklace) =>
        set((state) => ({
          customization: {
            ...state.customization,
            necklace,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateSpecialEffect: (effect) =>
        set((state) => ({
          customization: {
            ...state.customization,
            specialEffect: effect,
            updatedAt: new Date().toISOString(),
          },
        })),

      // Bulk updates
      updateCustomization: (updates) =>
        set((state) => ({
          customization: {
            ...state.customization,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        })),

      resetToDefault: () =>
        set({
          customization: {
            ...DEFAULT_CUSTOMIZATION,
            updatedAt: new Date().toISOString(),
          },
        }),

      randomizeCustomization: () =>
        set((state) => ({
          customization: {
            ...state.customization,
            ...generateRandomCustomization(),
            updatedAt: new Date().toISOString(),
          },
        })),

      // Internal
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'mascot-customization-store',
      storage: createJSONStorage(() => mascotStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // No migration needed yet, just return the state as-is
        return persistedState;
      },
      onRehydrateStorage: () => {
        console.log('[MascotStore] Starting hydration...');
        return (state, error) => {
          if (error) {
            console.error('[MascotStore] Hydration error:', error);
          } else {
            console.log('[MascotStore] Hydration complete');
            state?.setHydrated(true);
          }
        };
      },
    }
  )
);
