"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, Star, ShoppingCart, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useCart } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/use-toast";
import { bundleService, Bundle } from "@/services/bundle.service";
import { Navbar } from "@/components/navbar";
import BasicStackedCardTestimonials from "@/components/basic-stacked-card-testimonials";
import PricingTable from "@/components/pricingComponents";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Scroll to top utility component
const ScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
};

export default function BasicSubscriptionPage() {
  const [basicBundle, setBasicBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);

  // Mobile slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalFeatures = 4;

  // Mobile slider navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= totalFeatures - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? totalFeatures - 1 : prev - 1));
  };

  // Touch handling for mobile swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < totalFeatures - 1) {
      nextSlide();
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }
  };

  const { isAuthenticated } = useAuth();
  const { addBundleToCart, hasBundle } = useCart();
  const { toast } = useToast();

  // Ensure scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
    loadBasicBundle();
  }, []);

  const loadBasicBundle = async () => {
    try {
      const bundles = await bundleService.getAll();
      const basic = bundles.find((bundle) => bundle.category === "basic");
      setBasicBundle(basic || null);
    } catch (error) {
      console.error("Failed to load basic bundle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (
    subscriptionType: "monthly" | "quarterly" | "yearly" = "monthly"
  ) => {
    if (!basicBundle) return;

    try {
      await addBundleToCart(basicBundle._id, subscriptionType, "basic");
      toast({
        title: "Added to Cart",
        description: `Basic subscription (${subscriptionType}) has been added to your cart.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart.",
        variant: "destructive",
      });
    }
  };

  const isInCart = basicBundle ? hasBundle(basicBundle._id) : false;

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      {/* Header - Fully Responsive */}
      <Navbar variant="default" />

      {/* Hero Section - Following the image color theme */}
      <section className="relative px-3 sm:px-4 md:px-6 lg:px-8 pt-32 py-12 sm:py-32 md:py-24 lg:py-32 bg-gradient-to-r from-[#595CFF] to-[#48BCFF]">
        {/* Mobile & Tablet Layout */}
        <div className="lg:hidden">
          <div className="relative max-w-4xl mx-auto">
            {/* Main Headings - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 sm:mb-6"
            >
              <h1 className="px-2 text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight bg-gradient-to-r from-black/30 via-black/20 to-transparent rounded-xl p-4">
                At RangaOne<br></br>
                Your Growth, Our Priority
              </h1>
            </motion.div>

            {/* Content with floating image - Responsive */}
            <div className="relative">
              {/* Floating Bull Image - Responsive sizing */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="float-right ml-3 sm:ml-4 mb-3 sm:mb-4 w-48 h-40 sm:w-60 sm:h-52 md:w-60 md:h-52 relative z-10"
                style={{ shapeOutside: "inset(0 round 12px)" }}
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src="/basic-subscription/basicbull.png"
                    alt="Basic Bull"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, 384px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </motion.div>

              {/* Text Content - Responsive */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white"
              >
                <div className="space-y-2 sm:space-y-3 text-sm leading-relaxed">
                  <p>
                    Rangaone Wealth Basic - Start Your Investment Journey! For
                    those who seek{" "}
                    <strong>quality stock recommendations</strong>, Rangaone
                    Wealth Basic is designed to give you{" "}
                    <strong>
                      carefully researched stocks, market insights, and essential
                      guidance to begin your wealth creation journey.
                    </strong>
                  </p>

                  <p>
                    This isn't just an investment plan - it's your{" "}
                    <strong>first step towards financial freedom</strong>{" "}
                    with proven strategies that help you build wealth steadily.
                  </p>

                  <p className="italic text-gray-200 mt-3 sm:mt-4">
                    Here's what makes{" "}
                    <span className="font-semibold">
                      Rangaone Wealth Basic
                    </span>{" "}
                    perfect for beginners:
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Mobile Buttons - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 clear-both"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all text-base border border-blue-300"
              >
                BUY NOW
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent text-blue-300 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all text-base border border-blue-300"
              >
                Add to Cart
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="col-span-7"
            >
              {/* Main Headings */}
              <div className="p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 bg-gradient-to-r from-black/30 via-black/20 to-transparent">
                <h1 className="text-4xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                  At RangaOne
                  <span className="block">Your Growth, Our Priority</span>
                </h1>
              </div>

              {/* Content */}
              <div className="text-white space-y-4 text-sm leading-relaxed">
                <p>
                  <strong className="text-white">
                    Rangaone Wealth BASIC – Start Your Investment Journey!
                  </strong>{" "}
                  For those who seek{" "}
                  <strong>quality stock recommendations</strong>, Rangaone
                  Wealth Basic is designed to give you{" "}
                  <strong>
                    carefully researched stocks, market insights, and essential
                    guidance to begin your wealth creation journey.
                  </strong>{" "}
                  This isn't just an investment plan - it's your{" "}
                  <strong>first step towards financial freedom</strong> with
                  proven strategies that help you build wealth steadily.
                </p>

                <p className="italic text-gray-200 text-xl">
                  Here's what makes{" "}
                  <span className="font-semibold">Rangaone Wealth Basic</span>{" "}
                  perfect for beginners
                </p>
              </div>

              {/* Desktop Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex gap-6 mt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all text-base border border-blue-300"
                >
                  BUY NOW
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent text-blue-300 font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all text-base border border-blue-300"
                >
                  Add to Cart
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Column - Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="col-span-5"
            >
              <div className="relative">
                <div className="relative w-full h-48 sm:h-64 lg:h-80 xl:h-96 2xl:h-[28rem] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/basic-subscription/basicbull.png"
                    alt="Basic Bull Statue"
                    fill
                    className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Banner */}
      <div className="w-full bg-yellow-400 py-3 border-t border-b border-yellow-500/30 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee">
          <span className="inline-block mx-4 text-black font-semibold">
            You will not regret buying this!
          </span>
          <span className="inline-block mx-4 text-black font-semibold">
            This is a very nice offer!
          </span>
        </div>
      </div>

      {/* Features Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-black">
              Why Choose{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Basic
              </span>
              ?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mb-6 rounded-full"></div>
            <p className="text-black max-w-5xl mx-auto text-base">
              Our Basic plan is designed for beginners who want to start their investment journey with quality guidance.
            </p>
          </motion.div>

          {/* Mobile Slider */}
          <div className="md:hidden">
            <div
              className="relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(${-currentSlide * 100}%)` }}
                >
                  {[
                    {
                      title: "Quality Stocks",
                      description:
                        "10-15 carefully researched stocks with good potential",
                      icon: "📈",
                      id: "feature-1",
                    },
                    {
                      title: "Short-Term Trades",
                      description:
                        "5 high-potential trade recommendations each month",
                      icon: "⚡",
                      id: "feature-2",
                    },
                    {
                      title: "Timely Alerts",
                      description:
                        "Real-time notifications for market opportunities",
                      icon: "🔔",
                      id: "feature-3",
                    },
                    {
                      title: "Market Updates",
                      description: "Regular market analysis and insights",
                      icon: "📊",
                      id: "feature-4",
                    },
                  ].map((feature, index) => (
                    <div key={index} className="flex-shrink-0 w-full px-4">
                      <div
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-purple-200 group hover:border-purple-400 cursor-pointer h-full"
                        onClick={() => {
                          const element = document.getElementById(feature.id);
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-purple-500 mb-4">
                          <span className="text-base font-bold text-purple-600">
                            {index + 1}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-purple-600">
                          {feature.title}
                        </h3>
                        <p className="text-black group-hover:text-gray-700 transition-colors">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons - Mobile Only */}
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-lg transition-all z-10"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-lg transition-all z-10"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dots Indicator - Mobile Only */}
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalFeatures }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlide === index
                        ? "bg-purple-500 scale-125"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Quality Stocks",
                description:
                  "10-15 carefully researched stocks with good potential",
                icon: "📈",
                id: "feature-1",
              },
              {
                title: "Short-Term Trades",
                description:
                  "5 high-potential trade recommendations each month",
                icon: "⚡",
                id: "feature-2",
              },
              {
                title: "Timely Alerts",
                description:
                  "Real-time notifications for market opportunities",
                icon: "🔔",
                id: "feature-3",
              },
              {
                title: "Market Updates",
                description: "Regular market analysis and insights",
                icon: "📊",
                id: "feature-4",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-purple-200 group hover:border-purple-400 cursor-pointer"
                onClick={() => {
                  const element = document.getElementById(feature.id);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-purple-500 mb-4">
                  <span className="text-base font-bold text-purple-600">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-purple-600">
                  {feature.title}
                </h3>
                <p className="text-black group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {/* Feature 1 */}
            <motion.div
              id="feature-1"
              variants={fadeIn}
              className="md:grid md:grid-cols-2 gap-6 md:gap-12 items-center p-4 md:p-8 scroll-mt-20"
            >
              <div className="md:order-2">
                <div className="w-fit bg-purple-100 rounded-full justify-center mb-2">
                  <div className="content-center inline-block px-4 py-2 text-purple-700 rounded-full text-sm font-semibold">
                    Feature 1
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  Longterm 10-15 Quality Stocks
                </h3>
                <div className="relative md:hidden mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl blur-lg z-0"></div>
                  <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-purple-200">
                    <Image
                      src="/stock-chart-blue.png"
                      alt="Quality Stocks"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl z-20">
                    10-15
                  </div>
                </div>
                <p className="text-black mb-3 text-sm leading-relaxed">
                  Start your investment journey with carefully selected quality stocks. Our basic plan provides you with 10-15 well-researched stocks that have strong fundamentals and growth potential. These stocks are perfect for beginners who want to build a solid foundation for their portfolio.
                </p>
                <ul className="space-y-3 p-8">
                  {[
                    "Carefully Researched Stocks",
                    "Strong Fundamentals",
                    "Growth Potential",
                    "Beginner Friendly",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                      <span className="text-black font-bold italic">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative hidden md:block md:order-1">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-purple-200">
                  <Image
                    src="/stock-chart-blue.png"
                    alt="Quality Stocks"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl z-20">
                  10-15
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              id="feature-2"
              variants={fadeIn}
              className="md:grid md:grid-cols-2 gap-6 md:gap-12 items-center p-4 md:p-8 scroll-mt-20"
            >
              <div className="md:order-1">
                <div className="w-fit bg-purple-100 rounded-full justify-center mb-2">
                  <div className="content-center inline-block px-4 py-2 text-purple-700 rounded-full text-sm font-semibold">
                    Feature 2
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  5 Short-Term/Swing Trades
                </h3>
                <div className="relative md:hidden mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl blur-lg z-0"></div>
                  <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-purple-200">
                    <Image
                      src="/stock-chart-pattern.png"
                      alt="Swing Trades"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl z-20">
                    5
                  </div>
                </div>
                <p className="text-black mb-3 text-sm leading-relaxed">
                  Learn the art of short-term trading with our 5 carefully selected swing trades each month. These trades are perfect for beginners who want to understand market timing and short-term opportunities while managing risk effectively.
                </p>
                <ul className="space-y-3 p-8">
                  {[
                    "5 monthly trade recommendations",
                    "Risk management guidance",
                    "Entry and exit points",
                    "Educational insights",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                      <span className="text-black font-bold italic text-sm">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative hidden md:block md:order-2">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-purple-200">
                  <Image
                    src="/stock-chart-pattern.png"
                    alt="Swing Trades"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl z-20">
                  5
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              id="feature-3"
              variants={fadeIn}
              className="w-full md:grid md:grid-cols-2 gap-6 md:gap-12 items-center p-4 md:p-8"
            >
              <div className="md:order-2">
                <div className="w-fit bg-purple-100 rounded-full justify-center mb-2">
                  <div className="content-center inline-block px-4 py-2 text-purple-700 rounded-full text-sm font-semibold">
                    Feature 3
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  Timely Alerts
                  <span className="block text-2xl mt-1 font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                    (Never Miss Opportunities)
                  </span>
                </h3>
                <div className="relative md:hidden mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl blur-lg z-0"></div>
                  <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-purple-200">
                    <Image
                      src="/timely-alerts.png"
                      alt="Timely Alerts"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <p className="text-black mb-3 text-sm leading-relaxed">
                  Stay ahead of the market with our timely alerts system. Get instant notifications about market opportunities, stock movements, and important updates that can help you make informed investment decisions at the right time.
                </p>
              </div>
              <div className="relative hidden md:block md:order-1">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-purple-200">
                  <Image
                    src="/timely-alerts.png"
                    alt="Timely Alerts"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              id="feature-4"
              variants={fadeIn}
              className="md:grid md:grid-cols-2 gap-6 md:gap-12 items-center p-4 md:p-8"
            >
              <div className="md:order-1">
                <div className="w-fit bg-purple-100 rounded-full justify-center mb-2">
                  <div className="content-center inline-block px-4 py-2 text-purple-700 rounded-full text-sm font-semibold">
                    Feature 4
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  Real-Time Market Updates
                  <span className="block text-2xl mt-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                    (Stay Informed)
                  </span>
                </h3>
                <div className="relative md:hidden mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl blur-lg z-0"></div>
                  <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-purple-200">
                    <Image
                      src="/market-updates.png"
                      alt="Market Updates"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <p className="text-black mb-3 text-sm leading-relaxed">
                  Get regular market analysis and insights to understand what's happening in the financial world. Our market updates help you stay informed about trends, economic events, and their impact on your investments.
                </p>
                <ul className="space-y-3 p-8">
                  {[
                    "Regular market analysis",
                    "Economic insights",
                    "Trend explanations",
                    "Investment guidance",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                      <span className="text-black font-bold italic text-sm">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative hidden md:block md:order-2">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl blur-lg z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-xl shadow-xl border border-purple-200">
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
      <section className="bg-white">
        <div className="container mx-auto px-4">
          <BasicStackedCardTestimonials />
        </div>
      </section>

      {/* Pricing Section */}
      <PricingTable />

      {/* CTA Section */}
      <section className="py-10 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Your Investment Journey Today!
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Don't wait to begin building your wealth. With RangaOne Wealth Basic, you're not just subscribing, you're taking the first step towards financial freedom with expert-backed guidance.
            </p>
            <p className="text-gray-200 mb-8 max-w-7xl">
              This isn't just a service—it's your gateway to smart investing. Are you ready to start your wealth creation journey?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/#pricing"
                  className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-full transition-all inline-flex items-center shadow-lg"
                >
                  <span>Subscribe Now</span>
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about our Basic subscription plan.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "How many stocks do I get with the Basic plan?",
                answer:
                  "The Basic plan provides you with 10-15 carefully researched quality stocks that are perfect for beginners starting their investment journey.",
              },
              {
                question: "How often do I receive trade recommendations?",
                answer:
                  "You receive 5 short-term/swing trade recommendations each month, along with regular market updates and timely alerts.",
              },
              {
                question: "Can I upgrade to Premium later?",
                answer:
                  "Yes, you can upgrade from Basic to Premium at any time to access additional features and more comprehensive services.",
              },
              {
                question: "Is there a trial period for the Basic plan?",
                answer:
                  "We offer a 14-day money-back guarantee for new Basic subscribers if you're not satisfied with the service.",
              },
              {
                question: "What kind of support do I get with Basic?",
                answer:
                  "Basic subscribers receive email support and access to our educational content to help you understand the market better.",
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
                <h3 className="text-xl font-bold mb-3 text-purple-600">
                  {faq.question}
                </h3>
                <p className="text-black">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
