// app\premium-subscription\page.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { Check, ChevronRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect } from "react"

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
  // Ensure scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen bg-[#1a1a1a] overflow-x-hidden">
      <ScrollToTop />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background gradient - using the new gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e4e45] via-[#7a8c3b] to-[#ffc107] z-0"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid-pattern-gold)" />
            </svg>
            <defs>
              <pattern id="grid-pattern-gold" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
              </pattern>
            </defs>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                At RangaOne
                <br />
                <span className="text-[#1e4e45]">Your Growth, Our Priority</span>
              </h1>
              <div className="w-20 h-1 bg-[#1e4e45] mb-6 rounded-full"></div>
              <p className="text-gray-800 mb-6 text-lg leading-relaxed">
                Rangaone Wealth <span className="font-bold text-gray-900">PREMIUM</span> - Elevate Your Investing Game!
                For those who don't want to be limited to basic features. Upgrade to gain access to our exclusive
                premium features, designed to give you an edge in the market.
              </p>
              <p className="text-[#1e4e45] mb-8 italic">
                Here's what makes <span className="font-semibold">Rangaone Wealth Premium</span> truly special:
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/#pricing"
                  className="bg-[#1e4e45] hover:bg-[#183a33] text-white font-bold py-4 px-10 rounded-full transition-all inline-flex items-center shadow-lg hover:shadow-[#1e4e45]/30"
                >
                  <span>BUY NOW</span>
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-[#1e4e45]/20 rounded-2xl blur-xl z-0"></div>
              <div className="relative z-10 overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/bull-statue-gold.jpg"
                  alt="Golden Bull Statue"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
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
            Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner
          </span>
          <span className="inline-block mx-4 text-[#7a8c3b] font-semibold">
            Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner Banner
          </span>
        </div>
      </div>

      {/* Features Overview */}
      <section className="py-16 bg-[#222]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Why become <span className="text-[#7a8c3b]">Premium</span>?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#1e4e45] to-[#ffc107] mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
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
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-[#7a8c3b]">{feature.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
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
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 md:order-1">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1e4e45]/10 to-[#ffc107]/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-[#7a8c3b]/20">
                  <Image
                    src="/premium-stocks.png"
                    alt="Premium Stocks"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-[#1e4e45] to-[#7a8c3b] rounded-full flex items-center justify-center text-white font-bold text-xl z-20">
                  20-25
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-1 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 text-[#7a8c3b] rounded-full text-sm font-semibold mb-4">
                  Feature 1
                </div>
                <h3 className="text-3xl font-bold mb-6 text-[#7a8c3b]">Premium Quality Stocks</h3>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                  Our team goes beyond basic market analysis to find the finest high-growth stocks with exceptional
                  potential. We provide you with 20-25 meticulously researched stocks that have robust fundamentals,
                  strong growth trajectories, and are strategically timed for optimal performance.
                </p>
                <ul className="space-y-3">
                  {[
                    "Comprehensive fundamental analysis",
                    "Strong growth trajectories",
                    "Strategic timing for optimal performance",
                    "Detailed rationale and analysis",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-[#1e4e45] to-[#7a8c3b] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-1 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 text-[#7a8c3b] rounded-full text-sm font-semibold mb-4">
                  Feature 2
                </div>
                <h3 className="text-3xl font-bold mb-6 text-[#7a8c3b]">Short-Term/Swing Trades</h3>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                  Timing is everything in trading, and with Premium, we give double the short-term opportunities
                  compared to our basic plan. Our expert technical analysts identify 10 high-potential short-term trades
                  each month, complete with precise entry and exit points, stop-loss levels, and target prices.
                </p>
                <ul className="space-y-3">
                  {[
                    "10 high-potential trade recommendations",
                    "Precise entry and exit points",
                    "Sophisticated technical analysis",
                    "Strategic timing for market volatility",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-[#1e4e45] to-[#7a8c3b] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
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
                    src="/premium-swing-trades.png"
                    alt="Premium Swing Trades"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-r from-[#1e4e45] to-[#7a8c3b] rounded-full flex items-center justify-center text-white font-bold text-xl z-20">
                  10
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 md:order-1">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-[#7a8c3b]/20">
                  <Image
                    src="/model-portfolios.png"
                    alt="Model Portfolios"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-[#1e4e45] to-[#7a8c3b] rounded-full flex items-center justify-center text-white font-bold text-xl z-20">
                  2
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-1 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 text-[#7a8c3b] rounded-full text-sm font-semibold mb-4">
                  Feature 3
                </div>
                <h3 className="text-3xl font-bold mb-6 text-[#7a8c3b]">Exclusive Model Portfolios</h3>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                  Get exclusive access to our strategically curated portfolios tailored for long-term wealth creation:
                </p>

                <div className="mb-6 p-4 bg-[#2a2a2a] rounded-lg border border-[#7a8c3b]/20">
                  <h4 className="text-xl font-bold mb-2 text-[#7a8c3b]">NiftyPlus Portfolio</h4>
                  <p className="text-gray-300">
                    A carefully constructed portfolio designed for steady and consistent returns. It's built around core
                    blue-chip stocks with reliable dividends, enhanced with select growth opportunities to outperform
                    the market while maintaining stability.
                  </p>
                </div>

                <div className="p-4 bg-[#2a2a2a] rounded-lg border border-[#7a8c3b]/20">
                  <h4 className="text-xl font-bold mb-2 text-[#7a8c3b]">Multibagger Portfolio</h4>
                  <p className="text-gray-300">
                    Aimed to deliver higher growth! This portfolio consists of meticulously researched emerging
                    companies with exceptional growth potential, positioned to multiply your investment over time with
                    managed risk.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-1 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 text-[#7a8c3b] rounded-full text-sm font-semibold mb-4">
                  Feature 4
                </div>
                <h3 className="text-3xl font-bold mb-6 text-[#7a8c3b]">IPO Recommendations</h3>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                  Be among the first to know of the most promising IPO opportunities with our exclusive IPO analysis
                  service. Our team conducts thorough research on upcoming public offerings and provides detailed
                  recommendations on which IPOs are worth investing in and which to avoid.
                </p>
                <ul className="space-y-3">
                  {[
                    "Comprehensive business model analysis",
                    "Detailed financial evaluation",
                    "Valuation assessment",
                    "Growth trajectory projections",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-[#1e4e45] to-[#7a8c3b] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
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
                    src="/ipo-recommendations.png"
                    alt="IPO Recommendations"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 md:order-1">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-[#7a8c3b]/20">
                  <Image
                    src="/call-support.png"
                    alt="Call Support"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-1 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 text-[#7a8c3b] rounded-full text-sm font-semibold mb-4">
                  Feature 5
                </div>
                <h3 className="text-3xl font-bold mb-6 text-[#7a8c3b]">
                  Call Support
                  <span className="block text-xl mt-1 font-normal text-gray-400">(Direct Access to Experts)</span>
                </h3>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                  Our premium service gives you direct access to our expert analysts. When markets get volatile or you
                  need personalized guidance, simply schedule a call with our team.
                </p>
                <ul className="space-y-3">
                  {[
                    "One-on-one expert consultation",
                    "Personalized investment guidance",
                    "Strategy development for your goals",
                    "Market volatility navigation",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-[#1e4e45] to-[#7a8c3b] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Feature 6 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-1 bg-gradient-to-r from-[#1e4e45]/10 to-[#7a8c3b]/10 text-[#7a8c3b] rounded-full text-sm font-semibold mb-4">
                  Feature 6
                </div>
                <h3 className="text-3xl font-bold mb-6 text-[#7a8c3b]">
                  Free Live Webinars
                  <span className="block text-xl mt-1 font-normal text-gray-400">
                    — Learn, Interact & Grow! (Extra bonus)
                  </span>
                </h3>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                  Attend exclusive live "Ask me anything" sessions with our top analysts! Our interactive webinars give
                  you direct access to our expert team, where you can ask questions, gain insights, and deepen your
                  market knowledge.
                </p>
                <ul className="space-y-3">
                  {[
                    "Interactive Q&A sessions",
                    "Market trends and sector analysis",
                    "Investment strategy deep dives",
                    "Recordings for future reference",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-[#1e4e45] to-[#7a8c3b] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
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
                    src="/live-webinars.png"
                    alt="Live Webinars"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#222]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">What Our Premium Clients Say</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#1e4e45] to-[#ffc107] mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Hear from our satisfied premium clients who have transformed their investing journey with Rangaone Wealth
              Premium.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The exclusive model portfolios have been a game-changer for my long-term investment strategy. The returns have been exceptional.",
                name: "Amit K.",
                title: "Investment Banker",
                rating: 5,
                avatar: "/avatar-4.jpg",
              },
              {
                quote:
                  "The IPO recommendations have helped me get in on the ground floor of some incredible companies. The analysis is thorough and spot-on.",
                name: "Neha R.",
                title: "Financial Advisor",
                rating: 5,
                avatar: "/avatar-5.jpg",
              },
              {
                quote:
                  "The direct access to analysts has been invaluable during market volatility. Their guidance has helped me navigate uncertain times with confidence.",
                name: "Sanjay M.",
                title: "Business Owner",
                rating: 5,
                avatar: "/avatar-6.jpg",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#2a2a2a] p-8 rounded-xl shadow-lg relative border border-[#7a8c3b]/10"
              >
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <div className="text-6xl text-[#7a8c3b] opacity-20">"</div>
                </div>
                <p className="text-gray-300 mb-6 relative z-10">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-700">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.title}</p>
                  </div>
                </div>
                <div className="flex mt-4">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-[#ffc107] fill-[#ffc107]" />
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Basic vs Premium</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#1e4e45] to-[#ffc107] mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See how our Premium plan compares to the Basic plan and why it's worth the upgrade.
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left text-gray-400 border-b border-gray-700"></th>
                  <th className="p-4 text-center text-blue-400 border-b border-gray-700">
                    <span className="block text-xl font-bold">Basic</span>
                    <span className="text-sm text-gray-500">Essential Tools</span>
                  </th>
                  <th className="p-4 text-center text-[#7a8c3b] border-b border-gray-700">
                    <span className="block text-xl font-bold">Premium</span>
                    <span className="text-sm text-gray-500">Comprehensive Suite</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Quality Stock Picks", basic: "10-15 stocks", premium: "20-25 stocks" },
                  { feature: "Short-Term/Swing Trades", basic: "5 trades", premium: "10 trades" },
                  { feature: "Model Portfolios", basic: "❌", premium: "✅ (2 exclusive portfolios)" },
                  { feature: "IPO Recommendations", basic: "❌", premium: "✅" },
                  { feature: "Call Support", basic: "❌", premium: "✅ (Direct access to experts)" },
                  { feature: "Live Webinars", basic: "❌", premium: "✅ (Interactive sessions)" },
                  { feature: "Entry & Exit Alerts", basic: "✅", premium: "✅ (Enhanced with detailed analysis)" },
                  { feature: "Market Updates", basic: "✅", premium: "✅ (Priority access)" },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-[#2a2a2a]">
                    <td className="p-4 text-left text-white font-medium">{row.feature}</td>
                    <td className="p-4 text-center text-gray-400">{row.basic}</td>
                    <td className="p-4 text-center text-gray-300">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

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
              Stop following the crowd—start making power moves in the market. With Rangaone Wealth Premium, you're not
              just subscribing, you're elevating your investment game with expert-backed stock picks, real-time
              insights, and hands-on guidance.
            </p>
            <p className="text-gray-700 mb-8">
              This isn't just a service—it's a game-changer. Are you ready for elite guidance, confidence, and an
              unbeatable edge?
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/#pricing"
                className="bg-[#1a1a1a] text-white hover:bg-gray-800 font-bold py-4 px-10 rounded-full transition-all inline-flex items-center shadow-lg"
              >
                <span>Subscribe Now</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
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
