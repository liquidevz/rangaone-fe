"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, X } from "lucide-react"
import Link from "next/link"
import { SectionHeading } from "@/components/ui/section-heading"

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState("basic")

  return (
    <section className="py-24 bg-white" id="pricing">
      <div className="container mx-auto px-4">
        <SectionHeading title="Choose Your Plan" subtitle="Select the perfect plan for your investment journey" />

        {/* Tab Selector */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 bg-gray-100 rounded-full shadow-sm">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "basic" ? "bg-[#1e3a8a] text-white" : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => setActiveTab("premium")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "premium"
                  ? "bg-[#ffc107] text-gray-900"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Premium
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {activeTab === "basic" ? (
            <>
              {/* Basic Yearly */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-xl overflow-hidden shadow-xl border border-gray-200"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Yearly</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-white">₹477</span>
                    <span className="text-lg text-white ml-2">/mo</span>
                  </div>
                  <p className="text-center text-white mb-6 text-sm">(Annual, Billed Monthly)</p>

                  <div className="border-t border-white/20 my-4"></div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-white mr-2.5 flex-shrink-0" />
                      <span className="text-white text-sm">Get 10-12 Quality Stocks</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-white mr-2.5 flex-shrink-0" />
                      <span className="text-white text-sm">Get 5 Short Term/Swing Trades</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-white mr-2.5 flex-shrink-0" />
                      <span className="text-white text-sm">Timely Alert For Entry & Exit</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-white mr-2.5 flex-shrink-0" />
                      <span className="text-white text-sm">Real Time Market Updates</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 bg-gray-800 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
                        <X className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="text-gray-300 text-sm">2 Model Portfolios</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 bg-gray-800 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
                        <X className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="text-gray-300 text-sm">IPO Recommendations</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 bg-gray-800 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
                        <X className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="text-gray-300 text-sm">Call Support</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 bg-gray-800 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
                        <X className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="text-gray-300 text-sm">Free Live Webinar</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full bg-white text-[#1e3a8a] font-medium py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                      BUY NOW
                    </button>
                    <Link
                      href="/basic-subscription"
                      className="block w-full text-center text-white text-sm hover:text-blue-300 transition-colors"
                    >
                      View Detailed Description
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Basic Monthly */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-xl overflow-hidden shadow-xl border border-gray-200"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Monthly</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-white">₹666</span>
                    <span className="text-lg text-white ml-2">/mo</span>
                  </div>
                  <p className="text-center text-white mb-6 text-sm">(Flexible, but higher cost)</p>

                  <div className="border-t border-white/20 my-4"></div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-white mr-2.5 flex-shrink-0" />
                      <span className="text-white text-sm">Get 10-12 Quality Stocks</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-white mr-2.5 flex-shrink-0" />
                      <span className="text-white text-sm">Get 5 Short Term/Swing Trades</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-white mr-2.5 flex-shrink-0" />
                      <span className="text-white text-sm">Timely Alert For Entry & Exit</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-white mr-2.5 flex-shrink-0" />
                      <span className="text-white text-sm">Real Time Market Updates</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 bg-gray-800 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
                        <X className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="text-gray-300 text-sm">2 Model Portfolios</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 bg-gray-800 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
                        <X className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="text-gray-300 text-sm">IPO Recommendations</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 bg-gray-800 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
                        <X className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="text-gray-300 text-sm">Call Support</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 bg-gray-800 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
                        <X className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="text-gray-300 text-sm">Free Live Webinar</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full bg-white text-[#1e3a8a] font-medium py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                      BUY NOW
                    </button>
                    <Link
                      href="/basic-subscription"
                      className="block w-full text-center text-white text-sm hover:text-blue-300 transition-colors"
                    >
                      View Detailed Description
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* Premium Yearly */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-[#ffc107] to-[#ffeb3b] rounded-xl overflow-hidden shadow-xl border border-gray-200"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Yearly</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-gray-900">₹1998</span>
                    <span className="text-lg text-gray-700 ml-2">/mo</span>
                  </div>
                  <p className="text-center text-gray-700 mb-6 text-sm">(Annual, Billed Monthly)</p>

                  <div className="border-t border-gray-800/20 my-4"></div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Get 20-25 High Growth Stocks</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Get 10 Short Term/Swing Trades</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Timely Alert For Entry & Exit</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Real Time Market Updates</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">2 Model Portfolios</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">IPO Recommendations</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Call Support</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Free Live Webinar</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full bg-gray-900 text-[#ffc107] font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm">
                      BUY NOW
                    </button>
                    <Link
                      href="/premium-subscription"
                      className="block w-full text-center text-gray-900 text-sm hover:text-gray-700 transition-colors"
                    >
                      View Detailed Description
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Premium Monthly */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-gradient-to-br from-[#ffc107] to-[#ffeb3b] rounded-xl overflow-hidden shadow-xl border border-gray-200"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Monthly</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-gray-900">₹2799</span>
                    <span className="text-lg text-gray-700 ml-2">/mo</span>
                  </div>
                  <p className="text-center text-gray-700 mb-6 text-sm">(Flexible, but higher cost)</p>

                  <div className="border-t border-gray-800/20 my-4"></div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Get 20-25 High Growth Stocks</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Get 10 Short Term/Swing Trades</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Timely Alert For Entry & Exit</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Real Time Market Updates</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">2 Model Portfolios</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">IPO Recommendations</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Call Support</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-900 mr-2.5 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">Free Live Webinar</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full bg-gray-900 text-[#ffc107] font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm">
                      BUY NOW
                    </button>
                    <Link
                      href="/premium-subscription"
                      className="block w-full text-center text-gray-900 text-sm hover:text-gray-700 transition-colors"
                    >
                      View Detailed Description
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Contact Us Card - Always visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`${
              activeTab === "basic"
                ? "bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6]"
                : "bg-gradient-to-br from-[#ffc107] to-[#ffeb3b]"
            } rounded-xl overflow-hidden shadow-xl border border-gray-200`}
          >
            <div className="p-6">
              <h3
                className={`text-xl font-bold mb-4 text-center ${
                  activeTab === "basic" ? "text-white" : "text-gray-900"
                }`}
              >
                Contact Us
              </h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className={`text-3xl font-bold ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}>
                  Need Help?
                </span>
              </div>
              <p className={`text-center mb-6 text-sm ${activeTab === "basic" ? "text-white" : "text-gray-700"}`}>
                For personalized investment advice
              </p>

              <div
                className={`border-t my-4 ${activeTab === "basic" ? "border-white/20" : "border-gray-800/20"}`}
              ></div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <CheckCircle
                    className={`h-5 w-5 mr-2.5 flex-shrink-0 ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}
                  />
                  <span className={`text-sm ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}>
                    Custom Investment Strategy
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle
                    className={`h-5 w-5 mr-2.5 flex-shrink-0 ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}
                  />
                  <span className={`text-sm ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}>
                    One-on-One Consultation
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle
                    className={`h-5 w-5 mr-2.5 flex-shrink-0 ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}
                  />
                  <span className={`text-sm ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}>
                    Portfolio Review
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle
                    className={`h-5 w-5 mr-2.5 flex-shrink-0 ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}
                  />
                  <span className={`text-sm ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}>
                    Risk Assessment
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle
                    className={`h-5 w-5 mr-2.5 flex-shrink-0 ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}
                  />
                  <span className={`text-sm ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}>
                    Wealth Management
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle
                    className={`h-5 w-5 mr-2.5 flex-shrink-0 ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}
                  />
                  <span className={`text-sm ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}>
                    Tax Planning Advice
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle
                    className={`h-5 w-5 mr-2.5 flex-shrink-0 ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}
                  />
                  <span className={`text-sm ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}>
                    Retirement Planning
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle
                    className={`h-5 w-5 mr-2.5 flex-shrink-0 ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}
                  />
                  <span className={`text-sm ${activeTab === "basic" ? "text-white" : "text-gray-900"}`}>
                    24/7 Priority Support
                  </span>
                </div>
              </div>

              <button
                className={`w-full font-medium py-2.5 rounded-lg transition-colors text-sm ${
                  activeTab === "basic"
                    ? "bg-white text-[#1e3a8a] hover:bg-gray-100"
                    : "bg-gray-900 text-[#ffc107] hover:bg-gray-800"
                }`}
              >
                CONTACT US
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
