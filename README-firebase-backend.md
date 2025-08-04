# Firebase Cloud Messaging (FCM) Backend Integration Guide

This guide will help you integrate Firebase Cloud Messaging with your backend to send push notifications to the RangaOne Finance frontend.

## 📋 Prerequisites

- Node.js backend (Express.js recommended)
- Firebase project with Cloud Messaging enabled
- Firebase Admin SDK
- Database (MySQL/PostgreSQL/MongoDB)
- Authentication system in place

## 🚀 Quick Start

### 1. Firebase Project Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Cloud Messaging

2. **Generate Firebase Admin SDK Key**
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

3. **Get Web App Configuration**
   - Go to Project Settings → General
   - Add a web app if not exists
   - Copy the config object

4. **Generate VAPID Key**
   - Go to Project Settings → Cloud Messaging
   - Under "Web configuration" → Generate Key Pair
   - Copy the VAPID key

### 2. Backend Dependencies

```bash
npm install firebase-admin
# or
yarn add firebase-admin
```

### 3. Firebase Admin SDK Setup

```javascript
// config/firebase.js
const admin = require('firebase-admin');
const path = require('path');

// Path to your Firebase service account key
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const messaging = admin.messaging();

module.exports = { admin, messaging };
```

### 4. Environment Variables

Add to your `.env` file:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/firebase-service-account.json

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🗄️ Database Schema Updates

### Add FCM Token Storage

#### MySQL/PostgreSQL
```sql
-- FCM tokens table
CREATE TABLE fcm_tokens (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    device_info JSON,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_active (is_active),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Update notification preferences to include FCM
ALTER TABLE user_notification_preferences 
ADD COLUMN fcm_enabled BOOLEAN DEFAULT TRUE;
```

#### MongoDB
```javascript
// FCM tokens schema
const fcmTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  deviceInfo: { type: mongoose.Schema.Types.Mixed },
  userAgent: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const FCMToken = mongoose.model('FCMToken', fcmTokenSchema);
```

## 🔧 FCM Service Implementation

### FCM Service Class

