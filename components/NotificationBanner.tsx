import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Bell, X, Droplets, Activity, Zap, Heart, User, Apple, Moon } from 'lucide-react-native';
import { getActiveNotifications, markNotificationAsRead, ActiveNotification } from '@/services/remindersStorage';

const { width } = Dimensions.get('window');

const iconMap: { [key: string]: any } = {
  'Droplets': Droplets,
  'Activity': Activity,
  'Zap': Zap,
  'Heart': Heart,
  'User': User,
  'Apple': Apple,
  'Moon': Moon,
  'Pill': Bell, // Fallback for pills
};

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<ActiveNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<ActiveNotification | null>(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadNotifications();
    
    // Check for new notifications every minute
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      const unreadNotification = notifications.find(n => !n.read);
      if (unreadNotification) {
        showNotification(unreadNotification);
      }
    }
  }, [notifications, currentNotification]);

  const loadNotifications = async () => {
    try {
      const activeNotifications = await getActiveNotifications();
      setNotifications(activeNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const showNotification = (notification: ActiveNotification) => {
    setCurrentNotification(notification);
    
    // Animate in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideNotification();
    }, 5000);
  };

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentNotification(null);
      slideAnim.setValue(-100);
      fadeAnim.setValue(0);
    });
  };

  const handleDismiss = async () => {
    if (currentNotification) {
      await markNotificationAsRead(currentNotification.id);
      hideNotification();
      loadNotifications(); // Refresh notifications
    }
  };

  if (!currentNotification) {
    return null;
  }

  const IconComponent = iconMap[currentNotification.reminderId] || Bell;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.notification}>
        <View style={styles.iconContainer}>
          <IconComponent size={20} color="#10B981" />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{currentNotification.title}</Text>
          <Text style={styles.description}>{currentNotification.description}</Text>
        </View>
        
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <X size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 60, // Account for status bar
  },
  notification: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});