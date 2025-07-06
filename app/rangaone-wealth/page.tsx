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
        const data = await tipsService.getAll();
        
        // Sort tips by date (newest first)
        const sortedTips = [...data].sort((a, b) => 
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
      } catch (error) {
        console.error("Failed to load tips:", error);
        toast({
          title: "Error",
          description: "Failed to load tips. Please try again later.",
          variant: "destructive",
        });
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

  // Slider change handler with smooth updates
  const handleSliderChange = useCallback((value: number, setDate: (date: Date) => void) => {
    setDate(new Date(value));
  }, []);

  function RecommendationsSection({
    title,
    buttonText,
    buttonLink,
    recommendations,
    dateRange,
  }: {
    title: string;
    buttonText: string;
    buttonLink: string;
    recommendations: (Tip & { isCurrentDate?: boolean })[];
    dateRange: { min: Date; max: Date };
  }) {
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [emblaRef, emblaApi] = useEmblaCarousel({
      loop: false,
      align: "start",
      skipSnaps: false,
      dragFree: true,
      containScroll: "trimSnaps",
    });
    const [selectedIndex, setSelectedIndex] = useState(0);

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
      <section className="w-full space-y-6">
        {title && (
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {title}
          </h2>
        )}

        {/* Filter Tabs */}
        <div className="flex justify-start">
          <div className="grid grid-cols-3 w-full max-w-xs rounded-lg overflow-hidden shadow-sm">
            {["all", "basic", "premium"].map((filter) => (
              <button
                key={filter}
                className={cn(
                  "py-2.5 px-4 text-white font-medium text-sm transition-all duration-200",
                  {
                    "bg-gray-700 shadow-inner": filter === "all" && activeFilter === "all",
                    "bg-gray-600 hover:bg-gray-700": filter === "all" && activeFilter !== "all",
                    "bg-blue-700 shadow-inner": filter === "basic" && activeFilter === "basic",
                    "bg-blue-600 hover:bg-blue-700": filter === "basic" && activeFilter !== "basic",
                    "bg-yellow-600 shadow-inner": filter === "premium" && activeFilter === "premium",
                    "bg-yellow-500 hover:bg-yellow-600": filter === "premium" && activeFilter !== "premium",
                  }
                )}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Display */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>From: {format(dateRange.min, 'dd MMM yyyy')}</span>
          <span>To: {format(dateRange.max, 'dd MMM yyyy')}</span>
        </div>

        {/* Recommendations Carousel */}
        <div className="relative">
          <div className="overflow-hidden rounded-xl" ref={emblaRef}>
            <div className="flex -ml-4">
              {filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((recommendation, index) => (
                  <motion.div
                    key={recommendation._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      "flex-[0_0_100%] min-w-0 pl-4",
                      "sm:flex-[0_0_calc(50%-1rem)]",
                      "lg:flex-[0_0_calc(33.333%-1rem)]",
                      "transition-all duration-300",
                      {
                        "opacity-100": index === selectedIndex,
                        "opacity-70": index !== selectedIndex,
                      }
                    )}
                  >
                    <Link
                      href={`/rangaone-wealth/recommendation/${recommendation._id}`}
                      className="block h-full"
                    >
                      <div
                        className={cn(
                          "relative rounded-xl border-2 overflow-hidden bg-white h-full",
                          "transition-all duration-300 hover:shadow-lg",
                          recommendation.isCurrentDate
                            ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50 shadow-lg"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {/* Category and Target Badge */}
                        <div className="flex justify-between">
                          <Badge
                            className={cn(
                              "rounded-none rounded-br px-3 py-1",
                              recommendation.category?.toLowerCase() === "premium"
                                ? "bg-yellow-500"
                                : "bg-blue-600"
                            )}
                          >
                            {recommendation.category}
                          </Badge>
                          <Badge
                            className={cn(
                              "rounded-none rounded-bl px-3 py-1",
                              Number(recommendation.targetPercentage || 0) > 0
                                ? "bg-green-500"
                                : "bg-gray-500"
                            )}
                          >
                            {Number(recommendation.targetPercentage || 0).toFixed(2)}%
                          </Badge>
                        </div>

                        {/* Current Date Indicator */}
                        {recommendation.isCurrentDate && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                            Current Date
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-4">
                          <div className="mb-4">
                            <h3 className="text-lg font-bold line-clamp-2">
                              {recommendation.title}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {recommendation.stockId}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Entry Price</p>
                              <p className="font-medium text-sm">
                                {formatCurrency(Number(recommendation.buyRange))}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Target Price</p>
                              <p className="font-medium text-sm">
                                {formatCurrency(Number(recommendation.targetPrice))}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {format(new Date(recommendation.createdAt), 'dd MMM yyyy')}
                              </span>
                              <Badge variant={recommendation.status === 'Active' ? 'secondary' : 'outline'}>
                                {recommendation.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="flex-[0_0_100%] flex items-center justify-center py-12">
                  <p className="text-gray-500">No recommendations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          {filteredRecommendations.length > 0 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute top-1/2 -translate-y-1/2 -left-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
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
                className="absolute top-1/2 -translate-y-1/2 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
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
            </>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href={buttonLink}>
            <Button
              variant="outline"
              className="bg-indigo-950 text-white hover:bg-indigo-900"
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
            </Button>
          </Link>
        </div>
      </section>
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
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userId="1">
      <div className="flex flex-col w-full space-y-8">
        <PageHeader
          title="Rangaone Wealth"
          subtitle="Expert stock recommendations and portfolio management"
        />

        <div className="space-y-12">
          {/* Expert Recommendations Section */}
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              EXPERT RECOMMENDATIONS
            </h2>
            
            {/* Active Tips Slider */}
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-10">
                <div className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                  {format(activeDate, 'dd MMMM yyyy')}
                </div>
              </div>

              <div className="bg-gray-100 p-8 pt-12 rounded-xl">
                <Slider
                  value={[activeDate.getTime()]}
                  min={activeDateRange.min.getTime()}
                  max={activeDateRange.max.getTime()}
                  step={86400000}
                  onValueChange={(value) => handleSliderChange(value[0], setActiveDate)}
                  className="py-4"
                />
              </div>
            </div>

            <RecommendationsSection
              title=""
              buttonText="View All Recommendations"
              buttonLink="/rangaone-wealth/all-recommendations"
              recommendations={filterTipsWithHighlight(activeTips, activeDate)}
              dateRange={activeDateRange}
            />
          </div>

          {/* Closed Recommendations Section */}
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              CLOSED RECOMMENDATIONS
            </h2>
            
            {/* Closed Tips Slider */}
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-10">
                <div className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                  {format(closedDate, 'dd MMMM yyyy')}
                </div>
              </div>

              <div className="bg-gray-100 p-8 pt-12 rounded-xl">
                <Slider
                  value={[closedDate.getTime()]}
                  min={closedDateRange.min.getTime()}
                  max={closedDateRange.max.getTime()}
                  step={86400000}
                  onValueChange={(value) => handleSliderChange(value[0], setClosedDate)}
                  className="py-4"
                />
              </div>
            </div>

            <RecommendationsSection
              title=""
              buttonText="View All Closed Recommendations"
              buttonLink="/rangaone-wealth/closed-recommendations"
              recommendations={filterTipsWithHighlight(closedTips, closedDate)}
              dateRange={closedDateRange}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
