// components\modal-portfolio-list.tsx
"use client"

import { MotionConfig, motion } from "framer-motion"
import { useState } from "react"
import { FaYoutube } from "react-icons/fa"
import { FiBookOpen } from "react-icons/fi"
import { twMerge } from "tailwind-merge"
import { SectionHeading } from "@/components/ui/section-heading"
import React from "react"
import Image from "next/image"

export const ModalPortfolioList = () => {
  const features = [
    {
      icon: "/icons/simplicity.png",
      title: "Simplicity",
      description:
        "Designed for busy professionals (salaried person, businessmen) our portfolios remove the hassle of stock analysis and simplify the investment process that fits your lifestyle.",
    },
    {
      icon: "/icons/rebalancing.png",
      title: "Rebalancing",
      description:
        "We don’t just give stock names and leave. Every quarter, we adjust based on market conditions—guiding you on exits, profit booking, upward averaging, and downward averaging.",
    },
    {
      icon: "/icons/diversification.png",
      title: "Diversification",
      description:
        "Your money won’t sit in one basket. We spread it smartly—across large, mid and small cap stocks, multiple sectors, and even assets like ETFs and gold—balancing risk and maximizing opportunity.",
    },
    {
      icon: "/icons/goalBasedInvesting.png",
      title: "Goal-Based Investing",
      description: "You choose the Goal, and the model portfolio provides an investment path that you can follow.",
    },
  ]
  const portfolioData = [
    {
      id: 1,
      name: "",
      description: "",
      reportLink: "",
      cagr: "",
      returns: "",
      minInvestment: "",
    },
  ]

  return (
    <>
      <div className="py-8 bg-[#fffff]">
        <div className="mb-12 lg:mb-24 relative z-10 container mx-auto">
          <SectionHeading
            title="Model Portfolios"
            subtitle="Smart investment strategies for every investor"
            className="mb-8"
          />
          <p className="text-center mx-auto text-lg mb-8">
            Model portfolios offer a simpler way to invest in a market that's filled with options and increasingly
            complex. You can consider a model portfolio as cost-efficient, diversified investment framework and a
            roadmap, where you choose the destination, and the model portfolio provides an investment path that you can
            follow.
          </p>
        </div>
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-md shadow-md pt-10 pb-6 px-4 relative border-t-4 border-[#2a2e86]"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full border shadow-md">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-[#2a2e86] font-bold text-lg text-center mt-4">{feature.title}</h3>
                    <p className="text-sm text-gray-700 text-center mt-2">{feature.description}</p>
                  </div>
                  <div className="flex justify-center mt-6">
                    <button className="bg-[#2a2e86] text-[#FFFFF0] font-semibold text-sm px-6 py-2 rounded-full hover:bg-[#1f236b] transition">
                      Know More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-[#fffff] px-8 py-24">
        <div className="mx-auto grid container grid-cols-1 gap-6 sm:grid-cols-2">
          <Card
            title="SIP Portfolio"
            subtitle="Designed for busy professionals, our SIP portfolio offers a systematic approach to wealth building with carefully selected stocks for consistent growth." className={undefined}          />
          <Card
            title="Growth Portfolio"
            subtitle="Focused on high-growth opportunities across emerging sectors, this portfolio aims to deliver above-market returns with calculated risk exposure."
            className="bg-indigo-300"
          />
          <Card
            title="Dividend Portfolio"
            subtitle="Built for income-focused investors, this portfolio includes stable companies with strong dividend histories and sustainable payout ratios."
            className="bg-red-300"
          />
          <Card
            title="Value Portfolio"
            subtitle="Targeting undervalued companies with strong fundamentals, this portfolio seeks long-term appreciation through disciplined value investing principles."
            className="bg-yellow-300"
          />
        </div>
      </section>
    </>
  )
}

type CardProps = {
  title: string
  subtitle: string
  className?: string
}

const Card: React.FC<CardProps> = ({ title, subtitle, className }) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const handleHoverStart = () => setIsHovered(true)
  const handleHoverEnd = () => setIsHovered(false)
  const handleHover = () => setIsHovered(!isHovered)

  return (
    <MotionConfig
      transition={{
        type: "spring",
        bounce: 0.5,
      }}
    >
      <motion.div
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        onTouchStart={handleHover}
        // onTouchEnd={handleHoverEnd}
        animate={isHovered ? "hovered" : ""}
        className={twMerge("group w-full border-2 border-black bg-emerald-300", className)}
      >
        <motion.div
          initial={{ x: 0, y: 0 }}
          variants={{
            hovered: { x: -8, y: -8 },
          }}
          className={twMerge("-m-0.5 border-2 border-black bg-emerald-300", className)}
        >
          <motion.div
            initial={{ x: 0, y: 0 }}
            variants={{
              hovered: { x: -8, y: -8 },
            }}
            className={twMerge(
              "relative -m-0.5 flex flex-col justify-between overflow-hidden border-2 border-black bg-emerald-300 p-8",
              className,
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  ₹333 <span className="text-base font-normal">/ mo</span>
                </p>
                <p className="text-xs text-gray-600">Annual, Billed Quarterly</p>
              </div>
            </div>
            {/* Description */}
            <p className="mt-4 text-sm text-gray-700">{subtitle}</p>

            {/* Stats Section */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-sm">
              <div className="mt-4 flex flex-col items-center gap-2">
                <span className="text-blue-700 font-semibold text-sm">Methodology</span>
                <div className="flex gap-4">
                  <FiBookOpen className="text-black" size={25} />
                  <FaYoutube className="text-black" size={25} />
                </div>
              </div>
              <div className="rounded bg-white px-2 py-1">
                <p className="text-gray-500">CAGR</p>
                <p className="font-semibold text-green-600">20.48%</p>
              </div>
              <div className="rounded bg-white px-2 py-1">
                <p className="text-gray-500">2Y Returns</p>
                <p className="font-semibold text-green-600">18.20%</p>
              </div>
              <div className="rounded bg-white px-2 py-1">
                <p className="text-gray-500">Min. Investment</p>
                <p className="font-semibold">25000/-</p>
              </div>
            </div>

            {/* Buy Button */}
            <div className="group relative mt-6">
              <button className="w-full border-2 border-black bg-white px-4 py-2 text-center font-medium text-black transition-all duration-300 ease-in-out">
                <span className={`mr-1 transition-opacity duration-300 ease-in-out ${isHovered ? "inline" : "hidden"}`}>
                  Let&apos;s Go
                </span>{" "}
                Buy Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </MotionConfig>
  )
}
