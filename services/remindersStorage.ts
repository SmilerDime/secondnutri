import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReminderType {
  id: string;
  title: string;
  description: string;
  icon: string;
  defaultTime: string;
  category: 'health' | 'nutrition' | 'wellness' | 'activity';
}

export interface UserReminder {
  id: string;
  reminderId: string;
  time: string;
  enabled: boolean;
  lastTriggered?: number;
}

export interface ReminderSettings {
  enabled: boolean;
  userReminders: UserReminder[];
}

const REMINDERS_SETTINGS_KEY = 'reminder_settings';
const ACTIVE_NOTIFICATIONS_KEY = 'active_notifications';

// Available reminder types
export const AVAILABLE_REMINDERS: ReminderType[] = [
  {
    id: 'water',
    title: 'Drink Water',
    description: 'Stay hydrated throughout the day',
    icon: 'Droplets',
    defaultTime: '09:00',
    category: 'health'
  },
  {
    id: 'walk',
    title: 'Take a Walk',
    description: 'Get some fresh air and movement',
    icon: 'Activity',
    defaultTime: '14:00',
    category: 'activity'
  },
  {
    id: 'stretch',
    title: 'Stretch Break',
    description: 'Relieve tension with gentle stretches',
    icon: 'Zap',
    defaultTime: '11:00',
    category: 'wellness'
  },
  {
    id: 'mindfulness',
    title: 'Mindful Moment',
    description: 'Take a moment to breathe and center yourself',
    icon: 'Heart',
    defaultTime: '16:00',
    category: 'wellness'
  },
  {
    id: 'posture',
    title: 'Check Posture',
    description: 'Adjust your sitting position',
    icon: 'User',
    defaultTime: '10:00',
    category: 'health'
  },
  {
    id: 'snack',
    title: 'Healthy Snack',
    description: 'Time for a nutritious snack',
    icon: 'Apple',
    defaultTime: '15:30',
    category: 'nutrition'
  },
  {
    id: 'sleep',
    title: 'Wind Down',
    description: 'Start preparing for bedtime',
    icon: 'Moon',
    defaultTime: '21:00',
    category: 'wellness'
  },
  {
    id: 'vitamins',
    title: 'Take Vitamins',
    description: 'Don\'t forget your daily supplements',
    icon: 'Pill',
    defaultTime: '08:00',
    category: 'health'
  }
];

export const saveReminderSettings = async (settings: ReminderSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(REMINDERS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving reminder settings:', error);
    throw error;
  }
};

export const getReminderSettings = async (): Promise<ReminderSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(REMINDERS_SETTINGS_KEY);
    if (!settingsJson) {
      return {
        enabled: false,
        userReminders: []
      };
    }
    return JSON.parse(settingsJson);
  } catch (error) {
    console.error('Error getting reminder settings:', error);
    return {
      enabled: false,
      userReminders: []
    };
  }
};

export const toggleReminders = async (enabled: boolean): Promise<void> => {
  try {
    const currentSettings = await getReminderSettings();
    await saveReminderSettings({
      ...currentSettings,
      enabled
    });
  } catch (error) {
    console.error('Error toggling reminders:', error);
    throw error;
  }
};

export const addUserReminder = async (reminderId: string, time: string): Promise<void> => {
  try {
    const settings = await getReminderSettings();
    const newReminder: UserReminder = {
      id: Date.now().toString(),
      reminderId,
      time,
      enabled: true
    };
    
    // Remove existing reminder for the same type
    const filteredReminders = settings.userReminders.filter(r => r.reminderId !== reminderId);
    
    await saveReminderSettings({
      ...settings,
      userReminders: [...filteredReminders, newReminder]
    });
  } catch (error) {
    console.error('Error adding user reminder:', error);
    throw error;
  }
};

export const removeUserReminder = async (reminderId: string): Promise<void> => {
  try {
    const settings = await getReminderSettings();
    const filteredReminders = settings.userReminders.filter(r => r.reminderId !== reminderId);
    
    await saveReminderSettings({
      ...settings,
      userReminders: filteredReminders
    });
  } catch (error) {
    console.error('Error removing user reminder:', error);
    throw error;
  }
};

export const toggleUserReminder = async (reminderId: string, enabled: boolean): Promise<void> => {
  try {
    const settings = await getReminderSettings();
    const updatedReminders = settings.userReminders.map(reminder =>
      reminder.reminderId === reminderId ? { ...reminder, enabled } : reminder
    );
    
    await saveReminderSettings({
      ...settings,
      userReminders: updatedReminders
    });
  } catch (error) {
    console.error('Error toggling user reminder:', error);
    throw error;
  }
};

// Notification system for web
export interface ActiveNotification {
  id: string;
  reminderId: string;
  title: string;
  description: string;
  timestamp: number;
  read: boolean;
}

export const addNotification = async (notification: Omit<ActiveNotification, 'id' | 'timestamp' | 'read'>): Promise<void> => {
  try {
    const existingNotifications = await getActiveNotifications();
    const newNotification: ActiveNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    };
    
    const updatedNotifications = [newNotification, ...existingNotifications].slice(0, 10); // Keep only last 10
    await AsyncStorage.setItem(ACTIVE_NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error adding notification:', error);
  }
};

export const getActiveNotifications = async (): Promise<ActiveNotification[]> => {
  try {
    const notificationsJson = await AsyncStorage.getItem(ACTIVE_NOTIFICATIONS_KEY);
    return notificationsJson ? JSON.parse(notificationsJson) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notifications = await getActiveNotifications();
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    await AsyncStorage.setItem(ACTIVE_NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const clearAllNotifications = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACTIVE_NOTIFICATIONS_KEY);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

// Check for due reminders
export const checkDueReminders = async (): Promise<void> => {
  try {
    const settings = await getReminderSettings();
    if (!settings.enabled) return;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    for (const userReminder of settings.userReminders) {
      if (!userReminder.enabled) continue;
      
      const reminderType = AVAILABLE_REMINDERS.find(r => r.id === userReminder.reminderId);
      if (!reminderType) continue;
      
      // Check if it's time for this reminder (within 1 minute window)
      if (userReminder.time === currentTime) {
        // Check if we haven't triggered this reminder in the last hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if (!userReminder.lastTriggered || userReminder.lastTriggered < oneHourAgo) {
          await addNotification({
            reminderId: userReminder.reminderId,
            title: reminderType.title,
            description: reminderType.description
          });
          
          // Update last triggered time
          userReminder.lastTriggered = Date.now();
          await saveReminderSettings(settings);
        }
      }
    }
  } catch (error) {
    console.error('Error checking due reminders:', error);
  }
};