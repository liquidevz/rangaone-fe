"use client"

import { useState } from 'react';
import { useNotifications } from './notification-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  BellOff, 
  Shield, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function FirebaseNotificationSettings() {
  const {
    isFirebaseEnabled,
    fcmToken,
    notificationPermission,
    requestFirebasePermission,
    unsubscribeFromFirebase,
  } = useNotifications();

  const [loading, setLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      await requestFirebasePermission();
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      await unsubscribeFromFirebase();
    } finally {
      setLoading(false);
    }
  };

  const getPermissionStatus = () => {
    switch (notificationPermission) {
      case 'granted':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          label: 'Granted',
          color: 'bg-green-100 text-green-800',
          description: 'Push notifications are enabled'
        };
      case 'denied':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
          label: 'Denied',
          color: 'bg-red-100 text-red-800',
          description: 'Push notifications are blocked'
        };
      default:
        return {
          icon: <Shield className="h-5 w-5 text-yellow-600" />,
          label: 'Not Requested',
          color: 'bg-yellow-100 text-yellow-800',
          description: 'Permission not yet requested'
        };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="space-y-6">
      {/* Push Notifications Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications even when your browser is closed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permission Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {permissionStatus.icon}
              <div>
                <p className="font-medium">Permission Status</p>
                <p className="text-sm text-gray-600">{permissionStatus.description}</p>
              </div>
            </div>
            <Badge className={cn('text-xs', permissionStatus.color)}>
              {permissionStatus.label}
            </Badge>
          </div>

          {/* Firebase Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {isFirebaseEnabled ? (
                <Bell className="h-5 w-5 text-green-600" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-600">
                  {isFirebaseEnabled ? 'Active and receiving notifications' : 'Not configured'}
                </p>
              </div>
            </div>
            <Badge variant={isFirebaseEnabled ? 'default' : 'secondary'}>
              {isFirebaseEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {/* FCM Token Info (for debugging) */}
          {fcmToken && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <p className="font-medium text-blue-900">Device Token</p>
              </div>
              <p className="text-xs text-blue-700 font-mono break-all">
                {fcmToken.substring(0, 50)}...
              </p>
              <p className="text-xs text-blue-600 mt-1">
                This token identifies your device for push notifications
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!isFirebaseEnabled ? (
              <Button
                onClick={handleEnableNotifications}
                disabled={loading || notificationPermission === 'denied'}
                className="flex-1"
              >
                {loading ? 'Enabling...' : 'Enable Push Notifications'}
              </Button>
            ) : (
              <Button
                onClick={handleDisableNotifications}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {loading ? 'Disabling...' : 'Disable Notifications'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Information */}
      {notificationPermission === 'denied' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Push notifications are blocked. To enable them, click the lock icon in your browser's 
            address bar and allow notifications, then refresh this page.
          </AlertDescription>
        </Alert>
      )}

      {notificationPermission === 'default' && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            Enable push notifications to receive important updates about your investments 
            even when you're not actively using the app.
          </AlertDescription>
        </Alert>
      )}

      {isFirebaseEnabled && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Push notifications are active! You'll receive notifications for:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>New stock recommendations</li>
              <li>Price alerts when stocks hit your targets</li>
              <li>Portfolio updates and rebalancing</li>
              <li>Important market news</li>
              <li>New investment tips</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Browser Compatibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Browser Compatibility</CardTitle>
          <CardDescription>
            Push notifications work on the following browsers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Chrome', supported: true },
              { name: 'Firefox', supported: true },
              { name: 'Safari', supported: true },
              { name: 'Edge', supported: true },
            ].map((browser) => (
              <div
                key={browser.name}
                className={cn(
                  'p-3 rounded-lg border text-center',
                  browser.supported 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                )}
              >
                <p className="font-medium">{browser.name}</p>
                <p className={cn(
                  'text-sm',
                  browser.supported ? 'text-green-600' : 'text-red-600'
                )}>
                  {browser.supported ? 'Supported' : 'Not Supported'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}