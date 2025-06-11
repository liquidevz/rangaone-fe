// components/model-portfolio-section.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Calendar, Target, ShoppingCart, CreditCard, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { useCart } from "@/components/cart/cart-context";
import { userPortfolioService, UserPortfolio } from "@/services/user-portfolio.service";
import { CheckoutModal } from "@/components/checkout-modal";

type SubscriptionType = "monthly" | "quarterly" | "yearly";

export const ModelPortfolioSection = () => {
  const [portfolios, setPortfolios] = useState<UserPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
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
      // Show only first 3 portfolios for the section
      setPortfolios(portfoliosData.slice(0, 3));
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

  const getCAGR = (portfolio: UserPortfolio) => {
    const cagr = portfolio.description.find(d => 
      d.key.toLowerCase().includes("cagr") || d.key.toLowerCase().includes("return")
    );
    return cagr?.value || "N/A";
  };

  const get2YReturns = (portfolio: UserPortfolio) => {
    const returns = portfolio.description.find(d => 
      d.key.toLowerCase().includes("2y") || d.key.toLowerCase().includes("2 year")
    );
    return returns?.value || "N/A";
  };

  const getPeriodLabel = () => {
    switch (subscriptionType) {
      case "yearly": return "per year";
      case "quarterly": return "per quarter";
      default: return "per month";
    }
  };

  const getSavingsFromMonthly = (portfolio: UserPortfolio) => {
    const monthlyPrice = userPortfolioService.getPriceByType(portfolio.subscriptionFee, "monthly");
    const currentPrice = getPrice(portfolio);

    switch (subscriptionType) {
      case "quarterly":
        const quarterlySavings = (monthlyPrice * 3) - currentPrice;
        return quarterlySavings > 0 ? { amount: quarterlySavings, percentage: Math.round((quarterlySavings / (monthlyPrice * 3)) * 100) } : null;
      case "yearly":
        const yearlySavings = (monthlyPrice * 12) - currentPrice;
        return yearlySavings > 0 ? { amount: yearlySavings, percentage: Math.round((yearlySavings / (monthlyPrice * 12)) * 100) } : null;
      default:
        return null;
    }
  };

  return (
    <>
      <section className="py-54 bg-white" id="model-portfolios">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Model Portfolios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Expertly crafted investment strategies designed to help you achieve your financial goals with optimal risk-return balance.
            </p>

            {/* Subscription Type Toggle */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setSubscriptionType("monthly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    subscriptionType === "monthly"
                      ? "bg-[#001633] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSubscriptionType("quarterly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    subscriptionType === "quarterly"
                      ? "bg-[#001633] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Quarterly
                  <Badge variant="secondary" className="ml-2 bg-green-500 text-white text-xs">
                    11% off
                  </Badge>
                </button>
                <button
                  onClick={() => setSubscriptionType("yearly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    subscriptionType === "yearly"
                      ? "bg-[#001633] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2 bg-green-500 text-white text-xs">
                    17% off
                  </Badge>
                </button>
              </div>
            </div>
          </div>

          {/* Portfolio Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading portfolios...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {portfolios.map((portfolio, index) => {
                const price = getPrice(portfolio);
                const homeDescription = getHomeDescription(portfolio);
                const methodologyLink = getMethodologyLink(portfolio);
                const cagr = getCAGR(portfolio);
                const returns2Y = get2YReturns(portfolio);
                const savings = getSavingsFromMonthly(portfolio);

                return (
                  <motion.div
                    key={portfolio._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Portfolio Header */}
                    <div className="bg-gradient-to-r from-[#001633] to-[#002244] p-6 text-white">
                      <h3 className="text-xl font-bold mb-3">{portfolio.name}</h3>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-3xl font-bold">₹{price}</span>
                        <span className="text-sm ml-2 opacity-90">{getPeriodLabel()}</span>
                      </div>
                      {savings && (
                        <div className="text-center">
                          <Badge className="bg-green-500 text-white text-xs">
                            Save ₹{savings.amount} ({savings.percentage}% off)
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Portfolio Content */}
                    <div className="p-6">
                      {/* Description */}
                      {homeDescription && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {homeDescription}
                        </p>
                      )}

                      {/* Key Metrics */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-600">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            CAGR:
                          </span>
                          <span className="font-semibold text-green-600">{cagr}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            2Y Returns:
                          </span>
                          <span className="font-semibold text-blue-600">{returns2Y}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Min Investment:
                          </span>
                          <span className="font-semibold">₹{portfolio.minInvestment.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-600">
                            <Target className="w-4 h-4 mr-2" />
                            Duration:
                          </span>
                          <span className="font-semibold">{portfolio.durationMonths} months</span>
                        </div>
                      </div>

                      {/* Methodology Link */}
                      {methodologyLink && (
                        <div className="mb-4">
                          <a
                            href={methodologyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#001633] hover:text-[#002244] text-sm font-medium flex items-center transition-colors"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            View Methodology
                          </a>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button
                          onClick={() => handleBuyNow(portfolio)}
                          className="w-full bg-[#001633] hover:bg-[#002244] text-white font-medium py-3"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Buy Now - ₹{price}
                        </Button>
                        <Button
                          onClick={() => handleAddToCart(portfolio)}
                          variant="outline"
                          className="w-full border-[#001633] text-[#001633] hover:bg-[#001633] hover:text-white font-medium py-3"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Showing {portfolios.length} of our featured portfolios. Explore our complete collection for more investment opportunities.
            </p>
            <Button
              onClick={() => {
                // Scroll to the modal-portfolio-list section or trigger the modal
                const portfolioSection = document.querySelector('#portfolios');
                if (portfolioSection) {
                  portfolioSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              size="lg"
              variant="outline"
              className="border-[#001633] text-[#001633] hover:bg-[#001633] hover:text-white px-8 py-3"
            >
              View All Portfolios
            </Button>
          </div>
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