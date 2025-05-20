"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const modelPortfolioRecommendations = [
  {
    id: 1,
    title: "Will Sona BLW's EV Strategy Pay Off Despite Global Challenges?",
    category: "Premium",
    stock: {
      name: "AXIS BANK",
      exchange: "NSE",
      horizon: "Long Term",
      price: "₹1108.20",
      change: "₹10.40(0.95%)",
      target: "39%",
    },
    categoryColor: "bg-yellow-400",
  },
  {
    id: 2,
    title: "Is HDFC Bank Poised for Growth After Recent Consolidation?",
    category: "Basic",
    stock: {
      name: "HDFC BANK",
      exchange: "BSE",
      horizon: "Medium Term",
      price: "₹1567.80",
      change: "₹23.50(1.52%)",
      target: "25%",
    },
    categoryColor: "bg-blue-500",
  },
]

const rangaoneWealthRecommendations = [
  {
    id: 1,
    title: "Will Sona BLW's EV Strategy Pay Off Despite Global Challenges?",
    category: "Basic",
    stock: {
      name: "IDFC FIRST B",
      exchange: "BSE",
      horizon: "Short Term",
      price: "₹108.20",
      change: "₹10.40(0.95%)",
      target: "18%",
    },
    categoryColor: "bg-blue-500",
  },
  {
    id: 2,
    title: "Tata Motors: Riding the EV Wave in India's Auto Sector",
    category: "Social Media",
    stock: {
      name: "TATA MOTORS",
      exchange: "NSE",
      horizon: "Long Term",
      price: "₹1095.60",
      change: "₹15.80(1.46%)",
      target: "22%",
    },
    categoryColor: "bg-pink-500",
  },
  {
    id: 3,
    title: "ICICI Bank: Strong Growth Potential in Retail Banking",
    category: "Premium",
    stock: {
      name: "ICICI BANK",
      exchange: "NSE",
      horizon: "Medium Term",
      price: "₹978.35",
      change: "₹12.65(1.31%)",
      target: "27%",
    },
    categoryColor: "bg-yellow-400",
  },
]

export default function ExpertRecommendations() {
  const [activeTab, setActiveTab] = useState("modelPortfolio")

  const recommendations = activeTab === "modelPortfolio" ? modelPortfolioRecommendations : rangaoneWealthRecommendations

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Expert Recommendations</h2>
        <Button asChild variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
          <Link href={activeTab === "modelPortfolio" ? "/rangaone-wealth/model-portfolios" : "/rangaone-wealth"}>
            View All
          </Link>
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              activeTab === "modelPortfolio"
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                : "border-blue-600 text-blue-600 hover:bg-blue-50",
            )}
            onClick={() => setActiveTab("modelPortfolio")}
          >
            Model Portfolio
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              activeTab === "rangaoneWealth"
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                : "border-blue-600 text-blue-600 hover:bg-blue-50",
            )}
            onClick={() => setActiveTab("rangaoneWealth")}
          >
            Rangaone Wealth
          </Button>
        </div>

        {recommendations.map((rec) => (
          <div key={rec.id} className="space-y-2">
            <h3 className="font-medium">{rec.title}</h3>
            <StockCard category={rec.category} stock={rec.stock} categoryColor={rec.categoryColor} />
            {rec.id < recommendations.length && <div className="border-t border-gray-200 my-4"></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function StockCard({
  category,
  stock,
  categoryColor,
}: {
  category: string
  stock: any
  categoryColor: string
}) {
  const getBorderColor = () => {
    switch (category) {
      case "Premium":
        return "border-yellow-400"
      case "Basic":
        return "border-blue-400"
      case "Social Media":
        return "border-pink-400"
      default:
        return "border-gray-200"
    }
  }

  return (
    <Card className={cn("border-2 overflow-hidden", getBorderColor())}>
      <CardContent className="p-0">
        <div className="flex">
          <div className="p-4 flex-1">
            <div className={cn("text-white font-medium px-3 py-1 rounded-md inline-block mb-2", categoryColor)}>
              {category}
            </div>

            {category === "Premium" && (
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gray-200 h-20 w-32 rounded flex items-center justify-center">
                  <Lock className="h-6 w-6 text-gray-500" />
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <div className="font-bold text-lg">{stock.name}</div>
              <div className="text-gray-600 text-sm">{stock.exchange}</div>
              <div className="text-gray-600 text-sm">Horizon - {stock.horizon}</div>
            </div>
          </div>

          <div className="p-4 flex flex-col items-end justify-between">
            <div>
              <div className="font-bold text-lg">{stock.price}</div>
              <div className="text-green-600 text-sm">{stock.change}</div>
            </div>

            <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-center mt-2">
              <div className="text-xs text-gray-600">Target</div>
              <div className="flex items-center justify-center text-green-600 font-bold">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stock.target}
              </div>
              <div className="text-xs text-gray-500">upto</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
