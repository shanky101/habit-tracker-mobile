import { useMascotCustomizationStore } from '../store/mascotStore';
import { HabiCustomization } from '@/types/mascotCustomization';

/**
 * Hook for accessing and updating mascot customization
 * Provides a clean interface to the Zustand store
 */
export const useMascotCustomization = () => {
  // State selectors
  const customization = useMascotCustomizationStore((state) => state.customization);
  const isHydrated = useMascotCustomizationStore((state) => state.isHydrated);

  // Individual field update actions
  const updateName = useMascotCustomizationStore((state) => state.updateName);
  const updateEyes = useMascotCustomizationStore((state) => state.updateEyes);
  const updateEyebrows = useMascotCustomizationStore((state) => state.updateEyebrows);
  const updateMouth = useMascotCustomizationStore((state) => state.updateMouth);
  const updateBlush = useMascotCustomizationStore((state) => state.updateBlush);
  const updateHair = useMascotCustomizationStore((state) => state.updateHair);
  const updateHat = useMascotCustomizationStore((state) => state.updateHat);
  const updateGlasses = useMascotCustomizationStore((state) => state.updateGlasses);
  const updateBody = useMascotCustomizationStore((state) => state.updateBody);
  const updateNecklace = useMascotCustomizationStore((state) => state.updateNecklace);
  const updateSpecialEffect = useMascotCustomizationStore((state) => state.updateSpecialEffect);

  // Bulk update actions
  const updateCustomization = useMascotCustomizationStore((state) => state.updateCustomization);
  const resetToDefault = useMascotCustomizationStore((state) => state.resetToDefault);
  const randomizeCustomization = useMascotCustomizationStore((state) => state.randomizeCustomization);

  return {
    // State
    customization,
    isHydrated,

    // Individual updates
    updateName,
    updateEyes,
    updateEyebrows,
    updateMouth,
    updateBlush,
    updateHair,
    updateHat,
    updateGlasses,
    updateBody,
    updateNecklace,
    updateSpecialEffect,

    // Bulk updates
    updateCustomization,
    resetToDefault,
    randomizeCustomization,
  };
};

// Re-export types for convenience
export type { HabiCustomization };
