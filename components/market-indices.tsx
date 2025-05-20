"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { useState } from "react"
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
  const [activeIndex, setActiveIndex] = useState("Sensex")

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-200">
        <div className="w-1/4 border-r border-gray-200">
          <div className="p-3 bg-blue-50">
            <h3 className="font-semibold text-navy-blue">Market Indices</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {indices.map((index) => (
              <button
                key={index.name}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors",
                  activeIndex === index.name && "bg-blue-50 font-semibold",
                )}
                onClick={() => setActiveIndex(index.name)}
              >
                {index.name}
              </button>
            ))}
          </div>
        </div>
        <div className="w-3/4 flex">
          {indices.map((index) => (
            <div
              key={index.name}
              className="flex-1 flex items-center justify-center border-r border-gray-200 last:border-r-0 p-4"
            >
              <div className="text-center">
                <div className="text-lg font-bold">{index.value}</div>
                <div
                  className={cn(
                    "flex items-center justify-center text-sm",
                    index.isNegative ? "text-red-500" : "text-green-500",
                  )}
                >
                  {index.isNegative ? <ArrowDown className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
                  <span>
                    {index.change} {index.changePercent}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
