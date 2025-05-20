"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// Types
interface Recommendation {
  id: number;
  name: string;
  exchange: string;
  entryPrice: string;
  targetPrice: string;
  result: number;
  type: string;
}

export default function RangaoneWealth() {
  return (
    <DashboardLayout userId="1">
      <div className="flex flex-col w-full">
        <PageHeader
          title="Rangaone Wealth"
          subtitle="Expert stock recommendations and portfolio management"
        />

        <div className="space-y-10">
          {/* Expert Recommendations Section */}
          <RecommendationsSection
            title="EXPERT RECOMMENDATIONS"
            buttonText="View All Recommendations"
            buttonLink="/rangaone-wealth/all-recommendations"
            recommendations={[
              {
                id: 1,
                name: "RELIANCE IND",
                exchange: "BSE",
                entryPrice: "2500 - 2550",
                targetPrice: "2700 - 2800",
                result: 9.8,
                type: "Premium",
              },
              {
                id: 2,
                name: "AXIS BANK",
                exchange: "NSE",
                entryPrice: "2234 - 2278",
                targetPrice: "2437 - 2617",
                result: 17.35,
                type: "Basic",
              },
              {
                id: 3,
                name: "HDFC BANK",
                exchange: "NSE",
                entryPrice: "1634 - 1678",
                targetPrice: "1837 - 1917",
                result: 15.35,
                type: "Premium",
              },
            ]}
          />

          <div className="h-px bg-gray-200 my-8"></div>

          {/* Closed Recommendations Section */}
          <RecommendationsSection
            title="CLOSED RECOMMENDATIONS"
            buttonText="View All Closed Recommendations"
            buttonLink="/rangaone-wealth/closed-recommendations"
            recommendations={[
              {
                id: 1,
                name: "RELIANCE IND",
                exchange: "BSE",
                entryPrice: "2500 - 2550",
                targetPrice: "2700 - 2800",
                result: 9.8,
                type: "Premium",
              },
              {
                id: 2,
                name: "AXIS BANK",
                exchange: "NSE",
                entryPrice: "2234 - 2278",
                targetPrice: "2437 - 2617",
                result: 17.35,
                type: "Basic",
              },
              {
                id: 3,
                name: "ICICI BANK",
                exchange: "NSE",
                entryPrice: "934 - 978",
                targetPrice: "1037 - 1117",
                result: 14.35,
                type: "Premium",
              },
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function RecommendationsSection({
  title,
  buttonText,
  buttonLink,
  recommendations,
}: {
  title: string;
  buttonText: string;
  buttonLink: string;
  recommendations: Recommendation[];
}) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    breakpoints: {
      "(min-width: 768px)": { align: "center" },
      "(min-width: 1024px)": { align: "center" },
    },
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredRecommendations =
    activeFilter === "all"
      ? recommendations
      : recommendations.filter(
          (rec) => rec.type.toLowerCase() === activeFilter.toLowerCase()
        );

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, filteredRecommendations]);

  return (
    <section className="w-full">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
        {title}
      </h2>

      {/* Filter Tabs */}
      <div className="flex justify-start mb-6">
        <div className="grid grid-cols-3 w-full max-w-xs rounded-md overflow-hidden">
          <button
            className={cn(
              "py-2 px-4 text-white font-medium text-sm transition-colors",
              activeFilter === "all"
                ? "bg-gray-700"
                : "bg-gray-600 hover:bg-gray-700"
            )}
            onClick={() => setActiveFilter("all")}
          >
            All
          </button>
          <button
            className={cn(
              "py-2 px-4 text-white font-medium text-sm transition-colors",
              activeFilter === "basic"
                ? "bg-blue-700"
                : "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={() => setActiveFilter("basic")}
          >
            Basic
          </button>
          <button
            className={cn(
              "py-2 px-4 text-white font-medium text-sm transition-colors",
              activeFilter === "premium"
                ? "bg-yellow-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            )}
            onClick={() => setActiveFilter("premium")}
          >
            Premium
          </button>
        </div>
      </div>

      {/* Embla Carousel */}
      <div className="relative w-full mx-auto">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((recommendation, index) => (
                <div
                  key={recommendation.id}
                  className={cn(
                    "flex-[0_0_100%] min-w-0 sm:flex-[0_0_80%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] relative px-2 md:px-3 transition-all duration-300",
                    {
                      "opacity-100 scale-100": index === selectedIndex,
                      "opacity-70 scale-95": index !== selectedIndex,
                    }
                  )}
                >
                  <Link
                    href={`/rangaone-wealth/recommendation/${recommendation.name.replace(
                      /\s+/g,
                      ""
                    )}`}
                    className="block h-full"
                  >
                    <div className="rounded-lg border-2 border-gray-200 overflow-hidden bg-white shadow-sm h-full cursor-pointer hover:border-primary">
                      <div className="flex justify-between">
                        <span
                          className={`${
                            recommendation.type.toLowerCase() === "premium"
                              ? "bg-yellow-500"
                              : "bg-blue-600"
                          } text-white px-3 py-1 text-xs font-medium`}
                        >
                          {recommendation.type}
                        </span>
                        <span
                          className={`${
                            recommendation.result > 0
                              ? "bg-green-500"
                              : "bg-gray-500"
                          } text-white px-3 py-1 text-xs font-medium`}
                        >
                          {recommendation.result.toFixed(2)} %
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold">
                            {recommendation.name}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {recommendation.exchange}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Entry Price</p>
                            <p className="font-medium text-sm">
                              ₹ {recommendation.entryPrice}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Target Price
                            </p>
                            <p className="font-medium text-sm">
                              ₹ {recommendation.targetPrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="flex-[0_0_100%] flex items-center justify-center py-8">
                <p className="text-gray-500">No recommendations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={scrollPrev}
          className="absolute top-1/2 -translate-y-1/2 left-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 z-20"
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={scrollNext}
          className="absolute top-1/2 -translate-y-1/2 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 z-20"
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Timeline and Date */}
      <div className="flex flex-col items-center mt-6">
        <div className="relative w-full max-w-md mb-2">
          <div className="h-1 bg-gray-300 rounded-full"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-4 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center text-xs font-medium">
            <div className="absolute -top-8 whitespace-nowrap bg-black text-white px-3 py-1 rounded-full text-xs">
              17 April 2025
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="mt-6 text-center">
          <Link
            href={buttonLink}
            className="inline-flex items-center px-5 py-2 bg-indigo-950 text-white rounded-md text-sm font-medium hover:bg-indigo-900 transition-colors"
          >
            {buttonText}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
