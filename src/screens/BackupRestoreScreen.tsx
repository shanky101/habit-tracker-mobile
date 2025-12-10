import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@app-core/theme';
import { BackupService, AutomaticBackup, BackupInfo } from '@/services/backup';
import * as Haptics from 'expo-haptics';

/**
 * BackupRestoreScreen - Premium feature for backup and restore
 */
export const BackupRestoreScreen: React.FC = () => {
  const { theme } = useTheme();
  const [isPremium, setIsPremium] = useState(true); // TODO: Connect to actual premium status
  const [isAvailable, setIsAvailable] = useState(false);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [progress, setProgress] = useState<{ percent: number; message: string } | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    setLoading(true);
    try {
      // Check if backup service is available
      const available = await BackupService.isAvailable();
      setIsAvailable(available);
      setIsSignedIn(available);

      if (available) {
        // Load backups
        await loadBackups();

        // Check auto-backup status
        const enabled = await AutomaticBackup.isEnabled();
        setAutoBackupEnabled(enabled);

        // Get last backup time
        const lastTime = await AutomaticBackup.getLastBackupTime();
        setLastBackup(lastTime);
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBackups = async () => {
    try {
      const backupList = await BackupService.listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Failed to load backups:', error);
      Alert.alert('Error', 'Failed to load backups');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBackups();
    setRefreshing(false);
  };

  const handleSignIn = async () => {
    if (Platform.OS !== 'android') return;

    setLoading(true);
    try {
      const result = await BackupService.signIn();
      if (result.success) {
        setIsSignedIn(true);
        await loadBackups();
        Alert.alert('Success', 'Signed in to Google Drive');
      } else {
        Alert.alert('Sign In Failed', result.error || 'Failed to sign in');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setLoading(true);
    setProgress({ percent: 0, message: 'Starting backup...' });

    try {
      const result = await BackupService.createBackup((percent, message) => {
        setProgress({ percent, message: message || 'Backing up...' });
      });

      setProgress(null);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Backup Complete', result.message || 'Your data has been backed up successfully');
        await loadBackups();

        // Update last backup time
        const lastTime = await AutomaticBackup.getLastBackupTime();
        setLastBackup(lastTime);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Backup Failed', result.error || 'Failed to create backup');
      }
    } catch (error) {
      setProgress(null);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = (backup: BackupInfo) => {
    Alert.alert(
      'Restore Backup',
      `This will replace all current data with the backup from ${backup.date.toLocaleDateString()}. This action cannot be undone.\n\nAre you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => performRestore(backup.id),
        },
      ]
    );
  };

  const performRestore = async (backupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setLoading(true);
    setProgress({ percent: 0, message: 'Starting restore...' });

    try {
      const result = await BackupService.restoreBackup(backupId, (percent, message) => {
        setProgress({ percent, message: message || 'Restoring...' });
      });

      setProgress(null);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Restore Complete',
          result.message || `Successfully restored ${result.restoredHabits} habits and ${result.restoredCompletions} completions`,
          [{ text: 'OK', onPress: () => {} }]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Restore Failed', result.error || 'Failed to restore backup');
      }
    } catch (error) {
      setProgress(null);
      Alert.alert('Error', 'An unexpected error occurred during restore');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = (backup: BackupInfo) => {
    Alert.alert(
      'Delete Backup',
      `Delete backup from ${backup.date.toLocaleDateString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => performDelete(backup.id),
        },
      ]
    );
  };

  const performDelete = async (backupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await BackupService.deleteBackup(backupId);
      if (result.success) {
        await loadBackups();
        Alert.alert('Deleted', 'Backup deleted successfully');
      } else {
        Alert.alert('Delete Failed', result.error || 'Failed to delete backup');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete backup');
    }
  };

  const handleToggleAutoBackup = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setLoading(true);
    try {
      if (autoBackupEnabled) {
        const result = await AutomaticBackup.disable();
        if (result.success) {
          setAutoBackupEnabled(false);
          Alert.alert('Disabled', 'Automatic backups have been disabled');
        } else {
          Alert.alert('Error', result.error || 'Failed to disable automatic backups');
        }
      } else {
        const result = await AutomaticBackup.enable();
        if (result.success) {
          setAutoBackupEnabled(true);
          Alert.alert('Enabled', 'Automatic backups will run daily');
        } else {
          Alert.alert('Error', result.error || 'Failed to enable automatic backups');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle automatic backups');
    } finally {
      setLoading(false);
    }
  };

  // Premium gate
  if (!isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.premiumGate}>
          <Text style={[styles.premiumIcon, { color: theme.colors.primary }]}>👑</Text>
          <Text style={[styles.premiumTitle, { color: theme.colors.text }]}>
            Premium Feature
          </Text>
          <Text style={[styles.premiumDescription, { color: theme.colors.textSecondary }]}>
            Backup and restore is available for premium users. Upgrade to protect your habit data.
          </Text>
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              // TODO: Navigate to premium upgrade screen
              Alert.alert('Coming Soon', 'Premium upgrade flow will be added');
            }}
          >
            <Text style={[styles.upgradeButtonText, { color: '#FFFFFF' }]}>
              Upgrade to Premium
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Not signed in (Android only)
  if (!isSignedIn && Platform.OS === 'android') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.signInPrompt}>
          <Text style={[styles.signInIcon, { color: theme.colors.primary }]}>📱</Text>
          <Text style={[styles.signInTitle, { color: theme.colors.text }]}>
            Sign In Required
          </Text>
          <Text style={[styles.signInDescription, { color: theme.colors.textSecondary }]}>
            Sign in with your Google account to backup and restore your data to Google Drive.
          </Text>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.signInButtonText, { color: '#FFFFFF' }]}>
                Sign in with Google
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Backup & Restore
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Backup to {BackupService.getProviderName()}
          </Text>
        </View>

        {/* Manual Backup Button */}
        <TouchableOpacity
          style={[
            styles.createBackupButton,
            { backgroundColor: theme.colors.primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleCreateBackup}
          disabled={loading}
        >
          {loading && progress ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.progressText}>{progress.message}</Text>
              <Text style={styles.progressPercent}>{Math.round(progress.percent)}%</Text>
            </View>
          ) : (
            <>
              <Text style={styles.createBackupIcon}>💾</Text>
              <Text style={styles.createBackupText}>Create Backup Now</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Last Backup Info */}
        {lastBackup && (
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Last Backup
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {lastBackup.toLocaleString()}
            </Text>
          </View>
        )}

        {/* Automatic Backup Toggle */}
        <View style={[styles.autoBackupCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.autoBackupHeader}>
            <View>
              <Text style={[styles.autoBackupTitle, { color: theme.colors.text }]}>
                Automatic Backup
              </Text>
              <Text style={[styles.autoBackupDescription, { color: theme.colors.textSecondary }]}>
                {AutomaticBackup.getFrequencyDescription()}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                autoBackupEnabled
                  ? { backgroundColor: theme.colors.primary }
                  : { backgroundColor: theme.colors.border },
              ]}
              onPress={handleToggleAutoBackup}
              disabled={loading}
            >
              <View
                style={[
                  styles.toggleKnob,
                  autoBackupEnabled && styles.toggleKnobActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Backups List */}
        <View style={styles.backupsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Available Backups ({backups.length})
          </Text>

          {backups.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.emptyIcon, { color: theme.colors.textSecondary }]}>📦</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No backups yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
                Create your first backup to protect your data
              </Text>
            </View>
          ) : (
            backups.map((backup) => (
              <View
                key={backup.id}
                style={[styles.backupCard, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.backupInfo}>
                  <Text style={[styles.backupDate, { color: theme.colors.text }]}>
                    {backup.date.toLocaleDateString()} at {backup.date.toLocaleTimeString()}
                  </Text>
                  <View style={styles.backupMeta}>
                    <Text style={[styles.backupMetaText, { color: theme.colors.textSecondary }]}>
                      {backup.habitCount} habits
                    </Text>
                    <Text style={[styles.backupMetaText, { color: theme.colors.textSecondary }]}>
                      • {backup.size}
                    </Text>
                    <Text style={[styles.backupMetaText, { color: theme.colors.textSecondary }]}>
                      • {backup.platform === 'ios' ? '📱' : '🤖'}
                    </Text>
                  </View>
                </View>

                <View style={styles.backupActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => handleRestoreBackup(backup)}
                  >
                    <Text style={styles.actionButtonText}>Restore</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                    onPress={() => handleDeleteBackup(backup)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  createBackupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  createBackupIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  createBackupText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  progressPercent: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  autoBackupCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  autoBackupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoBackupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  autoBackupDescription: {
    fontSize: 12,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  backupsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  backupCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  backupInfo: {
    marginBottom: 12,
  },
  backupDate: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  backupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backupMetaText: {
    fontSize: 13,
  },
  backupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Premium gate
  premiumGate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  premiumIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  premiumDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  upgradeButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Sign in prompt
  signInPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  signInIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  signInDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  signInButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
