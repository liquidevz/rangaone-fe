"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, AlertCircle, Calendar, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Subscription {
  id: string
  name: string
  type: string
  status: "active" | "expired" | "canceled" | "pending"
  startDate: string
  endDate: string
  autoRenew: boolean
  price: number
  billingCycle: "monthly" | "quarterly" | "annually"
  features: string[]
}

export default function SubscriptionSettings() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true)
      try {
        // In a real app, this would be a fetch call to your API
        // const response = await fetch('/api/user/subscriptions')
        // const data = await response.json()

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setSubscriptions([
            {
              id: "1",
              name: "Premium Plan",
              type: "Trading Recommendations",
              status: "active",
              startDate: "2023-01-15T00:00:00Z",
              endDate: "2024-01-15T00:00:00Z",
              autoRenew: true,
              price: 9999,
              billingCycle: "annually",
              features: [
                "Unlimited stock recommendations",
                "Real-time market alerts",
                "Portfolio tracking",
                "Expert analysis reports",
                "Priority customer support",
              ],
            },
            {
              id: "2",
              name: "Growth Portfolio",
              type: "Model Portfolio",
              status: "active",
              startDate: "2023-03-10T00:00:00Z",
              endDate: "2023-09-10T00:00:00Z",
              autoRenew: true,
              price: 4999,
              billingCycle: "quarterly",
              features: [
                "Access to Growth Portfolio",
                "Portfolio rebalancing alerts",
                "Monthly performance reports",
                "Stock entry and exit points",
              ],
            },
            {
              id: "3",
              name: "Basic Plan",
              type: "Market Analysis",
              status: "expired",
              startDate: "2022-06-15T00:00:00Z",
              endDate: "2023-06-15T00:00:00Z",
              autoRenew: false,
              price: 2999,
              billingCycle: "annually",
              features: ["Basic market analysis", "Weekly market reports", "Limited stock recommendations"],
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription information. Please try again later.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [toast])

  const toggleAutoRenew = (id: string) => {
    setSubscriptions((prev) => prev.map((sub) => (sub.id === id ? { ...sub, autoRenew: !sub.autoRenew } : sub)))

    toast({
      title: "Auto-renew updated",
      description: "Your subscription auto-renewal preference has been updated.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "expired":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "canceled":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "pending":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()

    const totalDuration = end - start
    const elapsed = now - start

    if (elapsed <= 0) return 0
    if (elapsed >= totalDuration) return 100

    return Math.round((elapsed / totalDuration) * 100)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600">Loading subscription information...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Subscriptions</h2>
        <p className="text-gray-600 mb-6">
          Manage your active subscriptions, view billing details, and control auto-renewal settings.
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">You don't have any subscriptions yet.</p>
          <Button className="bg-indigo-900 hover:bg-indigo-800">Browse Available Plans</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold">{subscription.name}</h3>
                        <Badge className={cn("text-xs", getStatusColor(subscription.status))}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{subscription.type}</p>
                    </div>
                    <div className="flex gap-2">
                      {subscription.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex items-center",
                            subscription.autoRenew
                              ? "text-green-600 border-green-200 hover:bg-green-50"
                              : "text-gray-600 border-gray-200 hover:bg-gray-50",
                          )}
                          onClick={() => toggleAutoRenew(subscription.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {subscription.autoRenew ? "Auto-renew On" : "Auto-renew Off"}
                        </Button>
                      )}
                      {subscription.status === "expired" && (
                        <Button size="sm" className="flex items-center bg-indigo-900 hover:bg-indigo-800">
                          Renew Now
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Billing Cycle</p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <p className="font-medium">
                          {subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)} - ₹
                          {subscription.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Start Date</p>
                      <p className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">End Date</p>
                      <p className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {subscription.status === "active" && (
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <p className="text-sm text-gray-600">Subscription Period</p>
                        <p className="text-sm font-medium">
                          {calculateDaysRemaining(subscription.endDate)} days remaining
                        </p>
                      </div>
                      <Progress
                        value={calculateProgress(subscription.startDate, subscription.endDate)}
                        className="h-2"
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-3">Included Features:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subscription.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {subscription.status === "active" && subscription.autoRenew && (
                  <div className="bg-blue-50 px-6 py-3 border-t border-blue-100 flex items-center">
                    <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
                    <p className="text-sm text-blue-700">
                      Your subscription will automatically renew on{" "}
                      <span className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</span>. You
                      will be charged ₹{subscription.price.toLocaleString()}.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
        <p className="text-gray-600 mb-4">
          If you have any questions about your subscriptions or need assistance, our support team is here to help.
        </p>
        <div className="flex gap-4">
          <Button variant="outline">Contact Support</Button>
          <Button variant="outline">View FAQ</Button>
        </div>
      </div>
    </div>
  )
}
