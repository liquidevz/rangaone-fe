"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { SectionHeading } from "@/components/ui/section-heading"

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
      question: "How often is the portfolio rebalanced?",
      answer:
        "Model portfolios are rebalanced monthly or when market conditions significantly change. Our team continuously monitors market trends to ensure optimal portfolio performance.",
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
  ],
  premium: [
    {
      question: "How often is the portfolio rebalanced?",
      answer:
        "Premium portfolios are rebalanced as needed based on market conditions and our proprietary algorithms. This dynamic approach ensures your portfolio remains optimized at all times.",
    },
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
  ],
}

export default function FAQContactSection() {
  const [activeCategory, setActiveCategory] = useState("basic")
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [formData, setFormData] = useState({
    name: "",
    represent: "BASIC",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRepresentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, represent: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          name: "",
          represent: "BASIC",
          message: "",
        })
      }, 3000)
    }, 1000)
  }

  return (
    <section className="py-16 bg-white" id="faq-contact">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div>
            <SectionHeading title="FAQs" subtitle="Let's answer some questions" align="left" />

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => {
                  setActiveCategory("basic")
                  setOpenIndex(0)
                }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md border ${
                  activeCategory === "basic"
                    ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
                    ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
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
                    ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
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

          {/* Contact Form */}
          <div className="bg-[#0f1d59] text-white rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Contact us</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <p className="text-lg mb-4">Hi 👋 My name is...</p>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name..."
                  className="w-full bg-[#1a2a6c] border border-[#2a3a7c] rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <p className="text-lg mb-4">and I represent</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRepresentChange("BASIC")}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      formData.represent === "BASIC"
                        ? "bg-white text-[#0f1d59]"
                        : "bg-[#1a2a6c] text-white hover:bg-[#2a3a7c]"
                    }`}
                  >
                    BASIC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRepresentChange("PREMIUM")}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      formData.represent === "PREMIUM"
                        ? "bg-white text-[#0f1d59]"
                        : "bg-[#1a2a6c] text-white hover:bg-[#2a3a7c]"
                    }`}
                  >
                    PREMIUM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRepresentChange("MODEL PORTFOLIO")}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      formData.represent === "MODEL PORTFOLIO"
                        ? "bg-white text-[#0f1d59]"
                        : "bg-[#1a2a6c] text-white hover:bg-[#2a3a7c]"
                    }`}
                  >
                    MODEL PORTFOLIO
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg mb-4">I'd love to ask about...</p>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your question..."
                  rows={4}
                  className="w-full bg-[#1a2a6c] border border-[#2a3a7c] rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="w-full bg-white text-[#0f1d59] py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                {isSubmitting ? "Submitting..." : isSubmitted ? "Submitted!" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
