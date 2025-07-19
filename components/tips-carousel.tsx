"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion"

import { cn } from "@/lib/utils"
import { tipsService, type Tip } from "@/services/tip.service"
import { subscriptionService, type SubscriptionAccess } from "@/services/subscription.service"
import { useRouter } from "next/navigation"
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

const getTipColorScheme = (category: "basic" | "premium", isModelPortfolio: boolean = false) => {
  if (isModelPortfolio) {
    return {
      gradient: "linear-gradient(90deg, #00B7FF 0%, #85D437 100%)",
      textColor: "#047857",
      bgGradient: "linear-gradient(90deg, #e0f7ff 0%, #f1fef2 100%)",
      borderColor: "#10B981",
      badge: {
        bg: "#000000",
        text: "#FFFFFF"
      }
    }
  } else if (category === "premium") {
    return {
      gradient: "linear-gradient(90deg, #FFD700 30%, #3333330A 90%)",
      textColor: "#92400E",
      bgGradient: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
      borderColor: "#F59E0B",
      badge: {
        bg: "#92400E",
        text: "linear-gradient(to right, #92400E, #FEF3C7)"
      }      
    }
  } else {
    return {
      gradient: "linear-gradient(90deg, #595CFF 30%, #3333330A 90%)",
      textColor: "#1E40AF",
      bgGradient: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
      borderColor: "#595CFF",
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
  
  const hasAccess = () => {
    if (!subscriptionAccess) {
      return false;
    }

    if (subscriptionAccess.hasPremium) {
      return true;
    }
    
    if (tip.category === 'premium') {
      return false;
    } else if (tip.category === 'basic') {
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
        isActive ? "scale-105 sm:scale-110 shadow-2xl z-20" : "scale-95 sm:scale-90 opacity-70 shadow-md",
        onClick && "hover:scale-100 sm:hover:scale-105 hover:shadow-xl"
      )}
      style={{
        background: colorScheme.gradient,
        padding: isActive ? '3px' : '2px'
      }}
      onClick={canAccessTip ? onClick : undefined}
    >
              <div className="w-full h-full bg-white rounded-[10px] p-2.5 sm:p-3 md:p-4 lg:p-5 flex flex-col justify-between relative overflow-hidden">
        <div className={cn(
          "w-full h-full flex flex-col justify-between relative z-10",
          shouldBlurContent && "blur-sm"
        )}>
                     <div className="flex justify-between items-start gap-2 sm:gap-3">
             <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-2 sm:mb-3">
                 {isModelPortfolio ? (
                   <div className="relative bg-gradient-to-r from-[#00B7FF] to-[#85D437] p-[2px] rounded-lg">
                     <div className="bg-black text-xs sm:text-sm font-bold rounded-md px-2.5 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap">
                       <span className="bg-gradient-to-r from-[#00B7FF] to-[#85D437] bg-clip-text text-transparent font-bold">
                         Model Portfolio
                       </span>
                     </div>
                   </div>
                 ) : (
                   <div
                     className="text-xs sm:text-sm font-semibold rounded px-2 sm:px-2.5 py-0.5 sm:py-1 inline-block shadow-sm whitespace-nowrap"
                     style={{
                       backgroundColor: colorScheme.badge.bg,
                       color: colorScheme.badge.text
                     }}
                   >
                     {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
                   </div>
                 )}
               </div>
               <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-black mt-1 mb-1 sm:mb-1.5 line-clamp-1">{tip.stockName}</h3>
               <p className="text-xs sm:text-sm text-gray-500">{tip.exchange}</p>
             </div>
             <div className="relative bg-gradient-to-r from-[#00B7FF] to-[#85D437] p-[2px] rounded-lg flex-shrink-0">
               <div className="bg-cyan-50 rounded-md px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 text-center min-w-[44px] sm:min-w-[50px] md:min-w-[60px]">
                 <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-700 mb-0 leading-tight font-medium">Weightage</p>
                 <p className="text-sm sm:text-base md:text-lg font-bold text-black leading-tight">{tip.weightage}%</p>
               </div>
             </div>
           </div>
                     <div className="flex justify-between items-end mt-2 sm:mt-3 md:mt-4 gap-2 sm:gap-3">
             <div className="min-w-0 flex-1">
               <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mb-0.5 sm:mb-1 leading-tight font-medium">Buy Range</p>
               <p className="text-xs sm:text-sm md:text-base font-semibold text-black line-clamp-1">{tip.buyRange}</p>
             </div>
             <div className="flex-shrink-0">
               <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mb-0.5 sm:mb-1 leading-tight font-medium">Action</p>
               <div className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm md:text-base font-medium bg-gray-700 text-white inline-block whitespace-nowrap">
                 {tip.action}
               </div>
             </div>
           </div>
                     {tip.message && (
             <div className="mt-2 sm:mt-3 p-2 sm:p-2.5 md:p-3 bg-gray-100 rounded">
               <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 line-clamp-2 leading-tight">{tip.message}</p>
             </div>
           )}
        </div>
      </div>
        
      {shouldBlurContent && (
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-[10px] flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-lg max-w-[160px] sm:max-w-[180px] md:max-w-[200px]">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              {tip.category === 'premium' ? 'Premium subscription required' : 'Basic subscription required'}
            </p>
            <button
              className={cn(
                "px-3 sm:px-4 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium text-white transition-all",
                tip.category === 'premium' 
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              )}
              onClick={(e) => {
                e.stopPropagation();
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
  userSubscriptionAccess?: SubscriptionAccess;
}

export default function TipsCarousel({ 
  portfolioId, 
  tips: propTips, 
  loading: propLoading, 
  onTipClick, 
  categoryFilter = 'all',
  isModelPortfolio = false,
  sliderSize = 'default',
  userSubscriptionAccess,
}: TipsCarouselProps) {
  const [tips, setTips] = useState<TipCardData[]>([])
  const [loading, setLoading] = useState(propLoading || false)
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | undefined>(userSubscriptionAccess)
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const router = useRouter()

  // Responsive configuration
  const [dimensions, setDimensions] = useState({
    cardWidth: 280,
    cardHeight: 160,
    gap: 16,
    visibleCards: 1.2,
    containerPadding: 16
  })

  // Add state to track if dimensions have been initialized
  const [dimensionsInitialized, setDimensionsInitialized] = useState(false)

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
        containerPadding: 16
      };
      
      if (width < 400) {
        // Very small mobile
        config = {
          cardWidth: Math.min(260, width - 60),
          cardHeight: 140,
          gap: 12,
          visibleCards: 1.1,
          containerPadding: 12
        };
      } else if (width < 480) {
        // Small mobile
        config = {
          cardWidth: Math.min(280, width - 60),
          cardHeight: 150,
          gap: 14,
          visibleCards: 1.15,
          containerPadding: 14
        };
      } else if (width < 640) {
        // Large mobile
        config = {
          cardWidth: 300,
          cardHeight: 160,
          gap: 16,
          visibleCards: 1.2,
          containerPadding: 16
        };
      } else if (width < 768) {
        // Small tablet
        config = {
          cardWidth: 320,
          cardHeight: 180,
          gap: 18,
          visibleCards: 1.6,
          containerPadding: 18
        };
      } else if (width < 1024) {
        // Large tablet
        config = {
          cardWidth: 340,
          cardHeight: 180,
          gap: 20,
          visibleCards: 2.0,
          containerPadding: 20
        };
      } else if (width < 1280) {
        // Small desktop
        config = {
          cardWidth: 360,
          cardHeight: 180,
          gap: 24,
          visibleCards: 2.5,
          containerPadding: 24
        };
      } else if (width < 1536) {
        // Large desktop
        config = {
          cardWidth: 380,
          cardHeight: 220,
          gap: 28,
          visibleCards: 3.0,
          containerPadding: 28
        };
      } else {
        // Extra large desktop
        config = {
          cardWidth: 400,
          cardHeight: 220,
          gap: 32,
          visibleCards: 3.5,
          containerPadding: 32
        };
      }
      
      setDimensions(config);
      setDimensionsInitialized(true);
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const currentTipDate = useMemo(() => {
    if (tips.length === 0 || currentIndex >= tips.length) return new Date()
    return new Date(tips[currentIndex].date)
  }, [tips, currentIndex])

  const convertTipsToCarouselFormat = (apiTips: Tip[]): TipCardData[] => {
    return apiTips.map((tip, index) => {
      let stockName = tip.title?.split(':')[0]?.split('-')[0]?.trim();
      if (!stockName) {
        stockName = tip.stockId || `Stock ${index + 1}`;
      }
      return {
        id: tip._id,
        portfolioId: typeof tip.portfolio === 'string' ? tip.portfolio : tip.portfolio?._id,
        date: tip.createdAt,
        stockName,
        exchange: "NSE",
        weightage: tip.targetPercentage ? parseFloat(tip.targetPercentage.replace('%', '')) : 5.0,
        buyRange: tip.buyRange || "₹ 1000 - 1050",
        action: (tip.action as "HOLD" | "Partial Profit Booked" | "BUY" | "SELL") || "BUY",
        category: tip.category || "basic",
        title: tip.title,
        message: tip.message
      };
    });
  }

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

  // Calculate container width
  const containerWidth = useMemo(() => {
    if (!dimensionsInitialized) return 0;
    return Math.min(
      typeof window !== 'undefined' ? window.innerWidth - (dimensions.containerPadding * 2) : 800,
      dimensions.cardWidth * dimensions.visibleCards + dimensions.gap * (Math.floor(dimensions.visibleCards))
    );
  }, [dimensions, dimensionsInitialized]);

  // Calculate card positions
  const cardPositions = useMemo(() => {
    return tips.map((_, index) => {
      return index * (dimensions.cardWidth + dimensions.gap);
    });
  }, [tips, dimensions.cardWidth, dimensions.gap]);

  // Get the x position to center a specific card
  const getCenteredPosition = useCallback((index: number) => {
    if (!containerWidth || cardPositions.length === 0) return 0;
    const cardPosition = cardPositions[index] || 0;
    const centerOffset = (containerWidth - dimensions.cardWidth) / 2;
    return -cardPosition + centerOffset;
  }, [containerWidth, cardPositions, dimensions.cardWidth]);

  const updateCurrentIndex = useCallback((xValue: number) => {
    if (cardPositions.length === 0) return;
    
    const centerOffset = (containerWidth - dimensions.cardWidth) / 2;
    const currentPosition = -xValue + centerOffset;
    
    // Find the closest card
    let closestIndex = 0;
    let minDistance = Infinity;
    
    cardPositions.forEach((pos, index) => {
      const distance = Math.abs(pos - currentPosition);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    if (closestIndex !== currentIndex) {
      setCurrentIndex(closestIndex);
    }
  }, [cardPositions, containerWidth, dimensions.cardWidth, currentIndex]);

  const onDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Determine target index based on velocity and offset
    let targetIndex = currentIndex;
    
    if (Math.abs(velocity) > 500) {
      // Fast swipe
      targetIndex = velocity > 0 ? Math.max(0, currentIndex - 1) : Math.min(tips.length - 1, currentIndex + 1);
    } else if (Math.abs(offset) > dimensions.cardWidth / 3) {
      // Dragged more than 1/3 of card width
      targetIndex = offset > 0 ? Math.max(0, currentIndex - 1) : Math.min(tips.length - 1, currentIndex + 1);
    }
    
    goToTip(targetIndex);
  };

  const goToTip = useCallback((index: number) => {
    const targetIndex = Math.max(0, Math.min(tips.length - 1, index));
    const targetX = getCenteredPosition(targetIndex);
    
    animate(x, targetX, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    });
    
    setCurrentIndex(targetIndex);
  }, [tips.length, getCenteredPosition, x]);

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

  // Calculate drag constraints
  const dragConstraints = useMemo(() => {
    if (!containerWidth || tips.length === 0) {
      return { left: 0, right: 0 };
    }
    
    const firstCardPosition = getCenteredPosition(0);
    const lastCardPosition = getCenteredPosition(tips.length - 1);
    
    return {
      left: lastCardPosition,
      right: firstCardPosition,
    };
  }, [containerWidth, tips.length, getCenteredPosition]);

  useEffect(() => {
    const fetchTips = async () => {
      if (propTips) {
        let filteredTips = propTips;
        
        if (categoryFilter !== 'all') {
          filteredTips = propTips.filter(tip => tip.category === categoryFilter);
        }
        
        const carouselTips = convertTipsToCarouselFormat(filteredTips)
        setTips(carouselTips)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        let apiTips: Tip[] = [];
        
        if (portfolioId) {
          apiTips = await tipsService.getPortfolioTips({ 
            portfolioId,
            category: categoryFilter !== 'all' ? categoryFilter : undefined
          });
        } else {
          apiTips = await tipsService.getAll({ 
            category: categoryFilter !== 'all' ? categoryFilter : undefined
          });
        }
        
        const carouselTips = convertTipsToCarouselFormat(apiTips)
        setTips(carouselTips)
      } catch (error) {
        console.error("Failed to fetch tips:", error)
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

  useEffect(() => {
    const fetchSubscriptionAccess = async () => {
      try {
        subscriptionService.clearCache();
        const access = await subscriptionService.getSubscriptionAccess(true);
        setSubscriptionAccess(access);
      } catch (error) {
        console.error('Failed to fetch subscription access:', error);
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

  // Center the first tip on initial load with smooth animation
  useEffect(() => {
    if (tips.length > 0 && containerWidth > 0 && dimensionsInitialized) {
      const targetX = getCenteredPosition(0);
      // Set initial position instantly
      x.set(targetX);
      setCurrentIndex(0);
      
      // Add a subtle entrance animation
      setTimeout(() => {
        animate(x, targetX, {
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 1,
        });
      }, 100);
    }
  }, [tips.length, containerWidth, dimensionsInitialized, getCenteredPosition, x]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, tips.length]);

  if (loading) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center overflow-hidden py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tips...</p>
        </div>
      </div>
    )
  }

  if (tips.length === 0) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center overflow-hidden py-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4 text-4xl">📊</div>
          <p className="text-gray-600">No tips available for the selected category.</p>
        </div>
      </div>
    )
  }

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
            touchAction: 'pan-y pinch-zoom'
          }}
        >
          <motion.div
            className="absolute left-0 top-0 flex items-center h-full cursor-grab active:cursor-grabbing touch-pan-y"
            style={{ x }}
            drag="x"
            dragConstraints={dragConstraints}
            onDrag={(e, info) => updateCurrentIndex(x.get())}
            onDragEnd={onDragEnd}
            dragElastic={0.2}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
            whileTap={{ cursor: "grabbing" }}
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
        {containerWidth > 480 && tips.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 z-10",
                currentIndex === 0 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-gray-50 hover:shadow-xl hover:scale-110"
              )}
              aria-label="Previous tip"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              disabled={currentIndex === tips.length - 1}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 z-10",
                currentIndex === tips.length - 1 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-gray-50 hover:shadow-xl hover:scale-110"
              )}
              aria-label="Next tip"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {tips.length > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          {tips.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTip(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                index === currentIndex 
                  ? "bg-blue-600 w-6 sm:w-8" 
                  : "bg-gray-300 hover:bg-gray-400 w-2"
              )}
              aria-label={`Go to tip ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Current Date Display */}
      <div className="mt-6 text-center px-4">
        <div className="inline-flex items-center relative overflow-hidden backdrop-blur-sm bg-white/80 border border-white/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50 rounded-xl" />
          
          <div className="relative flex items-center space-x-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            
            <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 tracking-wide">
              {currentTipDate.toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}