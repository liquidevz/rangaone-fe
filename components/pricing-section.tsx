// components/pricing-section.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, X, Star, Crown, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { bundleService, Bundle } from "@/services/bundle.service";
import { CheckoutModal } from "./checkout-modal";
import { SectionHeading } from "@/components/ui/section-heading";

type SubscriptionType = "monthly" | "quarterly" | "yearly";
type PlanType = "basic" | "premium";

export default function PricingSection() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>("monthly");
  const [planType, setPlanType] = useState<PlanType>("basic");
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    type: "single" | "cart";
    bundle?: Bundle;
    isBasicPlan?: boolean;
  }>({
    isOpen: false,
    type: "single",
  });

  // Basic plan pricing - Start with default and update if real bundle found
  const [basicPlanBundle, setBasicPlanBundle] = useState<Bundle>({
    _id: "basic-plan-id", // Dummy ID for basic plan
    name: "RangaOne Wealth Basic",
    description: "Essential investment guidance with quality stock recommendations for beginners",
    portfolios: [], // No portfolios for basic plan
    discountPercentage: 0,
    monthlyPrice: 300,
    quarterlyPrice: 1100, // ~8% discount
    yearlyPrice: 3000, // ~17% discount
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const basicPlanFeatures = [
    "10-12 Quality Stock Recommendations",
    "5 Short Term/Swing Trades per month",
    "Timely Entry & Exit Alerts",
    "Real Time Market Updates",
    "Email & SMS Notifications",
    "Basic Customer Support",
    "Market Analysis Reports"
  ];

  const basicPlanExcludedFeatures = [
    "Premium Model Portfolios",
    "IPO Recommendations",
    "Direct Call Support",
    "Live Webinars & Sessions",
    "Advanced Analytics"
  ];

  useEffect(() => {
    loadBundles(); // Load bundles for both basic and premium plans
  }, [planType]);

  const loadBundles = async () => {
    try {
      setLoading(true);
      const bundlesData = await bundleService.getAll();
      setBundles(bundlesData);
      
      // Check if there's a real basic plan bundle in the backend
      const realBasicPlan = bundlesData.find(bundle => 
        bundle.name.toLowerCase().includes('basic') || 
        bundle.description.toLowerCase().includes('basic')
      );
      
      if (realBasicPlan) {
        console.log("Found real basic plan bundle:", realBasicPlan);
        // Update the basic plan bundle with real data
        setBasicPlanBundle(realBasicPlan);
      } else {
        console.log("No real basic plan found, using dummy bundle");
      }
    } catch (error) {
      console.error("Failed to load bundles:", error);
      toast({
        title: "Error",
        description: "Failed to load bundles. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBasicPrice = () => {
    switch (subscriptionType) {
      case "monthly":
        return basicPlanBundle.monthlyPrice;
      case "quarterly":
        return basicPlanBundle.quarterlyPrice;
      case "yearly":
        return basicPlanBundle.yearlyPrice;
      default:
        return basicPlanBundle.monthlyPrice;
    }
  };

  const getBundlePrice = (bundle: Bundle) => {
    switch (subscriptionType) {
      case "monthly":
        return bundle.monthlyPrice;
      case "quarterly":
        return bundle.quarterlyPrice;
      case "yearly":
        return bundle.yearlyPrice;
      default:
        return bundle.monthlyPrice;
    }
  };

  const getIndividualPortfolioPrice = (portfolio: any) => {
    const fee = portfolio.subscriptionFee?.find((f: any) => f.type === subscriptionType);
    return fee?.price || 0;
  };

  const calculateBundleSavings = (bundle: Bundle) => {
    const bundlePrice = getBundlePrice(bundle);
    const individualTotal = bundle.portfolios.reduce((total, portfolio) => {
      return total + getIndividualPortfolioPrice(portfolio);
    }, 0);

    const savings = individualTotal - bundlePrice;
    const savingsPercentage = individualTotal > 0 ? Math.round((savings / individualTotal) * 100) : 0;

    return { savings, savingsPercentage, individualTotal };
  };

  const getSubscriptionLabel = () => {
    switch (subscriptionType) {
      case "monthly": return "per month";
      case "quarterly": return "per quarter";
      case "yearly": return "per year";
      default: return "per month";
    }
  };

  const getSavingsFromBasic = () => {
    const basicMonthly = basicPlanBundle.monthlyPrice;
    const currentPrice = getBasicPrice();

    switch (subscriptionType) {
      case "quarterly":
        const quarterlySavings = (basicMonthly * 3) - currentPrice;
        return { amount: quarterlySavings, percentage: Math.round((quarterlySavings / (basicMonthly * 3)) * 100) };
      case "yearly":
        const yearlySavings = (basicMonthly * 12) - currentPrice;
        return { amount: yearlySavings, percentage: Math.round((yearlySavings / (basicMonthly * 12)) * 100) };
      default:
        return { amount: 0, percentage: 0 };
    }
  };

  const handleBasicPlanPurchase = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase a subscription plan.",
        variant: "destructive",
      });
      return;
    }

    // Check if we have a real basic plan bundle (not the dummy one)
    if (basicPlanBundle._id === "basic-plan-id") {
      // Still using dummy bundle - show coming soon message
      toast({
        title: "Basic Plan Coming Soon",
        description: "Basic plan payment integration is being set up. Please contact support for assistance.",
        variant: "destructive",
      });
      return;
    }

    // Use real basic plan bundle
    setCheckoutModal({
      isOpen: true,
      type: "single",
      bundle: basicPlanBundle,
      isBasicPlan: false // Real bundle, not basic plan dummy
    });
  };

  const handleBundlePurchase = (bundle: Bundle) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase a subscription plan.",
        variant: "destructive",
      });
      return;
    }

    setCheckoutModal({
      isOpen: true,
      type: "single",
      bundle,
    });
  };

  return (
    <>
      <section className="py-24 bg-white" id="pricing">
        <div className="container mx-auto px-4">
          <SectionHeading title="Choose Your Plan" subtitle="Select the perfect plan for your investment journey" />

          {/* Plan Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setPlanType("basic")}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${planType === "basic"
                    ? "bg-[#1e3a8a] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Star className="w-4 h-4 inline mr-2" />
                Basic
              </button>
              <button
                onClick={() => setPlanType("premium")}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${planType === "premium"
                    ? "bg-[#ffc107] text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Crown className="w-4 h-4 inline mr-2" />
                Premium
              </button>
            </div>
          </div>

          {/* Subscription Type Toggle */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center bg-gray-50 rounded-full p-1 border">
              <button
                onClick={() => setSubscriptionType("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${subscriptionType === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSubscriptionType("quarterly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${subscriptionType === "quarterly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Quarterly
                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  Save 11%
                </span>
              </button>
              <button
                onClick={() => setSubscriptionType("yearly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${subscriptionType === "yearly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Yearly
                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Basic Plan View */}
          {planType === "basic" && (
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-xl overflow-hidden shadow-xl border border-gray-200 relative"
              >
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Star className="h-6 w-6 text-white" />
                      <h3 className="text-2xl font-bold text-white">{basicPlanBundle.name}</h3>
                    </div>

                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-5xl font-bold text-white">₹{getBasicPrice()}</span>
                      <span className="text-lg text-white ml-2">{getSubscriptionLabel()}</span>
                    </div>

                    {subscriptionType !== "monthly" && (
                      <div className="mb-6">
                        <span className="bg-green-500 text-white text-sm px-4 py-2 rounded-full">
                          Save ₹{getSavingsFromBasic().amount} ({getSavingsFromBasic().percentage}% off)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className="text-white font-semibold text-center">What's Included:</h4>
                    {basicPlanFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-white text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mb-8 opacity-60">
                    <h4 className="text-gray-200 font-semibold text-center">Not Included:</h4>
                    {basicPlanExcludedFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm line-through">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleBasicPlanPurchase}
                    className="w-full bg-white text-[#1e3a8a] font-bold py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg"
                  >
                    Buy Now - ₹{getBasicPrice()}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Premium Bundles View */}
          {planType === "premium" && (
            <>
              {loading ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading premium bundles...</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {bundles.map((bundle, index) => {
                    const { savings, savingsPercentage, individualTotal } = calculateBundleSavings(bundle);
                    const bundlePrice = getBundlePrice(bundle);

                    return (
                      <motion.div
                        key={bundle._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-gradient-to-br from-[#ffc107] to-[#ffeb3b] rounded-xl overflow-hidden shadow-xl border border-gray-200 relative"
                      >
                        <div className="p-6">
                          <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-2 mb-4">
                              <Crown className="h-6 w-6 text-gray-900" />
                              <h3 className="text-xl font-bold text-gray-900">{bundle.name}</h3>
                            </div>

                            <div className="flex items-baseline justify-center mb-2">
                              <span className="text-4xl font-bold text-gray-900">₹{bundlePrice}</span>
                              <span className="text-lg text-gray-700 ml-2">{getSubscriptionLabel()}</span>
                            </div>

                            {savings > 0 && (
                              <div className="text-center mb-4">
                                <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full inline-block mb-1">
                                  <TrendingUp className="w-4 h-4 inline mr-1" />
                                  Save ₹{savings} ({savingsPercentage}% off)
                                </div>
                                <p className="text-xs text-gray-600">vs buying individually</p>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-700 text-sm mb-6 text-center">{bundle.description}</p>

                          {/* Portfolio Breakdown */}
                          <div className="bg-white/50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <Zap className="w-4 h-4 mr-2" />
                              Included Portfolios:
                            </h4>
                            <div className="space-y-2">
                              {bundle.portfolios.map((portfolio, pIndex) => {
                                const individualPrice = getIndividualPortfolioPrice(portfolio);
                                return (
                                  <div key={pIndex} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-800">{portfolio.name}</span>
                                    <span className="text-gray-600">₹{individualPrice}</span>
                                  </div>
                                );
                              })}
                              <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between items-center font-semibold">
                                  <span className="text-gray-700">Individual Total:</span>
                                  <span className="text-gray-700 line-through">₹{individualTotal}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-green-700">
                                  <span>Bundle Price:</span>
                                  <span>₹{bundlePrice}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Additional Benefits */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-gray-900 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-900 text-sm">All portfolio recommendations & alerts</span>
                            </div>
                            <div className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-gray-900 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-900 text-sm">Advanced analytics & insights</span>
                            </div>
                            <div className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-gray-900 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-900 text-sm">Priority customer support</span>
                            </div>
                            <div className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-gray-900 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-900 text-sm">Quarterly rebalancing alerts</span>
                            </div>
                          </div>

                          {/* Single Buy Now Button */}
                          <Button
                            onClick={() => handleBundlePurchase(bundle)}
                            className="w-full bg-gray-900 text-[#ffc107] font-bold py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg"
                          >
                            Buy Now - Save ₹{savings}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              {planType === "basic"
                ? "Perfect for individual investors starting their journey with quality stock recommendations."
                : "Premium bundles offer the best value with multiple portfolios and exclusive features."
              }
            </p>
            <p className="text-sm text-gray-500">
              All plans include email support, mobile app access, and regular market updates.
            </p>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false, type: "single" })}
        type={checkoutModal.type}
        bundle={checkoutModal.bundle}
        subscriptionType={subscriptionType}
      />
    </>
  );
}