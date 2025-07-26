"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function QuoteCard() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const cards = [
    {
      icon: "/icons/goalBasedInvesting.png",
      title: "Goal-Based Investing",
      description: "You choose the Goal, and the model portfolio provides an investment path that you can follow.",
    },
    {
      icon: "/icons/simplicity.png", 
      title: "Simplicity",
      description: "Designed for busy professionals (salaried person, businessmen) our portfolios remove the hassle of stock analysis and simplify the investment process that fits your lifestyle.",
    },
    {
      icon: "/icons/diversification.png",
      title: "Diversification", 
      description: "Your money won't sit in one basket. We spread it smartly—across large, mid and small cap stocks, multiple sectors, and even assets like ETFs and gold—balancing risk and maximizing opportunity.",
    },
    {
      icon: "/icons/rebalancing.png",
      title: "Rebalancing",
      description: "We don't just give stock names and leave. Every quarter, we adjust based on market conditions—guiding you on exits, profit booking, upward averaging, and downward averaging.",
    }
  ]

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 md:p-8 min-h-[300px] md:min-h-[400px]">
        {/* Blue bar at top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600 rounded-t-2xl"></div>
        
        {/* Icon positioned above the blue bar */}
        <div className="relative -mt-8 mb-6 flex justify-center">
          <div className="bg-white rounded-full p-3 shadow-lg border-2 border-blue-600">
            <img 
              src={cards[currentIndex].icon}
              alt={cards[currentIndex].title}
              className="w-8 h-8 md:w-12 md:h-12 object-contain"
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-blue-900 mb-4">
            {cards[currentIndex].title}
          </h2>
          <p className="text-sm md:text-lg text-gray-700 leading-relaxed px-4">
            {cards[currentIndex].description}
          </p>
        </div>

        {/* Navigation arrows */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
          <button
            onClick={prevCard}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex space-x-2">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextCard}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}