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
import { Card, CardContent } from "@/components/ui/card";
import TipsCarousel from "@/components/tips-carousel";
import { useAuth } from "@/components/auth/auth-context"; // Import useAuth
import { subscriptionService, type SubscriptionAccess } from "@/services/subscription.service"; // Import subscriptionService and SubscriptionAccess

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

  const { isAuthenticated, isLoading: authLoading } = useAuth(); // Get auth state
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | undefined>(); // State for subscription access

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
        console.log("All Tips data being passed:", sortedTips);
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

    // Load subscription access
    async function loadSubscriptionAccess() {
      try {
        const access = await subscriptionService.getSubscriptionAccess(true);
        setSubscriptionAccess(access);
        console.log("Subscription access data being passed:", access);
      } catch (error) {
        console.error("Failed to load subscription access:", error);
      }
    }

    loadTips();
    loadSubscriptionAccess();
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

  // Filtering logic for carousels - filter by status AND category
  const filteredMainTips = useMemo(() => {
    // First filter by status (Active tips only)
    const activeOnly = activeTips;
    
    // Then filter by category if needed
    if (mainFilter === "all") {
      return activeOnly;
    } else {
      return activeOnly.filter(tip => tip.category?.toLowerCase() === mainFilter);
    }
  }, [activeTips, mainFilter]);
  
  const filteredClosedTips = useMemo(() => {
    // First filter by status (Closed tips only)
    const closedOnly = closedTips;
    
    // Then filter by category if needed
    if (closedFilter === "all") {
      return closedOnly;
    } else {
      return closedOnly.filter(tip => tip.category?.toLowerCase() === closedFilter);
    }
  }, [closedTips, closedFilter]);

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
          title="RANGAONE WEALTH"
        subtitle="Expert Model Portfolio & Stock Recommendations"
      />



      {/* Open Recommendations Section */}
      <Card className="mt-12 mb-12 shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Open Recommendations</h2>
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
          <TipsCarousel 
            tips={filteredMainTips} 
            loading={loading} 
            onTipClick={handleTipClick} 
            categoryFilter={mainFilter as 'basic' | 'premium' | 'all'}
            sliderSize="large"
            userSubscriptionAccess={subscriptionAccess} // Pass subscription access
          />
        </CardContent>
      </Card>

      {/* Closed Recommendations Section */}
      <Card className="mt-12 mb-12 shadow-sm border border-gray-200">
        <CardContent className="p-6">
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
            tips={filteredClosedTips} 
            loading={loading} 
            onTipClick={handleTipClick} 
            categoryFilter={closedFilter as 'basic' | 'premium' | 'all'}
            userSubscriptionAccess={subscriptionAccess} // Pass subscription access
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
