"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const indices = [
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
]

export default function MarketIndices() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {indices.map((index) => (
        <Card key={index.name} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{index.name}</h3>
              <div className="text-2xl font-bold text-gray-900">{index.value}</div>
              <div
                className={cn(
                  "flex items-center text-sm font-medium",
                  index.isNegative ? "text-red-500" : "text-green-500",
                )}
              >
                {index.isNegative ? (
                  <ArrowDown className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowUp className="h-4 w-4 mr-1" />
                )}
                <span>
                  {index.change} {index.changePercent}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
