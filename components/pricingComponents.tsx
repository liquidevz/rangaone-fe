"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import {
  Check,
  X,
  Crown,
  Star,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Bell,
  Phone,
  Video,
  FileText,
  GitCompare,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface PricingCompareProps {
  className?: string
  initialSliderPercentage?: number
  slideMode?: "hover" | "drag"
  showHandlebar?: boolean
  autoplay?: boolean
  autoplayDuration?: number
}

export const PricingCompare = ({
  className,
  initialSliderPercentage = 50,
  slideMode = "hover",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
}: PricingCompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage)
  const [isDragging, setIsDragging] = useState(false)
  const [isMouseOver, setIsMouseOver] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const features = [
    {
      label: "Quality Stock Picks",
      basic: "10-15 stocks",
      premium: "20-25 stocks",
      icon: TrendingUp,
    },
    {
      label: "Short-Term/Swing Trades",
      basic: "5 Trades",
      premium: "10 Trades",
      icon: Zap,
    },
    {
      label: "Model Portfolios",
      basic: false,
      premium: "2 Exclusive Portfolios",
      icon: FileText,
    },
    {
      label: "IPO Recommendations",
      basic: false,
      premium: "Premium Access",
      icon: Star,
    },
    {
      label: "Call Support",
      basic: false,
      premium: "Direct Access to Experts",
      icon: Phone,
    },
    {
      label: "Live Webinars",
      basic: false,
      premium: "Interactive Sessions",
      icon: Video,
    },
    {
      label: "Entry & Exit Alerts",
      basic: true,
      premium: "Enhanced with Analysis",
      icon: Bell,
    },
    {
      label: "Market Updates",
      basic: true,
      premium: "Priority Access",
      icon: Shield,
    },
  ]

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const startAutoplay = useCallback(() => {
    if (!autoplay) return
    const startTime = Date.now()
    const animate = () => {
      const elapsedTime = Date.now() - startTime
      const progress = (elapsedTime % (autoplayDuration * 2)) / autoplayDuration
      const percentage = progress <= 1 ? progress * 100 : (2 - progress) * 100
      setSliderXPercent(percentage)
      autoplayRef.current = setTimeout(animate, 16)
    }
    animate()
  }, [autoplay, autoplayDuration])

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current)
      autoplayRef.current = null
    }
  }, [])

  useEffect(() => {
    startAutoplay()
    return () => stopAutoplay()
  }, [startAutoplay, stopAutoplay])

  function mouseEnterHandler() {
    setIsMouseOver(true)
    stopAutoplay()
  }

  function mouseLeaveHandler() {
    setIsMouseOver(false)
    if (slideMode === "hover") {
      setSliderXPercent(initialSliderPercentage)
    }
    if (slideMode === "drag") {
      setIsDragging(false)
    }
    startAutoplay()
  }

  const handleStart = useCallback(
    (clientX: number) => {
      if (slideMode === "drag") {
        setIsDragging(true)
      }
    },
    [slideMode],
  )

  const handleEnd = useCallback(() => {
    if (slideMode === "drag") {
      setIsDragging(false)
    }
  }, [slideMode])

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect()
        const x = clientX - rect.left
        const percent = (x / rect.width) * 100
        requestAnimationFrame(() => {
          setSliderXPercent(Math.max(0, Math.min(100, percent)))
        })
      }
    },
    [slideMode, isDragging],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!sliderRef.current) return

      // Set slider position immediately to where user clicked
      const rect = sliderRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percent = (x / rect.width) * 100
      setSliderXPercent(Math.max(0, Math.min(100, percent)))

      // Then start dragging
      handleStart(e.clientX)
    },
    [handleStart],
  )
  const handleMouseUp = useCallback(() => handleEnd(), [handleEnd])
  const handleMouseMove = useCallback((e: React.MouseEvent) => handleMove(e.clientX), [handleMove])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (!sliderRef.current) return

      // Set slider position immediately to where user touched
      const rect = sliderRef.current.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      const percent = (x / rect.width) * 100
      setSliderXPercent(Math.max(0, Math.min(100, percent)))

      // Then start dragging
      handleStart(e.touches[0].clientX)
    },
    [handleStart],
  )

  const handleTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      handleMove(e.touches[0].clientX)
    },
    [handleMove],
  )

  // Comparison Modal Component
  const ComparisonModal = () => {
    const handleOpenModal = () => {
      setShowComparison(true)
      stopAutoplay()
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    }

    const handleCloseModal = () => {
      setShowComparison(false)
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }

    return (
      <>
      <button 
        onClick={handleOpenModal}
        className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FFB800_0%,#FFD700_33%,#FFFFFF_66%,#FFB800_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-900 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
          Compare Plans
        </span>
      </button>

        {showComparison && createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
            onClick={handleCloseModal}
            onWheel={(e) => e.preventDefault()}
          >
            <div
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-br from-[#333333] to-[#515151] p-6 border-b border-slate-700/50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]"></div>
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
                      <GitCompare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white text-2xl lg:text-3xl font-bold mb-1 px-[23rem]">
                        Plan Comparison
                      </h2>
                      <p className="text-slate-300 text-sm lg:text-base px-[18rem]">Choose the perfect plan for your investment journey</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:text-white transition-all duration-200 p-2 hover:bg-white/10 rounded-xl hover:scale-110"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Basic Plan */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-green-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-green-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
                      {/* Plan Header */}
                      <div className="text-center mb-6">
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-green-500/30 shadow-lg">
                          <Users className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-green-400 text-2xl font-bold mb-2">Basic Plan</h3>
                        <p className="text-slate-400 text-base">Essential Investment Tools</p>
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        {features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-green-500/30 transition-all duration-200 hover:bg-slate-700/40"
                          >
                            <div className="bg-green-500/15 p-2 rounded-lg flex-shrink-0">
                              <feature.icon className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="flex-1 text-center">
                              <div className="text-white font-medium mb-1 text-sm">{feature.label}</div>
                              <div className="flex justify-center">
                                {typeof feature.basic === "string" ? (
                                  <span className="text-green-400 font-medium text-xs bg-green-500/20 px-2.5 py-1 rounded-full border border-green-500/30">
                                    {feature.basic}
                                  </span>
                                ) : feature.basic ? (
                                  <div className="flex items-center gap-2 text-green-400">
                                    <Check className="w-3 h-3" />
                                    <span className="font-medium text-xs">Included</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-red-400">
                                    <X className="w-3 h-3" />
                                    <span className="font-medium text-xs">Not Available</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <button className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25">
                        Get Started Free
                      </button>
                    </div>
                  </div>

                  {/* Premium Plan */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-3xl p-6 border-2 border-amber-300/60 hover:border-amber-300 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20">
                      {/* Popular Badge */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl border border-purple-400/30">
                          <Sparkles className="w-4 h-4 inline mr-2" />
                          Most Popular
                        </div>
                      </div>

                      {/* Plan Header */}
                      <div className="text-center mb-6 mt-3">
                        <div className="bg-gradient-to-br from-amber-100/40 to-yellow-100/40 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 border-2 border-amber-200/60 backdrop-blur-sm shadow-lg">
                          <Crown className="w-10 h-10 text-amber-800" />
                        </div>
                        <h3 className="text-amber-900 text-2xl font-bold mb-2 drop-shadow-sm">
                          Premium Plan
                        </h3>
                        <p className="text-amber-800 text-base font-medium">Complete Investment Suite</p>
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        {features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-amber-400/20 rounded-xl border border-amber-300/40 backdrop-blur-sm hover:bg-amber-400/30 transition-all duration-200"
                          >
                            <div className="bg-amber-800/20 p-2 rounded-lg border border-amber-700/30 flex-shrink-0">
                              <feature.icon className="w-4 h-4 text-amber-800" />
                            </div>
                            <div className="flex-1 text-center">
                              <div className="text-amber-900 font-medium mb-1 text-sm drop-shadow-sm">{feature.label}</div>
                              <div className="flex justify-center">
                                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-2.5 py-1 rounded-full font-semibold text-xs text-amber-900 inline-flex items-center gap-1.5 border border-amber-200 shadow-sm">
                                  <Check className="w-3 h-3" />
                                  <span>{feature.premium}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <button className="w-full mt-6 bg-gradient-to-r from-amber-800 to-orange-800 hover:from-amber-900 hover:to-orange-900 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/30">
                        Upgrade to Premium
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    )
  }

  return (
    <section className="flex justify-center items-center min-h-[80vh] py-4 md:py-6 px-4 relative overflow-hidden select-none">
      {/* Stock Market Themed Background */}
      <div className="absolute bg-gradient-to-tr from-[#333333] to-[#515151]"></div>
      <div className="absolute inset-0 ]"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-45"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent transform -rotate-45"></div>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-3xl lg:text-4xl font-bold text-[#f4d03f] mb-2 ">
            Choose Your Plan
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto mb-3">
            {isMobile
              ? "Swipe to compare our Basic and Premium plans"
              : "Drag the slider to compare our Basic and Premium plans"}
          </p>
          {/* Hide Compare Plans button on mobile */}
          {!isMobile && <ComparisonModal />}
        </div>

        {/* Compare Slider Container */}
        <div
          ref={sliderRef}
          className={cn(
            "w-full max-w-3xl mx-auto overflow-hidden rounded-xl md:rounded-2xl shadow-2xl relative border border-slate-700/50",
            className,
          )}
          style={{
            cursor: slideMode === "drag" ? "grab" : "col-resize",
            height: "auto",
            minHeight: isMobile ? "700px" : "800px",
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
            className="absolute h-full w-1 md:w-2 top-0 z-40 bg-gradient-to-b from-transparent from-[5%] to-[95%] via-yellow-400 to-transparent rounded-full"
            style={{
              left: `${sliderXPercent}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="w-20 md:w-40 h-full bg-gradient-to-r from-yellow-400/30 via-yellow-400/10 to-transparent absolute top-1/2 -translate-y-1/2 left-0 opacity-60" />
            {showHandlebar && (
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-xl top-1/2 -translate-y-1/2 bg-gradient-to-br from-yellow-400 to-yellow-500 -right-4 md:-right-6 absolute flex items-center justify-center shadow-[0px_-4px_20px_0px_#FFC70040] border-2 border-white">
                <div className="flex flex-col gap-0.5 md:gap-1">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-black rounded-full"></div>
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-black rounded-full"></div>
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-black rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Plan (Left Side) */}
          <div
            className="absolute inset-0 z-20 rounded-xl md:rounded-2xl bg-[#001633] overflow-hidden border-r border-slate-700/50"
            style={{
              clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
            }}
          >
            <div className="p-3 md:p-4 xl:p-6 h-full flex flex-col justify-center">
              {/* Basic Plan Header */}
              <div className="text-center mb-2 md:mb-3">
                <div className="bg-green-500/20 rounded-full w-20 h-20 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 border border-green-500/30">
                  <Users className="w-10 h-10 md:w-6 md:h-6 text-green-400" />
                </div>
                <h3 className="text-green-400 text-3xl md:text-xl xl:text-2xl font-bold ">Basic</h3>
                <p className="text-slate-400 text-xs md:text-sm">Essential Tools</p>
              </div>

              {/* Basic Plan Features */}
              <div className="space-y-1 flex-1 flex flex-col justify-center">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/50 rounded-lg border border-slate-700/50 h-[60px] md:h-[70px] flex items-center justify-center hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 w-full px-2 md:px-3">
                      <feature.icon className="w-3 h-3 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="text-white font-semibold text-xs md:text-sm mb-1 text-center">
                          {feature.label}
                        </div>
                        <div className="flex justify-center">
                          {typeof feature.basic === "string" ? (
                            <span className="text-green-400 font-semibold text-xs bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
                              {feature.basic}
                            </span>
                          ) : feature.basic ? (
                            <div className="flex items-center gap-1 text-green-400">
                              <Check className="w-3 h-3" />
                              <span className="font-semibold text-xs">Included</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500">
                              <X className="w-3 h-3" />
                              <span className="font-semibold text-xs">Not Available</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Plan (Right Side) */}
          <div className="absolute inset-0 z-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500">
            <div className="p-3 md:p-4 xl:p-6 h-full flex flex-col justify-center">
              {/* Premium Plan Header */}
              <div className="text-center mb-2 md:mb-3">
                <div className="bg-amber-100/30 rounded-full w-20 h-20 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 border-2 border-amber-200/50 backdrop-blur-sm">
                  <Crown className="w-10 h-10 md:w-6 md:h-6 text-amber-800" />
                </div>
                <h3 className="text-amber-900 text-3xl md:text-xl xl:text-2xl font-bold drop-shadow-sm">Premium</h3>
                <p className="text-amber-800 text-xs md:text-sm font-medium">Comprehensive Suite</p>
              </div>

              {/* Premium Plan Features */}
              <div className="space-y-1 flex-1 flex flex-col justify-center">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-amber-400/20 rounded-lg border border-amber-300/40 h-[60px] md:h-[70px] flex items-center justify-center backdrop-blur-sm hover:bg-amber-400/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 w-full px-2 md:px-3">
                      <feature.icon className="w-3 h-3 md:w-4 md:h-4 text-amber-800 flex-shrink-0" />
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="text-amber-900 font-semibold text-xs md:text-sm mb-1 text-center drop-shadow-sm">
                          {feature.label}
                        </div>
                        <div className="flex justify-center">
                          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-2 py-0.5 rounded-full font-bold text-xs text-amber-900 shadow-lg inline-flex items-center gap-1 border border-amber-200">
                            <Check className="w-3 h-3" />
                            {feature.premium}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-3">
          <p className="text-slate-400 text-xs md:text-sm">
            {isMobile ? "← Swipe to compare plans →" : "← Drag to compare plans →"}
          </p>
        </div>
      </div>
    </section>
  )
}

export default PricingCompare
