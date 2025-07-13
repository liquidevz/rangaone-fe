// components/pricing-section.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ShoppingCart, ChevronRight, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { useCart } from "@/components/cart/cart-context";
import { bundleService, Bundle } from "@/services/bundle.service";
import { CheckoutModal } from "./checkout-modal";
import Link from "next/link";

type SubscriptionType = "monthly" | "quarterly" | "yearly";

const wealthPlans = [
  {
    id: 1,
    planName: "Basic",
    href: "/basic-subscription",
    isPremium: false,
    benefits: [
      { text: "Get 10-12 Quality Stocks", checked: true },
      { text: "Get 5 Short Term/Swing Trades", checked: true },
      { text: "Timely Alert For Entry & Exit", checked: true },
      { text: "Real Time Market Updates", checked: true },
      { text: "2 Model Portfolios", checked: false },
      { text: "IPO Recommendations", checked: false },
      { text: "Call Support", checked: false },
      { text: "Free Live Webinar", checked: false },
    ],
  },
  {
    id: 2,
    planName: "Premium",
    href: "/premium-subscription",
    isPremium: true,
    badge: "POPULAR",
    benefits: [
      { text: "Get 20-25 High Growth Stocks", checked: true },
      { text: "Get 10 Short Term/Swing Trades", checked: true },
      { text: "Timely Alert For Entry & Exit", checked: true },
      { text: "Real Time Market Updates", checked: true },
      { text: "2 Model Portfolios", checked: true },
      { text: "IPO Recommendations", checked: true },
      { text: "Call Support", checked: true },
      { text: "Free Live Webinar", checked: true },
    ],
  },
];

