"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { format, differenceInDays, addDays, isSameDay } from "date-fns"
import { motion, useMotionValue, animate } from "framer-motion"
import { cn } from "@/lib/utils"

interface DateTimelineSliderProps {
  dateRange: {
    min: Date
    max: Date
  }
  selectedDate: Date
  onDateChange: (date: Date) => void
  className?: string
}

export default function DateTimelineSlider({
  dateRange,
  selectedDate,
  onDateChange,
  className,
}: DateTimelineSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [tickSpacing] = useState(28) // Space between each day's tick

  const x = useMotionValue(0)

  const totalDays = useMemo(() => differenceInDays(dateRange.max, dateRange.min), [dateRange.min, dateRange.max])
  const timelineWidth = useMemo(() => (totalDays + 1) * tickSpacing, [totalDays, tickSpacing])
  const currentPosition = useMemo(() => differenceInDays(selectedDate, dateRange.min), [selectedDate, dateRange.min])

  // Measure the width of the container
  useEffect(() => {
    if (containerRef.current) {
      const updateWidth = () => setContainerWidth(containerRef.current?.offsetWidth ?? 0)
      updateWidth()
      window.addEventListener("resize", updateWidth)
      return () => window.removeEventListener("resize", updateWidth)
    }
  }, [])

  // Center the selected date when it changes externally or on initial load
  useEffect(() => {
    if (containerWidth > 0) {
      const targetX = containerWidth / 2 - currentPosition * tickSpacing
      animate(x, targetX, { type: "spring", stiffness: 400, damping: 40 })
    }
  }, [selectedDate, containerWidth, currentPosition, tickSpacing, x])

  // Handle click on timeline
  const handleTimelineClick = (event: React.MouseEvent) => {
    if (containerWidth > 0) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const clickX = event.clientX - rect.left
        const currentX = x.get()
        const relativeClickX = clickX - currentX - containerWidth / 2
        const clickedDay = Math.round(relativeClickX / tickSpacing)
        const newDate = addDays(dateRange.min, Math.max(0, Math.min(totalDays, clickedDay)))
        onDateChange(newDate)
      }
    }
  }

  const handleDragEnd = () => {
    const finalX = x.get()
    const centeredPositionInTimeline = containerWidth / 2 - finalX
    const dayIndex = Math.round(centeredPositionInTimeline / tickSpacing)
    const clampedDayIndex = Math.max(0, Math.min(totalDays, dayIndex))

    const newDate = addDays(dateRange.min, clampedDayIndex)

    // Snap to the new date
    const snapX = containerWidth / 2 - clampedDayIndex * tickSpacing
    animate(x, snapX, { type: "spring", stiffness: 500, damping: 30 })

    if (!isSameDay(newDate, selectedDate)) {
      onDateChange(newDate)
    }
  }

  const dragConstraints = {
    right: containerWidth / 2,
    left: containerWidth / 2 - timelineWidth,
  }

  const formatDisplayDate = (date: Date) => format(date, "dd MMMM yyyy")

  const ticks = useMemo(() => {
    const heightPattern = ["h-8", "h-4", "h-4", "h-4", "h-4", "h-6", "h-4", "h-4", "h-4", "h-4"]
    return Array.from({ length: totalDays + 1 }).map((_, i) => ({
      heightClass: heightPattern[i % heightPattern.length],
      position: i * tickSpacing,
    }))
  }, [totalDays, tickSpacing])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-2xl h-24 mx-auto overflow-hidden cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {/* Static Date Indicator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-white text-black px-4 py-2 rounded-full text-base font-semibold shadow-xl border-2 border-black whitespace-nowrap">
          {formatDisplayDate(selectedDate)}
        </div>
      </div>

      {/* Static Center Pointer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-black z-10 pointer-events-none" />

      {/* Draggable Timeline */}
      <motion.div
        className="absolute top-0 left-0 h-full"
        style={{ x }}
        drag="x"
        dragConstraints={dragConstraints}
        onDragEnd={handleDragEnd}
        onClick={handleTimelineClick}
      >
        <div className="relative h-full flex items-end" style={{ width: `${timelineWidth}px` }}>
          {ticks.map((tick, i) => (
            <div
              key={i}
              className={cn("absolute bottom-0 w-0.5 bg-black", tick.heightClass)}
              style={{ left: `${tick.position}px` }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
} 