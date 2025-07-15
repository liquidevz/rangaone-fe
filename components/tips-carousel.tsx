"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion"
import { format, parseISO, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { tipsService, type Tip } from "@/services/tip.service"
import { subscriptionService, type SubscriptionAccess } from "@/services/subscription.service"
import { useRouter } from "next/navigation"
import DateTimelineSlider from "./date-timeline-slider"
import { Button } from "@/components/ui/button"

type TipCardData = {
  id: string
  portfolioId?: string
  date: string
  stockName: string
  exchange: string
  weightage: number
  buyRange: string
  action: "HOLD" | "Partial Profit Booked" | "BUY" | "SELL"
  category: "basic" | "premium"
  title: string
  message?: string
}

// Color schemes for basic and premium tips
const getTipColorScheme = (category: "basic" | "premium", isModelPortfolio: boolean = false) => {
  if (isModelPortfolio) {
    // Model portfolio tips use blue-to-green gradient theme
    return {
      gradient: "linear-gradient(90deg, #00B7FF 0%, #85D437 100%)", // Blue to green gradient
      textColor: "#047857", // Dark green text
      bgGradient: "linear-gradient(90deg, #e0f7ff 0%, #f1fef2 100%)", // Light blue to light green gradient
      borderColor: "#10B981", // Green border
      badge: {
        bg: "#000000", // Black background for Model Portfolio badge
        text: "#FFFFFF" // White text
      }
    }
  } else if (category === "premium") {
    return {
      gradient: "linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)", // Gold gradient
      textColor: "#92400E", // Dark gold text
      bgGradient: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)", // Light gold gradient
      borderColor: "#F59E0B",
      badge: {
        bg: "#92400E",
        text: "#FEF3C7"
      }
    }
  } else {
    return {
      gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)", // Blue gradient
      textColor: "#1E40AF", // Dark blue text
      bgGradient: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)", // Light blue gradient
      borderColor: "#3B82F6",
      badge: {
        bg: "#1E40AF",
        text: "#DBEAFE"
      }
    }
  }
}

const TipCard = ({ tip, isActive, onClick, isModelPortfolio, subscriptionAccess }: { 
  tip: TipCardData; 
  isActive: boolean; 
  onClick?: () => void;
  isModelPortfolio?: boolean;
  subscriptionAccess?: SubscriptionAccess;
}) => {
  const colorScheme = getTipColorScheme(tip.category, isModelPortfolio)
  
  // Determine if user has access to this tip
  const hasAccess = () => {
    console.log('=== TipCard Access Check ===', {
      tipId: tip.id,
      tipCategory: tip.category,
      subscriptionAccess: subscriptionAccess,
      hasSubscriptionAccess: !!subscriptionAccess,
      hasPremium: subscriptionAccess?.hasPremium,
      hasBasic: subscriptionAccess?.hasBasic,
      subscriptionType: subscriptionAccess?.subscriptionType,
      portfolioAccess: subscriptionAccess?.portfolioAccess
    });
    
    if (!subscriptionAccess) {
      console.log('No subscription access object found');
      return false;
    }
    
    // TEMPORARY FIX: If user has any subscription type that's not 'none', grant access
    // This should resolve the premium access issue
    if (subscriptionAccess.subscriptionType !== 'none') {
      console.log('User has active subscription type:', subscriptionAccess.subscriptionType, '- granting access');
      return true;
    }
    
    // If no subscription, check if it's a free tip
    if (tip.category === 'premium' || tip.category === 'basic') {
      console.log('Premium/Basic tip but no subscription - denying access');
      return false;
    }
    
    // Default access for uncategorized tips
    console.log('Uncategorized tip - granting access');
    return true;
  };

  const canAccessTip = hasAccess();
  const shouldShowTag = !canAccessTip;
  const shouldBlurContent = !canAccessTip;
  
  console.log('Final access decision:', {
    tipId: tip.id,
    category: tip.category,
    canAccessTip,
    shouldShowTag,
    shouldBlurContent
  });
  
  return (
  <div
    className={cn(
        // Reduce card width/height and padding for compactness
        "relative w-[340px] h-[170px] rounded-xl p-0.5 transition-all duration-300 cursor-pointer flex-shrink-0",
      isActive ? "scale-105 shadow-2xl" : "shadow-lg",
      onClick && "hover:scale-105 hover:shadow-2xl",
        shouldBlurContent && "overflow-hidden"
    )}
    style={{
        background: colorScheme.gradient,
    }}
      onClick={canAccessTip ? onClick : undefined}
  >
      <div className={cn(
        "w-full h-full bg-white rounded-[10px] p-4 flex flex-col justify-between relative",
        shouldBlurContent && "blur-sm"
      )}>
      <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isModelPortfolio ? (
                <div className="bg-black text-white text-xs font-medium rounded px-2 py-0.5">
                  Model Portfolio
                </div>
              ) : (
                // Show category badge (Basic/Premium) for regular tips
                <div
                  className="text-xs font-semibold rounded px-2 py-0.5 inline-block shadow-sm"
                  style={{
                    backgroundColor: colorScheme.badge.bg,
                    color: colorScheme.badge.text
                  }}
                >
                  {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-black mt-1 mb-0.5">{tip.stockName}</h3>
            <p className="text-xs text-gray-500">{tip.exchange}</p>
          </div>
          <div
            className="relative p-0.5 rounded shadow-sm ml-2"
            style={{ background: colorScheme.gradient }}
          >
            <div
              className="rounded-[4px] px-2 py-1 text-center min-w-[54px]"
              style={{ background: colorScheme.bgGradient }}
            >
              <p className="text-[10px] text-gray-500 mb-0">Weightage</p>
              <p className="text-lg font-bold text-black">{tip.weightage}%</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end mt-2">
          <div>
            <p className="text-[10px] text-gray-500 mb-0">Buy Range</p>
            <p className="text-xs font-semibold text-black">{tip.buyRange}</p>
          </div>
          <div
            className="px-3 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: colorScheme.borderColor,
              color: 'white'
            }}
          >
            {tip.action}
          </div>
        </div>
        {tip.message && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <p className="text-[10px] text-gray-600">{tip.message}</p>
          </div>
        )}
      </div>
      
      {/* Overlay for locked content */}
      {shouldBlurContent && (
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl flex items-center justify-center">
          <div className="bg-white rounded-lg p-3 text-center shadow-lg">
            <p className="text-xs text-gray-600 mb-2">
              {tip.category === 'premium' ? 'Premium subscription required' : 'Basic subscription required'}
            </p>
            <button
              className={cn(
                "px-3 py-1 rounded text-xs font-medium text-white",
                tip.category === 'premium' 
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              )}
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to pricing/upgrade page
                window.location.href = tip.category === 'premium' ? '/premium-subscription' : '/basic-subscription';
              }}
            >
              {tip.category === 'premium' ? 'Get Premium' : 'Get Basic'}
            </button>
        </div>
        </div>
      )}
  </div>
)
}

