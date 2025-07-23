"use client"

import { ImageTrailHero } from "./image-trail-hero"
import { FiArrowDownCircle } from "react-icons/fi"
import { motion } from "framer-motion"

export default function CustomHero() {
  return (
    <div className="pt-20">
      <ImageTrailHero />

      <div className="absolute bottom-8 left-0 right-0 z-[999999] pointer-events-none">
        <div className="mx-auto flex max-w-7xl items-end justify-between p-4 md:p-8">
          <div className="pointer-events-auto">
            <h1 className="mb-6 max-w-4xl text-5xl font-black leading-[1.1] text-[#FFFFF0] md:text-7xl">
              Smart Investing with <span className="text-blue-400">RANGAONE</span>
            </h1>
            <p className="max-w-xl text-gray-200 md:text-lg">
              Expert financial guidance to help you navigate the markets and build wealth for the future. Join thousands
              of successful investors who trust RANGAONE FINWALA.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 bg-blue-500 text-[#FFFFF0] px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors"
            >
              Get Started
            </motion.button>
          </div>
          <FiArrowDownCircle className="hidden text-8xl text-[#FFFFF0]/70 md:block pointer-events-auto cursor-pointer hover:text-[#FFFFF0] transition-colors" />
        </div>
      </div>
    </div>
  )
}
