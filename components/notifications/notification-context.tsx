"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notificationService, NotificationData, NotificationPreferences } from '@/services/notification.service';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updatePreferences: (preferences: NotificationPreferences) => void;
  simulateNotification: (type: NotificationData['type']) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
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
      toast({
        title: "Connected",
        description: "Real-time notifications are now active",
      });
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

    // Cleanup
    return () => {
      unsubscribe();
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

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updatePreferences,
    simulateNotification,
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