"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Check, X, Star, Zap, Shield, Users, TrendingUp, Bell, Phone, Video, FileText } from "lucide-react";

interface PricingCompareProps {
  className?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
}

export const PricingCompare = ({
  className,
  initialSliderPercentage = 50,
  slideMode = "hover",
  showHandlebar = true,
  autoplay = true,
  autoplayDuration = 5000,
}: PricingCompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const features = [
    { 
      label: "Quality Stock Picks", 
      basic: "10-15 stocks", 
      premium: "20-25 stocks",
      icon: TrendingUp
    },
    { 
      label: "Short-Term/Swing Trades", 
      basic: "5 Trades", 
      premium: "10 Trades",
      icon: Zap
    },
    { 
      label: "Model Portfolios", 
      basic: false, 
      premium: "2 Exclusive Portfolios",
      icon: FileText
    },
    { 
      label: "IPO Recommendations", 
      basic: false, 
      premium: "2 Exclusive Portfolios",
      icon: Star
    },
    { 
      label: "Call Support", 
      basic: false, 
      premium: "Direct Access to Experts",
      icon: Phone
    },
    { 
      label: "Live Webinars", 
      basic: false, 
      premium: "Interactive Sessions",
      icon: Video
    },
    { 
      label: "Entry & Exit Alerts", 
      basic: true, 
      premium: "Enhanced with Detailed Analysis",
      icon: Bell
    },
    { 
      label: "Market Updates", 
      basic: true, 
      premium: "Priority Access",
      icon: Shield
    },
  ];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startAutoplay = useCallback(() => {
    if (!autoplay) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress =
        (elapsedTime % (autoplayDuration * 2)) / autoplayDuration;
      const percentage = progress <= 1 ? progress * 100 : (2 - progress) * 100;

      setSliderXPercent(percentage);
      autoplayRef.current = setTimeout(animate, 16);
    };

    animate();
  }, [autoplay, autoplayDuration]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  function mouseEnterHandler() {
    setIsMouseOver(true);
    stopAutoplay();
  }

  function mouseLeaveHandler() {
    setIsMouseOver(false);
    if (slideMode === "hover") {
      setSliderXPercent(initialSliderPercentage);
    }
    if (slideMode === "drag") {
      setIsDragging(false);
    }
    startAutoplay();
  }

  const handleStart = useCallback(
    (clientX: number) => {
      if (slideMode === "drag") {
        setIsDragging(true);
      }
    },
    [slideMode]
  );

  const handleEnd = useCallback(() => {
    if (slideMode === "drag") {
      setIsDragging(false);
    }
  }, [slideMode]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        requestAnimationFrame(() => {
          setSliderXPercent(Math.max(0, Math.min(100, percent)));
        });
      }
    },
    [slideMode, isDragging]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => handleStart(e.clientX),
    [handleStart]
  );
  const handleMouseUp = useCallback(() => handleEnd(), [handleEnd]);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => handleMove(e.clientX),
    [handleMove]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!autoplay) {
        handleStart(e.touches[0].clientX);
      }
    },
    [handleStart, autoplay]
  );

  const handleTouchEnd = useCallback(() => {
    if (!autoplay) {
      handleEnd();
    }
  }, [handleEnd, autoplay]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!autoplay) {
        handleMove(e.touches[0].clientX);
      }
    },
    [handleMove, autoplay]
  );

  // Mobile view component
  const MobileView = () => (
    <div className="lg:hidden w-full max-w-md mx-auto">
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-white mb-1">Choose Your Plan</h2>
        <p className="text-gray-400 text-xs">Compare our plans below</p>-+***********
      </div>
      
      <div className="space-y-3">
        {/* Basic Plan Mobile Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 shadow-lg border border-gray-700">
          <div className="text-center mb-3">
            <div className="bg-green-500/20 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-1">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-green-400 text-lg font-bold mb-1">Basic</h3>
            <p className="text-gray-400 text-xs">Essential Tools</p>
          </div>
          
          <div className="space-y-1">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 bg-gray-800/50 rounded">
                <div className="flex items-center gap-2">
                  <feature.icon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-white font-medium text-xs">{feature.label}</div>
                  </div>
                </div>
                <div className="text-right ml-2">
                  {typeof feature.basic === "string" ? (
                    <span className="text-green-400 font-medium text-xs bg-green-500/20 px-1.5 py-0.5 rounded">
                      {feature.basic}
                    </span>
                  ) : feature.basic ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <X className="w-3 h-3 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Plan Mobile Card */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 shadow-lg border border-yellow-400 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 bg-black text-white text-center py-1.5">
            <h3 className="text-sm font-bold">Premium</h3>
            <p className="text-yellow-400 text-xs font-medium">Comprehensive Suite</p>
          </div>
          
          <div className="mt-10 space-y-1">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 bg-yellow-500/20 rounded">
                <div className="flex items-center gap-2">
                  <feature.icon className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-black font-medium text-xs">{feature.label}</div>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="bg-yellow-300 px-1.5 py-0.5 rounded font-semibold text-xs text-black">
                    ✅ {feature.premium}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="flex justify-center items-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] py-6 px-4 min-h-screen">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Choose Your Plan
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            {isMobile ? "Compare our plans below" : "Drag the slider to compare our Basic and Premium plans"}
          </p>
        </div>

        {/* Mobile View */}
        <MobileView />

        {/* Desktop Compare Slider Container */}
        <div className="hidden lg:flex justify-center">
          <div
            ref={sliderRef}
            className={cn("w-full max-w-4xl h-[350px] overflow-hidden rounded-xl shadow-xl", className)}
            style={{
              position: "relative",
              cursor: slideMode === "drag" ? "grab" : "col-resize",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={mouseLeaveHandler}
            onMouseEnter={mouseEnterHandler}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
          >
            {/* Slider Handle */}
            <div
              className="h-full w-1.5 absolute top-0 m-auto z-30 bg-gradient-to-b from-transparent from-[5%] to-[95%] via-yellow-400 to-transparent rounded-full"
              style={{
                left: `${sliderXPercent}%`,
                top: "0",
                zIndex: 40,
                transform: "translateX(-50%)",
              }}
            >
              <div className="w-32 h-full bg-gradient-to-r from-yellow-400/30 via-yellow-400/10 to-transparent absolute top-1/2 -translate-y-1/2 left-0 opacity-60" />
              {showHandlebar && (
                <div className="h-8 w-8 rounded-lg top-1/2 -translate-y-1/2 bg-gradient-to-br from-yellow-400 to-yellow-500 z-30 -right-4 absolute flex items-center justify-center shadow-[0px_-4px_20px_0px_#FFC70040] border-2 border-white">
                  <div className="flex flex-col gap-0.5">
                    <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                    <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                    <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Plan (Left Side) */}
            <div className="overflow-hidden w-full h-full relative z-20 pointer-events-none">
              <div
                className="absolute inset-0 z-20 rounded-xl shrink-0 w-full h-full select-none overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900"
                style={{
                  clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
                }}
              >
                <div className="p-4 h-full flex flex-col">
                  {/* Basic Plan Header */}
                  <div className="text-center mb-3">
                    <div className="bg-green-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-green-400 text-xl font-bold mb-1">Basic</h3>
                    <p className="text-gray-400 text-xs">Essential Tools</p>
                  </div>
                  
                  {/* Basic Plan Features */}
                  <div className="space-y-2 flex-1">
                    {features.map((feature, idx) => (
                      <div key={idx} className="bg-gray-800/50 rounded p-2 border border-gray-700">
                        <div className="text-center mb-1">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <feature.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="text-white font-medium text-xs text-center">{feature.label}</div>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          {typeof feature.basic === "string" ? (
                            <span className="text-green-400 font-semibold text-xs bg-green-500/20 px-2 py-1 rounded">
                              {feature.basic}
                            </span>
                          ) : feature.basic ? (
                            <div className="flex items-center gap-1 text-green-400">
                              <Check className="w-4 h-4" />
                              <span className="font-semibold text-xs">Included</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500">
                              <X className="w-4 h-4" />
                              <span className="font-semibold text-xs">Not Included</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Plan (Right Side) */}
            <div className="absolute inset-0 z-[19] rounded-xl w-full h-full select-none bg-gradient-to-br from-yellow-500 to-yellow-600">
              <div className="p-4 h-full flex flex-col">
                {/* Premium Plan Header */}
                <div className="text-center mb-3">
                  <div className="bg-black text-white text-center py-3 px-4 rounded-lg shadow-md">
                    <div className="bg-yellow-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Star className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold">Premium</h3>
                    <p className="text-yellow-400 font-semibold text-xs">Comprehensive Suite</p>
                  </div>
                </div>
                
                {/* Premium Plan Features */}
                <div className="space-y-2 flex-1">
                  {features.map((feature, idx) => (
                    <div key={idx} className="bg-yellow-500/20 rounded p-2 border border-yellow-400/30">
                      <div className="text-center mb-1">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <feature.icon className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                          <div className="text-black font-medium text-xs text-center">{feature.label}</div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className="bg-yellow-300 px-3 py-1 rounded font-bold text-xs text-black shadow-md">
                          ✅ {feature.premium}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-3">
          <p className="text-gray-400 text-xs">
            {autoplay && !isMouseOver ? "Auto-comparing plans..." : "← Drag to compare plans →"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingCompare;