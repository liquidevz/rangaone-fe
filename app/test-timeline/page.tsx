"use client"

import { useState } from "react"
import DateTimelineSlider from "@/components/date-timeline-slider"

export default function TestTimelinePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const dateRange = {
    min: new Date(2025, 0, 1), // Jan 1, 2025
    max: new Date(2025, 11, 31), // Dec 31, 2025
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Date Timeline Slider Test</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Selected Date: {selectedDate.toDateString()}</h2>
          
          <DateTimelineSlider
            dateRange={dateRange}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>
    </div>
  )
}