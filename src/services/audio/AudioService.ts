import { Audio } from 'expo-av';
import { BadgeTier } from '../../types/badges';

// Map tiers to sound files
// Note: These files need to be added to assets/sounds/
const SOUND_MAP: Record<BadgeTier, any> = {
    bronze: require('../../../assets/sounds/unlock_bronze.mp3'), // Placeholder paths
    silver: require('../../../assets/sounds/unlock_silver.mp3'),
    gold: require('../../../assets/sounds/unlock_gold.mp3'),
    platinum: require('../../../assets/sounds/unlock_platinum.mp3'),
    diamond: require('../../../assets/sounds/unlock_diamond.mp3'),
    cosmic: require('../../../assets/sounds/unlock_cosmic.mp3'),
};

export const AudioService = {
    soundObject: new Audio.Sound(),

    /**
     * Play unlock sound for a specific tier.
     */
    async playUnlockSound(tier: BadgeTier) {
        try {
            // Unload any previous sound
            await this.soundObject.unloadAsync();

            const source = SOUND_MAP[tier];
            if (!source) return;

            await this.soundObject.loadAsync(source);
            await this.soundObject.playAsync();
        } catch (error) {
            // Fail silently if sound file missing or playback fails
            console.log('Audio playback failed (assets might be missing):', error);
        }
    },

    /**
     * Preload sounds (optional optimization).
     */
    async preloadSounds() {
        // Implementation for preloading if needed
    }
};
