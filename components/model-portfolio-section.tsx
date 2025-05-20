"use client"

import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

const portfolios = [
  {
    name: "SIP Portfolio",
    monthlyGains: "+13.78%",
    yearlyGains: "+2.86%",
    cagrSinceInception: "+19.78%",
    isLocked: false,
    hasSubscribeButton: false,
  },
  {
    name: "Multibagger Portfolio",
    monthlyGains: "+13.78%",
    yearlyGains: "+2.86%",
    cagrSinceInception: "+19.78%",
    isLocked: false,
    hasSubscribeButton: false,
  },
  {
    name: "Early Bird Investor Portfolio",
    monthlyGains: "---",
    yearlyGains: "---",
    cagrSinceInception: "---",
    isLocked: true,
    hasSubscribeButton: true,
  },
  {
    name: "Small Cap Portfolio",
    monthlyGains: "---",
    yearlyGains: "---",
    cagrSinceInception: "---",
    isLocked: true,
    hasSubscribeButton: true,
  },
  {
    name: "Large & Mid Cap Portfolio",
    monthlyGains: "---",
    yearlyGains: "---",
    cagrSinceInception: "---",
    isLocked: true,
    hasSubscribeButton: true,
  },
  {
    name: "Value Stocks Portfolio",
    monthlyGains: "---",
    yearlyGains: "---",
    cagrSinceInception: "---",
    isLocked: true,
    hasSubscribeButton: true,
  },
]

export default function ModelPortfolioSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Model Portfolio</h2>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-neutral-50">
          View All
        </Button>
      </div>

      <div className="divide-y divide-gray-200">
        {portfolios.map((portfolio, index) => (
          <div key={index} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{portfolio.name}</h3>
              {portfolio.hasSubscribeButton ? (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Subscribe now
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="border-gray-300 text-xs">
                  Details
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Monthly Gains</div>
                <div className={cn("font-semibold", portfolio.isLocked ? "text-gray-300" : "text-green-500")}>
                  {portfolio.isLocked ? (
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-md px-2 py-1">
                        <Lock className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    portfolio.monthlyGains
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">1 Year Gains</div>
                <div className={cn("font-semibold", portfolio.isLocked ? "text-gray-300" : "text-green-500")}>
                  {portfolio.isLocked ? (
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-md px-2 py-1">
                        <Lock className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    portfolio.yearlyGains
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">CAGR Since Inception</div>
                <div className={cn("font-semibold", portfolio.isLocked ? "text-gray-300" : "text-green-500")}>
                  {portfolio.isLocked ? (
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-md px-2 py-1">
                        <Lock className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    portfolio.cagrSinceInception
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
