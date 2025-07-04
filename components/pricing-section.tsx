// components/pricing-section.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [planType, setPlanType] = useState<PlanType>("basic");
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    type: "single" | "cart";
    bundle?: Bundle;
    isBasicPlan?: boolean;
    pricingType: SubscriptionType;
  }>({
    isOpen: false,
    type: "single",
    pricingType: "monthly",
  });

  // Basic plan pricing - Start with default and update if real bundle found
  // const [basicPlanBundle, setBasicPlanBundle] = useState<Bundle>();
  //   {
  //   _id: "basic-plan-id", // Dummy ID for basic plan
  //   name: "RangaOne Wealth Basic",
  //   description:
  //     "Essential investment guidance with quality stock recommendations for beginners",
  //   portfolios: [], // No portfolios for basic plan
  //   discountPercentage: 0,
  //   monthlyPrice: 300,
  //   quarterlyPrice: 1100, // ~8% discount
  //   yearlyPrice: 3000, // ~17% discount
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString(),
  //   category: "basic",
  // }

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const basicPlanFeatures = [
    "10-12 Quality Stock Recommendations",
    "5 Short Term/Swing Trades per month",
    "Timely Entry & Exit Alerts",
    "Real Time Market Updates",
    "Email & SMS Notifications",
    "Basic Customer Support",
    "Market Analysis Reports",
  ];

  const basicPlanExcludedFeatures = [
    "Premium Model Portfolios",
    "IPO Recommendations",
    "Direct Call Support",
    "Live Webinars & Sessions",
    "Advanced Analytics",
  ];

  useEffect(() => {
    loadBundles(); // Load bundles for both basic and premium plans
  }, []);

  const loadBundles = async () => {
    try {
      setLoading(true);
      const bundlesData = await bundleService.getAll();
      console.log(bundlesData);
      setBundles(bundlesData);

      // Check if there's a real basic plan bundle in the backend
      // const realBasicPlan = bundlesData.find(
      //   (bundle) => bundle.category === "basic"
      // );

      // if (realBasicPlan) {
      //   console.log("Found real basic plan bundle:", realBasicPlan);
      //   // Update the basic plan bundle with real data
      //   setBasicPlanBundle(realBasicPlan);
      // } else {
      //   console.log("No real basic plan found, using dummy bundle");
      // }
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

  // const getBunderPrice = (bundle: Bundle) => {
  //   switch (subscriptionType) {
  //     case "monthly":
  //       return basicPlanBundle.monthlyPrice;
  //     case "quarterly":
  //       return basicPlanBundle.quarterlyPrice;
  //     case "yearly":
  //       return basicPlanBundle.yearlyPrice;
  //     default:
  //       return basicPlanBundle.monthlyPrice;
  //   }
  // };

  // const getBundlePrice = (bundle: Bundle) => {
  //   switch (subscriptionType) {
  //     case "monthly":
  //       return bundle.monthlyPrice;
  //     case "quarterly":
  //       return bundle.quarterlyPrice;
  //     case "yearly":
  //       return bundle.yearlyPrice;
  //     default:
  //       return bundle.monthlyPrice;
  //   }
  // };

  // const getIndividualPortfolioPrice = (portfolio: any) => {
  //   const fee = portfolio.subscriptionFee?.find(
  //     (f: any) => f.type === subscriptionType
  //   );
  //   return fee?.price || 0;
  // };

  // const calculateBundleSavings = (bundle: Bundle) => {
  //   const bundlePrice = getBundlePrice(bundle);
  //   const individualTotal = bundle.portfolios.reduce((total, portfolio) => {
  //     return total + getIndividualPortfolioPrice(portfolio);
  //   }, 0);

  //   const savings = individualTotal - bundlePrice;
  //   const savingsPercentage =
  //     individualTotal > 0 ? Math.round((savings / individualTotal) * 100) : 0;

  //   return { savings, savingsPercentage, individualTotal };
  // };

  // const getSubscriptionLabel = () => {
  //   switch (subscriptionType) {
  //     case "monthly":
  //       return "per month";
  //     case "quarterly":
  //       return "per quarter";
  //     case "yearly":
  //       return "per year";
  //     default:
  //       return "per month";
  //   }
  // };

  // const getSavingsFromBasic = () => {
  //   const basicMonthly = basicPlanBundle.monthlyPrice;
  //   const currentPrice = getBasicPrice();

  //   switch (subscriptionType) {
  //     case "quarterly":
  //       const quarterlySavings = basicMonthly * 3 - currentPrice;
  //       return {
  //         amount: quarterlySavings,
  //         percentage: Math.round((quarterlySavings / (basicMonthly * 3)) * 100),
  //       };
  //     case "yearly":
  //       const yearlySavings = basicMonthly * 12 - currentPrice;
  //       return {
  //         amount: yearlySavings,
  //         percentage: Math.round((yearlySavings / (basicMonthly * 12)) * 100),
  //       };
  //     default:
  //       return { amount: 0, percentage: 0 };
  //   }
  // };

  // const handleBasicPlanPurchase = () => {
  //   if (!isAuthenticated) {
  //     toast({
  //       title: "Authentication Required",
  //       description: "Please log in to purchase a subscription plan.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   // Check if we have a real basic plan bundle (not the dummy one)
  //   if (basicPlanBundle._id === "basic-plan-id") {
  //     // Still using dummy bundle - show coming soon message
  //     toast({
  //       title: "Basic Plan Coming Soon",
  //       description:
  //         "Basic plan payment integration is being set up. Please contact support for assistance.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   // Use real basic plan bundle
  //   setCheckoutModal({
  //     isOpen: true,
  //     type: "single",
  //     bundle: basicPlanBundle,
  //     isBasicPlan: false, // Real bundle, not basic plan dummy
  //   });
  // };

  const handleBundlePurchase = (
    bundle: Bundle,
    pricingType: SubscriptionType
  ) => {
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
      isBasicPlan: bundle.category === "basic",
      pricingType,
    });
  };

  const BASIC_SELECTED_STYLES =
    "text-white font-bold rounded-lg py-3 w-28 relative bg-[linear-gradient(295.3deg,_#131859_11.58%,_rgba(24,_101,_123,_0.8)_108.02%)]";
  const PREMIUM_SELECTED_STYLES =
    "text-white font-bold rounded-lg py-3 w-28 relative bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)]";
  const DESELECTED_STYLES =
    "font-bold rounded-lg py-3 w-28 hover:bg-slate-100 transition-colors relative";

  return (
    <>
      <section className="py-24 bg-white" id="pricing">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Choose Your Plan"
            subtitle="Select the perfect plan for your investment journey"
          />

          <div className="flex items-center justify-center gap-3 mb-12">
            <button
              onClick={() => setPlanType("basic")}
              className={
                planType === "basic" ? BASIC_SELECTED_STYLES : DESELECTED_STYLES
              }
            >
              Basic
              {planType === "basic" && <BackgroundShift />}
            </button>
            <div className="relative">
              <button
                onClick={() => setPlanType("premium")}
                className={
                  planType === "premium"
                    ? PREMIUM_SELECTED_STYLES
                    : DESELECTED_STYLES
                }
              >
                Premium
                {planType === "premium" && <BackgroundShift />}
              </button>
              <CTAArrow />
            </div>
          </div>

          {/* Plan Type Toggle */}
          {/* <div className="flex justify-center mb-8">
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setPlanType("basic")}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${
                  planType === "basic"
                    ? "bg-[#1e3a8a] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Star className="w-4 h-4 inline mr-2" />
                Basic
              </button>
              <button
                onClick={() => setPlanType("premium")}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${
                  planType === "premium"
                    ? "bg-[#ffc107] text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Crown className="w-4 h-4 inline mr-2" />
                Premium
              </button>
            </div>
          </div> */}

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mx-auto relative z-10 container overflow-x-auto p-8">
            {bundles
              .filter((bundle) => bundle.category === planType)
              .map((bundle) =>
                // create a loop for each price type
                ["monthlyPrice", "quarterlyPrice"]
                  .filter(
                    (priceType) =>
                      bundle[priceType as keyof Bundle] !== undefined
                  )
                  .map((priceType) => (
                    <AnimatePresence mode="wait">
                      <div
                        className={`w-full p-6 border-[3px] rounded-xl transition-transform duration-300 ease-in-out hover:scale-105 ${
                          // selected === "M"
                          // ? "bg-[linear-gradient(295.3deg,_#131859_11.58%,_rgba(24,101,123,0.8)_108.02%)] text-white border-slate-300 shadow-[0px_4px_21.5px_8px_#00A6E8]"
                          "bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)] text-[#333333] border-[#333333] shadow-[0px_4px_21.5px_8px_#AD9000]"
                        }`}
                      >
                        <p className="text-2xl font-bold mb-2">
                          {priceType === "quarterlyPrice"
                            ? "Yearly"
                            : "Monthly"}
                        </p>
                        <div className="overflow-hidden ">
                          <motion.p
                            key={bundle._id + priceType}
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ ease: "linear", duration: 0.25 }}
                            className="text-6xl font-bold"
                          >
                            <span>
                              &#8377;
                              {bundle[priceType as keyof Bundle] as number}
                            </span>
                            <span className="font-normal text-xl">/month</span>
                          </motion.p>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {(() => {
                              if (priceType !== "quarterlyPrice")
                                return "(Flexible, but higher cost)";

                              const savings =
                                (bundle.monthlyPrice * 12 -
                                  bundle.quarterlyPrice * 12) /
                                (bundle.monthlyPrice * 0.12);

                              return `(save ${Math.round(savings)}%)`;
                            })()}
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-2 mb-2 ${
                            priceType === "quarterlyPrice" ? "" : "invisible"
                          }`}
                        >
                          <span className="text-lg">
                            Annual, Billed Monthly
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() =>
                            handleBundlePurchase(
                              bundle,
                              priceType === "monthlyPrice"
                                ? "monthly"
                                : "quarterly"
                            )
                          }
                          className={`w-full py-4  font-semibold rounded-lg uppercase ${
                            // selected === "M"
                            //   ? "bg-white text-black"
                            //   :
                            "bg-[#333333] text-[#D4AF37]"
                          }`}
                        >
                          Buy Now
                        </motion.button>
                      </div>
                    </AnimatePresence>
                  ))
              )}
          </div>

          {/* Subscription Type Toggle */}
          {/* <div className="flex justify-center mb-12">
            <div className="flex items-center bg-gray-50 rounded-full p-1 border">
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
                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  Save 11%
                </span>
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
                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div> */}

          {/* Basic Plan View */}
          {/* {planType === "basic" && (
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
                      <h3 className="text-2xl font-bold text-white">
                        {basicPlanBundle.name}
                      </h3>
                    </div>

                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-5xl font-bold text-white">
                        ₹{getBasicPrice()}
                      </span>
                      <span className="text-lg text-white ml-2">
                        {getSubscriptionLabel()}
                      </span>
                    </div>

                    {subscriptionType !== "monthly" && (
                      <div className="mb-6">
                        <span className="bg-green-500 text-white text-sm px-4 py-2 rounded-full">
                          Save ₹{getSavingsFromBasic().amount} (
                          {getSavingsFromBasic().percentage}% off)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className="text-white font-semibold text-center">
                      What's Included:
                    </h4>
                    {basicPlanFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-white text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mb-8 opacity-60">
                    <h4 className="text-gray-200 font-semibold text-center">
                      Not Included:
                    </h4>
                    {basicPlanExcludedFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm line-through">
                          {feature}
                        </span>
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
          )} */}

          {/* Premium Bundles View */}

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              {planType === "basic"
                ? "Perfect for individual investors starting their journey with quality stock recommendations."
                : "Premium bundles offer the best value with multiple portfolios and exclusive features."}
            </p>
            <p className="text-sm text-gray-500">
              All plans include email support, mobile app access, and regular
              market updates.
            </p>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() =>
          setCheckoutModal({
            isOpen: false,
            type: "single",
            pricingType: "monthly",
          })
        }
        type={checkoutModal.type}
        bundle={checkoutModal.bundle}
        subscriptionType={checkoutModal.pricingType}
      />
    </>
  );
}

const BackgroundShift = () => (
  <motion.span
    layoutId="bg-shift"
    className="absolute inset-0 bg-black rounded-lg -z-10"
  />
);

const CTAArrow = () => (
  <div className="absolute -right-[100px] top-2 sm:top-0">
    <motion.svg
      width="95"
      height="62"
      viewBox="0 0 95 62"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="scale-50 sm:scale-75"
      initial={{ scale: 0.7, rotate: 5 }}
      animate={{ scale: 0.75, rotate: 0 }}
      transition={{
        repeat: Infinity,
        repeatType: "mirror",
        duration: 1,
        ease: "easeOut",
      }}
    >
      <path
        d="M14.7705 15.8619C33.2146 15.2843 72.0772 22.1597 79.9754 54.2825"
        stroke="#7D7BE5"
        strokeWidth="3"
      />
      <path
        d="M17.7987 7.81217C18.0393 11.5987 16.4421 15.8467 15.5055 19.282C15.2179 20.3369 14.9203 21.3791 14.5871 22.4078C14.4728 22.7608 14.074 22.8153 13.9187 23.136C13.5641 23.8683 12.0906 22.7958 11.7114 22.5416C8.63713 20.4812 5.49156 18.3863 2.58664 15.9321C1.05261 14.6361 2.32549 14.1125 3.42136 13.0646C4.37585 12.152 5.13317 11.3811 6.22467 10.7447C8.97946 9.13838 12.7454 8.32946 15.8379 8.01289"
        stroke="#7D7BE5"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </motion.svg>
    <span className="block text-xs w-fit bg-indigo-500 text-white shadow px-1.5 py-0.5 rounded -mt-1 ml-4 -rotate-2 font-light italic">
      Save &#8377;&#8377;&#8377;
    </span>
  </div>
);
