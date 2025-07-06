// components/pricing-section.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { bundleService, Bundle } from "@/services/bundle.service";
import { CheckoutModal } from "./checkout-modal";
import { SectionHeading } from "@/components/ui/section-heading";

type SubscriptionType = "monthly" | "quarterly" | "yearly";
type PlanType = "basic" | "premium";

const wealthPlans = [
  {
    id: 1,
    planName: "Basic",
    href: "/services/basic",
    benefits: [
      { text: "Get 10-15 Quality Stocks", checked: true },
      { text: "Get 5 Short Term/Swing Trades", checked: true },
      { text: "Timely Alert For Entry And Exit", checked: true },
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
    href: "/services/premium",
    benefits: [
      { text: "Get 20-25 Quality Stocks", checked: true },
      {
        text: "Get 10 Short Term/Swing Trades",
        checked: true,
        desc: "(Dependant On Market Conditions)",
      },
      { text: "Timely Alert For Entry And Exit", checked: true },
      { text: "Real Time Market Updates", checked: true },
      {
        text: "2 Model Portfolios",
        checked: true,
        desc: "(SIP Portfolio, Multibagger Portfolio)",
      },
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
    <section className="w-full text-black bg-white px-4 lg:px-8 py-12 lg:py-24 relative overflow-hidden" id="pricing">
      <div className="mb-12 lg:mb-24 relative z-10">
        <h3 className="font-semibold text-5xl lg:text-7xl text-center mb-6 font-times">
          RANGAONE WEALTH
        </h3>
        <p className="text-center mx-auto max-w-5xl mb-8 font-bold text-lg">
          Welcome to Rangaone Wealth – your way to smarter investing and bigger gains! 
          Stay ahead and make every move impactful—join now and start building unstoppable wealth! 🚀
        </p>
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
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mx-auto relative z-10 container max-w-3xl">
        {bundles
          .filter((bundle) => bundle.category === (selected === "M" ? "basic" : "premium"))
          .map((bundle) =>
            ["monthlyPrice", "quarterlyPrice"]
              .filter((priceType) => bundle[priceType as keyof Bundle] !== undefined)
              .map((priceType) => (
                <AnimatePresence mode="wait" key={`${bundle._id}-${priceType}`}>
                  <div
                    className={`w-full p-6 border-[3px] rounded-xl transition-transform duration-300 ease-in-out hover:scale-105 ${
                      selected === "M"
                        ? "bg-[linear-gradient(295.3deg,_#131859_11.58%,_rgba(24,101,123,0.8)_108.02%)] text-white border-slate-300 shadow-[0px_4px_21.5px_8px_#00A6E8]"
                        : "bg-[linear-gradient(270deg,_#D4AF37_0%,_#FFC107_50%,_#FFD700_100%)] text-[#333333] border-[#333333] shadow-[0px_4px_21.5px_8px_#AD9000]"
                    }`}
                  >
                    <p className="text-2xl font-bold mb-2">
                      {priceType === "quarterlyPrice" ? "Yearly" : "Monthly"}
                    </p>
                    <div className="overflow-hidden">
                      <motion.p
                        key={bundle._id + priceType}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ ease: "linear", duration: 0.25 }}
                        className="text-6xl font-bold"
                      >
                        <span>&#8377;{bundle[priceType as keyof Bundle] as number}</span>
                        <span className="font-normal text-xl">/month</span>
                      </motion.p>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {priceType === "quarterlyPrice"
                          ? `(Save ${Math.round(
                              ((bundle.monthlyPrice * 12 - bundle.quarterlyPrice * 12) /
                                (bundle.monthlyPrice * 0.12))
                            )}%)`
                          : "(Flexible, but higher cost)"}
                      </span>
                    </div>

                    <div className={`flex items-center gap-2 mb-2 ${priceType === "quarterlyPrice" ? "" : "invisible"}`}>
                      <span className="text-lg">Annual, Billed Monthly</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() =>
                        handleBundlePurchase(bundle, priceType === "monthlyPrice" ? "monthly" : "quarterly")
                      }
                      className={`w-full py-4 font-semibold rounded-lg uppercase ${
                        selected === "M" ? "bg-white text-black" : "bg-[#333333] text-[#D4AF37]"
                      }`}
                    >
                      Buy Now
                    </motion.button>
                  </div>
                </AnimatePresence>
              ))
          )}
      </div>

      {/* Points Section */}
      <div className="container mx-auto max-w-5xl px-4 mt-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-times font-bold text-3xl md:text-4xl lg:text-5xl leading-tight text-center uppercase mb-3">
            <span className="bg-gradient-to-r from-[#131859] via-[#2563eb] to-[#131859] bg-clip-text text-transparent">
              Which one to choose
            </span>
            <span className="block text-2xl md:text-3xl lg:text-4xl text-[#131859]">?</span>
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-[#131859] to-[#7DCEFF] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {wealthPlans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`relative rounded-xl p-6 border-2 shadow-lg overflow-hidden h-full flex flex-col ${
                plan.planName === "Premium"
                  ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black border-yellow-400/30 shadow-yellow-400/10"
                  : "bg-gradient-to-br from-white via-blue-50/30 to-white border-blue-200/50 shadow-blue-500/10"
              }`}
            >
              {plan.planName === "Premium" && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-md transform rotate-12">
                  POPULAR
                </div>
              )}

              <div className="relative z-10 text-center mb-6">
                <h2 className={`text-xl md:text-2xl font-bold mb-2 font-times ${
                  plan.planName === "Premium" ? "text-yellow-400" : "text-[#131859]"
                }`}>
                  {plan.planName}
                </h2>
                <div className={`w-12 h-0.5 mx-auto rounded-full ${
                  plan.planName === "Premium"
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    : "bg-gradient-to-r from-blue-500 to-blue-600"
                }`}></div>
              </div>

              <div className="flex-grow relative z-10 mb-6">
                <div className="space-y-0.5">
                  {plan.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start space-x-3 py-1.5">
                        <div className="flex-shrink-0 mt-0.5">
                          {benefit.checked ? (
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              plan.planName === "Premium"
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md shadow-yellow-400/20"
                                : "bg-gradient-to-r from-green-400 to-green-600 shadow-md shadow-green-400/20"
                            }`}>
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-r from-red-400 to-red-500 shadow-md shadow-red-400/20">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className={`text-sm md:text-base font-medium leading-relaxed ${
                          plan.planName === "Premium"
                            ? benefit.checked ? "text-gray-100" : "text-gray-400"
                            : benefit.checked ? "text-gray-700" : "text-gray-400"
                        }`}>
                          {benefit.text}
                          {benefit.desc && (
                            <span className="block text-xs text-gray-500 mt-1">{benefit.desc}</span>
                          )}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <TopLeftCircle />
      <BottomRightCircle />

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
      className="w-[450px] h-[450px] rounded-full border-2 border-slate-500 border-dotted absolute z-0 -left-[250px] -top-[200px]"
    />
  );
};

const BottomRightCircle = () => {
  return (
    <motion.div
      initial={{ rotate: "0deg" }}
      animate={{ rotate: "-360deg" }}
      transition={{ duration: 100, ease: "linear", repeat: Infinity }}
      className="w-[450px] h-[450px] rounded-full border-2 border-slate-500 border-dotted absolute z-0 -right-[250px] -bottom-[200px]"
    />
  );
};
