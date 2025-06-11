// components/modal-portfolio-list.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, CreditCard, TrendingUp, Calendar, DollarSign, Target, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { useCart } from "@/components/cart/cart-context";
import { userPortfolioService, UserPortfolio } from "@/services/user-portfolio.service";
import { CheckoutModal } from "@/components/checkout-modal";

type SubscriptionType = "monthly" | "quarterly" | "yearly";

export const ModalPortfolioList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<UserPortfolio | null>(null);
  const [portfolios, setPortfolios] = useState<UserPortfolio[]>([]);
  const [loading, setLoading] = useState(false);
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
    if (isOpen && portfolios.length === 0) {
      loadPortfolios();
    }
  }, [isOpen]);

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

  const getCAGR = (portfolio: UserPortfolio) => {
    // Look for CAGR in description
    const cagr = portfolio.description.find(d => 
      d.key.toLowerCase().includes("cagr") || d.key.toLowerCase().includes("return")
    );
    return cagr?.value || "N/A";
  };

  const get2YReturns = (portfolio: UserPortfolio) => {
    // Look for 2Y returns in description
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
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white" id="portfolios">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Expert-Curated Model Portfolios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover professionally managed investment strategies designed to maximize your returns while managing risk.
            </p>
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="bg-[#001633] hover:bg-[#002244] text-white px-8 py-4 text-lg"
            >
              Explore All Portfolios
            </Button>
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#001633] to-[#002244] text-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold">Model Portfolios</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Subscription Type Toggle */}
                <div className="flex justify-center">
                  <div className="flex items-center bg-white/10 rounded-full p-1">
                    <button
                      onClick={() => setSubscriptionType("monthly")}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        subscriptionType === "monthly"
                          ? "bg-white text-[#001633] shadow-sm"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setSubscriptionType("quarterly")}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        subscriptionType === "quarterly"
                          ? "bg-white text-[#001633] shadow-sm"
                          : "text-white/80 hover:text-white"
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
                          ? "bg-white text-[#001633] shadow-sm"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      Yearly
                      <Badge variant="secondary" className="ml-2 bg-green-500 text-white text-xs">
                        Save 17%
                      </Badge>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading portfolios...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                        >
                          {/* Portfolio Header */}
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                            <h3 className="text-lg font-bold mb-2">{portfolio.name}</h3>
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold">₹{price}</div>
                              <div className="text-sm opacity-90">{getPeriodLabel()}</div>
                            </div>
                            {savings && (
                              <div className="mt-2">
                                <Badge className="bg-green-500 text-white text-xs">
                                  Save ₹{savings.amount} ({savings.percentage}% off)
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Portfolio Content */}
                          <div className="p-4">
                            {/* Description */}
                            {homeDescription && (
                              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {homeDescription}
                              </p>
                            )}

                            {/* Key Metrics */}
                            <div className="space-y-3 mb-4">
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
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  View Methodology
                                </a>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-2">
                              <Button
                                onClick={() => handleBuyNow(portfolio)}
                                className="w-full bg-[#001633] hover:bg-[#002244] text-white"
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Buy Now - ₹{price}
                              </Button>
                              <Button
                                onClick={() => handleAddToCart(portfolio)}
                                variant="outline"
                                className="w-full border-[#001633] text-[#001633] hover:bg-[#001633] hover:text-white"
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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