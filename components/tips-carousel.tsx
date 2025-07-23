"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion";
import { format, differenceInDays, addDays, isSameDay } from "date-fns";

import { cn } from "@/lib/utils";
import { tipsService, type Tip } from "@/services/tip.service";
import {
  subscriptionService,
  type SubscriptionAccess,
} from "@/services/subscription.service";
import { stockPriceService } from "@/services/stock-price.service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { portfolioService } from "@/services/portfolio.service";

// MarqueeText component for scrolling long text
const MarqueeText = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        setShouldScroll(textWidth > containerWidth + 10); // Add small buffer
      }
    };

    checkScroll();
    // Re-check on window resize
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [text]);

  // Always show marquee for long text to ensure it works
  const isLongText = text.length > 15; // Reduced threshold to trigger marquee more often

  // Debug log to see what text is being passed
  console.log("MarqueeText debug:", {
    text,
    textLength: text.length,
    isLongText,
    shouldScroll,
  });

  // Force marquee for any text longer than 15 characters or if it should scroll
  if (!shouldScroll && !isLongText) {
    return (
      <div ref={containerRef} className={cn("overflow-hidden", className)}>
        <div ref={textRef} className="whitespace-nowrap">
          {text}
        </div>
      </div>
    );
  }

  // Always show marquee with duplicated text
  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      <div
        ref={textRef}
        className="whitespace-nowrap animate-marquee"
        style={{
          animationDuration: `${Math.max(8, text.length * 0.15)}s`,
        }}
      >
        {text}
        <span className="ml-8">{text}</span>
      </div>
    </div>
  );
};

type TipCardData = {
  id: string;
  portfolioId?: string;
  portfolioName?: string;
  date: string;
  stockName: string;
  exchange: string;
  weightage: number;
  buyRange: string;
  action: "HOLD" | "Partial Profit Booked" | "BUY" | "SELL";
  category: "basic" | "premium";
  title: string;
  message?: string;
};

const getTipColorScheme = (
  category: "basic" | "premium",
  isModelPortfolio: boolean = false
) => {
  if (isModelPortfolio) {
    return {
      gradient: "linear-gradient(90deg, #00B7FF 0%, #85D437 100%)",
      textColor: "#047857",
      bgGradient: "linear-gradient(90deg, #e0f7ff 0%, #f1fef2 100%)",
      borderColor: "#10B981",
      badge: {
        bg: "#000000",
        text: "#FFFFFF",
      },
    };
  } else if (category === "premium") {
    return {
      gradient: "linear-gradient(90deg, #FFD700 30%, #3333330A 90%)",
      textColor: "#92400E",
      bgGradient: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
      borderColor: "#F59E0B",
      badge: {
        bg: "#92400E",
        text: "linear-gradient(to right, #92400E, #FEF3C7)",
      },
    };
  } else {
    return {
      gradient: "linear-gradient(90deg, #595CFF 30%, #3333330A 90%)",
      textColor: "#1E40AF",
      bgGradient: "linear-gradient(135deg, #18657B 0%, #131859 100%)",
      borderColor: "#595CFF",
      badge: {
        bg: "#18657B",
        text: "#DBEAFE",
      },
    };
  }
};

interface DateTimelineSliderProps {
  dateRange: {
    min: Date;
    max: Date;
  };
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
  datesWithTips?: Date[];
}

