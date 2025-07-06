// components/model-portfolio-section.tsx
"use client";

import { useState, useEffect } from "react";
import { MotionConfig, motion } from "framer-motion";
import { FaYoutube } from "react-icons/fa";
import { FiBookOpen } from "react-icons/fi";
import { ShoppingCart, CreditCard, Check } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { useCart } from "@/components/cart/cart-context";
import { userPortfolioService, UserPortfolio } from "@/services/user-portfolio.service";
import { CheckoutModal } from "@/components/checkout-modal";
import { SectionHeading } from "@/components/ui/section-heading";

type SubscriptionType = "monthly" | "quarterly" | "yearly";

// Predefined colors for portfolio cards
const portfolioColors = [
  "bg-emerald-300",
  "bg-indigo-300", 
  "bg-red-300",
  "bg-yellow-300",
  "bg-purple-300",
  "bg-pink-300",
  "bg-blue-300",
  "bg-green-300",
  "bg-orange-300",
  "bg-teal-300",
  "bg-cyan-300",
  "bg-rose-300"
];

const features = [
  {
    icon: "/icons/simplicity.png",
    title: "Simplicity",
    description:
      "Designed for busy professionals (salaried person, businessmen) our portfolios remove the hassle of stock analysis and simplify the investment process that fits your lifestyle.",
  },
  {
    icon: "/icons/rebalancing.png",
    title: "Rebalancing",
    description:
      "We don't just give stock names and leave. Every quarter, we adjust based on market conditions—guiding you on exits, profit booking, upward averaging, and downward averaging.",
  },
  {
    icon: "/icons/diversification.png",
    title: "Diversification",
    description:
      "Your money won't sit in one basket. We spread it smartly—across large, mid and small cap stocks, multiple sectors, and even assets like ETFs and gold—balancing risk and maximizing opportunity.",
  },
  {
    icon: "/icons/goal-based.png",
    title: "Goal-Based Investing",
    description:
      "You choose the Goal, and the model portfolio provides an investment path that you can follow.",
  },
];

