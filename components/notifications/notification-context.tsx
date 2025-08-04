"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notificationService, NotificationData, NotificationPreferences } from '@/services/notification.service';
import { firebaseNotificationService, FirebaseNotificationData } from '@/services/firebase-notification.service';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  isConnected: boolean;
  isFirebaseEnabled: boolean;
  fcmToken: string | null;
  notificationPermission: NotificationPermission;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updatePreferences: (preferences: NotificationPreferences) => void;
  simulateNotification: (type: NotificationData['type']) => void;
  requestFirebasePermission: () => Promise<boolean>;
  unsubscribeFromFirebase: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();

    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    });

    // Set initial state
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());

    // Listen for WebSocket connection status
    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    // Import wsService dynamically to avoid circular dependency
    import('@/services/websocket.service').then(({ wsService }) => {
      wsService.on('connected', handleConnected);
      wsService.on('disconnected', handleDisconnected);
      
      // Check initial connection status
      setIsConnected(wsService.isConnected());
    });

    // Initialize Firebase notifications
    const initializeFirebase = async () => {
      // Subscribe to Firebase notifications
      const firebaseUnsubscribe = firebaseNotificationService.subscribe((firebaseNotification) => {
        // Convert Firebase notification to our notification format
        const notification: NotificationData = {
          id: firebaseNotification.id,
          type: firebaseNotification.type,
          title: firebaseNotification.title,
          description: firebaseNotification.description,
          timestamp: firebaseNotification.timestamp,
          priority: firebaseNotification.priority,
          data: firebaseNotification.data,
          actionUrl: firebaseNotification.actionUrl,
          read: false
        };

        // Add to notification service
        notificationService['addNotification'](notification);
      });

      // Subscribe to FCM token changes
      const tokenUnsubscribe = firebaseNotificationService.subscribeToToken((token) => {
        setFcmToken(token);
        setIsFirebaseEnabled(!!token);
      });

      // Subscribe to permission changes
      const permissionUnsubscribe = firebaseNotificationService.subscribeToPermission((permission) => {
        setNotificationPermission(permission);
      });

      // Set initial Firebase state
      setFcmToken(firebaseNotificationService.getToken());
      setIsFirebaseEnabled(firebaseNotificationService.isNotificationEnabled());
      setNotificationPermission(firebaseNotificationService.getPermissionStatus());

      // Return cleanup function
      return () => {
        firebaseUnsubscribe();
        tokenUnsubscribe();
        permissionUnsubscribe();
      };
    };

    let firebaseCleanup: (() => void) | null = null;
    initializeFirebase().then((cleanup) => {
      firebaseCleanup = cleanup;
    });

    // Cleanup
    return () => {
      unsubscribe();
      if (firebaseCleanup) {
        firebaseCleanup();
      }
      import('@/services/websocket.service').then(({ wsService }) => {
        wsService.off('connected', handleConnected);
        wsService.off('disconnected', handleDisconnected);
      });
    };
  }, [toast]);

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  const clearNotifications = useCallback(() => {
    notificationService.clearNotifications();
  }, []);

  const updatePreferences = useCallback((preferences: NotificationPreferences) => {
    notificationService.updatePreferences(preferences);
  }, []);

  const simulateNotification = useCallback((type: NotificationData['type']) => {
    notificationService.simulateNotification(type);
  }, []);

  const requestFirebasePermission = useCallback(async (): Promise<boolean> => {
    try {
      const token = await firebaseNotificationService.requestPermission();
      if (token) {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications even when the app is closed",
        });
        return true;
      } else {
        toast({
          title: "Notification Permission Denied",
          description: "You can enable notifications later in your browser settings",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting Firebase permission:', error);
      toast({
        title: "Error",
        description: "Failed to enable push notifications",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const unsubscribeFromFirebase = useCallback(async (): Promise<boolean> => {
    try {
      const success = await firebaseNotificationService.unsubscribe();
      if (success) {
        toast({
          title: "Notifications Disabled",
          description: "You will no longer receive push notifications",
        });
      }
      return success;
    } catch (error) {
      console.error('Error unsubscribing from Firebase:', error);
      return false;
    }
  }, [toast]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    isFirebaseEnabled,
    fcmToken,
    notificationPermission,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updatePreferences,
    simulateNotification,
    requestFirebasePermission,
    unsubscribeFromFirebase,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}