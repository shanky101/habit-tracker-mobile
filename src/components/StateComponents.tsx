import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useTheme } from '@/theme';

// ============================================
// LOADING STATE COMPONENT
// ============================================
interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'large',
  fullScreen = true,
}) => {
  const { theme } = useTheme();

  const content = (
    <View style={styles.centered}>
      <ActivityIndicator
        size={size}
        color={theme.colors.primary}
        style={styles.spinner}
      />
      <Text
        style={[
          styles.loadingText,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeSM,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme.colors.background }]}>
        {content}
      </View>
    );
  }

  return content;
};

// ============================================
// ERROR STATE COMPONENT
// ============================================
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: string;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We couldn\'t load the content. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  icon = '⚠️',
  fullScreen = true,
}) => {
  const { theme } = useTheme();

  const content = (
    <View style={styles.centered}>
      <Text style={styles.stateIcon}>{icon}</Text>
      <Text
        style={[
          styles.stateTitle,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyDisplayBold,
            fontSize: theme.typography.fontSizeXL,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.stateMessage,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeSM,
            lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
          },
        ]}
      >
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.retryButtonText,
              {
                color: '#FFFFFF',
                fontFamily: theme.typography.fontFamilyBodySemibold,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {retryLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme.colors.background }]}>
        {content}
      </View>
    );
  }

  return content;
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================
interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  fullScreen?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  message = 'Get started by adding your first item.',
  icon = '📭',
  actionLabel,
  onAction,
  fullScreen = true,
}) => {
  const { theme } = useTheme();

  const content = (
    <View style={styles.centered}>
      <Text style={styles.stateIcon}>{icon}</Text>
      <Text
        style={[
          styles.stateTitle,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyDisplayBold,
            fontSize: theme.typography.fontSizeXL,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.stateMessage,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeSM,
            lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
          },
        ]}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: '#FFFFFF',
                fontFamily: theme.typography.fontFamilyBodySemibold,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme.colors.background }]}>
        {content}
      </View>
    );
  }

  return content;
};

// ============================================
// SUCCESS STATE COMPONENT
// ============================================
interface SuccessStateProps {
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  fullScreen?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  onAutoHide?: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title = 'Success!',
  message = 'Your action was completed successfully.',
  icon = '✅',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  fullScreen = true,
  autoHide = false,
  autoHideDelay = 3000,
  onAutoHide,
}) => {
  const { theme } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide
    if (autoHide && onAutoHide) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onAutoHide());
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onAutoHide, fadeAnim, scaleAnim]);

  const content = (
    <Animated.View
      style={[
        styles.centered,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.successIconContainer,
          { backgroundColor: theme.colors.success + '20' },
        ]}
      >
        <Text style={styles.successIcon}>{icon}</Text>
      </View>
      <Text
        style={[
          styles.stateTitle,
          {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyDisplayBold,
            fontSize: theme.typography.fontSizeXL,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.stateMessage,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamilyBody,
            fontSize: theme.typography.fontSizeSM,
            lineHeight: theme.typography.fontSizeSM * theme.typography.lineHeightRelaxed,
          },
        ]}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: '#FFFFFF',
                fontFamily: theme.typography.fontFamilyBodySemibold,
                fontSize: theme.typography.fontSizeMD,
              },
            ]}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
      {secondaryActionLabel && onSecondaryAction && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onSecondaryAction}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              {
                color: theme.colors.primary,
                fontFamily: theme.typography.fontFamilyBodyMedium,
                fontSize: theme.typography.fontSizeSM,
              },
            ]}
          >
            {secondaryActionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme.colors.background }]}>
        {content}
      </View>
    );
  }

  return content;
};

// ============================================
// SKELETON LOADER COMPONENT
// ============================================
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { theme } = useTheme();
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ============================================
// SKELETON LIST COMPONENT
// ============================================
interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
  spacing?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  itemHeight = 80,
  spacing = 12,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonItem,
            {
              height: itemHeight,
              marginBottom: index < count - 1 ? spacing : 0,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.skeletonItemContent}>
            <Skeleton width={48} height={48} borderRadius={12} />
            <View style={styles.skeletonItemText}>
              <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="40%" height={12} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

// ============================================
// CONNECTION ERROR STATE
// ============================================
interface ConnectionErrorProps {
  onRetry?: () => void;
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({ onRetry }) => {
  return (
    <ErrorState
      icon="📡"
      title="No Internet Connection"
      message="Please check your connection and try again."
      onRetry={onRetry}
      retryLabel="Retry"
    />
  );
};

// ============================================
// PERMISSION DENIED STATE
// ============================================
interface PermissionDeniedProps {
  permissionType: string;
  onOpenSettings?: () => void;
}

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({
  permissionType,
  onOpenSettings,
}) => {
  return (
    <ErrorState
      icon="🔒"
      title="Permission Required"
      message={`Please grant ${permissionType} permission to use this feature.`}
      onRetry={onOpenSettings}
      retryLabel="Open Settings"
    />
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
  },
  stateIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  stateTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  stateMessage: {
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    textAlign: 'center',
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    textAlign: 'center',
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 12,
  },
  secondaryButtonText: {
    textAlign: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
  },
  skeletonList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  skeletonItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  skeletonItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonItemText: {
    flex: 1,
    marginLeft: 12,
  },
});
