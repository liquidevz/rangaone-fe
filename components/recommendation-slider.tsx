"use client"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface RecommendationItem {
  id: string
  type: "RECOMMENDED" | "MODEL PORTFOLIO" | "WATCHLIST"
  name: string
  ticker: string
  price: number
  totalValue?: number
  returnPercentage: number
  sector?: string
}

interface RecommendationSliderProps {
  recommendations: RecommendationItem[]
  date?: string
}

export default function RecommendationSlider({ recommendations, date = "17 April 2023" }: RecommendationSliderProps) {
  const getCardColor = (type: string) => {
    switch (type) {
      case "RECOMMENDED":
        return "border-green-400 bg-gradient-to-r from-green-50 to-green-100"
      case "MODEL PORTFOLIO":
        return "border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100"
      case "WATCHLIST":
        return "border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100"
      default:
        return "border-gray-200"
    }
  }

  const getReturnBadgeColor = (percentage: number) => {
    if (percentage >= 5) return "bg-green-100 text-green-800"
    if (percentage >= 3) return "bg-blue-100 text-blue-800"
    if (percentage >= 0) return "bg-amber-100 text-amber-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="w-full mb-8">
      <div className="text-right mb-2 text-sm text-gray-600 font-medium">+1.04% Since Inception</div>
      <div className="flex flex-wrap gap-4 justify-center">
        {recommendations.map((item) => (
          <Card key={item.id} className={cn("border-2 overflow-hidden h-24 w-[280px]", getCardColor(item.type))}>
            <CardContent className="p-0">
              <div className="bg-gray-800 text-white text-xs font-medium py-1 px-2">{item.type}</div>
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">Ticker: {item.ticker}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">₹ {item.price.toFixed(2)}</div>
                    {item.totalValue && (
                      <div className="text-xs text-gray-500">₹ {item.totalValue.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "absolute top-1 right-1 rounded-full px-2 py-0.5 text-xs font-bold",
                  getReturnBadgeColor(item.returnPercentage),
                )}
              >
                {item.returnPercentage}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date Indicator */}
      <div className="flex justify-center mt-6">
        <div className="text-center">
          <div className="text-sm font-medium mb-2">{date}</div>
          <div className="flex items-center justify-center">
            <div className="h-1 w-40 bg-gray-300 flex items-center relative">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="h-3 w-0.5 bg-gray-800 absolute" style={{ left: `${i * 4}px` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
