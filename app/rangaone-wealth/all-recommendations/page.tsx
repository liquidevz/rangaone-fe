"use client"

import { useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowUp, ArrowDown, TrendingUp, Search } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for recommendations
const allRecommendations = [
  // Premium Long Term
  {
    symbol: "AXISBANK",
    name: "AXIS BANK",
    exchange: "NSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 39,
    timeHorizon: "Long Term",
    category: "Premium",
    status: "Target Reduced",
  },
  {
    symbol: "AXISBANK2",
    name: "AXIS BANK",
    exchange: "NSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 39,
    timeHorizon: "Long Term",
    category: "Premium",
  },
  {
    symbol: "AXISBANK3",
    name: "AXIS BANK",
    exchange: "NSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 39,
    timeHorizon: "Long Term",
    category: "Premium",
    status: "Target Upgraded",
  },

  // Basic Short Term
  {
    symbol: "IDFCFIRSTB",
    name: "IDFC FIRST B",
    exchange: "BSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 18,
    timeHorizon: "Short Term",
    category: "Basic",
  },
  {
    symbol: "IDFCFIRSTB2",
    name: "IDFC FIRST B",
    exchange: "BSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 18,
    timeHorizon: "Short Term",
    category: "Basic",
  },
  {
    symbol: "IDFCFIRSTB3",
    name: "IDFC FIRST B",
    exchange: "BSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 18,
    timeHorizon: "Short Term",
    category: "Basic",
  },

  // Social Media Short Term
  {
    symbol: "TATAMOTORS",
    name: "IDFC FIRST B",
    exchange: "BSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 18,
    timeHorizon: "Short Term",
    category: "Social Media",
  },
  {
    symbol: "TATAMOTORS2",
    name: "IDFC FIRST B",
    exchange: "BSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 18,
    timeHorizon: "Short Term",
    category: "Social Media",
  },
  {
    symbol: "TATAMOTORS3",
    name: "IDFC FIRST B",
    exchange: "BSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 18,
    timeHorizon: "Short Term",
    category: "Social Media",
  },
]

