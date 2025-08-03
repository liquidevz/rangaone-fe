# Backend Integration Guide: Real-time Notification System

This guide will help you integrate the notification system with your backend to enable real-time notifications in the RangaOne Finance frontend.

## 📋 Prerequisites

- Node.js backend (Express.js recommended)
- Database (MySQL/PostgreSQL/MongoDB)
- Authentication system in place
- Basic knowledge of WebSockets

## 🚀 Quick Start

### 1. Install Required Dependencies

```bash
npm install socket.io cors
# or
yarn add socket.io cors
```

### 2. Basic WebSocket Server Setup

```javascript
// server.js or app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Authentication middleware for Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  
  try {
    // Replace with your token verification logic
    const user = verifyJWTToken(token);
    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join user-specific room
  socket.join(`user_${socket.userId}`);
  
  // Join notification channels based on user preferences
  socket.join('recommendations');
  socket.join('price_alerts');
  socket.join('portfolio_updates');
  socket.join('market_updates');
  socket.join('tips');
  
  // Handle heartbeat
  socket.on('ping', () => {
    socket.emit('system', { action: 'pong' });
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export io for use in other modules
module.exports = { app, io };
```

## 🗄️ Database Schema

### MySQL/PostgreSQL Schema

```sql
-- User notification preferences
CREATE TABLE user_notification_preferences (
    user_id VARCHAR(255) PRIMARY KEY,
    email_preferences JSON NOT NULL DEFAULT '{}',
    push_preferences JSON NOT NULL DEFAULT '{}',
    sms_preferences JSON NOT NULL DEFAULT '{}',
    frequency ENUM('realtime', 'daily', 'weekly') DEFAULT 'realtime',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notification history
CREATE TABLE notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    data JSON,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_read (is_read),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default notification preferences for existing users
INSERT INTO user_notification_preferences (user_id, email_preferences, push_preferences, sms_preferences)
SELECT 
    id,
    '{"marketUpdates": true, "newRecommendations": true, "portfolioAlerts": true, "priceAlerts": true, "accountActivity": true, "promotions": false}',
    '{"marketUpdates": true, "newRecommendations": true, "portfolioAlerts": true, "priceAlerts": false, "accountActivity": false}',
    '{"marketUpdates": false, "newRecommendations": true, "portfolioAlerts": false, "priceAlerts": true, "accountActivity": false}'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_notification_preferences);
```

### MongoDB Schema

```javascript
// User notification preferences schema
const notificationPreferencesSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: {
    marketUpdates: { type: Boolean, default: true },
    newRecommendations: { type: Boolean, default: true },
    portfolioAlerts: { type: Boolean, default: true },
    priceAlerts: { type: Boolean, default: true },
    accountActivity: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false }
  },
  push: {
    marketUpdates: { type: Boolean, default: true },
    newRecommendations: { type: Boolean, default: true },
    portfolioAlerts: { type: Boolean, default: true },
    priceAlerts: { type: Boolean, default: false },
    accountActivity: { type: Boolean, default: false }
  },
  sms: {
    marketUpdates: { type: Boolean, default: false },
    newRecommendations: { type: Boolean, default: true },
    portfolioAlerts: { type: Boolean, default: false },
    priceAlerts: { type: Boolean, default: true },
    accountActivity: { type: Boolean, default: false }
  },
  frequency: { type: String, enum: ['realtime', 'daily', 'weekly'], default: 'realtime' }
}, { timestamps: true });

// Notification history schema
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  data: { type: mongoose.Schema.Types.Mixed },
  actionUrl: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const NotificationPreferences = mongoose.model('NotificationPreferences', notificationPreferencesSchema);
const Notification = mongoose.model('Notification', notificationSchema);
```

## 🔧 API Endpoints

### Notification Preferences

