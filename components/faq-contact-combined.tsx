"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import PortfolioCard from "./portfolio-card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

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
        "Premium members receive priority customer support, access to exclusive webinars, one-on-one consultation calls, advanced portfolio analytics, and early access to new features.",
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
  ],
}

const portfolios = [
  {
    id: "alpha-student",
    title: "Alpha Student Sigma Plans",
    description: "this that bla bla bla bla xyz hello world",
    monthlyPrice: 500,
    billingPeriod: "Annual",
    billingFrequency: "Quarterly",
    minInvestment: 50000,
  },
  {
    id: "beta-growth",
    title: "Beta Growth Portfolio",
    description: "Designed for long-term capital appreciation with moderate risk",
    monthlyPrice: 750,
    billingPeriod: "Annual",
    billingFrequency: "Quarterly",
    minInvestment: 75000,
    cagr: "15%",
    returns: "12%",
  },
  {
    id: "gamma-elite",
    title: "Gamma Elite Portfolio",
    description: "Premium portfolio with high-conviction investment ideas",
    monthlyPrice: 1000,
    billingPeriod: "Annual",
    billingFrequency: "Quarterly",
    minInvestment: 100000,
    cagr: "18%",
    returns: "16%",
  },
]

export default function FAQContactCombined() {
  const { toast } = useToast()
  const router = useRouter()
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

  const handleBuyNow = (portfolioId: string) => {
    router.push(`/checkout?portfolio=${portfolioId}`)
  }

  const handleAddToCart = (portfolioId: string) => {
    // Here you would typically call your cart service to add the item
    toast({
      title: "Added to cart",
      description: "Portfolio has been added to your cart",
    })
  }

  return (
    <section className="py-16 bg-[#1e1b4b]" id="faq-contact">
      <div className="container mx-auto px-4">
        {/* Portfolio Slider - Mobile Only */}
        <div className="md:hidden mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Our Portfolios</h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {portfolios.map((portfolio) => (
                <CarouselItem key={portfolio.id} className="pl-2 md:pl-4 basis-[85%] md:basis-1/2">
                  <PortfolioCard 
                    {...portfolio} 
                    onBuyNow={() => handleBuyNow(portfolio.id)}
                    onAddToCart={() => handleAddToCart(portfolio.id)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious className="static translate-y-0 mx-1" />
              <CarouselNext className="static translate-y-0 mx-1" />
            </div>
          </Carousel>
        </div>

        {/* Desktop Portfolio Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-16">
          {portfolios.map((portfolio) => (
            <PortfolioCard 
              key={portfolio.id} 
              {...portfolio} 
              onBuyNow={() => handleBuyNow(portfolio.id)}
              onAddToCart={() => handleAddToCart(portfolio.id)}
            />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* FAQ Section */}
          <div>
            <div className="mb-8">
              <p className="text-sm text-gray-300 mb-2">Let's answer some questions</p>
              <h2 className="text-3xl font-bold text-white">FAQs</h2>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => {
                  setActiveCategory("basic")
                  setOpenIndex(0)
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all",
                  activeCategory === "basic"
                    ? "bg-white text-[#1e1b4b]"
                    : "bg-[#2e2a5b] text-white hover:bg-[#3e3a6b]"
                )}
              >
                Basic
              </button>
              <button
                onClick={() => {
                  setActiveCategory("modelPortfolio")
                  setOpenIndex(0)
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all",
                  activeCategory === "modelPortfolio"
                    ? "bg-white text-[#1e1b4b]"
                    : "bg-[#2e2a5b] text-white hover:bg-[#3e3a6b]"
                )}
              >
                Model Portfolio
              </button>
              <button
                onClick={() => {
                  setActiveCategory("premium")
                  setOpenIndex(0)
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all",
                  activeCategory === "premium"
                    ? "bg-white text-[#1e1b4b]"
                    : "bg-[#2e2a5b] text-white hover:bg-[#3e3a6b]"
                )}
              >
                Premium
              </button>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-3">
              {faqsByCategory[activeCategory as keyof typeof faqsByCategory].map((faq, index) => (
                <div
                  key={index}
                  className="bg-[#2e2a5b] rounded-xl overflow-hidden transition-all duration-200"
                >
                  <button
                    className="flex justify-between items-center w-full px-5 py-4 text-left"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="font-medium text-white">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-300 transition-transform duration-200 ${
                        openIndex === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      openIndex === index ? "max-h-48" : "max-h-0"
                    }`}
                  >
                    <div className="px-5 pb-4 text-gray-300">{faq.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#2e2a5b] rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-8">Contact us</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-lg text-white mb-4">Hi 👋 My name is...</p>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name..."
                  className="w-full bg-[#1e1b4b] border border-[#3e3a6b] rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <p className="text-lg text-white mb-4">and I represent</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleRepresentChange("BASIC")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                      formData.represent === "BASIC"
                        ? "bg-white text-[#1e1b4b]"
                        : "bg-[#1e1b4b] text-white hover:bg-[#3e3a6b]"
                    )}
                  >
                    BASIC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRepresentChange("PREMIUM")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                      formData.represent === "PREMIUM"
                        ? "bg-white text-[#1e1b4b]"
                        : "bg-[#1e1b4b] text-white hover:bg-[#3e3a6b]"
                    )}
                  >
                    PREMIUM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRepresentChange("MODEL PORTFOLIO")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                      formData.represent === "MODEL PORTFOLIO"
                        ? "bg-white text-[#1e1b4b]"
                        : "bg-[#1e1b4b] text-white hover:bg-[#3e3a6b]"
                    )}
                  >
                    MODEL PORTFOLIO
                  </button>
                </div>
              </div>

              <div>
                <p className="text-lg text-white mb-4">I'd love to ask about...</p>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your question..."
                  rows={4}
                  className="w-full bg-[#1e1b4b] border border-[#3e3a6b] rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="w-full bg-white text-[#1e1b4b] py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
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
