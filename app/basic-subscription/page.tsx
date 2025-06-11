// app\basic-subscription\page.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { Check, ChevronRight } from "lucide-react"
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

export default function BasicSubscriptionPage() {
  // Ensure scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <ScrollToTop />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#051838] via-[#0a3a7d] to-[#051838] z-0"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid-pattern)" />
            </svg>
            <defs>
              <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                At RangaOne
                <br />
                <span className="text-blue-300">Your Growth, Our Priority</span>
              </h1>
              <div className="w-20 h-1 bg-blue-400 mb-6 rounded-full"></div>
              <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                Rangaone Wealth <span className="font-bold text-white">BASIC</span> - Get your investing journey
                started! For those who are new to the financial markets. Our basic plan provides you with essential
                market insights, quality stock picks, and real-time updates to help you make informed investment
                decisions.
              </p>
              <p className="text-blue-200 mb-8 italic">
                Here's what makes <span className="font-semibold">Rangaone Wealth Basic</span> truly special:
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/#pricing"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-full transition-all inline-flex items-center shadow-lg hover:shadow-blue-500/30"
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
              <div className="absolute -inset-4 bg-blue-500/20 rounded-2xl blur-xl z-0"></div>
              <div className="relative z-10 overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/bull-statue-blue.jpg"
                  alt="Bull Statue"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#051838]/80 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Why Choose <span className="text-blue-600">Basic</span>?
            </h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our Basic plan is designed to give you a solid foundation in the world of investing with essential tools
              and insights.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Quality Stocks",
                description: "10-15 carefully selected stocks with strong fundamentals",
                icon: "📈",
              },
              {
                title: "Swing Trades",
                description: "5 short-term trade recommendations with analysis",
                icon: "⚡",
              },
              {
                title: "Timely Alerts",
                description: "Precise entry & exit points with stop-loss levels",
                icon: "🔔",
              },
              {
                title: "Market Updates",
                description: "Real-time updates on market trends and events",
                icon: "📊",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
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
                <div className="absolute -inset-4 bg-blue-500/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-blue-100">
                  <Image
                    src="/stock-chart-blue.png"
                    alt="Stock Chart"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl z-20">
                  10-15
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                  Feature 1
                </div>
                <h3 className="text-3xl font-bold mb-6 text-gray-900">Longterm Quality Stocks</h3>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  Our team of in-depth market data analysis research, screening and more to find the best quality stocks
                  for long-term investment. We provide you with 10-15 carefully selected stocks that have strong
                  fundamentals, good growth potential, and are positioned for long-term success.
                </p>
                <ul className="space-y-3">
                  {[
                    "Thorough fundamental analysis",
                    "Strong growth potential",
                    "Detailed rationale for each pick",
                    "Regular performance updates",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                  Feature 2
                </div>
                <h3 className="text-3xl font-bold mb-6 text-gray-900">Short-Term/Swing Trades</h3>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  Maximize your profits with regular short-term and swing trade recommendations. Our technical analysis
                  team identifies high-potential short-term opportunities in the market. Each trade is backed by
                  thorough analysis, ensuring a calculated and confident approach to short-term trading.
                </p>
                <ul className="space-y-3">
                  {[
                    "5 high-potential trade recommendations",
                    "Precise entry and exit points",
                    "Stop-loss and target price levels",
                    "Technical analysis rationale",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-blue-100">
                  <Image
                    src="/swing-trade-chart.jpg"
                    alt="Swing Trade Chart"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl z-20">
                  5
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 md:order-1">
                <div className="absolute -inset-4 bg-blue-500/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-blue-100">
                  <Image
                    src="/timely-alerts.png"
                    alt="Timely Alerts"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                  Feature 3
                </div>
                <h3 className="text-3xl font-bold mb-6 text-gray-900">Timely Alerts for Entry & Exit</h3>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  Get real-time alerts with precision and clarity. Our experts will never leave you guessing about when
                  to enter or exit a position. We provide clear, actionable alerts with specific entry and exit points,
                  stop-loss levels, and target prices.
                </p>
                <ul className="space-y-3">
                  {[
                    "Instant notifications via SMS, email, and app",
                    "Clear entry and exit points",
                    "Specific stop-loss levels",
                    "Target price recommendations",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                  Feature 4
                </div>
                <h3 className="text-3xl font-bold mb-6 text-gray-900">Real-Time Market Updates</h3>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  Stay ahead of market movements with our comprehensive real-time updates. Our team monitors market
                  developments around the clock, providing you with timely information on market trends, economic
                  events, and breaking news that could impact your investments.
                </p>
                <ul className="space-y-3">
                  {[
                    "24/7 market monitoring",
                    "Breaking news alerts",
                    "Economic event analysis",
                    "Concise, actionable insights",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/10 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-blue-100">
                  <Image
                    src="/market-updates.png"
                    alt="Market Updates"
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">What Our Clients Say</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from our satisfied clients who have transformed their investing journey with Rangaone Wealth Basic.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The quality stock picks have been excellent. I've seen consistent growth in my portfolio since subscribing to the Basic plan.",
                name: "Rajesh M.",
                title: "Software Engineer",
                avatar: "/avatar-1.jpg",
              },
              {
                quote:
                  "The timely alerts are a game-changer. I no longer have to constantly monitor the market to know when to enter or exit a position.",
                name: "Priya S.",
                title: "Business Analyst",
                avatar: "/avatar-2.jpg",
              },
              {
                quote:
                  "As a beginner investor, the real-time market updates have helped me understand market trends and make informed decisions.",
                name: "Vikram P.",
                title: "Marketing Professional",
                avatar: "/avatar-3.jpg",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg relative"
              >
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <div className="text-6xl text-blue-500 opacity-20">"</div>
                </div>
                <p className="text-gray-700 mb-6 relative z-10">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-200">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Forget the Guesswork</h2>
            <p className="text-xl mb-8 text-blue-100">
              Rangaone Wealth Basic gives you the essential tools, expert market advice, and real-time insights to grow
              your wealth with clarity and confidence. This isn't just a service—it's your gateway to smarter investing.
            </p>
            <p className="text-blue-200 mb-8">
              Serious about building wealth? Start here. Subscribe to Rangaone Wealth Basic today!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/#pricing"
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-4 px-10 rounded-full transition-all inline-flex items-center shadow-lg"
              >
                <span>Subscribe Now</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about our Basic subscription plan.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "How often are stock recommendations updated?",
                answer:
                  "Our long-term stock recommendations are reviewed and updated monthly, while short-term trade recommendations are provided weekly or as market conditions warrant.",
              },
              {
                question: "How will I receive alerts and updates?",
                answer:
                  "You'll receive alerts and updates via email, SMS, and our mobile app. You can customize your notification preferences in your account settings.",
              },
              {
                question: "Can I upgrade to the Premium plan later?",
                answer:
                  "Yes, you can upgrade to our Premium plan at any time. We'll prorate your subscription based on the remaining time in your current billing cycle.",
              },
              {
                question: "Is there a minimum investment amount required?",
                answer:
                  "No, there is no minimum investment amount required. Our recommendations are suitable for investors with portfolios of all sizes.",
              },
              {
                question: "Do you offer a money-back guarantee?",
                answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="mb-6 border-b border-gray-200 pb-6 last:border-0"
              >
                <h3 className="text-xl font-bold mb-3 text-gray-900">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
