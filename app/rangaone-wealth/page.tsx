"use client"

import { useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, TrendingUp, ArrowUp, ArrowDown, Clock, ChevronRight, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for open recommendations
const openRecommendations = [
  {
    symbol: "IDFCFIRSTB",
    name: "IDFC FIRST BANK",
    exchange: "BSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 18,
    timeHorizon: "Short Term",
    buyRange: { min: 101, max: 103 },
    targetPrice: { min: 113, max: 126 },
    addMoreAt: { min: 90, max: 92 },
    recommendedDate: "19 March 2025",
    ltp: { price: 105.41, change: -2.22, changePercent: 2.06 },
    whyBuy: [
      "Technically trading at a Discounted price (39%).",
      "Low Price to Equity ratio of 15.9 (Very Attractive).",
      "Showing Good Sales & Profit growth of 48% & 27% respectively.",
      "DIIs have increased their stake from 9% to 14%.",
      "The company is expanding their assisted business through different channels and products and entering into wealth management.",
    ],
    category: "Basic",
  },
  {
    symbol: "AXISBANK",
    name: "AXIS BANK",
    exchange: "NSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 39,
    timeHorizon: "Long Term",
    buyRange: { min: 980, max: 1010 },
    targetPrice: { min: 1200, max: 1250 },
    addMoreAt: { min: 950, max: 970 },
    recommendedDate: "15 March 2025",
    ltp: { price: 1050.75, change: 12.35, changePercent: 1.19 },
    whyBuy: [
      "Strong digital banking initiatives driving growth.",
      "Improving asset quality with reducing NPAs.",
      "Expanding retail loan book with focus on high-yield segments.",
      "Consistent dividend payouts with potential for increase.",
      "Strategic partnerships in fintech space enhancing market reach.",
    ],
    category: "Premium",
  },
  {
    symbol: "TATAMOTORS",
    name: "TATA MOTORS LIMITED",
    exchange: "BSE",
    price: 1108.2,
    change: 10.4,
    changePercent: 0.95,
    target: 18,
    timeHorizon: "Short Term",
    buyRange: { min: 1050, max: 1080 },
    targetPrice: { min: 1200, max: 1250 },
    addMoreAt: { min: 1000, max: 1030 },
    recommendedDate: "10 March 2025",
    ltp: { price: 1095.6, change: 15.8, changePercent: 1.46 },
    whyBuy: [
      "Strong recovery in JLR sales globally.",
      "EV transition strategy showing positive results.",
      "Market share gains in domestic commercial vehicle segment.",
      "Debt reduction plan on track with improving cash flows.",
      "New product launches receiving positive market response.",
    ],
    category: "Social Media",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC BANK",
    exchange: "NSE",
    price: 1567.8,
    change: 23.5,
    changePercent: 1.52,
    target: 25,
    timeHorizon: "Medium Term",
    category: "Premium",
  },
]

// Mock data for closed recommendations
const closedRecommendations = [
  {
    symbol: "WIPRO",
    name: "WIPRO LIMITED",
    exchange: "NSE",
    price: 452.75,
    change: 5.25,
    changePercent: 1.17,
    target: 15,
    timeHorizon: "Short Term",
    closed: true,
    returnPercentage: 12.5,
    category: "Closed",
  },
  {
    symbol: "SUNPHARMA",
    name: "SUN PHARMACEUTICAL",
    exchange: "BSE",
    price: 1245.6,
    change: -8.4,
    changePercent: -0.67,
    target: 22,
    timeHorizon: "Medium Term",
    closed: true,
    returnPercentage: 18.3,
    category: "Closed",
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI BANK",
    exchange: "NSE",
    price: 978.35,
    change: 12.65,
    changePercent: 1.31,
    target: 25,
    timeHorizon: "Long Term",
    closed: true,
    returnPercentage: 21.7,
    category: "Closed",
  },
  {
    symbol: "MARUTI",
    name: "MARUTI SUZUKI INDIA",
    exchange: "BSE",
    price: 10542.8,
    change: 156.2,
    changePercent: 1.5,
    target: 30,
    timeHorizon: "Medium Term",
    closed: true,
    returnPercentage: 27.8,
    category: "Closed",
  },
]

export default function RangaoneWealth() {
  const [activeTab, setActiveTab] = useState("open")
  const [selectedStock, setSelectedStock] = useState(openRecommendations[0])

  const handleStockSelect = (stock) => {
    setSelectedStock(stock)
  }

  return (
    <DashboardLayout userId="1">
      <div className="flex flex-col w-full gap-4 md:gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rangaone Wealth</h1>
            <div className="w-20 h-1 bg-primary rounded-full mt-2"></div>
            <p className="text-gray-600 mt-2">Expert stock recommendations and portfolio management</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 self-start md:self-auto">Subscribe Now</Button>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/rangaone-wealth/open-recommendations" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium">Open Recommendations</h3>
                <p className="text-sm text-gray-500 mt-1">View all active stock recommendations</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/rangaone-wealth/closed-recommendations" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="bg-blue-100 p-3 rounded-full mb-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium">Closed Recommendations</h3>
                <p className="text-sm text-gray-500 mt-1">View past stock recommendations</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/rangaone-wealth/all-recommendations" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="bg-purple-100 p-3 rounded-full mb-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium">All Recommendations</h3>
                <p className="text-sm text-gray-500 mt-1">Complete list of all recommendations</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/rangaone-wealth/model-portfolios" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="bg-amber-100 p-3 rounded-full mb-3">
                  <Briefcase className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-medium">Model Portfolios</h3>
                <p className="text-sm text-gray-500 mt-1">Explore our curated investment portfolios</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader className="bg-blue-50 flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6">
            <CardTitle className="text-xl md:text-2xl font-bold text-navy-blue mb-3 md:mb-0">
              Our Recommendations
            </CardTitle>
            <Button
              asChild
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 group w-full md:w-auto"
            >
              <Link href="/rangaone-wealth/all-recommendations" className="flex items-center justify-center">
                View All Recommendations
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="open" onValueChange={setActiveTab}>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <TabsList className="mb-6 inline-flex rounded-full overflow-hidden bg-gray-100 p-1 w-full md:w-auto">
                  <TabsTrigger
                    value="open"
                    className="rounded-full px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-colors text-sm md:text-base font-medium flex-1 md:flex-none"
                  >
                    Open Recommendations
                  </TabsTrigger>
                  <TabsTrigger
                    value="closed"
                    className="rounded-full px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-colors text-sm md:text-base font-medium flex-1 md:flex-none"
                  >
                    Closed Recommendations
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="open">
                <div className="mb-6">
                  <StockCarousel
                    stocks={openRecommendations}
                    onSelectStock={handleStockSelect}
                    selectedStock={selectedStock}
                  />
                </div>

                {/* Recommendation Details */}
                {selectedStock && selectedStock.buyRange && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <Card className="overflow-hidden border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="bg-indigo-900 text-white py-4 px-6 font-semibold rounded-t-sm flex items-center justify-center">
                          <span className="text-xl">Recommendation Details</span>
                        </div>
                        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8">
                            <div className="flex flex-col">
                              <div className="flex items-center mb-2">
                                <p className="text-gray-600 text-sm font-medium">Buy Range</p>
                              </div>
                              <p className="text-green-600 font-bold text-lg">
                                {selectedStock.buyRange.min} - {selectedStock.buyRange.max}
                              </p>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center mb-2">
                                <p className="text-gray-600 text-sm font-medium">Target Price</p>
                              </div>
                              <p className="text-green-600 font-bold text-lg">
                                {selectedStock.targetPrice?.min} - {selectedStock.targetPrice?.max}
                              </p>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center mb-2">
                                <p className="text-gray-600 text-sm font-medium">Add more at</p>
                              </div>
                              <p className="text-green-600 font-bold text-lg">
                                {selectedStock.addMoreAt?.min} - {selectedStock.addMoreAt?.max}
                              </p>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center mb-2">
                                <p className="text-gray-600 text-sm font-medium">Recommended Date</p>
                              </div>
                              <p className="text-green-600 font-bold text-lg">{selectedStock.recommendedDate}</p>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center mb-2">
                                <p className="text-gray-600 text-sm font-medium">Horizon</p>
                              </div>
                              <p className="text-green-600 font-bold text-lg">{selectedStock.timeHorizon}</p>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center mb-2">
                                <p className="text-gray-600 text-sm font-medium">LTP</p>
                              </div>
                              <div className="flex items-center">
                                <span className="font-bold text-lg text-gray-900 mr-2">{selectedStock.ltp?.price}</span>
                                <span
                                  className={cn(
                                    "flex items-center text-sm font-medium",
                                    selectedStock.ltp?.change && selectedStock.ltp.change < 0
                                      ? "text-red-600"
                                      : "text-green-600",
                                  )}
                                >
                                  {selectedStock.ltp?.change}({selectedStock.ltp?.changePercent}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="bg-indigo-900 text-white py-4 px-6 font-semibold rounded-t-sm flex items-center justify-center">
                          <span className="text-xl">Why Buy This?</span>
                        </div>
                        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                          <ul className="space-y-3">
                            {selectedStock.whyBuy?.map((reason, index) => (
                              <li key={index} className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5 mr-3">
                                  <span className="text-indigo-700 text-xs font-bold">{index + 1}</span>
                                </div>
                                <p className="text-gray-800 leading-relaxed">{reason}</p>
                              </li>
                            ))}
                          </ul>
                          <div className="border-t border-gray-200 mt-6 pt-6 flex justify-center">
                            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-300 group">
                              <FileText className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                              View Detailed Report
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="closed">
                <div className="mb-6">
                  <StockCarousel
                    stocks={closedRecommendations}
                    closed={true}
                    onSelectStock={handleStockSelect}
                    selectedStock={selectedStock}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function StockCarousel({ stocks, closed = false, onSelectStock, selectedStock }) {
  if (stocks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No recommendations available</p>
      </div>
    )
  }

  // Only show the first 4 stocks
  const displayStocks = stocks.slice(0, 4)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {displayStocks.map((stock, index) => (
        <div key={index} className="flex justify-center">
          <div className="w-full">
            <StockCard
              stock={stock}
              closed={closed}
              onClick={() => onSelectStock && onSelectStock(stock)}
              isSelected={selectedStock?.symbol === stock.symbol}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function StockCard({ stock, closed = false, onClick, isSelected = false }) {
  const isPositive = stock.change >= 0

  const getCategoryColor = (category) => {
    switch (category) {
      case "Premium":
        return "bg-yellow-400 text-black font-semibold"
      case "Basic":
        return "bg-blue-500 text-white font-semibold"
      case "Social Media":
        return "bg-pink-500 text-white font-semibold"
      case "Closed":
        return "bg-green-500 text-white font-semibold"
      default:
        return "bg-gray-500 text-white font-semibold"
    }
  }

  const getHorizonColor = (horizon) => {
    switch (horizon) {
      case "Short Term":
        return "bg-blue-100 text-blue-800"
      case "Long Term":
        return "bg-amber-100 text-amber-800"
      case "Medium Term":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      case "Closed":
        return "border-green-300"
      default:
        return "border-gray-200"
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer w-full",
        isSelected && "ring-2 ring-primary ring-offset-2",
      )}
      onClick={onClick}
    >
      <div className={cn("border-2 rounded-lg overflow-hidden h-full", getCardBorderColor(stock.category))}>
        <div className="p-4 md:p-5 bg-white flex flex-col h-full">
          <div className="mb-3">
            <span className={cn("px-3 py-1 rounded-full text-sm inline-block", getCategoryColor(stock.category))}>
              {stock.category}
            </span>
          </div>

          <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2 truncate">{stock.name}</h3>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-500">{stock.exchange}</span>
            <div className={cn("flex items-center px-3 py-1 rounded-full text-sm", getHorizonColor(stock.timeHorizon))}>
              <Clock className="h-3 w-3 mr-1" />
              {stock.timeHorizon}
            </div>
          </div>

          <div className="mt-auto flex justify-between items-end">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">₹{stock.price.toFixed(2)}</div>
              <div className={cn("flex items-center text-sm", isPositive ? "text-green-600" : "text-red-600")}>
                {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                <span>
                  ₹{Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="border border-green-200 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-600 mb-1">Target</div>
              <div className="flex items-center justify-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="font-bold">{closed ? stock.returnPercentage : stock.target}%</span>
              </div>
              <div className="text-xs text-gray-500">upto</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
