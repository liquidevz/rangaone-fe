"use client"

import { useState } from "react"
import { ChevronDown, PieChart, BarChart3, ShieldAlert } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SectionHeading } from "@/components/ui/section-heading"
import { cn } from "@/lib/utils"

type FAQCategory = {
  id: string
  label: string
  icon: JSX.Element
  questions: Array<{
    question: string
    answer: string
  }>
}

export default function EnhancedFAQSection() {
  const [activeCategory, setActiveCategory] = useState("investment-basics")
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const faqCategories: FAQCategory[] = [
    {
      id: "investment-basics",
      label: "Investment Basics",
      icon: <PieChart className="h-5 w-5" />,
      questions: [
        {
          question: "What is a stock portfolio?",
          answer:
            "A stock portfolio is a collection of stocks and other investments owned by an individual or entity. It represents your holdings across different companies, sectors, and asset classes, designed to help you achieve your financial goals while managing risk.",
        },
        {
          question: "How do I start building a stock portfolio?",
          answer:
            "To start building a stock portfolio, first define your investment goals and risk tolerance. Open a brokerage account, research potential investments, and begin with a diversified selection of stocks or ETFs. Consider starting with index funds if you're new to investing, and gradually expand your portfolio as you gain experience.",
        },
        {
          question: "What's the difference between stocks, bonds, and ETFs?",
          answer:
            "Stocks represent ownership in a company and offer potential growth and dividends. Bonds are debt securities that provide regular interest payments and return of principal at maturity. ETFs (Exchange-Traded Funds) are investment funds traded on stock exchanges that hold assets like stocks, bonds, or commodities, offering diversification in a single investment vehicle.",
        },
        {
          question: "How much money do I need to start investing?",
          answer:
            "You can start investing with as little as $1 with some modern brokerages that offer fractional shares. However, a good starting point might be $500-$1,000 to build a diversified portfolio using ETFs or index funds. The key is to begin investing regularly, regardless of the amount, and increase your contributions over time.",
        },
      ],
    },
    {
      id: "portfolio-management",
      label: "Portfolio Management",
      icon: <BarChart3 className="h-5 w-5" />,
      questions: [
        {
          question: "How often should I rebalance my portfolio?",
          answer:
            "Most financial advisors recommend rebalancing your portfolio at least once a year. However, you might consider rebalancing when your asset allocation drifts significantly (typically 5% or more) from your target allocation. Some investors also rebalance on a quarterly or semi-annual basis to maintain their desired risk level.",
        },
        {
          question: "What is dollar-cost averaging?",
          answer:
            "Dollar-cost averaging is an investment strategy where you invest a fixed amount of money at regular intervals, regardless of market conditions. This approach helps reduce the impact of market volatility on your overall purchase price and removes the emotional aspect of trying to time the market.",
        },
        {
          question: "How do I diversify my stock portfolio?",
          answer:
            "Diversify your portfolio by investing across different asset classes (stocks, bonds, cash), sectors (technology, healthcare, finance), company sizes (large, mid, small-cap), and geographic regions (domestic, international, emerging markets). Consider including 20-30 individual stocks across various industries or use ETFs and mutual funds to achieve instant diversification.",
        },
        {
          question: "Should I reinvest dividends?",
          answer:
            "Reinvesting dividends is generally recommended for long-term investors as it harnesses the power of compounding. By automatically purchasing additional shares with your dividend payments, you can significantly increase your returns over time. However, near retirement or if you need income, you might choose to take dividends as cash instead.",
        },
      ],
    },
    {
      id: "risk-returns",
      label: "Risk & Returns",
      icon: <ShieldAlert className="h-5 w-5" />,
      questions: [
        {
          question: "What is the risk-return tradeoff?",
          answer:
            "The risk-return tradeoff is the principle that potential return rises with an increase in risk. Low-risk investments like Treasury bonds typically offer lower returns, while higher-risk investments like stocks potentially offer higher returns. Understanding this relationship is crucial for building a portfolio aligned with your risk tolerance and financial goals.",
        },
        {
          question: "How can I measure the risk in my portfolio?",
          answer:
            "Common measures of portfolio risk include standard deviation (volatility), beta (market sensitivity), Sharpe ratio (risk-adjusted returns), and maximum drawdown (largest peak-to-trough decline). Modern portfolio tools and brokerage platforms often provide these metrics to help you assess your portfolio's risk profile.",
        },
        {
          question: "What's a realistic annual return expectation?",
          answer:
            "Historically, the S&P 500 has returned about 10% annually before inflation (7% after inflation). A diversified portfolio might expect 6-8% annual returns over the long term, depending on asset allocation. Conservative portfolios might target 4-5%, while more aggressive portfolios might aim for 8-10%. Remember that returns fluctuate year to year, and past performance doesn't guarantee future results.",
        },
        {
          question: "How do I protect my portfolio during market downturns?",
          answer:
            "To protect your portfolio during market downturns, maintain proper diversification across asset classes, consider defensive stocks or sectors, hold an appropriate cash reserve, and potentially use hedging strategies like stop-loss orders or options. Most importantly, maintain a long-term perspective and avoid panic selling, as markets historically recover over time.",
        },
      ],
    },
  ]

  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const activeQuestions = faqCategories.find((cat) => cat.id === activeCategory)?.questions || []

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50" id="faq">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle="Get answers to common questions about investing"
          className="mb-12"
        />

        <div className="max-w-4xl mx-auto">
          {/* Category Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id)
                  setExpandedIndex(null)
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300",
                  activeCategory === category.id
                    ? "bg-blue-600 text-[#FFFFF0] shadow-md"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50",
                )}
              >
                <span className={activeCategory === category.id ? "text-[#FFFFF0]" : "text-blue-600"}>{category.icon}</span>
                <span className="font-medium">{category.label}</span>
              </button>
            ))}
          </div>

          {/* Active Category Description */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center justify-center gap-2">
              <span className="text-blue-600">{faqCategories.find((cat) => cat.id === activeCategory)?.icon}</span>
              {faqCategories.find((cat) => cat.id === activeCategory)?.label}
            </h3>
            <p className="text-slate-600 mt-2">
              Find answers to common questions about{" "}
              {faqCategories.find((cat) => cat.id === activeCategory)?.label.toLowerCase()}.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {activeQuestions.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
              >
                <button
                  className="flex justify-between items-center w-full px-6 py-4 text-left"
                  onClick={() => toggleQuestion(index)}
                >
                  <span className="font-medium text-slate-800">{faq.question}</span>
                  <motion.div animate={{ rotate: expandedIndex === index ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-5 w-5 text-blue-600" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-slate-600 border-t border-slate-100 pt-3">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
