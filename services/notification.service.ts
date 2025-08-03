import { wsService, WebSocketMessage } from './websocket.service';
import { toast } from '@/hooks/use-toast';

export interface NotificationData {
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

export interface NotificationPreferences {
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
  frequency: 'realtime' | 'daily' | 'weekly';
}

class NotificationService {
  private notifications: NotificationData[] = [];
  private preferences: NotificationPreferences | null = null;
  private listeners: Array<(notifications: NotificationData[]) => void> = [];
  private unreadCount = 0;

  constructor() {
    this.initializeWebSocketListeners();
    this.loadNotificationPreferences();
  }

  private initializeWebSocketListeners() {
    // Listen for different types of notifications
    wsService.on('recommendation', (data: any) => {
      this.handleRecommendationNotification(data);
    });

    wsService.on('price_alert', (data: any) => {
      this.handlePriceAlertNotification(data);
    });

    wsService.on('portfolio_update', (data: any) => {
      this.handlePortfolioUpdateNotification(data);
    });

    wsService.on('market_update', (data: any) => {
      this.handleMarketUpdateNotification(data);
    });

    wsService.on('tip', (data: any) => {
      this.handleTipNotification(data);
    });
  }

  private async loadNotificationPreferences() {
    try {
      // In production, this would fetch from your API
      // For now, we'll use default preferences
      this.preferences = {
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
          priceAlerts: true,
          accountActivity: false,
        },
        frequency: 'realtime',
      };
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  private shouldShowNotification(type: string): boolean {
    if (!this.preferences || this.preferences.frequency !== 'realtime') {
      return false;
    }

    const typeMapping: Record<string, keyof NotificationPreferences['push']> = {
      recommendation: 'newRecommendations',
      price_alert: 'priceAlerts',
      portfolio_update: 'portfolioAlerts',
      market_update: 'marketUpdates',
      tip: 'newRecommendations',
      order_update: 'accountActivity',
    };

    const preferenceKey = typeMapping[type];
    return preferenceKey ? this.preferences.push[preferenceKey] : true;
  }

  private handleRecommendationNotification(data: any) {
    const notification: NotificationData = {
      id: `rec_${Date.now()}`,
      type: 'recommendation',
      title: 'New Stock Recommendation',
      description: `${data.stockName} (${data.symbol}) - ${data.action} at ₹${data.price}`,
      timestamp: new Date().toISOString(),
      priority: data.category === 'Premium' ? 'high' : 'medium',
      data,
      actionUrl: `/rangaone-wealth/recommendation/${data.stockId}`,
    };

    this.addNotification(notification);
  }

  private handlePriceAlertNotification(data: any) {
    const notification: NotificationData = {
      id: `price_${Date.now()}`,
      type: 'price_alert',
      title: 'Price Alert',
      description: `${data.stockName} reached ₹${data.currentPrice} (${data.changePercent > 0 ? '+' : ''}${data.changePercent}%)`,
      timestamp: new Date().toISOString(),
      priority: Math.abs(data.changePercent) > 5 ? 'high' : 'medium',
      data,
      actionUrl: `/rangaone-wealth/recommendation/${data.stockId}`,
    };

    this.addNotification(notification);
  }

  private handlePortfolioUpdateNotification(data: any) {
    const notification: NotificationData = {
      id: `portfolio_${Date.now()}`,
      type: 'portfolio_update',
      title: 'Portfolio Update',
      description: data.message || 'Your portfolio has been updated',
      timestamp: new Date().toISOString(),
      priority: 'medium',
      data,
      actionUrl: '/rangaone-wealth/my-portfolios',
    };

    this.addNotification(notification);
  }

  private handleMarketUpdateNotification(data: any) {
    const notification: NotificationData = {
      id: `market_${Date.now()}`,
      type: 'market_update',
      title: 'Market Update',
      description: data.message || 'Important market news',
      timestamp: new Date().toISOString(),
      priority: data.isUrgent ? 'high' : 'low',
      data,
    };

    this.addNotification(notification);
  }

  private handleTipNotification(data: any) {
    const notification: NotificationData = {
      id: `tip_${Date.now()}`,
      type: 'tip',
      title: 'New Investment Tip',
      description: `${data.title} - ${data.category}`,
      timestamp: new Date().toISOString(),
      priority: data.category === 'Premium' ? 'high' : 'medium',
      data,
      actionUrl: `/tips/${data.tipId}`,
    };

    this.addNotification(notification);
  }

  private addNotification(notification: NotificationData) {
    // Add to notifications array
    this.notifications.unshift(notification);
    this.unreadCount++;

    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Notify listeners
    this.notifyListeners();

    // Show toast if preferences allow
    if (this.shouldShowNotification(notification.type)) {
      this.showToastNotification(notification);
    }

    // Store in localStorage for persistence
    this.saveNotifications();
  }

  private showToastNotification(notification: NotificationData) {
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

  private saveNotifications() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications.slice(0, 50)));
      localStorage.setItem('unreadCount', this.unreadCount.toString());
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  private loadNotifications() {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
      const unreadCount = localStorage.getItem('unreadCount');
      if (unreadCount) {
        this.unreadCount = parseInt(unreadCount, 10);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  // Public methods
  initialize() {
    this.loadNotifications();
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      wsService.connect(token);
    }
  }

  disconnect() {
    wsService.disconnect();
  }

  getNotifications(): NotificationData[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.unreadCount;
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
    this.saveNotifications();
    this.notifyListeners();
  }

  clearNotifications() {
    this.notifications = [];
    this.unreadCount = 0;
    this.saveNotifications();
    this.notifyListeners();
  }

  subscribe(listener: (notifications: NotificationData[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  updatePreferences(preferences: NotificationPreferences) {
    this.preferences = preferences;
  }

  // For testing purposes - simulate notifications
  simulateNotification(type: NotificationData['type']) {
    const mockData: Record<NotificationData['type'], any> = {
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

    const handler = {
      recommendation: () => this.handleRecommendationNotification(mockData.recommendation),
      price_alert: () => this.handlePriceAlertNotification(mockData.price_alert),
      portfolio_update: () => this.handlePortfolioUpdateNotification(mockData.portfolio_update),
      market_update: () => this.handleMarketUpdateNotification(mockData.market_update),
      tip: () => this.handleTipNotification(mockData.tip),
      order_update: () => this.addNotification({
        id: `order_${Date.now()}`,
        type: 'order_update',
        title: 'Order Update',
        description: mockData.order_update.message,
        timestamp: new Date().toISOString(),
        priority: 'medium',
        data: mockData.order_update,
      }),
    };

    handler[type]?.();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();