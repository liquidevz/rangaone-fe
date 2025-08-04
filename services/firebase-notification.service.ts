import { 
  requestNotificationPermission, 
  onMessageListener, 
  isNotificationSupported,
  getNotificationPermission 
} from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

export interface FirebaseNotificationData {
  id: string;
  type: 'recommendation' | 'price_alert' | 'portfolio_update' | 'market_update' | 'tip' | 'order_update';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  actionUrl?: string;
  read?: boolean;
}

export interface FCMTokenData {
  token: string;
  timestamp: string;
  userAgent: string;
}

class FirebaseNotificationService {
  private fcmToken: string | null = null;
  private listeners: Array<(notification: FirebaseNotificationData) => void> = [];
  private tokenListeners: Array<(token: string | null) => void> = [];
  private permissionListeners: Array<(permission: NotificationPermission) => void> = [];
  private isInitialized = false;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    if (typeof window === 'undefined' || this.isInitialized) {
      return;
    }

    try {
      // Check if notifications are supported
      if (!isNotificationSupported()) {
        console.warn('Push notifications are not supported in this browser');
        return;
      }

      // Register service worker
      await this.registerServiceWorker();

      // Set up foreground message listener
      this.setupForegroundMessageListener();

      // Check existing permission and token
      const permission = getNotificationPermission();
      if (permission === 'granted') {
        await this.getOrRefreshToken();
      }

      this.isInitialized = true;
      console.log('Firebase notification service initialized');
    } catch (error) {
      console.error('Error initializing Firebase notification service:', error);
    }
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service worker registered successfully:', registration);
        return registration;
      } catch (error) {
        console.error('Service worker registration failed:', error);
        throw error;
      }
    } else {
      throw new Error('Service workers are not supported in this browser');
    }
  }

  private setupForegroundMessageListener() {
    onMessageListener()
      .then((payload: any) => {
        console.log('Foreground message received:', payload);
        
        // Create notification data from Firebase payload
        const notification: FirebaseNotificationData = {
          id: payload.messageId || `fcm_${Date.now()}`,
          type: payload.data?.type || 'system',
          title: payload.notification?.title || 'Notification',
          description: payload.notification?.body || 'You have a new notification',
          timestamp: new Date().toISOString(),
          priority: payload.data?.priority || 'medium',
          data: payload.data,
          actionUrl: payload.data?.actionUrl,
          read: false
        };

        // Show toast notification
        this.showToastNotification(notification);

        // Notify listeners
        this.notifyListeners(notification);
      })
      .catch((error) => {
        console.error('Error setting up foreground message listener:', error);
      });
  }

  private showToastNotification(notification: FirebaseNotificationData) {
    const toastConfig: any = {
      title: notification.title,
      description: notification.description,
    };

    // Add action button if URL is provided
    if (notification.actionUrl) {
      toastConfig.action = {
        label: 'View',
        onClick: () => {
          window.location.href = notification.actionUrl!;
        },
      };
    }

    // Set variant based on priority
    if (notification.priority === 'high') {
      toastConfig.variant = 'default';
    }

    toast(toastConfig);
  }

  // Request notification permission and get FCM token
  async requestPermission(): Promise<string | null> {
    try {
      if (!isNotificationSupported()) {
        throw new Error('Push notifications are not supported');
      }

      const token = await requestNotificationPermission();
      
      if (token) {
        this.fcmToken = token;
        this.saveTokenToStorage(token);
        this.notifyTokenListeners(token);
        
        // Send token to backend
        await this.sendTokenToBackend(token);
      }

      // Notify permission listeners
      const permission = getNotificationPermission();
      this.notifyPermissionListeners(permission);

      return token;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }

  // Get existing token or refresh if needed
  async getOrRefreshToken(): Promise<string | null> {
    try {
      if (this.fcmToken) {
        return this.fcmToken;
      }

      // Try to get token from storage first
      const storedToken = this.getTokenFromStorage();
      if (storedToken) {
        this.fcmToken = storedToken.token;
        // Check if token is older than 30 days, refresh if needed
        const tokenAge = Date.now() - new Date(storedToken.timestamp).getTime();
        if (tokenAge > 30 * 24 * 60 * 60 * 1000) { // 30 days
          return await this.requestPermission();
        }
        return storedToken.token;
      }

      // Request new token if none exists
      return await this.requestPermission();
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Save token to localStorage
  private saveTokenToStorage(token: string) {
    try {
      const tokenData: FCMTokenData = {
        token,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      localStorage.setItem('fcm_token', JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error saving FCM token to storage:', error);
    }
  }

  // Get token from localStorage
  private getTokenFromStorage(): FCMTokenData | null {
    try {
      const stored = localStorage.getItem('fcm_token');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting FCM token from storage:', error);
      return null;
    }
  }

  // Send token to backend
  private async sendTokenToBackend(token: string) {
    try {
      const authToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!authToken) {
        console.warn('No auth token available, cannot send FCM token to backend');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('FCM token sent to backend successfully');
      } else {
        console.error('Failed to send FCM token to backend:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending FCM token to backend:', error);
    }
  }

  // Unsubscribe from notifications
  async unsubscribe(): Promise<boolean> {
    try {
      // Remove token from backend
      await this.removeTokenFromBackend();
      
      // Clear local storage
      localStorage.removeItem('fcm_token');
      this.fcmToken = null;
      
      // Notify listeners
      this.notifyTokenListeners(null);
      
      console.log('Unsubscribed from FCM notifications');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      return false;
    }
  }

  // Remove token from backend
  private async removeTokenFromBackend() {
    try {
      const authToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!authToken) {
        return;
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/fcm-token`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.error('Error removing FCM token from backend:', error);
    }
  }

  // Get current notification permission
  getPermissionStatus(): NotificationPermission {
    return getNotificationPermission();
  }

  // Check if notifications are enabled
  isNotificationEnabled(): boolean {
    return getNotificationPermission() === 'granted' && !!this.fcmToken;
  }

  // Get current FCM token
  getToken(): string | null {
    return this.fcmToken;
  }

  // Subscribe to notification events
  subscribe(listener: (notification: FirebaseNotificationData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Subscribe to token changes
  subscribeToToken(listener: (token: string | null) => void): () => void {
    this.tokenListeners.push(listener);
    return () => {
      const index = this.tokenListeners.indexOf(listener);
      if (index > -1) {
        this.tokenListeners.splice(index, 1);
      }
    };
  }

  // Subscribe to permission changes
  subscribeToPermission(listener: (permission: NotificationPermission) => void): () => void {
    this.permissionListeners.push(listener);
    return () => {
      const index = this.permissionListeners.indexOf(listener);
      if (index > -1) {
        this.permissionListeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(notification: FirebaseNotificationData) {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Notify token listeners
  private notifyTokenListeners(token: string | null) {
    this.tokenListeners.forEach(listener => {
      try {
        listener(token);
      } catch (error) {
        console.error('Error in token listener:', error);
      }
    });
  }

  // Notify permission listeners
  private notifyPermissionListeners(permission: NotificationPermission) {
    this.permissionListeners.forEach(listener => {
      try {
        listener(permission);
      } catch (error) {
        console.error('Error in permission listener:', error);
      }
    });
  }

  // For testing - simulate a Firebase notification
  simulateFirebaseNotification(type: FirebaseNotificationData['type']) {
    const mockData: Record<FirebaseNotificationData['type'], any> = {
      recommendation: {
        stockId: 'AXISBANK',
        stockName: 'Axis Bank',
        symbol: 'AXISBANK',
        action: 'BUY',
        price: 1150,
        target: 1300,
        category: 'Premium',
      },
      price_alert: {
        stockId: 'INFY',
        stockName: 'Infosys',
        symbol: 'INFY',
        currentPrice: 1520,
        changePercent: 5.2,
      },
      portfolio_update: {
        message: 'Your portfolio "Long Term Growth" has been rebalanced',
        portfolioId: 'ltg_001',
      },
      market_update: {
        message: 'Nifty 50 hits all-time high, crosses 22,000 mark',
        isUrgent: true,
      },
      tip: {
        tipId: 'tip_123',
        title: 'Banking Sector Outlook',
        category: 'Premium',
        brief: 'Positive outlook for banking stocks',
      },
      order_update: {
        orderId: 'ORD123',
        status: 'executed',
        message: 'Your order for RELIANCE has been executed',
      },
    };

    const notification: FirebaseNotificationData = {
      id: `sim_${Date.now()}`,
      type,
      title: this.getMockTitle(type),
      description: this.getMockDescription(type, mockData[type]),
      timestamp: new Date().toISOString(),
      priority: type === 'recommendation' ? 'high' : 'medium',
      data: mockData[type],
      actionUrl: this.getMockActionUrl(type, mockData[type]),
    };

    this.showToastNotification(notification);
    this.notifyListeners(notification);
  }

  private getMockTitle(type: string): string {
    const titles: Record<string, string> = {
      recommendation: 'New Stock Recommendation',
      price_alert: 'Price Alert',
      portfolio_update: 'Portfolio Update',
      market_update: 'Market Update',
      tip: 'New Investment Tip',
      order_update: 'Order Update',
    };
    return titles[type] || 'Notification';
  }

  private getMockDescription(type: string, data: any): string {
    switch (type) {
      case 'recommendation':
        return `${data.stockName} (${data.symbol}) - ${data.action} at ₹${data.price}`;
      case 'price_alert':
        return `${data.stockName} reached ₹${data.currentPrice} (${data.changePercent > 0 ? '+' : ''}${data.changePercent}%)`;
      case 'portfolio_update':
        return data.message;
      case 'market_update':
        return data.message;
      case 'tip':
        return `${data.title} - ${data.category}`;
      case 'order_update':
        return data.message;
      default:
        return 'You have a new notification';
    }
  }

  private getMockActionUrl(type: string, data: any): string {
    switch (type) {
      case 'recommendation':
        return `/rangaone-wealth/recommendation/${data.stockId}`;
      case 'price_alert':
        return `/rangaone-wealth/recommendation/${data.stockId}`;
      case 'portfolio_update':
        return '/rangaone-wealth/my-portfolios';
      case 'tip':
        return `/tips/${data.tipId}`;
      default:
        return '/notifications';
    }
  }
}

// Export singleton instance
export const firebaseNotificationService = new FirebaseNotificationService();