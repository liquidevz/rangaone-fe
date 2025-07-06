"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Tip, tipsService } from "@/services/tip.service";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { format, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

// Helper function to parse buy range
const parseBuyRange = (buyRange: string) => {
  if (!buyRange) return { min: 0, max: 0 };
  const cleanRange = buyRange.replace(/[₹,]/g, '').trim();
  if (cleanRange.includes('-')) {
    const [min, max] = cleanRange.split('-').map(num => parseFloat(num.trim()));
    return { min: min || 0, max: max || 0 };
  }
  const value = parseFloat(cleanRange);
  return { min: value || 0, max: value || 0 };
};

export default function RangaoneWealth() {
  const [allTips, setAllTips] = useState<Tip[]>([]);
  const [activeTips, setActiveTips] = useState<Tip[]>([]);
  const [closedTips, setClosedTips] = useState<Tip[]>([]);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [closedDate, setClosedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Load and organize tips
  useEffect(() => {
    async function loadTips() {
      try {
        console.log("Loading tips...");
        const data = await tipsService.getAll();
        console.log("Tips loaded successfully:", data);
        
        // Ensure data is an array
        const tipsArray = Array.isArray(data) ? data : [];
        
        // Sort tips by date (newest first)
        const sortedTips = [...tipsArray].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setAllTips(sortedTips);
        
        // Separate and sort active/closed tips
        const active = sortedTips.filter(tip => tip.status === "Active");
        const closed = sortedTips.filter(tip => tip.status !== "Active");
        
        setActiveTips(active);
        setClosedTips(closed);

        // Set initial dates to latest tips
        if (active.length > 0) {
          setActiveDate(new Date(active[0].createdAt));
        }
        if (closed.length > 0) {
          setClosedDate(new Date(closed[0].createdAt));
        }
        
        console.log("Tips organized - Active:", active.length, "Closed:", closed.length);
      } catch (error) {
        console.error("Failed to load tips:", error);
        toast({
          title: "Error",
          description: "Failed to load tips. Please try again later.",
          variant: "destructive",
        });
        
        // Set empty arrays to prevent crashes
        setAllTips([]);
        setActiveTips([]);
        setClosedTips([]);
      } finally {
        setLoading(false);
      }
    }

    loadTips();
  }, [toast]);

  // Memoized date ranges
  const { activeDateRange, closedDateRange } = useMemo(() => {
    return {
      activeDateRange: activeTips.length > 0 ? {
        min: new Date(Math.min(...activeTips.map(tip => new Date(tip.createdAt).getTime()))),
        max: new Date(Math.max(...activeTips.map(tip => new Date(tip.createdAt).getTime())))
      } : {
        min: new Date('2024-01-01'),
        max: new Date('2025-12-31')
      },
      closedDateRange: closedTips.length > 0 ? {
        min: new Date(Math.min(...closedTips.map(tip => new Date(tip.createdAt).getTime()))),
        max: new Date(Math.max(...closedTips.map(tip => new Date(tip.createdAt).getTime())))
      } : {
        min: new Date('2024-01-01'),
        max: new Date('2025-12-31')
      }
    };
  }, [activeTips, closedTips]);

  // Enhanced tip filtering with date and category handling
  const filterTipsWithHighlight = useCallback((tips: Tip[], selectedDate: Date) => {
    return tips
      .filter(tip => {
        const tipDate = new Date(tip.createdAt);
        return tipDate <= selectedDate;
      })
      .map(tip => ({
        ...tip,
        isCurrentDate: isSameDay(new Date(tip.createdAt), selectedDate)
      }))
      .sort((a, b) => {
        // Sort by current date first, then by creation date
        if (a.isCurrentDate && !b.isCurrentDate) return -1;
        if (!a.isCurrentDate && b.isCurrentDate) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, []);

  // Slider change handler with smooth updates and animations
  const handleSliderChange = useCallback((value: number, setDate: (date: Date) => void) => {
    const newDate = new Date(value);
    setDate(newDate);
  }, []);

  function RecommendationsSection({
    title,
    buttonText,
    buttonLink,
    recommendations,
    dateRange,
    selectedDate,
    onDateChange,
    sectionType
  }: {
    title: string;
    buttonText: string;
    buttonLink: string;
    recommendations: (Tip & { isCurrentDate?: boolean })[];
    dateRange: { min: Date; max: Date };
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    sectionType: 'active' | 'closed';
  }) {
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({
      loop: false,
      align: "center",
      skipSnaps: false,
      dragFree: false,
      containScroll: "trimSnaps",
      slidesToScroll: 1,
    });

    const filteredRecommendations = useMemo(() => 
      activeFilter === "all"
        ? recommendations
        : recommendations.filter(
            (rec) => rec.category?.toLowerCase() === activeFilter.toLowerCase()
          ),
      [recommendations, activeFilter]
    );

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
      if (!emblaApi) return;
      const currentIndex = emblaApi.selectedScrollSnap();
      setSelectedIndex(currentIndex);
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
        // Reset to first slide when filter changes
        emblaApi.scrollTo(0);
        setSelectedIndex(0);
      }
    }, [emblaApi, filteredRecommendations]);

    return (
      <section className="w-full space-y-8">
        {/* Section Title */}
        <div className="text-center px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          
          {/* Filter Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex rounded-lg overflow-hidden shadow-sm border border-gray-200 w-full max-w-sm sm:max-w-md">
              <button
                className={cn(
                  "flex-1 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200",
                  activeFilter === "all"
                    ? "bg-gray-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                )}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>
              <button
                className={cn(
                  "flex-1 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200",
                  activeFilter === "basic"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                )}
                onClick={() => setActiveFilter("basic")}
              >
                Basic
              </button>
              <button
                className={cn(
                  "flex-1 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200",
                  activeFilter === "premium"
                    ? "bg-yellow-500 text-white"
                    : "bg-white text-yellow-600 hover:bg-yellow-50"
                )}
                onClick={() => setActiveFilter("premium")}
              >
                Premium
              </button>
            </div>
          </div>
        </div>

                {/* Recommendations Carousel */}
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 sm:gap-6 md:gap-6 py-10">
              {filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((recommendation, index) => {
                  // Simple center calculation: middle card in view
                  const isCenter = index  === selectedIndex;
                  
                  return (
                    <div
                      key={recommendation._id}
                      className={cn(
                        "flex-none transition-all duration-300 ease-in-out",
                        // Compact responsive card widths - fits 3 cards nicely
                        "w-72 sm:w-80 md:w-96 lg:w-[26rem] xl:w-[28rem]",
                        // Mobile: single card view, Tablet: 2 cards, Desktop: 3 cards
                        "min-w-[288px] sm:min-w-[320px] md:min-w-[384px] lg:min-w-[416px]",
                        isCenter 
                          ? "scale-105 sm:scale-110 z-10 opacity-100 shadow-xl" 
                          : "scale-95 sm:scale-95 opacity-70 shadow-md"
                      )}
                    >
                      <RecommendationCard 
                        recommendation={recommendation} 
                        sectionType={sectionType}
                        isCenter={isCenter}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="flex-none w-full flex items-center justify-center py-12">
                  <p className="text-gray-500">No recommendations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          {filteredRecommendations.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-20",
                  "left-0 -translate-x-2 sm:-translate-x-4",
                  "p-2 sm:p-3",
                  "w-8 h-8 sm:w-12 sm:h-12"
                )}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-20",
                  "right-0 translate-x-2 sm:translate-x-4",
                  "p-2 sm:p-3",
                  "w-8 h-8 sm:w-12 sm:h-12"
                )}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Date Display and Slider */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 px-4">
          {/* Date Display */}
          <div className="bg-black text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-medium">
            {format(selectedDate, 'dd MMMM yyyy')}
          </div>

          {/* Timeline Visualization with Interactive Slider */}
          <div className="w-full max-w-4xl relative">
            {/* Timeline bars background */}
            <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-3 sm:mb-4">
              {Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-0.5 sm:w-1 bg-gray-300 transition-all duration-200",
                    i === 12 ? "h-8 sm:h-12" : i % 4 === 0 ? "h-6 sm:h-8" : "h-3 sm:h-4"
                  )}
                />
              ))}
            </div>
            
            {/* Interactive Slider */}
            <div className="px-4 sm:px-8">
              <Slider
                value={[selectedDate.getTime()]}
                min={dateRange.min.getTime()}
                max={dateRange.max.getTime()}
                step={86400000}
                onValueChange={(value) => onDateChange(new Date(value[0]))}
                className="py-2"
              />
            </div>
            
            {/* Date Range Display */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4 px-4 sm:px-8">
              <span>From: {format(dateRange.min, 'dd MMM yyyy')}</span>
              <span>To: {format(dateRange.max, 'dd MMM yyyy')}</span>
            </div>
          </div>

          {/* View All Button */}
          <Link href={buttonLink}>
            <Button
              className="bg-indigo-950 hover:bg-indigo-900 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-medium transition-all duration-200"
            >
              {buttonText}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  function RecommendationCard({ 
    recommendation, 
    sectionType,
    isCenter = false
  }: { 
    recommendation: Tip & { isCurrentDate?: boolean };
    sectionType: 'active' | 'closed';
    isCenter?: boolean;
  }) {
    const buyRange = parseBuyRange(recommendation.buyRange);
    const targetPrice = parseFloat(recommendation.targetPrice) || 0;
    // Parse targetPercentage - it comes as string like "20%" from API
    const targetPercentage = parseFloat(recommendation.targetPercentage?.toString().replace('%', '') || '0') || 0;
    
    // Determine category styling
    const getCategoryStyle = (category: string) => {
      switch (category?.toLowerCase()) {
        case 'basic':
          return {
            bg: 'bg-blue-600',
            border: 'border-blue-200',
            highlight: recommendation.isCurrentDate ? 'border-blue-500 ring-2 ring-blue-200' : ''
          };
        case 'premium':
          return {
            bg: 'bg-yellow-500',
            border: 'border-yellow-200',
            highlight: recommendation.isCurrentDate ? 'border-yellow-500 ring-2 ring-yellow-200' : ''
          };
        default:
          return {
            bg: 'bg-pink-500',
            border: 'border-pink-200',
            highlight: recommendation.isCurrentDate ? 'border-pink-500 ring-2 ring-pink-200' : ''
          };
      }
    };

    const categoryStyle = getCategoryStyle(recommendation.category || 'basic');

    return (
      <Link href={`/rangaone-wealth/recommendation/${recommendation._id}`}>
        <div
          className={cn(
            "bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg cursor-pointer w-full",
            "p-3 sm:p-4",
            "flex flex-col",
            "h-auto max-h-[270px]",
            categoryStyle.border,
            categoryStyle.highlight,
            isCenter ? "shadow-xl" : "shadow-sm"
          )}
        >
          {/* Top Section: Category and Target */}
          <div className="flex items-end justify-between mb-3">
            <div className={cn(
              "px-2 py-1 text-xs font-semibold text-white rounded-full",
              categoryStyle.bg
            )}>
              {recommendation.category || "basic"}
            </div>
            
            <div className="bg-green-500 text-white px-2 py-1.5 rounded-lg text-center min-w-[70px]">
              <div className="text-xs font-semibold">Target</div>
              <div className="text-lg font-bold">{targetPercentage.toFixed(0)}%</div>
              <div className="text-xs opacity-90">upto</div>
            </div>
          </div>

          {/* Main Content: Stock Info */}
          <div className="flex-1 mb-3">
            <h3 className="text-base sm:text-lg font-bold text-black leading-tight mb-1 line-clamp-1">
              {recommendation.title.split(" - ")[0] || recommendation.title}
            </h3>
            <div className="text-sm text-gray-600 font-medium mb-1">
              {recommendation.stockId || recommendation.title.split(" ")[0]}
            </div>
            <div className="text-sm text-gray-500 mb-1">NSE</div>
            <div className="text-sm text-black font-medium">
              Action:- <span className="font-bold">{(recommendation.action || "Buy").toUpperCase()}</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Entry Price</div>
                <div className="text-sm font-bold text-black">
                  {buyRange.min > 0 && buyRange.max > 0 && buyRange.min !== buyRange.max
                    ? `₹${buyRange.min.toLocaleString()}`
                    : formatCurrency(buyRange.min || buyRange.max)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Target Price</div>
                <div className="text-sm font-bold text-black">
                  {targetPrice > 0 ? formatCurrency(targetPrice) : "₹NaN"}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="border-t border-gray-100 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {format(new Date(recommendation.createdAt), "dd MMM yyyy")}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-semibold",
                recommendation.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              )}>
                {recommendation.status}
              </span>
            </div>
          </div>

          {/* Additional Info for Closed Recommendations */}
          {sectionType === 'closed' && recommendation.exitStatusPercentage !== undefined && (
            <div className="mt-2">
              <div className={cn(
                "inline-block px-2 py-0.5 rounded text-xs font-semibold",
                parseFloat(recommendation.exitStatusPercentage?.toString().replace('%', '') || '0') > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
              )}>
                {parseFloat(recommendation.exitStatusPercentage?.toString().replace('%', '') || '0') > 0 ? 'Profit Booked' : 'Loss Booked'} {Math.abs(parseFloat(recommendation.exitStatusPercentage?.toString().replace('%', '') || '0')).toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <DashboardLayout userId="1">
        <div className="space-y-8">
          <PageHeader
            title="Rangaone Wealth"
            subtitle="Expert stock recommendations and portfolio management"
          />
          <div className="space-y-8">
            <div className="text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-10 w-80 mx-auto mb-8" />
            </div>
            <div className="flex gap-6 justify-center">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-80 h-64" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userId="1">
      <div className="flex flex-col w-full space-y-12">
        <PageHeader
          title="Rangaone Wealth"
          subtitle="Expert stock recommendations and portfolio management"
        />

        <div className="space-y-16">
          {/* Expert Recommendations Section */}
          <RecommendationsSection
            title="EXPERT RECOMMENDATIONS"
            buttonText="View All Recommendations"
            buttonLink="/rangaone-wealth/all-recommendations"
            recommendations={filterTipsWithHighlight(activeTips, activeDate)}
            dateRange={activeDateRange}
            selectedDate={activeDate}
            onDateChange={setActiveDate}
            sectionType="active"
          />

          {/* Closed Recommendations Section */}
          <RecommendationsSection
            title="CLOSED RECOMMENDATIONS"
            buttonText="View All Closed Recommendations"
            buttonLink="/rangaone-wealth/closed-recommendations"
            recommendations={filterTipsWithHighlight(closedTips, closedDate)}
            dateRange={closedDateRange}
            selectedDate={closedDate}
            onDateChange={setClosedDate}
            sectionType="closed"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
