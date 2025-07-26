// app\premium-subscription\page.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { Check, ChevronRight, Star, ShoppingCart, X } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { useCart } from "@/components/cart/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { bundleService, Bundle } from "@/services/bundle.service"
import { Navbar } from "@/components/navbar"
import StackedCardTestimonials from "@/components/stacked-card-testimonials"
import PricingTable from "@/components/pricingComponents"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

// Scroll to top utility component
const ScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return null
}

export default function PremiumSubscriptionPage() {
  const [premiumBundle, setPremiumBundle] = useState<Bundle | null>(null)
  const [loading, setLoading] = useState(true)
  
  const { isAuthenticated } = useAuth()
  const { addBundleToCart, hasBundle } = useCart()
  const { toast } = useToast()

  // Ensure scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
    loadPremiumBundle()
  }, [])

  const loadPremiumBundle = async () => {
    try {
      const bundles = await bundleService.getAll()
      const premium = bundles.find(bundle => bundle.category === "premium")
      setPremiumBundle(premium || null)
    } catch (error) {
      console.error("Failed to load premium bundle:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (subscriptionType: "monthly" | "quarterly" | "yearly" = "monthly") => {
    if (!premiumBundle) return
    
    // Remove authentication check - allow all users to add to cart
    try {
      await addBundleToCart(premiumBundle._id, subscriptionType, "premium")
      toast({
        title: "Added to Cart",
        description: `Premium subscription (${subscriptionType}) has been added to your cart.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart.",
        variant: "destructive",
      })
    }
  }

  const isInCart = premiumBundle ? hasBundle(premiumBundle._id) : false

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#515151] to-[#333333]">
      <ScrollToTop />
      <Navbar variant="premium" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-24 overflow-hidden">
  {/* Background gradient */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#135058] to-[#FFCB50] z-0"></div>

  {/* Grid pattern */}
  <div className="absolute inset-0 z-0 opacity-10">
    <div className="absolute top-0 left-0 w-full h-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid-pattern-gold)" />
        <defs>
          <pattern id="grid-pattern-gold" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          </pattern>
        </defs>
      </svg>
    </div>
  </div>

  {/* Content container */}
  <div className="relative z-10 max-w-7xl mx-auto">
    <div className="flex flex-row gap-4 items-start">
      {/* Left: Text Content */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-[55%] min-w-[270px] max-w-[600px]"
      >
        <div className="p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 bg-gradient-to-r from-[#333333] via-[#230B0296] to-[#00000000] inline-block">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-[#FFD700]">
            At RangaOne
            <span className="block">Your Growth, Our Priority</span>
          </h1>
        </div>

        <div className="w-16 h-1 bg-[#1e4e45] mb-4 sm:mb-6 rounded-full"></div>

        <p className="text-white mb-4 text-sm sm:text-base leading-relaxed">
          RangaOne Wealth <b className="font-extrabold">PREMIUM</b> – Elevate Your Investing Game! For those who
          seek more than just market returns, RangaOne Wealth Premium is designed to
          give you <b className="font-extrabold">exclusive, high-quality stock insights, advanced strategies, and direct
          access to expert guidance</b>. This isn’t just an investment plan – it’s your <b className="font-extrabold">personalized roadmap to wealth creation</b> with premium perks that set you apart from regular investors.
        </p>

        <p className="text-gray-300 mb-6 italic text-sm sm:text-base">
          Here’s what makes <span className="font-semibold">RangaOne Wealth Premium</span> truly special:
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
            <Link
              href="/#pricing"
              className="w-full bg-[#1a1a1a] hover:bg-gray-800 text-[#FFD700] font-bold py-3 px-6 rounded-full transition-all inline-flex items-center justify-center shadow-lg hover:shadow-[#1a1a1a]/30 text-sm"
            >
              <span>BUY NOW</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddToCart("monthly")}
            disabled={isInCart || loading}
            className={`w-full font-bold py-3 px-6 rounded-full transition-all inline-flex items-center justify-center shadow-lg border-2 text-sm ${
              isInCart
                ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                : "bg-transparent border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#1a1a1a]"
            }`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>{isInCart ? "In Cart" : "Add to Cart"}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Right: Image */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative w-[45%] min-w-[140px]"
      >
        <div className="absolute -inset-2 sm:-inset-4 bg-[#1e4e45]/20 rounded-2xl blur-xl z-0"></div>
        <div className="relative z-10 overflow-hidden rounded-2xl shadow-2xl">
          <Image
            src="/premium-subscription/premium_bull.jpg"
            alt="Golden Bull Statue"
            width={600}
            height={400}
            className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700 rounded-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e4e45]/50 to-transparent"></div>
        </div>
      </motion.div>
    </div>
  </div>
</section>



      {/* Banner */}
      <div className="w-full bg-[#1a1a1a] py-3 border-t border-b border-[#7a8c3b]/30 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee">
          <span className="inline-block mx-4 text-[#7a8c3b] font-semibold">
            Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner
          </span>
          <span className="inline-block mx-4 text-[#7a8c3b] font-semibold">
            Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner
          </span>
        </div>
      </div>

      {/* Features Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-[#FFFFF0]">
              Why become <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706]">Premium</span>?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFC706] mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-300 max-w-5xl mx-auto text-lg">
              Our Premium plan is designed for serious investors who want comprehensive tools and exclusive insights.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Premium Quality Stocks",
                description: "20-25 meticulously researched stocks with exceptional potential",
                icon: "📈",
              },
              {
                title: "Short-Term/Swing Trades",
                description: "10 high-potential trade recommendations each month",
                icon: "⚡",
              },
              {
                title: "Exclusive Model Portfolios",
                description: "NiftyPlus & Multibagger portfolios for diverse strategies",
                icon: "💼",
              },
              {
                title: "IPO Recommendations",
                description: "Exclusive analysis of upcoming public offerings",
                icon: "🚀",
              },
              {
                title: "Call Support",
                description: "Direct access to our expert analysts",
                icon: "📞",
              },
              {
                title: "Free Live Webinars",
                description: "Interactive sessions with top analysts",
                icon: "🎓",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#2a2a2a] rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-[#7a8c3b]/10 group hover:border-[#7a8c3b]/30"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#FFD700] mb-4">
                  <span className="text-lg font-bold text-[#FFD700]">{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#FFD700]">{feature.title}</h3>
                <p className="text-white group-hover:text-gray-300 transition-colors">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-32"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center p-8">
              <div className="relative order-2 md:order-1">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1e4e45]/10 to-[#ffc107]/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-[#7a8c3b]/20">
                  <Image
                    src="/premium-subscription/qualityStocks.jpg"
                    alt="Premium Stocks"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#FFC706] rounded-full flex items-center justify-center text-black font-bold text-2xl z-20">
                  20-25
                </div>
              </div>
              <div className="order-1 md:order-2">
              <div className="w-fit bg-[#f2be74] rounded-full justify-center mb-2">
                  <div className=" content-center inline-block px-4 py-2 text-transparent bg-clip-text bg-[#9c600c] rounded-full text-sm font-semibold ">
                  Feature 1
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706]">Get 20-25 Premium Quality Stocks</h3>
                <p className="text-gray-300 mb-3 text-lg leading-relaxed">
                Why settle for less when you can have the best? In the Basic Plan, 
                you receive Only 10-15 quality stocks, but with Premium, you unlock 
                20-25 high-potential stocks, carefully handpicked through deeper analysis 
                and sharper insights. This means more opportunities, higher accuracy, and better 
                diversification, giving you the ultimate edge in wealth creation
                </p>
                <ul className="space-y-3 p-8">
                  {[
                    "Advanced Stock Selection",
                    "Elite Level Research Edge",
                    "Superior Growth Potential Stocks",
                    "Legacy Wealth Creation",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#FFC706] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#FFFFF0]" />
                      </span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center p-8">
              <div>
                <div className="w-fit bg-[#f2be74] rounded-full justify-center mb-2">
                  <div className=" content-center inline-block px-4 py-2 text-transparent bg-clip-text bg-[#9c600c] rounded-full text-sm font-semibold ">
                  Feature 2
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706]">Short-Term/Swing Trades</h3>
                <p className="text-gray-300 mb-3 text-lg leading-relaxed">
                  Timing is everything in trading, and with Premium, we give double the short-term opportunities
                  compared to our basic plan. Our expert technical analysts identify 10 high-potential short-term trades
                  each month, complete with precise entry and exit points, stop-loss levels, and target prices.
                </p>
                <ul className="space-y-3 p-8">
                  {[
                    "10 high-potential trade recommendations",
                    "Precise entry and exit points",
                    "Sophisticated technical analysis",
                    "Strategic timing for market volatility",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#FFC706] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#FFFFF0]" />
                      </span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-[#7a8c3b]/20">
                  <Image
                    src="/premium-subscription/10SwingTrades.jpg"
                    alt="Premium Swing Trades"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#FFC706] rounded-full flex items-center justify-center text-black font-bold text-2xl z-20">
                  10
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center p-8">
              <div className="relative order-2 md:order-1">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-[#7a8c3b]/20">
                  <Image
                    src="/premium-subscription/IPO.jpg"
                    alt="Call Support"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
              <div className="w-fit bg-[#f2be74] rounded-full justify-center mb-2">
                  <div className=" content-center inline-block px-4 py-2 text-transparent bg-clip-text bg-[#9c600c] rounded-full text-sm font-semibold ">
                  Feature 3
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#D4AF37]">
                  IPO Recommendations
                  <span className="block text-xl mt-1 font-normal text-gray-400">(Direct Access to Experts)</span>
                </h3>
                <p className="text-gray-300 mb-3 text-lg leading-relaxed">
                Be among the first to invest in the next big opportunity! Our premium subscribers 
                get exclusive IPO recommendations with insights on which ones are worth investing 
                in and which ones to avoid. Get detailed analysis, valuation breakdowns, and subscription 
                strategies so you never miss a high-potential listing.
                </p>
                <ul className="space-y-3 p-8">
                  {[
                    "Exclusive IPO Recommendations",
                    "Allotment Maximisation Strategy",
                    "Apply-or-Avoid guidance",
                    "Expert Valuation Insights",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#FFC706] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#FFFFF0]" />
                      </span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center p-8">
              <div>
              <div className="w-fit bg-[#f2be74] rounded-full justify-center mb-2">
                  <div className=" content-center inline-block px-4 py-2 text-transparent bg-clip-text bg-[#9c600c] rounded-full text-sm font-semibold ">
                  Feature 4
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706]">Call Support <br className="text-xs"/>(Direct Access to Experts)</h3>
                <p className="text-gray-300 mb-3 text-lg leading-relaxed">
                Your investing journey should never feel like a guessing game. With Premium, 
                you get priority call support where you can discuss your queries, seek clarifications, 
                and get direct insights from our experts. You’re not just another investor—you’re part of 
                an exclusive group that gets expert guidance on demand
                </p>
                <ul className="space-y-3 p-8">
                  {[
                    "Priority Call Support",
                    "Expert-Led Guidance",
                    "Query Resolution Access",
                    "Exclusive Member Benefits",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#FFC706] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#FFFFF0]" />
                      </span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-[#7a8c3b]/20">
                  <Image
                    src="/premium-subscription/CallSupport.jpg"
                    alt="IPO Recommendations"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center p-8">
              <div className="relative order-2 md:order-1">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-[#7a8c3b]/20">
                  <Image
                    src="/premium-subscription/FreeLiveWebinars.jpg"
                    alt="Call Support"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
              <div className="w-fit bg-[#f2be74] rounded-full justify-center mb-2">
                  <div className=" content-center inline-block px-4 py-2 text-transparent bg-clip-text bg-[#9c600c] rounded-full text-sm font-semibold ">
                  Feature 5
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706]">
                Free Live Webinars <br className="text-xs"/>– Learn, Interact & Grow! (Extra bonus)</h3>
                <p className="text-gray-300 mb-3 text-lg leading-relaxed">
                Most influencers offer chat support and pre-recorded videos, but we go beyond that! With RangaOne Wealth Premium, you get exclusive live webinars where our experts break down market trends, stock strategies, and upcoming opportunities—in real-time.*(more features chart)*
                We don’t just share information; we take responsibility for answering your doubts, explaining concepts, and ensuring you truly understand the market. This isn’t just another webinar—it’s a premium experience designed to make you feel valued and empowered.
                </p>
                <ul className="space-y-3 p-8">
                  {[
                    "Concept Clarity Sessions",
                    "Real-time Insights",
                    "Doubt Clearing Sessions",
                    "Actionable Market Breakdowns",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#FFC706] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#FFFFF0]" />
                      </span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#FFFFF0]">What Our Premium Clients Say</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#1e4e45] to-[#ffc107] mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Hear from our satisfied premium clients who have transformed their investing journey with RangaOne Wealth
              Premium.
            </p>
          </motion.div>

          <StackedCardTestimonials />
        </div>
      </section>

      {/* Pricing Section */}
      <PricingTable />

      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1e4e45] via-[#7a8c3b] to-[#ffc107] text-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Unlock Exclusive Access – Invest Like a Pro!</h2>
            <p className="text-xl mb-8 text-gray-800">
              Stop following the crowd—start making power moves in the market. With RangaOne Wealth Premium, you're not
              just subscribing, you're elevating your investment game with expert-backed stock picks, real-time
              insights, and hands-on guidance.
            </p>
            <p className="text-gray-700 mb-8">
              This isn't just a service—it's a game-changer. Are you ready for elite guidance, confidence, and an
              unbeatable edge?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/#pricing"
                  className="bg-[#1a1a1a] text-[#FFFFF0] hover:bg-gray-800 font-bold py-4 px-10 rounded-full transition-all inline-flex items-center shadow-lg"
                >
                  <span>Subscribe Now</span>
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddToCart("monthly")}
                disabled={isInCart || loading}
                className={`font-bold py-4 px-10 rounded-full transition-all inline-flex items-center shadow-lg border-2 ${
                  isInCart
                    ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                    : "bg-transparent border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#FFFFF0]"
                }`}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                <span>{isInCart ? "In Cart" : "Add to Cart"}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#FFFFF0]">Frequently Asked Questions</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#1e4e45] to-[#ffc107] mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get answers to common questions about our Premium subscription plan.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "How do the model portfolios work?",
                answer:
                  "Our model portfolios are pre-built investment strategies that you can follow. We provide the exact allocation percentages, entry points, and regular updates. You can implement these in your own brokerage account.",
              },
              {
                question: "How often can I schedule calls with analysts?",
                answer:
                  "Premium members can schedule up to two 30-minute calls per month with our expert analysts. Additional calls can be arranged for an extra fee.",
              },
              {
                question: "Are the webinars recorded if I can't attend live?",
                answer:
                  "Yes, all webinars are recorded and made available in your member dashboard within 24 hours of the live session.",
              },
              {
                question: "Can I switch between Basic and Premium plans?",
                answer:
                  "Yes, you can upgrade from Basic to Premium at any time. You can also downgrade during your renewal period.",
              },
              {
                question: "Is there a trial period for the Premium plan?",
                answer:
                  "We offer a 14-day money-back guarantee for new Premium subscribers if you're not satisfied with the service.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="mb-6 border-b border-gray-700 pb-6 last:border-0"
              >
                <h3 className="text-xl font-bold mb-3 text-[#7a8c3b]">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