export const ModelPortfolioSection = () => {
  const [portfolios, setPortfolios] = useState<UserPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>("monthly");
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    portfolio?: UserPortfolio;
  }>({
    isOpen: false,
  });

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const portfoliosData = await userPortfolioService.getAll();
      setPortfolios(portfoliosData);
    } catch (error) {
      console.error("Failed to load portfolios:", error);
      toast({
        title: "Error",
        description: "Failed to load portfolios. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (portfolio: UserPortfolio) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart(portfolio._id);
      toast({
        title: "Added to Cart",
        description: `${portfolio.name} has been added to your cart.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add portfolio to cart.",
        variant: "destructive",
      });
    }
  };

  const handleBuyNow = (portfolio: UserPortfolio) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase portfolios.",
        variant: "destructive",
      });
      return;
    }

    setCheckoutModal({
      isOpen: true,
      portfolio,
    });
  };

  const getPrice = (portfolio: UserPortfolio) => {
    return userPortfolioService.getPriceByType(portfolio.subscriptionFee, subscriptionType);
  };

  const getHomeDescription = (portfolio: UserPortfolio) => {
    return userPortfolioService.getDescriptionByKey(portfolio.description, "home card");
  };

  const getMethodologyLink = (portfolio: UserPortfolio) => {
    return userPortfolioService.getDescriptionByKey(portfolio.description, "methodology PDF link");
  };

  const getPerformanceMetrics = (portfolio: UserPortfolio) => {
    return userPortfolioService.getPerformanceMetrics(portfolio);
  };

  const getPortfolioDetails = (portfolio: UserPortfolio) => {
    return userPortfolioService.getPortfolioDetails(portfolio);
  };

  const getPeriodLabel = () => {
    switch (subscriptionType) {
      case "yearly": return "year";
      case "quarterly": return "quarter";
      default: return "month";
    }
  };

  const displayedPortfolios = showAll ? portfolios : portfolios.slice(0, 4);

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading portfolios...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="py-6 sm:py-8 bg-[#fefcea]">
        <div className="mb-6 sm:mb-8 lg:mb-12 relative z-10 container mx-auto px-3 sm:px-4">
          <SectionHeading
            title="Model Portfolios"
            subtitle="Smart investment strategies for every investor"
            className="mb-4 sm:mb-6"
          />
          <p className="text-center mx-auto text-sm sm:text-base lg:text-lg mb-6 max-w-4xl">
            Model portfolios offer a simpler way to invest in a market that's filled with options and increasingly
            complex. You can consider a model portfolio as cost-efficient, diversified investment framework and a
            roadmap, where you choose the destination, and the model portfolio provides an investment path that you can
            follow.
          </p>
        </div>

        <section className="py-6 sm:py-8 px-3 sm:px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg pt-10 pb-6 px-3 sm:px-4 relative border-t-4 border-[#2a2e86] hover:shadow-xl transition-shadow duration-300"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full border-2 border-[#2a2e86] shadow-md">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                  />
                </div>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-[#2a2e86] font-bold text-base sm:text-lg text-center mt-2 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-[#fefcea] px-3 sm:px-4 py-6 sm:py-8">
        <div className="mx-auto container grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {portfolios.map((portfolio, index) => (
            <PortfolioCard
              key={portfolio._id}
              portfolio={portfolio}
              onBuyNow={() => handleBuyNow(portfolio)}
            />
          ))}
        </div>
      </section>

      {/* Points Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Points */}
            <div className="bg-blue-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-blue-600 mb-6">Basic Plan Features</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span className="text-gray-700">10-15 Quality Stock Recommendations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span className="text-gray-700">5 Short-term Trade Ideas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span className="text-gray-700">Basic Market Updates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span className="text-gray-700">Email Support</span>
                </li>
              </ul>
            </div>

            {/* Premium Points */}
            <div className="bg-[#f0f4e8] p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-[#1e4e45] mb-6">Premium Plan Features</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1e4e45] mr-3 mt-1" />
                  <span className="text-gray-700">20-25 Premium Stock Recommendations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1e4e45] mr-3 mt-1" />
                  <span className="text-gray-700">10 High-Potential Trade Ideas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1e4e45] mr-3 mt-1" />
                  <span className="text-gray-700">Exclusive Model Portfolios</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1e4e45] mr-3 mt-1" />
                  <span className="text-gray-700">Priority Call Support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1e4e45] mr-3 mt-1" />
                  <span className="text-gray-700">Live Webinars Access</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1e4e45] mr-3 mt-1" />
                  <span className="text-gray-700">IPO Recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false })}
        type="single"
        portfolio={checkoutModal.portfolio}
        subscriptionType={subscriptionType}
      />
    </>
  );
};

interface PortfolioCardProps {
  portfolio: UserPortfolio;
  onBuyNow: () => void;
}

const PortfolioCard = ({ portfolio, onBuyNow }: PortfolioCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverStart = () => setIsHovered(true);
  const handleHoverEnd = () => setIsHovered(false);
  const handleHover = () => setIsHovered(!isHovered);

  const monthlyFee = portfolio.subscriptionFee.find(fee => fee.type === "monthly")?.price || 0;
  const methodologyLink = userPortfolioService.getDescriptionByKey(portfolio.description, "methodology PDF link");
  const homeDescription = userPortfolioService.getDescriptionByKey(portfolio.description, "home card");
  const metrics = userPortfolioService.getPerformanceMetrics(portfolio);

  return (
    <MotionConfig
      transition={{
        type: "spring",
        bounce: 0.5,
      }}
    >
      <motion.div
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        onTouchStart={handleHover}
        animate={isHovered ? "hovered" : ""}
        className="group w-full border-2 border-black bg-emerald-300 rounded-3xl"
      >
        <motion.div
          initial={{ x: 0, y: 0 }}
          variants={{
            hovered: { x: -8, y: -8 },
          }}
          className="-m-0.5 border-2 border-black bg-emerald-300 rounded-3xl"
        >
          <motion.div
            initial={{ x: 0, y: 0 }}
            variants={{
              hovered: { x: -8, y: -8 },
            }}
            className="relative -m-0.5 flex flex-col justify-between overflow-hidden border-2 border-black bg-emerald-300 p-3 sm:p-4 lg:p-6 rounded-3xl"
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg sm:text-xl font-semibold flex-1">{portfolio.name}</h2>
                <div className="text-right ml-4">
                  <p className="text-base sm:text-lg font-bold whitespace-nowrap">
                    ₹{monthlyFee} <span className="text-sm font-normal">/ mo</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    Annual, Billed Monthly
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                {homeDescription}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white rounded-2xl p-2 text-center">
                <p className="text-[10px] sm:text-xs text-gray-500">CAGR</p>
                <p className="text-sm sm:text-base font-semibold text-green-600">{metrics.cagr || "N/A"}</p>
              </div>
              <div className="bg-white rounded-2xl p-2 text-center">
                <p className="text-[10px] sm:text-xs text-gray-500">1Y Returns</p>
                <p className="text-sm sm:text-base font-semibold text-green-600">{metrics.oneYearGains || "N/A"}</p>
              </div>
              <div className="bg-white rounded-2xl p-2 text-center">
                <p className="text-[10px] sm:text-xs text-gray-500">Min. Investment</p>
                <p className="text-sm sm:text-base font-semibold">₹{monthlyFee * 12}/-</p>
              </div>
              <div className="bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                <p className="text-[10px] sm:text-xs text-blue-600 font-medium mb-1">Methodology</p>
                <div className="flex gap-3">
                  {methodologyLink && (
                    <a href={methodologyLink} target="_blank" rel="noopener noreferrer">
                      <FiBookOpen className="text-black hover:opacity-80 transition-opacity w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  <FaYoutube className="text-black hover:opacity-80 transition-opacity w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>

            {/* Buy Button */}
            <div className="mt-3 sm:mt-4">
              <button 
                onClick={onBuyNow}
                className="w-full border-2 border-black bg-white px-3 py-2 sm:py-2.5 text-center font-medium text-black transition-all duration-300 ease-in-out rounded-2xl hover:bg-gray-50 text-sm sm:text-base"
              >
                <span className={`mr-1 transition-opacity duration-300 ease-in-out ${isHovered ? "inline" : "hidden"}`}>
                  Let's Go
                </span>{" "}
                Buy Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
};