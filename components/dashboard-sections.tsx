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
import { authService } from "@/services/auth.service"

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
  const [activeTab, setActiveTab] = useState("RangaOneWealth")
  const [modelPortfolioTips, setModelPortfolioTips] = useState<Tip[]>([])
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | null>(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  const RangaOneWealthRecommendations = [
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
          console.log("🔄 Fetching fresh subscription access from API...")
          const accessData = await subscriptionService.forceRefresh()
          setSubscriptionAccess(accessData)
          console.log("✅ Subscription access updated:", accessData)
        } catch (error) {
          console.error("Failed to fetch subscription access:", error)
        }
      }
    }

    fetchSubscriptionAccess()
  }, [isAuthenticated])

  // Debug function - call from browser console: window.debugSubscriptionAccess()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugSubscriptionAccess = async () => {
        console.log("🔧 Manual subscription access debug...")
        try {
          const accessData = await subscriptionService.getSubscriptionAccess(true) // Force refresh
          console.log("🔍 Fresh subscription access data:", accessData)
          
          // Get raw subscription data
          const { subscriptions: rawSubscriptions, accessData: rawAccessData } = await subscriptionService.getUserSubscriptions(true)
          console.log("📊 Raw subscription data:", rawSubscriptions)
          console.log("📊 Raw access data:", rawAccessData)
          
          return accessData
        } catch (error) {
          console.error("❌ Debug failed:", error)
          return null
        }
      }
    }
  }, [])

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
          variant={activeTab === "RangaOneWealth" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("RangaOneWealth")}
          className={activeTab === "RangaOneWealth" ? "bg-blue-600 text-[#FFFFF0]" : ""}
        >
          RangaOne Wealth
        </Button>
        <Button
          variant={activeTab === "modelPortfolio" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("modelPortfolio")}
          className={activeTab === "modelPortfolio" ? "bg-blue-600 text-[#FFFFF0]" : ""}
        >
          Model Portfolio
        </Button>
      </div>

      <div className="space-y-4">
        {activeTab === "RangaOneWealth" ? (
          RangaOneWealthRecommendations.map((rec) => (
            <div key={rec.id} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {rec.title}
              </h3>
              <div className={`border-2 ${rec.borderColor} rounded-lg p-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`${rec.categoryColor} text-[#FFFFF0] px-2 py-1 rounded text-xs font-medium`}>
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
  const [portfolioDetails, setPortfolioDetails] = useState<{ [key: string]: any }>({})
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchSubscriptionAccess = async () => {
      if (isAuthenticated) {
        try {
          // Force refresh to ensure we get the latest subscription status after payment
          const accessData = await subscriptionService.forceRefresh()
          setSubscriptionAccess(accessData)
          console.log("📊 Updated subscription access:", accessData)
          
          // Debug: Check all user subscriptions
          const { subscriptions: allSubscriptions, accessData: debugAccessData } = await subscriptionService.getUserSubscriptions(true)
          console.log("🔍 All user subscriptions:", allSubscriptions)
          console.log("🔍 Debug access data:", debugAccessData)
          
          // Debug: Check if any subscriptions are active
          const activeSubscriptions = allSubscriptions.filter(sub => sub.isActive)
          console.log("✅ Active subscriptions:", activeSubscriptions)
          
        } catch (error) {
          console.error("Failed to fetch subscription access:", error)
        }
      }
    }

    fetchSubscriptionAccess()
  }, [isAuthenticated])

  // Debug function - call from browser console: window.debugPortfolioData()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugPortfolioData = async () => {
        console.log("🔧 Manual portfolio data debug...")
        try {
          const token = authService.getAccessToken()
          console.log("Auth token exists:", !!token)
          
          const allPortfolios = await portfolioService.getAll()
          console.log("📊 All portfolios:", allPortfolios)
          
          if (allPortfolios.length > 0) {
            const firstPortfolio = allPortfolios[0]
            console.log("Testing with first portfolio:", firstPortfolio._id)
            
            const details = await portfolioService.getById(firstPortfolio._id)
            console.log("📊 Portfolio details:", details)
            
            return { allPortfolios, firstPortfolio, details }
          }
        } catch (error) {
          console.error("❌ Debug failed:", error)
          return null
        }
      }
      
      // Debug subscription access
      (window as any).debugSubscriptionAccess = async () => {
        console.log("🔧 Manual subscription access debug...")
        try {
          const accessData = await subscriptionService.getSubscriptionAccess(true)
          console.log("📊 Current subscription access:", accessData)
          
          const allSubscriptions = await subscriptionService.getUserSubscriptions(true)
          console.log("🔍 All user subscriptions:", allSubscriptions)
          
          const activeSubscriptions = allSubscriptions.filter(sub => sub.isActive)
          console.log("✅ Active subscriptions:", activeSubscriptions)
          
          return { accessData, allSubscriptions, activeSubscriptions }
        } catch (error) {
          console.error("❌ Subscription debug failed:", error)
          return null
        }
      }
    }
  }, [])

  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        setLoading(true)
        
        // Always get portfolios from the appropriate endpoint
        let portfolioData: Portfolio[] = []
        
        if (isAuthenticated) {
          try {
            portfolioData = await portfolioService.getAll()
            console.log("📊 Portfolio data from getAll():", portfolioData)
          } catch (error) {
            console.error("Failed to fetch authenticated portfolios:", error)
            portfolioData = await portfolioService.getPublic()
          }
        } else {
          portfolioData = await portfolioService.getPublic()
        }
        
        setPortfolios(portfolioData.slice(0, 6))
        
        // Fetch detailed data for each portfolio
        if (isAuthenticated && portfolioData.length > 0) {
          console.log("🔍 Fetching detailed data for portfolios:", portfolioData.slice(0, 6).map(p => p._id))
          
          const detailsPromises = portfolioData.slice(0, 6).map(async (portfolio) => {
            try {
              console.log(`📡 Fetching details for portfolio ${portfolio._id}`)
              const details = await portfolioService.getById(portfolio._id)
              console.log(`📊 Portfolio ${portfolio._id} details:`, details)
              return { id: portfolio._id, data: details }
            } catch (error) {
              console.error(`Failed to fetch details for portfolio ${portfolio._id}:`, error)
              return { id: portfolio._id, data: null }
            }
          })
          
          const detailsResults = await Promise.all(detailsPromises)
          console.log("🎯 All portfolio details results:", detailsResults)
          
          const detailsMap = detailsResults.reduce((acc, { id, data }) => {
            if (data) {
              acc[id] = data
            }
            return acc
          }, {} as { [key: string]: any })
          
          console.log("🗂️ Final portfolio details map:", detailsMap)
          setPortfolioDetails(detailsMap)
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
        {portfolios.map((portfolio) => {
          // Use proper subscription-based access control
          const hasPortfolioAccess = getPortfolioAccess(portfolio._id, subscriptionAccess, isAuthenticated)
          
          return (
            <PortfolioCard 
              key={portfolio._id} 
              portfolio={portfolio} 
              portfolioDetails={portfolioDetails[portfolio._id] || null}
              hasAccess={hasPortfolioAccess}
              subscriptionAccess={subscriptionAccess}
              isAuthenticated={isAuthenticated}
            />
          )
        })}
      </div>
    </div>
  )
}

