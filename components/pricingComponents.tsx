"use client";

import { Check, X } from "lucide-react";
import React from "react";

export default function PricingTable() {
  const features = [
    { label: "Quality Stock Picks", basic: "10-15 stocks", premium: "20-25 stocks" },
    { label: "Short-Term/Swing Trades", basic: "5 Trades", premium: "10 Trades" },
    { label: "Model Portfolios", basic: false, premium: "(2 Exclusive Portfolios)" },
    { label: "IPO Recommendations", basic: false, premium: "(2 Exclusive Portfolios)" },
    { label: "Call Support", basic: false, premium: "(Direct Access to Experts)" },
    { label: "Live Webinars", basic: false, premium: "(Interactive Sessions)" },
    { label: "Entry & Exit Alerts", basic: true, premium: "(Enhanced with Detailed Analysis)" },
    { label: "Market Updates", basic: true, premium: "(Priority Access)" },
  ];

  return (
<section className="flex justify-center items-center bg-[#2d2d2d] py-16 px-4 min-h-screen">
  <div className="grid grid-cols-[1fr_0.8fr_1.4fr] gap-1 max-w-6xl w-full rounded-2xl overflow-hidden shadow-2xl bg-[#2d2d2d]">
    {/* Header Row */}
    <div className="bg-[#3a3a3a] p-6"></div>
    <div className="bg-[#3a3a3a] p-6 flex flex-col items-center">
      <h2 className="text-green-400 text-2xl font-bold">Basic</h2>
      <p className="text-sm text-gray-400 mt-1">Essential Tools</p>
    </div>
    <div className="bg-[#FFC700] p-6">
      <div className="bg-black text-white text-center py-3 px-2 rounded-xl">
        <h2 className="text-2xl font-bold">Premium</h2>
        <p className="text-sm text-yellow-400 font-medium mt-1">Comprehensive Suite</p>
      </div>
    </div>

    {/* Feature Rows */}
    {features.map((feature, idx) => (
      <React.Fragment key={idx}>
        {/* Feature Label */}
        <div
          className="bg-[#3a3a3a] p-6 text-white font-medium text-left text-base flex items-center"
          role="rowheader"
          aria-label={feature.label}
        >
          {feature.label}
        </div>
        {/* Basic Plan Value */}
        <div
          className="bg-[#3a3a3a] p-6 flex justify-center items-center"
          role="cell"
          aria-label={`Basic plan: ${typeof feature.basic === "string" ? feature.basic : feature.basic ? "Included" : "Not included"}`}
        >
          {typeof feature.basic === "string" ? (
            <span className="text-white font-medium text-base">{feature.basic}</span>
          ) : feature.basic ? (
            <Check className="text-green-400 w-6 h-6" />
          ) : (
            <X className="text-red-500 w-6 h-6" />
          )}
        </div>
        {/* Premium Plan Value */}
        <div
          className="bg-[#FFC700] p-6 flex justify-center items-center"
          role="cell"
          aria-label={`Premium plan: ${feature.premium}`}
        >
          <div className="bg-[#FFD83D] px-4 py-3 rounded-xl font-semibold text-[15px] flex items-center gap-2 w-full text-center">
            <span>✅ {feature.premium}</span>
          </div>
        </div>
      </React.Fragment>
    ))}
  </div>
</section>

  );
}