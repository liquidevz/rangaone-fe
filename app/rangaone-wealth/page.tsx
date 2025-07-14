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
import TipsCarousel from "@/components/tips-carousel";

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
  const [mainFilter, setMainFilter] = useState<string>("all");
  const [closedFilter, setClosedFilter] = useState<string>("all");

  // Load and organize tips
  useEffect(() => {
    async function loadTips() {
      try {
        console.log("Loading tips from /api/user/tips...");
        const data = await tipsService.getAll(); // This now only uses /api/user/tips
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

  // Filtering logic for carousels
  const filteredMainTips = useMemo(() =>
    mainFilter === "all"
      ? allTips
      : allTips.filter(tip => tip.category?.toLowerCase() === mainFilter),
    [allTips, mainFilter]
  );
  const filteredClosedTips = useMemo(() =>
    closedFilter === "all"
      ? closedTips
      : closedTips.filter(tip => tip.category?.toLowerCase() === closedFilter),
    [closedTips, closedFilter]
  );

  // Navigation handler for tips
  const handleTipClick = (tipId: string) => {
    router.push(`/rangaone-wealth/recommendation/${tipId}`);
  };

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
        <PageHeader
          title="Rangaone Wealth"
        subtitle="Expert Model Portfolio & Stock Recommendations"
      />

      {/* Main Tips Filter */}
      <div className="flex justify-center mb-4 gap-2">
        <Button
          variant={mainFilter === "all" ? "default" : "outline"}
          onClick={() => setMainFilter("all")}
        >
          All
        </Button>
        <Button
          variant={mainFilter === "basic" ? "default" : "outline"}
          onClick={() => setMainFilter("basic")}
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
        >
          Basic
        </Button>
        <Button
          variant={mainFilter === "premium" ? "default" : "outline"}
          onClick={() => setMainFilter("premium")}
          className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
        >
          Premium
        </Button>
      </div>

      {/* Tips Carousel Section */}
      <div className="mt-20 mb-10">
        <TipsCarousel 
          tips={allTips} 
          loading={loading} 
          onTipClick={handleTipClick} 
          categoryFilter={mainFilter as 'basic' | 'premium' | 'all'}
          sliderSize="large"
        />
      </div>

          {/* Closed Recommendations Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 text-center">Closed Recommendations</h2>
        <div className="flex justify-center mb-4 gap-2">
          <Button
            variant={closedFilter === "all" ? "default" : "outline"}
            onClick={() => setClosedFilter("all")}
          >
            All
          </Button>
          <Button
            variant={closedFilter === "basic" ? "default" : "outline"}
            onClick={() => setClosedFilter("basic")}
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            Basic
          </Button>
          <Button
            variant={closedFilter === "premium" ? "default" : "outline"}
            onClick={() => setClosedFilter("premium")}
            className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
          >
            Premium
          </Button>
        </div>
        <TipsCarousel 
          tips={closedTips} 
          loading={loading} 
          onTipClick={handleTipClick} 
          categoryFilter={closedFilter as 'basic' | 'premium' | 'all'}
        />
      </div>
    </DashboardLayout>
  );
}
