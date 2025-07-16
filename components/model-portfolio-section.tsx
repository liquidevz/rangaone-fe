// components/model-portfolio-section.tsx
"use client";

import { useState, useEffect } from "react";
import { MotionConfig, motion } from "framer-motion";
import { FaYoutube } from "react-icons/fa";
import { FiBookOpen } from "react-icons/fi";
import { ShoppingCart, CreditCard, Check, Play, FileText } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { useCart } from "@/components/cart/cart-context";
import { userPortfolioService, UserPortfolio } from "@/services/user-portfolio.service";
import { CheckoutModal } from "@/components/checkout-modal";
import { SectionHeading } from "@/components/ui/section-heading";




type SubscriptionType = "monthly" | "quarterly" | "yearly";
// --- Constants ---
const portfolioColors = [
  "bg-[#0A9396]",
  "bg-[#EE9B00]",
  "bg-[#FFE627]",
  "bg-[#3187CE]",
  "bg-green-200",
  "bg-yellow-100",
  "bg-indigo-200",
  "bg-pink-200",
  "bg-teal-200",
  "bg-rose-200",
  "bg-cyan-200",
  "bg-amber-100",
]

const features = [
  {
    icon: "/placeholder.svg?width=32&height=32",
    title: "Simplicity",
    description:
      "Designed for busy professionals, our portfolios remove the hassle of stock analysis and simplify investing.",
  },
  {
    icon: "/placeholder.svg?width=32&height=32",
    title: "Rebalancing",
    description:
      "Every quarter, we adjust based on market conditions—guiding you on exits, profit booking, and averaging.",
  },
  {
    icon: "/placeholder.svg?width=32&height=32",
    title: "Diversification",
    description:
      "We spread your money smartly across large, mid, and small-cap stocks to balance risk and maximize opportunity.",
  },
  {
    icon: "/placeholder.svg?width=32&height=32",
    title: "Goal-Based Investing",
    description: "You choose the Goal, and the model portfolio provides an investment path that you can follow.",
  },
]

// --- Main Component ---
export default function ModelPortfolioSection() {
  const [portfolios, setPortfolios] = useState<UserPortfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        setLoading(true)
        const portfoliosData = await userPortfolioService.getAll()
        setPortfolios(portfoliosData)
      } catch (error) {
        console.error("Failed to load portfolios:", error)
        toast({
          title: "Error",
          description: "Failed to load portfolios. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadPortfolios()
  }, [toast])

  const handleBuyNow = async (portfolio: UserPortfolio) => {
    try {
      if (!isAuthenticated) {
        toast({
          title: "Login Required",
          description: "Please log in to add items to your cart.",
          variant: "destructive",
        })
        return
      }
      await addToCart(portfolio._id)
      toast({
        title: "Added to Cart",
        description: `${portfolio.name} has been added to your cart.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add portfolio to cart.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <section className="py-12 bg-white dark:bg-black">
        <div className="container mx-auto px-4 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading portfolios...</p>
        </div>
      </section>
    )
  }

  return (
    <div className="bg-[#fefcea] dark:bg-gray-900">
      {/* --- Features Section --- */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Model Portfolios</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Smart investment strategies for every investor
            </p>
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 relative border-t-4 border-blue-800 dark:border-blue-500 hover:shadow-xl transition-shadow duration-300 flex flex-col text-center"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 p-2 rounded-full border-2 border-blue-800 dark:border-blue-500 shadow-md">
                  <img
                    src={feature.icon || "/placeholder.svg"}
                    alt={feature.title}
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <h3 className="text-blue-900 dark:text-blue-300 font-bold text-lg mt-4 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Portfolio Cards Section --- */}
      <section className="bg-[#fefcea] dark:bg-gray-900 py-8 sm:py-12">
        <div className="mx-auto container px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {portfolios.map((portfolio, index) => {
            const isHovered = hoveredCard === portfolio._id
            const quarterlyFee = userPortfolioService.getPriceByType(portfolio.subscriptionFee, "quarterly")
            const monthlyFee = userPortfolioService.getPriceByType(portfolio.subscriptionFee, "monthly")
            const methodologyLink = userPortfolioService.getDescriptionByKey(
              portfolio.description,
              "methodology PDF link",
            )
            const homeDescription = userPortfolioService.getDescriptionByKey(portfolio.description, "home card")
            const colorClass = portfolioColors[index % portfolioColors.length]

            return (
              <motion.div
                key={portfolio._id}
                onHoverStart={() => setHoveredCard(portfolio._id)}
                onHoverEnd={() => setHoveredCard(null)}
                animate={isHovered ? "hovered" : "initial"}
                initial="initial"
                className="relative"
              >
                {/* Shadow Layers - these now have consistent borders and rounding */}
                <motion.div
                  variants={{
                    initial: { x: 0, y: 0, boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)" },
                    hovered: { x: 10, y: 10, boxShadow: "0 12px 32px 0 rgba(0,0,0,0.18)" },
                  }}
                  transition={{ type: "spring", stiffness: 180, damping: 18 }}
                  className={`absolute inset-0 ${colorClass} border-2 border-black dark:border-gray-700 rounded-xl pointer-events-none z-0`}
                />
                <motion.div
                  variants={{
                    initial: { x: 0, y: 0, boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)" },
                    hovered: { x: 5, y: 5, boxShadow: "0 8px 24px 0 rgba(0,0,0,0.12)" },
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`absolute inset-0 ${colorClass} border-2 border-black dark:border-gray-700 rounded-xl pointer-events-none z-[1]`}
                />

                {/* Main Card - with consistent borders and rounding */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`relative ${colorClass} border-2 border-black dark:border-gray-700 rounded-xl p-5 sm:p-6 flex flex-col h-full font-sans z-[2]`}
                >
                  <div className="flex-grow">
                    <h2 className="font-serif text-3xl lg:text-4xl font-bold text-black dark:text-white">
                      {portfolio.name}
                    </h2>
                    <p className="text-lg font-bold text-black dark:text-white mt-1">
                      ₹{(quarterlyFee || monthlyFee || 0).toLocaleString()} / Quarter
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-400">Annual, Billed Quarterly</p>

                    <p className="text-gray-800 dark:text-gray-300 my-4 text-base">{homeDescription}</p>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-blue-600 dark:text-blue-400 font-bold text-base">Methodology</h3>
                        <div className="flex items-center space-x-3 mt-2">
                          {methodologyLink && (
                            <a
                              href={methodologyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Read Methodology"
                            >
                              <div className="w-12 h-12 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <FileText className="w-6 h-6 text-black dark:text-white" />
                              </div>
                            </a>
                          )}
                          <a href="#" target="_blank" rel="noopener noreferrer" title="Watch Video">
                            <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                              <Play className="w-6 h-6 text-white dark:text-black" fill="currentColor" />
                            </div>
                          </a>
                        </div>
                      </div>

                      <div className="border-t border-gray-400 dark:border-gray-600 pt-4">
                        <h3 className="font-bold text-base text-black dark:text-white">Min. Investment</h3>
                        <div className="text-2xl font-bold text-black dark:text-white mt-1">
                          ₹{portfolio.minInvestment?.toLocaleString() || (monthlyFee * 12).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4">
                    <button
                      onClick={() => handleBuyNow(portfolio)}
                      className="w-full border-2 border-black dark:border-gray-500 bg-black dark:bg-white px-4 py-3 text-center font-bold text-white dark:text-black transition-all duration-300 ease-in-out rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 text-base flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
