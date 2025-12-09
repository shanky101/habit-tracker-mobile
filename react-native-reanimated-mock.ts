// Mock for react-native-reanimated to satisfy optional dependencies
// This prevents crashes when libraries try to optionally load Reanimated

export const useSharedValue = (initialValue: any) => ({ value: initialValue });
export const useAnimatedStyle = (updater: any) => updater();
export const useDerivedValue = (updater: any) => ({ value: updater() });
export const withTiming = (toValue: any, config?: any) => toValue;
export const withSpring = (toValue: any, config?: any) => toValue;
export const withDelay = (delay: number, animation: any) => animation;
export const withSequence = (...animations: any[]) => animations[animations.length - 1];
export const withRepeat = (animation: any, numberOfReps?: number) => animation;
export const runOnJS = (fn: any) => fn;
export const createAnimatedComponent = (component: any) => component;
export const createWorkletRuntime = () => ({});
export const isSharedValue = (value: any) => false;
export const makeMutable = (value: any) => ({ value });
export const runOnUI = (fn: any) => fn;
export const useEvent = (handler: any, events: any) => handler;
export const useHandler = (handlers: any, dependencies: any) => ({ context: {}, doDependenciesDiff: () => false });
export const FadeIn = {};
export const FadeOut = {};
export const FadeInUp = {};
export const FadeOutUp = {};
export const Layout = {};
export const Easing = {
    linear: (t: number) => t,
    ease: (t: number) => t,
    quad: (t: number) => t * t,
    cubic: (t: number) => t * t * t,
};

const Reanimated = {
    useSharedValue,
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
    withSpring,
    withDelay,
    withSequence,
    withRepeat,
    runOnJS,
    createAnimatedComponent,
    createWorkletRuntime,
    isSharedValue,
    makeMutable,
    runOnUI,
    useEvent,
    useHandler,
    FadeIn,
    FadeOut,
    FadeInUp,
    FadeOutUp,
    Layout,
    Easing,
};

export default Reanimated;
