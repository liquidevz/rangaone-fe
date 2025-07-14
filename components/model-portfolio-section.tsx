// components/model-portfolio-section.tsx
"use client";

import { useState, useEffect } from "react";
import { MotionConfig, motion } from "framer-motion";
import { FaYoutube } from "react-icons/fa";
import { FiBookOpen } from "react-icons/fi";
import { ShoppingCart, CreditCard, Check, Play, FileText } from "lucide-react";
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

// Updated colors to match the new design
const portfolioColors = [
  "bg-blue-200",
  "bg-orange-100", 
  "bg-purple-200",
  "bg-red-200",
  "bg-green-200",
  "bg-yellow-100",
  "bg-indigo-200",
  "bg-pink-200",
  "bg-teal-200",
  "bg-rose-200",
  "bg-cyan-200",
  "bg-amber-100"
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

  const handleBuyNow = async (portfolio: UserPortfolio) => {
    try {
      await addToCart(portfolio._id);
      toast({
        title: "Added to Cart",
        description: `${portfolio.name} has been added to your cart.`,
      });
      
      // Redirect to cart after adding
      setTimeout(() => {
        window.location.href = "/cart";
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add portfolio to cart.",
        variant: "destructive",
      });
    }
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading portfolios...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="py-4 sm:py-6 bg-[#fefcea]">
        <div className="mb-4 sm:mb-6 relative z-10 container mx-auto px-3 sm:px-4">
          <SectionHeading
            title="Model Portfolios"
            subtitle="Smart investment strategies for every investor"
            className="mb-3 sm:mb-4"
          />
          <p className="text-center mx-auto text-sm sm:text-base mb-4 max-w-4xl">
            Model portfolios offer a simpler way to invest in a market that's filled with options and increasingly
            complex. You can consider a model portfolio as cost-efficient, diversified investment framework and a
            roadmap, where you choose the destination, and the model portfolio provides an investment path that you can
            follow.
          </p>
        </div>

        <section className="py-4 sm:py-6 px-3 sm:px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg pt-8 pb-4 px-3 sm:px-4 relative border-t-4 border-[#2a2e86] hover:shadow-xl transition-shadow duration-300"
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full border-2 border-[#2a2e86] shadow-md">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                  />
                </div>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-[#2a2e86] font-bold text-sm sm:text-base text-center mt-1 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-700 text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-[#fefcea] px-3 sm:px-4 py-4 sm:py-6">
        <div className="mx-auto container grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          {portfolios.map((portfolio, index) => (
            <PortfolioCard
              key={portfolio._id}
              portfolio={portfolio}
              colorClass={portfolioColors[index % portfolioColors.length]}
              onBuyNow={() => handleBuyNow(portfolio)}
            />
          ))}
        </div>
      </section>
    </>
  );
};

interface PortfolioCardProps {
  portfolio: UserPortfolio;
  colorClass: string;
  onBuyNow: () => void;
}

const PortfolioCard = ({ portfolio, colorClass, onBuyNow }: PortfolioCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // API data extraction using existing service methods
  const quarterlyFee = userPortfolioService.getPriceByType(portfolio.subscriptionFee, "quarterly");
  const monthlyFee = userPortfolioService.getPriceByType(portfolio.subscriptionFee, "monthly");
  const methodologyLink = userPortfolioService.getDescriptionByKey(portfolio.description, "methodology PDF link");
  const homeDescription = userPortfolioService.getDescriptionByKey(portfolio.description, "home card");
  const metrics = userPortfolioService.getPerformanceMetrics(portfolio);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={isHovered ? "hovered" : "initial"}
      initial="initial"
      className="relative"
    >
      {/* Back shadow layer */}
      <motion.div
        variants={{
          initial: { x: 0, y: 0, boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)" },
          hovered: { x: 16, y: 16, boxShadow: "0 12px 32px 0 rgba(0,0,0,0.18)" },
        }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className={`absolute inset-0 ${colorClass} border-2 border-black rounded-xl pointer-events-none`}
        style={{ zIndex: 0 }}
      />
      
      {/* Middle shadow layer */}
      <motion.div
        variants={{
          initial: { x: 0, y: 0, boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)" },
          hovered: { x: 8, y: 8, boxShadow: "0 8px 24px 0 rgba(0,0,0,0.12)" },
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`absolute inset-0 ${colorClass} border-2 border-black rounded-xl pointer-events-none`}
        style={{ zIndex: 1 }}
      />
      
      {/* Main card */}
      <motion.div
        whileHover={{ scale: 1.035, boxShadow: "0 16px 40px 0 rgba(0,0,0,0.18)" }}
        className={`relative ${colorClass} border-2 border-black rounded-xl p-4 sm:p-5 flex flex-col h-full font-sans z-10`}
        style={{ zIndex: 2 }}
      >
        <div className="flex-grow">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-2 sm:mb-0">
              {portfolio.name}
            </h2>
            <div className="text-left sm:text-right flex-shrink-0 sm:ml-4">
              <p className="text-lg sm:text-xl font-bold whitespace-nowrap">
                ₹{(quarterlyFee || monthlyFee).toLocaleString()} / Qua
              </p>
              <p className="text-xs text-gray-700">Annual, Billed Quarterly</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-800 mb-4 text-sm sm:text-base line-clamp-2">
            {homeDescription}
          </p>

          {/* Methodology and Min Investment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start mb-4">
            <div className="sm:pr-2">
              <h3 className="text-blue-700 font-bold text-base">Methodology</h3>
              <div className="flex items-center space-x-2 mt-2">
                {methodologyLink && (
                  <a
                    href={methodologyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    title="Read Methodology"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                    </div>
                  </a>
                )}
                <a href="#" target="_blank" rel="noopener noreferrer" className="block" title="Watch Video">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="white" />
                  </div>
                </a>
              </div>
            </div>
            
            <div className="sm:pl-2 border-t sm:border-t-0 sm:border-l border-gray-400 pt-3 sm:pt-0">
              <h3 className="font-bold text-base text-black">Min. Investment</h3>
              <div className="text-lg sm:text-xl font-bold text-black mt-1">
                ₹{portfolio.minInvestment?.toLocaleString() || (monthlyFee * 12).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Single Buy Now Button */}
        <div className="mt-auto">
          <button
            onClick={onBuyNow}
            className="w-full border-2 border-black bg-amber-50 px-4 py-2.5 text-center font-bold text-black transition-all duration-300 ease-in-out rounded-lg hover:bg-amber-100 text-base flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className={`transition-opacity duration-300 ease-in-out ${isHovered ? "inline" : "hidden"}`}>
              Let's Go
            </span>
            Buy Now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};