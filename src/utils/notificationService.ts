import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface ScheduleNotificationParams {
  habitId: string;
  habitName: string;
  habitEmoji: string;
  reminderTime: string; // Format: "HH:MM" (24-hour)
  selectedDays: number[]; // 0 = Sunday, 6 = Saturday
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get notification permissions');
    return false;
  }

  // Configure notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#667eea',
      sound: 'default',
    });
  }

  return true;
}

/**
 * Schedule notifications for a habit based on selected days and time
 */
export async function scheduleHabitNotifications(params: ScheduleNotificationParams): Promise<string[]> {
  const { habitId, habitName, habitEmoji, reminderTime, selectedDays } = params;

  // Parse time
  const [hours, minutes] = reminderTime.split(':').map(Number);

  const notificationIds: string[] = [];

  // Schedule a notification for each selected day
  for (const dayOfWeek of selectedDays) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${habitEmoji} Time for ${habitName}!`,
          body: 'Don\'t break your streak! Complete your habit now.',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            habitId,
            type: 'habit-reminder',
          },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
          weekday: dayOfWeek + 1, // expo-notifications uses 1-7 (Sunday=1), we use 0-6
        },
      });

      notificationIds.push(notificationId);
      console.log(`Scheduled notification for ${habitName} on day ${dayOfWeek} at ${reminderTime} - ID: ${notificationId}`);
    } catch (error) {
      console.error(`Error scheduling notification for day ${dayOfWeek}:`, error);
    }
  }

  return notificationIds;
}

/**
 * Cancel all notifications for a habit
 */
export async function cancelHabitNotifications(notificationIds: string[]): Promise<void> {
  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      console.log(`Cancelled notification: ${id}`);
    } catch (error) {
      console.error(`Error cancelling notification ${id}:`, error);
    }
  }
}

/**
 * Cancel all notifications for the app
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all scheduled notifications');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getAllScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', notifications);
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Send a test notification immediately (for testing if notifications work)
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Test Notification',
        body: 'Great! Notifications are working perfectly. You\'ll receive reminders for your habits.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: 'test-notification',
        },
      },
      trigger: null, // null means send immediately
    });

    console.log('Test notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}
