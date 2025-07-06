"use client"

import { Book } from "lucide-react"
import { cn } from "@/lib/utils"

interface PortfolioCardProps {
  title: string
  description: string
  monthlyPrice: number
  billingPeriod: string
  billingFrequency: string
  cagr?: string | number
  returns?: string | number
  minInvestment: number
  className?: string
  onBuyNow?: () => void
  onAddToCart?: () => void
}

export default function PortfolioCard({
  title,
  description,
  monthlyPrice,
  billingPeriod,
  billingFrequency,
  cagr = "N/A",
  returns = "N/A",
  minInvestment,
  className,
  onBuyNow,
  onAddToCart,
}: PortfolioCardProps) {
  return (
    <div
      className={cn(
        "bg-emerald-400 rounded-3xl p-6 text-black flex flex-col justify-between min-h-[500px]",
        className
      )}
    >
      <div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm opacity-80 max-w-[60%]">{description}</p>
          <div className="text-right">
            <p className="text-2xl font-bold">₹{monthlyPrice}</p>
            <p className="text-sm">/ mo</p>
            <p className="text-xs opacity-80">
              {billingPeriod},<br />
              Billed {billingFrequency}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Book className="h-5 w-5" />
          <span className="text-sm font-medium">Methodology</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3">
            <p className="text-sm opacity-70">CAGR</p>
            <p className="text-lg font-semibold">{cagr}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3">
            <p className="text-sm opacity-70">1Y Returns</p>
            <p className="text-lg font-semibold">{returns}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 col-span-2">
            <p className="text-sm opacity-70">Min. Investment</p>
            <p className="text-lg font-semibold">₹{minInvestment.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <button
          onClick={onBuyNow}
          className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Buy Now
        </button>
        <button
          onClick={onAddToCart}
          className="w-full bg-black/10 text-black font-medium py-3 rounded-xl hover:bg-black/20 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
} 