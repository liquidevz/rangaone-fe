"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const wealthPlans = [
  {
    id: 1,
    planName: "Basic",
    isPremium: false,
    href: "/basic-subscription",
    benefits: [
      { text: "Get 10-12 Quality Stocks", checked: true },
      { text: "Get 5 Short Term/Swing Trades", checked: true },
      { text: "Timely Alert For Entry & Exit", checked: true },
      { text: "Real Time Market Updates", checked: true },
      { text: "2 Model Portfolios", checked: false },
      { text: "IPO Recommendations", checked: false },
      { text: "Call Support", checked: false },
      { text: "Free Live Webinar", checked: false },
    ],
  },
  {
    id: 2,
    planName: "Premium",
    isPremium: true,
    href: "/premium-subscription",
    benefits: [
      { text: "Get 20-25 High Growth Stocks", checked: true },
      { text: "Get 10 Short Term/Swing Trades", checked: true },
      { text: "Timely Alert For Entry & Exit", checked: true },
      { text: "Real Time Market Updates", checked: true },
      { text: "2 Model Portfolios", checked: true },
      { text: "IPO Recommendations", checked: true },
      { text: "Call Support", checked: true },
      { text: "Free Live Webinar", checked: true },
    ],
  },
]

const CheckIcon = () => (
  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-green-500">
    <Check className="w-4 h-4 text-white" strokeWidth={3} />
  </div>
)

const CrossIcon = () => (
  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-red-500">
    <X className="w-4 h-4 text-white" strokeWidth={3} />
  </div>
)

const PremiumCheckIcon = () => (
  <div className="flex-shrink-0 w-7 h-7 relative">
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
      <defs>
        <linearGradient id="gold-gradient" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
      <path
        d="M14 0.5C17.5 0.5 18.5 2.5 21.5 3.5C24.5 4.5 26.5 5.5 27.5 8.5C28.5 11.5 27.5 13.5 27.5 14C27.5 14.5 28.5 16.5 27.5 19.5C26.5 22.5 24.5 23.5 21.5 24.5C18.5 25.5 17.5 27.5 14 27.5C10.5 27.5 9.5 25.5 6.5 24.5C3.5 23.5 1.5 22.5 0.5 19.5C-0.5 16.5 0.5 14.5 0.5 14C0.5 13.5 -0.5 11.5 0.5 8.5C1.5 5.5 3.5 4.5 6.5 3.5C9.5 2.5 10.5 0.5 14 0.5Z"
        fill="url(#gold-gradient)"
      />
      <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
)

export default function FeatureComparison() {
  return (
    <div className="w-full py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full mb-4"></div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Compare our Basic and Premium plans to find the perfect fit for your investment journey.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto">
          {wealthPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border flex flex-col min-h-[600px] sm:min-h-[650px] relative overflow-hidden ${
                plan.isPremium ? "bg-[#212121] border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              {/* Premium Badge */}
              {plan.isPremium && (
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs sm:text-sm font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                    POPULAR
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <h3 className={`text-2xl sm:text-3xl font-bold ${plan.isPremium ? "text-yellow-400" : "text-slate-900"}`}>
                  {plan.isPremium ? "✨ Premium ✨" : plan.planName}
                </h3>
              </div>

              {/* Benefits List */}
              <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4 flex-grow">
                {plan.benefits.map((benefit, benefitIndex) => (
                  <motion.div
                    key={benefitIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 + benefitIndex * 0.1 }}
                    className="flex items-center gap-3 sm:gap-4 relative group"
                  >
                    {/* Background Glow for Premium */}
                    {plan.isPremium && (
                      <div className="absolute -inset-x-2 sm:-inset-x-3 inset-y-[-4px] bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                    
                    {/* Icon */}
                    <div className="relative z-10 flex-shrink-0">
                      {plan.isPremium ? <PremiumCheckIcon /> : benefit.checked ? <CheckIcon /> : <CrossIcon />}
                    </div>
                    
                    {/* Text */}
                    <span
                      className={`relative z-10 text-sm sm:text-base font-medium flex-1 ${
                        plan.isPremium 
                          ? "text-yellow-300" 
                          : benefit.checked 
                            ? "text-gray-700" 
                            : "text-red-500"
                      }`}
                    >
                      {benefit.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4 mt-auto">
                {/* View Details Button */}
                <Link href={plan.href} passHref>
                  <Button
                    variant="outline"
                    className={`w-full py-4 sm:py-5 text-sm sm:text-lg font-bold rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                      plan.isPremium
                        ? "border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black bg-transparent"
                        : "border-[#0c2f6b] text-[#0c2f6b] hover:bg-[#0c2f6b] hover:text-white bg-white"
                    }`}
                  >
                    View Detailed Description
                  </Button>
                </Link>
                
                {/* Buy Now Button */}
                <Button
                  className={`w-full py-4 sm:py-5 text-sm sm:text-lg font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] ${
                    plan.isPremium
                      ? "bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black"
                      : "bg-gradient-to-b from-[#1e4ca1] to-[#0c2f6b] hover:from-[#2557b8] hover:to-[#0f3a82] text-white"
                  }`}
                >
                  BUY NOW
                </Button>
              </div>

              {/* Background Effects for Premium */}
              {plan.isPremium && (
                <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-5 rounded-full blur-2xl"></div>
                  
                  {/* Animated sparkles */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full opacity-60 animate-pulse"></div>
                  <div className="absolute top-12 right-8 w-1 h-1 bg-yellow-300 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-yellow-500 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 sm:mt-12 lg:mt-16"
        >
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Still have questions? We're here to help you choose the right plan.
          </p>
          <Link href="/contact-us">
            <Button 
              variant="outline" 
              className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            >
              Contact Support
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
} 