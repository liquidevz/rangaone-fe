"use client"
import { useState, useEffect } from "react"
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion"
import { format, parseISO } from "date-fns"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { tipsService, type Tip } from "@/services/tip.service"
import { useRouter } from "next/navigation"

type TipCardData = {
  id: string
  portfolioId?: string
  date: string
  stockName: string
  exchange: string
  weightage: number
  buyRange: string
  action: "HOLD" | "Partial Profit Booked" | "BUY" | "SELL"
}

const TipCard = ({ tip, isActive, onClick }: { tip: TipCardData; isActive: boolean; onClick?: () => void }) => (
  <div
    className={cn(
      "relative w-[380px] h-[220px] rounded-2xl p-1 transition-all duration-300 cursor-pointer",
      isActive ? "scale-105 shadow-2xl" : "shadow-lg",
      onClick && "hover:scale-105 hover:shadow-2xl",
    )}
    style={{
      background: "linear-gradient(90deg, #00B7FF, #85D437)",
    }}
    onClick={onClick}
  >
    <div className="w-full h-full bg-white rounded-[14px] p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <div className="bg-black text-white text-sm font-semibold rounded-md px-3 py-1 inline-block shadow-sm">
            <span className="bg-gradient-to-r from-[#00B7FF] to-[#85D437] bg-clip-text text-transparent font-bold">
            Model Portfolio
            </span>
          </div>
          <h3 className="text-3xl font-bold text-black mt-2">{tip.stockName}</h3>
          <p className="text-sm text-gray-500">{tip.exchange}</p>
        </div>
        <div
          className="relative p-0.5 rounded-lg shadow-sm"
          style={{ background: "linear-gradient(90deg, #00B7FF, #85D437)" }}
        >
          <div
            className="rounded-[6px] px-4 py-2 text-center"
            style={{ background: "linear-gradient(90deg, #e0f7ff, #f1fef2)" }}
          >
            <p className="text-xs text-gray-500">Weightage</p>
            <p className="text-3xl font-bold text-black">{tip.weightage}%</p>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-500">Buy Range</p>
          <p className="text-lg font-semibold text-black">{tip.buyRange}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Action</p>
          <p className="text-xl font-bold text-black">{tip.action}</p>
        </div>
      </div>
    </div>
  </div>
)

const CARD_WIDTH = 380
const CARD_MARGIN = 40
const DRAG_BUFFER = 50

interface TipsCarouselProps {
  portfolioId?: string
  tips?: Tip[]
  loading?: boolean
  onTipClick?: (tipId: string) => void
}

