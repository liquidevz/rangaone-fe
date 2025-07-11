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
      handleAddToCart(portfolio);
      toast({
        title: "Redirecting to Cart",
        description: "You'll be prompted to sign in during checkout.",
      });
      setTimeout(() => {
        window.location.href = "/cart";
      }, 1000);
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
                  colorClass={portfolioColors[index % portfolioColors.length]}
                  onBuyNow={() => handleBuyNow(portfolio)}
                  onAddToCart={() => handleAddToCart(portfolio)}
                />
              ))}
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
  colorClass: string;
  onBuyNow: () => void;
  onAddToCart: () => void;
}

const PortfolioCard = ({ portfolio, colorClass, onBuyNow, onAddToCart }: PortfolioCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverStart = () => setIsHovered(true);
  const handleHoverEnd = () => setIsHovered(false);
  const handleHover = () => setIsHovered(!isHovered);

  const monthlyFee = portfolio.subscriptionFee.find(fee => fee.type === "monthly")?.price || 0;
  const quarterlyFee = portfolio.subscriptionFee.find(fee => fee.type === "quarterly")?.price || 0;
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
        className={`group w-full border-2 border-black ${colorClass} rounded-3xl`}
      >
        <motion.div
          initial={{ x: 0, y: 0 }}
          variants={{
            hovered: { x: -8, y: -8 },
          }}
          className={`-m-0.5 border-2 border-black ${colorClass} rounded-3xl`}
        >
          <motion.div
            initial={{ x: 0, y: 0 }}
            variants={{
              hovered: { x: -8, y: -8 },
            }}
            className={`relative -m-0.5 flex flex-col justify-between overflow-hidden border-2 border-black ${colorClass} p-3 sm:p-4 lg:p-6 rounded-3xl`}
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg sm:text-xl font-semibold flex-1">{portfolio.name}</h2>
                <div className="text-right ml-4">
                  <p className="text-base sm:text-lg font-bold whitespace-nowrap">
                    ₹{quarterlyFee || monthlyFee} <span className="text-sm font-normal">/ Qua</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    Annual, Billed Quarterly
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                {homeDescription}
              </p>
            </div>

            {/* Methodology and Min Investment Section */}
            <div className="mt-3 sm:mt-4 mb-3 sm:mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600 font-semibold text-xs sm:text-sm">
                    Methodology
                  </div>
                  <div className="flex items-center space-x-2">
                    {methodologyLink && (
                      <a href={methodologyLink} target="_blank" rel="noopener noreferrer">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 transition-colors">
                          <FiBookOpen className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      </a>
                    )}
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded flex items-center justify-center hover:bg-red-700 transition-colors">
                      <FaYoutube className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-gray-600">Min. Investment</div>
                  <div className="text-sm sm:text-base font-bold text-black">
                    ₹{portfolio.minInvestment?.toLocaleString() || (monthlyFee * 12).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto space-y-2">
              <button 
                onClick={onBuyNow}
                className="w-full border-2 border-black bg-white px-3 py-2 sm:py-2.5 text-center font-medium text-black transition-all duration-300 ease-in-out rounded-2xl hover:bg-gray-50 text-sm sm:text-base"
              >
                <span className={`mr-1 transition-opacity duration-300 ease-in-out ${isHovered ? "inline" : "hidden"}`}>
                  Let's Go
                </span>{" "}
                Buy Now
              </button>
              
              <button 
                onClick={onAddToCart}
                className="w-full border-2 border-black bg-transparent px-3 py-2 sm:py-2.5 text-center font-medium text-black transition-all duration-300 ease-in-out rounded-2xl hover:bg-black hover:text-white text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
};