```javascript
// routes/notifications.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get user notification preferences
router.get('/user/notification-settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // MySQL/PostgreSQL
    const preferences = await db.query(
      'SELECT * FROM user_notification_preferences WHERE user_id = ?',
      [userId]
    );
    
    if (preferences.length === 0) {
      // Return default preferences
      return res.json({
        email: {
          marketUpdates: true,
          newRecommendations: true,
          portfolioAlerts: true,
          priceAlerts: true,
          accountActivity: true,
          promotions: false
        },
        push: {
          marketUpdates: true,
          newRecommendations: true,
          portfolioAlerts: true,
          priceAlerts: false,
          accountActivity: false
        },
        sms: {
          marketUpdates: false,
          newRecommendations: true,
          portfolioAlerts: false,
          priceAlerts: true,
          accountActivity: false
        },
        frequency: 'realtime'
      });
    }
    
    const pref = preferences[0];
    res.json({
      email: JSON.parse(pref.email_preferences),
      push: JSON.parse(pref.push_preferences),
      sms: JSON.parse(pref.sms_preferences),
      frequency: pref.frequency
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user notification preferences
router.put('/user/notification-settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, push, sms, frequency } = req.body;
    
    // MySQL/PostgreSQL
    await db.query(`
      INSERT INTO user_notification_preferences 
      (user_id, email_preferences, push_preferences, sms_preferences, frequency)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      email_preferences = VALUES(email_preferences),
      push_preferences = VALUES(push_preferences),
      sms_preferences = VALUES(sms_preferences),
      frequency = VALUES(frequency),
      updated_at = CURRENT_TIMESTAMP
    `, [
      userId,
      JSON.stringify(email),
      JSON.stringify(push),
      JSON.stringify(sms),
      frequency
    ]);
    
    res.json({ email, push, sms, frequency });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification history
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, type, unreadOnly } = req.query;
    
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    let params = [userId];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (unreadOnly === 'true') {
      query += ' AND is_read = FALSE';
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const notifications = await db.query(query, params);
    
    res.json(notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.description,
      timestamp: n.created_at,
      read: n.is_read,
      data: n.data ? JSON.parse(n.data) : null
    })));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear all notifications
router.put('/notifications/clear-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await db.query('DELETE FROM notifications WHERE user_id = ?', [userId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

## 📢 Notification Service

Create a notification service to handle sending notifications:

```javascript
// services/notificationService.js
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  constructor(io, db) {
    this.io = io;
    this.db = db;
  }

  async sendNotification(userId, notification) {
    try {
      // Create notification ID
      const notificationId = uuidv4();
      
      // Save to database
      await this.saveNotification(userId, notificationId, notification);
      
      // Send via WebSocket
      this.io.to(`user_${userId}`).emit(notification.type, {
        id: notificationId,
        ...notification.data,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Notification sent to user ${userId}:`, notification.type);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async sendToMultipleUsers(userIds, notification) {
    const promises = userIds.map(userId => this.sendNotification(userId, notification));
    await Promise.all(promises);
  }

  async sendToAllUsers(notification) {
    // Get all connected users or all users from database
    this.io.emit(notification.type, {
      ...notification.data,
      timestamp: new Date().toISOString()
    });
  }

  async saveNotification(userId, notificationId, notification) {
    await this.db.query(`
      INSERT INTO notifications 
      (id, user_id, type, title, description, priority, data, action_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      notificationId,
      userId,
      notification.type,
      notification.title,
      notification.description,
      notification.priority || 'medium',
      JSON.stringify(notification.data || {}),
      notification.actionUrl || null
    ]);
  }

  // Notification helpers for different types
  async sendRecommendationNotification(userIds, recommendation) {
    const notification = {
      type: 'recommendation',
      title: 'New Stock Recommendation',
      description: `${recommendation.stockName} (${recommendation.symbol}) - ${recommendation.action} at ₹${recommendation.price}`,
      priority: recommendation.category === 'Premium' ? 'high' : 'medium',
      data: recommendation,
      actionUrl: `/rangaone-wealth/recommendation/${recommendation.stockId}`
    };

    await this.sendToMultipleUsers(userIds, notification);
  }

  async sendPriceAlertNotification(userId, priceAlert) {
    const notification = {
      type: 'price_alert',
      title: 'Price Alert',
      description: `${priceAlert.stockName} reached ₹${priceAlert.currentPrice} (${priceAlert.changePercent > 0 ? '+' : ''}${priceAlert.changePercent}%)`,
      priority: Math.abs(priceAlert.changePercent) > 5 ? 'high' : 'medium',
      data: priceAlert,
      actionUrl: `/rangaone-wealth/recommendation/${priceAlert.stockId}`
    };

    await this.sendNotification(userId, notification);
  }

  async sendPortfolioUpdateNotification(userId, portfolioUpdate) {
    const notification = {
      type: 'portfolio_update',
      title: 'Portfolio Update',
      description: portfolioUpdate.message || 'Your portfolio has been updated',
      priority: 'medium',
      data: portfolioUpdate,
      actionUrl: '/rangaone-wealth/my-portfolios'
    };

    await this.sendNotification(userId, notification);
  }

  async sendMarketUpdateNotification(marketUpdate) {
    const notification = {
      type: 'market_update',
      title: 'Market Update',
      description: marketUpdate.message || 'Important market news',
      priority: marketUpdate.isUrgent ? 'high' : 'low',
      data: marketUpdate
    };

    await this.sendToAllUsers(notification);
  }

  async sendTipNotification(userIds, tip) {
    const notification = {
      type: 'tip',
      title: 'New Investment Tip',
      description: `${tip.title} - ${tip.category}`,
      priority: tip.category === 'Premium' ? 'high' : 'medium',
      data: tip,
      actionUrl: `/tips/${tip.tipId}`
    };

    await this.sendToMultipleUsers(userIds, notification);
  }
}

module.exports = NotificationService;
```

## 🎯 Integration Examples

### Example 1: New Recommendation Created

```javascript
// In your recommendation creation API
const NotificationService = require('./services/notificationService');
const notificationService = new NotificationService(io, db);

app.post('/api/recommendations', authenticateToken, async (req, res) => {
  try {
    // Save recommendation to database
    const recommendation = await createRecommendation(req.body);
    
    // Get users who should receive this notification
    const users = await getUsersWithNotificationPreference('newRecommendations');
    
    // Send notification
    await notificationService.sendRecommendationNotification(
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

### Example 2: Price Alert Triggered

```javascript
// In your price monitoring service
const checkPriceAlerts = async () => {
  try {
    const priceAlerts = await getPendingPriceAlerts();
    
    for (const alert of priceAlerts) {
      if (alert.currentPrice >= alert.targetPrice) {
        await notificationService.sendPriceAlertNotification(alert.userId, {
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

// Run price check every minute
setInterval(checkPriceAlerts, 60000);
```

### Example 3: Portfolio Rebalancing

```javascript
// In your portfolio service
const rebalancePortfolio = async (portfolioId) => {
  try {
    const portfolio = await getPortfolioById(portfolioId);
    
    // Perform rebalancing logic
    await performRebalancing(portfolio);
    
    // Send notification to portfolio owner
    await notificationService.sendPortfolioUpdateNotification(portfolio.userId, {
      message: `Your portfolio "${portfolio.name}" has been rebalanced`,
      portfolioId: portfolioId,
      changes: portfolio.rebalancingChanges
    });
    
  } catch (error) {
    console.error('Error rebalancing portfolio:', error);
  }
};
```

## 🔧 Environment Variables

Add these to your `.env` file:

```bash
# WebSocket configuration
FRONTEND_URL=http://localhost:3000
WEBSOCKET_PORT=5000

# Database configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rangaone_finance
DB_USER=your_username
DB_PASSWORD=your_password

# JWT configuration
JWT_SECRET=your_jwt_secret_key
```

## 🧪 Testing the Integration

### 1. Test WebSocket Connection

```javascript
// Test endpoint to verify WebSocket is working
app.post('/api/test-notification', authenticateToken, async (req, res) => {
  const { type } = req.body;
  const userId = req.user.id;
  
  const testData = {
    recommendation: {
      stockId: 'TEST001',
      stockName: 'Test Stock',
      symbol: 'TEST',
      action: 'BUY',
      price: 100,
      target: 120,
      category: 'Premium'
    },
    price_alert: {
      stockId: 'TEST001',
      stockName: 'Test Stock',
      currentPrice: 105,
      changePercent: 5.0
    }
  };
  
  if (testData[type]) {
    await notificationService.sendNotification(userId, {
      type,
      title: `Test ${type.replace('_', ' ')} Notification`,
      description: 'This is a test notification',
      priority: 'medium',
      data: testData[type]
    });
  }
  
  res.json({ message: 'Test notification sent' });
});
```

### 2. Verify Database Connection

```bash
# Test database connection
curl -X GET "http://localhost:5000/api/user/notification-settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test WebSocket Events

Use your frontend demo page at `http://localhost:3000/notifications/demo` to test real-time notifications.

## 🚀 Deployment Considerations

### Production Setup

1. **Use PM2 for Process Management**
```bash
npm install -g pm2
pm2 start server.js --name "notification-server"
```

2. **Configure Nginx for WebSocket**
```nginx
location /socket.io/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

3. **Use Redis for Scaling**
```javascript
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));
```

## 📞 Support

If you encounter any issues:

1. Check that your JWT tokens are valid
2. Verify WebSocket connection in browser dev tools
3. Check server logs for WebSocket connection errors
4. Ensure your database schema matches the provided structure
5. Test API endpoints with tools like Postman

## 🎉 You're Done!

Once you've implemented these backend changes:

1. ✅ Real-time notifications will work automatically
2. ✅ Users can configure their notification preferences
3. ✅ Notification history will be saved and retrievable
4. ✅ WebSocket connection will show as "Connected" in your frontend

Your notification system is now fully functional! 🚀