export default function TipsCarousel({ portfolioId, tips: propTips, loading: propLoading, onTipClick }: TipsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [tips, setTips] = useState<TipCardData[]>([])
  const [loading, setLoading] = useState(propLoading || false)
  const x = useMotionValue(0)
  const router = useRouter()

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
        setTips(convertTipsToCarouselFormat(propTips))
        setLoading(false)
        return
      }

      if (!portfolioId) {
        // Use sample data if no portfolio ID
        const sampleTips: TipCardData[] = [
          {
            id: "1",
            date: "2025-04-14T00:00:00.000Z",
            stockName: "INFOSYS",
            exchange: "NSE",
            weightage: 5.0,
            buyRange: "₹ 1400 - 1420",
            action: "BUY",
          },
          {
            id: "2",
            date: "2025-04-15T00:00:00.000Z",
            stockName: "RELIANCE",
            exchange: "NSE",
            weightage: 6.2,
            buyRange: "₹ 2800 - 2850",
            action: "BUY",
          },
          {
            id: "3",
            date: "2025-04-16T00:00:00.000Z",
            stockName: "IDFC FIRST B",
            exchange: "BSE",
            weightage: 5.4,
            buyRange: "₹ 80 - 82",
            action: "Partial Profit Booked",
          },
          {
            id: "4",
            date: "2025-04-17T00:00:00.000Z",
            stockName: "AXIS BANK",
            exchange: "NSE",
            weightage: 4.0,
            buyRange: "₹ 1150 - 1170",
            action: "HOLD",
          },
          {
            id: "5",
            date: "2025-04-18T00:00:00.000Z",
            stockName: "IDFC FIRST B",
            exchange: "BSE",
            weightage: 5.4,
            buyRange: "₹ 80 - 82",
            action: "Partial Profit Booked",
          },
          {
            id: "6",
            date: "2025-04-19T00:00:00.000Z",
            stockName: "TATA MOTORS",
            exchange: "NSE",
            weightage: 7.1,
            buyRange: "₹ 950 - 970",
            action: "BUY",
          },
          {
            id: "7",
            date: "2025-04-20T00:00:00.000Z",
            stockName: "HDFC BANK",
            exchange: "NSE",
            weightage: 8.5,
            buyRange: "₹ 1500 - 1520",
            action: "HOLD",
          },
        ]
        setTips(sampleTips)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const apiTips = await tipsService.getAll()
        const carouselTips = convertTipsToCarouselFormat(apiTips)
        setTips(carouselTips)
      } catch (error) {
        console.error("Failed to fetch tips:", error)
        // Fallback to sample data
        const sampleTips: TipCardData[] = [
          {
            id: "1",
            date: "2025-04-14T00:00:00.000Z",
            stockName: "INFOSYS",
            exchange: "NSE",
            weightage: 5.0,
            buyRange: "₹ 1400 - 1420",
            action: "BUY",
          },
          {
            id: "2",
            date: "2025-04-15T00:00:00.000Z",
            stockName: "RELIANCE",
            exchange: "NSE",
            weightage: 6.2,
            buyRange: "₹ 2800 - 2850",
            action: "BUY",
          },
        ]
        setTips(sampleTips)
      } finally {
        setLoading(false)
      }
    }

    fetchTips()
  }, [portfolioId, propTips])

  // Animate to the new active card position
  useEffect(() => {
    if (tips.length === 0) return
    const newX = -activeIndex * (CARD_WIDTH + CARD_MARGIN)
    animate(x, newX, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.5,
    })
  }, [activeIndex, x, tips.length])

  // Handle drag end to snap to the nearest card
  const onDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (tips.length === 0) return
    const { offset, velocity } = info
    if (Math.abs(offset.x) > DRAG_BUFFER || Math.abs(velocity.x) > 200) {
      const direction = offset.x > 0 ? -1 : 1
      setActiveIndex((prev) => Math.max(0, Math.min(tips.length - 1, prev + direction)))
    } else {
      // Snap back to the current card if drag is not enough
      const newX = -activeIndex * (CARD_WIDTH + CARD_MARGIN)
      animate(x, newX, { type: "spring", stiffness: 300, damping: 30 })
    }
  }

  if (loading) {
    return (
      <div className="relative w-full h-[550px] flex flex-col items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tips...</p>
        </div>
      </div>
    )
  }

  if (tips.length === 0) {
    return (
      <div className="relative w-full h-[550px] flex flex-col items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="text-gray-400 mb-4">📊</div>
          <p className="text-gray-600">No tips available at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] flex flex-col items-center justify-center overflow-hidden">
      {/* Carousel Container */}
      <div className="relative h-[300px] w-full">
        <motion.div
          className="absolute left-0 top-0 flex items-center"
          style={{
            x,
            paddingLeft: `calc(50% - ${CARD_WIDTH / 2}px)`,
            paddingRight: `calc(50% - ${CARD_WIDTH / 2}px)`,
          }}
          drag="x"
          dragConstraints={{
            left: -(tips.length - 1) * (CARD_WIDTH + CARD_MARGIN),
            right: 0,
          }}
          onDragEnd={onDragEnd}
          dragElastic={0.1}
        >
          {tips.map((tip, index) => {
            const isActive = index === activeIndex
            const distance = Math.abs(activeIndex - index)
            return (
              <motion.div
                key={tip.id}
                className="flex-shrink-0"
                style={{
                  width: CARD_WIDTH,
                  marginRight: CARD_MARGIN,
                }}
                animate={{
                  scale: isActive ? 1 : 0.85,
                  y: isActive ? 0 : 25,
                  opacity: distance > 2 ? 0.3 : 1,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                <TipCard tip={tip} isActive={isActive} onClick={() => handleTipClick(tip)} />
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Connecting Line */}
      <div className="pointer-events-none absolute top-[230px] left-1/2 h-[100px] w-[200px] -translate-x-1/2">
        <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
          <motion.path
            d="M 100 0 L 100 100"
            stroke="#F43F5E"
            strokeWidth="3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </svg>
      </div>

      {/* Date Display */}
      <div className="relative z-10 mt-20">
        <div className="bg-white rounded-full border-2 border-black px-6 py-2 shadow-lg">
          <span className="text-lg font-semibold text-black">
            {format(parseISO(tips[activeIndex]?.date || new Date().toISOString()), "dd MMMM yyyy")}
          </span>
        </div>
      </div>

      {/* Date Slider */}
      <div className="w-full max-w-lg mt-4 relative h-10 flex items-center">
        <div className="absolute w-full h-full top-0 left-0 flex items-center justify-between px-1">
          {Array.from({ length: 31 }).map((_, i) => {
            let height = "h-2"
            if (i % 5 === 0) height = "h-6"
            else if (i % 1 === 0) height = "h-3"
            return <div key={i} className={cn("w-0.5 bg-gray-400", height)}></div>
          })}
        </div>
        <Slider
          min={0}
          max={Math.max(0, tips.length - 1)}
          step={1}
          value={[activeIndex]}
          onValueChange={(value) => setActiveIndex(value[0])}
          className="w-full z-10"
        />
      </div>
    </div>
  )
} 