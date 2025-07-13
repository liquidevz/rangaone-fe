"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, TrendingUp, Crown, Star, ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { tipsService, Tip } from "@/services/tip.service"
import { portfolioService } from "@/services/portfolio.service"
import { subscriptionService, SubscriptionAccess } from "@/services/subscription.service"
import { Portfolio } from "@/lib/types"
import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { MethodologyModal } from "@/components/methodology-modal"

// Market Indices Component
export function MarketIndicesSection() {
  const [indices, setIndices] = useState([
    {
      name: "Sensex",
      value: "₹76,597.38",
      change: "-101.21",
      changePercent: "(-0.18%)",
      isNegative: true,
    },
    {
      name: "BSE 100",
      value: "₹24,424.59",
      change: "-16.33",
      changePercent: "(-0.07%)",
      isNegative: true,
    },
    {
      name: "BSE Mid Cap",
      value: "₹41,652.26",
      change: "+162.4",
      changePercent: "(0.39%)",
      isNegative: false,
    },
  ])

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Indices</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indices.map((index) => (
          <div key={index.name} className="text-center">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-700">{index.name}</h3>
              <div className="text-lg font-bold text-gray-900">{index.value}</div>
              <div
                className={cn(
                  "flex items-center justify-center text-sm font-medium",
                  index.isNegative ? "text-red-500" : "text-green-500",
                )}
              >
                {index.isNegative ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUp className="h-3 w-3 mr-1" />
                )}
                <span>
                  {index.change} {index.changePercent}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Expert Recommendations Component
export function ExpertRecommendationsSection() {
  const [activeTab, setActiveTab] = useState("rangaoneWealth")
  const [modelPortfolioTips, setModelPortfolioTips] = useState<Tip[]>([])
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | null>(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  const rangaoneWealthRecommendations = [
    {
      id: 1,
      title: "Will Sona BLW's EV Strategy Pay Off Despite Global Challenges ?",
      category: "Premium",
      stock: {
        name: "IDFC FIRST B",
        exchange: "BSE",
        action: "Buy",
        target: "39%",
      },
      categoryColor: "bg-yellow-400",
      borderColor: "border-yellow-400",
    },
    {
      id: 2,
      title: "Will Sona BLW's EV Strategy Pay Off Despite Global Challenges ?",
      category: "Basic",
      stock: {
        name: "IDFC FIRST B",
        exchange: "BSE",
        action: "Buy",
        target: "18%",
      },
      categoryColor: "bg-blue-500",
      borderColor: "border-blue-500",
    },
    {
      id: 3,
      title: "Will Sona BLW's EV Strategy Pay Off Despite Global Challenges ?",
      category: "Social Media",
      stock: {
        name: "IDFC FIRST B",
        exchange: "BSE",
        action: "Buy",
        target: "18%",
      },
      categoryColor: "bg-pink-500",
      borderColor: "border-pink-500",
    },
  ]

  useEffect(() => {
    const fetchSubscriptionAccess = async () => {
      if (isAuthenticated) {
        try {
          const accessData = await subscriptionService.getSubscriptionAccess()
          setSubscriptionAccess(accessData)
        } catch (error) {
          console.error("Failed to fetch subscription access:", error)
        }
      }
    }

    fetchSubscriptionAccess()
  }, [isAuthenticated])

  useEffect(() => {
    const fetchModelPortfolioTips = async () => {
      if (activeTab === "modelPortfolio") {
        setLoading(true)
        try {
          const allTips = await tipsService.getAll()
          let filteredTips: Tip[] = []
          
          if (subscriptionAccess?.hasPremium) {
            filteredTips = allTips
          } else if (subscriptionAccess?.hasBasic) {
            filteredTips = allTips.filter(tip => tip.category === 'basic' || !tip.category)
          } else {
            filteredTips = allTips.filter(tip => tip.category === 'basic' || !tip.category)
          }
          
          setModelPortfolioTips(filteredTips.slice(0, 3))
        } catch (error) {
          console.error("Failed to fetch model portfolio tips:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchModelPortfolioTips()
  }, [activeTab, subscriptionAccess])

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Expert Recommendations</h2>
        <Link href="/rangaone-wealth">
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
            View All
          </Button>
        </Link>
      </div>

      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeTab === "rangaoneWealth" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("rangaoneWealth")}
          className={activeTab === "rangaoneWealth" ? "bg-blue-600 text-white" : ""}
        >
          Rangaone Wealth
        </Button>
        <Button
          variant={activeTab === "modelPortfolio" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("modelPortfolio")}
          className={activeTab === "modelPortfolio" ? "bg-blue-600 text-white" : ""}
        >
          Model Portfolio
        </Button>
      </div>

      <div className="space-y-4">
        {activeTab === "rangaoneWealth" ? (
          rangaoneWealthRecommendations.map((rec) => (
            <div key={rec.id} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {rec.title}
              </h3>
              <div className={`border-2 ${rec.borderColor} rounded-lg p-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`${rec.categoryColor} text-white px-2 py-1 rounded text-xs font-medium`}>
                      {rec.category}
                    </div>
                    {rec.category === "Premium" && <Lock className="h-3 w-3 text-gray-500" />}
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-bold">
                    Target {rec.stock.target} upto
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{rec.stock.name}</div>
                    <div className="text-sm text-gray-500">{rec.stock.exchange}</div>
                    <div className="text-sm text-gray-700">Action:- {rec.stock.action}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              modelPortfolioTips.map((tip) => (
                <ModelPortfolioTipCard key={tip._id} tip={tip} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Model Portfolio Section Component
export function ModelPortfolioSection() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [userAccessiblePortfolios, setUserAccessiblePortfolios] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        setLoading(true)
        
        // First try to get portfolios from authenticated endpoint
        if (isAuthenticated) {
          try {
            const authPortfolios = await portfolioService.getAll()
            if (authPortfolios && authPortfolios.length > 0) {
              setPortfolios(authPortfolios.slice(0, 6))
              // Extract IDs of portfolios user has access to
              const accessibleIds = authPortfolios
                .filter(p => !p.isPurchased === false) // User has access if isPurchased is not false
                .map(p => p._id)
              setUserAccessiblePortfolios(accessibleIds)
            } else {
              // Fallback to public endpoint
              const publicPortfolios = await portfolioService.getPublic()
              setPortfolios(publicPortfolios.slice(0, 6))
            }
          } catch (error) {
            console.error("Failed to fetch authenticated portfolios:", error)
            // Fallback to public endpoint
            const publicPortfolios = await portfolioService.getPublic()
            setPortfolios(publicPortfolios.slice(0, 6))
          }
        } else {
          // Not authenticated - use public endpoint
          const publicPortfolios = await portfolioService.getPublic()
          setPortfolios(publicPortfolios.slice(0, 6))
        }
      } catch (error) {
        console.error("Failed to load portfolios:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPortfolios()
  }, [isAuthenticated])

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Model Portfolio</h2>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Model Portfolio</h2>
        <Link href="/model-portfolios">
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {portfolios.map((portfolio) => (
          <PortfolioCard 
            key={portfolio._id} 
            portfolio={portfolio} 
            hasAccess={userAccessiblePortfolios.includes(portfolio._id)}
          />
        ))}
      </div>
    </div>
  )
}

// Model Portfolio Tip Card Component
function ModelPortfolioTipCard({ tip }: { tip: Tip }) {
  const router = useRouter()
  
  const stockSymbol = tip.title.split(':')[0]?.trim().toUpperCase() || 
                     tip.title.split(' ')[0]?.trim().toUpperCase() || 
                     "STOCK"
  
  const buyRange = tip.buyRange || "N/A"
  const formattedBuyRange = buyRange.includes('₹') ? buyRange : `₹ ${buyRange}`
  
  const action = tip.status === "Active" ? "HOLD" : tip.status?.toUpperCase() || "HOLD"
  
  const handleTipClick = () => {
    const portfolioId = typeof tip.portfolio === 'string' ? tip.portfolio : tip.portfolio?._id
    if (portfolioId) {
      router.push(`/model-portfolios/${portfolioId}/tips/${tip._id}`)
    } else {
      router.push(`/rangaone-wealth/recommendation/${tip._id}`)
    }
  }
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
        {tip.title}
      </h3>
      <div className="border-2 border-blue-500 rounded-lg p-3 cursor-pointer hover:bg-blue-50" onClick={handleTipClick}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              Premium
            </div>
            <Lock className="h-3 w-3 text-gray-500" />
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-bold">
            Target {tip.targetPercentage || "15%"} upto
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">{stockSymbol}</div>
            <div className="text-sm text-gray-500">NSE</div>
            <div className="text-sm text-gray-700">Action:- {action}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Portfolio Card Component
function PortfolioCard({ portfolio, hasAccess }: { portfolio: Portfolio; hasAccess: boolean }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  const handleDetailsClick = () => {
    router.push(`/model-portfolios/${portfolio._id}`)
  }
  
  const handleSubscribeClick = () => {
    if (isAuthenticated) {
      router.push(`/model-portfolios/${portfolio._id}`)
    } else {
      router.push('/login')
    }
  }
  
  // Check if portfolio data should be locked/blurred
  const isLocked = !isAuthenticated || !hasAccess
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-900 uppercase">{portfolio.name}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDetailsClick}
          className="text-gray-600 border-gray-300"
        >
          Details
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center mb-3">
        <div className="relative">
          <div className="text-xs text-gray-500">Monthly Gains</div>
          <div className="relative">
            <div className={`text-sm font-semibold ${isLocked ? 'blur-sm text-green-600' : 'text-green-600'}`}>
              {isLocked ? `+${Math.floor(Math.random() * 20) + 5}.${Math.floor(Math.random() * 99)}%` : `+${portfolio.monthlyGains || '13.78'}%`}
            </div>
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="h-3 w-3 text-gray-500" />
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <div className="text-xs text-gray-500">1 Year Gains</div>
          <div className="relative">
            <div className={`text-sm font-semibold ${isLocked ? 'blur-sm text-green-600' : 'text-green-600'}`}>
              {isLocked ? `+${Math.floor(Math.random() * 15) + 2}.${Math.floor(Math.random() * 99)}%` : `+${portfolio.oneYearGains || '2.86'}%`}
            </div>
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="h-3 w-3 text-gray-500" />
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <div className="text-xs text-gray-500">CAGR Since Inception</div>
          <div className="relative">
            <div className={`text-sm font-semibold ${isLocked ? 'blur-sm text-green-600' : 'text-green-600'}`}>
              {isLocked ? `+${Math.floor(Math.random() * 25) + 10}.${Math.floor(Math.random() * 99)}%` : `+${portfolio.cagr || '19.78'}%`}
            </div>
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="h-3 w-3 text-gray-500" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isLocked && (
        <div className="flex items-center justify-center mb-2">
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
      )}
      
      <div className="text-center">
        <Button
          onClick={handleSubscribeClick}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
        >
          Subscribe now
        </Button>
      </div>
    </div>
  )
} 