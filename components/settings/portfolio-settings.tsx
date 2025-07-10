"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ExternalLink, Eye, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Portfolio {
  id: string
  name: string
  type: string
  description: string
  monthlyYield: number
  ytdYield: number
  totalInvestment: number
  currentValue: number
  isPurchased: boolean
  createdAt: string
  updatedAt: string
}

export default function PortfolioSettings() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true)
      try {
        // In a real app, this would be a fetch call to your API
        // const response = await fetch('/api/user/portfolios')
        // const data = await response.json()

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setPortfolios([
            {
              id: "1",
              name: "Growth Portfolio",
              type: "Aggressive Growth",
              description: "High-risk, high-reward portfolio focused on emerging tech companies.",
              monthlyYield: 2.8,
              ytdYield: 18.5,
              totalInvestment: 250000,
              currentValue: 296250,
              isPurchased: true,
              createdAt: "2023-01-15T10:30:00Z",
              updatedAt: "2023-05-20T14:45:00Z",
            },
            {
              id: "2",
              name: "Dividend Income",
              type: "Income",
              description: "Stable portfolio focused on dividend-paying blue-chip stocks.",
              monthlyYield: 0.7,
              ytdYield: 8.2,
              totalInvestment: 500000,
              currentValue: 541000,
              isPurchased: true,
              createdAt: "2022-11-05T09:15:00Z",
              updatedAt: "2023-05-18T11:20:00Z",
            },
            {
              id: "3",
              name: "Balanced Growth",
              type: "Balanced",
              description: "Moderate-risk portfolio with a mix of growth and value stocks.",
              monthlyYield: 1.5,
              ytdYield: 12.3,
              totalInvestment: 350000,
              currentValue: 393050,
              isPurchased: false,
              createdAt: "2023-02-20T13:45:00Z",
              updatedAt: "2023-05-15T16:30:00Z",
            },
            {
              id: "4",
              name: "Tech Innovators",
              type: "Sector Focus",
              description: "Specialized portfolio targeting innovative technology companies.",
              monthlyYield: 2.2,
              ytdYield: 15.8,
              totalInvestment: 200000,
              currentValue: 231600,
              isPurchased: false,
              createdAt: "2023-03-10T11:00:00Z",
              updatedAt: "2023-05-12T10:15:00Z",
            },
            {
              id: "5",
              name: "Healthcare Leaders",
              type: "Sector Focus",
              description: "Focused portfolio of established and emerging healthcare companies.",
              monthlyYield: 1.8,
              ytdYield: 13.5,
              totalInvestment: 180000,
              currentValue: 204300,
              isPurchased: false,
              createdAt: "2023-04-05T14:30:00Z",
              updatedAt: "2023-05-10T09:45:00Z",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch portfolios:", error)
        toast({
          title: "Error",
          description: "Failed to load portfolio information. Please try again later.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchPortfolios()
  }, [toast])

  const filteredPortfolios = portfolios.filter(
    (portfolio) =>
      portfolio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
        <p className="text-gray-600 mb-6">
          View and manage your investment portfolios. Subscribe to new portfolios to access detailed information and
          recommendations.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search portfolios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <Link href="/model-portfolios">
          <Button className="bg-indigo-900 hover:bg-indigo-800">Browse All Portfolios</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {filteredPortfolios.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No portfolios found matching your search criteria.</p>
          </div>
        ) : (
          filteredPortfolios.map((portfolio) => (
            <Card key={portfolio.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold">{portfolio.name}</h3>
                        <Badge
                          className={cn(
                            "text-xs",
                            portfolio.isPurchased
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100",
                          )}
                        >
                          {portfolio.isPurchased ? "Subscribed" : "Not Subscribed"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{portfolio.type}</p>
                    </div>
                    <div className="flex gap-2">
                      {portfolio.isPurchased ? (
                        <Link href={`/model-portfolios/${portfolio.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" size="sm" className="flex items-center" disabled>
                          <Lock className="h-4 w-4 mr-1" />
                          Subscribe to View
                        </Button>
                      )}
                      <Link href={`/model-portfolios/${portfolio.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="flex items-center">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Open in new tab</span>
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{portfolio.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Monthly Yield</p>
                      <p
                        className={cn("font-semibold", portfolio.monthlyYield >= 0 ? "text-green-600" : "text-red-600")}
                      >
                        {portfolio.monthlyYield.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">YTD Yield</p>
                      <p className={cn("font-semibold", portfolio.ytdYield >= 0 ? "text-green-600" : "text-red-600")}>
                        {portfolio.ytdYield.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Investment</p>
                      <p className="font-semibold">₹{portfolio.totalInvestment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Current Value</p>
                      <p className="font-semibold">₹{portfolio.currentValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Created: {new Date(portfolio.createdAt).toLocaleDateString()}</span>
                    <span>Last Updated: {new Date(portfolio.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
