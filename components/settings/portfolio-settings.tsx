"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { userService } from "@/services/user.service"

export default function PortfolioSettings() {
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true)
      try {
        const data = await userService.getUserPortfolios()
        setPortfolios(data)
      } catch (error) {
        console.error("Failed to fetch portfolios:", error)
        toast({
          title: "Error",
          description: "Failed to load portfolio information. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolios()
  }, [toast])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600">Loading portfolio information...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Portfolio Management</h2>
        <p className="text-gray-600 mb-6">View your available portfolios.</p>
      </div>

      <div className="space-y-4">
        {(() => {
          const subscribedPortfolios = portfolios.filter(p => !p.message)
          return subscribedPortfolios.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">No subscribed portfolios found.</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Subscribed to {subscribedPortfolios.length} portfolios</p>
              <ul className="mt-4 space-y-2">
                {subscribedPortfolios.map((portfolio, index) => (
                  <li key={index} className="text-gray-800">
                    {portfolio.name || 'Unnamed Portfolio'} - {portfolio.PortfolioCategory || 'No Category'}
                  </li>
                ))}
              </ul>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
