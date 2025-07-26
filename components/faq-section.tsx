"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

type FAQItem = {
  question: string
  answer: string
}

const faqsByCategory = {
  basic: [
    {
      question: "How often is the portfolio rebalanced?",
      answer:
        "Our Basic plan portfolios are rebalanced quarterly to ensure optimal asset allocation and performance. You'll receive notifications before any rebalancing occurs.",
    },
    {
      question: "What is the minimum investment amount?",
      answer:
        "The minimum investment for our Basic plan is ₹10,000. This allows us to create a properly diversified portfolio while keeping it accessible to most investors.",
    },
    {
      question: "How do I receive stock recommendations?",
      answer:
        "Stock recommendations are delivered directly to your dashboard and via email. For time-sensitive recommendations, you'll also receive mobile notifications if enabled.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. For monthly plans, you'll maintain access until the end of your billing cycle. For annual plans, you can request a prorated refund.",
    },
    {
      question: "Do you provide tax-related advice?",
      answer:
        "The Basic plan does not include personalized tax advice. We provide general tax-efficiency strategies, but recommend consulting with a tax professional for specific guidance.",
    },
  ],
  modelPortfolio: [
    {
      question: "How are model portfolios constructed?",
      answer:
        "Our model portfolios are constructed using a combination of fundamental analysis, quantitative models, and macroeconomic factors. Each portfolio is designed to meet specific risk-return objectives.",
    },
    {
      question: "Can I customize the model portfolios?",
      answer:
        "Yes, our platform allows for some customization of model portfolios. You can exclude certain stocks or sectors based on your preferences or existing holdings.",
    },
    {
      question: "How is performance calculated?",
      answer:
        "Portfolio performance is calculated using time-weighted return methodology, which is the industry standard. This accounts for cash flows in and out of the portfolio.",
    },
    {
      question: "What is the historical performance?",
      answer:
        "Historical performance varies by portfolio, but our model portfolios have averaged 12-15% annual returns over the past 5 years. Detailed performance metrics are available on each portfolio page.",
    },
    {
      question: "How many stocks are in each model portfolio?",
      answer:
        "Each model portfolio typically contains 15-25 stocks, carefully selected to provide optimal diversification while maintaining focus on high-conviction ideas.",
    },
  ],
  premium: [
    {
      question: "What additional benefits do Premium members receive?",
      answer:
        "Premium members receive priority customer support, access to exclusive webinars, one-on-one consultation calls, advanced portfolio analytics, and early access to new features and investment opportunities.",
    },
    {
      question: "How often do I get one-on-one consultations?",
      answer:
        "Premium members receive quarterly scheduled consultations with our investment advisors. Additional consultations can be booked as needed for specific investment questions.",
    },
    {
      question: "Are IPO recommendations guaranteed allocations?",
      answer:
        "No, our IPO recommendations provide analysis and guidance, but allocations depend on your broker and market conditions. We do provide strategies to improve your chances of allocation.",
    },
    {
      question: "How detailed are the research reports?",
      answer:
        "Premium research reports include comprehensive company analysis, financial metrics, risk assessments, valuation models, growth projections, and specific entry/exit strategies.",
    },
    {
      question: "Can I share my Premium account with family members?",
      answer:
        "Yes, Premium accounts can be shared with up to 3 family members. Each member will have their own login but access the same premium features and content.",
    },
  ],
}

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState("basic")
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 bg-[#fefcea]" id="faq">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-left mb-8">
            <p className="text-sm text-gray-600 mb-2">Let's answer some questions</p>
            <h2 className="text-3xl font-bold text-gray-900">FAQs</h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => {
                setActiveCategory("basic")
                setOpenIndex(0)
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md border ${
                activeCategory === "basic"
                  ? "bg-[#1e3a8a] text-[#FFFFF0] border-[#1e3a8a]"
                  : "bg-[#fefcea] text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => {
                setActiveCategory("modelPortfolio")
                setOpenIndex(0)
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md border ${
                activeCategory === "modelPortfolio"
                  ? "bg-[#1e3a8a] text-[#FFFFF0] border-[#1e3a8a]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Model Portfolio
            </button>
            <button
              onClick={() => {
                setActiveCategory("premium")
                setOpenIndex(0)
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md border ${
                activeCategory === "premium"
                  ? "bg-[#1e3a8a] text-[#FFFFF0] border-[#1e3a8a]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Premium
            </button>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqsByCategory[activeCategory as keyof typeof faqsByCategory].map((faq, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg overflow-hidden transition-all duration-200"
              >
                <button
                  className="flex justify-between items-center w-full px-4 py-3 text-left bg-white hover:bg-gray-50"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      openIndex === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`px-4 overflow-hidden transition-all duration-200 ${
                    openIndex === index ? "max-h-40 py-3" : "max-h-0"
                  }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