export function DateTimelineSlider({
  dateRange,
  selectedDate,
  onDateChange,
  className,
  datesWithTips = [],
}: DateTimelineSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tickSpacing] = useState(32); // More space for clarity
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(0);

  // Timeline: earliest on left, latest on right
  const totalDays = useMemo(
    () => differenceInDays(dateRange.max, dateRange.min) + 1,
    [dateRange.min, dateRange.max]
  );
  const timelineWidth = useMemo(
    () => totalDays * tickSpacing,
    [totalDays, tickSpacing]
  );
  const currentPosition = useMemo(
    () => differenceInDays(selectedDate, dateRange.min),
    [selectedDate, dateRange.min]
  );

  useEffect(() => {
    if (containerRef.current) {
      const updateWidth = () =>
        setContainerWidth(containerRef.current?.offsetWidth ?? 0);
      updateWidth();
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
  }, []);

  useEffect(() => {
    if (containerWidth > 0 && !isDragging) {
      const targetX = containerWidth / 2 - currentPosition * tickSpacing;
      animate(x, targetX, {
        type: "spring",
        stiffness: 400,
        damping: 40,
        velocity: 0.2,
      });
    }
  }, [selectedDate, containerWidth, currentPosition, tickSpacing, x, isDragging]);

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = () => {
    const finalX = x.get();
    const centeredPositionInTimeline = containerWidth / 2 - finalX;
    const dayIndex = Math.round(centeredPositionInTimeline / tickSpacing);
    const clampedDayIndex = Math.max(0, Math.min(totalDays - 1, dayIndex));
    const newDate = addDays(dateRange.min, clampedDayIndex);

    // Snap to the new date
    const snapX = containerWidth / 2 - clampedDayIndex * tickSpacing;
    animate(x, snapX, {
      type: "spring",
      stiffness: 500,
      damping: 30,
      velocity: 0.5,
    });

    if (!isSameDay(newDate, selectedDate)) {
      onDateChange(newDate);
    }
    setTimeout(() => setIsDragging(false), 100);
  };

  const dragConstraints = {
    right: containerWidth / 2,
    left: containerWidth / 2 - timelineWidth,
  };

  const formatDisplayDate = (date: Date) => format(date, "dd MMM yyyy");
  const dateHasTip = (date: Date) =>
    datesWithTips.some((tipDate) => isSameDay(tipDate, date));

  const ticks = useMemo(() => {
    return Array.from({ length: totalDays }).map((_, i) => {
      const tickDate = addDays(dateRange.min, i);
      const isHighlighted = isSameDay(tickDate, selectedDate);
      const hasTip = dateHasTip(tickDate);
      return {
        position: i * tickSpacing,
        isHighlighted,
        hasTip,
        date: tickDate,
        showLabel: isHighlighted || i % 5 === 0,
      };
    });
  }, [totalDays, tickSpacing, dateRange.min, selectedDate, datesWithTips]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-2xl h-24 mx-auto overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300 ${className || ""}`}
    >
      {/* Static Date Indicator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm sm:text-base font-semibold shadow-lg border border-gray-200 whitespace-nowrap">
          {formatDisplayDate(selectedDate)}
        </div>
      </div>

      {/* Static Center Pointer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-blue-600 z-10 pointer-events-none" />

      {/* Timeline Bar */}
      <div className="absolute bottom-8 left-0 w-full h-1 bg-gray-200 rounded-full z-0" />

      {/* Draggable Timeline */}
      <motion.div
        className="absolute top-0 left-0 h-full"
        style={{ x }}
        drag="x"
        dragConstraints={dragConstraints}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        dragElastic={0.1}
        dragMomentum={true}
        dragTransition={{
          power: 0.3,
          timeConstant: 200,
          modifyTarget: (target) => Math.round(target / tickSpacing) * tickSpacing,
        }}
      >
        <div
          className="relative h-full flex items-end"
          style={{ width: `${timelineWidth}px` }}
        >
          {ticks.map((tick, i) => (
            <div key={i} className="relative">
              {/* Tick */}
              <div
                className={`absolute bottom-0 w-0.5 transition-all duration-200 ${
                  tick.isHighlighted
                    ? "h-10 bg-blue-600 shadow-lg"
                    : "h-6 bg-gray-400"
                }`}
                style={{ left: `${tick.position}px` }}
              />
              {/* Tip indicator dot */}
              {tick.hasTip && (
                <div
                  className={`absolute w-2 h-2 rounded-full bg-green-500 shadow-sm transition-all duration-200 border-2 ${
                    tick.isHighlighted ? "border-blue-600" : "border-white"
                  }`}
                  style={{
                    left: `${tick.position - 3}px`,
                    bottom: tick.isHighlighted ? "12px" : "8px",
                    transform: tick.isHighlighted ? "scale(1.5)" : "scale(1)",
                  }}
                />
              )}
              {/* Date label */}
              {tick.showLabel && (
                <div
                  className={`absolute text-[11px] font-medium whitespace-nowrap transition-opacity duration-200 ${
                    tick.isHighlighted
                      ? "text-blue-700 font-bold opacity-100"
                      : "text-gray-500 opacity-60"
                  }`}
                  style={{
                    left: `${tick.position}px`,
                    bottom: "32px",
                    transform: "translateX(-50%)",
                  }}
                >
                  {format(tick.date, "d MMM")}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const TipCard = ({
  tip,
  isActive,
  onClick,
  isModelPortfolio,
  subscriptionAccess,
}: {
  tip: TipCardData;
  isActive: boolean;
  onClick?: () => void;
  isModelPortfolio?: boolean;
  subscriptionAccess?: SubscriptionAccess;
}) => {
  const colorScheme = getTipColorScheme(tip.category, isModelPortfolio);

  const hasAccess = () => {
    if (!subscriptionAccess) {
      return false;
    }

    if (subscriptionAccess.hasPremium) {
      return true;
    }

    if (tip.category === "premium") {
      return false;
    } else if (tip.category === "basic") {
      return subscriptionAccess.hasBasic;
    }

    if (tip.portfolioId) {
      return subscriptionAccess.portfolioAccess.includes(tip.portfolioId);
    }

    return true;
  };

  const canAccessTip = hasAccess();
  const shouldBlurContent = !canAccessTip;

  return (
    <div
      className={cn(
        "relative w-full h-full",
        "rounded-xl transition-all duration-500 cursor-pointer flex-shrink-0",
        isActive
          ? "scale-105 sm:scale-110 lg:scale-105 shadow-2xl z-20"
          : "scale-95 sm:scale-90 lg:scale-95 opacity-70 shadow-md",
        onClick &&
          "hover:scale-100 sm:hover:scale-105 lg:hover:scale-100 hover:shadow-xl"
      )}
      style={{
        background: colorScheme.gradient,
        padding: isActive ? "3px" : "2px",
      }}
      onClick={canAccessTip ? onClick : undefined}
    >
      <div className="w-full h-full bg-white rounded-[10px] p-2 sm:p-3 md:p-4 lg:p-5 flex flex-col justify-between relative overflow-hidden">
        <div
          className={cn(
            "w-full h-full flex flex-col justify-between relative z-10",
            shouldBlurContent && "blur-sm"
          )}
        >
          <div className="flex justify-between items-start gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                {isModelPortfolio ? (
                  <div className="relative bg-gradient-to-r from-[#00B7FF] to-[#85D437] p-[2px] rounded-lg overflow-hidden">
                    <div className="bg-black text-xs sm:text-sm font-bold rounded-md px-2 sm:px-3 py-0.5 sm:py-1 overflow-hidden">
                      {tip.portfolioName ? (
                        <div className="overflow-hidden">
                          <div className="whitespace bg-gradient-to-r from-[#00B7FF] to-[#85D437] font-bold bg-clip-text text-transparent">
                            {/* Extract only the part before "Portfolio" */}
                            {tip.portfolioName.split("Portfolio")[0].trim()}
                          </div>
                        </div>
                      ) : (
                        <span className="bg-gradient-to-r from-[#00B7FF] to-[#85D437] bg-clip-text text-transparent font-bold">
                          Model Portfolio
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-xs sm:text-sm font-semibold rounded px-2 sm:px-2.5 py-0.5 sm:py-1 inline-block shadow-sm whitespace-nowrap"
                    style={{
                      backgroundColor: colorScheme.badge.bg,
                      color: colorScheme.badge.text,
                    }}
                  >
                    {tip.category.charAt(0).toUpperCase() +
                      tip.category.slice(1)}
                  </div>
                )}
              </div>

              <div className="text-[20px] sm:text-base md:text-lg lg:text-xl font-bold text-black mt-0.5 truncate">
                {tip.stockName}
              </div>
              <p className="text-xs sm:text-sm text-gray-500">{tip.exchange}</p>
            </div>
            <div className="relative bg-gradient-to-r from-[#00B7FF] to-[#85D437] p-[2px] rounded-lg flex-shrink-0">
              <div className="bg-cyan-50 rounded-md px-1.5 sm:px-2 md:px-2.5 py-1 sm:py-1.5 text-center min-w-[40px] sm:min-w-[44px] md:min-w-[50px]">
                <p className="text-[12px] sm:text-[12px] md:text-[12px] text-gray-700 mb-0 leading-tight font-medium">
                  Weightage
                </p>
                <p className="text-right text-[25px] sm:text-[30px] md:text-[30px] font-bold text-black leading-tight">
                  {tip.weightage}%
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-1.5 sm:mt-2 md:mt-3 gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] sm:text-[15px] md:text-[15px] text-black-500 mb-0.5 sm:mb-1 leading-tight font-medium">
                Buy Range
              </p>
              <div className="text-[15px] sm:text-sm md:text-xl font-bold text-black truncate">
                {tip.buyRange}
              </div>
            </div>
            <div className="flex-shrink-0">
              <p className="text-[13px] sm:text-xs md:text-sm text-black mb-0.5 sm:mb-1 leading-tight font-medium text-right">
                Action
              </p>
              <div className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm md:text-base font-medium bg-gray-700 text-[#FFFFF0] inline-block whitespace-nowrap">
                {tip.action}
              </div>
            </div>
          </div>
          {tip.message && (
            <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 md:p-2.5 bg-gray-100 rounded">
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 leading-tight line-clamp-2">
                {tip.message}
              </div>
            </div>
          )}
        </div>
      </div>

      {shouldBlurContent && (
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-[10px] flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-lg max-w-[160px] sm:max-w-[180px] md:max-w-[200px]">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              {tip.category === "premium"
                ? "Premium subscription required"
                : "Basic subscription required"}
            </p>
            <button
              className={cn(
                "px-3 sm:px-4 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium text-[#FFFFF0] transition-all",
                tip.category === "premium"
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  : "bg-gradient-to-r from-[#18657B] to-[#131859] hover:from-blue-600 hover:to-blue-700"
              )}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href =
                  tip.category === "premium"
                    ? "/premium-subscription"
                    : "/basic-subscription";
              }}
            >
              {tip.category === "premium" ? "Get Premium" : "Get Basic"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface TipsCarouselProps {
  portfolioId?: string;
  tips?: Tip[];
  loading?: boolean;
  onTipClick?: (tipId: string) => void;
  categoryFilter?: "basic" | "premium" | "all";
  isModelPortfolio?: boolean;
  sliderSize?: "default" | "large";
  userSubscriptionAccess?: SubscriptionAccess;
}

export default function TipsCarousel({
  portfolioId,
  tips: propTips,
  loading: propLoading,
  onTipClick,
  categoryFilter = "all",
  isModelPortfolio = false,
  sliderSize = "default",
  userSubscriptionAccess,
}: TipsCarouselProps) {
  const [tips, setTips] = useState<TipCardData[]>([]);
  const [loading, setLoading] = useState(propLoading || false);
  const [subscriptionAccess, setSubscriptionAccess] = useState<
    SubscriptionAccess | undefined
  >(userSubscriptionAccess);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stockSymbols, setStockSymbols] = useState<Map<string, string>>(
    new Map()
  );
  const [portfolioHoldingsMap, setPortfolioHoldingsMap] = useState<
    Map<string, number>
  >(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const router = useRouter();

  // Responsive configuration
  const [dimensions, setDimensions] = useState({
    cardWidth: 280,
    cardHeight: 160,
    gap: 16,
    visibleCards: 1.2,
    containerPadding: 16,
  });

  useEffect(() => {
    setSubscriptionAccess(userSubscriptionAccess);
  }, [userSubscriptionAccess]);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;

      let config = {
        cardWidth: 280,
        cardHeight: 160,
        gap: 16,
        visibleCards: 1.2,
        containerPadding: 16,
      };

      if (width < 400) {
        // Very small mobile
        config = {
          cardWidth: Math.min(260, width - 60),
          cardHeight: 160,
          gap: 12,
          visibleCards: 1.0,
          containerPadding: 12,
        };
      } else if (width < 480) {
        // Small mobile
        config = {
          cardWidth: Math.min(280, width - 60),
          cardHeight: 170,
          gap: 14,
          visibleCards: 1.0,
          containerPadding: 14,
        };
      } else if (width < 640) {
        // Large mobile
        config = {
          cardWidth: 300,
          cardHeight: 180,
          gap: 16,
          visibleCards: 1.0,
          containerPadding: 16,
        };
      } else if (width < 768) {
        // Small tablet
        config = {
          cardWidth: Math.min(320, width - 80),
          cardHeight: 200,
          gap: 18,
          visibleCards: 1.2,
          containerPadding: 18,
        };
      } else if (width < 1024) {
        // Large tablet
        config = {
          cardWidth: Math.min(340, width - 100),
          cardHeight: 200,
          gap: 20,
          visibleCards: 1.5,
          containerPadding: 20,
        };
      } else if (width < 1280) {
        // Small desktop
        config = {
          cardWidth: Math.min(360, width - 120),
          cardHeight: 200,
          gap: 24,
          visibleCards: 1.8,
          containerPadding: 24,
        };
      } else if (width < 1536) {
        // Large desktop
        config = {
          cardWidth: Math.min(380, width - 140),
          cardHeight: 220,
          gap: 28,
          visibleCards: 2.0,
          containerPadding: 28,
        };
      } else {
        // Extra large desktop
        config = {
          cardWidth: Math.min(400, width - 160),
          cardHeight: 220,
          gap: 32,
          visibleCards: 2.2,
          containerPadding: 32,
        };
      }

      setDimensions(config);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const currentTipDate = useMemo(() => {
    if (tips.length === 0 || currentIndex >= tips.length) return new Date();
    return new Date(tips[currentIndex].date);
  }, [tips, currentIndex]);

  // Calculate date range for the timeline slider
  const dateRange = useMemo(() => {
    if (tips.length === 0) return { min: new Date(), max: new Date() };

    const dates = tips
      .map((tip) => new Date(tip.date))
      .sort((a, b) => a.getTime() - b.getTime());
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    // Add some padding to the date range for better UX
    const paddingDays = 0;
    const paddedMinDate = addDays(minDate, -paddingDays);
    const paddedMaxDate = addDays(maxDate, paddingDays);

    console.log("📅 Timeline Date Range:", {
      tipsCount: tips.length,
      minDate: format(minDate, "dd MMM yyyy"),
      maxDate: format(maxDate, "dd MMM yyyy"),
      paddedMin: format(paddedMinDate, "dd MMM yyyy"),
      paddedMax: format(paddedMaxDate, "dd MMM yyyy"),
    });

    return { min: paddedMinDate, max: paddedMaxDate };
  }, [  tips]);

  // Update current tip date when carousel index changes
  useEffect(() => {
    if (tips.length > 0 && currentIndex < tips.length) {
      const newTipDate = new Date(tips[currentIndex].date);
      console.log("🔄 Carousel Index Changed:", {
        currentIndex,
        newTipDate: format(newTipDate, "dd MMM yyyy"),
        currentTipDate: format(currentTipDate, "dd MMM yyyy"),
      });
    }
  }, [currentIndex, tips, currentTipDate]);

  // Fetch stock symbols for tips that have stockId
  const fetchStockSymbols = async (apiTips: Tip[]) => {
    const tipsWithStockId = apiTips.filter((tip) => tip.stockId);
    if (tipsWithStockId.length === 0) return;

    try {
      console.log(
        `🔍 Fetching stock symbols for ${tipsWithStockId.length} tips`
      );
      const stockIds = tipsWithStockId.map((tip) => {
        // Remove .NS or other exchange suffixes if present and trim whitespace
        return tip.stockId!.replace(/\.[A-Z]+$/, '').trim();
      });

      const stockResults = await stockPriceService.getMultipleStockPricesById(
        stockIds
      );
      const newStockSymbols = new Map<string, string>();

      stockResults.forEach((result, stockId) => {
        if (result.success && result.data?.symbol) {
          newStockSymbols.set(stockId, result.data.symbol);
          console.log(
            `✅ Fetched symbol for ${stockId}: ${result.data.symbol}`
          );
        } else {
          console.warn(`⚠️ Failed to fetch symbol for ${stockId}`);
        }
      });

      setStockSymbols(newStockSymbols);
    } catch (error) {
      console.error("❌ Failed to fetch stock symbols:", error);
    }
  };

  const convertTipsToCarouselFormat = (apiTips: Tip[]): TipCardData[] => {
    return apiTips.map((tip, index) => {
      // Use fetched stock symbol if available, otherwise use stockId or fallback
      let stockName = stockSymbols.get(tip.stockId || "");
      if (!stockName && tip.stockId) {
        stockName = tip.stockId; // Use stockId as fallback if symbol not fetched yet
      }
      if (!stockName) {
        stockName = tip.title?.split(":")[0]?.split("-")[0]?.trim();
      }
      if (!stockName) {
        stockName = `Stock ${index + 1}`;
      }
      // Debug: Log the mapping and lookup
      if (isModelPortfolio) {
        console.log(
          "[TipsCarousel] Looking up weight for symbol:",
          stockName,
          "in map:",
          Array.from(portfolioHoldingsMap.entries())
        );
      }
      // Get weightage from portfolio holdings if available
      let weightage: number | undefined = undefined;
      if (
        isModelPortfolio &&
        stockName &&
        portfolioHoldingsMap.has(stockName)
      ) {
        weightage = portfolioHoldingsMap.get(stockName);
        console.log(
          `[TipsCarousel] Found weightage for ${stockName}:`,
          weightage
        );
      }
      if (weightage === undefined) {
        weightage = tip.targetPercentage
          ? parseFloat(tip.targetPercentage.replace("%", ""))
          : 5.0;
        if (isModelPortfolio) {
          console.log(
            `[TipsCarousel] Fallback weightage for ${stockName}:`,
            weightage
          );
        }
      }

      // Extract portfolio name
      let portfolioName: string | undefined;
      if (typeof tip.portfolio === "string") {
        // If portfolio is just an ID, we'll need to fetch the name separately
        portfolioName = undefined;
      } else if (tip.portfolio && typeof tip.portfolio === "object") {
        portfolioName = tip.portfolio.name;
      }

      return {
        id: tip._id,
        portfolioId:
          typeof tip.portfolio === "string"
            ? tip.portfolio
            : tip.portfolio?._id,
        portfolioName,
        date: tip.createdAt,
        stockName,
        exchange: "NSE",
        weightage,
        buyRange: tip.buyRange || "₹ 1000 - 1050",
        action:
          (tip.action as "HOLD" | "Partial Profit Booked" | "BUY" | "SELL") ||
          "BUY",
        category: tip.category || "basic",
        title: tip.title,
        message: tip.message,
      };
    });
  };

  const handleTipClick = (tip: TipCardData) => {
    if (onTipClick) {
      onTipClick(tip.id);
    } else {
      if (tip.portfolioId) {
        router.push(`/model-portfolios/${tip.portfolioId}/tips/${tip.id}`);
      } else {
        router.push(`/rangaone-wealth/recommendation/${tip.id}`);
      }
    }
  };

  // Calculate container width and positioning - RESPONSIVE
  const containerWidth = Math.min(
    typeof window !== "undefined"
      ? window.innerWidth - dimensions.containerPadding * 2
      : 800,
    dimensions.cardWidth * Math.floor(dimensions.visibleCards) +
      dimensions.gap * (Math.floor(dimensions.visibleCards) - 1)
  );

  const updateCurrentIndex = (xValue: number) => {
    const centerPosition = containerWidth / 2;
    const cardCenter = dimensions.cardWidth / 2;
    const adjustedPosition = -xValue + centerPosition - cardCenter;
    const cardStep = dimensions.cardWidth + dimensions.gap;
    const newIndex = Math.max(
      0,
      Math.min(tips.length - 1, Math.round(adjustedPosition / cardStep))
    );

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const onDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const centerPosition = containerWidth / 2;
    const cardCenter = dimensions.cardWidth / 2;
    const cardStep = dimensions.cardWidth + dimensions.gap;

    const tipPosition = -x.get() + centerPosition - cardCenter;
    const nearestIndex = Math.max(
      0,
      Math.min(tips.length - 1, Math.round(tipPosition / cardStep))
    );

    const targetX = -(nearestIndex * cardStep) + centerPosition - cardCenter;

    animate(x, targetX, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.5,
    });

    setCurrentIndex(nearestIndex);
  };

  const goToTip = (index: number) => {
    const centerPosition = containerWidth / 2;
    const cardCenter = dimensions.cardWidth / 2;
    const cardStep = dimensions.cardWidth + dimensions.gap;
    const targetX = -(index * cardStep) + centerPosition - cardCenter;

    animate(x, targetX, {
      type: "spring",
      stiffness: 400,
      damping: 35,
      mass: 0.8,
    });

    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      goToTip(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < tips.length - 1) {
      goToTip(currentIndex + 1);
    }
  };

  // Calculate drag constraints - FIXED
  const centerPosition = containerWidth / 2;
  const cardCenter = dimensions.cardWidth / 2;
  const cardStep = dimensions.cardWidth + dimensions.gap;

  const maxX = centerPosition - cardCenter;
  const minX = -(tips.length - 1) * cardStep + centerPosition - cardCenter;

  useEffect(() => {
    const fetchTips = async () => {
      if (propTips) {
        let filteredTips = propTips;

        if (categoryFilter !== "all") {
          filteredTips = propTips.filter(
            (tip) => tip.category === categoryFilter
          );
        }

        // Fetch stock symbols first, then convert tips
        await fetchStockSymbols(filteredTips);
        const carouselTips = convertTipsToCarouselFormat(filteredTips);
        setTips(carouselTips);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let apiTips: Tip[] = [];

        if (portfolioId) {
          apiTips = await tipsService.getPortfolioTips({
            portfolioId,
            category: categoryFilter !== "all" ? categoryFilter : undefined,
          });
        } else {
          apiTips = await tipsService.getAll({
            category: categoryFilter !== "all" ? categoryFilter : undefined,
          });
        }

        // Fetch stock symbols first, then convert tips
        await fetchStockSymbols(apiTips);
        const carouselTips = convertTipsToCarouselFormat(apiTips);
        setTips(carouselTips);
      } catch (error) {
        console.error("Failed to fetch tips:", error);
        const sampleTips: TipCardData[] = [
          {
            id: "1",
            date: "2025-04-14T00:00:00.000Z",
            stockName: "ZAGGLE",
            exchange: "NSE",
            weightage: 5.0,
            buyRange: "₹ 1000 - 1050",
            action: "SELL",
            category: "basic",
            title: "ZAGGLE Analysis",
            portfolioName: isModelPortfolio ? "Growth Portfolio" : undefined,
          },
          {
            id: "2",
            date: "2025-04-15T00:00:00.000Z",
            stockName: "BLUESTARCO",
            exchange: "NSE",
            weightage: 5.0,
            buyRange: "₹ 1000 - 1050",
            action: "HOLD",
            category: "premium",
            title: "BLUESTARCO Premium Analysis",
            portfolioName: isModelPortfolio ? "Premium Portfolio" : undefined,
          },
        ];
        setTips(sampleTips);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [portfolioId, propTips, categoryFilter]);

  // Re-convert tips when stock symbols are updated
  useEffect(() => {
    if (propTips) {
      let filteredTips = propTips;
      if (categoryFilter !== "all") {
        filteredTips = propTips.filter(
          (tip) => tip.category === categoryFilter
        );
      }
      const carouselTips = convertTipsToCarouselFormat(filteredTips);
      setTips(carouselTips);
    }
  }, [stockSymbols, propTips, categoryFilter]);

  useEffect(() => {
    const fetchSubscriptionAccess = async () => {
      try {
        subscriptionService.clearCache();
        const access = await subscriptionService.getSubscriptionAccess(true);
        setSubscriptionAccess(access);
      } catch (error) {
        console.error("Failed to fetch subscription access:", error);
        setSubscriptionAccess({
          hasBasic: false,
          hasPremium: false,
          portfolioAccess: [],
          subscriptionType: "none",
        });
      }
    };

    fetchSubscriptionAccess();
  }, []);

  // Fetch portfolio holdings for model portfolios
  useEffect(() => {
    const fetchPortfolioHoldings = async () => {
      if (isModelPortfolio && portfolioId) {
        try {
          const portfolio = await portfolioService.getById(portfolioId);
          if (portfolio && Array.isArray(portfolio.holdings)) {
            const map = new Map<string, number>();
            portfolio.holdings.forEach((h: any) => {
              if (h.symbol && typeof h.weight === "number") {
                map.set(h.symbol, h.weight);
              }
            });
            setPortfolioHoldingsMap(map);
          }
        } catch (err) {
          console.error(
            "Failed to fetch portfolio holdings for weightage:",
            err
          );
        }
      }
    };
    fetchPortfolioHoldings();
  }, [isModelPortfolio, portfolioId]);

  // Center the first tip on initial load
  useEffect(() => {
    if (tips.length > 0 && containerWidth > 0) {
      const centerPosition = containerWidth / 2;
      const cardCenter = dimensions.cardWidth / 2;
      const targetX = centerPosition - cardCenter;
      x.set(targetX);
      setCurrentIndex(0);
    }
  }, [tips.length, containerWidth, dimensions.cardWidth, x]);

  if (loading) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center overflow-hidden py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tips...</p>
        </div>
      </div>
    );
  }

  if (tips.length === 0) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center overflow-hidden py-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4 text-4xl">📊</div>
          <p className="text-gray-600">
            No tips available for the selected category.
          </p>
        </div>
      </div>
    );
  }

  const tipDates = tips.map((tip) => new Date(tip.date));

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-4">
      {/* Carousel Container */}
      <div
        className="relative w-full overflow-hidden"
        style={{ padding: `20px ${dimensions.containerPadding}px` }}
      >
        <div
          ref={containerRef}
          className="relative mx-auto flex items-center justify-center"
          style={{
            width: `${containerWidth}px`,
            height: `${dimensions.cardHeight + 20}px`,
          }}
        >
          <motion.div
            className="absolute left-0 top-0 flex items-center h-full"
            style={{ x }}
            drag="x"
            dragConstraints={{
              left: minX,
              right: maxX,
            }}
            onDrag={(e, info) => updateCurrentIndex(x.get())}
            onDragEnd={onDragEnd}
            dragElastic={0.1}
            dragMomentum={false}
          >
            {tips.map((tip, index) => {
              const isActive = index === currentIndex;
              return (
                <motion.div
                  key={tip.id}
                  className="flex-shrink-0"
                  style={{
                    width: dimensions.cardWidth,
                    height: dimensions.cardHeight,
                    marginRight: index === tips.length - 1 ? 0 : dimensions.gap,
                  }}
                  animate={{
                    y: isActive ? -4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <TipCard
                    tip={tip}
                    isActive={isActive}
                    onClick={() => handleTipClick(tip)}
                    isModelPortfolio={isModelPortfolio}
                    subscriptionAccess={subscriptionAccess}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        {containerWidth > 640 && tips.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 z-10",
                currentIndex === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50 hover:shadow-xl"
              )}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={goToNext}
              disabled={currentIndex === tips.length - 1}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 z-10",
                currentIndex === tips.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50 hover:shadow-xl"
              )}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Date Timeline Slider */}
      {tips.length > 1 && (
        <div className="mt-4 w-full max-w-2xl mx-auto px-4">
          <DateTimelineSlider
            dateRange={dateRange}
            selectedDate={currentTipDate}
            onDateChange={(date) => {
              console.log(
                "📅 Timeline Date Selected:",
                format(date, "dd MMM yyyy")
              );

              // Find the tip with the closest date to the selected date
              let closestTipIndex = 0;
              let minDiff = Infinity;

              tips.forEach((tip, index) => {
                const tipDate = new Date(tip.date);
                const diff = Math.abs(tipDate.getTime() - date.getTime());

                if (diff < minDiff) {
                  minDiff = diff;
                  closestTipIndex = index;
                }
              });

              // Only navigate if we found a significantly close tip (within 1 day)
              const closestTipDate = new Date(tips[closestTipIndex].date);
              const dayDiff = Math.abs(differenceInDays(date, closestTipDate));

              console.log("🎯 Timeline Navigation:", {
                selectedDate: format(date, "dd MMM yyyy"),
                closestTipDate: format(closestTipDate, "dd MMM yyyy"),
                closestTipIndex,
                dayDiff,
                willNavigate: dayDiff <= 1,
              });

              if (dayDiff <= 1) {
                goToTip(closestTipIndex);
              }
            }}
            className=""
            datesWithTips={tipDates}
          />
        </div>
      )}
    </div>
  );
}
