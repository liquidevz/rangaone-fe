"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface NotificationSettings {
  email: {
    marketUpdates: boolean
    newRecommendations: boolean
    portfolioAlerts: boolean
    priceAlerts: boolean
    accountActivity: boolean
    promotions: boolean
  }
  push: {
    marketUpdates: boolean
    newRecommendations: boolean
    portfolioAlerts: boolean
    priceAlerts: boolean
    accountActivity: boolean
  }
  sms: {
    marketUpdates: boolean
    newRecommendations: boolean
    portfolioAlerts: boolean
    priceAlerts: boolean
    accountActivity: boolean
  }
  frequency: "realtime" | "daily" | "weekly"
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        // In a real app, this would be a fetch call to your API
        // const response = await fetch('/api/user/notification-settings')
        // const data = await response.json()

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setSettings({
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
            frequency: "daily",
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch notification settings:", error)
        toast({
          title: "Error",
          description: "Failed to load notification settings. Please try again later.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchSettings()
  }, [toast])

  const handleToggle = (category: "email" | "push" | "sms", setting: string, value: boolean) => {
    if (!settings) return

    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value,
      },
    })
  }

  const handleFrequencyChange = (value: "realtime" | "daily" | "weekly") => {
    if (!settings) return

    setSettings({
      ...settings,
      frequency: value,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, this would be a fetch call to your API
      // await fetch('/api/user/notification-settings', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(settings),
      // })

      // For demo purposes, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600">Loading notification settings...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">Failed to load notification settings. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
        <p className="text-gray-600 mb-6">
          Customize how and when you receive notifications about market updates, recommendations, and account activity.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-market-updates" className="flex-1">
                Market Updates
                <p className="text-sm font-normal text-gray-500">Daily market summaries and important news</p>
              </Label>
              <Switch
                id="email-market-updates"
                checked={settings.email.marketUpdates}
                onCheckedChange={(value) => handleToggle("email", "marketUpdates", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-new-recommendations" className="flex-1">
                New Recommendations
                <p className="text-sm font-normal text-gray-500">Alerts when new stock recommendations are available</p>
              </Label>
              <Switch
                id="email-new-recommendations"
                checked={settings.email.newRecommendations}
                onCheckedChange={(value) => handleToggle("email", "newRecommendations", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-portfolio-alerts" className="flex-1">
                Portfolio Alerts
                <p className="text-sm font-normal text-gray-500">Updates about your portfolio performance</p>
              </Label>
              <Switch
                id="email-portfolio-alerts"
                checked={settings.email.portfolioAlerts}
                onCheckedChange={(value) => handleToggle("email", "portfolioAlerts", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-price-alerts" className="flex-1">
                Price Alerts
                <p className="text-sm font-normal text-gray-500">Notifications when stocks hit your target prices</p>
              </Label>
              <Switch
                id="email-price-alerts"
                checked={settings.email.priceAlerts}
                onCheckedChange={(value) => handleToggle("email", "priceAlerts", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-account-activity" className="flex-1">
                Account Activity
                <p className="text-sm font-normal text-gray-500">Login alerts and subscription updates</p>
              </Label>
              <Switch
                id="email-account-activity"
                checked={settings.email.accountActivity}
                onCheckedChange={(value) => handleToggle("email", "accountActivity", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-promotions" className="flex-1">
                Promotions and Offers
                <p className="text-sm font-normal text-gray-500">Special deals and promotional content</p>
              </Label>
              <Switch
                id="email-promotions"
                checked={settings.email.promotions}
                onCheckedChange={(value) => handleToggle("email", "promotions", value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-market-updates" className="flex-1">
                Market Updates
              </Label>
              <Switch
                id="push-market-updates"
                checked={settings.push.marketUpdates}
                onCheckedChange={(value) => handleToggle("push", "marketUpdates", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-new-recommendations" className="flex-1">
                New Recommendations
              </Label>
              <Switch
                id="push-new-recommendations"
                checked={settings.push.newRecommendations}
                onCheckedChange={(value) => handleToggle("push", "newRecommendations", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-portfolio-alerts" className="flex-1">
                Portfolio Alerts
              </Label>
              <Switch
                id="push-portfolio-alerts"
                checked={settings.push.portfolioAlerts}
                onCheckedChange={(value) => handleToggle("push", "portfolioAlerts", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-price-alerts" className="flex-1">
                Price Alerts
              </Label>
              <Switch
                id="push-price-alerts"
                checked={settings.push.priceAlerts}
                onCheckedChange={(value) => handleToggle("push", "priceAlerts", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-account-activity" className="flex-1">
                Account Activity
              </Label>
              <Switch
                id="push-account-activity"
                checked={settings.push.accountActivity}
                onCheckedChange={(value) => handleToggle("push", "accountActivity", value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">SMS Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-market-updates" className="flex-1">
                Market Updates
              </Label>
              <Switch
                id="sms-market-updates"
                checked={settings.sms.marketUpdates}
                onCheckedChange={(value) => handleToggle("sms", "marketUpdates", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-new-recommendations" className="flex-1">
                New Recommendations
              </Label>
              <Switch
                id="sms-new-recommendations"
                checked={settings.sms.newRecommendations}
                onCheckedChange={(value) => handleToggle("sms", "newRecommendations", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-portfolio-alerts" className="flex-1">
                Portfolio Alerts
              </Label>
              <Switch
                id="sms-portfolio-alerts"
                checked={settings.sms.portfolioAlerts}
                onCheckedChange={(value) => handleToggle("sms", "portfolioAlerts", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-price-alerts" className="flex-1">
                Price Alerts
              </Label>
              <Switch
                id="sms-price-alerts"
                checked={settings.sms.priceAlerts}
                onCheckedChange={(value) => handleToggle("sms", "priceAlerts", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-account-activity" className="flex-1">
                Account Activity
              </Label>
              <Switch
                id="sms-account-activity"
                checked={settings.sms.accountActivity}
                onCheckedChange={(value) => handleToggle("sms", "accountActivity", value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Notification Frequency</h3>
          <RadioGroup
            value={settings.frequency}
            onValueChange={(value) => handleFrequencyChange(value as "realtime" | "daily" | "weekly")}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="realtime" id="frequency-realtime" />
              <Label htmlFor="frequency-realtime" className="flex-1">
                Real-time
                <p className="text-sm font-normal text-gray-500">Receive notifications as events happen</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="frequency-daily" />
              <Label htmlFor="frequency-daily" className="flex-1">
                Daily Digest
                <p className="text-sm font-normal text-gray-500">Receive a daily summary of all notifications</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="frequency-weekly" />
              <Label htmlFor="frequency-weekly" className="flex-1">
                Weekly Digest
                <p className="text-sm font-normal text-gray-500">Receive a weekly summary of all notifications</p>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-900 hover:bg-indigo-800">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
