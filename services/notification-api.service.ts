import { get, post, put } from '@/lib/axios';

export interface NotificationPreferencesAPI {
  email: {
    marketUpdates: boolean;
    newRecommendations: boolean;
    portfolioAlerts: boolean;
    priceAlerts: boolean;
    accountActivity: boolean;
    promotions: boolean;
  };
  push: {
    marketUpdates: boolean;
    newRecommendations: boolean;
    portfolioAlerts: boolean;
    priceAlerts: boolean;
    accountActivity: boolean;
  };
  sms: {
    marketUpdates: boolean;
    newRecommendations: boolean;
    portfolioAlerts: boolean;
    priceAlerts: boolean;
    accountActivity: boolean;
  };
  frequency: 'realtime' | 'daily' | 'weekly';
}

export interface NotificationHistory {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export const notificationApiService = {
  // Get user's notification preferences
  async getPreferences(): Promise<NotificationPreferencesAPI> {
    try {
      return await get<NotificationPreferencesAPI>('/api/user/notification-settings');
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      // Return default preferences if API fails
      return {
        email: {
          marketUpdates: true,
          newRecommendations: true,
          portfolioAlerts: true,
          priceAlerts: true,
          accountActivity: true,
          promotions: false,
        },
        push: {
          marketUpdates: true,
          newRecommendations: true,
          portfolioAlerts: true,
          priceAlerts: false,
          accountActivity: false,
        },
        sms: {
          marketUpdates: false,
          newRecommendations: true,
          portfolioAlerts: false,
          priceAlerts: true,
          accountActivity: false,
        },
        frequency: 'realtime',
      };
    }
  },

  // Update user's notification preferences
  async updatePreferences(preferences: NotificationPreferencesAPI): Promise<NotificationPreferencesAPI> {
    try {
      return await put<NotificationPreferencesAPI>('/api/user/notification-settings', preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  // Get notification history
  async getNotificationHistory(params?: {
    limit?: number;
    offset?: number;
    type?: string;
    unreadOnly?: boolean;
  }): Promise<NotificationHistory[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');

      const query = queryParams.toString();
      return await get<NotificationHistory[]>(`/api/notifications${query ? `?${query}` : ''}`);
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await put(`/api/notifications/${notificationId}/read`, {});
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await put('/api/notifications/read-all', {});
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await put(`/api/notifications/${notificationId}`, { deleted: true });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await put('/api/notifications/clear-all', {});
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  // Subscribe to push notifications
  async subscribeToPushNotifications(subscription: PushSubscription): Promise<void> {
    try {
      await post('/api/notifications/push-subscribe', {
        subscription: subscription.toJSON(),
      });
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications(): Promise<void> {
    try {
      await post('/api/notifications/push-unsubscribe', {});
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  },

  // Test notification endpoint (for development)
  async testNotification(type: string): Promise<void> {
    try {
      await post('/api/notifications/test', { type });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  },
};