export default function PricingSection() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<"M" | "A">("M");
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

  const { isAuthenticated } = useAuth();
  const { addBundleToCart, hasBundle } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      setLoading(true);
      const bundlesData = await bundleService.getAll();
      setBundles(bundlesData);
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

  const handleBundlePurchase = (bundle: Bundle, pricingType: SubscriptionType) => {
    setCheckoutModal({
      isOpen: true,
      type: "single",
      bundle,
      isBasicPlan: bundle.category === "basic",
      pricingType,
    });
  };

  const handleAddToCart = async (bundle: Bundle, pricingType: SubscriptionType) => {
    try {
      await addBundleToCart(bundle._id, pricingType);
      toast({
        title: "Added to Cart",
        description: `${bundle.name} (${pricingType}) has been added to your cart.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add bundle to cart.",
        variant: "destructive",
      });
    }
  };

  const BASIC_SELECTED_STYLES =
    "text-white font-bold rounded-lg py-3 w-28 relative bg-[linear-gradient(295.3deg,_#131859_11.58%,_rgba(24,_101,_123,_0.8)_108.02%)]";
  const PREMIUM_SELECTED_STYLES =
    "text-white font-bold rounded-lg py-3 w-28 relative bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)]";
  const DESELECTED_STYLES =
    "font-bold rounded-lg py-3 w-28 hover:bg-slate-100 transition-colors relative";

  return (
    <section className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 lg:px-8 py-16 lg:py-24 relative overflow-hidden" id="pricing">
      {/* Header */}
      <div className="text-center mb-12 lg:mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4 font-times">
            RANGAONE WEALTH
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full mb-6"></div>
          <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Welcome to Rangaone Wealth – your way to smarter investing and bigger gains! 
            Stay ahead and make every move impactful—join now and start building unstoppable wealth! 🚀
          </p>
          
          {/* Plan Selector */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setSelected("M")}
              className={selected === "M" ? BASIC_SELECTED_STYLES : DESELECTED_STYLES}
            >
              Basic
              {selected === "M" && <BackgroundShift />}
            </button>
            <div className="relative">
              <button
                onClick={() => setSelected("A")}
                className={selected === "A" ? PREMIUM_SELECTED_STYLES : DESELECTED_STYLES}
              >
                Premium
                {selected === "A" && <BackgroundShift />}
              </button>
              <CTAArrow />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pricing Cards with Prices */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mx-auto relative z-10 container max-w-4xl mb-16">
        {bundles
          .filter((bundle) => bundle.category === (selected === "M" ? "basic" : "premium"))
          .map((bundle) =>
            ["quarterlyPrice", "monthlyPrice"] // Swapped order: yearly first, monthly second
              .filter((priceType) => bundle[priceType as keyof Bundle] !== undefined)
              .map((priceType) => {
                const subscriptionType = priceType === "monthlyPrice" ? "monthly" : "quarterly";
                const isInCart = hasBundle(bundle._id);
                const isYearly = priceType === "quarterlyPrice";
                const isPremium = selected === "A";
                
                return (
                  <AnimatePresence mode="wait" key={`${bundle._id}-${priceType}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.4 }}
                      className={`w-full p-6 ${isYearly ? 'border-[3px]' : 'border-0'} rounded-xl transition-transform duration-300 ease-in-out hover:scale-105 ${
                        isPremium
                          ? isYearly
                            ? "bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)] text-[#333333] border-[#333333] shadow-[0px_4px_21.5px_8px_#AD9000]"
                            : "bg-[#333333] shadow-[0px_4px_21.5px_8px_#333333]"
                          : isYearly
                            ? "bg-[linear-gradient(295.3deg,_#131859_11.58%,_rgba(24,101,123,0.8)_108.02%)] text-white border-slate-300 shadow-[0px_4px_21.5px_8px_#00A6E8]"
                            : "bg-[linear-gradient(295.3deg,_#131859_11.58%,_rgba(24,101,123,0.8)_108.02%)] text-white shadow-[0px_4px_21.5px_8px_#00A6E8]"
                      }`}
                    >
                      <p className={`text-2xl font-bold mb-2 ${
                        isPremium && !isYearly ? "text-transparent bg-clip-text bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)]" : ""
                      }`}>
                        {priceType === "quarterlyPrice" ? "Yearly" : "Monthly"}
                      </p>
                      <div className="overflow-hidden">
                        <motion.p
                          key={bundle._id + priceType}
                          initial={{ y: -50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 50, opacity: 0 }}
                          transition={{ ease: "linear", duration: 0.25 }}
                          className={`text-6xl font-bold ${
                            isPremium && !isYearly ? "text-transparent bg-clip-text bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)]" : ""
                          }`}
                        >
                          <span>&#8377;{bundle[priceType as keyof Bundle] as number}</span>
                          <span className="font-normal text-xl">/month</span>
                        </motion.p>
                      </div>

                      <div className={`flex items-center gap-2 mb-2 ${
                        isPremium && !isYearly ? "text-transparent bg-clip-text bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)]" : ""
                      }`}>
                        <span className="text-lg">
                          {priceType === "quarterlyPrice"
                            ? "(Annual, Billed Monthly)"
                            : "(Flexible, but higher cost)"}
                        </span>
                      </div>

                      <div className={`flex items-center gap-2 mb-4 ${priceType === "quarterlyPrice" ? "" : "invisible"} ${
                        isPremium && !isYearly ? "text-transparent bg-clip-text bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)]" : ""
                      }`}>
                        <span className="text-lg">
                          Save {Math.round(
                            ((bundle.monthlyPrice * 12 - bundle.quarterlyPrice * 12) /
                              (bundle.monthlyPrice * 12)) * 100
                          )}%
                        </span>
                      </div>

                      {/* Buy Now Button */}
                      <motion.button
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => handleBundlePurchase(bundle, subscriptionType)}
                        className={`w-full py-4 font-semibold rounded-lg uppercase ${
                          isPremium
                            ? isYearly
                              ? "bg-[#333333] text-[#D4AF37] hover:text-[#FFD700]"
                              : "bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)] text-[#333333]"
                            : "bg-white text-[#131859]"
                        }`}
                      >
                        Buy Now
                      </motion.button>
                    </motion.div>
                  </AnimatePresence>
                );
              })
          )}
      </div>

      {/* Feature Comparison Cards */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-times font-bold text-3xl md:text-4xl lg:text-5xl leading-tight text-center uppercase mb-3">
            <span className="bg-gradient-to-r from-[#131859] via-[#2563eb] to-[#131859] bg-clip-text text-transparent">
              Which one to choose
            </span>
            <span className="block text-2xl md:text-3xl lg:text-4xl text-[#131859]">?</span>
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-[#131859] to-[#7DCEFF] mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {wealthPlans.map((plan, index) => {
            const bundle = bundles.find(b => b.category === plan.planName.toLowerCase());
            const isInCart = bundle ? hasBundle(bundle._id) : false;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative rounded-2xl p-8 shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                  plan.isPremium
                    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black border-[#D4AF37]/30 text-white"
                    : "bg-white border-gray-200/50 text-gray-900"
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)] text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {plan.isPremium && <Crown className="w-6 h-6 text-transparent bg-clip-text bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)]" />}
                    <h3 className={`text-2xl lg:text-3xl font-bold ${
                      plan.isPremium ? "text-transparent bg-clip-text bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)]" : "text-gray-900"
                    }`}>
                      {plan.isPremium ? "✨Premium✨" : plan.planName}
                    </h3>
                  </div>
                  <div className={`w-16 h-0.5 mx-auto rounded-full ${
                    plan.isPremium
                      ? "bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)]"
                      : "bg-gradient-to-r from-blue-500 to-blue-600"
                  }`}></div>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <div className="space-y-4">
                    {plan.benefits.map((benefit, benefitIndex) => (
                      <motion.div
                        key={benefitIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 + benefitIndex * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {benefit.checked ? (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                              plan.isPremium
                                ? "bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)]"
                                : "bg-gradient-to-r from-green-400 to-green-600"
                            }`}>
                              <Check className="w-4 h-4 text-white font-bold" strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-r from-red-400 to-red-500 shadow-md">
                              <X className="w-4 h-4 text-white font-bold" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <span className={`text-base lg:text-lg ${
                          plan.isPremium ? "text-gray-100" : "text-gray-700"
                        }`}>
                          {benefit.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {/* View Detailed Description Button */}
                  <Link href={plan.href}>
                    <Button
                      variant="outline"
                      className={`w-full py-4 text-base font-semibold rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        plan.isPremium
                          ? "border-[#D4AF37] text-transparent bg-clip-text bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)] hover:bg-[#D4AF37] hover:text-black bg-transparent"
                          : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent"
                      }`}
                    >
                      View Detailed Description
                    </Button>
                  </Link>

                  {/* Buy Now Button */}
                  {bundle ? (
                    <Button
                      onClick={() => handleBundlePurchase(bundle, "monthly")}
                      className={`w-full py-4 text-base font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg ${
                        plan.isPremium
                          ? "bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)] hover:bg-[linear-gradient(270deg,_#FFC107_0%,_#FFD700_50%,_#D4AF37_100%)] text-black"
                          : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      }`}
                    >
                      BUY NOW
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full py-4 text-base font-bold rounded-xl bg-gray-300 text-gray-500 cursor-not-allowed"
                    >
                      {loading ? "Loading..." : "Coming Soon"}
                    </Button>
                  )}
                </div>

                {/* Background Pattern for Premium */}
                {plan.isPremium && (
                  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)] opacity-10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)] opacity-5 rounded-full blur-2xl"></div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Background Elements */}
      <TopLeftCircle />
      <BottomRightCircle />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false, type: "single", pricingType: "monthly" })}
        type={checkoutModal.type}
        bundle={checkoutModal.bundle}
        subscriptionType={checkoutModal.pricingType}
      />
    </section>
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

const TopLeftCircle = () => {
  return (
    <motion.div
      initial={{ rotate: "0deg" }}
      animate={{ rotate: "360deg" }}
      transition={{ duration: 100, ease: "linear", repeat: Infinity }}
      className="w-[400px] h-[400px] rounded-full border-2 border-blue-200/30 border-dotted absolute z-0 -left-[200px] -top-[150px]"
    />
  );
};

const BottomRightCircle = () => {
  return (
    <motion.div
      initial={{ rotate: "0deg" }}
      animate={{ rotate: "-360deg" }}
      transition={{ duration: 120, ease: "linear", repeat: Infinity }}
      className="w-[500px] h-[500px] rounded-full border-2 border-indigo-200/30 border-dotted absolute z-0 -right-[250px] -bottom-[200px]"
    />
  );
};
