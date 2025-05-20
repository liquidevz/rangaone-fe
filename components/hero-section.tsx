"use client"

import { motion } from "framer-motion"

export default function HeroSection() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8edf2]">
      {/* Background text watermark */}
      <div className="absolute inset-0 text-[20vw] font-black text-[#d8e0e8] opacity-70 select-none flex items-center justify-center overflow-hidden">
        INGSMAR
      </div>

      {/* Floating squares */}
      <div className="absolute top-20 right-10 md:right-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-32 h-32 md:w-48 md:h-48 bg-[#051838] rounded-lg transform rotate-6"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-24 h-24 md:w-40 md:h-40 bg-[#051838] rounded-lg absolute -top-10 -left-10 transform -rotate-3"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-20 h-20 md:w-32 md:h-32 bg-[#051838] rounded-lg absolute top-20 -left-20 transform rotate-12"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-40 md:pt-60 pb-20 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[#051838] text-lg md:text-xl max-w-3xl"
        >
          At Rangaone - Your Growth, Our Priority, So we are here to help you create wealth sustainably and
          strategically.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 md:mt-10 max-w-5xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-[#1e40af]">Wealth</span> Isn't Found,
            <br />
            it is built with <span className="text-[#1e40af]">Knowledge</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 md:mt-16"
        >
          <button className="bg-[#1e40af] text-white px-8 py-3 rounded-full font-bold hover:bg-[#1e3a8a] transition-colors">
            Get Started
          </button>
        </motion.div>
      </div>
    </div>
  )
}