export default function AllRecommendations() {
  const [activeTab, setActiveTab] = useState("long-term")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    date: false,
    premium: false,
    basic: false,
    liveCalls: true,
    closedCalls: false,
  })

  const handleFilterChange = (filter: string) => {
    setFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }))
  }

  const filteredRecommendations = allRecommendations.filter((stock) => {
    // Filter by search query
    if (searchQuery && !stock.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by tab
    if (activeTab === "long-term" && stock.timeHorizon !== "Long Term") return false
    if (activeTab === "short-term" && stock.timeHorizon !== "Short Term") return false
    if (activeTab === "swing" && stock.timeHorizon !== "Swing") return false

    // Filter by category
    if (filters.premium && stock.category !== "Premium") return false
    if (filters.basic && stock.category !== "Basic") return false

    return true
  })

  const longTermCount = allRecommendations.filter((s) => s.timeHorizon === "Long Term").length
  const shortTermCount = allRecommendations.filter((s) => s.timeHorizon === "Short Term").length
  const swingCount = allRecommendations.filter((s) => s.timeHorizon === "Swing").length

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-6">
        <div className="bg-indigo-900 text-[#FFFFF0] py-6 px-8 rounded-lg shadow-md mb-6">
          <h1 className="text-4xl font-bold text-center">RANGAONE WEALTH</h1>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold uppercase">EXPERT RECOMMENDATIONS</h2>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Button asChild variant="ghost" className="self-start">
            <Link href="/rangaone-wealth" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Enter Stock Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-0 top-0 h-full bg-indigo-900 hover:bg-indigo-800 rounded-l-none">
                Search
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="live-calls"
                checked={filters.liveCalls}
                onChange={() => handleFilterChange("liveCalls")}
                className="h-4 w-4"
              />
              <label htmlFor="live-calls" className="text-sm">
                Live Calls
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="closed-calls"
                checked={filters.closedCalls}
                onChange={() => handleFilterChange("closedCalls")}
                className="h-4 w-4"
              />
              <label htmlFor="closed-calls" className="text-sm">
                Closed Calls
              </label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm font-medium mb-2">Filter by:</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.date ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("date")}
              className={filters.date ? "bg-indigo-900 hover:bg-indigo-800" : ""}
            >
              Date
            </Button>
            <Button
              variant={filters.premium ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("premium")}
              className={filters.premium ? "bg-indigo-900 hover:bg-indigo-800" : ""}
            >
              Premium
            </Button>
            <Button
              variant={filters.basic ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("basic")}
              className={filters.basic ? "bg-indigo-900 hover:bg-indigo-800" : ""}
            >
              Basic
            </Button>
          </div>
        </div>

        <Tabs defaultValue="long-term" onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="w-full flex justify-start bg-transparent p-0 h-auto">
              <TabsTrigger
                value="long-term"
                className={cn(
                  "py-3 px-6 border-b-2 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                  activeTab === "long-term" ? "border-indigo-900 text-indigo-900 font-bold" : "border-transparent",
                )}
              >
                Long Term ({longTermCount})
              </TabsTrigger>
              <TabsTrigger
                value="short-term"
                className={cn(
                  "py-3 px-6 border-b-2 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                  activeTab === "short-term" ? "border-indigo-900 text-indigo-900 font-bold" : "border-transparent",
                )}
              >
                Short Term ({shortTermCount})
              </TabsTrigger>
              <TabsTrigger
                value="swing"
                className={cn(
                  "py-3 px-6 border-b-2 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                  activeTab === "swing" ? "border-indigo-900 text-indigo-900 font-bold" : "border-transparent",
                )}
              >
                Swing ({swingCount})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="long-term" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="short-term" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="swing" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-2">
            <Button className="bg-indigo-900 hover:bg-indigo-800 h-8 w-8 p-0 rounded-full">1</Button>
            {[2, 3, 4, 5].map((page) => (
              <Button key={page} variant="outline" className="h-8 w-8 p-0 rounded-full">
                {page}
              </Button>
            ))}
            <span className="mx-2">. . .</span>
            <Button variant="outline" className="h-8 w-8 p-0 rounded-full">
              10
            </Button>
          </nav>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StockCard({ stock }) {
  const isPositive = stock.change >= 0

  const getCategoryColor = (category) => {
    switch (category) {
      case "Premium":
        return "bg-yellow-400 text-black font-semibold"
      case "Basic":
        return "bg-blue-500 text-[#FFFFF0] font-semibold"
      case "Social Media":
        return "bg-pink-500 text-[#FFFFF0] font-semibold"
      default:
        return "bg-gray-500 text-[#FFFFF0] font-semibold"
    }
  }

  const getCardBorderColor = (category) => {
    switch (category) {
      case "Premium":
        return "border-yellow-300"
      case "Basic":
        return "border-blue-300"
      case "Social Media":
        return "border-pink-300"
      default:
        return "border-gray-200"
    }
  }

  const getStatusBadge = (status) => {
    if (!status) return null

    switch (status) {
      case "Target Reduced":
        return <Badge className="bg-gray-200 text-gray-800 absolute bottom-3 left-3">Target Reduced</Badge>
      case "Target Upgraded":
        return <Badge className="bg-green-100 text-green-800 absolute bottom-3 left-3">Target Upgraded</Badge>
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2",
        getCardBorderColor(stock.category),
      )}
    >
      <div className="p-4 bg-white">
        <div className="mb-2">
          <span className={cn("px-4 py-1 rounded-full text-sm", getCategoryColor(stock.category))}>
            {stock.category}
          </span>
        </div>

        <h3 className="font-bold text-xl text-gray-900 truncate mb-1">{stock.name}</h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-500">{stock.exchange}</span>
          <div className="flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
            <span>Horizon - {stock.timeHorizon}</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold text-gray-900">₹{stock.price.toFixed(2)}</div>
            <div className={cn("flex items-center text-sm", isPositive ? "text-green-600" : "text-red-600")}>
              {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              <span>
                ₹{Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="bg-white border border-green-200 rounded-lg p-2 text-center shadow-sm">
            <div className="text-xs text-gray-600 mb-1">Target</div>
            <div className="flex items-center justify-center text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span className="font-bold">{stock.target}%</span>
            </div>
            <div className="text-xs text-gray-500">upto</div>
          </div>
        </div>

        {getStatusBadge(stock.status)}
      </div>
    </div>
  )
}
