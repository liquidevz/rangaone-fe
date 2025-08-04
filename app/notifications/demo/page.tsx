"use client"

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { useNotifications } from '@/components/notifications/notification-context';
import { firebaseNotificationService } from '@/services/firebase-notification.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationData } from '@/services/notification.service';
import { FirebaseNotificationSettings } from '@/components/notifications/firebase-notification-settings';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Newspaper, 
  Lightbulb, 
  CheckCircle,
  Wifi,
  WifiOff,
  TestTube,
  Smartphone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function NotificationDemoPage() {
  const { simulateNotification, isConnected } = useNotifications();
  const [loading, setLoading] = useState<string | null>(null);

  const demoNotifications: Array<{
    type: NotificationData['type'];
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      type: 'recommendation',
      title: 'New Stock Recommendation',
      description: 'Get notified when new buy/sell recommendations are available',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      type: 'price_alert',
      title: 'Price Alert',
      description: 'Receive alerts when stocks reach your target price',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'from-green-500 to-green-600',
    },
    {
      type: 'portfolio_update',
      title: 'Portfolio Update',
      description: 'Stay informed about portfolio rebalancing and changes',
      icon: <PieChart className="h-5 w-5" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      type: 'market_update',
      title: 'Market Update',
      description: 'Important market news and announcements',
      icon: <Newspaper className="h-5 w-5" />,
      color: 'from-orange-500 to-orange-600',
    },
    {
      type: 'tip',
      title: 'Investment Tip',
      description: 'New investment tips and insights from experts',
      icon: <Lightbulb className="h-5 w-5" />,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      type: 'order_update',
      title: 'Order Update',
      description: 'Order execution and status updates',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  const handleSimulate = async (type: NotificationData['type']) => {
    setLoading(type);
    // Simulate a small delay to make it feel more realistic
    await new Promise(resolve => setTimeout(resolve, 500));
    simulateNotification(type);
    setLoading(null);
  };

  const handleSimulateFirebase = async (type: NotificationData['type']) => {
    setLoading(`firebase_${type}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    firebaseNotificationService.simulateFirebaseNotification(type);
    setLoading(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <TestTube className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Notification Demo</h1>
          </div>
          <p className="text-gray-600">
            Test the notification system by triggering different types of notifications
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-600" />
                  <span>Disconnected</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isConnected 
                ? 'Real-time notifications are active. You will receive updates instantly.'
                : 'WebSocket connection is not active. Connect to receive real-time updates.'}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Firebase Push Notification Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Firebase Push Notifications
          </h2>
          <FirebaseNotificationSettings />
        </div>

        {/* Demo Notifications */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoNotifications.map((demo) => (
              <Card key={demo.type} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${demo.color} flex items-center justify-center text-white mb-3`}>
                    {demo.icon}
                  </div>
                  <CardTitle className="text-lg">{demo.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {demo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => handleSimulate(demo.type)}
                    disabled={loading === demo.type}
                    className="w-full"
                    variant="outline"
                  >
                    {loading === demo.type ? 'Sending...' : 'Send Toast Notification'}
                  </Button>
                  <Button
                    onClick={() => handleSimulateFirebase(demo.type)}
                    disabled={loading === `firebase_${demo.type}`}
                    className="w-full"
                    variant="default"
                  >
                    {loading === `firebase_${demo.type}` ? 'Sending...' : 'Send Firebase Notification'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Click "Send Toast Notification" to test in-app notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Click "Send Firebase Notification" to test push notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Enable push notifications to receive alerts even when the app is closed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Check the notification bell in the header to see all notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Visit the <a href="/notifications" className="underline font-medium">Notifications page</a> to manage all your notifications</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Settings Info */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Customize your notification preferences in the settings page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive important updates via email</p>
                </div>
                <Badge>Configurable</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Real-time alerts in your browser</p>
                </div>
                <Badge>Configurable</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Critical alerts sent to your phone</p>
                </div>
                <Badge>Configurable</Badge>
              </div>
              <Button asChild className="w-full mt-4">
                <a href="/settings?tab=notifications">Go to Notification Settings</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}