interface TipsCarouselProps {
  portfolioId?: string
  tips?: Tip[]
  loading?: boolean
  onTipClick?: (tipId: string) => void
  categoryFilter?: 'basic' | 'premium' | 'all'
  isModelPortfolio?: boolean
  sliderSize?: 'default' | 'large'
}

export default function TipsCarousel({ 
  portfolioId, 
  tips: propTips, 
  loading: propLoading, 
  onTipClick, 
  categoryFilter = 'all',
  isModelPortfolio = false,
  sliderSize = 'default',
}: TipsCarouselProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tips, setTips] = useState<TipCardData[]>([])
  const [loading, setLoading] = useState(propLoading || false)
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | undefined>(undefined)
  const [showAllTips, setShowAllTips] = useState(true) // Toggle between filtered and all tips
  const x = useMotionValue(0)
  const router = useRouter()

  // Set card and container sizes for 3 visible cards
  const CARD_WIDTH = 340;
  const CARD_MARGIN = 24;
  const VISIBLE_CARDS = 3;
  const CONTAINER_WIDTH = CARD_WIDTH * VISIBLE_CARDS + CARD_MARGIN * (VISIBLE_CARDS - 2);

  // Calculate date range from tips and get unique dates
  const { dateRange, uniqueDates } = useMemo(() => {
    if (tips.length === 0) {
      return {
        dateRange: {
          min: new Date('2024-01-01'),
          max: new Date()
        },
        uniqueDates: []
      }
    }
    
    const dates = tips.map(tip => new Date(tip.date));
    const validDates = dates.filter(date => !isNaN(date.getTime()));
    
    if (validDates.length === 0) {
      return {
        dateRange: {
          min: new Date('2024-01-01'),
          max: new Date()
        },
        uniqueDates: []
      }
    }
    
    // Get unique dates (removing time part)
    const uniqueDateStrings = Array.from(new Set(validDates.map(date => 
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
    )));
    
    const uniqueDatesArray = uniqueDateStrings
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());
    
    const minDate = uniqueDatesArray[0];
    const maxDate = uniqueDatesArray[uniqueDatesArray.length - 1];
    
    // Ensure we have at least a 7-day range for the slider to work properly
    const timeDiff = maxDate.getTime() - minDate.getTime();
    const minRange = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if (timeDiff < minRange) {
      // Extend the range to have at least 7 days
      const centerTime = minDate.getTime() + timeDiff / 2;
      return {
        dateRange: {
          min: new Date(centerTime - minRange / 2),
          max: new Date(centerTime + minRange / 2)
        },
        uniqueDates: uniqueDatesArray
      };
    }
    
    return {
      dateRange: {
        min: minDate,
        max: maxDate
      },
      uniqueDates: uniqueDatesArray
    };
  }, [tips])

  // Update selectedDate when tips are loaded
  useEffect(() => {
    if (uniqueDates.length > 0) {
      // Set to the latest date that has tips
      const latestDate = uniqueDates[uniqueDates.length - 1];
      setSelectedDate(new Date(latestDate));
    }
  }, [uniqueDates])

  // Get tips for the specific selected date only
  const filteredTips = useMemo(() => {
    return tips.filter(tip => {
      const tipDate = new Date(tip.date)
      return isSameDay(tipDate, selectedDate)
    }).sort((a, b) => {
      // Sort by creation time within the same date
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [tips, selectedDate])

  // Get the current visible tips (3 cards)
  const visibleTips = useMemo(() => {
    return filteredTips.slice(0, VISIBLE_CARDS)
  }, [filteredTips, VISIBLE_CARDS])

  // For normal carousel without filtering
  const allTips = useMemo(() => {
    return tips.sort((a, b) => {
      // Sort by creation time
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [tips])

  // Choose which tips to display based on showAllTips state
  const displayTips = useMemo(() => {
    return showAllTips ? allTips : visibleTips
  }, [showAllTips, allTips, visibleTips])

  // Reset to show all tips
  const handleReset = () => {
    setShowAllTips(true)
    // Reset to latest date
    if (uniqueDates.length > 0) {
      const latestDate = uniqueDates[uniqueDates.length - 1];
      setSelectedDate(new Date(latestDate));
    }
  }

  // Handle date change from timeline slider
  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setShowAllTips(false) // Switch to filtered view when date is changed
  }

  // Convert API tips to carousel format
  const convertTipsToCarouselFormat = (apiTips: Tip[]): TipCardData[] => {
    return apiTips.map((tip, index) => {
      // Try to extract stock name from title (before a colon or dash, or first word)
      let stockName = tip.title?.split(':')[0]?.split('-')[0]?.trim();
      if (!stockName) {
        stockName = tip.stockId || `Stock ${index + 1}`;
      }
      return {
        id: tip._id,
        portfolioId: typeof tip.portfolio === 'string' ? tip.portfolio : tip.portfolio?._id,
        date: tip.createdAt,
        stockName,
        exchange: "NSE", // Default to NSE, could be extracted from tip data
        weightage: tip.targetPercentage ? parseFloat(tip.targetPercentage.replace('%', '')) : 5.0,
        buyRange: tip.buyRange || "₹ 1000 - 1050",
        action: (tip.action as "HOLD" | "Partial Profit Booked" | "BUY" | "SELL") || "BUY",
        category: tip.category || "basic",
        title: tip.title,
        message: tip.message
      };
    });
  }

  // Handle tip click with conditional navigation
  const handleTipClick = (tip: TipCardData) => {
    if (onTipClick) {
      onTipClick(tip.id);
    } else {
      // If tip has portfolioId, navigate to portfolio-specific tip page
      if (tip.portfolioId) {
        router.push(`/model-portfolios/${tip.portfolioId}/tips/${tip.id}`);
      } else {
        router.push(`/rangaone-wealth/recommendation/${tip.id}`);
      }
    }
  };

  // Fetch tips if not provided
  useEffect(() => {
    const fetchTips = async () => {
      if (propTips) {
        let filteredTips = propTips;
        
        // Apply category filter
        if (categoryFilter !== 'all') {
          filteredTips = propTips.filter(tip => tip.category === categoryFilter);
        }
        
        setTips(convertTipsToCarouselFormat(filteredTips))
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        let apiTips: Tip[] = [];
        
        if (portfolioId) {
          // Fetch portfolio-specific tips
          apiTips = await tipsService.getPortfolioTips({ 
            portfolioId,
            category: categoryFilter !== 'all' ? categoryFilter : undefined
          });
        } else {
          // Fetch general tips
          apiTips = await tipsService.getAll({ 
            category: categoryFilter !== 'all' ? categoryFilter : undefined
          });
        }
        
        const carouselTips = convertTipsToCarouselFormat(apiTips)
        setTips(carouselTips)
      } catch (error) {
        console.error("Failed to fetch tips:", error)
        // Fallback to sample data
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
            title: "ZAGGLE Analysis"
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
            title: "BLUESTARCO Premium Analysis"
          },
        ]
        setTips(sampleTips)
      } finally {
        setLoading(false)
      }
    }

    fetchTips()
  }, [portfolioId, propTips, categoryFilter])

  // Fetch subscription access on mount
  useEffect(() => {
    const fetchSubscriptionAccess = async () => {
      try {
        console.log('Fetching subscription access...');
        // Clear cache to ensure fresh data
        subscriptionService.clearCache();
        const access = await subscriptionService.getSubscriptionAccess(true);
        console.log('Subscription access loaded:', access);
        setSubscriptionAccess(access);
        
        // If access is not what we expect, try to diagnose the issue
        if (access.subscriptionType === 'none' || (!access.hasPremium && !access.hasBasic)) {
          console.log('Potential subscription access issue detected, running diagnosis...');
          await subscriptionService.diagnoseSubscriptionIssue();
        }
      } catch (error) {
        console.error('Failed to fetch subscription access:', error);
        // Set default no-access state
        setSubscriptionAccess({
          hasBasic: false,
          hasPremium: false,
          portfolioAccess: [],
          subscriptionType: 'none'
        });
      }
    };

    fetchSubscriptionAccess();
  }, []);

  // Animate to center the visible tips
  useEffect(() => {
    if (visibleTips.length === 0) return
    const newX = 0 // Always center the visible tips
    animate(x, newX, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.5,
    })
  }, [visibleTips, x])

  // Handle drag end to snap back to center
  const onDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Simple snap back to center for date-based navigation
    const newX = 0
    animate(x, newX, { type: "spring", stiffness: 300, damping: 30 })
  }

  if (loading) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center overflow-hidden py-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tips...</p>
        </div>
      </div>
    )
  }

  if (tips.length === 0) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center overflow-hidden py-4">
        <div className="text-center">
          <div className="text-gray-400 mb-4 text-4xl">📊</div>
          <p className="text-gray-600">No tips available for the selected category.</p>
        </div>
      </div>
    )
  }

  // Show message when no tips are available for the current date (only when in filtered mode)
  if (tips.length > 0 && filteredTips.length === 0 && !showAllTips) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center overflow-visible px-1">
        {/* Empty state container with same width as carousel */}
        <div className="relative" style={{ width: `${CONTAINER_WIDTH}px`, height: '170px', margin: '0 auto' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4 text-4xl">📅</div>
              <p className="text-gray-600 text-lg mb-4">No tips available for {format(selectedDate, 'dd MMMM yyyy')}</p>
              <p className="text-gray-500 text-sm">Use the timeline below to navigate to a date with tips</p>
            </div>
          </div>
        </div>
        
        {/* Date Timeline Slider with Reset Button - positioned consistently */}
        {tips.length > 0 && (
          <div className={sliderSize === 'large' ? "w-full max-w-4xl mt-10" : "w-full max-w-2xl mt-6"}>
            <div className="flex flex-col items-center space-y-4">
              <DateTimelineSlider
                dateRange={dateRange}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                className={sliderSize === 'large' ? "h-32" : "h-24"}
              />
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                Show All Tips
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center overflow-visible px-1">
      {/* Carousel Container */}
      <div className="relative" style={{ width: `${CONTAINER_WIDTH}px`, height: '170px', margin: '0 auto' }}>
        <motion.div
          className="absolute left-0 top-0 flex items-center h-full"
          style={{
            x,
            paddingLeft: 0,
            paddingRight: 0,
          }}
          drag="x"
          dragConstraints={{
            left: -(displayTips.length - VISIBLE_CARDS) * (CARD_WIDTH + CARD_MARGIN),
            right: 0,
          }}
          onDragEnd={onDragEnd}
          dragElastic={0.1}
        >
          {displayTips.map((tip, index) => {
            // All visible tips are displayed equally
            const isActive = index === 0; // First tip is featured
            return (
              <motion.div
                key={tip.id}
                className="flex-shrink-0"
                style={{
                  width: CARD_WIDTH,
                  marginRight: index === displayTips.length - 1 ? 0 : CARD_MARGIN,
                }}
                animate={{
                  scale: isActive ? 1 : 0.92,
                  y: isActive ? 0 : 10,
                  opacity: 1,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                <TipCard 
                  tip={tip} 
                  isActive={isActive} 
                  onClick={() => handleTipClick(tip)}
                  isModelPortfolio={isModelPortfolio}
                  subscriptionAccess={subscriptionAccess}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Remove connecting line and date display for compactness */}

      {/* Date Timeline Slider with Reset Button */}
      {tips.length > 0 && (
        <div className={sliderSize === 'large' ? "w-full max-w-4xl mt-10" : "w-full max-w-2xl mt-6"}>
          <div className="flex flex-col items-center space-y-4">
            <DateTimelineSlider
              dateRange={dateRange}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              className={sliderSize === 'large' ? "h-32" : "h-24"}
            />
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Show All Tips
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 