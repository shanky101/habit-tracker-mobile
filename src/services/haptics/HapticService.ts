import * as Haptics from 'expo-haptics';
import { BadgeTier } from '@app-core/achievements';

export const HapticService = {
    /**
     * Trigger haptic feedback based on badge tier.
     */
    async triggerUnlockHaptic(tier: BadgeTier) {
        switch (tier) {
            case 'bronze':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'silver':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
                break;
            case 'gold':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 150);
                break;
            case 'platinum':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
                setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 300);
                break;
            case 'diamond':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
                setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
                setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 400);
                break;
            case 'cosmic':
                // Long rumble effect simulation
                const pattern = [0, 50, 100, 150, 200, 300, 400];
                pattern.forEach((delay) => {
                    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), delay);
                });
                setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 600);
                break;
        }
    },

    /**
     * Simple light tap for UI interactions.
     */
    async light() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    /**
     * Medium tap for UI interactions.
     */
    async medium() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
};