```javascript
// services/fcmService.js
const { messaging } = require('../config/firebase');

class FCMService {
  constructor(db) {
    this.db = db;
  }

  // Save FCM token for user
  async saveToken(userId, token, deviceInfo = {}) {
    try {
      // MySQL/PostgreSQL
      await this.db.query(`
        INSERT INTO fcm_tokens (id, user_id, token, device_info, user_agent)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        token = VALUES(token),
        device_info = VALUES(device_info),
        user_agent = VALUES(user_agent),
        is_active = TRUE,
        updated_at = CURRENT_TIMESTAMP
      `, [
        `fcm_${Date.now()}_${userId}`,
        userId,
        token,
        JSON.stringify(deviceInfo),
        deviceInfo.userAgent || null
      ]);

      console.log(`FCM token saved for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error saving FCM token:', error);
      return false;
    }
  }

  // Remove FCM token for user
  async removeToken(userId, token) {
    try {
      await this.db.query(
        'UPDATE fcm_tokens SET is_active = FALSE WHERE user_id = ? AND token = ?',
        [userId, token]
      );
      return true;
    } catch (error) {
      console.error('Error removing FCM token:', error);
      return false;
    }
  }

  // Get active tokens for user
  async getUserTokens(userId) {
    try {
      const tokens = await this.db.query(
        'SELECT token FROM fcm_tokens WHERE user_id = ? AND is_active = TRUE',
        [userId]
      );
      return tokens.map(t => t.token);
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return [];
    }
  }

  // Send notification to specific user
  async sendToUser(userId, notification, data = {}) {
    try {
      const tokens = await this.getUserTokens(userId);
      
      if (tokens.length === 0) {
        console.log(`No active FCM tokens for user ${userId}`);
        return { success: false, reason: 'No tokens' };
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.description,
          icon: '/logo.png',
        },
        data: {
          type: notification.type,
          priority: notification.priority || 'medium',
          actionUrl: notification.actionUrl || '',
          timestamp: new Date().toISOString(),
          ...data
        },
        tokens: tokens
      };

      const response = await messaging.sendMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        await this.handleFailedTokens(response.responses, tokens);
      }

      console.log(`FCM notification sent to user ${userId}:`, {
        success: response.successCount,
        failed: response.failureCount
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification to multiple users
  async sendToMultipleUsers(userIds, notification, data = {}) {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, notification, data))
    );

    const summary = results.reduce((acc, result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        acc.success += result.value.successCount || 0;
        acc.failed += result.value.failureCount || 0;
      } else {
        acc.failed += 1;
      }
      return acc;
    }, { success: 0, failed: 0 });

    console.log(`Bulk FCM notification sent:`, summary);
    return summary;
  }

  // Send notification to all users (broadcast)
  async sendToAllUsers(notification, data = {}) {
    try {
      // Get all active tokens (limit to prevent quota issues)
      const tokens = await this.db.query(`
        SELECT DISTINCT token FROM fcm_tokens 
        WHERE is_active = TRUE 
        LIMIT 1000
      `);

      if (tokens.length === 0) {
        return { success: false, reason: 'No active tokens' };
      }

      const tokenList = tokens.map(t => t.token);
      
      const message = {
        notification: {
          title: notification.title,
          body: notification.description,
          icon: '/logo.png',
        },
        data: {
          type: notification.type,
          priority: notification.priority || 'medium',
          actionUrl: notification.actionUrl || '',
          timestamp: new Date().toISOString(),
          ...data
        },
        tokens: tokenList
      };

      const response = await messaging.sendMulticast(message);

      // Handle failed tokens
      if (response.failureCount > 0) {
        await this.handleFailedTokens(response.responses, tokenList);
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error('Error sending broadcast FCM notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle failed tokens (remove invalid tokens)
  async handleFailedTokens(responses, tokens) {
    const failedTokens = [];
    
    responses.forEach((response, index) => {
      if (!response.success) {
        const errorCode = response.error?.code;
        
        // Remove tokens that are no longer valid
        if (errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered') {
          failedTokens.push(tokens[index]);
        }
      }
    });

    if (failedTokens.length > 0) {
      try {
        await this.db.query(`
          UPDATE fcm_tokens 
          SET is_active = FALSE 
          WHERE token IN (${failedTokens.map(() => '?').join(',')})
        `, failedTokens);
        
        console.log(`Deactivated ${failedTokens.length} invalid FCM tokens`);
      } catch (error) {
        console.error('Error deactivating failed tokens:', error);
      }
    }
  }

  // Notification helpers for different types
  async sendRecommendationNotification(userIds, recommendation) {
    const notification = {
      type: 'recommendation',
      title: 'New Stock Recommendation',
      description: `${recommendation.stockName} (${recommendation.symbol}) - ${recommendation.action} at ₹${recommendation.price}`,
      priority: recommendation.category === 'Premium' ? 'high' : 'medium',
      actionUrl: `/rangaone-wealth/recommendation/${recommendation.stockId}`
    };

    const data = {
      stockId: recommendation.stockId,
      stockName: recommendation.stockName,
      symbol: recommendation.symbol,
      action: recommendation.action,
      price: recommendation.price.toString(),
      category: recommendation.category
    };

    return await this.sendToMultipleUsers(userIds, notification, data);
  }

  async sendPriceAlertNotification(userId, priceAlert) {
    const notification = {
      type: 'price_alert',
      title: 'Price Alert',
      description: `${priceAlert.stockName} reached ₹${priceAlert.currentPrice} (${priceAlert.changePercent > 0 ? '+' : ''}${priceAlert.changePercent}%)`,
      priority: Math.abs(priceAlert.changePercent) > 5 ? 'high' : 'medium',
      actionUrl: `/rangaone-wealth/recommendation/${priceAlert.stockId}`
    };

    const data = {
      stockId: priceAlert.stockId,
      stockName: priceAlert.stockName,
      currentPrice: priceAlert.currentPrice.toString(),
      changePercent: priceAlert.changePercent.toString()
    };

    return await this.sendToUser(userId, notification, data);
  }

  async sendPortfolioUpdateNotification(userId, portfolioUpdate) {
    const notification = {
      type: 'portfolio_update',
      title: 'Portfolio Update',
      description: portfolioUpdate.message || 'Your portfolio has been updated',
      priority: 'medium',
      actionUrl: '/rangaone-wealth/my-portfolios'
    };

    const data = {
      portfolioId: portfolioUpdate.portfolioId,
      message: portfolioUpdate.message
    };

    return await this.sendToUser(userId, notification, data);
  }

  async sendMarketUpdateNotification(marketUpdate) {
    const notification = {
      type: 'market_update',
      title: 'Market Update',
      description: marketUpdate.message || 'Important market news',
      priority: marketUpdate.isUrgent ? 'high' : 'low'
    };

    const data = {
      message: marketUpdate.message,
      isUrgent: marketUpdate.isUrgent ? 'true' : 'false'
    };

    return await this.sendToAllUsers(notification, data);
  }

  async sendTipNotification(userIds, tip) {
    const notification = {
      type: 'tip',
      title: 'New Investment Tip',
      description: `${tip.title} - ${tip.category}`,
      priority: tip.category === 'Premium' ? 'high' : 'medium',
      actionUrl: `/tips/${tip.tipId}`
    };

    const data = {
      tipId: tip.tipId,
      title: tip.title,
      category: tip.category
    };

    return await this.sendToMultipleUsers(userIds, notification, data);
  }
}

module.exports = FCMService;
```

## 🔧 API Endpoints

### FCM Token Management

```javascript
// routes/fcm.js
const express = require('express');
const router = express.Router();
const FCMService = require('../services/fcmService');
const { authenticateToken } = require('../middleware/auth');

// Initialize FCM service
const fcmService = new FCMService(db); // Pass your database instance

// Save FCM token
router.post('/notifications/fcm-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, userAgent, timestamp } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    const deviceInfo = {
      userAgent,
      timestamp,
      ip: req.ip
    };

    const success = await fcmService.saveToken(userId, token, deviceInfo);

    if (success) {
      res.json({ message: 'FCM token saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save FCM token' });
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove FCM token
router.delete('/notifications/fcm-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (token) {
      await fcmService.removeToken(userId, token);
    } else {
      // Remove all tokens for user if no specific token provided
      await fcmService.removeToken(userId);
    }

    res.json({ message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test FCM notification (for development)
router.post('/notifications/test-fcm', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'test' } = req.body;

    const notification = {
      type,
      title: 'Test Notification',
      description: 'This is a test FCM notification',
      priority: 'medium'
    };

    const result = await fcmService.sendToUser(userId, notification);

    res.json({
      message: 'Test notification sent',
      result
    });
  } catch (error) {
    console.error('Error sending test FCM notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

## 🎯 Integration Examples

### Example 1: New Recommendation with FCM

```javascript
// In your recommendation creation API
const FCMService = require('./services/fcmService');
const fcmService = new FCMService(db);

app.post('/api/recommendations', authenticateToken, async (req, res) => {
  try {
    // Save recommendation to database
    const recommendation = await createRecommendation(req.body);
    
    // Get users who should receive this notification
    const users = await getUsersWithNotificationPreference('newRecommendations');
    
    // Send FCM notification
    await fcmService.sendRecommendationNotification(
      users.map(u => u.id),
      {
        stockId: recommendation.id,
        stockName: recommendation.stock_name,
        symbol: recommendation.symbol,
        action: recommendation.action,
        price: recommendation.price,
        target: recommendation.target,
        category: recommendation.category
      }
    );
    
    res.json(recommendation);
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Example 2: Price Alert with FCM

```javascript
// In your price monitoring service
const checkPriceAlerts = async () => {
  try {
    const priceAlerts = await getPendingPriceAlerts();
    
    for (const alert of priceAlerts) {
      if (alert.currentPrice >= alert.targetPrice) {
        await fcmService.sendPriceAlertNotification(alert.userId, {
          stockId: alert.stockId,
          stockName: alert.stockName,
          symbol: alert.symbol,
          currentPrice: alert.currentPrice,
          changePercent: alert.changePercent
        });
        
        // Mark alert as triggered
        await markPriceAlertAsTriggered(alert.id);
      }
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
};
```

### Example 3: Market Update Broadcast

```javascript
// Broadcast market update to all users
const broadcastMarketUpdate = async (marketData) => {
  try {
    await fcmService.sendMarketUpdateNotification({
      message: `Nifty 50 ${marketData.change > 0 ? 'gained' : 'lost'} ${Math.abs(marketData.changePercent)}% today`,
      isUrgent: Math.abs(marketData.changePercent) > 3
    });
    
    console.log('Market update broadcasted successfully');
  } catch (error) {
    console.error('Error broadcasting market update:', error);
  }
};
```

## 🚀 Frontend Configuration

### Required Environment Variables

Add these to your frontend `.env.local`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

### Update Firebase Service Worker

Update `public/firebase-messaging-sw.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🧪 Testing FCM Integration

### 1. Test Token Registration

```bash
# Test FCM token saving
curl -X POST "http://localhost:5000/api/notifications/fcm-token" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test-fcm-token",
    "userAgent": "Test Browser",
    "timestamp": "2024-01-03T10:00:00Z"
  }'
```

### 2. Test FCM Notification

```bash
# Send test FCM notification
curl -X POST "http://localhost:5000/api/notifications/test-fcm" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "type": "test" }'
```

### 3. Frontend Testing

1. Visit `http://localhost:3000/notifications/demo`
2. Enable push notifications in the Firebase section
3. Click "Send Firebase Notification" buttons
4. Check browser notifications (should work even with tab closed)

## 📊 Monitoring and Analytics

### FCM Delivery Reports

```javascript
// Add to your FCM service
async getDeliveryStats(startDate, endDate) {
  try {
    const stats = await this.db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_sent,
        SUM(CASE WHEN success_count > 0 THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN failure_count > 0 THEN 1 ELSE 0 END) as failed
      FROM notification_logs 
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [startDate, endDate]);
    
    return stats;
  } catch (error) {
    console.error('Error getting delivery stats:', error);
    return [];
  }
}
```

## 🔒 Security Considerations

1. **Service Account Key**: Store securely, never commit to version control
2. **Token Validation**: Validate FCM tokens before saving
3. **Rate Limiting**: Implement rate limiting for FCM API calls
4. **User Preferences**: Respect user notification preferences
5. **Data Privacy**: Only send necessary data in notifications

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Production environment variables
FIREBASE_PROJECT_ID=your-prod-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/prod-service-account.json
NODE_ENV=production
```

### 2. Scaling Considerations

```javascript
// For high-volume notifications, use batch processing
const processFCMQueue = async () => {
  const batchSize = 100;
  const notifications = await getQueuedNotifications(batchSize);
  
  for (const notification of notifications) {
    await fcmService.sendToUser(notification.userId, notification);
    await markNotificationAsProcessed(notification.id);
  }
};

// Run every minute
setInterval(processFCMQueue, 60000);
```

### 3. Database Indexing

```sql
-- Add indexes for better performance
CREATE INDEX idx_fcm_tokens_user_active ON fcm_tokens(user_id, is_active);
CREATE INDEX idx_fcm_tokens_created_at ON fcm_tokens(created_at);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at);
```

## 🎉 You're Done!

Your Firebase notification system is now ready! Users will receive:

✅ **Real-time push notifications** even when the app is closed  
✅ **Rich notifications** with actions and deep links  
✅ **Cross-platform support** on all major browsers  
✅ **Automatic token management** with cleanup of invalid tokens  
✅ **Delivery tracking** and analytics  

## 📞 Support

Common issues and solutions:

1. **Notifications not appearing**: Check browser permissions and VAPID key
2. **Invalid tokens**: Implement proper token cleanup in `handleFailedTokens`
3. **Service worker issues**: Ensure `firebase-messaging-sw.js` is accessible
4. **CORS errors**: Configure Firebase project domains properly

Your Firebase notification system is now fully integrated! 🚀