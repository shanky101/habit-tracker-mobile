// Types
export * from './types/badges';

// Components
export { BadgeIcon } from './components/BadgeIcon';
export { BadgeDetailModal } from './components/BadgeDetailModal';
export { BadgeToast } from './components/BadgeToast';
export { UnlockOverlay } from './components/UnlockOverlay';

// Service
export {
    createBadgeService,
    type BadgeService,
    type BadgeDatabase,
    type BadgeEventContext,
    type BadgeEventType,
    type UserBadge,
    type BadgeProgress
} from './services/BadgeService';

// Store
export {
    createBadgeStore,
    type BadgeStore,
    type BadgeState
} from './store/badgeStore';

// Shaders
export * from './assets/badgeShaders';
