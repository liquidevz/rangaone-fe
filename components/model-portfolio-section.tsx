// components/model-portfolio-section.tsx
"use client";

import { useState, useEffect } from "react";
import { MotionConfig, motion } from "framer-motion";
import { FaYoutube } from "react-icons/fa";
import { FiBookOpen } from "react-icons/fi";
import { ShoppingCart, CreditCard } from "lucide-react";
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
        description: "Please log in to purchase a portfolio.",
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
      <section className="py-24 bg-white" id="portfolios">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-12 lg:mb-16 relative z-10">
            <SectionHeading
              title="Model Portfolios"
              subtitle="Smart investment strategies for every investor"
              className="mb-6"
            />
            <p className="text-center mx-auto text-lg mb-8 max-w-4xl">
              Model portfolios offer a simpler way to invest in a market that's filled with options and increasingly
              complex. You can consider a model portfolio as cost-efficient, diversified investment framework and a
              roadmap, where you choose the destination, and the model portfolio provides an investment path that you can
              follow.
            </p>
          </div>

          {/* Subscription Type Toggle - Only show when authenticated and has portfolios */}
          {isAuthenticated && portfolios.length > 0 && (
            <div className="flex justify-center mb-12">
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setSubscriptionType("monthly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    subscriptionType === "monthly"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSubscriptionType("quarterly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    subscriptionType === "quarterly"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Quarterly
                  <Badge variant="secondary" className="ml-2 bg-green-500 text-white text-xs">
                    Save 11%
                  </Badge>
                </button>
                <button
                  onClick={() => setSubscriptionType("yearly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    subscriptionType === "yearly"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2 bg-green-500 text-white text-xs">
                    Save 17%
                  </Badge>
                </button>
              </div>
            </div>
          )}

          {/* Portfolio Grid or Login Notice */}
          {!isAuthenticated ? (
            /* Login Notice for Non-authenticated Users */
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-200">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Access Our Model Portfolios
                </h3>
                <p className="text-gray-600 mb-6">
                  Sign in to explore our expertly curated investment portfolios designed to help you achieve your financial goals.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.href = '/login'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Sign In to View Portfolios
                  </Button>
                  <p className="text-sm text-gray-500">
                    Don't have an account? <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">Sign up here</a>
                  </p>
                </div>
              </div>
            </div>
          ) : portfolios.length === 0 ? (
            /* Empty State for Authenticated Users */
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No portfolios available at the moment.</p>
              <p className="text-sm text-gray-500">Please check back later or contact support if this issue persists.</p>
            </div>
          ) : (
            /* Portfolio Grid */
            <div className="mx-auto grid container grid-cols-1 gap-6 sm:grid-cols-2">
              {displayedPortfolios.map((portfolio, index) => {
                const colorClass = portfolioColors[index % portfolioColors.length];
                return (
                  <Card
                    key={portfolio._id}
                    portfolio={portfolio}
                    subscriptionType={subscriptionType}
                    className={colorClass}
                    onBuyNow={() => handleBuyNow(portfolio)}
                    onAddToCart={() => handleAddToCart(portfolio)}
                    getPrice={getPrice}
                    getHomeDescription={getHomeDescription}
                    getMethodologyLink={getMethodologyLink}
                    getPerformanceMetrics={getPerformanceMetrics}
                    getPortfolioDetails={getPortfolioDetails}
                    getPeriodLabel={getPeriodLabel}
                  />
                );
              })}
            </div>
          )}

          {/* View More Button */}
          {isAuthenticated && portfolios.length > 4 && !showAll && (
            <div className="text-center mt-12">
              <Button
                onClick={() => setShowAll(true)}
                size="lg"
                variant="outline"
                className="px-8 py-3"
              >
                View All Portfolios ({portfolios.length - 4} more)
              </Button>
            </div>
          )}

          {/* Show Less Button */}
          {isAuthenticated && showAll && portfolios.length > 4 && (
            <div className="text-center mt-12">
              <Button
                onClick={() => setShowAll(false)}
                size="lg"
                variant="outline"
                className="px-8 py-3"
              >
                Show Less
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Checkout Modal */}
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

interface CardProps {
  portfolio: UserPortfolio;
  subscriptionType: SubscriptionType;
  className?: string;
  onBuyNow: () => void;
  onAddToCart: () => void;
  getPrice: (portfolio: UserPortfolio) => number;
  getHomeDescription: (portfolio: UserPortfolio) => string;
  getMethodologyLink: (portfolio: UserPortfolio) => string;
  getPerformanceMetrics: (portfolio: UserPortfolio) => { cagr: string; oneYearGains: string; monthlyGains: string; };
  getPortfolioDetails: (portfolio: UserPortfolio) => { timeHorizon: string; rebalancing: string; benchmark: string; durationMonths: number; holdingsValue: number; };
  getPeriodLabel: () => string;
}

const Card: React.FC<CardProps> = ({
  portfolio,
  subscriptionType,
  className,
  onBuyNow,
  onAddToCart,
  getPrice,
  getHomeDescription,
  getMethodologyLink,
  getPerformanceMetrics,
  getPortfolioDetails,
  getPeriodLabel
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverStart = () => setIsHovered(true);
  const handleHoverEnd = () => setIsHovered(false);
  const handleHover = () => setIsHovered(!isHovered);

  const price = getPrice(portfolio);
  const homeDescription = getHomeDescription(portfolio);
  const methodologyLink = getMethodologyLink(portfolio);
  const { cagr, oneYearGains, monthlyGains } = getPerformanceMetrics(portfolio);
  const { timeHorizon, rebalancing, benchmark, durationMonths } = getPortfolioDetails(portfolio);

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
        className={twMerge("group w-full border-2 border-black", className)}
      >
        <motion.div
          initial={{ x: 0, y: 0 }}
          variants={{
            hovered: { x: -8, y: -8 },
          }}
          className={twMerge("-m-0.5 border-2 border-black", className)}
        >
          <motion.div
            initial={{ x: 0, y: 0 }}
            variants={{
              hovered: { x: -8, y: -8 },
            }}
            className={twMerge(
              "relative -m-0.5 flex flex-col justify-between overflow-hidden border-2 border-black p-8",
              className,
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">{portfolio.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  ₹{price} <span className="text-base font-normal">/ {getPeriodLabel()}</span>
                </p>
                <p className="text-xs text-gray-600">Min. Investment: ₹{portfolio.minInvestment.toLocaleString()}</p>
              </div>
            </div>

            {/* Description */}
            {homeDescription && (
              <p className="mt-4 text-sm text-gray-700">{homeDescription}</p>
            )}

            {/* Stats Section */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-sm">
              <div className="mt-4 flex flex-col items-center gap-2">
                <span className="text-blue-700 font-semibold text-sm">Methodology</span>
                <div className="flex gap-4">
                  <FiBookOpen className="text-black" size={25} />
                  <FaYoutube className="text-black" size={25} />
                </div>
              </div>
              <div className="rounded bg-white px-2 py-1">
                <p className="text-gray-500">CAGR</p>
                <p className="font-semibold text-green-600">{cagr}%</p>
              </div>
              <div className="rounded bg-white px-2 py-1">
                <p className="text-gray-500">1Y Returns</p>
                <p className="font-semibold text-green-600">{oneYearGains}%</p>
              </div>
              <div className="rounded bg-white px-2 py-1">
                <p className="text-gray-500">Monthly</p>
                <p className="font-semibold text-green-600">{monthlyGains}%</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Time Horizon:</span>
                <span className="font-medium">{timeHorizon}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rebalancing:</span>
                <span className="font-medium">{rebalancing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Benchmark:</span>
                <span className="font-medium">{benchmark}</span>
              </div>
            </div>

            {/* Methodology Link */}
            {methodologyLink && (
              <div className="mt-4">
                <a
                  href={methodologyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Methodology →
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={onBuyNow}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
              <Button
                onClick={onAddToCart}
                variant="outline"
                className="w-full hover:bg-gray-50"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
};