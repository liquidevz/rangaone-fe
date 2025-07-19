// Example usage of the enhanced TipsCarousel with DateTimelineSlider integration

import React, { useState } from 'react'
import TipsCarousel from '@/components/tips-carousel'

export default function TipsCarouselExample() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <div className="space-y-8">
      {/* Basic usage without date filtering */}
      <div>
        <h2 className="text-xl font-bold mb-4">Basic Tips Carousel</h2>
        <TipsCarousel
          portfolioId="portfolio-123"
          categoryFilter="all"
          isModelPortfolio={false}
        />
      </div>

      {/* Enhanced usage with date filtering */}
      <div>
        <h2 className="text-xl font-bold mb-4">Tips Carousel with Date Filter</h2>
        <TipsCarousel
          portfolioId="portfolio-123"
          categoryFilter="all"
          isModelPortfolio={false}
          enableDateFilter={true}
          selectedDate={selectedDate}
          onDateChange={(date) => {
            setSelectedDate(date)
            console.log('Date changed to:', date)
          }}
        />
      </div>

      {/* Model portfolio with date filtering */}
      <div>
        <h2 className="text-xl font-bold mb-4">Model Portfolio with Date Filter</h2>
        <TipsCarousel
          portfolioId="model-portfolio-456"
          categoryFilter="premium"
          isModelPortfolio={true}
          enableDateFilter={true}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          sliderSize="large"
        />
      </div>
    </div>
  )
}

// Props explanation:
/*
New Props Added:
- enableDateFilter?: boolean - Enables the DateTimelineSlider instead of static date display
- selectedDate?: Date - Controls the selected date (controlled component)
- onDateChange?: (date: Date) => void - Callback when date changes

Usage Patterns:
1. Basic usage: Just pass existing props, works exactly as before
2. Date filtering: Set enableDateFilter=true and handle date changes
3. Controlled date: Pass selectedDate and onDateChange for external date control

Features:
- Automatic date range calculation from available tips
- Real-time filtering of tips based on selected date
- Smooth integration with existing carousel functionality
- Maintains all existing props and functionality
- Responsive design for all screen sizes
*/