// Helper function to determine portfolio access - keeping for compatibility but not used
function getPortfolioAccess(portfolioId: string, subscriptionAccess: SubscriptionAccess | null, isAuthenticated: boolean): boolean {
  if (!isAuthenticated) return false
  if (!subscriptionAccess) return false
  
  // Premium users have access to all portfolios
  if (subscriptionAccess.hasPremium) return true
  
  // Basic users have access to basic portfolios
  if (subscriptionAccess.hasBasic) {
    // Basic users get access to portfolios (adjust categorization as needed)
    return true
  }
  
  // Individual portfolio access
  return subscriptionAccess.portfolioAccess.includes(portfolioId)
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
            <div className="bg-blue-500 text-[#FFFFF0] px-2 py-1 rounded text-xs font-medium">
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
function PortfolioCard({ 
  portfolio, 
  portfolioDetails, 
  hasAccess, 
  subscriptionAccess, 
  isAuthenticated 
}: { 
  portfolio: Portfolio
  portfolioDetails: any
  hasAccess: boolean
  subscriptionAccess: SubscriptionAccess | null
  isAuthenticated: boolean
}) {
  const router = useRouter()
  
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

  // Use the hasAccess prop directly - this is based on /api/user/portfolios response
  const isLocked = !hasAccess
  
  // Generate realistic fake data for blurred content
  const generateFakeData = () => ({
    monthlyGains: `+${Math.floor(Math.random() * 20) + 5}.${Math.floor(Math.random() * 99)}%`,
    oneYearGains: `+${Math.floor(Math.random() * 15) + 2}.${Math.floor(Math.random() * 99)}%`,
    cagr: `+${Math.floor(Math.random() * 25) + 10}.${Math.floor(Math.random() * 99)}%`
  })

  const fakeData = generateFakeData()

  // Get real performance data from API or fallback values
  const getPerformanceData = () => {
    console.log(`🎯 Portfolio ${portfolio._id} - portfolioDetails:`, portfolioDetails)
    console.log(`🔒 Portfolio ${portfolio._id} - isLocked:`, isLocked)
    
    if (portfolioDetails && !isLocked) {
      console.log(`✅ Using API data for portfolio ${portfolio._id}:`, {
        monthlyGains: portfolioDetails.monthlyGains,
        oneYearGains: portfolioDetails.oneYearGains,
        CAGRSinceInception: portfolioDetails.CAGRSinceInception
      })
      
      return {
        monthlyGains: portfolioDetails.monthlyGains !== undefined ? 
          `${portfolioDetails.monthlyGains >= 0 ? '+' : ''}${portfolioDetails.monthlyGains}%` : 
          `+${portfolio.monthlyGains || '13.78'}%`,
        oneYearGains: portfolioDetails.oneYearGains !== undefined ? 
          `${portfolioDetails.oneYearGains >= 0 ? '+' : ''}${portfolioDetails.oneYearGains}%` : 
          `+${portfolio.oneYearGains || '2.86'}%`,
        cagr: portfolioDetails.CAGRSinceInception !== undefined ? 
          `${portfolioDetails.CAGRSinceInception >= 0 ? '+' : ''}${portfolioDetails.CAGRSinceInception}%` : 
          `+${portfolio.cagr || '19.78'}%`
      }
    }
    
    console.log(`⚠️ Using fallback data for portfolio ${portfolio._id}`)
    
    // Fallback to original data or defaults
    return {
      monthlyGains: `+${portfolio.monthlyGains || '13.78'}%`,
      oneYearGains: `+${portfolio.oneYearGains || '2.86'}%`,
      cagr: `+${portfolio.cagr || '19.78'}%`
    }
  }

  const performanceData = getPerformanceData()
  console.log(`📊 Final performance data for ${portfolio._id}:`, performanceData)

  // Determine button styling based on access
  const getButtonStyling = () => {
    if (!isAuthenticated) {
      return {
        text: "Login to View",
        className: "bg-blue-600 hover:bg-blue-700 text-[#FFFFF0]"
      }
    }
    
    if (hasAccess) {
      return {
        text: "View Portfolio",
        className: "bg-green-600 hover:bg-green-700 text-[#FFFFF0]"
      }
    }
    
    if (subscriptionAccess?.hasPremium) {
      return {
        text: "Upgrade Required",
        className: "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-[#FFFFF0]"
      }
    }
    
    if (subscriptionAccess?.hasBasic) {
      return {
        text: "Upgrade to Premium",
        className: "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-[#FFFFF0]"
      }
    }
    
    return {
      text: "Subscribe Now",
      className: "bg-blue-600 hover:bg-blue-700 text-[#FFFFF0]"
    }
  }

  const buttonConfig = getButtonStyling()
  
  return (
    <div className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white overflow-hidden">
      <div className="p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              {portfolio.name}
            </h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span>Min: ₹{(() => {
                if (portfolioDetails?.minInvestment) {
                  return portfolioDetails.minInvestment.toLocaleString()
                }
                return typeof portfolio.minInvestment === 'number' ? portfolio.minInvestment.toLocaleString() : '10,000'
              })()}</span>
              <span>•</span>
              <span>{(() => {
                if (portfolioDetails?.durationMonths) {
                  return `${portfolioDetails.durationMonths} months`
                }
                return typeof portfolio.durationMonths === 'number' ? `${portfolio.durationMonths} months` : '12 months'
              })()}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDetailsClick}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Details
          </Button>
        </div>

        {/* Performance Metrics - Horizontal Layout */}
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Monthly Gains</div>
            <div className={`text-lg font-bold ${isLocked ? 'blur-sm select-none' : ''} ${
              isLocked ? 'text-green-600' : 
              (portfolioDetails?.monthlyGains !== undefined ? 
                (portfolioDetails.monthlyGains >= 0 ? 'text-green-600' : 'text-red-600') :
                'text-green-600'
              )
            }`}>
              {isLocked ? fakeData.monthlyGains : performanceData.monthlyGains}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">1 Year Gains</div>
            <div className={`text-lg font-bold ${isLocked ? 'blur-sm select-none' : ''} ${
              isLocked ? 'text-green-600' : 
              (portfolioDetails?.oneYearGains !== undefined ? 
                (portfolioDetails.oneYearGains >= 0 ? 'text-green-600' : 'text-red-600') :
                'text-green-600'
              )
            }`}>
              {isLocked ? fakeData.oneYearGains : performanceData.oneYearGains}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">CAGR Since Inception</div>
            <div className={`text-lg font-bold ${isLocked ? 'blur-sm select-none' : ''} ${
              isLocked ? 'text-green-600' : 
              (portfolioDetails?.CAGRSinceInception !== undefined ? 
                (portfolioDetails.CAGRSinceInception >= 0 ? 'text-green-600' : 'text-red-600') :
                'text-green-600'
              )
            }`}>
              {isLocked ? fakeData.cagr : performanceData.cagr}
            </div>
          </div>
        </div>

        {/* Lock Message or Action Button */}
        {isLocked ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-2 rounded-full border border-yellow-200 animate-pulse">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-2 shadow-lg transition-transform hover:scale-110">
                <Lock className="h-5 w-5 text-[#FFFFF0] animate-[wiggle_1s_ease-in-out_infinite]" />
              </div>
              <span className="font-medium">
                {!isAuthenticated 
                  ? "Login to view details" 
                  : subscriptionAccess?.hasBasic 
                    ? "Premium access required"
                    : "Subscription required"
                }
              </span>
            </div>
            <Button
              onClick={handleSubscribeClick}
              className={`px-6 py-2 text-sm font-medium ${buttonConfig.className} flex-shrink-0`}
            >
              {buttonConfig.text}
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              onClick={handleSubscribeClick}
              className={`px-6 py-2 text-sm font-medium ${buttonConfig.className}`}
            >
              {buttonConfig.text}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 